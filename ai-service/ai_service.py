from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from typing import Optional, List, Dict, Any
import uvicorn
import time
import json
import logging
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()  # Load .env before reading os.getenv() calls below

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
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai_service")

# ─── Auth Config ─────────────────────────────────────────────────────────
# Set AUTH_REQUIRED=true in production to enforce JWT on all POST endpoints.
# Set AUTH_SECRET_KEY to a long random string (e.g. openssl rand -hex 32).
# Set API_KEY to a secret shared with clients that call POST /auth/token.

_AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "false").lower() == "true"
_SECRET_KEY = os.getenv(
    "AUTH_SECRET_KEY",
    "dev-secret-change-me-in-production-use-openssl-rand-hex-32",
)
_ALGORITHM = "HS256"
_TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "60"))
_API_KEY = os.getenv("API_KEY", "dev-api-key")

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer_scheme = HTTPBearer(auto_error=False)


def _create_token(sub: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": sub, "exp": expire},
        _SECRET_KEY,
        algorithm=_ALGORITHM,
    )


def _verify_token(
    credentials: Optional[HTTPAuthorizationCredentials],
) -> Dict[str, Any]:
    """Verify JWT bearer token. Raises 401 on failure."""
    if not _AUTH_REQUIRED:
        return {"sub": "anonymous"}
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing",
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            _SECRET_KEY,
            algorithms=[_ALGORITHM],
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


async def _auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        _bearer_scheme
    ),
) -> Dict[str, Any]:
    """FastAPI dependency — injects verified JWT payload."""
    return _verify_token(credentials)

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

# ─── Rate Limiter ────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)

# ─── App ─────────────────────────────────────────────────────────────────

app = FastAPI(title="React OAS AI Service", version="4.2")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def _log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = round((time.time() - start) * 1000, 1)
    logger.info(
        "%s %s → %s  (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        ms,
    )
    return response

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


class TokenRequest(BaseModel):
    api_key: str


# ─── Auth Endpoint ───────────────────────────────────────────────────────


@app.post("/auth/token", tags=["auth"])
async def get_token(body: TokenRequest):
    """
    Exchange API key for a JWT bearer token.

    The API key is set via the API_KEY environment variable
    (default: "dev-api-key" for local development).
    """
    if body.api_key != _API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    token = _create_token(sub="api-client")
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": _TOKEN_EXPIRE_MINUTES * 60,
        "auth_required": _AUTH_REQUIRED,
    }


# ─── Health ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "4.2",
        "models": {
            "pattern_recognizer": True,
            "predictive_alerts": True,
            "nlp_processor": True,
            "smart_categorizer": True,
            "report_generator": True,
            "optimizer": COBYQA_AVAILABLE,
        },
        "sla_config_loaded": bool(SLA_CONFIG),
        "auth_required": _AUTH_REQUIRED,
    }


# ─── Pattern Analysis ───────────────────────────────────────────────────

@app.post("/ai/analyze/trends")
@limiter.limit("60/minute")
async def analyze_trends(
    body: DataAnalysisRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        result = pattern_recognizer.recognize_trends(
            body.data, body.value_column)
        return {"trend_analysis": result, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/anomalies")
@limiter.limit("60/minute")
async def analyze_anomalies(
    body: DataAnalysisRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        anomalies = pattern_recognizer.detect_anomalies(
            body.data, body.value_column)

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
                    f"Investigate {len(spikes)} spike(s)"
                    " — may indicate exceptional events"
                )
            if drops:
                recommendations.append(
                    f"Review {len(drops)} drop(s)"
                    " — may indicate data issues or failures"
                )
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
@limiter.limit("60/minute")
async def analyze_cycles(
    body: DataAnalysisRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        result = pattern_recognizer.detect_cycles(
            body.data, body.value_column, body.date_column)
        return {"cycle_analysis": result, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/correlations")
@limiter.limit("60/minute")
async def analyze_correlations(
    body: CorrelationRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        result = pattern_recognizer.find_correlations(
            body.data, body.columns)
        return {**result, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze/full")
@limiter.limit("30/minute")
async def analyze_full(
    body: DataAnalysisRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        return pattern_recognizer.analyze_patterns(
            body.data, body.value_column, body.date_column)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Predictions ────────────────────────────────────────────────────────

@app.post("/ai/predictions")
@limiter.limit("30/minute")
async def get_predictions(
    body: PredictionRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    """Real predictions using linear regression on input data."""
    try:
        trend = pattern_recognizer.recognize_trends(
            body.data, body.value_column)
        slope = trend.get("slope", 0)
        values = [
            float(row[body.value_column])
            for row in body.data
            if body.value_column in row
        ]

        if not values:
            col = body.value_column
            raise HTTPException(
                status_code=400,
                detail=f"Column '{col}' not found in data",
            )

        last_value = values[-1]
        predicted = [round(last_value + slope * (i + 1), 2)
                     for i in range(body.horizon)]

        base_confidence = trend.get("confidence", 0.5)
        confidence_scores = [round(base_confidence * (0.95 ** i), 3)
                             for i in range(body.horizon)]

        return {
            "predictions": {body.value_column: predicted},
            "confidence_scores": {body.value_column: confidence_scores},
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
@limiter.limit("30/minute")
async def chat_query(
    body: ChatRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        return nlp_processor.process_chat_query(body.query, body.context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/search")
@limiter.limit("30/minute")
async def smart_search(
    body: SearchRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        results = nlp_processor.smart_search(
            body.query, body.data, body.columns)
        return {
            "results": results,
            "count": len(results),
            "query": body.query,
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/summary")
@limiter.limit("30/minute")
async def generate_summary(
    body: SummaryRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        summary = nlp_processor.generate_summary(
            body.data, body.max_length)
        return {"summary": summary, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Alerts ─────────────────────────────────────────────────────────────

@app.post("/ai/alerts")
@limiter.limit("30/minute")
async def generate_alerts(
    body: AlertRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        alerts = predictive_alerts.analyze_and_alert(
            body.data, body.value_column, body.metric_name, body.threshold)
        return {
            "alerts": alerts,
            "count": len(alerts),
            "has_critical": any(a.get("severity") == "high" for a in alerts),
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/alerts/threshold")
@limiter.limit("30/minute")
async def predict_threshold(
    body: AlertRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    if body.threshold is None:
        raise HTTPException(status_code=400,
                            detail="'threshold' field is required")
    try:
        prediction = predictive_alerts.predict_threshold_crossing(
            body.data, body.value_column, body.threshold
        )
        return {"prediction": prediction, "timestamp": time.time()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Categorization ─────────────────────────────────────────────────────

@app.post("/ai/categorize")
@limiter.limit("60/minute")
async def categorize_data(
    body: CategorizationRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        categorized = smart_categorizer.categorize_rows(
            body.data, body.category_rules)
        return {
            "categorized": categorized,
            "count": len(categorized),
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Reports ────────────────────────────────────────────────────────────

@app.post("/ai/reports/summary")
@limiter.limit("20/minute")
async def generate_summary_report(
    body: ReportRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        return report_generator.generate_summary_report(
            body.data, body.title or "Data Summary")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/trend")
@limiter.limit("20/minute")
async def generate_trend_report(
    body: ReportRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        return report_generator.generate_trend_report(
            body.data,
            body.value_column,
            body.date_column,
            body.title or "Trend Analysis")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/anomaly")
@limiter.limit("20/minute")
async def generate_anomaly_report(
    body: ReportRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        return report_generator.generate_anomaly_report(
            body.data, body.value_column, body.title or "Anomaly Detection")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/comprehensive")
@limiter.limit("10/minute")
async def generate_comprehensive_report(
    body: ReportRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    try:
        return report_generator.generate_comprehensive_report(
            body.data,
            body.value_column,
            body.date_column,
            body.title or "Comprehensive Report")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── SLA ────────────────────────────────────────────────────────────────

@app.get("/ai/sla/config")
async def get_sla_config():
    return {"config": SLA_CONFIG, "platforms": list(SLA_CONFIG.keys())}


@app.post("/ai/sla/check")
@limiter.limit("60/minute")
async def check_sla(
    body: SLACheckRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    """Check orders against SLA deadlines for a given platform."""
    try:
        platform_key = body.platform.lower()
        config = SLA_CONFIG.get(platform_key) or SLA_CONFIG.get(
            "other_platforms", {})
        raw_time = body.current_time or datetime.now().strftime("%H:%M")
        # Accept both "HH:MM" and ISO 8601 "YYYY-MM-DDTHH:MM:SS"
        if "T" in raw_time:
            current_time_str = raw_time.split("T")[1][:5]
        else:
            current_time_str = raw_time[:5]

        current_h, current_m = map(int, current_time_str.split(":"))
        current_minutes = current_h * 60 + current_m

        violations = []
        warnings = []

        def _to_minutes(t: str) -> int:
            h, m = map(int, t.split(":"))
            return h * 60 + m

        for order in body.orders:
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
                        "message": f"Order {order_id} missed {body.platform} cutoff ({config['cutoff_time']})",
                    })

            for deadline_key in [
                "cutoff_time",
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
            "platform": body.platform,
            "current_time": current_time_str,
            "violations": violations,
            "warnings": warnings,
            "total_orders": len(
                body.orders),
            "violation_count": len(violations),
            "warning_count": len(warnings),
            "status": "critical" if violations else (
                "warning" if warnings else "ok"),
            "timestamp": time.time(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/sla/alerts")
@limiter.limit("60/minute")
async def get_sla_alerts(
    body: SLACheckRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
    """Get upcoming SLA deadlines within the warning window."""
    try:
        from datetime import datetime

        raw_time = body.current_time or datetime.now().strftime("%H:%M")
        if "T" in raw_time:
            current_time_str = raw_time.split("T")[1][:5]
        else:
            current_time_str = raw_time[:5]
        warning_hours = SLA_CONFIG.get("warning_hours", [2, 1, 0.5])
        max_warning_minutes = max(warning_hours) * 60

        platform_key = body.platform.lower()
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
                    "affected_orders": len(body.orders),
                    "urgency": "high" if remaining <= 30 else "medium" if remaining <= 60 else "low",
                })

        return {
            "platform": body.platform,
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
@limiter.limit("10/minute")
async def solve_optimization(
    body: OptimizationRequest,
    request: Request,
    _: Dict = Depends(_auth),
):
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
        if body.bounds:
            bounds_array = np.array(body.bounds)
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
            body.objective_type,
            body.coefficients)

        result = cobyqa_minimize(
            fun=objective,
            x0=np.array(body.initial_guess),
            bounds=bounds_obj,
            constraints=body.constraints or [],
            options=body.options or {},
        )

        r = result
        return {
            "status": "success",
            "result": {
                "optimal_point": (
                    r.x.tolist() if hasattr(r, "x") else None
                ),
                "optimal_value": (
                    float(r.fun) if hasattr(r, "fun") else None
                ),
                "success": (
                    bool(r.success) if hasattr(r, "success") else False
                ),
                "message": (
                    str(r.message)
                    if hasattr(r, "message")
                    else "Optimization completed"
                ),
                "iterations": (
                    int(r.nit) if hasattr(r, "nit") else None
                ),
                "function_evaluations": (
                    int(r.nfev) if hasattr(r, "nfev") else None
                ),
            },
            "method": "COBYQA",
            "objective_type": body.objective_type,
            "timestamp": time.time(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Optimization failed: " + str(e),
        )


@app.get("/ai/optimization/status")
async def optimization_status():
    return {
        "cobyqa_available": COBYQA_AVAILABLE,
        "engine": "COBYQA" if COBYQA_AVAILABLE else "scipy.optimize (fallback)",
        "status": "ready" if COBYQA_AVAILABLE else "limited",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
