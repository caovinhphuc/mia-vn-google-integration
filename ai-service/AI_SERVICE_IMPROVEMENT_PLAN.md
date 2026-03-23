# AI Service — Kế Hoạch Nâng Cao

> **Mục tiêu:** Chuyển từ mock/hardcoded data sang AI service thực sự, kết nối toàn bộ `mia_models/` vào FastAPI, và bổ sung các tính năng còn thiếu.

---

## Tình Trạng Hiện Tại (Baseline)

| Endpoint                      | Trạng thái   | Vấn đề                                             |
| ----------------------------- | ------------ | -------------------------------------------------- |
| `GET /health`                 | ✅ OK        | —                                                  |
| `GET /ai/predictions`         | ⚠️ Mock      | Trả `random.randint()`, không phải prediction thật |
| `GET /ai/anomalies`           | ❌ Hardcoded | Luôn trả `anomalies: []`                           |
| `GET /ai/optimization`        | ⚠️ Static    | Recommendation cứng, không theo data               |
| `POST /ai/optimization/solve` | ✅ Hoạt động | Nhưng objective function bị hardcode `sum(x²)`     |
| `mia_models/*`                | ❌ Chưa dùng | Không có endpoint nào expose các models            |

---

## Giai Đoạn 1 — Kết Nối mia_models Vào FastAPI

> **Ưu tiên: P0 — Làm trước nhất**

### 1.1 Expose Pattern Recognizer

Thêm endpoints phân tích data thực:

```http
POST /ai/analyze/trends
POST /ai/analyze/anomalies
POST /ai/analyze/cycles
POST /ai/analyze/correlations
POST /ai/analyze/full
```

**Request body:**

```json
{
  "data": [{"date": "2025-01-01", "value": 100}, ...],
  "value_column": "value",
  "date_column": "date"
}
```

**Response mẫu:**

```json
{
  "trends": { "trend": "increasing", "slope": 2.3, "confidence": 0.87 },
  "anomalies": [{ "index": 5, "value": 340, "z_score": 3.2, "type": "spike" }],
  "cycles": { "cycle": "weekly", "period": 7, "confidence": 0.74 }
}
```

### 1.2 Expose NLP Processor

```http
POST /ai/chat
POST /ai/search
POST /ai/summary
```

**Ví dụ `/ai/chat`:**

```json
// Request
{ "query": "show me total revenue last month", "context": {} }

// Response
{
  "intent": "aggregate",
  "entities": { "dates": ["last month"], "keywords": ["revenue"] },
  "query_structure": { "action": "aggregate", "function": "sum" },
  "confidence": 0.75
}
```

### 1.3 Expose Predictive Alerts

```http
POST /ai/alerts
POST /ai/alerts/threshold
```

**Request:**

```json
{
  "data": [...],
  "value_column": "sales",
  "metric_name": "Daily Sales",
  "threshold": 1000
}
```

### 1.4 Expose Report Generator

```http
POST /ai/reports/summary
POST /ai/reports/trend
POST /ai/reports/anomaly
POST /ai/reports/comprehensive
```

---

## Giai Đoạn 2 — Fix Mock Data & Hardcoded Logic

> **Ưu tiên: P1**

### 2.1 Fix `/ai/predictions` — Bỏ random data

**Hiện tại (sai):**

```python
"response_time": [random.randint(95, 110) for _ in range(5)]
```

**Thay bằng:** Nhận data input, dùng `PatternRecognizer.recognize_trends()` để project future values theo linear regression từ slope thực.

```http
POST /ai/predictions
Body: { "data": [...], "value_column": "value", "horizon": 5 }
```

**Logic projection:**

```
predicted[t+n] = last_value + slope * n
confidence = trend.confidence * decay_factor
```

### 2.2 Fix `/ai/anomalies` — Bỏ hardcoded empty

**Hiện tại (sai):**

```python
return {"anomalies": [], "risk_level": "low"}
```

**Thay bằng:** Nhận data, gọi `pattern_recognizer.detect_anomalies()`, tính `risk_level` động:

| Điều kiện                      | risk_level   |
| ------------------------------ | ------------ |
| Có anomaly z_score > 3         | `"critical"` |
| Có anomaly severity = "high"   | `"high"`     |
| Có anomaly severity = "medium" | `"medium"`   |
| Không có anomaly               | `"low"`      |

### 2.3 Fix `/ai/optimization/solve` — Bỏ hardcoded objective

**Hiện tại:**

```python
def objective(x):
    return np.sum(x**2)  # Luôn minimize sum of squares
```

**Options cải thiện:**

- **Option A (đơn giản):** Cho phép chọn preset objectives qua `objective_type` parameter (`"sum_squares"`, `"rosenbrock"`, `"custom_linear"`)
- **Option B (linh hoạt):** Nhận `coefficients` array, build linear/polynomial objective từ đó

---

## Giai Đoạn 3 — Tích Hợp SLA Config

> **Ưu tiên: P1** — `sla_config.json` đang tồn tại nhưng không được load

### 3.1 Load SLA Config vào App

```python
# Khi startup
import json
with open("config/sla_config.json") as f:
    SLA_CONFIG = json.load(f)
```

### 3.2 Thêm SLA Alert Endpoints

```http
GET  /ai/sla/config
POST /ai/sla/check          # Check order có vi phạm SLA không
POST /ai/sla/alerts         # Lấy danh sách SLA alerts sắp đến deadline
```

**Logic check Shopee SLA:**

```
Nếu current_time > cutoff_time (18:00) và order chưa confirm
→ Alert: "Shopee order #{id} missed cutoff"
```

### 3.3 Thêm Platform-specific Rules

| Platform | Cutoff | Confirm by | Handover by |
| -------- | ------ | ---------- | ----------- |
| Shopee   | 18:00  | 09:00      | 12:00       |
| TikTok   | 14:00  | —          | 21:00       |
| Others   | —      | —          | 17:00       |

---

## Giai Đoạn 4 — Bảo Mật & Production Readiness

> **Ưu tiên: P2**

### 4.1 Authentication (JWT)

`requirements.txt` đã có `python-jose` và `passlib`. Cần implement:

```python
# Thêm middleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.post("/ai/analyze/trends")
async def analyze_trends(
    request: AnalysisRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    verify_token(credentials.credentials)
    ...
```

**Endpoints cần protect:** Tất cả `POST /ai/*`
**Endpoints public:** `GET /health`, `GET /ai/optimization/status`

### 4.2 Fix CORS Wildcard

```python
# Thay allow_origins=["*"] bằng:
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    ...
)
```

### 4.3 Thêm Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_service")

# Log mỗi request
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    ...
```

### 4.4 Rate Limiting

```python
# pip install slowapi
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/ai/chat")
@limiter.limit("30/minute")
async def chat_query(...):
    ...
```

---

## Giai Đoạn 5 — Nâng Cao NLP

> **Ưu tiên: P3**

### 5.1 Tình trạng hiện tại

NLP hiện dùng **regex patterns thuần túy**:

- Ưu: Zero dependency, fast
- Nhược: Không hiểu câu phức tạp, tiếng Việt, context

### 5.2 Option A — Tích hợp Claude API

```python
import anthropic

client = anthropic.Anthropic()

async def enhanced_chat_query(query: str, data_schema: dict) -> dict:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # Fast & cheap
        max_tokens=500,
        system=f"""You are a data query assistant.
        Available data schema: {data_schema}
        Extract: intent, filters, aggregations as JSON.""",
        messages=[{"role": "user", "content": query}]
    )
    return json.loads(response.content[0].text)
```

**Lợi ích:** Hiểu tiếng Việt, câu phức tạp, context-aware

### 5.3 Option B — Hybrid (Regex → LLM fallback)

```python
def process_chat_query(query: str) -> dict:
    # 1. Thử regex trước (fast)
    result = regex_processor.process(query)

    # 2. Nếu confidence thấp, dùng LLM
    if result["confidence"] < 0.6:
        result = llm_processor.process(query)

    return result
```

---

## Giai Đoạn 6 — Fix Các Lỗi Minor

> **Ưu tiên: P3**

### 6.1 Fix PredictiveAlerts Singleton State

```python
# Hiện tại — state tích lũy qua requests:
class PredictiveAlerts:
    def __init__(self):
        self.alerts = []      # Vấn đề!
        self.thresholds = {}  # Vấn đề!
```

**Fix:** Không lưu alerts vào instance state. Trả về từ method thay vì append vào `self.alerts`.

### 6.2 Fix `group_similar_items` Chưa Implement

```python
# Hiện tại trả về:
return {"all": data}  # Không có logic gì

# Cần implement TF-IDF hoặc simple clustering
```

### 6.3 Thêm Daily Cycle Detection

```python
# pattern_recognizer.py — detect_cycles() hiện bỏ qua daily
# Thêm kiểm tra lag-1 (daily pattern) trước lag-7
if len(values) >= 2:
    # Check daily correlation
    ...
```

---

## Roadmap Tổng Hợp

```
TUẦN 1  ✅ HOÀN THÀNH
├── [P0] Giai đoạn 1: Expose mia_models vào FastAPI          ✅
│   ├── POST /ai/analyze/* (PatternRecognizer)
│   ├── POST /ai/chat, /ai/search (NLP)
│   ├── POST /ai/alerts (PredictiveAlerts)
│   └── POST /ai/reports/* (ReportGenerator)
│
└── [P1] Giai đoạn 2: Fix mock data                          ✅
    ├── Fix /ai/predictions → linear regression (np.polyfit)
    └── Fix /ai/anomalies → z-score detection

TUẦN 2  ✅ HOÀN THÀNH
├── [P1] Giai đoạn 3: SLA Integration                        ✅
│   ├── Load sla_config.json khi startup
│   ├── GET  /ai/sla/config
│   ├── POST /ai/sla/check  (cutoff + warning + deadline)
│   └── POST /ai/sla/alerts
│
└── [P2] Giai đoạn 4: Bảo mật                               ✅
    ├── JWT authentication (python-jose HS256)
    ├── Opt-in auth (AUTH_REQUIRED env var)
    ├── POST /auth/token — exchange API key → JWT
    ├── CORS đọc từ ALLOWED_ORIGINS env var
    ├── Request logging middleware
    └── Rate limiting (slowapi, tiered: 10–60/min)

HOTFIXES (2026-03-23)                                         ✅
├── load_dotenv() thiếu → .env không được load
├── SLACheckRequest.current_time: thêm parse ISO 8601
└── SLA warning loop: thêm cutoff_time vào deadline keys

TUẦN 3  ✅ PARTIAL (2026-03-24)
├── [P3] Giai đoạn 6: Fix minor issues                        ✅
│   ├── PredictiveAlerts — xoá dead mutable state (self.alerts, self.thresholds)
│   ├── detect_cycles() — thêm daily cycle (lag-1, threshold 0.7)
│   └── group_similar_items() — auto-group by first low-cardinality string col
└── [P3] Giai đoạn 5: Nâng cao NLP (Claude API hybrid)        ⏳ CHƯA LÀM
```

---

## Checklist Trước Khi Deploy Production

- [x] Tất cả endpoints có real data (không còn `random.randint`)
- [x] `/ai/anomalies` dùng `pattern_recognizer.detect_anomalies()`
- [x] `mia_models` có ít nhất 1 endpoint expose mỗi module
- [x] SLA config được load và có endpoint `/ai/sla/check`
- [x] JWT auth trên các POST endpoints
- [x] `ALLOWED_ORIGINS` đọc từ environment variable
- [x] Request logging hoạt động
- [x] `COBYQA_AVAILABLE=False` fallback được test
- [x] `.env` được load đúng cách (`load_dotenv()`)
- [x] SLA check chấp nhận ISO 8601 cho `current_time`
- [x] SLA warning bao gồm `cutoff_time` approaching
- [x] `SmartCategorizer.group_similar_items()` — implement real grouping (2026-03-24)
- [x] `PredictiveAlerts` — loại bỏ mutable singleton state (2026-03-24)
- [x] `PatternRecognizer.detect_cycles()` — thêm daily cycle detection (2026-03-24)
- [ ] Unit tests cho `PatternRecognizer`, `NLPProcessor`
- [ ] NLP hybrid: Claude API fallback khi confidence < 0.6

---

## Hotfixes Chi Tiết (2026-03-23)

### HF-1: load_dotenv() chưa được gọi

**Triệu chứng:** `auth_required: false` dù `.env` có `AUTH_REQUIRED=true`

**Root cause:** `_AUTH_REQUIRED = os.getenv(...)` chạy lúc import, trước khi `.env` được đọc.
`load_dotenv()` phải gọi **trước** tất cả `os.getenv()`.

**Fix:**

```python
from dotenv import load_dotenv
load_dotenv()  # Thêm ngay sau imports, trước os.getenv()
```

---

### HF-2: SLA current_time không nhận ISO 8601

**Triệu chứng:** Pass `"2025-01-15T19:00:00"` → server dùng thời gian thực thay vì 19:00.

**Root cause:** Parser `split(":")` trả `("2025-01", "15T19", "00", "00")` → parse sai giờ.

**Fix:**

```python
if "T" in raw_time:
    current_time_str = raw_time.split("T")[1][:5]  # "19:00"
else:
    current_time_str = raw_time[:5]
```

---

### HF-3: SLA warning không cảnh báo cutoff sắp đến

**Triệu chứng:** Shopee order lúc 17:30 (cutoff 18:00) → không có warning.

**Root cause:** Warning loop chỉ kiểm tra `confirm_deadline`, `handover_deadline`, `default_deadline` — bỏ qua `cutoff_time`.

**Fix:** Thêm `"cutoff_time"` vào đầu danh sách deadline keys trong warning loop.

---

Tạo ngày: 2026-03-23 | Cập nhật: 2026-03-24 | ai-service v4.2
