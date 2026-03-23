#!/bin/bash
# =============================================================================
# 🚀 Một lệnh: Cài đặt dependencies + tạo dữ liệu khởi tạo
# Chạy: cd automation && ./setup-and-seed.sh
# =============================================================================

set -e
cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🚀 SETUP + SEED — Cài đặt & Dữ liệu khởi tạo            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Chạy setup chuẩn
echo -e "${BLUE}1️⃣  Chạy setup hệ thống...${NC}"
if [ -f "./setup.sh" ]; then
    ./setup.sh
else
    echo -e "${YELLOW}⚠️ setup.sh không có — tạo venv thủ công${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements-basic.txt 2>/dev/null || pip install selenium webdriver-manager pandas requests python-dotenv openpyxl schedule loguru
fi

# 2. Bổ sung requirements_auth (gspread, Flask) nếu có
echo ""
echo -e "${BLUE}2️⃣  Cài thêm dependencies cho Sheets/Auth...${NC}"
source venv/bin/activate
if [ -f "requirements_auth.txt" ]; then
    pip install -r requirements_auth.txt -q 2>/dev/null && echo -e "${GREEN}   ✅ requirements_auth.txt installed${NC}" || echo -e "${YELLOW}   ⚠️ Một số gói auth có thể thiếu (gspread, flask)${NC}"
fi

# 3. Tạo thư mục
mkdir -p data logs config

# 4. Dữ liệu khởi tạo (mẫu nếu chưa có)
echo ""
echo -e "${BLUE}3️⃣  Tạo dữ liệu khởi tạo...${NC}"
export PYTHONPATH="${PYTHONPATH}:$(pwd)/modules:$(pwd)"
python scripts/seed_initial_data.py 2>/dev/null || python -c "
import os, csv
d = 'data'
os.makedirs(d, exist_ok=True)
f = os.path.join(d, 'orders_latest.csv')
if not os.path.exists(f) or sum(1 for _ in open(f)) < 2:
    with open(f, 'w', encoding='utf-8-sig', newline='') as out:
        w = csv.writer(out)
        w.writerow(['order_id','order_date','status','region','order_value','confirm_hours','delivery_hours','is_confirmed_ontime','is_delivered_ontime','customer_type','product_category','customer_name','shipping_method','platform'])
        w.writerow(['SO17010001:DEMO1','2026-01-17 10:00:00','confirmed','TP.HCM','430000',20,36,'True','True','VIP','Home','Khách mẫu','VN Post','MIA.vn website'])
    print('✅ Đã tạo data/orders_latest.csv (mẫu)')
else:
    print('✅ Đã có dữ liệu: data/orders_latest.csv')
"

# 5. Kiểm tra hệ thống
echo ""
echo -e "${BLUE}4️⃣  Kiểm tra hệ thống...${NC}"
python system_check.py 2>/dev/null || echo -e "${YELLOW}   ⚠️ system_check bỏ qua nếu thiếu package${NC}"

# 6. Kiểm tra integrations (Sheets, Drive, Telegram, Email)
echo ""
echo -e "${BLUE}5️⃣  Kiểm tra integrations...${NC}"
python verify_integrations.py 2>/dev/null || echo -e "${YELLOW}   ⚠️ verify_integrations bỏ qua (cấu hình .env)${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ HOÀN TẤT                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Dữ liệu khởi tạo: data/orders_latest.csv${NC}"
echo -e "${CYAN}📋 Xem dữ liệu: head -5 data/orders_latest.csv${NC}"
echo ""
echo -e "${YELLOW}📌 Để có dữ liệu thật từ ONE (Selenium):${NC}"
echo -e "   source venv/bin/activate"
echo -e "   python automation.py          # hoặc python automation_enhanced.py"
echo -e "   python one_automation.py      # fresh session pipeline"
echo ""
echo -e "${CYAN}🔧 Chạy menu: ./start.sh${NC}"
echo -e "${CYAN}🔧 Kiểm tra tích hợp (Sheets/Drive/Telegram/Email): python verify_integrations.py${NC}"
echo ""
