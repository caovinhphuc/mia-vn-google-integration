# 🔍 OneAutomationSystem - Google Sheets Integration Checklist

## 📋 Tổng Quan

Checklist này giúp bạn kiểm tra và triển khai Google Sheets Integration cho OneAutomationSystem một cách đầy đủ và chính xác.

### 📦 Gói Python cơ bản (bắt buộc)

Các gói sau đã nằm trong `requirements-basic.txt` — được cài khi chạy `./setup.sh` hoặc `./setup-and-seed.sh`:

| Gói                        | Mục đích                          |
| -------------------------- | --------------------------------- |
| `gspread`                  | Google Sheets API client          |
| `google-auth`              | Xác thực Google (service account) |
| `google-api-python-client` | Google APIs nền tảng              |

**Kiểm tra nhanh:**

```bash
python3 -c "import gspread, google.auth; print('✅ OK')"
```

---

## ✅ Pre-deployment Checklist

### 1. 🔐 Google Sheets API Setup

- [ ] Google Cloud Project đã tạo
- [ ] Google Sheets API đã được bật
- [ ] Google Drive API đã được bật (optional, để access files)
- [ ] Service Account đã tạo với đúng permissions
- [ ] JSON credentials file đã download
- [ ] JSON file đã được lưu vào `config/service_account.json`
- [ ] Google Sheet đã được chia sẻ với service account email (Editor permission)
- [ ] Sheet ID đã được copy chính xác từ URL

**Lưu ý:** Service account email có dạng: `your-service@project-id.iam.gserviceaccount.com`

### 2. 📁 Project Structure

- [ ] Tất cả files code đã được copy vào project
- [ ] Thư mục `config/` đã tồn tại
- [ ] File `.env` đã được tạo từ `.env.example` (nếu có)
- [ ] Tất cả environment variables đã được điền đầy đủ
- [ ] Permissions của credentials file đã được set đúng (`chmod 600 config/service_account.json`)
- [ ] Virtual environment đã được tạo (nếu dùng Python venv)

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

```bash
# Test 1: Check files exist
ls -la config/service_account.json
ls -la .env

# Test 2: Validate JSON credentials
python3 -c "import json; json.load(open('config/service_account.json')); print('✅ Valid JSON')"

# Test 3: Check environment variables
python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✅ SHEET_ID found' if os.getenv('GOOGLE_SHEET_ID') else '❌ SHEET_ID missing')"
```

### 2. 🐍 Python Service Test

```bash
# Test 1: Dependencies
pip install -r requirements.txt
# Hoặc với virtual environment
source venv/bin/activate
pip install -r requirements.txt

# Test 2: Connection test (sử dụng script đã tạo)
python3 test_sheets_connection.py

# Test 3: Manual service test
python3 -c "
from services.google_sheets_service import GoogleSheetsService
import os
from dotenv import load_dotenv

load_dotenv()
gs = GoogleSheetsService(
    service_account_file=os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE', 'config/service_account.json'),
    sheet_id=os.getenv('GOOGLE_SHEET_ID')
)
info = gs.get_sheet_info()
print('✅ Service OK' if info else '❌ Service Error')
"
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

### 6. 🔍 Automated Health Check

```bash
# Sử dụng script health check đã tạo
bash scripts/health-check.sh

# Hoặc từ automation directory
cd automation
bash scripts/health-check.sh
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Authentication Failed

**Symptoms:**

- ❌ "Permission denied" errors
- ❌ "Service account not found"
- ❌ HTTP 403 errors
- ❌ "Unable to parse credentials"

**Solutions:**

```bash
# Check 1: Verify service account email
python3 -c "import json; print(json.load(open('config/service_account.json'))['client_email'])"

# Check 2: Verify sheet sharing
# Go to Google Sheet → Share → Check service account email is listed with Editor permission

# Check 3: Re-download credentials
# Go to Google Cloud Console → IAM & Admin → Service Accounts → Keys → Create new key → Download JSON

# Check 4: Verify sheet ID format
echo $GOOGLE_SHEET_ID
# Should be: Long alphanumeric string like "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As"

# Check 5: Verify JSON file path
ls -la config/service_account.json
# File should exist and be readable
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
# Check 1: Sheet has data
python3 -c "
from services.google_sheets_service import GoogleSheetsService
import os
from dotenv import load_dotenv

load_dotenv()
gs = GoogleSheetsService(
    service_account_file=os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE', 'config/service_account.json'),
    sheet_id=os.getenv('GOOGLE_SHEET_ID')
)
data = gs.read_data('Sheet1!A1:Z10')
print(f'Rows read: {len(data)}')
print(data[:3] if data else 'No data')
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

### Issue 6: Environment Variables Not Found

**Symptoms:**

- ❌ `GOOGLE_SHEET_ID` not found
- ❌ `GOOGLE_SERVICE_ACCOUNT_FILE` not found
- ❌ Empty environment variables

**Solutions:**

```bash
# Check 1: .env file exists
ls -la .env

# Check 2: Load and verify variables
source .env
echo "GOOGLE_SHEET_ID: $GOOGLE_SHEET_ID"
echo "GOOGLE_SERVICE_ACCOUNT_FILE: $GOOGLE_SERVICE_ACCOUNT_FILE"

# Check 3: Use python-dotenv
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('GOOGLE_SHEET_ID:', os.getenv('GOOGLE_SHEET_ID'))
print('GOOGLE_SERVICE_ACCOUNT_FILE:', os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE'))
"
```

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

1. **Health Check** returns 200 OK

   ```bash
   curl http://localhost:3001/health
   ```

2. **Sheet Connection Test** passes

   ```bash
   python3 test_sheets_connection.py
   ```

3. **Data Read** returns data from Google Sheets

   ```bash
   python3 -c "
   from services.google_sheets_service import GoogleSheetsService
   import os
   from dotenv import load_dotenv
   load_dotenv()
   gs = GoogleSheetsService(
       service_account_file=os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE', 'config/service_account.json'),
       sheet_id=os.getenv('GOOGLE_SHEET_ID')
   )
   data = gs.read_data('Sheet1!A1:Z100')
   print(f'✅ Read {len(data)} rows')
   "
   ```

4. **Health Check Script** shows 100% success

   ```bash
   bash scripts/health-check.sh
   ```

5. **All Docker containers** are running and healthy (if using Docker)

   ```bash
   docker-compose ps
   ```

6. **Logs** show no critical errors

   ```bash
   tail -f logs/automation.log  # Check for errors
   ```

7. **Performance** is acceptable (< 2s API response time)

   ```bash
   time curl http://localhost:3001/api/sheets/data
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

### 🔧 Quick Debug Commands

```bash
# Full system check
bash scripts/health-check.sh

# Connection test
python3 test_sheets_connection.py

# Check environment
env | grep GOOGLE

# Check Python modules
python3 -c "import gspread, google.auth; print('✅ OK')"

# Check file permissions
ls -la config/service_account.json

# View logs
tail -f logs/automation.log
```

### 📧 Get Help

- **Documentation:**
  - Check `automation/docs/README.md` for detailed setup instructions
  - Review `GOOGLE_SHEETS_SETUP_GUIDE.md` for setup guide
  - Review API documentation in code comments

- **Scripts:**
  - `scripts/health-check.sh` - Comprehensive health check
  - `scripts/quick-start.sh` - Automated setup
  - `test_sheets_connection.py` - Connection test

- **Support:**
  - Check GitHub issues for similar problems
  - Review logs in `logs/` directory
  - Contact support with:
    - Error messages
    - System configuration
    - Steps to reproduce issue

---

## 📚 Related Documentation

- `automation/docs/README.md` - Full documentation
- `automation/GOOGLE_SHEETS_SETUP_GUIDE.md` - Setup guide
- `automation/scripts/README.md` - Scripts documentation
- `FRONTEND_BACKEND_CONNECTION_ANALYSIS.md` - API connection analysis

---

## ✅ Checklist Summary

**Pre-deployment:** 4 sections, ~15 items
**Testing:** 6 sections, ~20 test commands
**Troubleshooting:** 7 common issues with solutions
**Production:** 5 sections, ~20 items
**Success Criteria:** 7 verification steps

---

✅ **Remember:** Test each step thoroughly before moving to the next!

**Last Updated:** 2025-01-03
**Version:** 2.0
