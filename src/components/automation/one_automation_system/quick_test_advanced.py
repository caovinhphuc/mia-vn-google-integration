#!/usr/bin/env python3
"""
ONE Automation System - Quick Test
Kiểm tra nhanh chức năng automation với dữ liệu mẫu
"""

import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from automation import OneAutomationSystem
import json
from datetime import datetime

def create_test_data():
    """Tạo dữ liệu mẫu để test hệ thống"""

    # Tạo dữ liệu đơn hàng mẫu
    test_orders = [
        {
            'order_id': 'ORD001',
            'order_code': 'SO-2025-001',
            'customer': 'Nguyễn Văn A',
            'status': 'Đã xác nhận',
            'amount': '1,500,000',
            'date': '2025-07-21',
            'page': 1,
            'scraped_at': datetime.now().isoformat()
        },
        {
            'order_id': 'ORD002',
            'order_code': 'SO-2025-002',
            'customer': 'Trần Thị B',
            'status': 'Đang xử lý',
            'amount': '2,300,000',
            'date': '2025-07-21',
            'page': 1,
            'scraped_at': datetime.now().isoformat()
        },
        {
            'order_id': 'ORD003',
            'order_code': 'SO-2025-003',
            'customer': 'Lê Văn C',
            'status': 'Hoàn thành',
            'amount': '850,000',
            'date': '2025-07-20',
            'page': 1,
            'scraped_at': datetime.now().isoformat()
        }
    ]

    return test_orders

def test_data_processing():
    """Test chức năng xử lý và export dữ liệu"""
    print("🧪 Testing Data Processing...")

    try:
        # Khởi tạo automation system
        automation = OneAutomationSystem()

        # Tạo dữ liệu test
        test_orders = create_test_data()

        # Test save function
        saved_files = automation._save_orders_to_files(test_orders)

        if saved_files:
            print(f"✅ Đã lưu test data:")
            print(f"   📄 CSV: {saved_files.get('csv', 'N/A')}")
            print(f"   📄 JSON: {saved_files.get('json', 'N/A')}")
            return True
        else:
            print("❌ Không thể lưu test data")
            return False

    except Exception as e:
        print(f"❌ Lỗi test data processing: {e}")
        return False

def test_dashboard_generation():
    """Test tạo dashboard"""
    print("🧪 Testing Dashboard Generation...")

    try:
        from utils import AutomationUtils

        utils = AutomationUtils()
        dashboard_file = utils.generate_dashboard()

        if "Lỗi" not in dashboard_file:
            print(f"✅ Dashboard tạo thành công: {dashboard_file}")
            return True
        else:
            print(f"❌ Lỗi tạo dashboard: {dashboard_file}")
            return False

    except Exception as e:
        print(f"❌ Lỗi test dashboard: {e}")
        return False

def test_configuration():
    """Test cấu hình system"""
    print("🧪 Testing Configuration...")

    try:
        automation = OneAutomationSystem()

        # Check required config sections
        required_sections = ['system', 'scraping', 'data_processing']

        for section in required_sections:
            if section not in automation.config:
                print(f"❌ Missing config section: {section}")
                return False

        print("✅ Configuration validation passed")
        return True

    except Exception as e:
        print(f"❌ Lỗi test configuration: {e}")
        return False

def main():
    """Chạy quick test suite"""
    print("🚀 ONE Automation System - Quick Test")
    print("=" * 50)

    tests = [
        ("Configuration", test_configuration),
        ("Data Processing", test_data_processing),
        ("Dashboard Generation", test_dashboard_generation)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        if test_func():
            passed += 1

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")

    if passed == total:
        print("🎉 Tất cả tests đã pass! Hệ thống hoạt động tốt.")

        # Hiển thị next steps
        print("\n🎯 Next Steps:")
        print("1. Chạy: python automation.py --run-once (test với website thực)")
        print("2. Xem dashboard: Mở file HTML trong reports/")
        print("3. Kiểm tra data files trong thư mục data/")

    else:
        print("❌ Có một số tests thất bại. Kiểm tra lại cấu hình.")

    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
