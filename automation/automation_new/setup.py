#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ONE System Setup Module - Thiết lập các thành phần hệ thống
Handles: WebDriver setup, environment setup, system health check
"""

import os
import sys
import time
import subprocess
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


class SystemSetup:
    """Class xử lý setup các thành phần hệ thống ONE"""

    def __init__(self, logger=None):
        self.logger = logger
        self.driver = None
        self.project_root = Path(__file__).parent

    def setup_directories(self):
        """Tạo cấu trúc thư mục cần thiết"""
        try:
            directories = ['logs', 'data', 'config']
            for dir_name in directories:
                dir_path = self.project_root / dir_name
                dir_path.mkdir(exist_ok=True)
                if self.logger:
                    self.logger.info(f"✅ Directory created/verified: {dir_name}/")
            return True
        except Exception as e:
            if self.logger:
                self.logger.error(f"❌ Failed to create directories: {e}")
            return False

    def setup_driver(self, headless=True):
        """Setup Chrome WebDriver với tối ưu performance"""
        try:
            if self.logger:
                self.logger.info("🌐 Setting up WebDriver...")

            chrome_options = Options()

            # Headless mode
            if headless:
                chrome_options.add_argument('--headless=new')

            # Core performance arguments
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')

            # Block unnecessary content to speed up loading
            chrome_options.add_experimental_option("prefs", {
                "profile.default_content_setting_values": {
                    "images": 2,        # Block images
                    "plugins": 2,       # Block plugins
                    "popups": 2,        # Block popups
                    "geolocation": 2,   # Block location requests
                    "notifications": 2, # Block notifications
                    "media_stream": 2,  # Block media stream
                }
            })

            # Advanced performance flags
            performance_args = [
                '--disable-extensions',
                '--disable-plugins',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-timer-throttling',
                '--disable-background-networking',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--no-first-run',
                '--disable-default-apps',
                '--log-level=3'
            ]

            for arg in performance_args:
                chrome_options.add_argument(arg)

            # Disable automation detection
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)

            # Chrome binary path for macOS
            chrome_binary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            if os.path.exists(chrome_binary):
                chrome_options.binary_location = chrome_binary

            # User agent
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

            # Setup driver
            try:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            except Exception as e:
                if self.logger:
                    self.logger.warning(f"ChromeDriverManager failed: {e}")
                service = Service()
                self.driver = webdriver.Chrome(service=service, options=chrome_options)

            # Optimized timeouts
            self.driver.implicitly_wait(3)
            self.driver.set_page_load_timeout(15)
            self.driver.set_script_timeout(3)

            # Hide automation detection
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )

            if self.logger:
                self.logger.info("✅ WebDriver setup successfully")
            return self.driver

        except Exception as e:
            if self.logger:
                self.logger.error(f"❌ WebDriver setup failed: {e}")
            return None

    def verify_dependencies(self):
        """Kiểm tra các dependencies đã cài đặt"""
        try:
            if self.logger:
                self.logger.info("🔍 Verifying dependencies...")

            required_packages = [
                'selenium', 'pandas', 'requests', 'dotenv',
                'bs4', 'openpyxl', 'schedule', 'loguru'
            ]

            missing_packages = []

            for package in required_packages:
                try:
                    if package == 'dotenv':
                        import dotenv
                    elif package == 'bs4':
                        import bs4
                    else:
                        __import__(package)

                    if self.logger:
                        self.logger.info(f"  ✅ {package}")
                except ImportError:
                    missing_packages.append(package)
                    if self.logger:
                        self.logger.warning(f"  ❌ {package}")

            if missing_packages:
                if self.logger:
                    self.logger.error(f"❌ Missing packages: {', '.join(missing_packages)}")
                return False
            else:
                if self.logger:
                    self.logger.info("✅ All dependencies verified")
                return True

        except Exception as e:
            if self.logger:
                self.logger.error(f"❌ Dependency verification failed: {e}")
            return False

    def check_environment(self):
        """Kiểm tra environment variables"""
        try:
            from dotenv import load_dotenv
            load_dotenv()

            env_file = self.project_root / '.env'
            if env_file.exists():
                if self.logger:
                    self.logger.info("✅ .env file found")
                return True
            else:
                if self.logger:
                    self.logger.warning("⚠️ .env file not found")
                return False

        except Exception as e:
            if self.logger:
                self.logger.error(f"❌ Environment check failed: {e}")
            return False

    def setup_all_components(self, headless=True):
        """Setup tất cả các thành phần"""
        try:
            if self.logger:
                self.logger.info("🔧 Setting up ONE System components...")

            results = {}
            success_count = 0

            # 1. Setup directories
            if self.setup_directories():
                results['directories'] = True
                success_count += 1
            else:
                results['directories'] = False

            # 2. Verify dependencies
            if self.verify_dependencies():
                results['dependencies'] = True
                success_count += 1
            else:
                results['dependencies'] = False

            # 3. Check environment
            if self.check_environment():
                results['environment'] = True
                success_count += 1
            else:
                results['environment'] = False

            # 4. Setup WebDriver
            driver = self.setup_driver(headless)
            if driver:
                results['webdriver'] = True
                success_count += 1
                # Clean up test driver
                driver.quit()
            else:
                results['webdriver'] = False

            total_components = len(results)

            if self.logger:
                self.logger.info(f"✅ Setup completed: {success_count}/{total_components} components successful")

            return {
                'success': success_count >= 3,  # At least 3/4 components should work
                'results': results,
                'successful_count': success_count,
                'total_count': total_components
            }

        except Exception as e:
            if self.logger:
                self.logger.error(f"❌ Setup all components failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'results': {},
                'successful_count': 0,
                'total_count': 0
            }

    def cleanup(self):
        """Cleanup resources"""
        try:
            if self.driver:
                self.driver.quit()
                if self.logger:
                    self.logger.info("🧹 WebDriver cleaned up")
        except Exception as e:
            if self.logger:
                self.logger.warning(f"⚠️ Cleanup warning: {e}")


def setup_automation_system(logger=None, headless=True):
    """Convenience function để setup hệ thống ONE"""
    setup_manager = SystemSetup(logger)
    return setup_manager.setup_all_components(headless)


if __name__ == "__main__":
    # Simple test setup
    import sys
    sys.path.append(os.path.dirname(__file__))

    # Simple logger for testing
    class SimpleLogger:
        def info(self, msg): print(f"INFO: {msg}")
        def warning(self, msg): print(f"WARNING: {msg}")
        def error(self, msg): print(f"ERROR: {msg}")
        def success(self, msg): print(f"SUCCESS: {msg}")

    logger = SimpleLogger()

    print("🚀 Testing ONE System Setup...")
    result = setup_automation_system(logger, headless=True)

    if result['success']:
        print(f"✅ Setup successful: {result['successful_count']}/{result['total_count']} components")
    else:
        print(f"❌ Setup failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)
