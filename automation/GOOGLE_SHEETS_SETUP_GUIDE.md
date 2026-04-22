# Google Sheets Integration — Setup Guide

Hướng dẫn triển khai trong **`automation/`** (Python + `automation/.env`). JSON service account có thể nằm **ngoài repo** (`~/.secrets/google/…`). Logic resolve dùng chung:

- **`automation/google_sheets_config.py`** — script automation / gspread
- **`one_automation_system/utils/google_credentials.py`** — API FastAPI port **8001** (khi chạy `./start.sh` từ root)

## Quick Start

### Cách 1: Script (khuyến nghị)

```bash
cd automation
bash scripts/quick-start.sh
```

### Cách 2: Thủ công

Làm theo các bước bên dưới (luôn `cd automation` trước khi chạy `python` / `pip` trừ khi ghi rõ khác).

## 🔐 Step 1: Google Sheets API Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project hoặc select existing project
3. Note project ID

### 1.2 Enable APIs

1. Go to **APIs & Services** → **Library**
2. Enable:
   - ✅ **Google Sheets API**
   - ✅ **Google Drive API** (khuyến nghị nếu dùng Drive hoặc `one_automation_system` khởi tạo Drive v3)

### 1.3 Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - Name: `one-automation-service`
   - Description: `Service account for OneAutomationSystem`
4. Click **Create and Continue**
5. Skip role assignment (optional)
6. Click **Done**

### 1.4 Create Service Account Key

1. Click on service account name
2. Go to **Keys** tab
3. **Add Key** → **Create new key** → **JSON**
4. File tải về thường có tên dạng `project-id-xxxxx.json`

**Lưu key (chọn một):**

- **A — Trong repo:** `automation/config/service_account.json` (nhớ `chmod 600`, không commit lên Git).
- **B — Ngoài repo (khuyến nghị):** ví dụ `~/.secrets/google/project-id-xxxxx.json` (tạo thư mục `~/.secrets/google/` nếu chưa có).

Code sẽ tìm file hợp lệ (`type: service_account` + có `client_email`) theo thứ tự trong `resolve_service_account_credentials_path()`:

`GOOGLE_CREDENTIALS_PATH` → `GOOGLE_SERVICE_ACCOUNT_FILE` → `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` → `GOOGLE_APPLICATION_CREDENTIALS` → `~/.secrets/google/` (tên cố định + mọi `*.json`) → `config/service_account.json`.

### 1.5 Share Google Sheet

1. Open your Google Sheet
2. Click **Share** button
3. Add service account email (from JSON file: `client_email` field)
4. Give **Editor** permission
5. Click **Done**

### 1.6 Get Sheet ID

From Google Sheet URL:

```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

Copy `SHEET_ID_HERE` part.

## 📁 Step 2: Project Structure

### 2.1 Create Directories

```bash
mkdir -p config
mkdir -p scripts
mkdir -p logs
mkdir -p services
mkdir -p modules
```

### 2.2 Đặt file JSON key

**Trong repo:**

```bash
cp ~/Downloads/your-project-xxxxx.json config/service_account.json
chmod 600 config/service_account.json
```

**Hoặc ngoài repo** (ví dụ):

```bash
mkdir -p ~/.secrets/google
mv ~/Downloads/your-project-xxxxx.json ~/.secrets/google/
chmod 600 ~/.secrets/google/your-project-xxxxx.json
```

Sau đó trong `.env` trỏ đường dẫn tuyệt đối (xem mục 2.3).

### 2.3 File `.env` (`automation/.env`)

```bash
cd automation
# Tham chiếu biến: .env.example ở root repo hoặc mẫu trong automation/.env.production.template
nano .env
```

**Tối thiểu cho Sheets:**

```env
GOOGLE_SHEET_ID=your_sheet_id_from_url
```

**Một trong các dòng sau** (nếu key không nằm ở `config/service_account.json`):

```env
GOOGLE_SERVICE_ACCOUNT_FILE=/absolute/path/to/key.json
# hoặc
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/key.json
```

**Đăng nhập web ONE** (Selenium): `ONE_USERNAME`, `ONE_PASSWORD`. **Telegram** (tuỳ chọn): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Chi tiết: `INTEGRATIONS_SETUP.md`.

**Chạy API từ root** (`./start.sh`): `scripts/start-stop/start-all.sh` sẽ `source ../automation/.env` cho process port **8001** — giữ cấu hình Google trong `automation/.env` là đủ.

## 🐍 Step 3: Python Setup

### 3.1 Create Virtual Environment

```bash
cd automation
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3.2 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Gói chính: `gspread`, `google-auth`, `google-api-python-client`, `pandas`, `python-dotenv` (xem `requirements.txt` hoặc `requirements-basic.txt`).

## Step 4: Kiểm thử

### 4.1 `test_sheets_connection.py`

```bash
cd automation
source venv/bin/activate   # nếu dùng venv
python3 test_sheets_connection.py
```

Script dùng `load_dotenv(.env)` và **`resolve_service_account_credentials_path()`** — không bắt buộc chỉ `config/service_account.json`. Kỳ vọng: in được đường dẫn key đã resolve + kết nối Sheets OK.

### 4.2 `health-check.sh`

```bash
bash automation/scripts/health-check.sh
# hoặc
cd automation && bash scripts/health-check.sh
```

Script tự `cd` vào `automation/`, dùng Python từ **venv** nếu có, và in dòng **Service account JSON:** với path thật (resolve), không chỉ báo mặc định `config/` khi key nằm ở `~/.secrets/`.

### 4.3 `verify_sheets.py`

```bash
cd automation
python3 verify_sheets.py
```

File này là **wrapper** gọi `modules/verify_sheets.py` (tránh lỗi “no such file” khi chỉ có bản trong `modules/`).

## 📊 Step 5: Prepare Google Sheet

### 5.1 Create Data Sheet

1. Open Google Sheet
2. Create sheet named **"Data"** (or use existing)
3. Add headers in row 1:
   - Date, Product, Sales, Revenue, Region, Status
4. Add 2-3 sample rows

### 5.2 Đọc thử (gspread / `GoogleSheetsConfigService`)

Đổi `Sheet1` / range cho đúng file của bạn.

```bash
cd automation
source venv/bin/activate
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
import os
load_dotenv(Path('.env'))
from google_sheets_config import GoogleSheetsConfigService
s = GoogleSheetsConfigService(spreadsheet_id=os.getenv('GOOGLE_SHEET_ID'))
print(s.spreadsheet.sheet1.get('A1:E10'))
"
```

## Step 6: Checklist nhanh

```bash
cd automation
ls -la .env
ls -la config/service_account.json 2>/dev/null || true

python3 -c "
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'))
from google_sheets_config import resolve_service_account_credentials_path
print('Resolved key:', resolve_service_account_credentials_path())
"

python3 -c "import gspread, google.auth, googleapiclient; print('deps OK')"
python3 test_sheets_connection.py
bash scripts/health-check.sh
```

## Common Issues

### Authentication / 403

- Share Sheet với đúng **`client_email`** trong JSON key.
- In email đang dùng:

```bash
cd automation
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
import json
load_dotenv(Path('.env'))
from google_sheets_config import resolve_service_account_credentials_path
p = resolve_service_account_credentials_path()
print('Key file:', p)
print('client_email:', json.load(open(p))['client_email'])
"
```

### Module Not Found

```bash
cd automation && source venv/bin/activate
pip install -r requirements.txt
```

### JSON key không hợp lệ

```bash
cd automation
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
import json
load_dotenv(Path('.env'))
from google_sheets_config import resolve_service_account_credentials_path
p = resolve_service_account_credentials_path()
json.load(open(p))
print('OK', p)
"
```

### Tab `Automation_Logs` — duplicate header rỗng

Dòng 1 có nhiều cột trống → `get_all_records` lỗi; code đã xử lý bằng `expected_headers` trong `google_sheets_config.py`. Trên sheet: giữ tên cột duy nhất hàng 1.

## Next Steps

- `docs/Google_Sheets_Integration_Checklist.md` — checklist (trong `automation/docs/`).
- `INTEGRATIONS_SETUP.md` — Telegram, email, SMTP (cùng thư mục `automation/`).
- `inspect_sheets_data.py` — xem config / SLA / history trên terminal.

## Related Files

(Đường dẫn tương đối từ thư mục **`automation/`.**)

| File                                                   | Vai trò                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `google_sheets_config.py`                              | Resolve key, `GoogleSheetsConfigService`, tab `Automation_Logs` |
| `scripts/health-check.sh`                              | Health + in path key đã resolve                                 |
| `test_sheets_connection.py`                            | Test kết nối + env                                              |
| `verify_sheets.py`                                     | Wrapper → `modules/verify_sheets.py`                            |
| `services/google_sheets_service.py`                    | Client Sheets REST (khác `GoogleSheetsConfigService`)           |
| `../one_automation_system/utils/google_credentials.py` | Resolve key cho API port 8001                                   |

## Support

1. `docs/Google_Sheets_Integration_Checklist.md` — troubleshooting.
2. `bash automation/scripts/health-check.sh` (hoặc trong `cd automation`).
3. Log: `logs/` từ root repo khi chạy stack đầy đủ.

---

**Last updated:** 2026-04-22
