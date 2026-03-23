# mia_models

Module analytics dùng trong **ai-service** (`main_simple.py`), endpoint `/api/ml/legacy/*`.

## Đã tích hợp

| Module               | Mô tả                                   | Phụ thuộc                    |
| -------------------- | --------------------------------------- | ---------------------------- |
| `nlp_processor`      | Parse intent, summary, smart search     | stdlib (+ numpy optional)    |
| `pattern_recognizer` | Xu hướng, anomaly, cycle, correlation   | numpy                        |
| `predictive_alerts`  | Cảnh báo trend / anomaly / threshold    | numpy (qua pattern)          |
| `smart_categorizer`  | Phân loại cột / hàng                    | stdlib                       |
| `report_generator`   | Báo cáo summary / trend / comprehensive | (dùng pattern + categorizer) |

## sklearn (chưa wire API)

File mẫu nằm trong `sklearn_templates/` (`retail_predictor.py`, `your_domain_predictor.py`). Cần thêm vào `requirements.txt`:

```text
pandas>=2.0
scikit-learn>=1.3
```

Rồi import và thêm endpoint trong `main_simple.py` nếu cần.

## API (FastAPI)

Prefix: `/api/ml/legacy/`

- `GET /api/ml/legacy/status`
- `POST /api/ml/legacy/nlp/parse` — `{ "query", "context?" }`
- `POST /api/ml/legacy/nlp/summary` — `{ "data", "max_length?" }`
- `POST /api/ml/legacy/nlp/search` — `{ "query", "data", "columns?" }`
- `POST /api/ml/legacy/patterns/analyze` — `{ "data", "value_column", "date_column?" }`
- `POST /api/ml/legacy/patterns/trends` — `{ "data", "value_column" }`
- `POST /api/ml/legacy/patterns/anomalies` — `{ "data", "value_column" }`
- `POST /api/ml/legacy/alerts/analyze` — `{ "data", "value_column", "metric_name?", "threshold?" }`
- `POST /api/ml/legacy/report/summary` — `{ "data", "title?" }`
- `POST /api/ml/legacy/report/trend` — `{ "data", "value_column", "date_column?", "title?" }`
- `POST /api/ml/legacy/report/comprehensive` — `{ "data", "value_column", "date_column?", "title?" }`
- `POST /api/ml/legacy/categorize/column` — `{ "column_name", "sample_values?" }`

Chạy service từ thư mục `ai-service/`:

```bash
cd ai-service && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8000
```
