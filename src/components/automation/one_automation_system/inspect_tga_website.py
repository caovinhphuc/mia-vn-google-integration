#!/usr/bin/env python3
"""
Script để inspect website TGA và tìm selectors cho đơn hàng
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

def login_to_tga(driver):
    """Đăng nhập vào TGA"""
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

        # Tìm username field
        username_field = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='text'], input[name='username'], input[name='email']"))
        )
        username_field.clear()
        username_field.send_keys(username)

        # Tìm password field
        password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        password_field.clear()
        password_field.send_keys(password)

        # Click login
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit'], .login-btn")
        login_button.click()

        # Chờ đăng nhập thành công
        time.sleep(5)
        print("✅ Đăng nhập thành công")
        return True

    except Exception as e:
        print(f"❌ Lỗi đăng nhập: {e}")
        return False

def inspect_page_structure(driver):
    """Inspect cấu trúc trang để tìm menu đơn hàng"""
    try:
        print("🔍 Đang inspect cấu trúc trang...")

        # Lấy title trang
        print(f"📄 Page title: {driver.title}")
        print(f"🌐 Current URL: {driver.current_url}")

        # Tìm tất cả links có thể là menu đơn hàng
        potential_order_links = []

        # Tìm theo text
        try:
            links_with_text = driver.find_elements(By.XPATH, "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'order') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'đơn') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'hàng')]")
            for link in links_with_text:
                if link.text.strip():
                    potential_order_links.append({
                        'text': link.text.strip(),
                        'href': link.get_attribute('href'),
                        'class': link.get_attribute('class'),
                        'id': link.get_attribute('id')
                    })
        except Exception as e:
            print(f"⚠️ Lỗi tìm links by text: {e}")

        # Tìm theo href
        try:
            links_with_href = driver.find_elements(By.CSS_SELECTOR, "a[href*='order'], a[href*='Order'], a[href*='ORDER']")
            for link in links_with_href:
                potential_order_links.append({
                    'text': link.text.strip(),
                    'href': link.get_attribute('href'),
                    'class': link.get_attribute('class'),
                    'id': link.get_attribute('id')
                })
        except Exception as e:
            print(f"⚠️ Lỗi tìm links by href: {e}")

        # Tìm navigation menu
        try:
            nav_elements = driver.find_elements(By.CSS_SELECTOR, "nav, .nav, .menu, .sidebar, .navigation")
            print(f"📋 Tìm thấy {len(nav_elements)} navigation elements")

            for i, nav in enumerate(nav_elements):
                print(f"  Nav {i+1}: class='{nav.get_attribute('class')}', id='{nav.get_attribute('id')}'")

                # Tìm tất cả links trong nav
                nav_links = nav.find_elements(By.TAG_NAME, "a")
                for link in nav_links[:10]:  # Chỉ lấy 10 đầu tiên
                    text = link.text.strip()
                    href = link.get_attribute('href')
                    if text and href:
                        print(f"    - {text}: {href}")

        except Exception as e:
            print(f"⚠️ Lỗi tìm navigation: {e}")

        # In ra potential order links
        if potential_order_links:
            print(f"\\n🎯 Tìm thấy {len(potential_order_links)} potential order links:")
            for i, link in enumerate(potential_order_links[:10]):  # Chỉ hiển thị 10 đầu tiên
                print(f"  {i+1}. Text: '{link['text']}'")
                print(f"     Href: {link['href']}")
                print(f"     Class: {link['class']}")
                print(f"     ID: {link['id']}")
                print()
        else:
            print("❌ Không tìm thấy order links")

        # Lấy HTML của trang để analyze
        page_source = driver.page_source

        # Tìm các từ khóa liên quan đến đơn hàng
        keywords = ['order', 'đơn hàng', 'đơn', 'hàng', 'purchase', 'sale', 'invoice']
        for keyword in keywords:
            count = page_source.lower().count(keyword.lower())
            if count > 0:
                print(f"🔍 Từ khóa '{keyword}': {count} lần")

        return potential_order_links

    except Exception as e:
        print(f"❌ Lỗi inspect: {e}")
        return []

def main():
    """Main function"""
    print("🔍 TGA Website Inspector")
    print("=" * 50)

    driver = setup_driver()
    if not driver:
        return

    try:
        # Đăng nhập
        if not login_to_tga(driver):
            return

        # Chờ một chút để trang load
        time.sleep(3)

        # Inspect page
        potential_links = inspect_page_structure(driver)

        # Lưu kết quả
        result = {
            'url': driver.current_url,
            'title': driver.title,
            'potential_order_links': potential_links,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        with open('tga_inspection_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\\n💾 Kết quả đã được lưu vào tga_inspection_result.json")

        # Giữ browser mở để user có thể inspect thủ công
        input("\\n👁️ Browser đang mở. Bạn có thể inspect thủ công. Nhấn Enter để đóng...")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
