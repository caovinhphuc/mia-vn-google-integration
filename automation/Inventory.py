#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Inventory Automation Script

This script logs into the ONE system and retrieves full inventory data from
the sale inventory report. It navigates through all pages of the inventory
table, collects every column and row, cleans the data, and saves it as a CSV
file.  Configuration values (such as credentials and URLs) are read from
``config/config.json`` and environment variables.

Usage:
    python Inventory.py          # run the automation once
    python Inventory.py --run-once

The script does not currently support scheduling.  It is inspired by the
structure of the provided ``OneAutomationSystem`` class but focuses on the
inventory module instead of orders.
"""

import os
import sys
import json
import logging
import time
import csv
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from dotenv import load_dotenv

try:
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    ChromeDriverManager = None


class InventoryAutomationSystem:
    """Automate login and data extraction from ONE's inventory report."""

    def __init__(self, config_path="config/config.json"):
        self.load_config(config_path)
        self.setup_logging()
        self.driver = None

    def load_config(self, config_path: str) -> None:
        """Load configuration from a JSON file and resolve environment variables."""
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                self.config = json.load(f)
            load_dotenv()
            self._replace_env_vars(self.config)
            print("✅ Config loaded successfully")
        except Exception as e:
            print(f"❌ Error loading config: {e}")
            sys.exit(1)

    def _replace_env_vars(self, obj):
        """Recursively replace ${VAR} in config with environment variables."""
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

    def setup_logging(self) -> None:
        """Set up logging to both console and file."""
        log_level = getattr(logging, self.config.get('logging', {}).get('level', 'INFO'))
        self.logger = logging.getLogger('InventoryAutomation')
        self.logger.setLevel(log_level)

        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                                      datefmt='%Y-%m-%d %H:%M:%S')
        # file handler
        os.makedirs('logs', exist_ok=True)
        log_file = f"logs/inventory_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        # console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def setup_driver(self) -> bool:
        """Initialise Selenium WebDriver."""
        try:
            options = Options()
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            # headless mode
            if os.getenv('HEADLESS', 'true').lower() == 'true':
                options.add_argument('--headless=new')
            # Use webdriver-manager to auto-download chromedriver (like automation.py)
            try:
                if ChromeDriverManager:
                    service = Service(ChromeDriverManager().install())
                    self.driver = webdriver.Chrome(service=service, options=options)
                else:
                    self.driver = webdriver.Chrome(options=options)
            except Exception as e1:
                self.logger.warning(f"ChromeDriverManager failed: {e1}")
                try:
                    service = Service("/opt/homebrew/bin/chromedriver")
                    self.driver = webdriver.Chrome(service=service, options=options)
                except Exception as e2:
                    self.logger.warning(f"Explicit chromedriver failed: {e2}")
                    self.driver = webdriver.Chrome(options=options)
            # basic timeouts
            implicit_wait = self.config.get('system', {}).get('implicit_wait', 5)
            page_timeout = self.config.get('system', {}).get('page_load_timeout', 30)
            self.driver.implicitly_wait(implicit_wait)
            self.driver.set_page_load_timeout(page_timeout)
            # anti-detection
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.logger.info("✅ WebDriver initialised")
            return True
        except Exception as e:
            self.logger.error(f"❌ Failed to initialise WebDriver: {e}")
            return False

    def login(self) -> bool:
        """Log in to the ONE system using credentials from config.

        This method tries several selector strategies tailored to the ONE login
        page, including Vietnamese placeholders.  After submitting, it waits
        for a known user element to appear or the URL to change.
        """
        try:
            url = self.config['system']['one_url']
            self.driver.get(url)
            time.sleep(2)
            # detect if already logged in by looking for user menu
            try:
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='user-name'], .user-name, .navbar-user"))
                )
                self.logger.info("✅ Already logged in")
                return True
            except TimeoutException:
                self.logger.info("🔐 Logging in...")
            wait = WebDriverWait(self.driver, 15)
            # locate username/email field using various heuristics
            username_field = None
            selectors_user = [
                "input[placeholder*='Email']",  # Vietnamese placeholder for email
                "input[placeholder*='email']",
                "input[type='email']",
                "input[name='username']", "input[name='email']",
                "input[type='text']", "#username", "#email"
            ]
            for sel in selectors_user:
                try:
                    username_field = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, sel)))
                    break
                except TimeoutException:
                    continue
            if not username_field:
                self.logger.error("❌ Username/email field not found")
                return False
            username_field.clear()
            username_field.send_keys(self.config['credentials']['username'])
            # locate password field
            password_field = None
            selectors_pass = [
                "input[placeholder*='Mật']",  # Vietnamese placeholder for 'Mật khẩu'
                "input[type='password']",
                "input[name='password']", "#password"
            ]
            for sel in selectors_pass:
                try:
                    password_field = self.driver.find_element(By.CSS_SELECTOR, sel)
                    if password_field:
                        break
                except NoSuchElementException:
                    continue
            if not password_field:
                self.logger.error("❌ Password field not found")
                return False
            password_field.clear()
            password_field.send_keys(self.config['credentials']['password'])
            # locate login/submit button
            login_button = None
            # try CSS selectors first
            button_selectors = [
                "button[type='submit']", "input[type='submit']", ".login-btn", "#login-button", ".btn-primary"
            ]
            for sel in button_selectors:
                try:
                    login_button = self.driver.find_element(By.CSS_SELECTOR, sel)
                    if login_button:
                        break
                except NoSuchElementException:
                    continue
            # fallback: search by text via XPath
            if not login_button:
                try:
                    login_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng nhập')]")
                except NoSuchElementException:
                    pass
            if not login_button:
                self.logger.error("❌ Login button not found")
                return False
            login_button.click()
            # wait for login to complete: either user element appears or URL changes away from login
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.any_of(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='user-name'], .user-name, .navbar-user")),
                        EC.url_changes(url)
                    )
                )
                # final verification: check that we're not on the login page
                if self.driver.current_url != url:
                    self.logger.info("✅ Logged in successfully (URL changed)")
                    return True
                else:
                    # still same URL; maybe login requires redirect to new tab
                    self.logger.info("✅ Logged in (user element detected)")
                    return True
            except TimeoutException:
                self.logger.error("❌ Login failed - user element not detected or URL not changed")
                return False
        except Exception as e:
            self.logger.error(f"❌ Login error: {e}")
            return False

    def navigate_to_inventory(self) -> bool:
        """Navigate to the inventory report page and prepare the table."""
        try:
            url = self.config['system'].get('inventory_url')
            if not url:
                self.logger.error("❌ inventory_url not defined in config")
                return False
            # Tăng timeout cho trang BI nặng
            table_timeout = self.config['system'].get('inventory_table_timeout', 90)
            self.logger.info(f"📄 Navigating to inventory page (table wait: {table_timeout}s)...")
            # eager = không chờ tải hết ảnh/CSS (trang BI nặng)
            try:
                self.driver.set_page_load_strategy('eager')
            except Exception:
                pass
            self.driver.get(url)
            # Chờ table — selector chính trước, fallback sau (mỗi fallback 15s)
            table_selectors = [
                ("table", table_timeout),           # chờ lâu cho lần đầu
                ("table tbody", 15),
                (".dataTable", 15),
                (".dataTables_wrapper table", 15),
                ("[role='grid']", 10),              # Ant Design / div-based
            ]
            table_found = False
            for sel, to in table_selectors:
                try:
                    WebDriverWait(self.driver, to).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, sel))
                    )
                    self.logger.info(f"  ✅ Table found via: {sel}")
                    table_found = True
                    break
                except TimeoutException:
                    continue
            # Thử iframe nếu chưa tìm thấy
            if not table_found:
                iframes = self.driver.find_elements(By.TAG_NAME, "iframe")
                for i, ifr in enumerate(iframes):
                    try:
                        self.driver.switch_to.frame(ifr)
                        for sel, to in [("table", 20), ("table tbody", 10)]:
                            try:
                                WebDriverWait(self.driver, to).until(
                                    EC.presence_of_element_located((By.CSS_SELECTOR, sel))
                                )
                                self.logger.info(f"  ✅ Table found in iframe[{i}] via: {sel}")
                                table_found = True
                                break
                            except TimeoutException:
                                continue
                        if table_found:
                            break
                    except Exception:
                        pass
                    finally:
                        self.driver.switch_to.default_content()
            if not table_found:
                self._debug_table_not_found()
                return False
            time.sleep(3)
            # Bỏ cố định cột — optional, không fail nếu không có
            try:
                unfix_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Bỏ cố định cột trái')]")
                unfix_btn.click()
                time.sleep(2)
            except NoSuchElementException:
                try:
                    unfix_link = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Bỏ cố định cột trái')]")
                    unfix_link.click()
                    time.sleep(2)
                except NoSuchElementException:
                    pass
            # Chọn "Tất cả" — optional
            self._select_show_all()
            return True
        except TimeoutException as e:
            self.logger.error(f"❌ Timeout navigating to inventory: {e}")
            return False
        except Exception as e:
            self.logger.error(f"❌ Error navigating to inventory: {e}")
            return False

    def _select_show_all(self):
        """Click the 'Tất cả' option in the rows-per-page dropdown, then wait for all rows."""
        try:
            # The dropdown toggle shows current count (50/100/200/500/Tất cả)
            # Try clicking the toggle button first (label contains "Hiện" or current page size)
            toggle_clicked = False
            for xpath in [
                "//*[contains(@class,'dropdown')]//*[contains(text(),'Hiện')]",
                "//button[contains(text(),'50') or contains(text(),'100') or contains(text(),'200')]",
                "//*[@id='length_menu']",
                "//*[contains(@class,'dataTables_length')]//select",
                "//select[contains(@name,'length') or contains(@id,'length')]",
            ]:
                try:
                    el = self.driver.find_element(By.XPATH, xpath)
                    # If it's a <select>, use Select helper
                    if el.tag_name == 'select':
                        from selenium.webdriver.support.ui import Select as _Select
                        _Select(el).select_by_visible_text('Tất cả')
                        self.logger.info("✅ Selected 'Tất cả' via <select>")
                        toggle_clicked = True
                        break
                    else:
                        self.driver.execute_script("arguments[0].click();", el)
                        toggle_clicked = True
                        time.sleep(1)
                        break
                except Exception:
                    continue

            if toggle_clicked:
                # Now find and click "Tất cả" option in the opened dropdown
                for xpath in [
                    "//a[normalize-space(text())='Tất cả']",
                    "//li[normalize-space(text())='Tất cả']",
                    "//*[contains(@class,'dropdown-item') and normalize-space(text())='Tất cả']",
                    "//*[normalize-space(text())='Tất cả']",
                ]:
                    try:
                        opt = self.driver.find_element(By.XPATH, xpath)
                        self.driver.execute_script("arguments[0].click();", opt)
                        self.logger.info("✅ Clicked 'Tất cả' — waiting for all rows to load...")
                        # Wait up to 30s for row count to stabilise
                        time.sleep(5)
                        break
                    except Exception:
                        continue

        except Exception as e:
            self.logger.warning(f"⚠️ Could not select 'Tất cả': {e} — using default page size")

    def _debug_table_not_found(self):
        """Khi không tìm thấy table: chụp screenshot, log DOM, thử iframe."""
        self.logger.error("❌ Table not found — page structure may have changed")
        try:
            url = self.driver.current_url
            self.logger.info(f"  Current URL: {url}")
            # Screenshot
            os.makedirs('logs', exist_ok=True)
            shot = f"logs/inventory_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            self.driver.save_screenshot(shot)
            self.logger.info(f"  Screenshot: {shot}")
        except Exception as e:
            self.logger.warning(f"  Could not save screenshot: {e}")
        self._debug_dom()

    def _debug_dom(self):
        """Log DOM info to diagnose table structure."""
        try:
            info = self.driver.execute_script("""
                return {
                    tables:   document.querySelectorAll('table').length,
                    tbodies:  document.querySelectorAll('tbody').length,
                    tr_total: document.querySelectorAll('tr').length,
                    td_total: document.querySelectorAll('td').length,
                    th_total: document.querySelectorAll('th').length,
                    iframes:  document.querySelectorAll('iframe').length,
                    first_tr_class: (document.querySelector('tr') || {className:''}).className,
                };
            """)
            self.logger.info(f"🔍 DOM debug: {info}")
        except Exception as e:
            self.logger.warning(f"🔍 DOM debug failed: {e}")

    def _extract_page_data_js(self) -> tuple:
        """Extract header + rows from current page via a single JS call (stale-safe).

        Tries multiple table structures in order:
        1. Standard <table thead/tbody>
        2. Any <tr> with <th> for header, <tr> with <td> for rows
        3. Div-based grid (class contains 'row'/'col')
        """
        result = self.driver.execute_script("""
            function getText(el) {
                return (el.innerText || el.textContent || '').replace(/\\n/g, ' ').trim();
            }

            // ── Strategy 1: standard table ────────────────────────────────
            var tbls = document.querySelectorAll('table');
            for (var t = 0; t < tbls.length; t++) {
                var tbl = tbls[t];
                var ths = tbl.querySelectorAll('thead tr th');
                var trs = tbl.querySelectorAll('tbody tr');

                // Skip if no header AND no data rows
                if (ths.length === 0 && trs.length === 0) continue;

                var header = [];
                for (var i = 0; i < ths.length; i++) header.push(getText(ths[i]));

                var rows = [];
                for (var i = 0; i < trs.length; i++) {
                    var tds = trs[i].querySelectorAll('td');
                    if (tds.length === 0) continue;
                    var row = [];
                    for (var j = 0; j < tds.length; j++) row.push(getText(tds[j]));
                    rows.push(row);
                }

                if (rows.length > 0) return {header: header, rows: rows, strategy: 1};
            }

            // ── Strategy 2: any tr/th + tr/td (no explicit thead/tbody) ──
            var allTh = document.querySelectorAll('tr th');
            var allTd = document.querySelectorAll('tr td');
            if (allTh.length > 0 || allTd.length > 0) {
                var allTrs = document.querySelectorAll('tr');
                var header2 = [];
                var rows2   = [];
                for (var i = 0; i < allTrs.length; i++) {
                    var ths2 = allTrs[i].querySelectorAll('th');
                    var tds2 = allTrs[i].querySelectorAll('td');
                    if (ths2.length > 0 && rows2.length === 0) {
                        for (var j = 0; j < ths2.length; j++) header2.push(getText(ths2[j]));
                    } else if (tds2.length > 0) {
                        var row2 = [];
                        for (var j = 0; j < tds2.length; j++) row2.push(getText(tds2[j]));
                        rows2.push(row2);
                    }
                }
                if (rows2.length > 0) return {header: header2, rows: rows2, strategy: 2};
            }

            return {header: [], rows: [], strategy: 0};
        """)
        strategy = result.get('strategy', 0)
        if strategy > 0:
            self.logger.info(f"  📋 Extracted via strategy {strategy}")
        return result.get('header', []), result.get('rows', [])

    def _get_total_pages(self) -> int:
        """Read total page count from pagination links."""
        try:
            nums = []
            for el in self.driver.find_elements(By.CSS_SELECTOR, ".pagination a, .page-link"):
                try:
                    nums.append(int(el.text.strip()))
                except (ValueError, TypeError):
                    continue
            return max(nums) if nums else 1
        except Exception:
            return 1

    def scrape_inventory(self) -> list:
        """Scrape all rows and columns from the inventory table across pages.

        Uses a single JS call per page to extract cell text, avoiding
        StaleElementReferenceException caused by DOM re-renders during pagination.
        """
        try:
            # Wait for table — longer timeout since "Tất cả" loads many rows
            WebDriverWait(self.driver, 60).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
            )
            time.sleep(3)

            self._debug_dom()   # log DOM structure to help diagnose issues

            # Extract all rows in a single JS call (no pagination needed after "Tất cả")
            header, all_rows = self._extract_page_data_js()

            # Pad rows to header length
            col_count = len(header)
            for row in all_rows:
                while len(row) < col_count:
                    row.append('')

            self.logger.info(f"📊 Total rows collected: {len(all_rows)}")
            return [header] + all_rows if header else []

        except Exception as e:
            self.logger.error(f"❌ Error scraping inventory: {e}")
            return []

    def save_to_csv(self, data: list) -> str:
        """Save scraped data (including header) to a CSV file in data directory."""
        if not data:
            self.logger.warning("⚠️ No data to save")
            return ""
        header = data[0]
        rows = data[1:]
        # ensure data directory exists
        data_dir = self.config.get('data_processing', {}).get('data_dir', 'data')
        os.makedirs(data_dir, exist_ok=True)
        file_name = f"inventory_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        file_path = os.path.join(data_dir, file_name)
        try:
            # utf-8-sig: Excel mở đúng tiếng Việt (INVENTORY_ANALYSIS.md)
            with open(file_path, 'w', encoding='utf-8-sig', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(header)
                writer.writerows(rows)
            self.logger.info(f"💾 Inventory data saved to {file_path}")
            return file_path
        except Exception as e:
            self.logger.error(f"❌ Error saving CSV: {e}")
            return ""

    def run(self) -> dict:
        """Execute the end-to-end inventory extraction."""
        start_time = datetime.now()
        result = {
            "success": False,
            "start_time": start_time.isoformat(),
            "duration": 0,
            "rows": 0,
            "csv_file": "",
            "error": None
        }
        try:
            if not self.setup_driver():
                result['error'] = 'WebDriver initialization failed'
                return result
            if not self.login():
                result['error'] = 'Login failed'
                return result
            if not self.navigate_to_inventory():
                result['error'] = 'Navigation to inventory page failed'
                return result
            data = self.scrape_inventory()
            if data:
                result['rows'] = len(data) - 1  # exclude header
                csv_path = self.save_to_csv(data)
                result['csv_file'] = csv_path
                result['success'] = True
            else:
                result['error'] = 'No data scraped'
        except Exception as e:
            result['error'] = str(e)
        finally:
            end_time = datetime.now()
            result['duration'] = (end_time - start_time).total_seconds()
            result['end_time'] = end_time.isoformat()
            if self.driver:
                try:
                    self.driver.quit()
                except Exception:
                    pass
        return result


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Inventory automation - lấy tồn kho từ ONE')
    parser.add_argument('--config', default='config/config.json', help='Config path')
    parser.add_argument('--run-once', action='store_true', help='Alias (no-op, for compatibility)')
    args = parser.parse_args()

    automation = InventoryAutomationSystem(config_path=args.config)
    result = automation.run()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
