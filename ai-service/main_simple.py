from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, List, Optional
import uvicorn
import asyncio
import random
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MIA_MODELS_AVAILABLE = False
nlp_processor = None
pattern_recognizer = None
predictive_alerts = None
smart_categorizer = None
report_generator = None
try:
    from mia_models import (
        nlp_processor as _nlp,
        pattern_recognizer as _pat,
        predictive_alerts as _alerts,
        smart_categorizer as _cat,
        report_generator as _rep,
    )

    nlp_processor = _nlp
    pattern_recognizer = _pat
    predictive_alerts = _alerts
    smart_categorizer = _cat
    report_generator = _rep
    MIA_MODELS_AVAILABLE = True
except Exception as exc:
    logger.warning("mia_models not loaded: %s", exc)

app = FastAPI(
    title="React OAS AI Service",
    description="AI/ML Service for React OAS Integration v3.0",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for ML endpoints (used by integration tests)
class PredictRequest(BaseModel):
    timeframe: str = "1h"
    metrics: list = ["response_time", "active_users"]


class OptimizeRequest(BaseModel):
    timestamp: str = ""
    active_users: float = 0
    response_time: float = 0
    error_rate: float = 0
    cpu_usage: float = 0
    memory_usage: float = 0
    disk_usage: float = 0
    network_io: float = 0


class AnalysisRequest(BaseModel):
    data: dict
    type: str = "general"

class AnalysisResponse(BaseModel):
    id: int
    prediction: float
    confidence: float
    timestamp: str
    analysis_type: str
    recommendations: list


# --- Requests for mia_models (legacy analytics modules) ---
class NLPQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class NLPSummaryRequest(BaseModel):
    data: List[Dict[str, Any]]
    max_length: int = 200


class NLPSearchRequest(BaseModel):
    query: str
    data: List[Dict[str, Any]]
    columns: Optional[List[str]] = None


class DataColumnRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None


class AlertsAnalyzeRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    metric_name: Optional[str] = None
    threshold: Optional[float] = None


class ReportSummaryRequest(BaseModel):
    data: List[Dict[str, Any]]
    title: str = "Data Summary"


class ReportTrendRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None
    title: str = "Trend Analysis"


class ReportComprehensiveRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None
    title: str = "Comprehensive Report"


class CategorizeColumnRequest(BaseModel):
    column_name: str
    sample_values: Optional[List[Any]] = None


def _require_mia_models():
    if not MIA_MODELS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="mia_models package unavailable (check ai-service logs)",
        )


@app.get("/")
async def root():
    return {
        "service": "React OAS AI Service",
        "version": "3.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "message": "AI Service is running",
        "timestamp": datetime.now().isoformat(),
        "uptime": "active",
        "mia_models": MIA_MODELS_AVAILABLE,
    }

@app.get("/api/status")
async def api_status():
    return {
        "service": "AI/ML Service",
        "version": "3.0",
        "status": "operational",
        "features": [
            "Predictive Analytics",
            "Real-time Analysis",
            "Data Processing",
            "ML Models",
            *(
                [
                    "NLP parse/summary/search",
                    "Pattern trends/anomalies",
                    "Predictive alerts",
                    "Reports & categorization",
                ]
                if MIA_MODELS_AVAILABLE
                else []
            ),
        ],
        "mia_models": MIA_MODELS_AVAILABLE,
    }


@app.get("/api/predictions")
async def ai_predictions():
    """AI Predictions endpoint — test:api"""
    await asyncio.sleep(0.1)
    return {
        "success": True,
        "data": {
            "predictions": [
                {"metric": "response_time", "value": round(random.uniform(80, 150), 2), "unit": "ms"},
                {"metric": "active_users", "value": round(random.uniform(50, 200), 1), "unit": "count"},
            ],
            "timestamp": datetime.now().isoformat(),
        },
    }


@app.get("/api/analytics")
async def ai_analytics():
    """AI Analytics endpoint — test:api"""
    await asyncio.sleep(0.1)
    return {
        "success": True,
        "data": {
            "confidence_score": round(random.uniform(0.75, 0.95), 2),
            "insights": {
                "performance_trends": {"overall_trend": "stable"},
                "recommendations": ["Monitor response times", "Review capacity"],
            },
            "timestamp": datetime.now().isoformat(),
        },
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_data(request: AnalysisRequest):
    try:
        logger.info(f"Analysis request received: {request.type}")

        # Simulate AI processing delay
        await asyncio.sleep(0.5)

        # Generate mock AI analysis
        prediction = random.uniform(0, 100)
        confidence = random.uniform(0.7, 0.99)

        analysis_id = int(datetime.now().timestamp() * 1000)

        recommendations = [
            "Optimize data collection",
            "Improve data quality",
            "Consider additional features",
            "Monitor trends closely"
        ]

        result = AnalysisResponse(
            id=analysis_id,
            prediction=prediction,
            confidence=confidence,
            timestamp=datetime.now().isoformat(),
            analysis_type=request.type,
            recommendations=recommendations
        )

        logger.info(f"Analysis completed: {result.id}")
        return result

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/predict/{model_type}")
async def predict(model_type: str):
    try:
        logger.info(f"Prediction request for model: {model_type}")

        # Simulate prediction
        await asyncio.sleep(0.3)

        prediction_data = {
            "model_type": model_type,
            "prediction": random.uniform(0, 100),
            "confidence": random.uniform(0.8, 0.95),
            "timestamp": datetime.now().isoformat(),
            "features_used": ["feature_1", "feature_2", "feature_3"],
            "model_version": "v4.0"
        }

        return prediction_data

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/ml/insights")
async def ml_insights():
    """ML Insights endpoint - used by integration tests."""
    await asyncio.sleep(0.2)
    return {
        "confidence_score": round(random.uniform(0.75, 0.95), 2),
        "insights": {
            "performance_trends": {"overall_trend": "stable"},
            "recommendations": ["Monitor response times", "Review capacity"],
        },
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/ml/predict")
async def ml_predict(request: PredictRequest):
    """ML Prediction endpoint - used by integration tests."""
    await asyncio.sleep(0.2)
    preds = {m: round(random.uniform(80, 120), 2) for m in request.metrics}
    return {
        "predictions": preds,
        "timeframe": request.timeframe,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/ml/optimize")
async def ml_optimize(request: OptimizeRequest):
    """ML Optimization endpoint - used by integration tests."""
    await asyncio.sleep(0.2)
    return {
        "current_performance_score": round(random.uniform(75, 95), 1),
        "recommendations": ["Enable caching", "Optimize queries"],
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/models")
async def list_models():
    base = [
        {
            "name": "prediction_model_v4",
            "type": "regression",
            "accuracy": 0.92,
            "status": "active",
        },
        {
            "name": "classification_model_v4",
            "type": "classification",
            "accuracy": 0.88,
            "status": "active",
        },
        {
            "name": "anomaly_detection_v4",
            "type": "anomaly",
            "accuracy": 0.95,
            "status": "active",
        },
    ]
    legacy = []
    if MIA_MODELS_AVAILABLE:
        legacy = [
            {"name": "mia_nlp_processor", "type": "nlp_rules", "status": "active"},
            {"name": "mia_pattern_recognizer", "type": "numpy_stats", "status": "active"},
            {"name": "mia_predictive_alerts", "type": "alerts", "status": "active"},
            {"name": "mia_smart_categorizer", "type": "categorization", "status": "active"},
            {"name": "mia_report_generator", "type": "reports", "status": "active"},
        ]
    all_models = base + legacy
    return {
        "available_models": all_models,
        "total_models": len(all_models),
        "last_updated": datetime.now().isoformat(),
    }


# ---------------------------------------------------------------------------
# mia_models API (legacy analytics)
# ---------------------------------------------------------------------------


@app.get("/api/ml/legacy/status")
async def mia_legacy_status():
    """Trạng thái các module analytics legacy."""
    return {
        "mia_models_available": MIA_MODELS_AVAILABLE,
        "modules": [
            "nlp_processor",
            "pattern_recognizer",
            "predictive_alerts",
            "smart_categorizer",
            "report_generator",
        ]
        if MIA_MODELS_AVAILABLE
        else [],
        "note": "retail_predictor / your_domain_predictor cần pandas+scikit-learn (xem mia_models/README.md)",
    }


@app.post("/api/ml/legacy/nlp/parse")
async def mia_nlp_parse(request: NLPQueryRequest):
    _require_mia_models()
    return nlp_processor.process_chat_query(request.query, request.context or {})


@app.post("/api/ml/legacy/nlp/summary")
async def mia_nlp_summary(request: NLPSummaryRequest):
    _require_mia_models()
    text = nlp_processor.generate_summary(request.data, request.max_length)
    return {"summary": text, "rows": len(request.data)}


@app.post("/api/ml/legacy/nlp/search")
async def mia_nlp_search(request: NLPSearchRequest):
    _require_mia_models()
    results = nlp_processor.smart_search(request.query, request.data, request.columns)
    return {"count": len(results), "results": results}


@app.post("/api/ml/legacy/patterns/analyze")
async def mia_patterns_analyze(request: DataColumnRequest):
    _require_mia_models()
    return pattern_recognizer.analyze_patterns(
        request.data, request.value_column, request.date_column
    )


@app.post("/api/ml/legacy/patterns/trends")
async def mia_patterns_trends(request: DataColumnRequest):
    _require_mia_models()
    return pattern_recognizer.recognize_trends(request.data, request.value_column)


@app.post("/api/ml/legacy/patterns/anomalies")
async def mia_patterns_anomalies(request: DataColumnRequest):
    _require_mia_models()
    return {
        "anomalies": pattern_recognizer.detect_anomalies(
            request.data, request.value_column
        )
    }


@app.post("/api/ml/legacy/alerts/analyze")
async def mia_alerts_analyze(request: AlertsAnalyzeRequest):
    _require_mia_models()
    alerts = predictive_alerts.analyze_and_alert(
        request.data,
        request.value_column,
        request.metric_name,
        request.threshold,
    )
    return {"alerts": alerts, "count": len(alerts)}


@app.post("/api/ml/legacy/report/summary")
async def mia_report_summary(request: ReportSummaryRequest):
    _require_mia_models()
    return report_generator.generate_summary_report(request.data, request.title)


@app.post("/api/ml/legacy/report/trend")
async def mia_report_trend(request: ReportTrendRequest):
    _require_mia_models()
    return report_generator.generate_trend_report(
        request.data,
        request.value_column,
        request.date_column,
        request.title,
    )


@app.post("/api/ml/legacy/report/comprehensive")
async def mia_report_comprehensive(request: ReportComprehensiveRequest):
    _require_mia_models()
    return report_generator.generate_comprehensive_report(
        request.data,
        request.value_column,
        request.date_column,
        request.title,
    )


@app.post("/api/ml/legacy/categorize/column")
async def mia_categorize_column(request: CategorizeColumnRequest):
    _require_mia_models()
    return smart_categorizer.categorize_column(
        request.column_name, request.sample_values or []
    )


if __name__ == "__main__":
    import os
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    logger.info("Starting React OAS AI Service v4.0...")
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
