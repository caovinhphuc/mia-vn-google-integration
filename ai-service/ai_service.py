from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import time
import json
import logging
import os
import numpy as np

# Try to import optimization module
try:
    from optimization import cobyqa_minimize, COBYQA_AVAILABLE
except ImportError:
    COBYQA_AVAILABLE = False
    cobyqa_minimize = None

# mia_models — all analytics capabilities
from mia_models import (
    pattern_recognizer,
    predictive_alerts,
    nlp_processor,
    smart_categorizer,
    report_generator,
)

# ─── Logging ────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_service")

# ─── SLA Config ─────────────────────────────────────────────────────────

SLA_CONFIG: Dict[str, Any] = {}
try:
    _config_path = os.path.join(
        os.path.dirname(__file__),
        "config",
        "sla_config.json")
    with open(_config_path) as _f:
        SLA_CONFIG = json.load(_f)
    logger.info("SLA config loaded: %s", list(SLA_CONFIG.keys()))
except Exception as _e:
    logger.warning("Could not load SLA config: %s", _e)

# ─── App ────────────────────────────────────────────────────────────────

app = FastAPI(title="React OAS AI Service", version="4.1")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ────────────────────────────────────────────────────


class OptimizationRequest(BaseModel):
    """Request model for optimization problems"""
    objective_type: str = "sum_squares"  # "sum_squares" | "rosenbrock" | "linear"
    initial_guess: List[float]
    bounds: Optional[List[List[float]]] = None
    constraints: Optional[List[Dict[str, Any]]] = None
    options: Optional[Dict[str, Any]] = None
    # Used when objective_type="linear"
    coefficients: Optional[List[float]] = None


class DataAnalysisRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None


class CorrelationRequest(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]


class PredictionRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    horizon: int = 5


class ChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class SearchRequest(BaseModel):
    query: str
    data: List[Dict[str, Any]]
    columns: Optional[List[str]] = None


class SummaryRequest(BaseModel):
    data: List[Dict[str, Any]]
    max_length: int = 200


class AlertRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    metric_name: Optional[str] = None
    threshold: Optional[float] = None


class ReportRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None
    title: Optional[str] = None


class CategorizationRequest(BaseModel):
    data: List[Dict[str, Any]]
    category_rules: Optional[Dict[str, Any]] = None


class SLACheckRequest(BaseModel):
    orders: List[Dict[str, Any]]
    platform: str
    current_time: Optional[str] = None  # "HH:MM", defaults to now


# ─── Health ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "4.1",
        "models": {
            "pattern_recognizer": True,
            "predictive_alerts": True,
            "nlp_processor": True,
            "smart_categorizer": True,
            "report_generator": True,
            "optimizer": COBYQA_AVAILABLE,
        },
        "sla_config_loaded": bool(SLA_CONFIG),
    }


# ─── Pattern Analysis ───────────────────────────────────────────────────

@app.post("/ai/analyze/trends")
async def analyze_trends(request: DataAnalysisRequest):
    try:
        result = pattern_recognizer.recognize_trends(
            request.data, request.value_column)
        return {"trend_analysis": result, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/anomalies")
async def analyze_anomalies(request: DataAnalysisRequest):
    try:
        anomalies = pattern_recognizer.detect_anomalies(
            request.data, request.value_column)

        if any(
            a.get("severity") == "high" and a.get(
                "z_score",
                0) > 3 for a in anomalies):
            risk_level = "critical"
        elif any(a.get("severity") == "high" for a in anomalies):
            risk_level = "high"
        elif any(a.get("severity") == "medium" for a in anomalies):
            risk_level = "medium"
        else:
            risk_level = "low"

        recommendations = []
        if anomalies:
            spikes = [a for a in anomalies if a.get("type") == "spike"]
            drops = [a for a in anomalies if a.get("type") == "drop"]
            if spikes:
                recommendations.append(
                    f"Investigate {
                        len(spikes)} spike(s) — may indicate exceptional events")
            if drops:
                recommendations.append(
                    f"Review {
                        len(drops)} drop(s) — may indicate data issues or failures")
        else:
            recommendations.append("System is running optimally")

        return {
            "anomalies": anomalies,
            "risk_level": risk_level,
            "count": len(anomalies),
            "recommendations": recommendations,
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/cycles")
async def analyze_cycles(request: DataAnalysisRequest):
    try:
        result = pattern_recognizer.detect_cycles(
            request.data, request.value_column, request.date_column)
        return {"cycle_analysis": result, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/correlations")
async def analyze_correlations(request: CorrelationRequest):
    try:
        result = pattern_recognizer.find_correlations(
            request.data, request.columns)
        return {**result, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/full")
async def analyze_full(request: DataAnalysisRequest):
    try:
        return pattern_recognizer.analyze_patterns(
            request.data, request.value_column, request.date_column)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Predictions ────────────────────────────────────────────────────────

@app.post("/ai/predictions")
async def get_predictions(request: PredictionRequest):
    """Real predictions using linear regression on input data."""
    try:
        trend = pattern_recognizer.recognize_trends(
            request.data, request.value_column)
        slope = trend.get("slope", 0)
        values = [
            float(row[request.value_column])
            for row in request.data
            if request.value_column in row
        ]

        if not values:
            raise HTTPException(
                status_code=400, detail=f"Column '{
                    request.value_column}' not found in data")

        last_value = values[-1]
        predicted = [round(last_value + slope * (i + 1), 2)
                     for i in range(request.horizon)]

        base_confidence = trend.get("confidence", 0.5)
        confidence_scores = [round(base_confidence * (0.95 ** i), 3)
                             for i in range(request.horizon)]

        return {
            "predictions": {request.value_column: predicted},
            "confidence_scores": {request.value_column: confidence_scores},
            "trend": trend.get("trend"),
            "slope": slope,
            "method": "linear_regression",
            "timestamp": time.time(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/predictions")
async def get_predictions_legacy():
    """Deprecated — use POST /ai/predictions with data body."""
    return {
        "message": "Use POST /ai/predictions with { data, value_column, horizon } for real predictions",
        "predictions": {},
        "confidence_scores": {},
    }


# ─── Anomalies (legacy GET redirects to new endpoint) ────────────────────────

@app.get("/ai/anomalies")
async def detect_anomalies_legacy():
    """Deprecated — use POST /ai/analyze/anomalies with data body."""
    return {
        "message": "Use POST /ai/analyze/anomalies with { data, value_column } for real anomaly detection",
        "anomalies": [],
        "risk_level": "unknown",
    }


# ─── NLP / Chat ─────────────────────────────────────────────────────────

@app.post("/ai/chat")
async def chat_query(request: ChatRequest):
    try:
        return nlp_processor.process_chat_query(request.query, request.context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/search")
async def smart_search(request: SearchRequest):
    try:
        results = nlp_processor.smart_search(
            request.query, request.data, request.columns)
        return {
            "results": results,
            "count": len(results),
            "query": request.query,
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/summary")
async def generate_summary(request: SummaryRequest):
    try:
        summary = nlp_processor.generate_summary(
            request.data, request.max_length)
        return {"summary": summary, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Alerts ─────────────────────────────────────────────────────────────

@app.post("/ai/alerts")
async def generate_alerts(request: AlertRequest):
    try:
        alerts = predictive_alerts.analyze_and_alert(
            request.data, request.value_column, request.metric_name, request.threshold)
        return {
            "alerts": alerts,
            "count": len(alerts),
            "has_critical": any(a.get("severity") == "high" for a in alerts),
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/alerts/threshold")
async def predict_threshold(request: AlertRequest):
    if request.threshold is None:
        raise HTTPException(status_code=400,
                            detail="'threshold' field is required")
    try:
        prediction = predictive_alerts.predict_threshold_crossing(
            request.data, request.value_column, request.threshold
        )
        return {"prediction": prediction, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Categorization ─────────────────────────────────────────────────────

@app.post("/ai/categorize")
async def categorize_data(request: CategorizationRequest):
    try:
        categorized = smart_categorizer.categorize_rows(
            request.data, request.category_rules)
        return {
            "categorized": categorized,
            "count": len(categorized),
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Reports ────────────────────────────────────────────────────────────

@app.post("/ai/reports/summary")
async def generate_summary_report(request: ReportRequest):
    try:
        return report_generator.generate_summary_report(
            request.data, request.title or "Data Summary")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/trend")
async def generate_trend_report(request: ReportRequest):
    try:
        return report_generator.generate_trend_report(
            request.data,
            request.value_column,
            request.date_column,
            request.title or "Trend Analysis")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/anomaly")
async def generate_anomaly_report(request: ReportRequest):
    try:
        return report_generator.generate_anomaly_report(
            request.data, request.value_column, request.title or "Anomaly Detection")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/comprehensive")
async def generate_comprehensive_report(request: ReportRequest):
    try:
        return report_generator.generate_comprehensive_report(
            request.data,
            request.value_column,
            request.date_column,
            request.title or "Comprehensive Report")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── SLA ────────────────────────────────────────────────────────────────

@app.get("/ai/sla/config")
async def get_sla_config():
    return {"config": SLA_CONFIG, "platforms": list(SLA_CONFIG.keys())}


@app.post("/ai/sla/check")
async def check_sla(request: SLACheckRequest):
    """Check orders against SLA deadlines for a given platform."""
    try:
        from datetime import datetime

        platform_key = request.platform.lower()
        config = SLA_CONFIG.get(platform_key) or SLA_CONFIG.get(
            "other_platforms", {})
        current_time_str = request.current_time or datetime.now().strftime("%H:%M")

        current_h, current_m = map(int, current_time_str.split(":"))
        current_minutes = current_h * 60 + current_m

        violations = []
        warnings = []

        def _to_minutes(t: str) -> int:
            h, m = map(int, t.split(":"))
            return h * 60 + m

        for order in request.orders:
            order_id = order.get("id", "unknown")
            status = str(order.get("status", "")).lower()
            inactive = status not in {
                "confirmed", "shipped", "delivered", "done"}

            if "cutoff_time" in config and inactive:
                if current_minutes > _to_minutes(config["cutoff_time"]):
                    violations.append({
                        "order_id": order_id,
                        "type": "cutoff_missed",
                        "deadline": config["cutoff_time"],
                        "message": f"Order {order_id} missed {request.platform} cutoff ({config['cutoff_time']})",
                    })

            for deadline_key in [
                "confirm_deadline",
                "handover_deadline",
                    "default_deadline"]:
                if deadline_key not in config:
                    continue
                deadline_minutes = _to_minutes(config[deadline_key])
                remaining = deadline_minutes - current_minutes
                warning_hours = SLA_CONFIG.get("warning_hours", [2, 1, 0.5])
                max_warn = max(warning_hours) * 60
                if 0 < remaining <= max_warn and inactive:
                    warnings.append({
                        "order_id": order_id,
                        "type": f"{deadline_key}_approaching",
                        "deadline": config[deadline_key],
                        "minutes_remaining": remaining,
                        "message": f"Order {order_id}: {deadline_key} in {int(remaining)} min",
                    })
                    break  # One warning per order is enough

        return {
            "platform": request.platform,
            "current_time": current_time_str,
            "violations": violations,
            "warnings": warnings,
            "total_orders": len(
                request.orders),
            "violation_count": len(violations),
            "warning_count": len(warnings),
            "status": "critical" if violations else (
                "warning" if warnings else "ok"),
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/sla/alerts")
async def get_sla_alerts(request: SLACheckRequest):
    """Get upcoming SLA deadlines within the warning window."""
    try:
        from datetime import datetime

        current_time_str = request.current_time or datetime.now().strftime("%H:%M")
        warning_hours = SLA_CONFIG.get("warning_hours", [2, 1, 0.5])
        max_warning_minutes = max(warning_hours) * 60

        platform_key = request.platform.lower()
        config = SLA_CONFIG.get(platform_key) or SLA_CONFIG.get(
            "other_platforms", {})

        current_h, current_m = map(int, current_time_str.split(":"))
        current_minutes = current_h * 60 + current_m

        upcoming = []
        for deadline_key in [
            "confirm_deadline",
            "handover_deadline",
            "default_deadline",
                "cutoff_time"]:
            if deadline_key not in config:
                continue
            dh, dm = map(int, config[deadline_key].split(":"))
            remaining = (dh * 60 + dm) - current_minutes
            if 0 < remaining <= max_warning_minutes:
                upcoming.append({
                    "deadline_type": deadline_key,
                    "deadline_time": config[deadline_key],
                    "minutes_remaining": remaining,
                    "affected_orders": len(request.orders),
                    "urgency": "high" if remaining <= 30 else "medium" if remaining <= 60 else "low",
                })

        return {
            "platform": request.platform,
            "upcoming_deadlines": upcoming,
            "current_time": current_time_str,
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Optimization ───────────────────────────────────────────────────────

@app.get("/ai/optimization")
async def get_optimization():
    """Legacy optimization recommendations endpoint."""
    return {
        "optimizations": [
            {"action": "Optimize database queries", "impact": "15%", "priority": "high"},
            {"action": "Enable caching", "impact": "20%", "priority": "medium"},
        ],
        "overall_score": 89,
        "optimization_engine": "COBYQA" if COBYQA_AVAILABLE else "scipy.optimize",
    }


@app.post("/ai/optimization/solve")
async def solve_optimization(request: OptimizationRequest):
    """
    Solve optimization problem using COBYQA.

    objective_type options:
    - "sum_squares"  → minimize Σ xᵢ²
    - "rosenbrock"   → classic Rosenbrock banana function
    - "linear"       → minimize cᵀx  (requires coefficients=[c0, c1, ...])
    """
    try:
        if not COBYQA_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="Optimization engine not available. COBYQA dependencies missing.",
            )

        from scipy.optimize import Bounds

        bounds_obj = None
        if request.bounds:
            bounds_array = np.array(request.bounds)
            bounds_obj = Bounds(bounds_array[:, 0], bounds_array[:, 1])

        def _make_objective(obj_type: str, coefficients=None):
            if obj_type == "rosenbrock":
                return lambda x: sum(
                    100 * (x[i + 1] - x[i] ** 2) ** 2 + (1 - x[i]) ** 2
                    for i in range(len(x) - 1)
                )
            elif obj_type == "linear" and coefficients:
                c = np.array(coefficients)
                return lambda x: float(np.dot(c, x))
            else:  # "sum_squares" or fallback
                return lambda x: float(np.sum(x ** 2))

        objective = _make_objective(
            request.objective_type,
            request.coefficients)

        result = cobyqa_minimize(
            fun=objective,
            x0=np.array(request.initial_guess),
            bounds=bounds_obj,
            constraints=request.constraints or [],
            options=request.options or {},
        )

        return {
            "status": "success",
            "result": {
                "optimal_point": result.x.tolist() if hasattr(
                    result,
                    "x") else None,
                "optimal_value": float(
                    result.fun) if hasattr(
                    result,
                    "fun") else None,
                "success": bool(
                    result.success) if hasattr(
                    result,
                    "success") else False,
                "message": str(
                    result.message) if hasattr(
                    result,
                    "message") else "Optimization completed",
                "iterations": int(
                    result.nit) if hasattr(
                    result,
                    "nit") else None,
                "function_evaluations": int(
                    result.nfev) if hasattr(
                    result,
                    "nfev") else None,
            },
            "method": "COBYQA",
            "objective_type": request.objective_type,
            "timestamp": time.time(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {
                str(e)}")


@app.get("/ai/optimization/status")
async def optimization_status():
    return {
        "cobyqa_available": COBYQA_AVAILABLE,
        "engine": "COBYQA" if COBYQA_AVAILABLE else "scipy.optimize (fallback)",
        "status": "ready" if COBYQA_AVAILABLE else "limited",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
