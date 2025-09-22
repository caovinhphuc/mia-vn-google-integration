import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../Common/Loading";
import "./AIDashboard.css";

const AIDashboard = () => {
  // const dispatch = useDispatch();
  const { sheets } = useSelector((state) => state.sheets);
  const { files } = useSelector((state) => state.drive);
  const { alerts } = useSelector((state) => state.alerts);

  const [aiInsights, setAiInsights] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  // Simulate AI analysis
  const analyzeData = async () => {
    setIsAnalyzing(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate AI insights
    const insights = [
      {
        id: 1,
        type: "trend",
        title: "📈 Xu hướng tăng trưởng",
        description: "Dữ liệu Google Sheets tăng 23% trong 7 ngày qua",
        confidence: 0.87,
        impact: "high",
        action: "Tăng cường backup và monitoring",
      },
      {
        id: 2,
        type: "anomaly",
        title: "⚠️ Phát hiện bất thường",
        description: "Hoạt động upload Drive tăng đột biến 150% vào 14:30",
        confidence: 0.92,
        impact: "medium",
        action: "Kiểm tra và xác minh hoạt động",
      },
      {
        id: 3,
        type: "optimization",
        title: "⚡ Tối ưu hóa hiệu suất",
        description:
          "Có thể giảm 30% thời gian sync bằng cách batch operations",
        confidence: 0.78,
        impact: "high",
        action: "Triển khai batch processing",
      },
    ];

    const predictions = {
      nextWeek: {
        sheets: Math.round(sheets.length * 1.15),
        files: Math.round(files.length * 1.08),
        alerts: Math.max(0, Math.round(alerts.length * 0.9)),
      },
      nextMonth: {
        sheets: Math.round(sheets.length * 1.4),
        files: Math.round(files.length * 1.25),
        alerts: Math.max(0, Math.round(alerts.length * 0.8)),
      },
    };

    const recommendations = [
      {
        id: 1,
        category: "performance",
        title: "Tối ưu hóa Google Sheets API",
        description: "Sử dụng batch requests để giảm 40% thời gian xử lý",
        priority: "high",
        effort: "medium",
        impact: "high",
      },
      {
        id: 2,
        category: "security",
        title: "Cập nhật bảo mật",
        description: "Thêm 2FA cho tất cả service accounts",
        priority: "high",
        effort: "low",
        impact: "high",
      },
      {
        id: 3,
        category: "automation",
        title: "Tự động hóa backup",
        description: "Thiết lập backup tự động hàng ngày lúc 2:00 AM",
        priority: "medium",
        effort: "low",
        impact: "medium",
      },
    ];

    setAiInsights(insights);
    setPredictions(predictions);
    setRecommendations(recommendations);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    analyzeData();
  }, [sheets.length, files.length, alerts.length, analyzeData]);

  const getInsightIcon = (type) => {
    switch (type) {
      case "trend":
        return "📈";
      case "anomaly":
        return "⚠️";
      case "optimization":
        return "⚡";
      case "security":
        return "🔒";
      default:
        return "🤖";
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="ai-dashboard">
      <div className="ai-header">
        <h2>🤖 AI Dashboard</h2>
        <div className="ai-controls">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="1d">1 ngày</option>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
          <button
            className="analyze-btn"
            onClick={analyzeData}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "🔄 Đang phân tích..." : "🔍 Phân tích lại"}
          </button>
        </div>
      </div>

      {isAnalyzing && <Loading text="AI đang phân tích dữ liệu..." />}

      <div className="ai-grid">
        {/* AI Insights */}
        <div className="insights-section">
          <h3>💡 AI Insights</h3>
          <div className="insights-list">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="insight-card">
                <div className="insight-header">
                  <span className="insight-icon">
                    {getInsightIcon(insight.type)}
                  </span>
                  <span className="insight-title">{insight.title}</span>
                  <span
                    className="confidence-badge"
                    style={{ backgroundColor: getImpactColor(insight.impact) }}
                  >
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
                <p className="insight-description">{insight.description}</p>
                <div className="insight-action">
                  <strong>Hành động:</strong> {insight.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="predictions-section">
          <h3>🔮 Dự đoán</h3>
          <div className="predictions-grid">
            <div className="prediction-card">
              <h4>📅 Tuần tới</h4>
              <div className="prediction-stats">
                <div className="stat">
                  <span className="label">Sheets:</span>
                  <span className="value">
                    {predictions.nextWeek?.sheets || 0}
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Files:</span>
                  <span className="value">
                    {predictions.nextWeek?.files || 0}
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Alerts:</span>
                  <span className="value">
                    {predictions.nextWeek?.alerts || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="prediction-card">
              <h4>📆 Tháng tới</h4>
              <div className="prediction-stats">
                <div className="stat">
                  <span className="label">Sheets:</span>
                  <span className="value">
                    {predictions.nextMonth?.sheets || 0}
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Files:</span>
                  <span className="value">
                    {predictions.nextMonth?.files || 0}
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Alerts:</span>
                  <span className="value">
                    {predictions.nextMonth?.alerts || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section">
          <h3>💡 Khuyến nghị</h3>
          <div className="recommendations-list">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-card">
                <div className="rec-header">
                  <span className="rec-title">{rec.title}</span>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(rec.priority) }}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="rec-description">{rec.description}</p>
                <div className="rec-meta">
                  <span className="effort">Effort: {rec.effort}</span>
                  <span className="impact">Impact: {rec.impact}</span>
                </div>
                <button className="implement-btn">Triển khai</button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance */}
        <div className="performance-section">
          <h3>⚡ AI Performance</h3>
          <div className="performance-metrics">
            <div className="metric">
              <div className="metric-label">Accuracy</div>
              <div className="metric-value">94.2%</div>
              <div className="metric-trend">↗️ +2.1%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Response Time</div>
              <div className="metric-value">1.2s</div>
              <div className="metric-trend">↘️ -0.3s</div>
            </div>
            <div className="metric">
              <div className="metric-label">Insights Generated</div>
              <div className="metric-value">47</div>
              <div className="metric-trend">↗️ +12</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
