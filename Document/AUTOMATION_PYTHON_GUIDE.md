# Hướng dẫn cài đặt Automation (Python) & tra cứu script

Tài liệu cho thư mục **`automation/`** trong repo: cách cài, chạy, và **từng file Python làm gì**. Một số script phụ thuộc **Chrome + Selenium**, số khác chỉ **Google API / Flask / FastAPI**.

---

## 1. Kiến trúc tóm tắt

```text
┌─────────────────────────────────────────────────────────────┐
│  Entry (automation.py / one_automation.py / enhanced…)       │
│       → Selenium (ONE) → CSV/JSON trong automation/data/     │
│       → (tuỳ chọn) gspread / Google Sheets API               │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   config/*.json              Service Account JSON (Google)
   SLA / workspace            Spreadsheet ID trong .env
```

- **Nguồn sự thật cấu hình:** `config/config.json`, `config/sla_config.json`, biến môi trường, và/hoặc tab trên Google Sheets (qua `GoogleSheetsConfigService`).
- **Thư mục `automation_new/`:** bản song song / thử nghiệm cũ; ưu tiên làm việc với **`automation/`** gốc trừ khi team quy ước khác.

---

## 2. Yêu cầu hệ thống

| Thành phần            | Ghi chú                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Python**            | **3.11** chuẩn (CI + `.python-version`); `setup.sh` ưu tiên 3.11→3.12→3.13; không tạo venv bằng **3.14+** |
| **Google Chrome**     | Cho mọi luồng Selenium                                                                                    |
| **ChromeDriver**      | Thường qua `webdriver-manager` (trong `requirements-basic.txt`)                                           |
| **Tài khoản / quyền** | Đăng nhập ONE + Service Account có quyền spreadsheet                                                      |

---

## 3. Cài đặt nhanh

### Một lệnh — Cài đặt + Dữ liệu khởi tạo (khuyến nghị)

```bash
cd automation && ./setup-and-seed.sh
```

Script này sẽ:

- Chạy `setup.sh` (venv, pip `requirements-basic.txt`)
- Cài thêm `requirements_auth.txt` (gspread, Flask…)
- Tạo `data/orders_latest.csv` mẫu nếu chưa có
- Chạy `system_check.py`

**Sau khi chạy:** Dữ liệu mẫu trong `data/orders_latest.csv` — dashboard/Streamlit dùng được. Để có dữ liệu thật từ ONE: `python automation.py` hoặc `python one_automation.py` (cần login trình duyệt).

### Cách A — `setup.sh` (chỉ cài đặt)

```bash
cd automation
chmod +x setup.sh start.sh
./setup.sh          # tạo venv, pip install, kiểm tra môi trường
```

`setup.sh` tạo **`venv/`** trong `automation/` (khác `.venv` ở root repo).

### Cách B — Thủ công

```bash
cd automation
python3.11 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Luồng Selenium + scrape (ONE)
pip install -r requirements-basic.txt

# Luồng Flask auth + gspread (tách biệt)
pip install -r requirements_auth.txt
```

> **Lưu ý:** Hai file requirements **không trùng hoàn toàn**. Selenium nằm ở `requirements-basic.txt`; Flask/gspread nằm ở `requirements_auth.txt`. Cần đủ cả hai nếu chạy cả scrape lẫn auth API.

### Biến môi trường & credential

- Copy `.env.example` / `.env copy.example` → `.env` trong `automation/` (nếu có).
- Đặt **JSON service account** đúng path (thường `config/service_account.json` — khớp code trong `modules/google_sheets_config.py`).
- Chia sẻ spreadsheet cho email service account.

### Kiểm tra sau cài

```bash
cd automation && source venv/bin/activate
python system_check.py              # import dependencies
python test_sheets_connection.py    # Google API + credential
python verify_integrations.py       # Sheets, Drive, Telegram, Email
```

**Tích hợp (Sheets, Drive, Telegram, Email):** xem [automation/INTEGRATIONS_SETUP.md](../automation/INTEGRATIONS_SETUP.md).

---

## 4. Chạy các “entry” chính

| Mục đích                                         | Lệnh (trong `automation/`, đã `activate venv`)                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| Menu launcher                                    | `./start.sh`                                                                 |
| Core Selenium (hệ thống lớn)                     | `python automation.py`                                                       |
| Pipeline “fresh session” + sản phẩm (June-style) | `python one_automation.py` hoặc `python june_fresh_session_with_products.py` |
| Bản mở rộng SLA / product                        | `python automation_enhanced.py`                                              |
| Báo cáo tổng kết + Sheets                        | `python generate_summary.py`                                                 |
| Automation + log file                            | `python run_automation_with_logging.py`                                      |
| Automation “full” + monitoring                   | `python run_complete_automation.py`                                          |
| FastAPI bridge tới `automation.py`               | `python automation_bridge.py` (uvicorn trong file)                           |
| FastAPI dashboard (đọc CSV)                      | `python automation_dashboard.py`                                             |
| Streamlit dashboard                              | `streamlit run dashboard.py` (cần `pip install streamlit plotly`)            |
| Flask phục vụ CSV/HTML                           | chạy từ context đúng: `python api/api_server.py`                             |
| Auth Flask (legacy)                              | xem mục API — thường cần `PYTHONPATH` chứa `api` và module sheets            |

Luôn **`cd automation`** trước khi chạy để relative path `config/`, `data/`, `logs/` đúng.

---

## 5. Bảng tra cứu file Python

### 5.1 Entry / runner (chạy trực tiếp)

| File                                  | Nhiệm vụ                                                                                                    | Hoạt động ra sao                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `automation.py`                       | Lớp **`OneAutomationSystem`**: Selenium, lịch (`schedule`), email, xuất CSV, tích hợp Google (theo config). | File **lớn** — lõi crawl ONE + ghi log/file.                                                                     |
| `one_automation.py`                   | Orchestrator dùng `CompleteLoginManager` + date range + pagination + scraper.                               | Login → filter ngày → lấy dữ liệu nhiều trang.                                                                   |
| `june_fresh_session_with_products.py` | Gần giống luồng trên (fresh session + phân tích product).                                                   | Có thể trùng mục đích với `one_automation.py` — giữ một bản chuẩn theo team.                                     |
| `automation_enhanced.py`              | Kế thừa `OneAutomationSystem`, thêm SLA / product details, config Sheets.                                   | Dùng khi cần tính năng “enhanced” trong code.                                                                    |
| `run_automation_with_logging.py`      | Wrapper chạy automation + log ra `logs/`, gọi Sheets config nếu import được.                                | `from google_sheets_config import …` — cần **PYTHONPATH** hoặc file `google_sheets_config.py` ở cwd (xem mục 6). |
| `run_complete_automation.py`          | Tương tự “full run” + monitoring.                                                                           | Import `google_sheets_config` giống trên.                                                                        |
| `run_all_demo.py`                     | Chạy lần lượt nhiều script demo.                                                                            | Dùng để kiểm thử tích hợp nhanh.                                                                                 |
| `one_automation_once.py`              | Chạy **một lần**, kiểm tra backend HTTP (mặc định port 5001), loguru.                                       | Khác stack Selenium chính — kiểm tra service ngoài.                                                              |
| `main.py`                             | **FastAPI** “OneAutomation System”: Sheets + email + data processor (module `services/`).                   | Service HTTP độc lập với `automation.py`.                                                                        |
| `src/main.py`                         | Bản copy/cấu trúc tương tự FastAPI (cùng kiểu import `services.*`).                                         | Trùng vai trò với `main.py` — khi sửa, đồng bộ hoặc xoá một bản.                                                 |
| `automation_bridge.py`                | FastAPI mỏng: import `OneAutomationSystem`, endpoint trigger/status.                                        | Cầu nối frontend ↔ `automation.py`.                                                                              |
| `automation_dashboard.py`             | FastAPI + HTML: dashboard automation, đọc dữ liệu/export.                                                   | Port tuỳ cấu hình trong file.                                                                                    |
| `dashboard.py`                        | **Streamlit** + Plotly, đọc `data/orders_latest.csv`.                                                       | UI nội bộ phân tích file đã export.                                                                              |
| `generate_summary.py`                 | In báo cáo + đọc Sheets (config, SLA, history) qua `GoogleSheetsConfigService`.                             | Dùng sau batch hoặc định kỳ.                                                                                     |
| `system_check.py`                     | Kiểm tra package đã cài (selenium, flask, streamlit, …).                                                    | Không chạy scrape.                                                                                               |

### 5.2 Thư mục `scripts/` — từng bước Selenium / setup

| File                      | Nhiệm vụ                                                                   |
| ------------------------- | -------------------------------------------------------------------------- |
| `initialization.py`       | Khởi tạo logging, load `config.json`, `.env`.                              |
| `setup.py`                | Cài đặt/cấu hình WebDriver và môi trường automation.                       |
| `login.py`                | Bước đăng nhập ONE trên trình duyệt.                                       |
| `login_manager.py`        | **`CompleteLoginManager`**: ghép init → setup → login → `EnhancedScraper`. |
| `enhanced_scraper.py`     | Trích xuất bảng đơn / DOM, tối ưu JS.                                      |
| `pagination_handler.py`   | Lật trang danh sách đơn.                                                   |
| `date_customizer.py`      | Chọn khoảng ngày / filter ngày trên UI.                                    |
| `google_sheets_config.py` | **Bản duplicate** logic Sheets (gần giống `modules/`).                     |
| `cleanup_sheets.py`       | Dọn / reset vùng sheet (theo logic trong file).                            |

### 5.3 Thư mục `modules/`

| File                      | Nhiệm vụ                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `google_sheets_config.py` | **`GoogleSheetsConfigService`**: gspread + service account, tab Config / SLA / Logs. **Ưu tiên sửa tại đây** cho tích hợp Sheets. |
| `scheduler.py`            | `TaskScheduler`: `schedule` daily/hourly.                                                                                         |
| `data_processor.py`       | Chuẩn hoá list-of-lists Sheets → list dict.                                                                                       |
| `verify_sheets.py`        | Script kiểm tra nhanh Sheets service (import `google_sheets_config`).                                                             |

### 5.4 Thư mục `services/` (dùng bởi FastAPI `main.py`)

| File                       | Nhiệm vụ                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `google_sheets_service.py` | Google API client (official) đọc/ghi sheet theo `GOOGLE_SERVICE_ACCOUNT_FILE` / `GOOGLE_SHEET_ID`. |
| `email_service.py`         | Gửi email qua cấu hình env.                                                                        |
| `data_processor.py`        | Xử lý dữ liệu cho API (khác file trong `modules/` — tên trùng, code riêng).                        |

### 5.5 Thư mục `api/`

| File                 | Nhiệm vụ                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| `api_server.py`      | Flask: static dashboard HTML, API đọc CSV, có thể `subprocess` automation. |
| `index.py`           | Entry Vercel serverless — re-export `app` từ `api_server`.                 |
| `auth_api_server.py` | Flask auth (bản trong `api/`).                                             |
| `auth_service.py`    | Đăng nhập / session lưu trên **Google Sheets** (Users, …).                 |

**Gốc `automation/auth_api_server.py`:** Flask, `from auth_service import` — cần chạy khi **`api/` nằm trên `PYTHONPATH`** hoặc đứng trong `api/` và sửa import; có thể là **legacy**. Ưu tiên dùng **backend Node** trong repo chính cho auth production.

### 5.6 Tiện ích / debug / test

| File                                                              | Nhiệm vụ                                                                      |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `ui_debug_inspector.py`                                           | Mở Chrome, in DOM/selectors để chỉnh scraper.                                 |
| `inspect_sheets_data.py`                                          | In dữ liệu từ Sheets (logs/config) qua `GoogleSheetsConfigService`.           |
| `dashboard_integration.py`                                        | Export `orders_dashboard_*.csv`, `orders_latest.csv`, SLA JSON vào `data/`.   |
| `sla_monitor.py`                                                  | Class **`SLAMonitor`**: đọc `config/sla_config.json`, logic cảnh báo SLA sàn. |
| `notifier.py`                                                     | Gửi email (SMTP env); có nhánh gọi HTTP khác nếu cấu hình.                    |
| `ai_service.py`                                                   | FastAPI **mock** AI (random) — **không** thay `ai-service/` ở root repo.      |
| `test_auth_system.py`                                             | Test hệ auth (Sheets).                                                        |
| `test_sheets_connection.py`                                       | Test credential + API Google.                                                 |
| `verify_authentication_and_user.py`                               | Kiểm tra user/auth end-to-end (theo logic file).                              |
| `tests/quick_test.py`, `quick_test_advanced.py`, `test_health.py` | Test nhanh / health.                                                          |

### 5.7 `utils/`

| File        | Nhiệm vụ                                   |
| ----------- | ------------------------------------------ |
| `logger.py` | `setup_logger` dùng cho FastAPI `main.py`. |

---

## 6. Import `google_sheets_config` (quan trọng)

Nhiều script gốc dùng:

```python
from google_sheets_config import GoogleSheetsConfigService
```

Python chỉ tìm thấy nếu:

- Có file **`google_sheets_config.py` ngay cwd**, hoặc
- **`PYTHONPATH`** gồm `automation/modules` (hoặc `automation/scripts` nếu dùng bản đó).

**Khuyến nghị khi chạy tay:**

```bash
cd automation
source venv/bin/activate
export PYTHONPATH="${PYTHONPATH}:$(pwd)/modules"
python generate_summary.py
```

Khi **sửa logic Sheets**, thống nhất sửa **`modules/google_sheets_config.py`**, rồi đồng bộ hoặc xoá bản trùng trong `scripts/` để tránh hai hành vi khác nhau.

---

## 7. Cập nhật / bảo trì thường gặp

| Nhu cầu                        | Làm gì                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ONE đổi giao diện              | Chạy `ui_debug_inspector.py`, cập nhật selector trong `scripts/login.py`, `enhanced_scraper.py`, `pagination_handler.py`.                                        |
| Đổi khoảng ngày mặc định       | `date_customizer.py` + chỗ gọi trong `one_automation.py` / `june_fresh_*.py`.                                                                                    |
| Đổi SLA                        | `config/sla_config.json` và/hoặc tab trên Sheet (nếu đồng bộ qua `GoogleSheetsConfigService`).                                                                   |
| Đổi spreadsheet / credential   | `.env`, `config/config.json`, constructor `GoogleSheetsConfigService` (spreadsheet id mặc định trong code).                                                      |
| Thêm cột export                | Luồng pandas/CSV trong `automation.py` / `dashboard_integration.py` / scraper.                                                                                   |
| Tích hợp React dashboard chính | Dữ liệu nên vào **một spreadsheet** đã cấu hình cho **backend Node** (`REACT_APP_*`) — xem [AI_AUTOMATION_SHEETS_PIPELINE.md](AI_AUTOMATION_SHEETS_PIPELINE.md). |

---

## 8. Tài liệu khác trong `automation/`

- `GOOGLE_SHEETS_SETUP_GUIDE.md` — setup Sheets.
- `COBYQA_EXPLANATION.md`, `COBYQA_MIGRATION_PLAN.md` — tối ưu (liên quan nhánh optimization).
- `docs/README.md` — mô tả ERP rộng (một phần trùng với repo tổng).

---

## 9. Tóm tắt một dòng

**Một lệnh cài + seed:** `cd automation && ./setup-and-seed.sh`
**Chạy scrape:** `python automation.py` hoặc `python one_automation.py`.
**Sheets / báo cáo:** `modules/google_sheets_config.py` + `generate_summary.py`.
**Cập nhật:** selector trong `scripts/`, SLA trong `config/`, trùng lặp `google_sheets_config` gom về **`modules/`**.

---

_Cập nhật: theo cấu trúc `automation/` trong repo oas-integration — nếu thêm/xoá file, bổ sung hàng vào mục 5._
