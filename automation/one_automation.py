#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔄 June Fresh Session Processor WITH PRODUCT ANALYSIS
Strategy: Login → Extract + Analyze Products → Save → Logout → Repeat
"""

import sys
import time
import os
import json
import requests
import re
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scripts.login_manager import CompleteLoginManager
from scripts.date_customizer import DateCustomizer
from scripts.pagination_handler import PaginationHandler
from scripts.enhanced_scraper import EnhancedScraper


def _load_date_range():
    """Load date range from daterange_config.json; fall back to current month."""
    config_path = os.path.join(
        os.path.dirname(__file__), "config", "daterange_config.json"
    )
    try:
        with open(config_path, encoding="utf-8") as f:
            cfg = json.load(f)
        dr = cfg.get("date_range", {})
        start = dr.get("start_date")
        end = dr.get("end_date")
        if start and end:
            return start, end
    except Exception:
        pass
    now = datetime.now()
    return now.replace(day=1).strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d")


class JuneFreshSessionWithProducts:
    """🔄 Fresh session per page processor WITH product analysis"""

    def __init__(self):
        self.target_records = 23452
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.processed_pages = 0
        self.total_extracted = 0
        self.total_products_extracted = 0

    def login_and_setup(self):
        """🔐 Fresh login and setup for each page"""
        try:
            print("🔐 Fresh login and setup...")

            login_manager = CompleteLoginManager()
            login_result = login_manager.complete_login_process()

            if not login_result['success']:
                print(f"❌ Login failed: {login_result['error']}")
                return None, None, None, None, None

            components = login_result['components']
            driver = components['driver']
            logger = components['logger']

            # Setup date range — reads from config/daterange_config.json
            start_date, end_date = _load_date_range()
            date_customizer = DateCustomizer(driver, logger)
            if not date_customizer.set_date_range(start_date, end_date, 'ecom'):
                return None, None, None, None, None
            if not date_customizer.set_display_limit(2000):
                return None, None, None, None, None
            if not date_customizer.apply_filters(wait_for_load=True):
                return None, None, None, None, None

            # Wait for data load
            time.sleep(5)

            pagination_handler = PaginationHandler(driver, logger)
            enhanced_scraper = EnhancedScraper(driver, logger)

            print("✅ Fresh session ready")
            return login_manager, driver, logger, pagination_handler, enhanced_scraper

        except Exception as e:
            print(f"❌ Session setup failed: {e}")
            return None, None, None, None, None

    def navigate_to_page(self, target_page, pagination_handler):
        """📄 Navigate directly to specific page"""
        try:
            if target_page == 1:
                print("📄 Already on page 1")
                return True

            print(f"🎯 Navigating to page {target_page}...")

            # Use DataTables API to go to specific page
            navigate_script = f"""
            if (typeof $ !== 'undefined' && $('#orderTB').length > 0) {{
                var table = $('#orderTB').DataTable();
                table.page({target_page - 1}).draw('page');
                return true;
            }}
            return false;
            """

            success = pagination_handler.driver.execute_script(navigate_script)
            if success:
                print(f"✅ Navigation API called for page {target_page}")

                # Wait for page load
                time.sleep(8)

                print(f"✅ Successfully navigated to page {target_page}")
                return True
            else:
                print(f"❌ Navigation API failed for page {target_page}")
                return False

        except Exception as e:
            print(f"❌ Navigation to page {target_page} failed: {e}")
            return False

    def extract_page_data(self, page_number, enhanced_scraper, driver, logger):
        """📊 Extract data from current page WITH product analysis"""
        try:
            print(f"📊 Extracting data from page {page_number}...")

            # Wait for stability
            time.sleep(3)

            # Step 1: Extract basic data
            page_data = enhanced_scraper.extract_single_page_data()

            if not page_data:
                print("❌ No basic data extracted")
                return []

            # Step 2: Extract order IDs for product analysis
            order_ids = self.extract_order_ids_from_data(page_data)
            print(f"🆔 Found {len(order_ids)} order IDs for product analysis")

            # Step 3: Get product details
            product_details = {}
            if order_ids:
                product_details = self.extract_product_details_batch(order_ids, driver, logger)
                print(f"🛍️ Got product details for {len(product_details)} orders")

            # Step 4: Merge and enhance data
            enhanced_data = []
            for i, order in enumerate(page_data):
                order['session_id'] = self.session_id
                order['page_number'] = page_number
                order['page_position'] = i + 1
                order['processing_timestamp'] = datetime.now().isoformat()
                order['extraction_method'] = 'Fresh Session Per Page WITH Products'

                # Clean basic data
                order_id = order.get('id') or order.get('col_1', '')
                if order_id:
                    order['order_id_clean'] = str(order_id).strip()

                customer = order.get('customer') or order.get('col_4', '')
                if customer:
                    order['customer_name_clean'] = str(customer).strip()

                order_code = order.get('order_code') or order.get('col_2', '')
                if order_code:
                    order['order_code_clean'] = str(order_code).strip()

                order['month'] = 'June'
                order['year'] = '2025'
                order['date_range'] = 'June 2025'

                # Add product details if available
                order_id_str = str(order_id).strip()
                if order_id_str in product_details:
                    details = product_details[order_id_str]

                    # Add product information
                    order['products'] = details['products']
                    order['product_count'] = details['product_count']
                    order['raw_product_detail'] = details['raw_detail']

                    # Add additional API data
                    order['api_customer'] = details.get('customer', '')
                    order['api_amount'] = details.get('amount_total', '')
                    order['api_transporter'] = details.get('transporter', '')
                    order['api_address'] = details.get('address', '')
                    order['api_phone'] = details.get('phone', '')

                    # Create product summary
                    if details['products']:
                        product_names = [p['name'] for p in details['products']]
                        order['product_summary'] = '; '.join(product_names[:3])
                        order['total_items'] = sum(p['quantity'] for p in details['products'])
                    else:
                        order['product_summary'] = 'No products'
                        order['total_items'] = 0

                    order['has_product_details'] = True
                else:
                    # No product details available
                    order['products'] = []
                    order['product_count'] = 0
                    order['product_summary'] = 'Details not available'
                    order['total_items'] = 0
                    order['has_product_details'] = False

                enhanced_data.append(order)

            # Count products for tracking
            total_products = sum(order.get('product_count', 0) for order in enhanced_data)
            orders_with_products = len([o for o in enhanced_data if o.get('has_product_details', False)])

            print(f"✅ Enhanced {len(enhanced_data)} orders:")
            print(f"   🛍️ Total products: {total_products}")
            print(f"   📊 Orders with products: {orders_with_products}/{len(enhanced_data)}")

            return enhanced_data

        except Exception as e:
            print(f"❌ Data extraction failed: {e}")
            return []

    def extract_order_ids_from_data(self, page_data):
        """🆔 Extract order IDs from page data"""
        try:
            order_ids = []

            for order in page_data:
                # Try multiple fields for order ID
                order_id = order.get('id') or order.get('col_1', '') or order.get('order_id', '')

                if order_id and str(order_id).strip().isdigit():
                    order_ids.append(str(order_id).strip())

            return list(set(order_ids))  # Remove duplicates

        except Exception as e:
            print(f"❌ Error extracting order IDs: {e}")
            return []

    def extract_product_details_batch(self, order_ids, driver, logger, batch_size=50):
        """📦 Extract product details for order IDs (với batch processing)"""
        try:
            print(f"📦 Extracting product details for {len(order_ids)} orders (batch_size={batch_size})...")

            product_details = {}
            
            # Chia nhỏ thành batches để tránh URL quá dài
            total_batches = (len(order_ids) + batch_size - 1) // batch_size
            
            for batch_num in range(total_batches):
                start_idx = batch_num * batch_size
                end_idx = min(start_idx + batch_size, len(order_ids))
                batch_ids = order_ids[start_idx:end_idx]
                
                print(f"📦 Processing batch {batch_num + 1}/{total_batches}: {len(batch_ids)} orders...")

                # Try direct API call first (fastest method)
                batch_details = self.fetch_json_api_direct(batch_ids, driver)

                if not batch_details:
                    print(f"⚠️ API direct failed for batch {batch_num + 1}, trying UI method...")
                    # Fallback to UI method if needed
                    batch_details = self.fetch_json_via_ui(batch_ids, driver)

                # Merge results
                product_details.update(batch_details)
                
                # Progress logging
                processed = min(end_idx, len(order_ids))
                print(f"⚡ Progress: {processed}/{len(order_ids)} orders processed ({len(product_details)} successful)")

                # Small delay between batches to avoid overwhelming the server
                if batch_num < total_batches - 1:
                    time.sleep(0.5)

            print(f"✅ Completed: Got product details for {len(product_details)}/{len(order_ids)} orders")
            return product_details

        except Exception as e:
            print(f"❌ Error extracting product details: {e}")
            return {}

    def fetch_json_api_direct(self, order_ids, driver):
        """🌐 Direct API call for product details"""
        try:
            # Build API URL
            ids_str = ','.join(map(str, order_ids))
            api_url = f"https://one.tga.com.vn/so/invoiceJSON?id={ids_str}"

            # Get cookies from current session
            cookies = {cookie['name']: cookie['value'] for cookie in driver.get_cookies()}

            print(f"🌐 API call: {api_url[:50]}...")

            # Make API request
            response = requests.get(api_url, cookies=cookies, timeout=15)

            if response.status_code == 200:
                # Check content-type before parsing
                content_type = response.headers.get('Content-Type', '').lower()
                
                if 'application/json' not in content_type and 'text/json' not in content_type:
                    # Response is not JSON, likely HTML (error page or login page)
                    if response.text.strip().startswith('<!DOCTYPE') or response.text.strip().startswith('<html'):
                        print(f"⚠️ API returned HTML instead of JSON (possible session expired or request too large)")
                        print(f"   URL length: {len(api_url)} chars, Orders count: {len(order_ids)}")
                        print(f"   Suggestion: Reduce batch size or check session")
                        return {}
                    else:
                        print(f"⚠️ Unexpected content-type: {content_type}")
                
                try:
                    data = response.json()
                    if not data.get('error', True) and data.get('data'):
                        print(f"✅ API success: Got {len(data['data'])} orders")
                        return self.parse_json_response(data['data'])
                    else:
                        print(f"⚠️ API response error: {data.get('error', 'Unknown error')}")
                except (ValueError, json.JSONDecodeError) as json_error:
                    print(f"⚠️ API call failed: JSON decode error")
                    print(f"   Response preview: {response.text[:200]}...")
                    if len(order_ids) > 100:
                        print(f"   ⚠️ Too many orders ({len(order_ids)}). Try reducing batch size.")
                    return {}
            else:
                print(f"⚠️ API status code: {response.status_code}")
                if response.status_code == 403:
                    print(f"   Possible: Session expired or insufficient permissions")
                elif response.status_code == 414:
                    print(f"   URL too long. Try reducing batch size (currently {len(order_ids)} orders)")

            return {}

        except Exception as e:
            print(f"⚠️ API call failed: {e}")
            return {}

    def parse_json_response(self, json_data):
        """📋 Parse JSON response and extract product details"""
        try:
            product_details = {}

            for order in json_data:
                order_id = str(order.get('id', ''))
                detail = order.get('detail', '')

                if order_id and detail:
                    # Parse product details
                    products = self.parse_product_detail(detail)

                    product_details[order_id] = {
                        'products': products,
                        'product_count': len(products),
                        'raw_detail': detail,
                        'customer': order.get('customer', ''),
                        'amount_total': order.get('amount_total', ''),
                        'transporter': order.get('transporter', ''),
                        'address': order.get('address', ''),
                        'phone': order.get('phone', '')
                    }

            return product_details

        except Exception as e:
            print(f"❌ Error parsing JSON response: {e}")
            return {}

    def parse_product_detail(self, detail_string):
        """🛍️ Parse product detail string into structured data"""
        try:
            products = []

            # Split by comma
            items = detail_string.split(',')

            for item in items:
                item = item.strip()
                if not item:
                    continue

                # Extract quantity using regex
                quantity_match = re.search(r'\((\d+)\)$', item)

                if quantity_match:
                    quantity = int(quantity_match.group(1))
                    product_name = item[:quantity_match.start()].strip()
                else:
                    quantity = 1
                    product_name = item

                if product_name:
                    products.append({
                        'name': product_name,
                        'quantity': quantity
                    })

            return products

        except Exception as e:
            print(f"❌ Error parsing product detail: {e}")
            return []

    def fetch_json_via_ui(self, order_ids, driver):
        """🖱️ UI interaction fallback method"""
        try:
            print("🖱️ Fallback to UI interaction...")

            # Step 1: Select checkboxes for order IDs
            selected_count = self.select_order_checkboxes(order_ids, driver)

            if selected_count == 0:
                print("⚠️ No checkboxes selected")
                return {}

            # Step 2: Click "Lấy JSON" button
            json_data = self.click_json_button(driver)

            # Step 3: Parse response
            if json_data:
                return self.parse_json_response(json_data)

            return {}

        except Exception as e:
            print(f"❌ UI method failed: {e}")
            return {}

    def select_order_checkboxes(self, order_ids, driver):
        """☑️ Select checkboxes for given order IDs"""
        try:
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC

            selected_count = 0

            for order_id in order_ids:
                try:
                    # Find checkbox for this order ID
                    checkbox_selectors = [
                        f"input[type='checkbox'][value='{order_id}']",
                        f"//tr[td[contains(text(), '{order_id}')]]//input[@type='checkbox']"
                    ]

                    checkbox = None
                    for selector in checkbox_selectors:
                        try:
                            if selector.startswith("//"):
                                checkbox = driver.find_element(By.XPATH, selector)
                            else:
                                checkbox = driver.find_element(By.CSS_SELECTOR, selector)
                            break
                        except:
                            continue

                    if checkbox and not checkbox.is_selected():
                        # Scroll to checkbox
                        driver.execute_script("arguments[0].scrollIntoView();", checkbox)
                        time.sleep(0.1)

                        # Click checkbox
                        checkbox.click()
                        selected_count += 1
                        print(f"✅ Selected order {order_id}")

                except Exception as e:
                    print(f"⚠️ Cannot select order {order_id}: {e}")
                    continue

            print(f"✅ Selected {selected_count}/{len(order_ids)} checkboxes")
            return selected_count

        except Exception as e:
            print(f"❌ Error selecting checkboxes: {e}")
            return 0

    def click_json_button(self, driver):
        """🔘 Click 'Lấy JSON' button and get response"""
        try:
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.common.exceptions import TimeoutException

            # Find "Lấy JSON" button
            json_button_selectors = [
                "//button[contains(text(), 'Lấy JSON')]",
                "//a[contains(text(), 'Lấy JSON')]",
                "button[title*='JSON']",
                ".json-btn"
            ]

            json_button = None
            for selector in json_button_selectors:
                try:
                    if selector.startswith("//"):
                        json_button = WebDriverWait(driver, 3).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        json_button = WebDriverWait(driver, 3).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    break
                except TimeoutException:
                    continue

            if not json_button:
                print("❌ Cannot find 'Lấy JSON' button")
                return None

            # Click button
            json_button.click()
            print("✅ Clicked 'Lấy JSON' button")

            # Wait for new page/response
            time.sleep(2)

            # Check if redirected to JSON page
            current_url = driver.current_url
            if "invoiceJSON" in current_url:
                # Extract JSON from page
                try:
                    json_text = driver.find_element(By.TAG_NAME, "pre").text
                    json_data = json.loads(json_text)

                    if not json_data.get('error', True) and json_data.get('data'):
                        print(f"✅ Got JSON data for {len(json_data['data'])} orders")
                        return json_data['data']
                except Exception as e:
                    print(f"⚠️ Error parsing JSON from page: {e}")

            # Alternative: Check for JSON in response
            try:
                page_source = driver.page_source
                # Try to extract JSON from page source
                json_match = re.search(r'\{.*"data".*\}', page_source, re.DOTALL)
                if json_match:
                    json_text = json_match.group(0)
                    json_data = json.loads(json_text)
                    if json_data.get('data'):
                        return json_data['data']
            except Exception as e:
                print(f"⚠️ Error extracting JSON from page source: {e}")

            return None

        except Exception as e:
            print(f"❌ Error clicking JSON button: {e}")
            return None

    def save_page_data(self, page_data, page_number):
        """💾 Save enhanced page data with products"""
        try:
            if not page_data:
                return False

            print("💾 Saving enhanced page data...")

            # Local backup
            filename = f"data/june_2025_enhanced_page_{page_number:02d}_{self.session_id}.json"
            os.makedirs('data', exist_ok=True)

            # Calculate statistics
            total_products = sum(order.get('product_count', 0) for order in page_data)
            orders_with_products = len([o for o in page_data if o.get('has_product_details', False)])

            backup_data = {
                'metadata': {
                    'session_id': self.session_id,
                    'page_number': page_number,
                    'extraction_timestamp': datetime.now().isoformat(),
                    'total_records': len(page_data),
                    'total_products': total_products,
                    'orders_with_products': orders_with_products,
                    'product_extraction_rate': f"{orders_with_products/len(page_data)*100:.1f}%",
                    'date_range': 'June 2025',
                    'processing_method': 'Fresh Session Per Page WITH Products',
                    'target_total': self.target_records
                },
                'orders': page_data
            }

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)

            print(f"📁 Enhanced backup: {filename}")
            print(f"   📊 {len(page_data)} orders, {total_products} products")
            return True

        except Exception as e:
            print(f"❌ Save failed: {e}")
            return False

    def logout_and_cleanup(self, login_manager):
        """🚪 Logout and cleanup"""
        try:
            print("🚪 Logging out and cleaning up...")

            if login_manager:
                login_manager.cleanup()

            print("✅ Session cleaned up")

        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")

    def process_all_pages_with_products(self):
        """🎯 Process all pages with fresh session + product analysis"""
        try:
            start_time = time.time()

            print("🔄 JUNE 2025 FRESH SESSION + PRODUCT EXTRACTION")
            print("=" * 70)
            print("🎯 Strategy: Fresh Login/Logout Per Page + Product Analysis")
            print(f"📊 Target: {self.target_records:,} orders")
            print(f"📄 Estimated: 12 pages")
            print(f"🛍️ Feature: Complete product details extraction")
            print(f"🆔 Session: {self.session_id}")
            print("=" * 70)

            estimated_pages = 12
            successful_pages = []
            failed_pages = []

            for page_num in range(1, estimated_pages + 1):
                print(f"\n🔄 PROCESSING PAGE {page_num}/{estimated_pages}")
                print("=" * 50)

                page_start_time = time.time()

                # STEP 1: Fresh login and setup
                login_manager, driver, logger, pagination_handler, enhanced_scraper = self.login_and_setup()

                if not all([login_manager, driver, logger, pagination_handler, enhanced_scraper]):
                    print(f"❌ Page {page_num}: Setup failed")
                    failed_pages.append(page_num)
                    continue

                try:
                    # STEP 2: Navigate to target page
                    if self.navigate_to_page(page_num, pagination_handler):

                        # STEP 3: Extract data + products
                        page_data = self.extract_page_data(page_num, enhanced_scraper, driver, logger)

                        if page_data:
                            # STEP 4: Save enhanced data
                            if self.save_page_data(page_data, page_num):
                                self.processed_pages += 1
                                self.total_extracted += len(page_data)

                                # Count products
                                page_products = sum(order.get('product_count', 0) for order in page_data)
                                self.total_products_extracted += page_products

                                successful_pages.append(page_num)

                                page_time = time.time() - page_start_time
                                progress = (self.total_extracted / self.target_records) * 100

                                print(f"✅ Page {page_num} SUCCESS!")
                                print(f"   📦 Orders: {len(page_data)}")
                                print(f"   🛍️ Products: {page_products}")
                                print(f"   ⏱️ Time: {page_time:.1f}s")
                                print(f"   📈 Total Progress: {self.total_extracted:,}/{self.target_records:,} ({progress:.1f}%)")
                                print(f"   🛍️ Total Products: {self.total_products_extracted:,}")
                            else:
                                print(f"❌ Page {page_num}: Save failed")
                                failed_pages.append(page_num)
                        else:
                            print(f"❌ Page {page_num}: No data extracted")
                            failed_pages.append(page_num)
                    else:
                        print(f"❌ Page {page_num}: Navigation failed")
                        failed_pages.append(page_num)

                finally:
                    # STEP 5: Always logout and cleanup
                    self.logout_and_cleanup(login_manager)

                    # Wait between pages
                    print("⏳ Waiting between pages...")
                    time.sleep(5)

            # Final summary
            total_time = time.time() - start_time
            completion_rate = (self.total_extracted / self.target_records) * 100

            print("\n" + "=" * 70)
            print("🎉 FRESH SESSION + PRODUCT EXTRACTION COMPLETED!")
            print("=" * 70)
            print(f"🆔 Session: {self.session_id}")
            print(f"📊 Target: {self.target_records:,} orders")
            print(f"📦 Extracted: {self.total_extracted:,} orders")
            print(f"🛍️ Products: {self.total_products_extracted:,} products")
            print(f"📈 Completion: {completion_rate:.1f}%")
            print(f"📄 Pages: {self.processed_pages}/{estimated_pages}")
            print(f"⏱️ Total Time: {total_time/60:.1f} minutes")
            print(f"⚡ Rate: {self.total_extracted/total_time:.1f} orders/sec")

            if successful_pages:
                print(f"✅ Successful pages: {successful_pages}")
            if failed_pages:
                print(f"❌ Failed pages: {failed_pages}")

            print("=" * 70)

            return completion_rate >= 85

        except Exception as e:
            print(f"❌ Enhanced processing failed: {e}")
            return False


def main():
    processor = JuneFreshSessionWithProducts()

    try:
        success = processor.process_all_pages_with_products()
        return success

    except KeyboardInterrupt:
        print("\n🛑 Enhanced processing stopped by user")
        return False


if __name__ == "__main__":
    success = main()
    print(f"\n�� Enhanced fresh session extraction: {'SUCCESS' if success else 'PARTIAL'}")
    sys.exit(0 if success else 1)
