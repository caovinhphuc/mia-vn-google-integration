#!/usr/bin/env python3
"""
System Check - Kiểm tra toàn bộ hệ thống warehouse automation
"""

import os
import subprocess
import sys

# Map import name -> pip package name (gspread = Google Sheets cơ bản)
IMPORT_TO_PIP = {
    "selenium": "selenium",
    "webdriver_manager": "webdriver-manager",
    "schedule": "schedule",
    "pandas": "pandas",
    "openpyxl": "openpyxl",
    "dotenv": "python-dotenv",
    "requests": "requests",
    "matplotlib": "matplotlib",
    "seaborn": "seaborn",
    "numpy": "numpy",
    "xlsxwriter": "xlsxwriter",
    "bs4": "beautifulsoup4",
    "lxml": "lxml",
    "streamlit": "streamlit",
    "plotly": "plotly",
    "flask": "flask",
    "flask_cors": "flask-cors",
    "flask_compress": "Flask-Compress",
    "gspread": "gspread",
}

REQUIRED_PACKAGES = list(IMPORT_TO_PIP.keys())

# google.auth: import khác tên package pip
def _check_google_auth():
    try:
        import google.auth  # noqa: F401
        return True
    except ImportError:
        return False


def check_dependencies(auto_install=True):
    """Kiểm tra dependencies, tự cài thiếu nếu auto_install=True"""
    print("🔍 1. KIỂM TRA DEPENDENCIES")
    print("-" * 40)

    missing = []
    for pkg in REQUIRED_PACKAGES:
        try:
            __import__(pkg)
            print(f"✅ {pkg}")
        except ImportError:
            print(f"❌ {pkg} - THIẾU")
            missing.append(pkg)

    if _check_google_auth():
        print("✅ google.auth")
    else:
        print("❌ google.auth - THIẾU")
        missing.append("__google_auth__")

    if missing and auto_install:
        pip_names = []
        for p in missing:
            if p == "__google_auth__":
                pip_names.extend(["google-auth", "google-api-python-client"])
            else:
                pip_names.append(IMPORT_TO_PIP.get(p, p.replace("_", "-")))
        pip_names = list(dict.fromkeys(pip_names))  # dedupe
        print(f"\n📦 Đang cài thiếu: {' '.join(pip_names)}")
        rc = subprocess.call([sys.executable, "-m", "pip", "install", "-q"] + pip_names)
        if rc == 0:
            print("✅ Đã cài xong. Kiểm tra lại...")
            return check_dependencies(auto_install=False)
        print("⚠️ pip install thất bại, thử thủ công:")
    if missing:
        pip_hint = []
        for p in missing:
            if p == "__google_auth__":
                pip_hint.extend(["google-auth", "google-api-python-client"])
            else:
                pip_hint.append(IMPORT_TO_PIP.get(p, p.replace("_", "-")))
        print(f"   pip install {' '.join(dict.fromkeys(pip_hint))}")
        return False
    print(f"\n🎉 Tất cả dependencies OK (kể cả gspread / Google)!")
    return True


def main():
    """Chạy tất cả kiểm tra"""
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                    🔧 SYSTEM HEALTH CHECK                    ║")
    print("║              Warehouse Automation System v2.0               ║")
    print("╚══════════════════════════════════════════════════════════════╝\n")

    deps_ok = check_dependencies()

    if deps_ok:
        print("\n🎉 HỆ THỐNG SẴN SÀNG!")
        print("💡 Chạy: python automation.py")
        return True
    else:
        print("\n⚠️ HỆ THỐNG CHƯA SẴN SÀNG")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
