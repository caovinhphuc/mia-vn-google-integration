# Automation Pipeline — Kế Hoạch Cải Thiện

> **Mục tiêu:** Kết nối hoàn chỉnh: ONE System → extract → normalize → ai-service phân tích

---

## Vấn Đề Hiện Tại (Trước Khi Fix)

```
ONE System  →  enhanced_scraper  →  page_01.json, page_02.json...
                  col_1, col_2...          ↓
                                    ❌ Không merge
                                    ❌ Không normalize
                                    ❌ Không gửi ai-service
                                          ↓
                               ai-service: KHÔNG có data
```

### Danh sách bug cụ thể

| #   | Vị trí                                                     | Vấn đề                                              | Ảnh hưởng                                               |
| --- | ---------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| 1   | `one_automation.py:71`                                     | Date range hardcoded `'2025-06-01', '2025-06-30'`   | Luôn lấy data tháng 6/2025 dù chạy bất kỳ ngày nào      |
| 2   | `scripts/enhanced_scraper.py`                              | Columns lưu là `col_1..col_N` không có tên semantic | AI không biết cột nào là `platform`, `amount`, `status` |
| 3   | —                                                          | Không có bước merge các page JSON files             | 12 file riêng lẻ, không có dataset hoàn chỉnh           |
| 4   | —                                                          | Không có bridge gửi data lên ai-service             | ai-service hoàn toàn không có data thực để phân tích    |
| 5   | `services/data_processor.py` + `modules/data_processor.py` | Trùng lặp module, logic khác nhau                   | Import nhầm → behavior không nhất quán                  |
| 6   | `run_*.py` (5+ files)                                      | Nhiều runner không rõ file nào là canonical         | Không biết chạy file nào                                |

---

## Kiến Trúc Sau Khi Fix

```
config/daterange_config.json    ← cấu hình ngày tháng
config/columns_orders.json      ← mapping col_N → tên semantic

one_automation.py               ← Phase 1: Extract từ ONE
  ↓ reads date range từ config
  ↓ saves data/june_2025_enhanced_page_*.json

scripts/data_consolidator.py    ← Phase 2: Merge + Normalize
  ↓ merge 12 page files → 1 dataset
  ↓ map col_1 → order_code, col_5 → platform, etc.
  ↓ aggregate orders theo ngày → daily_revenue
  ↓ saves data/orders_normalized_YYYYMMDD.csv
  ↓ saves data/daily_revenue_YYYYMMDD.json
  ↓ saves data/orders_latest.csv

scripts/ai_bridge.py            ← Phase 3: Gửi lên ai-service
  ↓ GET token từ POST /auth/token
  ↓ POST /ai/analyze/trends (daily_revenue)
  ↓ POST /ai/analyze/anomalies (daily_revenue)
  ↓ POST /ai/sla/check (orders grouped by platform)
  ↓ saves data/ai_analysis_YYYYMMDD.json

pipeline.py                     ← Entry point duy nhất
  python pipeline.py                  # full pipeline
  python pipeline.py --skip-extract   # dùng data có sẵn
  python pipeline.py --only-analyze   # chỉ gọi ai-service
```

---

## Files Đã Tạo / Sửa

### Mới tạo

| File                           | Mục đích                                                 |
| ------------------------------ | -------------------------------------------------------- |
| `pipeline.py`                  | Entry point duy nhất — orchestrate 3 phases              |
| `scripts/data_consolidator.py` | Merge page JSONs + normalize columns + aggregate by date |
| `scripts/ai_bridge.py`         | Gửi data lên ai-service, lấy kết quả phân tích           |
| `config/columns_orders.json`   | Mapping `col_N` → tên semantic                           |

### Đã sửa

| File                | Thay đổi                                                                           |
| ------------------- | ---------------------------------------------------------------------------------- |
| `one_automation.py` | Thêm `_load_date_range()` — đọc từ `config/daterange_config.json` thay vì hardcode |

---

## Cách Sử Dụng

### Chạy full pipeline (extraction + consolidate + AI)

```bash
cd automation/
python pipeline.py --api-key mia-dev-api-key-2026
```

### Chỉ consolidate + analyze (đã có data)

```bash
python pipeline.py --skip-extract --api-key mia-dev-api-key-2026
```

### Chỉ analyze (đã consolidate rồi)

```bash
python pipeline.py --only-analyze --ai-url http://localhost:8000
```

### Chạy từng bước thủ công

```bash
# Step 1: Extract
python one_automation.py

# Step 2: Consolidate
python scripts/data_consolidator.py --dir data

# Step 3: Analyze
python scripts/ai_bridge.py --ai-url http://localhost:8000
```

---

## Cấu Hình Ngày Tháng

Sửa file `config/daterange_config.json`:

```json
{
  "date_range": {
    "mode": "custom",
    "start_date": "2025-06-01",
    "end_date": "2025-06-30"
  }
}
```

Nếu không có file này, `one_automation.py` sẽ tự động dùng **tháng hiện tại**.

---

## Column Mapping

File `config/columns_orders.json` map vị trí cột trong bảng ONE sang tên có nghĩa:

```json
{
  "col_mapping": {
    "col_1": "order_code",
    "col_3": "created_date",
    "col_4": "customer_name",
    "col_5": "platform",
    "col_6": "status",
    "col_7": "amount_display"
  }
}
```

> **Lưu ý:** Cần verify column positions bằng cách inspect một order từ bảng ONE thực tế.
> Chạy `python scripts/data_consolidator.py` và mở `data/orders_normalized_*.csv` để kiểm tra.

---

## Data Flow Chi Tiết

### Input (từ one_automation.py)

```json
{
  "metadata": { "page_number": 1, ... },
  "orders": [
    {
      "col_1": "ORD-001",
      "col_4": "Nguyen Van A",
      "col_5": "shopee",
      "api_amount": "500000",
      "api_transporter": "GHN",
      "has_product_details": true,
      ...
    }
  ]
}
```

### Output sau data_consolidator.py

**orders_normalized_YYYYMMDD.csv:**

```
order_code,customer_name,platform,status,platform_normalized,amount_float,date_str,...
ORD-001,Nguyen Van A,shopee,pending,shopee,500000.0,2025-06-15,...
```

**daily_revenue_YYYYMMDD.json:**

```json
[
  {"date": "2025-06-01", "value": 12500000.0, "order_count": 45},
  {"date": "2025-06-02", "value": 9800000.0,  "order_count": 38},
  ...
]
```

### Output sau ai_bridge.py

**ai_analysis_YYYYMMDD.json:**

```json
{
  "metadata": { "generated_at": "...", "data_stats": {...} },
  "trends": {
    "trend_analysis": {
      "trend": "increasing",
      "slope": 125000.5,
      "confidence": 0.87
    }
  },
  "anomalies": {
    "anomalies": [{"index": 5, "value": 2800000, "z_score": 3.1}],
    "risk_level": "high"
  },
  "sla": {
    "shopee": { "violations": [...], "warnings": [...], "status": "critical" },
    "tiktok": { "violations": [], "warnings": [...], "status": "warning" }
  }
}
```

---

## Việc Còn Lại (TODO)

- [ ] **Verify column mapping** — chạy consolidator với data thực, mở CSV kiểm tra `col_5` có đúng là `platform` không
- [ ] **Inventory pipeline** — `Inventory.py` chạy riêng, chưa có bridge gửi inventory vào ai-service
- [ ] **Scheduling** — thêm cron job chạy `pipeline.py` tự động (hàng giờ / hàng ngày)
- [ ] **Error notification** — khi pipeline fail → gửi Telegram/email qua `notifier.py`
- [ ] **Consolidate duplicate DataProcessors** — `services/data_processor.py` và `modules/data_processor.py` có thể merge thành một

---

_Tạo ngày: 2026-03-23 | automation v2.0_
