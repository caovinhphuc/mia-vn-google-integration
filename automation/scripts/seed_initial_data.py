#!/usr/bin/env python3
"""
Tạo dữ liệu khởi tạo mẫu nếu chưa có.
Chạy tự động trong setup-and-seed.sh.
"""
import os
import csv
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
ORDERS_FILE = os.path.join(DATA_DIR, "orders_latest.csv")

# Cấu trúc khớp với dashboard_integration / automation export
HEADERS = [
    "order_id", "order_date", "status", "region", "order_value",
    "confirm_hours", "delivery_hours", "is_confirmed_ontime", "is_delivered_ontime",
    "customer_type", "product_category", "customer_name", "shipping_method", "platform"
]

SAMPLE_ROWS = [
    ["SO17010001:DEMO1", "2026-01-17 10:00:00", "confirmed", "TP.HCM", "430000", 20, 36, "True", "True", "VIP", "Home", "Khách mẫu 1", "VN Post", "MIA.vn website"],
    ["SO17010002:DEMO2", "2026-01-17 11:00:00", "confirmed", "Hà Nội", "899000", 16, 53, "False", "True", "New", "Electronics", "Khách mẫu 2", "GHN", "Tiktok"],
    ["SO17010003:DEMO3", "2026-01-17 12:00:00", "pending", "TP.HCM", "159000", 9, 0, "False", "False", "Regular", "Fashion", "Khách mẫu 3", "Viettel Post", "Shopee"],
]


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            rows = list(reader)
        if len(rows) > 1:
            print(f"✅ Đã có dữ liệu: {ORDERS_FILE} ({len(rows)-1} dòng)")
            return 0
    with open(ORDERS_FILE, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(HEADERS)
        w.writerows(SAMPLE_ROWS)
    print(f"✅ Đã tạo dữ liệu mẫu: {ORDERS_FILE} ({len(SAMPLE_ROWS)} dòng)")
    return 0


if __name__ == "__main__":
    exit(main())
