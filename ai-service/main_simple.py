from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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


class ContextAnalyzeRequest(BaseModel):
    """Dữ liệu thật từ Google Sheets + Drive (automation ONE ghi sheet)."""

    sheet_values: List[List[Any]] = []
    drive_files: List[Dict[str, Any]] = []
    metrics: Dict[str, Any] = {}
    data_source_note: str = ""
    max_rows_for_stats: int = Field(default=500, ge=1, le=5000)


def _sheet_grid_to_rows(sheet_values: List[List[Any]], max_rows: int) -> List[Dict[str, Any]]:
    if not sheet_values or len(sheet_values) < 2:
        return []
    headers: List[str] = []
    for i, h in enumerate(sheet_values[0]):
        hs = str(h).strip() if h is not None else ""
        headers.append(hs or f"col_{i}")
    out: List[Dict[str, Any]] = []
    for row in sheet_values[1 : 1 + max_rows]:
        d: Dict[str, Any] = {}
        for i, h in enumerate(headers):
            d[h] = row[i] if i < len(row) else None
        out.append(d)
    return out


def _coerce_float(val: Any) -> Optional[float]:
    if isinstance(val, (int, float)) and not isinstance(val, bool):
        return float(val)
    if isinstance(val, str):
        try:
            return float(val.replace(",", "").strip())
        except ValueError:
            return None
    return None


def _build_context_analysis(req: ContextAnalyzeRequest) -> Dict[str, Any]:
    rows = _sheet_grid_to_rows(req.sheet_values, req.max_rows_for_stats)
    n_rows = len(rows)
    n_drive = len(req.drive_files)
    summary: Dict[str, Any] = {
        "sheet_row_count": n_rows,
        "drive_file_count": n_drive,
        "numeric_columns": {},
        "data_source_note": req.data_source_note or None,
        "redux_metrics": req.metrics or {},
    }

    numeric_cols: Dict[str, Dict[str, float]] = {}
    if rows:
        for col in rows[0].keys():
            nums: List[float] = []
            for r in rows:
                f = _coerce_float(r.get(col))
                if f is not None:
                    nums.append(f)
            if len(nums) >= 2:
                numeric_cols[col] = {
                    "min": min(nums),
                    "max": max(nums),
                    "avg": sum(nums) / len(nums),
                    "count": float(len(nums)),
                }
    summary["numeric_columns"] = numeric_cols

    insights: List[Dict[str, Any]] = []
    recs: List[str] = []
    ts = int(datetime.now().timestamp() * 1000)

    if n_rows == 0:
        insights.append(
            {
                "id": ts,
                "type": "data",
                "title": "Chưa có dữ liệu sheet trong ngữ cảnh",
                "description": "Automation có thể chưa ghi sheet hoặc range đọc sai. Kiểm tra tab/range và quyền service account.",
                "confidence": 0.55,
                "impact": "high",
                "action": "Đặt REACT_APP_AI_CONTEXT_RANGE đúng tab (vd. Orders!A1:Z500).",
            }
        )
        recs.append("Xác nhận ONE automation đang append đúng spreadsheet.")
    else:
        insights.append(
            {
                "id": ts + 1,
                "type": "volume",
                "title": f"{n_rows} dòng dữ liệu từ Sheets",
                "description": req.data_source_note
                or "Nguồn: Google Sheets (thường do automation đồng bộ).",
                "confidence": 0.82,
                "impact": "medium",
                "action": "So khớp với dashboard vận hành (SLA, đơn).",
            }
        )
        if numeric_cols:
            top = sorted(
                numeric_cols.items(),
                key=lambda x: x[1].get("count", 0),
                reverse=True,
            )[:3]
            parts = [f"{k}: trung bình {v['avg']:.2f} (n={int(v['count'])})" for k, v in top]
            insights.append(
                {
                    "id": ts + 2,
                    "type": "metrics",
                    "title": "Chỉ số số học từ các cột",
                    "description": "; ".join(parts),
                    "confidence": 0.78,
                    "impact": "high",
                    "action": "Gắn tên cột chuẩn (số lượng, doanh thu, SLA phút) để AI/ML sau này học tốt hơn.",
                }
            )
            recs.append("Chuẩn hoá header tiếng Việt/Anh thống nhất trên sheet nguồn.")
        else:
            recs.append("Thêm cột số (số đơn, phí ship, thời gian) để phân tích sâu hơn.")

    if n_drive > 0:
        mime_counts: Dict[str, int] = {}
        for f in req.drive_files:
            mt = (f.get("mimeType") or "unknown") if isinstance(f, dict) else "unknown"
            mime_counts[mt] = mime_counts.get(mt, 0) + 1
        insights.append(
            {
                "id": ts + 3,
                "type": "drive",
                "title": f"{n_drive} file Drive trong ngữ cảnh",
                "description": f"Phân loại MIME (top): {', '.join(f'{k}:{v}' for k, v in list(mime_counts.items())[:5])}",
                "confidence": 0.72,
                "impact": "low",
                "action": "Liên kết file báo cáo/export với đơn trên sheet nếu cần trace.",
            }
        )

    extra_report: Optional[Dict[str, Any]] = None
    if MIA_MODELS_AVAILABLE and report_generator and rows:
        try:
            extra_report = report_generator.generate_summary_report(
                rows[: min(200, len(rows))], "Automation / Sheets"
            )
        except Exception as ex:  # noqa: BLE001
            logger.warning("report_generator failed: %s", ex)

    if extra_report and extra_report.get("sections"):
        insights.append(
            {
                "id": ts + 4,
                "type": "report",
                "title": "Tóm tắt mia_models",
                "description": f"{len(extra_report.get('sections', []))} section trong báo cáo tự động.",
                "confidence": 0.8,
                "impact": "medium",
                "action": "Xem chi tiết trong response.summary / report.",
            }
        )

    return {
        "insights": insights,
        "recommendations": [{"title": t, "category": "ops"} for t in recs],
        "summary": summary,
        "report": extra_report,
        "timestamp": datetime.now().isoformat(),
    }


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
    """Metadata + liên kết tài liệu cho dev/ops."""
    return {
        "service": "React OAS AI Service",
        "version": "3.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "docs": {
            "swagger_ui": "/docs",
            "openapi_json": "/openapi.json",
            "guide_md": "Document/AI_SERVICE_GUIDE.md (trong repo)",
        },
        "quick_paths": [
            "/health",
            "/api/status",
            "/api/ml/insights",
            "POST /api/analyze",
            "POST /api/ml/predict",
            "POST /api/ml/context/analyze",
        ],
        "mia_models_loaded": MIA_MODELS_AVAILABLE,
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


@app.post("/api/ml/context/analyze")
async def ml_context_analyze(request: ContextAnalyzeRequest):
    """
    Phân tích chỉ số + đề xuất dựa trên grid Sheets và metadata Drive.
    Frontend gom dữ liệu (đọc qua backend 3001) rồi POST sang đây.
    """
    try:
        return _build_context_analysis(request)
    except Exception as e:  # noqa: BLE001
        logger.exception("context analyze failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


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


# ---------------------------------------------------------------------------
# Auth endpoint — API key → simple bearer token (dev/prod opt-in)
# ---------------------------------------------------------------------------

import os as _os

_VALID_API_KEY = _os.getenv("AI_API_KEY", "mia-dev-api-key-2026")


class TokenRequest(BaseModel):
    api_key: str


@app.post("/auth/token")
async def get_auth_token(request: TokenRequest):
    if request.api_key != _VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return {
        "access_token": "mia-dev-bearer-2026",
        "token_type": "bearer",
        "expires_in": 3600,
    }


# ---------------------------------------------------------------------------
# /ai/* — routes matched by src/services/aiService.js
# ---------------------------------------------------------------------------


class AIDataRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str = "value"
    date_column: Optional[str] = None


class AIPredictionsRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str = "value"
    horizon: int = 5


class AIChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class AISummaryRequest(BaseModel):
    data: List[Dict[str, Any]]
    max_length: int = 400


class AIReportRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str = "value"
    title: str = "Report"


@app.post("/ai/analyze/trends")
async def ai_analyze_trends(request: AIDataRequest):
    _require_mia_models()
    result = pattern_recognizer.recognize_trends(request.data, request.value_column)
    return {"trend_analysis": result}


@app.post("/ai/analyze/anomalies")
async def ai_analyze_anomalies(request: AIDataRequest):
    _require_mia_models()
    anomalies = pattern_recognizer.detect_anomalies(request.data, request.value_column)
    if any(a.get("z_score", 0) > 3 for a in anomalies):
        risk = "critical"
    elif any(a.get("severity") == "high" for a in anomalies):
        risk = "high"
    elif any(a.get("severity") == "medium" for a in anomalies):
        risk = "medium"
    else:
        risk = "low"
    return {"anomalies": anomalies, "risk_level": risk}


@app.post("/ai/predictions")
async def ai_predictions_v2(request: AIPredictionsRequest):
    _require_mia_models()
    trend = pattern_recognizer.recognize_trends(request.data, request.value_column)
    slope = trend.get("slope", 0.0)
    last_value = 0.0
    if request.data:
        try:
            last_value = float(request.data[-1].get(request.value_column, 0) or 0)
        except (TypeError, ValueError):
            last_value = 0.0
    preds = [max(0.0, round(last_value + slope * (i + 1), 4)) for i in range(request.horizon)]
    return {
        "predictions": {request.value_column: preds},
        "trend": trend.get("trend", "unknown"),
        "confidence": round(float(trend.get("confidence", 0.5)), 4),
    }


@app.post("/ai/chat")
async def ai_chat(request: AIChatRequest):
    _require_mia_models()
    return nlp_processor.process_chat_query(request.query, request.context or {})


@app.post("/ai/summary")
async def ai_summary(request: AISummaryRequest):
    _require_mia_models()
    text = nlp_processor.generate_summary(request.data, request.max_length)
    return {"summary": text, "rows": len(request.data)}


@app.post("/ai/reports/summary")
async def ai_reports_summary(request: AIReportRequest):
    _require_mia_models()
    report = report_generator.generate_summary_report(request.data, request.title)
    recs: List[str] = []
    for section in report.get("sections", []):
        content = section.get("content", {})
        if isinstance(content, dict):
            for k, v in content.items():
                if isinstance(v, dict) and "avg" in v:
                    recs.append(f"{k}: trung bình {v['avg']:.2f}")
    if not recs:
        recs = [f"Phân tích {len(request.data)} điểm dữ liệu hoàn thành."]
    return {"recommendations": recs, "insights": [], "report": report}


@app.post("/ai/reports/comprehensive")
async def ai_reports_comprehensive(request: AIReportRequest):
    _require_mia_models()
    report = report_generator.generate_summary_report(request.data, request.title)
    trend = pattern_recognizer.recognize_trends(request.data, request.value_column)
    anomalies = pattern_recognizer.detect_anomalies(request.data, request.value_column)
    recs = [
        f"Xu hướng: {trend.get('trend', 'không rõ')} (confidence {trend.get('confidence', 0):.0%})",
        f"Phát hiện {len(anomalies)} bất thường trong dữ liệu.",
    ]
    return {
        "recommendations": recs,
        "trend": trend,
        "anomaly_count": len(anomalies),
        "report": report,
    }


@app.post("/ai/analyze/full")
async def ai_analyze_full(request: AIDataRequest):
    _require_mia_models()
    return pattern_recognizer.analyze_patterns(
        request.data, request.value_column, request.date_column
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
