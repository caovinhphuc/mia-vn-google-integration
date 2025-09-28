#!/usr/bin/env python3
"""
ONE Automation System - Health Check
Kiểm tra trạng thái hoạt động của hệ thống
"""

import os
import sys
import json
import time
import psutil
import requests
from datetime import datetime, timedelta
from pathlib import Path

def check_system_resources():
    """Kiểm tra tài nguyên hệ thống"""
    print("🔍 Kiểm tra tài nguyên hệ thống...")

    # CPU usage
    cpu_percent = psutil.cpu_percent(interval=1)
    print(f"  💻 CPU: {cpu_percent}%")

    # Memory usage
    memory = psutil.virtual_memory()
    print(f"  🧠 RAM: {memory.percent}% ({memory.used // 1024 // 1024}MB / {memory.total // 1024 // 1024}MB)")

    # Disk usage
    disk = psutil.disk_usage('/')
    print(f"  💾 Disk: {disk.percent}% ({disk.used // 1024 // 1024 // 1024}GB / {disk.total // 1024 // 1024 // 1024}GB)")

    # Check if resources are healthy
    issues = []
    if cpu_percent > 80:
        issues.append("CPU usage cao")
    if memory.percent > 85:
        issues.append("RAM usage cao")
    if disk.percent > 90:
        issues.append("Disk usage cao")

    return issues

def check_processes():
    """Kiểm tra process automation đang chạy"""
    print("🔍 Kiểm tra processes...")

    automation_processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['cmdline'] and any('automation.py' in cmd for cmd in proc.info['cmdline']):
                automation_processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'cmdline': ' '.join(proc.info['cmdline'])
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    if automation_processes:
        print(f"  ✅ Tìm thấy {len(automation_processes)} automation process(es)")
        for proc in automation_processes:
            print(f"    PID {proc['pid']}: {proc['cmdline']}")
    else:
        print("  ❌ Không tìm thấy automation process nào")

    return len(automation_processes) > 0

def check_files_and_directories():
    """Kiểm tra files và directories cần thiết"""
    print("🔍 Kiểm tra files và directories...")

    required_items = {
        'files': ['automation.py', 'utils.py', 'requirements.txt', 'config/config.json'],
        'directories': ['data', 'logs', 'reports', 'config']
    }

    issues = []

    # Check files
    for file_path in required_items['files']:
        if not Path(file_path).exists():
            issues.append(f"File thiếu: {file_path}")
        else:
            print(f"  ✅ {file_path}")

    # Check directories
    for dir_path in required_items['directories']:
        if not Path(dir_path).exists():
            issues.append(f"Directory thiếu: {dir_path}")
        else:
            print(f"  ✅ {dir_path}/")

    return issues

def check_log_files():
    """Kiểm tra log files gần đây"""
    print("🔍 Kiểm tra log files...")

    logs_dir = Path('logs')
    if not logs_dir.exists():
        return ["Thư mục logs không tồn tại"]

    # Find recent log files
    now = datetime.now()
    recent_logs = []

    for log_file in logs_dir.glob('*.log'):
        mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
        if now - mtime < timedelta(days=7):
            recent_logs.append({
                'file': log_file.name,
                'size': log_file.stat().st_size,
                'mtime': mtime
            })

    if recent_logs:
        print(f"  ✅ Tìm thấy {len(recent_logs)} log file(s) gần đây")
        for log in sorted(recent_logs, key=lambda x: x['mtime'], reverse=True)[:3]:
            size_mb = log['size'] / 1024 / 1024
            print(f"    {log['file']}: {size_mb:.1f}MB ({log['mtime'].strftime('%Y-%m-%d %H:%M')})")
    else:
        print("  ❌ Không tìm thấy log file nào gần đây")

    return []

def check_data_files():
    """Kiểm tra data files gần đây"""
    print("🔍 Kiểm tra data files...")

    data_dir = Path('data')
    if not data_dir.exists():
        return ["Thư mục data không tồn tại"]

    # Count files by type
    file_counts = {}
    total_size = 0

    for data_file in data_dir.rglob('*'):
        if data_file.is_file():
            ext = data_file.suffix.lower()
            file_counts[ext] = file_counts.get(ext, 0) + 1
            total_size += data_file.stat().st_size

    if file_counts:
        print(f"  ✅ Tổng cộng {sum(file_counts.values())} file(s), {total_size / 1024 / 1024:.1f}MB")
        for ext, count in sorted(file_counts.items()):
            print(f"    {ext or 'no extension'}: {count} file(s)")
    else:
        print("  ❌ Không tìm thấy data file nào")

    return []

def check_configuration():
    """Kiểm tra cấu hình"""
    print("🔍 Kiểm tra cấu hình...")

    issues = []

    # Check config.json
    config_file = Path('config/config.json')
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)

            # Check required sections
            required_sections = ['system', 'schedule', 'notifications', 'data_processing']
            for section in required_sections:
                if section not in config:
                    issues.append(f"Config section thiếu: {section}")
                else:
                    print(f"  ✅ {section}")

        except json.JSONDecodeError as e:
            issues.append(f"Config JSON không hợp lệ: {e}")
    else:
        issues.append("File config.json không tồn tại")

    # Check .env file
    env_file = Path('.env')
    if env_file.exists():
        print("  ✅ .env file")
    else:
        issues.append("File .env không tồn tại")

    return issues

def check_network_connectivity():
    """Kiểm tra kết nối mạng"""
    print("🔍 Kiểm tra kết nối mạng...")

    # Test URLs
    test_urls = [
        'https://google.com',
        'https://github.com'
    ]

    issues = []
    for url in test_urls:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"  ✅ {url}")
            else:
                issues.append(f"HTTP {response.status_code} from {url}")
        except requests.exceptions.RequestException as e:
            issues.append(f"Không thể kết nối {url}: {e}")

    return issues

def generate_health_report():
    """Tạo báo cáo tổng hợp"""
    print("\n" + "="*60)
    print("📊 BÁO CÁO SỨC KHỎE HỆ THỐNG")
    print("="*60)

    all_issues = []

    # Run all checks
    checks = [
        ("System Resources", check_system_resources),
        ("Processes", lambda: [] if check_processes() else ["Automation process không chạy"]),
        ("Files & Directories", check_files_and_directories),
        ("Log Files", check_log_files),
        ("Data Files", check_data_files),
        ("Configuration", check_configuration),
        ("Network Connectivity", check_network_connectivity)
    ]

    for check_name, check_func in checks:
        print(f"\n{check_name}:")
        try:
            issues = check_func()
            all_issues.extend(issues)
        except Exception as e:
            issue = f"Lỗi khi kiểm tra {check_name}: {e}"
            print(f"  ❌ {issue}")
            all_issues.append(issue)

    # Summary
    print("\n" + "="*60)
    print("📋 TỔNG KẾT")
    print("="*60)

    if not all_issues:
        print("✅ Hệ thống hoạt động bình thường!")
        return True
    else:
        print(f"❌ Phát hiện {len(all_issues)} vấn đề:")
        for i, issue in enumerate(all_issues, 1):
            print(f"  {i}. {issue}")
        return False

def main():
    """Main function"""
    print("🏥 ONE Automation System - Health Check")
    print(f"⏰ Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Change to script directory
    os.chdir(Path(__file__).parent)

    # Generate report
    is_healthy = generate_health_report()

    # Exit with appropriate code
    sys.exit(0 if is_healthy else 1)

if __name__ == "__main__":
    main()
