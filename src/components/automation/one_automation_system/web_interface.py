#!/usr/bin/env python3
"""
ONE Automation System - Simple Web Interface
Giao diện web đơn giản để quản lý automation
"""

from flask import Flask, render_template_string, jsonify, request
import os
import json
import glob
from datetime import datetime
from utils import AutomationUtils

app = Flask(__name__)

# HTML Template
DASHBOARD_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>ONE Automation Control Panel</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0; padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
        }
        .controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .control-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            text-align: center;
            transition: transform 0.2s;
        }
        .control-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
            transition: background 0.2s;
        }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #1e7e34; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-warning:hover { background: #e0a800; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }

        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .status-running { background: #d4edda; color: #155724; }
        .status-stopped { background: #f8d7da; color: #721c24; }
        .status-idle { background: #fff3cd; color: #856404; }

        .logs {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 20px 0;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            background: #e9ecef;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
    </style>
    <script>
        function refreshStatus() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('status').innerHTML =
                        `<span class="status status-${data.status}">${data.message}</span>`;

                    // Update stats
                    document.getElementById('file-count').textContent = data.stats.file_count;
                    document.getElementById('last-run').textContent = data.stats.last_run;
                });
        }

        function runAutomation() {
            document.getElementById('run-btn').disabled = true;
            document.getElementById('run-btn').textContent = 'Đang chạy...';

            fetch('/api/run', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    document.getElementById('run-btn').disabled = false;
                    document.getElementById('run-btn').textContent = 'Chạy Automation';
                    refreshStatus();
                });
        }

        function generateDashboard() {
            fetch('/api/dashboard', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    alert('Dashboard đã được tạo: ' + data.file);
                });
        }

        // Auto refresh every 30 seconds
        setInterval(refreshStatus, 30000);

        // Initial load
        window.onload = refreshStatus;
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 ONE Automation Control Panel</h1>
            <p>Quản lý hệ thống tự động hóa - Cập nhật: {{ current_time }}</p>
            <div id="status">
                <span class="status status-idle">Đang tải...</span>
            </div>
        </div>

        <div class="controls">
            <div class="control-card">
                <h3>🚀 Automation</h3>
                <p>Chạy quy trình thu thập dữ liệu</p>
                <button id="run-btn" class="btn btn-success" onclick="runAutomation()">
                    Chạy Automation
                </button>
            </div>

            <div class="control-card">
                <h3>📊 Dashboard</h3>
                <p>Tạo báo cáo hiệu suất</p>
                <button class="btn btn-warning" onclick="generateDashboard()">
                    Tạo Dashboard
                </button>
            </div>

            <div class="control-card">
                <h3>🔍 Health Check</h3>
                <p>Kiểm tra trạng thái hệ thống</p>
                <button class="btn" onclick="window.open('/api/health', '_blank')">
                    Kiểm tra hệ thống
                </button>
            </div>

            <div class="control-card">
                <h3>📁 Files</h3>
                <p>Xem dữ liệu đã thu thập</p>
                <button class="btn" onclick="window.open('/api/files', '_blank')">
                    Xem Files
                </button>
            </div>
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number" id="file-count">-</div>
                <div class="stat-label">Files dữ liệu</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="last-run">-</div>
                <div class="stat-label">Lần chạy cuối</div>
            </div>
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def dashboard():
    """Trang chính"""
    return render_template_string(DASHBOARD_TEMPLATE,
                                current_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/api/status')
def api_status():
    """API trạng thái hệ thống"""
    try:
        # Kiểm tra files dữ liệu
        data_files = glob.glob('data/*.csv') + glob.glob('data/*.json')

        # Kiểm tra log files
        log_files = glob.glob('logs/*.log')
        last_run = "Chưa chạy"

        if log_files:
            latest_log = max(log_files, key=os.path.getctime)
            mtime = datetime.fromtimestamp(os.path.getctime(latest_log))
            last_run = mtime.strftime('%Y-%m-%d %H:%M')

        return jsonify({
            'status': 'idle',
            'message': 'Hệ thống sẵn sàng',
            'stats': {
                'file_count': len(data_files),
                'last_run': last_run
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi: {e}',
            'stats': {'file_count': 0, 'last_run': 'Error'}
        })

@app.route('/api/run', methods=['POST'])
def api_run():
    """API chạy automation"""
    try:
        # Import automation system
        from automation import OneAutomationSystem

        automation = OneAutomationSystem()
        result = automation.run_automation()

        if result['success']:
            return jsonify({
                'success': True,
                'message': f"Thành công! Thu thập được {result['order_count']} đơn hàng"
            })
        else:
            return jsonify({
                'success': False,
                'message': f"Thất bại: {result.get('error', 'Unknown error')}"
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi chạy automation: {e}'
        })

@app.route('/api/dashboard', methods=['POST'])
def api_dashboard():
    """API tạo dashboard"""
    try:
        utils = AutomationUtils()
        dashboard_file = utils.generate_dashboard()

        return jsonify({
            'success': True,
            'file': dashboard_file
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi tạo dashboard: {e}'
        })

@app.route('/api/health')
def api_health():
    """API health check"""
    try:
        # Simple health check
        health_info = {
            'timestamp': datetime.now().isoformat(),
            'status': 'healthy',
            'data_files': len(glob.glob('data/*')),
            'log_files': len(glob.glob('logs/*')),
            'config_exists': os.path.exists('config/config.json'),
            'env_exists': os.path.exists('.env')
        }

        return jsonify(health_info)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/files')
def api_files():
    """API danh sách files"""
    try:
        files = []

        # Data files
        for pattern in ['data/*.csv', 'data/*.json', 'data/*.xlsx']:
            for file_path in glob.glob(pattern):
                stat = os.stat(file_path)
                files.append({
                    'name': os.path.basename(file_path),
                    'path': file_path,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                })

        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    print("🌐 Starting ONE Automation Web Interface...")
    print("📍 Access at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
# Ensure to run this script with Flask installed
# You can install Flask using: pip install Flask
# Save this file as web_interface.py and run it with Python 3
