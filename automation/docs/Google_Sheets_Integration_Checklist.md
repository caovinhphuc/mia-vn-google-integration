# 🔍 OneAutomationSystem — Google Sheets Integration Checklist

## 📋 Tổng quan

Checklist kiểm tra tích hợp Google Sheets / Drive cho **automation/** (Python) và **one_automation_system/** (API port 8001 khi chạy `start.sh` từ root repo).

### 📦 Gói Python (automation)

Cài trong thư mục `automation/` (khuyến nghị `venv`):

| Gói                        | Mục đích                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| `gspread`                  | Client Sheets (read/write worksheet)                                |
| `google-auth`              | Service account credentials                                         |
| `google-api-python-client` | Discovery API (Sheets REST, Drive v3 trong `one_automation_system`) |

File tham chiếu: `automation/requirements-basic.txt` hoặc `automation/requirements.txt` (tùy môi trường bạn dùng).

**Kiểm tra nhanh** (sau `source venv/bin/activate`):

```bash
python3 -c "import gspread, google.auth, googleapiclient; print('OK')"
```

### 🔑 Service account JSON — một trong các cách (ưu tiên từ trên xuống)

Code Python (`automation/google_sheets_config.py`) và API `one_automation_system` (`utils/google_credentials.py`) **tự resolve** đường dẫn hợp lệ (`type: service_account` + có `client_email`):

1. `GOOGLE_CREDENTIALS_PATH` (legacy / one_automation)
2. `GOOGLE_SERVICE_ACCOUNT_FILE`
3. `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`
4. `GOOGLE_APPLICATION_CREDENTIALS`
5. `~/.secrets/google/service_account.json` | `service_key.json` | `service_key`
6. Mọi `~/.secrets/google/*.json` (ưu tiên file sửa gần nhất)
7. `automation/config/service_account.json`

**Không bắt buộc** copy JSON vào `config/` nếu bạn đã đặt key ở `~/.secrets/google/` hoặc trỏ biến môi trường trong `automation/.env`.

Trong **`automation/.env`** nên có ít nhất: `GOOGLE_SHEET_ID`, và một trong các biến đường dẫn key ở trên (hoặc chỉ dùng `~/.secrets/`).

**Lưu ý:** Email service account có dạng `...@PROJECT_ID.iam.gserviceaccount.com` — cần **Share** spreadsheet với email đó (Editor).

---

## ✅ Pre-deployment Checklist

### 1. 🔐 Google Cloud & Sheets

- [ ] Google Cloud Project đã tạo
- [ ] **Google Sheets API** đã bật
- [ ] **Google Drive API** đã bật (khuyến nghị nếu dùng Drive / `one_automation_system` khởi tạo Drive v3)
- [ ] Service Account đã tạo, JSON key đã tải về (tên GCP thường dạng `*-*.json`)
- [ ] Key đặt tại một trong: `automation/config/service_account.json`, hoặc `~/.secrets/google/`, hoặc path khai báo trong `.env`
- [ ] Sheet đã share **Editor** cho `client_email` trong JSON
- [ ] `GOOGLE_SHEET_ID` (hoặc `GOOGLE_SHEETS_ID` / `SPREADSHEET_ID` ở một số script) khớp ID trên URL Sheets

### 2. 📁 Cấu trúc & môi trường (`automation/`)

- [ ] Thư mục `automation/config/` tồn tại (hoặc chỉ dùng key ngoài repo)
- [ ] File **`automation/.env`** đã cấu hình (có thể copy cấu trúc từ `automation/.env.example` ở root repo — đừng commit secret)
- [ ] Biến **đăng nhập web ONE** nếu chạy Selenium: `ONE_USERNAME`, `ONE_PASSWORD` trong `automation/.env`
- [ ] **Telegram** (tuỳ chọn): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — API `one_automation_system` log + `/health` có trường `telegram_configured`
- [ ] `chmod 600` cho mọi file JSON key bạn giữ trong repo (nếu có)
- [ ] `python3 -m venv venv` trong `automation/` và `pip install -r requirements.txt` (hoặc `requirements-basic.txt`)

### 3. 🐳 Docker Setup (Optional)

- [ ] Docker và Docker Compose đã được cài đặt
- [ ] Network `oneautomation` đã được tạo: `docker network create oneautomation`
- [ ] Ports 3000, 3001, 8000 không bị conflict
- [ ] Sufficient disk space cho containers và volumes

### 4. 📊 Data Preparation

- [ ] Google Sheet có ít nhất 1 sheet (tên bất kỳ)
- [ ] Headers đã được set ở row 1 (nếu cần)
- [ ] Có ít nhất 2-3 rows dữ liệu sample để test (optional)
- [ ] Sheet có cấu trúc dữ liệu nhất quán

---

## 🧪 Testing Checklist

### 1. 🔧 Environment Test

Chạy từ **`automation/`** (`cd automation`), đã `source venv/bin/activate` nếu dùng venv.

```bash
# Test 1: File env + config (key có thể chỉ nằm ngoài repo)
ls -la .env
ls -la config/service_account.json 2>/dev/null || true

# Test 2: Đường dẫn key mà code sẽ dùng (resolve + dotenv)
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'))
from google_sheets_config import resolve_service_account_credentials_path
p = resolve_service_account_credentials_path()
print('Resolved key:', p or '(none)')
"

# Test 3: GOOGLE_SHEET_ID
python3 -c 'import os; from dotenv import load_dotenv; load_dotenv(); print("OK sheet" if os.getenv("GOOGLE_SHEET_ID") else "MISSING GOOGLE_SHEET_ID")'
```

### 2. 🐍 Python — Sheets config & kết nối

```bash
source venv/bin/activate
pip install -r requirements.txt   # hoặc requirements-basic.txt

# Kiểm tra kết nối (đọc .env + resolve key)
python3 test_sheets_connection.py

# Kiểm tra nhanh GoogleSheetsConfigService (gspread)
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'))
from google_sheets_config import GoogleSheetsConfigService
s = GoogleSheetsConfigService()
print('Client OK' if s.client else 'Client FAIL')
print('Spreadsheet:', s.spreadsheet_id)
"

# Verify Sheets (wrapper gọi modules/verify_sheets.py)
python3 verify_sheets.py
```

### 3. 🌐 Node.js API Test (Nếu có Backend API)

```bash
# Test 1: Dependencies
npm install

# Test 2: Start API (nếu có)
npm start &
# Hoặc
cd backend && npm start &

# Test 3: Health check
curl http://localhost:3001/health

# Test 4: API endpoints (nếu có)
curl http://localhost:3001/api/sheets/info
curl http://localhost:3001/api/sheets/data
```

### 4. ⚛️ React Frontend Test (Nếu có Frontend)

```bash
# Test 1: Dependencies (in root folder)
npm install

# Test 2: Environment
echo "REACT_APP_API_URL=http://localhost:3001" > .env.local

# Test 3: Start frontend
npm start

# Test 4: Access dashboard
# Open: http://localhost:3000
```

### 5. 🐳 Docker Integration Test (Nếu dùng Docker)

```bash
# Test 1: Build images
docker-compose build

# Test 2: Start services
docker-compose up -d

# Test 3: Check containers
docker-compose ps

# Test 4: Check logs
docker-compose logs sheets-api
docker-compose logs sheets-python

# Test 5: Health checks
curl http://localhost:3001/health
curl http://localhost:3000 # Should show React app
```

### 6. 🔍 Health check (shell)

Script: **`automation/scripts/health-check.sh`**

- Tự `cd` vào `automation/` (có thể gọi từ bất kỳ đâu: `bash automation/scripts/health-check.sh`).
- Dùng Python từ **`venv`** nếu có (`automation/venv`, `.venv`, hoặc `$VIRTUAL_ENV`).
- Dòng **Service account JSON** lấy từ cùng logic **`resolve_service_account_credentials_path()`** như Python (không còn chỉ báo `config/service_account.json` khi key nằm ở `~/.secrets/`).

```bash
bash automation/scripts/health-check.sh
# hoặc
cd automation && bash scripts/health-check.sh
```

### 7. 🤖 API `one_automation_system` (port 8001)

Khi chạy **`./start.sh`** từ root, `scripts/start-stop/start-all.sh` sẽ **`source ../automation/.env`** trước khi khởi chạy uvicorn — biến Google/Telegram khớp `automation/.env`.

- `GET http://localhost:8001/health` — có `google_sheets`, **`google_drive`**, **`telegram_configured`**, `email`, …
- Log: `logs/automation.log` (xem dòng khởi tạo Sheets / Drive / Telegram).

---

## 🚨 Common Issues & Solutions

### Issue 0: Tab `Automation_Logs` — `get_all_records` duplicate header `''`

Nếu dòng 1 có nhiều cột trống (Sheets pad thêm cột), `gspread` báo duplicate `''`. Code đã dùng `expected_headers` + fallback đọc theo cột trong `automation/google_sheets_config.py` (`get_automation_history`). Trên sheet: cố gắng giữ tên cột duy nhất ở hàng 1.

### Issue 1: Authentication Failed

**Symptoms:**

- ❌ "Permission denied" errors
- ❌ "Service account not found"
- ❌ HTTP 403 errors
- ❌ "Unable to parse credentials"

**Solutions:**

```bash
# Check 1: client_email từ file key đang được resolve (chạy trong thư mục automation/)
cd automation
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'))
from google_sheets_config import resolve_service_account_credentials_path
import json
p = resolve_service_account_credentials_path()
assert p, 'No credentials path resolved'
print(json.load(open(p))['client_email'])
"

# Check 2: Verify sheet sharing
# Go to Google Sheet → Share → Check service account email is listed with Editor permission

# Check 3: Re-download credentials
# Go to Google Cloud Console → IAM & Admin → Service Accounts → Keys → Create new key → Download JSON

# Check 4: Verify sheet ID format
echo $GOOGLE_SHEET_ID
# Should be: Long alphanumeric string like "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As"

# Check 5: File key sau resolve
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'))
from google_sheets_config import resolve_service_account_credentials_path
print(resolve_service_account_credentials_path())
"
```

### Issue 2: API Connection Failed

**Symptoms:**

- ❌ "Connection refused" errors
- ❌ Frontend can't fetch data
- ❌ CORS errors
- ❌ Network timeout

**Solutions:**

```bash
# Check 1: API server running
ps aux | grep node
netstat -tlnp | grep 3001

# Check 2: Firewall
# macOS/Linux
sudo ufw allow 3001
# Or disable firewall for testing (development only)

# Check 3: CORS settings
# Check backend CORS configuration in server.js
# Should allow your frontend origin

# Check 4: API base URL
echo $REACT_APP_API_URL
# Should be: http://localhost:3001 or your server URL

# Check 5: Test API directly
curl -v http://localhost:3001/health
```

### Issue 3: Empty Dashboard / No Data

**Symptoms:**

- ❌ Dashboard loads but shows no data
- ❌ Charts are empty
- ❌ "No data available" message
- ❌ API returns empty arrays

**Solutions:**

```bash
# Check 1: Sheet có dữ liệu (gspread / GoogleSheetsConfigService)
python3 -c "
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'))
from google_sheets_config import GoogleSheetsConfigService
import os
sid = os.getenv('GOOGLE_SHEET_ID')
s = GoogleSheetsConfigService(spreadsheet_id=sid)
ws = s.spreadsheet.sheet1
rows = ws.get('A1:Z10')
print('Rows:', len(rows or []))
print((rows or [])[:3])
"

# Check 2: Add sample data manually in Google Sheets
# Or use API to append data

# Check 3: Check API response
curl http://localhost:3001/api/sheets/data | jq .

# Check 4: Frontend API calls
# Open browser dev tools → Network tab → Check API calls and responses
```

### Issue 4: Python Module Not Found

**Symptoms:**

- ❌ `ModuleNotFoundError: No module named 'gspread'`
- ❌ `ModuleNotFoundError: No module named 'google.auth'`
- ❌ Import errors

**Solutions:**

```bash
# Check 1: Virtual environment activated
which python3
source venv/bin/activate  # If using venv

# Check 2: Install dependencies (requirements-basic đã bao gồm gspread, google-auth)
pip install -r requirements-basic.txt

# Check 3: Verify installation
python3 -c "import gspread, google.auth; print('✅ OK')"

# Check 4: Reinstall if needed
pip install --upgrade gspread google-auth google-api-python-client
```

### Issue 5: Docker Container Issues

**Symptoms:**

- ❌ Containers keep restarting
- ❌ "No such file or directory" errors
- ❌ Container health check failing
- ❌ Permission denied errors

**Solutions:**

```bash
# Check 1: Container logs
docker-compose logs -f sheets-api
docker-compose logs -f sheets-python

# Check 2: File permissions (before building)
chmod 600 config/service_account.json
chmod +x scripts/health-check.sh scripts/quick-start.sh

# Check 3: Volume mounts
docker-compose exec sheets-api ls -la /app/config/
docker-compose exec sheets-python ls -la /app/config/

# Check 4: Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check 5: Health check
docker-compose exec sheets-api curl http://localhost:3001/health
```

### Issue 6: Biến môi trường / đường dẫn key

**Triệu chứng:** thiếu `GOOGLE_SHEET_ID`, không tìm thấy key, hoặc health-check báo sai file.

**Gợi ý:**

```bash
cd automation
ls -la .env

# Bash (lưu ý: source .env có thể lỗi nếu giá trị có ký tự đặc biệt — ưu tiên dotenv trong Python)
set -a; [ -f .env ] && . ./.env; set +a
echo "GOOGLE_SHEET_ID=$GOOGLE_SHEET_ID"
echo "GOOGLE_SERVICE_ACCOUNT_FILE=$GOOGLE_SERVICE_ACCOUNT_FILE"
echo "GOOGLE_SERVICE_ACCOUNT_KEY_PATH=$GOOGLE_SERVICE_ACCOUNT_KEY_PATH"

python3 -c "
from pathlib import Path
from dotenv import load_dotenv
import os
load_dotenv(Path('.env'))
print('GOOGLE_SHEET_ID:', os.getenv('GOOGLE_SHEET_ID'))
from google_sheets_config import resolve_service_account_credentials_path
print('Resolved JSON:', resolve_service_account_credentials_path())
"
```

**one_automation_system:** cần env được load — `scripts/start-stop/start-all.sh` đã `source ../automation/.env` trước uvicorn; `one_automation_system/main.py` cũng gọi `load_dotenv` tới `automation/.env`.

### Issue 7: Performance Issues

**Symptoms:**

- ❌ Slow API responses
- ❌ Dashboard takes long to load
- ❌ Google Sheets API quota exceeded
- ❌ Timeout errors

**Solutions:**

```bash
# Check 1: API quota usage
# Go to Google Cloud Console → APIs & Services → Quotas → Google Sheets API

# Check 2: Enable caching (if implemented)
# Add Redis container to docker-compose.yml

# Check 3: Optimize batch requests
# Use batch-get API instead of multiple single requests

# Check 4: Check system resources
docker stats  # If using Docker
df -h  # Disk space
free -m  # Memory (Linux)
top  # CPU and memory usage
```

---

## 📋 Production Deployment Checklist

### 1. 🔒 Security

- [ ] Environment variables stored securely (not in code)
- [ ] Credentials file permissions set to 600
- [ ] API rate limiting implemented
- [ ] HTTPS enabled with valid SSL certificates
- [ ] Firewall rules configured properly
- [ ] Security headers added to server config
- [ ] Service account has minimal required permissions
- [ ] Credentials file is in .gitignore

### 2. 🚀 Performance

- [ ] Redis caching enabled (if applicable)
- [ ] Database connection pooling configured (if applicable)
- [ ] Static files served via CDN (if applicable)
- [ ] Gzip compression enabled
- [ ] API response caching implemented
- [ ] Database queries optimized (if applicable)
- [ ] Image optimization (if applicable)

### 3. 📊 Monitoring

- [ ] Health check endpoints working
- [ ] Logging configured (Winston for Node.js, Python logging)
- [ ] Metrics collection setup (Prometheus/Grafana) - Optional
- [ ] Error tracking (Sentry) - Optional
- [ ] Uptime monitoring (UptimeRobot) - Optional
- [ ] API monitoring (Postman monitors) - Optional
- [ ] Log rotation configured

### 4. 🔄 Backup & Recovery

- [ ] Google Sheets data backup strategy
- [ ] Database backup (if applicable)
- [ ] Container data volumes backup (if using Docker)
- [ ] Disaster recovery plan documented
- [ ] Backup restoration tested
- [ ] Automated backup scripts (if applicable)

### 5. 🌐 Domain & DNS

- [ ] Domain configured (if applicable)
- [ ] DNS records setup (A, CNAME) - Optional
- [ ] SSL certificate installed (if applicable)
- [ ] Redirect HTTP to HTTPS (if applicable)
- [ ] Subdomain for API configured (if applicable)

---

## 🎯 Success Criteria

### ✅ System is working correctly when

1. **Backend** (nếu chạy) `GET /health` — ví dụ:

   ```bash
   curl -s http://localhost:3001/health
   ```

2. **Automation API** (port 8001) có Sheets + Drive + Telegram trong JSON health:

   ```bash
   curl -s http://localhost:8001/health
   ```

3. **Sheet connection** — trong `automation/`:

   ```bash
   cd automation && source venv/bin/activate
   python3 test_sheets_connection.py
   ```

4. **Đọc thử một range** (đổi tên sheet/range cho đúng file của bạn):

   ```bash
   cd automation && source venv/bin/activate
   python3 -c "
   from pathlib import Path
   from dotenv import load_dotenv
   import os
   load_dotenv(Path('.env'))
   from google_sheets_config import GoogleSheetsConfigService
   s = GoogleSheetsConfigService(spreadsheet_id=os.getenv('GOOGLE_SHEET_ID'))
   print(s.spreadsheet.sheet1.get('A1:E5'))
   "
   ```

5. **Health check shell** — pass cao (resolve key hiển thị đúng path):

   ```bash
   bash automation/scripts/health-check.sh
   ```

6. **Docker** (nếu dùng): `docker-compose ps`

7. **Log automation** (từ root repo):

   ```bash
   tail -f logs/automation.log
   ```

8. **Performance** API tùy endpoint bạn có — ví dụ đo thời gian:

   ```bash
   time curl -s http://localhost:3001/health >/dev/null
   ```

---

## 🔧 Quick Setup Guide

### Option 1: Automated Setup (Recommended)

```bash
# 1. Navigate to automation directory
cd automation

# 2. Run quick start script
bash scripts/quick-start.sh

# 3. Follow prompts to configure
#    - Create .env file
#    - Add credentials
#    - Test connection
```

### Option 2: Manual Setup

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env  # If exists
# Edit .env with your configuration

# 4. Add credentials
mkdir -p config
# Copy service_account.json to config/

# 5. Test connection
python3 test_sheets_connection.py

# 6. Run health check
bash scripts/health-check.sh
```

---

## 📞 Support & Troubleshooting

### 🔧 Lệnh debug nhanh

```bash
# Health (từ bất kỳ đâu, cwd được script set về automation/)
bash automation/scripts/health-check.sh

cd automation
source venv/bin/activate
python3 test_sheets_connection.py
python3 inspect_sheets_data.py

env | grep GOOGLE
python3 -c "import gspread, google.auth, googleapiclient; print('deps OK')"
ls -la config/service_account.json 2>/dev/null || true

# Log API automation (khi start từ root)
tail -f ../logs/automation.log
```

### 📧 Tài liệu trong repo

- `automation/GOOGLE_SHEETS_SETUP_GUIDE.md` — hướng dẫn Sheets + env
- `automation/scripts/README.md` — `health-check.sh`, `quick-start.sh`
- `automation/INTEGRATIONS_SETUP.md` — Telegram / Email / SMTP
- `automation/google_sheets_config.py` — `resolve_service_account_credentials_path`, `get_automation_history` (`expected_headers` cho tab logs)

---

## 📚 Related Documentation

- `automation/GOOGLE_SHEETS_SETUP_GUIDE.md` — setup Sheets + env
- `automation/scripts/README.md` — `health-check.sh`, `quick-start.sh`
- `automation/INTEGRATIONS_SETUP.md` — Telegram, email, SMTP
- `HEALTH_CHECK_GUIDE.md` (root) — health tổng quan repo (nếu có)

---

## ✅ Checklist Summary

| Nhóm            | Nội dung chính                                                                 |
| --------------- | ------------------------------------------------------------------------------ |
| Pre-deployment  | GCP APIs, key JSON (đa nguồn), share sheet, `.env`                             |
| Testing         | `test_sheets_connection`, `verify_sheets`, `inspect_sheets_data`, health-check |
| Troubleshooting | Auth, API, env, Docker (tuỳ dùng)                                              |
| Production      | Bảo mật, log, backup                                                           |
| Success         | `curl` health backend + automation, script shell, log                          |

---

**Last updated:** 2026-04-22  
**Version:** 3.0 — đồng bộ resolve credentials, `health-check.sh`, `one_automation_system` + `automation/.env`.
