#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ONE Automation System - Script tự động truy cập và xử lý dữ liệu
Author: AI Assistant
Created: 2025-06-15
Version: 1.0.0
"""

import os
import sys
import json
import logging
import time
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
# from webdriver_manager.chrome import ChromeDriverManager  # Disabled - using local ChromeDriver
from dotenv import load_dotenv

# Unused imports removed:
# import schedule - không dùng scheduling
# import pandas as pd - không dùng data processing
# import smtplib, email modules - không dùng email
# import requests - không dùng HTTP requests

class OneAutomationSystem:
    """Hệ thống tự động hóa truy cập ONE và xử lý dữ liệu"""

    def __init__(self, config_path="config/config.json"):
        """Khởi tạo hệ thống"""
        self.load_config(config_path)
        self.setup_logging()
        self.driver = None
        self.session_data = {}

    def load_config(self, config_path):
        """Tải cấu hình từ file JSON"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)

            # Load environment variables
            load_dotenv()
            self._replace_env_vars(self.config)
            print("✅ Đã tải cấu hình thành công")
        except Exception as e:
            print(f"❌ Lỗi tải cấu hình: {e}")
            sys.exit(1)

    def _replace_env_vars(self, obj):
        """Thay thế biến môi trường trong config"""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
                    env_var = value[2:-1]
                    obj[key] = os.getenv(env_var, value)
                elif isinstance(value, (dict, list)):
                    self._replace_env_vars(value)
        elif isinstance(obj, list):
            for item in obj:
                self._replace_env_vars(item)

    def setup_logging(self):
        """Thiết lập logging"""
        log_level = getattr(logging, self.config.get('logging', {}).get('level', 'INFO'))

        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        self.logger = logging.getLogger('OneAutomation')
        self.logger.setLevel(log_level)

        log_file = f"logs/automation_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def setup_driver(self):
        """Thiết lập Selenium WebDriver với error handling tốt hơn"""
        try:
            options = Options()
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_argument('--disable-web-security')
            options.add_argument('--disable-features=VizDisplayCompositor')
            options.add_argument('--remote-debugging-port=9222')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)

            # Headless mode for production
            if os.getenv('HEADLESS', 'true').lower() == 'true':
                options.add_argument('--headless=new')  # Use new headless mode

            # Set timeouts
            options.add_argument('--page-load-strategy=normal')

            chrome_binary_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            if os.path.exists(chrome_binary_path):
                options.binary_location = chrome_binary_path

            try:
                self.logger.info("🔧 Đang khởi tạo ChromeDriver...")
                # Use local ChromeDriver directly (much faster than WebDriverManager)
                self.driver = webdriver.Chrome(options=options)
                self.logger.info("✅ Đã khởi tạo ChromeDriver thành công với local driver")
            except Exception as e:
                self.logger.warning(f"Local ChromeDriver failed: {e}, trying explicit path...")
                # Fallback to explicit path
                try:
                    service = Service("/opt/homebrew/bin/chromedriver")
                    self.driver = webdriver.Chrome(service=service, options=options)
                    self.logger.info("✅ Đã khởi tạo ChromeDriver với explicit path")
                except Exception as e2:
                    self.logger.error(f"All ChromeDriver methods failed: {e2}")
                    raise

            # Set shorter timeouts to avoid hanging
            self.driver.implicitly_wait(self.config['system']['implicit_wait'])
            self.driver.set_page_load_timeout(self.config['system']['page_load_timeout'])

            # Anti-detection
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

            self.logger.info("✅ Đã khởi tạo WebDriver thành công")
            return True

        except Exception as e:
            self.logger.error(f"❌ Lỗi khởi tạo WebDriver: {e}")
            self.logger.error(f"Chi tiết lỗi: {str(e)}")
            return False

    def login_to_one(self):
        """Đăng nhập vào hệ thống ONE"""
        try:
            self.logger.info("🔐 Bắt đầu đăng nhập vào hệ thống ONE...")
            self.logger.info(f"📄 Truy cập trang: {self.config['system']['one_url']}")
            self.driver.get(self.config['system']['one_url'])
            time.sleep(3)
            self.logger.info(f"📍 URL hiện tại: {self.driver.current_url}")
            self.logger.info(f"📝 Tiêu đề trang: {self.driver.title}")

            try:
                user_element = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='user-name'], .user-name, .username"))
                )
                self.logger.info("✅ Đã đăng nhập từ trước")
                return True
            except TimeoutException:
                self.logger.info("🔍 Chưa đăng nhập, tiến hành đăng nhập...")

            wait = WebDriverWait(self.driver, self.config['system']['login_timeout'])
            username_field = None
            for selector in [
                "input[type='text']",
                "input[name='username']",
                "input[name='email']",
                "input[placeholder*='email']",
                "input[placeholder*='tên']",
                "input[id*='username']",
                "input[id*='email']",
                "#username",
                "#email",
                ".username-input",
                ".email-input"
            ]:
                try:
                    username_field = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                    self.logger.info(f"✅ Tìm thấy trường username với selector: {selector}")
                    break
                except TimeoutException:
                    continue
            if not username_field:
                self.logger.error("❌ Không tìm thấy trường username")
                return False

            username_field.clear()
            username_field.send_keys(self.config['credentials']['username'])
            self.logger.info("✅ Đã nhập username")

            password_field = None
            for selector in [
                "input[type='password']",
                "input[name='password']",
                "input[placeholder*='mật']",
                "input[id*='password']",
                "#password",
                ".password-input"
            ]:
                try:
                    password_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                    self.logger.info(f"✅ Tìm thấy trường password với selector: {selector}")
                    break
                except NoSuchElementException:
                    continue
            if not password_field:
                self.logger.error("❌ Không tìm thấy trường password")
                return False

            password_field.clear()
            password_field.send_keys(self.config['credentials']['password'])
            self.logger.info("✅ Đã nhập password")

            login_button = None
            for selector in [
                "button[type='submit']",
                "input[type='submit']",
                ".login-btn",
                "button[class*='login']",
                "button[id*='login']",
                "#login-button",
                "#submit",
                "button:contains('Đăng nhập')",
                "button:contains('Login')",
                ".btn-primary",
                ".submit-btn"
            ]:
                try:
                    login_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    self.logger.info(f"✅ Tìm thấy nút đăng nhập với selector: {selector}")
                    break
                except NoSuchElementException:
                    continue
            if not login_button:
                self.logger.error("❌ Không tìm thấy nút đăng nhập")
                return False

            login_button.click()
            self.logger.info("✅ Đã click nút đăng nhập")
            self.logger.info("⏳ Chờ xác nhận đăng nhập...")
            time.sleep(5)
            current_url = self.driver.current_url
            self.logger.info(f"📍 URL sau đăng nhập: {current_url}")
            for selector in [
                ".error",
                ".alert-danger",
                ".login-error",
                "[class*='error']",
                ".invalid-feedback"
            ]:
                try:
                    error_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if error_element.is_displayed():
                        error_text = error_element.text
                        self.logger.error(f"❌ Thông báo lỗi: {error_text}")
                        return False
                except NoSuchElementException:
                    continue
            for selector in [
                "[data-testid='user-name']",
                ".user-name",
                ".username",
                ".user-info",
                "#user-menu",
                ".navbar-user",
                ".header-user"
            ]:
                try:
                    user_element = WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    self.logger.info(f"✅ Đăng nhập thành công - tìm thấy element: {selector}")
                    return True
                except TimeoutException:
                    continue
            if "dashboard" in current_url or "home" in current_url or current_url != self.config['system']['one_url']:
                self.logger.info("✅ Đăng nhập thành công - URL đã thay đổi")
                return True

            self.logger.error("❌ Không thể xác nhận đăng nhập thành công")
            return False
        except Exception as e:
            self.logger.error(f"❌ Lỗi đăng nhập: {e}")
            self.logger.error(f"📍 URL hiện tại: {self.driver.current_url if self.driver else 'N/A'}")
            return False

    def navigate_to_orders(self):
        """Điều hướng đến trang danh sách đơn hàng"""
        try:
            self.logger.info("📋 Điều hướng đến trang danh sách đơn hàng...")
            orders_url = self.config['system'].get('orders_url', 'https://one.tga.com.vn/so/')
            self.driver.get(orders_url)
            wait = WebDriverWait(self.driver, 20)
            try:
                wait.until(
                    EC.any_of(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "table, .table, [data-testid*='table']")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".order-list, .orders, [data-testid*='order']")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".content, .main-content, #content")),
                        EC.url_contains("/so/")
                    )
                )
                self.logger.info("✅ Đã truy cập trang đơn hàng thành công")
                time.sleep(2)
                return True
            except TimeoutException:
                self.logger.warning("⚠️ Trang đơn hàng tải chậm hoặc không đúng định dạng mong đợi")
                return True
        except Exception as e:
            self.logger.error(f"❌ Lỗi điều hướng đến trang đơn hàng: {e}")
            return False

    def scrape_order_data(self):
        """Lấy dữ liệu đơn hàng từ nhiều trang với pagination"""
        try:
            self.logger.info("📊 Bắt đầu lấy dữ liệu đơn hàng với pagination...")
            all_orders = []
            current_page = 1
            max_pages = self.config['scraping']['max_pages']
            max_orders = self.config['scraping']['max_orders']

            while current_page <= max_pages and len(all_orders) < max_orders:
                self.logger.info(f"📄 Đang lấy dữ liệu trang {current_page}...")

                # Lấy dữ liệu trang hiện tại
                page_orders = self._scrape_current_page()

                if not page_orders:
                    self.logger.warning(f"⚠️ Không có dữ liệu ở trang {current_page}, dừng lại")
                    break

                all_orders.extend(page_orders)
                self.logger.info(f"✅ Trang {current_page}: {len(page_orders)} đơn hàng (Tổng: {len(all_orders)})")

                # Kiểm tra xem có trang tiếp theo không
                if not self._go_to_next_page():
                    self.logger.info("📋 Đã đến trang cuối cùng")
                    break

                current_page += 1
                time.sleep(self.config['scraping']['delay_between_pages'])

            # Lưu dữ liệu vào file
            if all_orders:
                saved_files = self._save_orders_to_files(all_orders)
                self.logger.info(f"💾 Đã lưu {len(all_orders)} đơn hàng vào file")

            self.logger.info(f"🎯 Hoàn thành: {len(all_orders)} đơn hàng từ {current_page} trang")
            return all_orders

        except Exception as e:
            self.logger.error(f"❌ Lỗi lấy dữ liệu đơn hàng: {e}")
            return []

    def _scrape_current_page(self):
        """Lấy dữ liệu từ trang hiện tại - Tối ưu tốc độ"""
        try:
            # Chờ table load với timeout ngắn hơn
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
            )

            orders = []
            rows = self.driver.find_elements(By.CSS_SELECTOR, "table tbody tr")

            self.logger.info(f"📋 Tìm thấy {len(rows)} dòng dữ liệu trên trang")

            for idx, row in enumerate(rows):
                try:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) < 3:  # Minimum 3 cells needed
                        continue

                    order_data = {
                        'order_id': cells[0].text.strip() if len(cells) > 0 else '',
                        'order_code': cells[1].text.strip() if len(cells) > 1 else '',
                        'customer': cells[2].text.strip() if len(cells) > 2 else '',
                        'status': cells[3].text.strip() if len(cells) > 3 else '',
                        'amount': cells[4].text.strip() if len(cells) > 4 else '',
                        'date': cells[5].text.strip() if len(cells) > 5 else '',
                        'page': self._get_current_page_number(),
                        'scraped_at': datetime.now().isoformat()
                    }
                    orders.append(order_data)

                except Exception as e:
                    self.logger.warning(f"⚠️ Lỗi xử lý dòng {idx+1}: {e}")
                    continue

            return orders

        except Exception as e:
            self.logger.error(f"❌ Lỗi lấy dữ liệu trang hiện tại: {e}")
            return []

    def _go_to_next_page(self):
        """Chuyển sang trang tiếp theo - Tối ưu tốc độ"""
        try:
            # Tìm nút "Next" hoặc "Tiếp theo" với ưu tiên cao
            next_selectors = [
                "a[aria-label='Next']:not(.disabled)",
                "button[aria-label='Next']:not(:disabled)",
                ".pagination .next:not(.disabled)",
                ".pager .next:not(.disabled)",
                ".page-next:not(.disabled)"
            ]

            for selector in next_selectors:
                try:
                    next_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if next_btn.is_enabled() and next_btn.is_displayed():
                        self.driver.execute_script("arguments[0].click();", next_btn)
                        time.sleep(1)  # Giảm thời gian chờ
                        return True
                except:
                    continue

            # Thử tìm link trang số tiếp theo
            try:
                current_page = self._get_current_page_number()
                next_page_link = self.driver.find_element(
                    By.XPATH, f"//a[text()='{current_page + 1}' and not(contains(@class, 'disabled'))]"
                )
                self.driver.execute_script("arguments[0].click();", next_page_link)
                time.sleep(1)
                return True
            except:
                pass

            return False

        except Exception as e:
            self.logger.warning(f"⚠️ Không thể chuyển trang: {e}")
            return False

    def _get_current_page_number(self):
        """Lấy số trang hiện tại"""
        try:
            # Tìm indicator trang hiện tại
            page_selectors = [
                ".pagination .active",
                ".pager .current",
                ".page-current",
                ".current-page"
            ]

            for selector in page_selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    page_text = element.text.strip()
                    if page_text.isdigit():
                        return int(page_text)
                except:
                    continue

            return 1  # Default to page 1

        except Exception as e:
            self.logger.warning(f"⚠️ Không xác định được số trang: {e}")
            return 1

    def _save_orders_to_files(self, orders):
        """Lưu đơn hàng vào file CSV và JSON"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            data_dir = self.config['data_processing']['data_dir']

            # Tạo thư mục data nếu chưa có
            os.makedirs(data_dir, exist_ok=True)

            # Lưu CSV
            csv_file = f"{data_dir}/orders_{timestamp}.csv"
            with open(csv_file, 'w', encoding='utf-8', newline='') as f:
                if orders:
                    import csv
                    writer = csv.DictWriter(f, fieldnames=orders[0].keys())
                    writer.writeheader()
                    writer.writerows(orders)

            # Lưu JSON
            json_file = f"{data_dir}/orders_{timestamp}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(orders, f, ensure_ascii=False, indent=2)

            self.logger.info(f"� Đã lưu dữ liệu:")
            self.logger.info(f"  📄 CSV: {csv_file}")
            self.logger.info(f"  📄 JSON: {json_file}")

            return {
                'csv': csv_file,
                'json': json_file
            }

        except Exception as e:
            self.logger.error(f"❌ Lỗi lưu file: {e}")
            return {}

    def run_automation(self):
        """Chạy quy trình automation chính"""
        start_time = datetime.now()
        result = {
            "success": False,
            "start_time": start_time.isoformat(),
            "order_count": 0,
            "export_files": {},
            "error": None,
            "duration": 0
        }

        try:
            self.logger.info("🚀 Bắt đầu quy trình automation...")

            # Thiết lập driver
            self.setup_driver()

            # Đăng nhập
            if not self.login_to_one():
                result["error"] = "Đăng nhập thất bại"
                return result

            # Điều hướng đến trang đơn hàng
            if not self.navigate_to_orders():
                result["error"] = "Không thể điều hướng đến trang đơn hàng"
                return result

            # Lấy dữ liệu đơn hàng với pagination
            orders = self.scrape_order_data()

            if orders:
                result["success"] = True
                result["order_count"] = len(orders)
                result["orders"] = orders
                # Thêm thông tin về file đã lưu
                result["saved_files"] = getattr(self, '_last_saved_files', {})
                result["pages_scraped"] = len(set(order.get('page', 1) for order in orders))
                self.logger.info(f"✅ Hoàn thành automation với {len(orders)} đơn hàng từ {result['pages_scraped']} trang")
            else:
                result["error"] = "Không lấy được dữ liệu đơn hàng"

        except Exception as e:
            result["error"] = str(e)
            self.logger.error(f"❌ Lỗi trong quy trình automation: {e}")

        finally:
            # Đóng driver
            if self.driver:
                try:
                    self.driver.quit()
                except:
                    pass

            # Tính thời gian thực hiện
            end_time = datetime.now()
            result["duration"] = (end_time - start_time).total_seconds()
            result["end_time"] = end_time.isoformat()

        return result


def main():
    """Hàm chính"""
    try:
        automation = OneAutomationSystem()
        if len(sys.argv) > 1:
            if sys.argv[1] == '--schedule':
                automation.schedule_automation()
            elif sys.argv[1] == '--run-once':
                result = automation.run_automation()
                print(f"\n📊 Kết quả: {json.dumps(result, default=str, indent=2)}")
            else:
                print("Sử dụng: python automation.py [--schedule|--run-once]")
        else:
            result = automation.run_automation()
            print(f"\n📊 Kết quả: {json.dumps(result, default=str, indent=2)}")
    except KeyboardInterrupt:
        print("\n⏹️ Đã dừng bởi người dùng")
    except Exception as e:
        print(f"❌ Lỗi hệ thống: {e}")

if __name__ == "__main__":
    main()
