#!/usr/bin/env python3
"""
ONE Automation System - Test Runner
Chạy các test cases để kiểm tra hệ thống
"""

import unittest
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

class TestSystemSetup(unittest.TestCase):
    """Test cấu hình hệ thống"""

    def test_config_file_exists(self):
        """Kiểm tra file config tồn tại"""
        config_path = project_root / "config" / "config.json"
        self.assertTrue(config_path.exists(), "File config.json không tồn tại")

    def test_required_directories(self):
        """Kiểm tra các thư mục cần thiết"""
        required_dirs = ["data", "logs", "reports", "config"]
        for dir_name in required_dirs:
            dir_path = project_root / dir_name
            self.assertTrue(dir_path.exists(), f"Thư mục {dir_name} không tồn tại")

    def test_python_files(self):
        """Kiểm tra các file Python chính"""
        required_files = ["automation.py", "utils.py"]
        for file_name in required_files:
            file_path = project_root / file_name
            self.assertTrue(file_path.exists(), f"File {file_name} không tồn tại")

class TestEnvironmentVariables(unittest.TestCase):
    """Test biến môi trường"""

    def test_env_template_exists(self):
        """Kiểm tra file template môi trường"""
        env_template = project_root / "env_template.txt"
        self.assertTrue(env_template.exists(), "File env_template.txt không tồn tại")

class TestDependencies(unittest.TestCase):
    """Test dependencies"""

    def test_requirements_file(self):
        """Kiểm tra file requirements.txt"""
        req_file = project_root / "requirements.txt"
        self.assertTrue(req_file.exists(), "File requirements.txt không tồn tại")

        # Kiểm tra nội dung có các package cần thiết
        with open(req_file, 'r') as f:
            content = f.read()
            required_packages = ['selenium', 'pandas', 'schedule']
            for package in required_packages:
                self.assertIn(package, content, f"Package {package} không có trong requirements.txt")

class TestImports(unittest.TestCase):
    """Test import các module"""

    def test_import_automation(self):
        """Test import automation module"""
        try:
            import automation
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Không thể import automation: {e}")

    def test_import_utils(self):
        """Test import utils module"""
        try:
            import utils
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Không thể import utils: {e}")

def run_system_check():
    """Chạy kiểm tra hệ thống cơ bản"""
    print("🔍 Đang kiểm tra hệ thống...")

    # Kiểm tra Python version
    python_version = sys.version_info
    print(f"✅ Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")

    if python_version < (3, 7):
        print("❌ Cần Python 3.7 trở lên")
        return False

    # Kiểm tra các package cần thiết
    required_packages = {
        'selenium': 'Selenium WebDriver',
        'pandas': 'Data processing',
        'schedule': 'Task scheduling',
        'openpyxl': 'Excel support'
    }

    missing_packages = []
    for package, description in required_packages.items():
        try:
            __import__(package)
            print(f"✅ {package}: {description}")
        except ImportError:
            print(f"❌ {package}: {description} - THIẾU")
            missing_packages.append(package)

    if missing_packages:
        print(f"\n📦 Cài đặt các package thiếu:")
        print(f"pip install {' '.join(missing_packages)}")
        return False

    return True

def main():
    """Main function"""
    print("🤖 ONE Automation System - Test Runner")
    print("=" * 50)

    # Chạy system check trước
    if not run_system_check():
        print("\n❌ System check thất bại!")
        sys.exit(1)

    print("\n🧪 Chạy test cases...")
    print("=" * 50)

    # Tạo test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Thêm các test classes
    test_classes = [
        TestSystemSetup,
        TestEnvironmentVariables,
        TestDependencies,
        TestImports
    ]

    for test_class in test_classes:
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)

    # Chạy tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Kết quả
    print("\n" + "=" * 50)
    if result.wasSuccessful():
        print("✅ Tất cả tests đã pass!")
        print("🚀 Hệ thống sẵn sàng để chạy!")
    else:
        print("❌ Một số tests thất bại!")
        print(f"Failures: {len(result.failures)}")
        print(f"Errors: {len(result.errors)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
