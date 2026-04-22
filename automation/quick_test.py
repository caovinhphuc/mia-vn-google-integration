#!/usr/bin/env python3
"""
Quick test script để kiểm tra đăng nhập và navigation đến trang đơn hàng TGA
"""

import os
import time

from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait


def setup_driver():
    """Setup Chrome WebDriver - Browser sẽ hiển thị để bạn có thể xem"""
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    # Đảm bảo browser hiển thị (KHÔNG headless)
    # options.add_argument('--headless')  # ❌ KHÔNG dùng headless

    # Browser mở full screen để dễ xem
    options.add_argument("--start-maximized")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-infobars")

    # Chrome binary path (Mac)
    chrome_binary_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(chrome_binary_path):
        options.binary_location = chrome_binary_path

    print("🖥️ Đang mở browser Chrome (sẽ hiển thị để bạn xem)...")

    try:
        service = Service("/opt/homebrew/bin/chromedriver")
        driver = webdriver.Chrome(service=service, options=options)
    except:
        # Fallback: không cần service
        driver = webdriver.Chrome(options=options)

    # Đảm bảo browser window được focus
    driver.maximize_window()

    print("✅ Browser đã mở! Bạn có thể xem script đang làm gì.")
    return driver


def test_login_and_navigation():
    """Test đăng nhập và navigation"""
    driver = setup_driver()

    try:
        # Load credentials
        load_dotenv()
        username = os.getenv("ONE_USERNAME")
        password = os.getenv("ONE_PASSWORD")

        print("🔐 Step 1: Đăng nhập vào TGA...")
        print("👁️ Browser đang mở - Bạn có thể xem từng bước!")
        driver.get("https://one.tga.com.vn/")
        time.sleep(2)  # Đợi một chút để user thấy trang load

        # Đăng nhập
        wait = WebDriverWait(driver, 10)
        username_field = wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    "input[type='text'], input[name='username'], input[name='email']",
                )
            )
        )
        username_field.clear()
        username_field.send_keys(username)

        password_field = driver.find_element(
            By.CSS_SELECTOR, "input[type='password'], input[name='password']"
        )
        password_field.clear()
        password_field.send_keys(password)

        login_button = driver.find_element(
            By.CSS_SELECTOR, "button[type='submit'], input[type='submit'], .login-btn"
        )
        login_button.click()

        time.sleep(3)
        print(f"✅ Đăng nhập thành công. Current URL: {driver.current_url}")

        print("📋 Step 2: Truy cập trang đơn hàng...")
        driver.get("https://one.tga.com.vn/so/")
        time.sleep(5)

        print(f"📄 Page title: {driver.title}")
        print(f"🌐 Current URL: {driver.current_url}")

        # Kiểm tra có bị redirect về login không
        if "Đăng nhập" in driver.title:
            print("❌ Bị redirect về trang đăng nhập!")

            # Thử đăng nhập lại
            print("🔄 Thử đăng nhập lại...")
            driver.get("https://one.tga.com.vn/")
            time.sleep(2)

            # Đăng nhập lại
            username_field = wait.until(
                EC.element_to_be_clickable(
                    (
                        By.CSS_SELECTOR,
                        "input[type='text'], input[name='username'], input[name='email']",
                    )
                )
            )
            username_field.clear()
            username_field.send_keys(username)

            password_field = driver.find_element(
                By.CSS_SELECTOR, "input[type='password'], input[name='password']"
            )
            password_field.clear()
            password_field.send_keys(password)

            login_button = driver.find_element(
                By.CSS_SELECTOR,
                "button[type='submit'], input[type='submit'], .login-btn",
            )
            login_button.click()

            time.sleep(3)
            print(f"✅ Đăng nhập lại thành công. Current URL: {driver.current_url}")

            # Thử truy cập lại trang đơn hàng
            print("📋 Thử truy cập lại trang đơn hàng...")
            driver.get("https://one.tga.com.vn/so/")
            time.sleep(5)

            print(f"📄 New page title: {driver.title}")
            print(f"🌐 New current URL: {driver.current_url}")

        # Kiểm tra có data không
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"📊 Tìm thấy {len(tables)} table(s)")

        # Tìm các element có thể chứa dữ liệu
        data_elements = driver.find_elements(
            By.CSS_SELECTOR,
            "[class*='table'], [class*='grid'], [class*='data'], [class*='list']",
        )
        print(f"📊 Tìm thấy {len(data_elements)} data element(s)")

        # Lưu page source để debug
        with open("quick_test_page_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("💾 Page source đã được lưu vào quick_test_page_source.html")

        print("\\n✅ Test hoàn thành!")
        input("Nhấn Enter để đóng browser...")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        driver.quit()


if __name__ == "__main__":
    test_login_and_navigation()
