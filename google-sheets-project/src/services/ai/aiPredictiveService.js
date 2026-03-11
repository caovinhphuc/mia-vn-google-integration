/**
 * AI Predictive Service - Machine Learning Predictions
 * MIA.vn Google Integration Platform
 */

import { SLR } from 'ml-regression'
import * as stats from 'simple-statistics'
import { AIDataProcessor, AIStatsAnalyzer, AI_CONFIG } from '../../utils/aiUtils'

// Lazy-load heavy ML libraries to keep initial bundle light
let _tfPromise = null
const getTF = async () => {
  if (!_tfPromise) {
    _tfPromise = import('@tensorflow/tfjs')
  }
  return _tfPromise
}

let _brainPromise = null
const getBrain = async () => {
  if (!_brainPromise) {
    _brainPromise = import('brain.js').then((m) => m.default || m)
  }
  return _brainPromise
}

/**
 * Time Series Prediction Service
 */
export class TimeSeriesPredictionService {
  constructor() {
    this.models = new Map()
    this.scalers = new Map()
    this.isInitialized = false
  }

  /**
   * Initialize TensorFlow.js
   */
  async initialize() {
    try {
      const tf = await getTF()
      await tf.ready()
      console.log('✅ TensorFlow.js initialized:', tf.getBackend())
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('❌ TensorFlow.js initialization failed:', error)
      this.isInitialized = false
      return false
    }
  }

  /**
   * Create and train LSTM model for time series prediction
   */
  async createLSTMModel(inputShape) {
    const tf = await getTF()
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: inputShape,
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false,
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25 }),
        tf.layers.dense({ units: 1 }),
      ],
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    })

    return model
  }

  /**
   * Train model with historical data
   */
  async trainModel(data, modelKey = 'default') {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!Array.isArray(data) || data.length < AI_CONFIG.models.minDataPoints) {
      throw new Error('Insufficient data for training. Minimum 10 data points required.')
    }

    try {
      const tf = await getTF()
      // Normalize data
      const { normalized, scaler } = AIDataProcessor.normalizeData(data)
      this.scalers.set(modelKey, scaler)

      // Prepare training data
      const lookback = AI_CONFIG.models.predictionLookback
      const { X, y } = AIDataProcessor.prepareTimeSeriesData(normalized, lookback)

      if (X.length === 0) {
        throw new Error('Not enough data points for time series preparation')
      }

      // Convert to tensors
      const xs = tf.tensor3d(X.map((seq) => seq.map((val) => [val])))
      const ys = tf.tensor2d(y.map((val) => [val]))

      // Create and train model
      const model = await this.createLSTMModel([lookback, 1])

      const history = await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`)
            }
          },
        },
      })

      // Store model
      this.models.set(modelKey, model)

      // Cleanup tensors
      xs.dispose()
      ys.dispose()

      const finalLoss = history.history.loss[history.history.loss.length - 1]

      return {
        success: true,
        modelKey,
        finalLoss,
        epochs: history.history.loss.length,
        accuracy: 1 - finalLoss, // Simple accuracy approximation
      }
    } catch (error) {
      console.error('Model training failed:', error)
      throw error
    }
  }

  /**
   * Make predictions using trained model
   */
  async predict(recentData, steps = 7, modelKey = 'default') {
    if (!this.models.has(modelKey)) {
      throw new Error(`Model ${modelKey} not found. Please train the model first.`)
    }

    try {
      const tf = await getTF()
      const model = this.models.get(modelKey)
      const scaler = this.scalers.get(modelKey)

      if (!scaler) {
        throw new Error(`Scaler for model ${modelKey} not found.`)
      }

      // Normalize recent data
      const { normalized } = AIDataProcessor.normalizeData(recentData, scaler.method)

      const lookback = AI_CONFIG.models.predictionLookback
      if (normalized.length < lookback) {
        throw new Error(`Need at least ${lookback} data points for prediction`)
      }

      const predictions = []
      let currentSequence = normalized.slice(-lookback)

      // Predict multiple steps ahead
      for (let i = 0; i < steps; i++) {
        const input = tf.tensor3d([currentSequence.map((val) => [val])])
        const prediction = model.predict(input)
        const predValue = await prediction.data()

        predictions.push(predValue[0])

        // Update sequence for next prediction
        currentSequence = [...currentSequence.slice(1), predValue[0]]

        // Cleanup tensors
        input.dispose()
        prediction.dispose()
      }

      // Denormalize predictions
      const denormalizedPredictions = AIDataProcessor.denormalizeData(predictions, scaler)

      return {
        predictions: denormalizedPredictions,
        confidence: this.calculatePredictionConfidence(recentData, denormalizedPredictions),
        metadata: {
          modelKey,
          steps,
          baseValue: recentData[recentData.length - 1],
          trend: this.analyzePredictionTrend(denormalizedPredictions),
        },
      }
    } catch (error) {
      console.error('Prediction failed:', error)
      throw error
    }
  }

  /**
   * Calculate prediction confidence based on historical accuracy
   */
  calculatePredictionConfidence(historical, predictions) {
    if (historical.length < 5) return 0.5

    // Calculate trend consistency
    const historicalTrend = AIStatsAnalyzer.analyzeTrend(historical.slice(-10))
    const predictionTrend = this.analyzePredictionTrend(predictions)

    let confidence = 0.7 // Base confidence

    // Adjust based on trend consistency
    if (historicalTrend.trend === predictionTrend.direction) {
      confidence += 0.15
    }

    // Adjust based on data variability
    const recentVariability =
      stats.standardDeviation(historical.slice(-7)) / stats.mean(historical.slice(-7))
    if (recentVariability < 0.1) confidence += 0.1
    else if (recentVariability > 0.3) confidence -= 0.15

    return Math.max(0.3, Math.min(0.95, confidence))
  }

  /**
   * Analyze trend in predictions
   */
  analyzePredictionTrend(predictions) {
    if (predictions.length < 2) return { direction: 'unknown', strength: 0 }

    const firstHalf = predictions.slice(0, Math.floor(predictions.length / 2))
    const secondHalf = predictions.slice(Math.floor(predictions.length / 2))

    const firstAvg = stats.mean(firstHalf)
    const secondAvg = stats.mean(secondHalf)
    const change = (secondAvg - firstAvg) / firstAvg

    let direction = 'stable'
    if (Math.abs(change) > 0.05) {
      direction = change > 0 ? 'increasing' : 'decreasing'
    }

    return {
      direction,
      change: change * 100,
      strength: Math.abs(change),
    }
  }

  /**
   * Get model information
   */
  getModelInfo(modelKey = 'default') {
    if (!this.models.has(modelKey)) {
      return null
    }

    const model = this.models.get(modelKey)
    return {
      modelKey,
      layers: model.layers.length,
      trainableParams: model.countParams(),
      hasScaler: this.scalers.has(modelKey),
    }
  }

  /**
   * Cleanup resources
   */
  dispose(modelKey = null) {
    if (modelKey) {
      if (this.models.has(modelKey)) {
        this.models.get(modelKey).dispose()
        this.models.delete(modelKey)
      }
      this.scalers.delete(modelKey)
    } else {
      // Dispose all models
      for (const model of this.models.values()) {
        model.dispose()
      }
      this.models.clear()
      this.scalers.clear()
    }
  }
}

/**
 * Simple Regression Prediction Service (Fallback)
 */
export class RegressionPredictionService {
  /**
   * Simple linear prediction for quick results
   */
  static predictLinear(data, steps = 7) {
    if (!Array.isArray(data) || data.length < 3) {
      throw new Error('Insufficient data for linear prediction')
    }

    try {
      const xValues = data.map((_, index) => index)
      const regression = new SLR(xValues, data)

      const predictions = []
      const startIndex = data.length

      for (let i = 0; i < steps; i++) {
        const x = startIndex + i
        const prediction = regression.predict(x)
        predictions.push(Math.max(0, prediction)) // Ensure non-negative
      }

      const confidence = Math.min(0.9, Math.max(0.3, regression.coefficients?.r2 || 0.5))

      return {
        predictions,
        confidence,
        metadata: {
          type: 'linear_regression',
          r2: regression.coefficients?.r2 || 0,
          slope: regression.slope,
          intercept: regression.intercept,
        },
      }
    } catch (error) {
      console.error('Linear prediction failed:', error)
      throw error
    }
  }

  /**
   * Exponential smoothing prediction
   */
  static predictExponentialSmoothing(data, steps = 7, alpha = 0.3) {
    if (!Array.isArray(data) || data.length < 3) {
      throw new Error('Insufficient data for exponential smoothing')
    }

    try {
      // Simple exponential smoothing
      let smoothedValue = data[0]
      const smoothedSeries = [smoothedValue]

      for (let i = 1; i < data.length; i++) {
        smoothedValue = alpha * data[i] + (1 - alpha) * smoothedValue
        smoothedSeries.push(smoothedValue)
      }

      // Predict future values
      const predictions = []
      let lastSmoothed = smoothedValue

      for (let i = 0; i < steps; i++) {
        predictions.push(Math.max(0, lastSmoothed))
      }

      // Calculate confidence based on smoothing accuracy
      const errors = data.slice(1).map((actual, i) => Math.abs(actual - smoothedSeries[i + 1]))
      const mape = stats.mean(errors) / stats.mean(data)
      const confidence = Math.max(0.3, Math.min(0.9, 1 - mape))

      return {
        predictions,
        confidence,
        metadata: {
          type: 'exponential_smoothing',
          alpha,
          mape,
          lastSmoothed,
        },
      }
    } catch (error) {
      console.error('Exponential smoothing failed:', error)
      throw error
    }
  }
}

/**
 * Neural Network Prediction Service using Brain.js
 */
export class NeuralNetworkPredictionService {
  constructor() {
    this.networks = new Map()
  }

  /**
   * Train neural network for pattern recognition
   */
  async trainNetwork(data, networkKey = 'default', options = {}) {
    if (!Array.isArray(data) || data.length < 10) {
      throw new Error('Insufficient data for neural network training')
    }

    try {
      const brain = await getBrain()
      const net = new brain.NeuralNetwork({
        hiddenLayers: [10, 5],
        learningRate: 0.3,
        ...options,
      })

      // Prepare training data
      const trainingData = this.prepareNetworkData(data)

      console.log('🧠 Training neural network...')
      const trainingStats = net.train(trainingData, {
        iterations: 1000,
        errorThresh: 0.005,
        log: false,
        logPeriod: 100,
      })

      this.networks.set(networkKey, net)

      return {
        success: true,
        networkKey,
        iterations: trainingStats.iterations,
        error: trainingStats.error,
      }
    } catch (error) {
      console.error('Neural network training failed:', error)
      throw error
    }
  }

  /**
   * Prepare data for neural network training
   */
  prepareNetworkData(data) {
    const lookback = 5
    const trainingData = []

    // Normalize data
    const { normalized } = AIDataProcessor.normalizeData(data)

    for (let i = lookback; i < normalized.length; i++) {
      const input = normalized.slice(i - lookback, i)
      const output = [normalized[i]]

      trainingData.push({
        input: input,
        output: output,
      })
    }

    return trainingData
  }

  /**
   * Predict using trained neural network
   */
  predict(recentData, steps = 7, networkKey = 'default') {
    if (!this.networks.has(networkKey)) {
      throw new Error(`Neural network ${networkKey} not found`)
    }

    try {
      const net = this.networks.get(networkKey)
      const { normalized, scaler } = AIDataProcessor.normalizeData(recentData)

      const lookback = 5
      if (normalized.length < lookback) {
        throw new Error(`Need at least ${lookback} data points`)
      }

      const predictions = []
      let currentInput = normalized.slice(-lookback)

      for (let i = 0; i < steps; i++) {
        const output = net.run(currentInput)
        const prediction = output[0]
        predictions.push(prediction)

        // Update input for next prediction
        currentInput = [...currentInput.slice(1), prediction]
      }

      // Denormalize predictions
      const denormalizedPredictions = AIDataProcessor.denormalizeData(predictions, scaler)

      return {
        predictions: denormalizedPredictions,
        confidence: 0.75, // Default confidence for neural network
        metadata: {
          networkKey,
          type: 'neural_network',
          steps,
        },
      }
    } catch (error) {
      console.error('Neural network prediction failed:', error)
      throw error
    }
  }
}

export default {
  TimeSeriesPredictionService,
  RegressionPredictionService,
  NeuralNetworkPredictionService,
}
