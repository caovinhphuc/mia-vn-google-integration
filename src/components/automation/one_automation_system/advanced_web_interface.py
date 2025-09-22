#!/usr/bin/env python3
"""
ONE Automation System - Advanced Web Interface
Giao diện web nâng cao với config và analytics
"""

from flask import Flask, render_template_string, jsonify, request
import os
import json
import glob
import pandas as pd
from datetime import datetime, timedelta
from utils import AutomationUtils
import threading

app = Flask(__name__)

# Advanced HTML Template với Config và Analytics
ADVANCED_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>ONE Automation Advanced Control Panel</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            margin: 0; padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333; min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }

        .nav-tabs {
            display: flex;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        .nav-tab {
            flex: 1;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            border: none;
            background: none;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .nav-tab:hover { background: #e2e8f0; }
        .nav-tab.active {
            background: white;
            border-bottom: 3px solid #4f46e5;
            color: #4f46e5;
        }

        .tab-content { display: none; padding: 30px; }
        .tab-content.active { display: block; }

        .grid {
            display: grid;
            gap: 24px;
            margin: 20px 0;
        }
        .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        .grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }

        .card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .card h3 { margin: 0 0 16px 0; color: #1e293b; font-size: 1.2em; }

        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
        }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn:hover { background: #4338ca; transform: translateY(-1px); }
        .btn:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
        .btn-success { background: #059669; }
        .btn-success:hover { background: #047857; }
        .btn-warning { background: #d97706; }
        .btn-warning:hover { background: #b45309; }
        .btn-danger { background: #dc2626; }
        .btn-danger:hover { background: #b91c1c; }
        .btn-outline { background: white; color: #4f46e5; border: 1px solid #4f46e5; }
        .btn-outline:hover { background: #4f46e5; color: white; }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .status-running { background: #dcfce7; color: #166534; }
        .status-stopped { background: #fee2e2; color: #991b1b; }
        .status-idle { background: #fef3c7; color: #92400e; }
        .status-success { background: #dbeafe; color: #1e40af; }

        .metric-card {
            text-align: center;
            padding: 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
        }
        .metric-number {
            font-size: 2.5em;
            font-weight: 700;
            color: #4f46e5;
            margin: 0;
        }
        .metric-label {
            color: #64748b;
            margin: 8px 0 0 0;
            font-weight: 500;
        }
        .metric-change {
            font-size: 0.9em;
            margin-top: 4px;
        }
        .metric-up { color: #059669; }
        .metric-down { color: #dc2626; }

        .chart-container {
            height: 300px;
            background: #f8fafc;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        .data-table th, .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        .data-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .data-table tr:hover {
            background: #f8fafc;
        }

        .config-section {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .config-section h4 {
            margin: 0 0 16px 0;
            color: #1e293b;
            font-size: 1.1em;
        }

        .notification {
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            display: none;
        }
        .notification.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .notification.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .notification.warning { background: #fef3c7; color: #92400e; border: 1px solid #fed7aa; }

        .loading { opacity: 0.6; pointer-events: none; }

        @media (max-width: 768px) {
            .container { margin: 10px; border-radius: 12px; }
            .header { padding: 20px; }
            .header h1 { font-size: 2em; }
            .tab-content { padding: 20px; }
            .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 ONE Automation Control Center</h1>
            <p>Quản lý và phân tích hệ thống tự động hóa - {{ current_time }}</p>
            <div id="status-indicator">
                <span class="status-indicator status-idle">🔄 Đang tải...</span>
            </div>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('dashboard')">📊 Dashboard</button>
            <button class="nav-tab" onclick="showTab('config')">⚙️ Cấu hình</button>
            <button class="nav-tab" onclick="showTab('analytics')">📈 Phân tích</button>
            <button class="nav-tab" onclick="showTab('control')">🎮 Điều khiển</button>
        </div>

        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-content active">
            <div class="grid grid-4">
                <div class="metric-card">
                    <div class="metric-number" id="total-runs">-</div>
                    <div class="metric-label">Lần chạy</div>
                    <div class="metric-change metric-up" id="runs-change">+0%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-number" id="total-orders">-</div>
                    <div class="metric-label">Đơn hàng</div>
                    <div class="metric-change metric-up" id="orders-change">+0%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-number" id="success-rate">-</div>
                    <div class="metric-label">Tỷ lệ thành công</div>
                    <div class="metric-change metric-up" id="success-change">+0%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-number" id="last-run">-</div>
                    <div class="metric-label">Lần chạy cuối</div>
                </div>
            </div>

            <div class="grid grid-2">
                <div class="card">
                    <h3>📊 Biểu đồ hiệu suất 7 ngày</h3>
                    <div class="chart-container">
                        📈 Biểu đồ sẽ hiển thị ở đây
                    </div>
                </div>
                <div class="card">
                    <h3>📋 Dữ liệu mới nhất</h3>
                    <div id="recent-data">Đang tải...</div>
                </div>
            </div>
        </div>

        <!-- Config Tab -->
        <div id="config" class="tab-content">
            <div class="notification" id="config-notification"></div>

            <div class="grid grid-2">
                <div class="card">
                    <h3>⚙️ Cấu hình Web Scraping</h3>
                    <div class="config-section">
                        <h4>Giới hạn thu thập</h4>
                        <div class="form-group">
                            <label>Số trang tối đa:</label>
                            <input type="number" id="max-pages" min="1" max="100" value="5">
                        </div>
                        <div class="form-group">
                            <label>Số đơn hàng tối đa:</label>
                            <input type="number" id="max-orders" min="10" max="10000" value="100">
                        </div>
                        <div class="form-group">
                            <label>Delay giữa các trang (giây):</label>
                            <input type="number" id="delay-pages" min="1" max="30" value="2">
                        </div>
                    </div>

                    <div class="config-section">
                        <h4>Timeout Settings</h4>
                        <div class="form-group">
                            <label>Login timeout (giây):</label>
                            <input type="number" id="login-timeout" min="5" max="60" value="7">
                        </div>
                        <div class="form-group">
                            <label>Page load timeout (giây):</label>
                            <input type="number" id="page-timeout" min="3" max="30" value="5">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>📅 Cấu hình lịch chạy</h3>
                    <div class="config-section">
                        <div class="form-group">
                            <label>Kích hoạt lịch chạy:</label>
                            <select id="schedule-enabled">
                                <option value="true">Bật</option>
                                <option value="false">Tắt</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tần suất:</label>
                            <select id="schedule-frequency">
                                <option value="daily">Hàng ngày</option>
                                <option value="hourly">Hàng giờ</option>
                                <option value="weekly">Hàng tuần</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Thời gian chạy:</label>
                            <input type="time" id="schedule-time" value="08:00">
                        </div>
                    </div>

                    <div class="config-section">
                        <h4>Email thông báo</h4>
                        <div class="form-group">
                            <label>Kích hoạt email:</label>
                            <select id="email-enabled">
                                <option value="true">Bật</option>
                                <option value="false">Tắt</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Email nhận thông báo:</label>
                            <input type="email" id="email-recipients" placeholder="admin@company.com">
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-2">
                <button class="btn btn-success" onclick="saveConfig()">
                    💾 Lưu cấu hình
                </button>
                <button class="btn btn-outline" onclick="loadConfig()">
                    🔄 Tải lại cấu hình
                </button>
            </div>
        </div>

        <!-- Analytics Tab -->
        <div id="analytics" class="tab-content">
            <div class="grid grid-3">
                <div class="card">
                    <h3>📊 Thống kê kênh bán hàng</h3>
                    <div id="channel-stats">Đang tải...</div>
                </div>
                <div class="card">
                    <h3>📈 Xu hướng đơn hàng</h3>
                    <div id="trend-stats">Đang tải...</div>
                </div>
                <div class="card">
                    <h3>⏱️ Hiệu suất hệ thống</h3>
                    <div id="performance-stats">Đang tải...</div>
                </div>
            </div>

            <div class="card">
                <h3>📋 Dữ liệu đơn hàng chi tiết</h3>
                <div class="form-group">
                    <label>Chọn file dữ liệu:</label>
                    <select id="data-file-select" onchange="loadDataFile()">
                        <option value="">-- Chọn file --</option>
                    </select>
                </div>
                <div id="data-details"></div>
            </div>
        </div>

        <!-- Control Tab -->
        <div id="control" class="tab-content">
            <div class="grid grid-3">
                <div class="card">
                    <h3>🚀 Chạy Automation</h3>
                    <p>Thu thập dữ liệu đơn hàng từ hệ thống ONE</p>
                    <button id="run-btn" class="btn btn-success" onclick="runAutomation()">
                        ▶️ Chạy ngay
                    </button>
                </div>

                <div class="card">
                    <h3>📊 Tạo Dashboard</h3>
                    <p>Tạo báo cáo HTML với analytics</p>
                    <button class="btn btn-warning" onclick="generateDashboard()">
                        📈 Tạo báo cáo
                    </button>
                </div>

                <div class="card">
                    <h3>🔍 Health Check</h3>
                    <p>Kiểm tra trạng thái hệ thống</p>
                    <button class="btn" onclick="runHealthCheck()">
                        🏥 Kiểm tra
                    </button>
                </div>
            </div>

            <div class="card">
                <h3>📁 Quản lý Files</h3>
                <div id="file-manager">Đang tải...</div>
            </div>
        </div>
    </div>

    <script>
        // Tab management
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');

            // Load tab-specific data
            if (tabName === 'analytics') loadAnalytics();
            if (tabName === 'control') loadFileManager();
            if (tabName === 'config') loadConfig();
        }

        // Auto refresh dashboard
        function refreshDashboard() {
            fetch('/api/dashboard-data')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('total-runs').textContent = data.metrics.total_runs || 0;
                    document.getElementById('total-orders').textContent = data.metrics.total_orders || 0;
                    document.getElementById('success-rate').textContent = (data.metrics.success_rate || 0).toFixed(1) + '%';
                    document.getElementById('last-run').textContent = data.metrics.last_run || 'Chưa có';

                    // Update status
                    const statusEl = document.getElementById('status-indicator');
                    statusEl.innerHTML = `<span class="status-indicator status-${data.status}">${data.message}</span>`;

                    // Update recent data
                    document.getElementById('recent-data').innerHTML = data.recent_data || 'Chưa có dữ liệu';
                });
        }

        // Load configuration
        function loadConfig() {
            fetch('/api/config')
                .then(response => response.json())
                .then(config => {
                    document.getElementById('max-pages').value = config.scraping?.max_pages || 5;
                    document.getElementById('max-orders').value = config.scraping?.max_orders || 100;
                    document.getElementById('delay-pages').value = config.scraping?.delay_between_pages || 2;
                    document.getElementById('login-timeout').value = config.system?.login_timeout || 7;
                    document.getElementById('page-timeout').value = config.system?.page_load_timeout || 5;
                    document.getElementById('schedule-enabled').value = config.schedule?.enabled || false;
                    document.getElementById('schedule-frequency').value = config.schedule?.frequency || 'daily';
                    document.getElementById('schedule-time').value = config.schedule?.time || '08:00';
                    document.getElementById('email-enabled').value = config.notifications?.email?.enabled || false;
                    document.getElementById('email-recipients').value = config.notifications?.email?.recipients?.[0] || '';
                });
        }

        // Save configuration
        function saveConfig() {
            const config = {
                scraping: {
                    max_pages: parseInt(document.getElementById('max-pages').value),
                    max_orders: parseInt(document.getElementById('max-orders').value),
                    delay_between_pages: parseInt(document.getElementById('delay-pages').value)
                },
                system: {
                    login_timeout: parseInt(document.getElementById('login-timeout').value),
                    page_load_timeout: parseInt(document.getElementById('page-timeout').value)
                },
                schedule: {
                    enabled: document.getElementById('schedule-enabled').value === 'true',
                    frequency: document.getElementById('schedule-frequency').value,
                    time: document.getElementById('schedule-time').value
                },
                notifications: {
                    email: {
                        enabled: document.getElementById('email-enabled').value === 'true',
                        recipients: [document.getElementById('email-recipients').value]
                    }
                }
            };

            fetch('/api/config', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(config)
            })
            .then(response => response.json())
            .then(data => {
                showNotification(data.success ? 'success' : 'error', data.message);
            });
        }

        // Load analytics
        function loadAnalytics() {
            fetch('/api/analytics')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('channel-stats').innerHTML = data.channel_stats || 'Chưa có dữ liệu';
                    document.getElementById('trend-stats').innerHTML = data.trend_stats || 'Chưa có dữ liệu';
                    document.getElementById('performance-stats').innerHTML = data.performance_stats || 'Chưa có dữ liệu';

                    // Populate file selector
                    const selector = document.getElementById('data-file-select');
                    selector.innerHTML = '<option value="">-- Chọn file --</option>';
                    data.data_files?.forEach(file => {
                        selector.innerHTML += `<option value="${file.name}">${file.name} (${file.size} bytes)</option>`;
                    });
                });
        }

        // Load file manager
        function loadFileManager() {
            fetch('/api/files')
                .then(response => response.json())
                .then(data => {
                    let html = '<table class="data-table"><thead><tr><th>File</th><th>Kích thước</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>';

                    data.files?.forEach(file => {
                        const date = new Date(file.modified).toLocaleString('vi-VN');
                        const size = (file.size / 1024).toFixed(1) + ' KB';
                        html += `<tr>
                            <td>${file.name}</td>
                            <td>${size}</td>
                            <td>${date}</td>
                            <td>
                                <button class="btn btn-outline" onclick="downloadFile('${file.path}')">📥 Tải</button>
                                <button class="btn btn-danger" onclick="deleteFile('${file.path}')">🗑️ Xóa</button>
                            </td>
                        </tr>`;
                    });

                    html += '</tbody></table>';
                    document.getElementById('file-manager').innerHTML = html;
                });
        }

        // Load data file details
        function loadDataFile() {
            const fileName = document.getElementById('data-file-select').value;
            if (!fileName) return;

            fetch(`/api/data-details?file=${fileName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        document.getElementById('data-details').innerHTML = `<p>Lỗi: ${data.error}</p>`;
                        return;
                    }

                    let html = `<h4>📊 ${fileName} - ${data.total_rows} dòng</h4>`;
                    html += '<table class="data-table"><thead><tr>';

                    data.columns.forEach(col => {
                        html += `<th>${col}</th>`;
                    });
                    html += '</tr></thead><tbody>';

                    data.sample_data.forEach(row => {
                        html += '<tr>';
                        Object.values(row).forEach(val => {
                            html += `<td>${val || ''}</td>`;
                        });
                        html += '</tr>';
                    });

                    html += '</tbody></table>';
                    document.getElementById('data-details').innerHTML = html;
                });
        }

        // Control functions
        function runAutomation() {
            const btn = document.getElementById('run-btn');
            btn.disabled = true;
            btn.innerHTML = '⏳ Đang chạy...';

            fetch('/api/run', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    showNotification(data.success ? 'success' : 'error', data.message);
                    btn.disabled = false;
                    btn.innerHTML = '▶️ Chạy ngay';
                    refreshDashboard();
                });
        }

        function generateDashboard() {
            fetch('/api/dashboard', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    showNotification('success', 'Dashboard đã được tạo: ' + data.file);
                });
        }

        function runHealthCheck() {
            fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                    const message = data.error ? `Lỗi: ${data.error}` : 'Hệ thống hoạt động bình thường';
                    showNotification(data.error ? 'error' : 'success', message);
                });
        }

        // Utility functions
        function showNotification(type, message) {
            const notification = document.getElementById('config-notification');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }

        function downloadFile(path) {
            window.open(`/api/download?file=${encodeURIComponent(path)}`, '_blank');
        }

        function deleteFile(path) {
            if (confirm('Bạn có chắc muốn xóa file này?')) {
                fetch('/api/delete', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({file: path})
                })
                .then(response => response.json())
                .then(data => {
                    showNotification(data.success ? 'success' : 'error', data.message);
                    if (data.success) loadFileManager();
                });
            }
        }

        // Initialize
        window.onload = function() {
            refreshDashboard();
            setInterval(refreshDashboard, 30000); // Auto refresh every 30s
        };
    </script>
</body>
</html>
"""

@app.route('/')
def advanced_dashboard():
    """Trang chính nâng cao"""
    return render_template_string(ADVANCED_TEMPLATE,
                                current_time=datetime.now().strftime('%d/%m/%Y %H:%M:%S'))

@app.route('/api/dashboard-data')
def api_dashboard_data():
    """API dữ liệu dashboard"""
    try:
        utils = AutomationUtils()
        performance = utils.analyze_performance(30)

        # Get recent data sample
        data_files = glob.glob('data/*.csv')
        recent_data = "Chưa có dữ liệu"

        if data_files:
            latest_file = max(data_files, key=os.path.getctime)
            try:
                df = pd.read_csv(latest_file)
                recent_data = f"<p><strong>{os.path.basename(latest_file)}</strong>: {len(df)} đơn hàng</p>"
                recent_data += "<table class='data-table'><thead><tr>"
                for col in df.columns[:4]:  # Show first 4 columns
                    recent_data += f"<th>{col}</th>"
                recent_data += "</tr></thead><tbody>"

                for _, row in df.head(5).iterrows():  # Show first 5 rows
                    recent_data += "<tr>"
                    for col in df.columns[:4]:
                        recent_data += f"<td>{row[col] if pd.notna(row[col]) else ''}</td>"
                    recent_data += "</tr>"
                recent_data += "</tbody></table>"
            except:
                recent_data = "Lỗi đọc dữ liệu"

        return jsonify({
            'status': 'idle',
            'message': 'Hệ thống sẵn sàng',
            'metrics': {
                'total_runs': performance.get('total_runs', 0),
                'total_orders': performance.get('total_orders', 0),
                'success_rate': performance.get('success_rate', 0),
                'last_run': performance.get('date_range', 'Chưa có')
            },
            'recent_data': recent_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi: {e}',
            'metrics': {'total_runs': 0, 'total_orders': 0, 'success_rate': 0, 'last_run': 'Error'},
            'recent_data': 'Lỗi tải dữ liệu'
        })

@app.route('/api/config', methods=['GET', 'POST'])
def api_config():
    """API quản lý cấu hình"""
    config_file = 'config/config.json'

    if request.method == 'GET':
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return jsonify(config)
        except Exception as e:
            return jsonify({'error': f'Lỗi đọc config: {e}'})

    else:  # POST
        try:
            new_config = request.json

            # Read current config
            with open(config_file, 'r', encoding='utf-8') as f:
                current_config = json.load(f)

            # Update specific sections
            for section, values in new_config.items():
                if section in current_config:
                    current_config[section].update(values)
                else:
                    current_config[section] = values

            # Save updated config
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(current_config, f, indent=2, ensure_ascii=False)

            return jsonify({
                'success': True,
                'message': 'Cấu hình đã được lưu thành công!'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Lỗi lưu config: {e}'
            })

@app.route('/api/analytics')
def api_analytics():
    """API phân tích dữ liệu"""
    try:
        data_files = []
        channel_stats = "Chưa có dữ liệu"
        trend_stats = "Chưa có dữ liệu"
        performance_stats = "Chưa có dữ liệu"

        # Get data files
        for pattern in ['data/*.csv', 'data/*.json']:
            for file_path in glob.glob(pattern):
                stat = os.stat(file_path)
                data_files.append({
                    'name': os.path.basename(file_path),
                    'path': file_path,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                })

        # Analyze latest CSV file
        csv_files = [f for f in data_files if f['name'].endswith('.csv')]
        if csv_files:
            latest_csv = max(csv_files, key=lambda x: x['modified'])
            try:
                df = pd.read_csv(latest_csv['path'])

                # Channel analysis
                if 'customer' in df.columns:
                    channels = df['customer'].value_counts().head(5)
                    channel_stats = "<ul>"
                    for channel, count in channels.items():
                        channel_stats += f"<li><strong>{channel}</strong>: {count} đơn</li>"
                    channel_stats += "</ul>"

                # Trend analysis
                if 'scraped_at' in df.columns:
                    df['hour'] = pd.to_datetime(df['scraped_at']).dt.hour
                    hourly = df.groupby('hour').size()
                    trend_stats = f"<p>Giờ cao điểm: <strong>{hourly.idxmax()}:00</strong> ({hourly.max()} đơn)</p>"
                    trend_stats += f"<p>Tổng đơn hàng: <strong>{len(df)}</strong></p>"

                # Performance stats
                utils = AutomationUtils()
                perf = utils.analyze_performance(7)
                performance_stats = f"<p>Hiệu suất 7 ngày:</p><ul>"
                performance_stats += f"<li>Lần chạy: <strong>{perf.get('total_runs', 0)}</strong></li>"
                performance_stats += f"<li>Tỷ lệ thành công: <strong>{perf.get('success_rate', 0):.1f}%</strong></li>"
                performance_stats += f"<li>Trung bình đơn/lần: <strong>{perf.get('avg_orders_per_run', 0):.1f}</strong></li>"
                performance_stats += "</ul>"

            except Exception as e:
                channel_stats = f"Lỗi phân tích: {e}"

        return jsonify({
            'data_files': data_files,
            'channel_stats': channel_stats,
            'trend_stats': trend_stats,
            'performance_stats': performance_stats
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/data-details')
def api_data_details():
    """API chi tiết file dữ liệu"""
    try:
        file_name = request.args.get('file')
        if not file_name:
            return jsonify({'error': 'Thiếu tên file'})

        file_path = f"data/{file_name}"
        if not os.path.exists(file_path):
            return jsonify({'error': 'File không tồn tại'})

        if file_name.endswith('.csv'):
            df = pd.read_csv(file_path)
            return jsonify({
                'total_rows': len(df),
                'columns': list(df.columns),
                'sample_data': df.head(10).to_dict('records')
            })
        else:
            return jsonify({'error': 'Chỉ hỗ trợ file CSV'})

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/run', methods=['POST'])
def api_run():
    """API chạy automation"""
    try:
        def run_automation_async():
            from automation import OneAutomationSystem
            automation = OneAutomationSystem()
            return automation.run_automation()

        # Run in thread để không block web interface
        result = run_automation_async()

        if result['success']:
            return jsonify({
                'success': True,
                'message': f"✅ Thành công! Thu thập được {result['order_count']} đơn hàng"
            })
        else:
            return jsonify({
                'success': False,
                'message': f"❌ Thất bại: {result.get('error', 'Unknown error')}"
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Lỗi chạy automation: {e}'
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

@app.route('/api/download')
def api_download():
    """API download file"""
    try:
        file_path = request.args.get('file')
        if file_path and os.path.exists(file_path):
            from flask import send_file
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File không tồn tại'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete', methods=['POST'])
def api_delete():
    """API xóa file"""
    try:
        file_path = request.json.get('file')
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({
                'success': True,
                'message': f'Đã xóa file {os.path.basename(file_path)}'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'File không tồn tại'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi xóa file: {e}'
        })

if __name__ == '__main__':
    print("🚀 Starting ONE Automation Advanced Control Center...")
    print("📍 Access at: http://localhost:3001")
    print("✨ Features: Config Management, Analytics, Real-time Control")
    app.run(debug=True, host='0.0.0.0', port=3001)
