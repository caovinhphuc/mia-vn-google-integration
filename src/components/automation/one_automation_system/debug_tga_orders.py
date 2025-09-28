#!/usr/bin/env python3
"""
Script debug để kiểm tra cấu trúc trang đơn hàng TGA
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv
import os
import json

def setup_driver():
    """Setup Chrome WebDriver"""
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')

    # Không headless để có thể xem
    # options.add_argument('--headless')

    try:
        service = Service('/opt/homebrew/bin/chromedriver')
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        print(f"❌ Lỗi setup driver: {e}")
        return None

def login_and_navigate_to_orders(driver):
    """Đăng nhập và điều hướng đến trang đơn hàng"""
    try:
        # Load environment variables
        load_dotenv()

        username = os.getenv('ONE_USERNAME')
        password = os.getenv('ONE_PASSWORD')

        if not username or not password:
            print("❌ Không tìm thấy credentials trong .env")
            return False

        print("🔐 Đăng nhập vào TGA...")
        driver.get("https://one.tga.com.vn/")

        wait = WebDriverWait(driver, 10)

        # Đăng nhập
        username_field = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='text'], input[name='username'], input[name='email']"))
        )
        username_field.clear()
        username_field.send_keys(username)

        password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        password_field.clear()
        password_field.send_keys(password)

        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit'], .login-btn")
        login_button.click()

        time.sleep(3)
        print("✅ Đăng nhập thành công")

        # Điều hướng đến trang đơn hàng
        print("📋 Điều hướng đến trang đơn hàng...")
        driver.get("https://one.tga.com.vn/so/")

        time.sleep(5)  # Chờ trang load

        print("✅ Đã truy cập trang đơn hàng")
        return True

    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def analyze_orders_page(driver):
    """Phân tích cấu trúc trang đơn hàng"""
    try:
        print("🔍 Đang phân tích cấu trúc trang đơn hàng...")

        # Thông tin cơ bản
        print(f"📄 Page title: {driver.title}")
        print(f"🌐 Current URL: {driver.current_url}")

        # Tìm tables
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"📋 Tìm thấy {len(tables)} table(s)")

        for i, table in enumerate(tables):
            print(f"\\n  Table {i+1}:")
            print(f"    Class: {table.get_attribute('class')}")
            print(f"    ID: {table.get_attribute('id')}")

            # Tìm headers
            headers = table.find_elements(By.CSS_SELECTOR, "th, thead tr td")
            if headers:
                header_texts = [h.text.strip() for h in headers if h.text.strip()]
                print(f"    Headers: {header_texts}")

            # Tìm rows
            rows = table.find_elements(By.CSS_SELECTOR, "tbody tr, tr")
            print(f"    Rows: {len(rows)}")

            # Lấy sample data từ row đầu tiên
            if rows:
                first_row = rows[0]
                cells = first_row.find_elements(By.TAG_NAME, "td")
                if cells:
                    cell_texts = [cell.text.strip() for cell in cells[:5]]  # Chỉ lấy 5 cell đầu
                    print(f"    Sample row: {cell_texts}")

        # Tìm các element có class chứa 'table', 'grid', 'data'
        potential_data_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='table'], [class*='grid'], [class*='data'], [class*='list']")
        print(f"\\n🎯 Tìm thấy {len(potential_data_elements)} potential data elements:")

        for i, elem in enumerate(potential_data_elements[:5]):  # Chỉ hiển thị 5 đầu tiên
            print(f"  {i+1}. Tag: {elem.tag_name}, Class: {elem.get_attribute('class')}, ID: {elem.get_attribute('id')}")

        # Tìm các form, input, button
        forms = driver.find_elements(By.TAG_NAME, "form")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        buttons = driver.find_elements(By.TAG_NAME, "button")

        print(f"\\n📝 Forms: {len(forms)}")
        print(f"📝 Inputs: {len(inputs)}")
        print(f"📝 Buttons: {len(buttons)}")

        # Tìm pagination hoặc navigation
        pagination_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='page'], [class*='nav'], [class*='pagination']")
        print(f"📄 Pagination elements: {len(pagination_elements)}")

        # Lấy một phần page source để analyze
        page_source = driver.page_source

        # Tìm các từ khóa quan trọng
        keywords = ['đơn hàng', 'order', 'invoice', 'sale', 'customer', 'khách hàng', 'total', 'amount', 'date', 'ngày']
        keyword_counts = {}
        for keyword in keywords:
            count = page_source.lower().count(keyword.lower())
            if count > 0:
                keyword_counts[keyword] = count

        print(f"\\n🔍 Keyword analysis: {keyword_counts}")

        # Lưu page source để phân tích offline
        with open('tga_orders_page_source.html', 'w', encoding='utf-8') as f:
            f.write(page_source)
        print("💾 Page source đã được lưu vào tga_orders_page_source.html")

        # Tạo báo cáo
        analysis_result = {
            'url': driver.current_url,
            'title': driver.title,
            'tables_count': len(tables),
            'potential_data_elements': len(potential_data_elements),
            'forms_count': len(forms),
            'inputs_count': len(inputs),
            'buttons_count': len(buttons),
            'pagination_elements': len(pagination_elements),
            'keyword_counts': keyword_counts,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        # Lưu chi tiết về tables
        tables_info = []
        for i, table in enumerate(tables):
            headers = table.find_elements(By.CSS_SELECTOR, "th, thead tr td")
            rows = table.find_elements(By.CSS_SELECTOR, "tbody tr, tr")

            table_info = {
                'index': i,
                'class': table.get_attribute('class'),
                'id': table.get_attribute('id'),
                'headers': [h.text.strip() for h in headers if h.text.strip()],
                'rows_count': len(rows)
            }
            tables_info.append(table_info)

        analysis_result['tables_details'] = tables_info

        with open('tga_orders_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, ensure_ascii=False, indent=2)

        print("💾 Analysis result đã được lưu vào tga_orders_analysis.json")

        return analysis_result

    except Exception as e:
        print(f"❌ Lỗi analyze: {e}")
        return None

def main():
    """Main function"""
    print("🔍 TGA Orders Page Analyzer")
    print("=" * 50)

    driver = setup_driver()
    if not driver:
        return

    try:
        # Đăng nhập và điều hướng
        if not login_and_navigate_to_orders(driver):
            return

        # Phân tích trang
        result = analyze_orders_page(driver)

        if result:
            print("\\n✅ Phân tích hoàn thành!")
            print(f"📊 Tables: {result['tables_count']}")
            print(f"📊 Data elements: {result['potential_data_elements']}")
            print(f"📊 Forms: {result['forms_count']}")

        # Giữ browser mở để inspect thủ công
        input("\\n👁️ Browser đang mở. Bạn có thể inspect thủ công. Nhấn Enter để đóng...")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
