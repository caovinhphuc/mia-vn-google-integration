#!/usr/bin/env python3
"""
ONE Automation System - Enterprise Web Interface
Kết hợp design đẹp với chức năng thực tế
"""

from flask import Flask, render_template_string, jsonify, request, send_file
import os
import json
import glob
import pandas as pd
from datetime import datetime, timedelta
from utils import AutomationUtils
import threading

app = Flask(__name__)

# Enterprise HTML Template với design đẹp + chức năng thực tế
ENTERPRISE_TEMPLATE = """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ONE Automation Enterprise Dashboard - One.tga.com.vn</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: #1a73e8;
            --secondary-color: #34a853;
            --warning-color: #fbbc04;
            --danger-color: #ea4335;
            --dark-bg: #1e1e2e;
            --card-bg: #27273a;
            --text-primary: #ffffff;
            --text-secondary: #a8a8b3;
            --border-color: #3a3a4e;
            --success-gradient: linear-gradient(135deg, #34a853 0%, #188038 100%);
            --warning-gradient: linear-gradient(135deg, #fbbc04 0%, #f9a600 100%);
            --danger-gradient: linear-gradient(135deg, #ea4335 0%, #c5221f 100%);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background-color: var(--dark-bg);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .dashboard-container {
            max-width: 1920px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header Styles */
        .header {
            background: var(--card-bg);
            padding: 20px 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .header h1 {
            font-size: 28px;
            font-weight: 600;
            background: linear-gradient(135deg, #1a73e8 0%, #34a853 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-actions {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .sync-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(52, 168, 83, 0.1);
            border: 1px solid rgba(52, 168, 83, 0.3);
            border-radius: 8px;
            font-size: 14px;
        }

        .sync-indicator {
            width: 8px;
            height: 8px;
            background: var(--secondary-color);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }

        .btn-primary {
            background: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background: #1557b0;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
        }

        .btn-success {
            background: var(--secondary-color);
            color: white;
        }

        .btn-success:hover {
            background: #2e7d32;
            transform: translateY(-2px);
        }

        .btn-warning {
            background: var(--warning-color);
            color: #333;
        }

        .btn-danger {
            background: var(--danger-color);
            color: white;
        }

        /* Navigation Tabs */
        .nav-tabs {
            display: flex;
            background: var(--card-bg);
            border-radius: 12px;
            margin-bottom: 20px;
            overflow: hidden;
        }

        .nav-tab {
            flex: 1;
            padding: 16px 20px;
            text-align: center;
            cursor: pointer;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .nav-tab:hover {
            background: rgba(26, 115, 232, 0.1);
            color: var(--text-primary);
        }

        .nav-tab.active {
            background: var(--primary-color);
            color: white;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        /* KPI Cards Grid */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .kpi-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 24px;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid var(--border-color);
        }

        .kpi-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-color);
        }

        .kpi-card.success::before { background: var(--success-gradient); }
        .kpi-card.warning::before { background: var(--warning-gradient); }
        .kpi-card.danger::before { background: var(--danger-gradient); }

        .kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .kpi-title {
            font-size: 14px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .kpi-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            font-size: 20px;
        }

        .kpi-icon.success {
            background: rgba(52, 168, 83, 0.2);
            color: #34a853;
        }

        .kpi-icon.warning {
            background: rgba(251, 188, 4, 0.2);
            color: #fbbc04;
        }

        .kpi-icon.danger {
            background: rgba(234, 67, 53, 0.2);
            color: #ea4335;
        }

        .kpi-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .kpi-change {
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .kpi-change.positive { color: var(--secondary-color); }
        .kpi-change.negative { color: var(--danger-color); }

        /* Section Cards */
        .section-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border-color);
            margin-bottom: 20px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
        }

        .section-actions {
            display: flex;
            gap: 10px;
        }

        /* Form Styles */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .form-input, .form-select {
            width: 100%;
            padding: 12px 16px;
            background: var(--dark-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 14px;
            transition: border-color 0.3s ease;
        }

        .form-input:focus, .form-select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
        }

        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }

        .data-table th, .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .data-table th {
            background: rgba(26, 115, 232, 0.1);
            font-weight: 600;
            color: var(--text-primary);
            font-size: 13px;
            text-transform: uppercase;
        }

        .data-table tr:hover {
            background: rgba(26, 115, 232, 0.05);
        }

        /* Status Badges */
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
        }

        .status-badge.success {
            background: rgba(52, 168, 83, 0.2);
            color: #34a853;
        }

        .status-badge.warning {
            background: rgba(251, 188, 4, 0.2);
            color: #fbbc04;
        }

        .status-badge.danger {
            background: rgba(234, 67, 53, 0.2);
            color: #ea4335;
        }

        /* Charts */
        .chart-container {
            height: 300px;
            position: relative;
            margin-top: 20px;
        }

        /* Grid Layouts */
        .grid-2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .grid-4 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        /* Loading States */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid var(--border-color);
            border-radius: 50%;
            border-top-color: var(--primary-color);
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Notifications */
        .notification {
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            display: none;
        }

        .notification.success {
            background: rgba(52, 168, 83, 0.1);
            color: #34a853;
            border: 1px solid rgba(52, 168, 83, 0.3);
        }

        .notification.error {
            background: rgba(234, 67, 53, 0.1);
            color: #ea4335;
            border: 1px solid rgba(234, 67, 53, 0.3);
        }

        .notification.warning {
            background: rgba(251, 188, 4, 0.1);
            color: #fbbc04;
            border: 1px solid rgba(251, 188, 4, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .dashboard-container { padding: 10px; }
            .header { flex-direction: column; gap: 16px; text-align: center; }
            .nav-tabs { flex-direction: column; }
            .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Header -->
        <div class="header">
            <div>
                <h1>🤖 ONE Automation Enterprise Dashboard</h1>
                <p style="color: var(--text-secondary); margin-top: 4px;">
                    One.tga.com.vn - Realtime Operations Monitor | {{ current_time }}
                </p>
            </div>
            <div class="header-actions">
                <div class="sync-status">
                    <div class="sync-indicator"></div>
                    <span id="sync-status-text">Live Sync Active</span>
                </div>
                <button class="btn btn-primary" onclick="exportData()">
                    <span>📥</span>
                    <span>Export Data</span>
                </button>
                <button class="btn btn-success" onclick="runAutomation()">
                    <span>🚀</span>
                    <span>Run Automation</span>
                </button>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('dashboard')">📊 Dashboard</button>
            <button class="nav-tab" onclick="showTab('automation')">🤖 Automation</button>
            <button class="nav-tab" onclick="showTab('analytics')">📈 Analytics</button>
            <button class="nav-tab" onclick="showTab('config')">⚙️ Configuration</button>
        </div>

        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-content active">
            <!-- KPI Grid -->
            <div class="kpi-grid">
                <div class="kpi-card success">
                    <div class="kpi-header">
                        <span class="kpi-title">Total Orders Today</span>
                        <div class="kpi-icon success">📦</div>
                    </div>
                    <div class="kpi-value" id="totalOrders">-</div>
                    <div class="kpi-change positive">
                        <span>↑</span>
                        <span id="ordersChange">Loading...</span>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">Success Rate</span>
                        <div class="kpi-icon success">✅</div>
                    </div>
                    <div class="kpi-value" id="successRate">-</div>
                    <div class="kpi-change positive">
                        <span>↑</span>
                        <span id="successChange">Loading...</span>
                    </div>
                </div>

                <div class="kpi-card warning">
                    <div class="kpi-header">
                        <span class="kpi-title">Data Files</span>
                        <div class="kpi-icon warning">📁</div>
                    </div>
                    <div class="kpi-value" id="dataFiles">-</div>
                    <div class="kpi-change">
                        <span id="filesChange">Loading...</span>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">Last Run</span>
                        <div class="kpi-icon">⏰</div>
                    </div>
                    <div class="kpi-value" style="font-size: 18px;" id="lastRun">-</div>
                    <div class="kpi-change">
                        <span id="lastRunStatus">Loading...</span>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid-2">
                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">📋 Recent Data</h2>
                        <button class="btn btn-primary" onclick="refreshData()">🔄 Refresh</button>
                    </div>
                    <div id="recent-data-content">Loading...</div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">📊 Performance Chart</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Automation Tab -->
        <div id="automation" class="tab-content">
            <div class="grid-2">
                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">🚀 Automation Control</h2>
                    </div>
                    <div class="form-group">
                        <button id="run-automation-btn" class="btn btn-success" onclick="runAutomation()" style="width: 100%; margin-bottom: 10px;">
                            <span>▶️</span>
                            <span>Run Automation Now</span>
                        </button>
                        <button class="btn btn-warning" onclick="generateDashboard()" style="width: 100%; margin-bottom: 10px;">
                            <span>📊</span>
                            <span>Generate Dashboard</span>
                        </button>
                        <button class="btn btn-primary" onclick="runHealthCheck()" style="width: 100%;">
                            <span>🏥</span>
                            <span>Health Check</span>
                        </button>
                    </div>
                    <div id="automation-status" class="notification" style="display: none;"></div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">📁 File Manager</h2>
                    </div>
                    <div id="file-manager-content">Loading...</div>
                </div>
            </div>
        </div>

        <!-- Analytics Tab -->
        <div id="analytics" class="tab-content">
            <div class="grid-3">
                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">🏪 Channel Analysis</h2>
                    </div>
                    <div id="channel-analysis">Loading...</div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">📈 Trends</h2>
                    </div>
                    <div id="trend-analysis">Loading...</div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">⚡ Performance</h2>
                    </div>
                    <div id="performance-analysis">Loading...</div>
                </div>
            </div>

            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">📊 Data Analysis</h2>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Data File:</label>
                    <select id="data-file-select" class="form-select" onchange="loadDataFile()">
                        <option value="">-- Choose File --</option>
                    </select>
                </div>
                <div id="data-analysis-content"></div>
            </div>
        </div>

        <!-- Configuration Tab -->
        <div id="config" class="tab-content">
            <div class="notification" id="config-notification"></div>

            <div class="grid-2">
                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">⚙️ Scraping Configuration</h2>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Max Pages:</label>
                        <input type="number" id="max-pages" class="form-input" min="1" max="100" value="5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Max Orders:</label>
                        <input type="number" id="max-orders" class="form-input" min="10" max="10000" value="100">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Delay Between Pages (seconds):</label>
                        <input type="number" id="delay-pages" class="form-input" min="1" max="30" value="2">
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">📅 Schedule Configuration</h2>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Enable Schedule:</label>
                        <select id="schedule-enabled" class="form-select">
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Frequency:</label>
                        <select id="schedule-frequency" class="form-select">
                            <option value="daily">Daily</option>
                            <option value="hourly">Hourly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Time:</label>
                        <input type="time" id="schedule-time" class="form-input" value="08:00">
                    </div>
                </div>
            </div>

            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">💾 System Settings</h2>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Email Notifications:</label>
                        <select id="email-enabled" class="form-select">
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Recipient Email:</label>
                        <input type="email" id="email-recipients" class="form-input" placeholder="admin@company.com">
                    </div>
                </div>
                <div class="grid-2" style="margin-top: 20px;">
                    <button class="btn btn-success" onclick="saveConfig()">💾 Save Configuration</button>
                    <button class="btn btn-primary" onclick="loadConfig()">🔄 Load Configuration</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentTab = 'dashboard';
        let performanceChart = null;

        // Initialize Dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeChart();
            loadDashboardData();
            loadFileManager();
            loadAnalytics();
            loadConfig();

            // Auto refresh every 30 seconds
            setInterval(loadDashboardData, 30000);
        });

        // Tab Management
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
            currentTab = tabName;

            // Load tab-specific data
            if (tabName === 'automation') loadFileManager();
            if (tabName === 'analytics') loadAnalytics();
            if (tabName === 'config') loadConfig();
        }

        // Dashboard Data Loading
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard-data');
                const data = await response.json();

                // Update KPIs
                document.getElementById('totalOrders').textContent = data.metrics.total_orders || 0;
                document.getElementById('successRate').textContent = (data.metrics.success_rate || 0).toFixed(1) + '%';
                document.getElementById('dataFiles').textContent = data.metrics.file_count || 0;
                document.getElementById('lastRun').textContent = data.metrics.last_run || 'Never';

                // Update status
                document.getElementById('sync-status-text').textContent = data.message || 'System Ready';

                // Update recent data
                document.getElementById('recent-data-content').innerHTML = data.recent_data || 'No data available';

                // Update changes
                document.getElementById('ordersChange').textContent = 'Active system';
                document.getElementById('successChange').textContent = 'Running smoothly';
                document.getElementById('filesChange').textContent = 'Files available';
                document.getElementById('lastRunStatus').textContent = 'Status: Ready';

            } catch (error) {
                console.error('Error loading dashboard data:', error);
                showNotification('Failed to load dashboard data', 'error');
            }
        }

        // Chart Initialization
        function initializeChart() {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Success Rate',
                        data: [95, 98, 97, 96, 99, 97, 98],
                        borderColor: '#34a853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#a8a8b3' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 90,
                            max: 100,
                            ticks: {
                                color: '#a8a8b3',
                                callback: function(value) { return value + '%'; }
                            },
                            grid: { color: '#3a3a4e' }
                        },
                        x: {
                            ticks: { color: '#a8a8b3' },
                            grid: { color: '#3a3a4e' }
                        }
                    }
                }
            });
        }

        // Automation Functions
        async function runAutomation() {
            const btn = document.getElementById('run-automation-btn');
            const statusDiv = document.getElementById('automation-status');

            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span> Running...';

            try {
                const response = await fetch('/api/run', { method: 'POST' });
                const data = await response.json();

                statusDiv.className = 'notification ' + (data.success ? 'success' : 'error');
                statusDiv.textContent = data.message;
                statusDiv.style.display = 'block';

                if (data.success) {
                    loadDashboardData();
                    loadFileManager();
                }
            } catch (error) {
                statusDiv.className = 'notification error';
                statusDiv.textContent = 'Error running automation: ' + error.message;
                statusDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>▶️</span><span>Run Automation Now</span>';
            }
        }

        async function generateDashboard() {
            try {
                const response = await fetch('/api/dashboard', { method: 'POST' });
                const data = await response.json();
                showNotification('Dashboard generated: ' + data.file, 'success');
            } catch (error) {
                showNotification('Error generating dashboard: ' + error.message, 'error');
            }
        }

        async function runHealthCheck() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                const message = data.error ? 'System Error: ' + data.error : 'System Status: Healthy';
                showNotification(message, data.error ? 'error' : 'success');
            } catch (error) {
                showNotification('Health check failed: ' + error.message, 'error');
            }
        }

        // File Manager
        async function loadFileManager() {
            try {
                const response = await fetch('/api/files');
                const data = await response.json();

                let html = '<table class="data-table"><thead><tr><th>File</th><th>Size</th><th>Modified</th><th>Actions</th></tr></thead><tbody>';

                data.files?.forEach(file => {
                    const date = new Date(file.modified).toLocaleString('vi-VN');
                    const size = (file.size / 1024).toFixed(1) + ' KB';
                    html += `<tr>
                        <td>${file.name}</td>
                        <td>${size}</td>
                        <td>${date}</td>
                        <td>
                            <button class="btn btn-primary" onclick="downloadFile('${file.path}')" style="padding: 4px 8px; font-size: 12px;">📥 Download</button>
                        </td>
                    </tr>`;
                });

                html += '</tbody></table>';
                document.getElementById('file-manager-content').innerHTML = html;
            } catch (error) {
                document.getElementById('file-manager-content').innerHTML = 'Error loading files';
            }
        }

        // Analytics
        async function loadAnalytics() {
            try {
                const response = await fetch('/api/analytics');
                const data = await response.json();

                document.getElementById('channel-analysis').innerHTML = data.channel_stats || 'No data';
                document.getElementById('trend-analysis').innerHTML = data.trend_stats || 'No data';
                document.getElementById('performance-analysis').innerHTML = data.performance_stats || 'No data';

                // Populate file selector
                const selector = document.getElementById('data-file-select');
                selector.innerHTML = '<option value="">-- Choose File --</option>';
                data.data_files?.forEach(file => {
                    selector.innerHTML += `<option value="${file.name}">${file.name}</option>`;
                });
            } catch (error) {
                console.error('Error loading analytics:', error);
            }
        }

        async function loadDataFile() {
            const fileName = document.getElementById('data-file-select').value;
            if (!fileName) return;

            try {
                const response = await fetch(`/api/data-details?file=${fileName}`);
                const data = await response.json();

                if (data.error) {
                    document.getElementById('data-analysis-content').innerHTML = `<p>Error: ${data.error}</p>`;
                    return;
                }

                let html = `<h4>📊 ${fileName} - ${data.total_rows} rows</h4>`;
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
                document.getElementById('data-analysis-content').innerHTML = html;
            } catch (error) {
                document.getElementById('data-analysis-content').innerHTML = `<p>Error loading file: ${error.message}</p>`;
            }
        }

        // Configuration
        async function loadConfig() {
            try {
                const response = await fetch('/api/config');
                const config = await response.json();

                document.getElementById('max-pages').value = config.scraping?.max_pages || 5;
                document.getElementById('max-orders').value = config.scraping?.max_orders || 100;
                document.getElementById('delay-pages').value = config.scraping?.delay_between_pages || 2;
                document.getElementById('schedule-enabled').value = config.schedule?.enabled || false;
                document.getElementById('schedule-frequency').value = config.schedule?.frequency || 'daily';
                document.getElementById('schedule-time').value = config.schedule?.time || '08:00';
                document.getElementById('email-enabled').value = config.notifications?.email?.enabled || false;
                document.getElementById('email-recipients').value = config.notifications?.email?.recipients?.[0] || '';
            } catch (error) {
                console.error('Error loading config:', error);
            }
        }

        async function saveConfig() {
            const config = {
                scraping: {
                    max_pages: parseInt(document.getElementById('max-pages').value),
                    max_orders: parseInt(document.getElementById('max-orders').value),
                    delay_between_pages: parseInt(document.getElementById('delay-pages').value)
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

            try {
                const response = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                const data = await response.json();
                showNotification(data.message, data.success ? 'success' : 'error');
            } catch (error) {
                showNotification('Error saving config: ' + error.message, 'error');
            }
        }

        // Utility Functions
        function refreshData() {
            loadDashboardData();
            showNotification('Data refreshed successfully', 'success');
        }

        function downloadFile(path) {
            window.open(`/api/download?file=${encodeURIComponent(path)}`, '_blank');
        }

        async function exportData() {
            try {
                const response = await fetch('/api/export-excel', { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    showNotification('Data exported successfully', 'success');
                    // Trigger download
                    window.open(`/api/download?file=${encodeURIComponent(data.file)}`, '_blank');
                } else {
                    showNotification('Export failed: ' + data.error, 'error');
                }
            } catch (error) {
                showNotification('Export error: ' + error.message, 'error');
            }
        }

        function showNotification(message, type = 'info') {
            const notification = document.getElementById('config-notification');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    </script>
</body>
</html>
"""

@app.route('/')
def enterprise_dashboard():
    """Trang dashboard enterprise"""
    return render_template_string(ENTERPRISE_TEMPLATE,
                                current_time=datetime.now().strftime('%d/%m/%Y %H:%M:%S'))

@app.route('/api/dashboard-data')
def api_dashboard_data():
    """API dữ liệu dashboard"""
    try:
        utils = AutomationUtils()
        performance = utils.analyze_performance(30)

        # Get file count
        data_files = glob.glob('data/*.csv') + glob.glob('data/*.json')

        # Get recent data sample
        recent_data = "No data available"
        if data_files:
            latest_file = max(data_files, key=os.path.getctime)
            try:
                df = pd.read_csv(latest_file)
                recent_data = f"<p><strong>{os.path.basename(latest_file)}</strong>: {len(df)} orders</p>"
                recent_data += "<table class='data-table'><thead><tr>"
                for col in df.columns[:4]:
                    recent_data += f"<th>{col}</th>"
                recent_data += "</tr></thead><tbody>"

                for _, row in df.head(5).iterrows():
                    recent_data += "<tr>"
                    for col in df.columns[:4]:
                        recent_data += f"<td>{row[col] if pd.notna(row[col]) else ''}</td>"
                    recent_data += "</tr>"
                recent_data += "</tbody></table>"
            except:
                recent_data = "Error reading data"

        return jsonify({
            'status': 'active',
            'message': 'System Running',
            'metrics': {
                'total_orders': performance.get('total_orders', 0),
                'success_rate': performance.get('success_rate', 0),
                'file_count': len(data_files),
                'last_run': performance.get('date_range', 'Never')
            },
            'recent_data': recent_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error: {e}',
            'metrics': {'total_orders': 0, 'success_rate': 0, 'file_count': 0, 'last_run': 'Error'},
            'recent_data': 'Error loading data'
        })

# Reuse existing API endpoints from advanced_web_interface.py
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
            return jsonify({'error': f'Error reading config: {e}'})

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
                'message': 'Configuration saved successfully!'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error saving config: {e}'
            })

@app.route('/api/run', methods=['POST'])
def api_run():
    """API chạy automation"""
    try:
        from automation import OneAutomationSystem
        automation = OneAutomationSystem()
        result = automation.run_automation()

        if result['success']:
            return jsonify({
                'success': True,
                'message': f"✅ Success! Collected {result['order_count']} orders"
            })
        else:
            return jsonify({
                'success': False,
                'message': f"❌ Failed: {result.get('error', 'Unknown error')}"
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Automation error: {e}'
        })

@app.route('/api/dashboard', methods=['POST'])
def api_dashboard():
    """API tạo dashboard"""
    try:
        utils = AutomationUtils()
        dashboard_file = utils.generate_dashboard()
        return jsonify({'success': True, 'file': dashboard_file})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Dashboard error: {e}'})

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

@app.route('/api/analytics')
def api_analytics():
    """API phân tích dữ liệu"""
    try:
        data_files = []
        channel_stats = "No data available"
        trend_stats = "No data available"
        performance_stats = "No data available"

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
                        channel_stats += f"<li><strong>{channel}</strong>: {count} orders</li>"
                    channel_stats += "</ul>"

                # Trend analysis
                if 'scraped_at' in df.columns:
                    df['hour'] = pd.to_datetime(df['scraped_at']).dt.hour
                    hourly = df.groupby('hour').size()
                    trend_stats = f"<p>Peak hour: <strong>{hourly.idxmax()}:00</strong> ({hourly.max()} orders)</p>"
                    trend_stats += f"<p>Total orders: <strong>{len(df)}</strong></p>"

                # Performance stats
                utils = AutomationUtils()
                perf = utils.analyze_performance(7)
                performance_stats = f"<p>7-day performance:</p><ul>"
                performance_stats += f"<li>Runs: <strong>{perf.get('total_runs', 0)}</strong></li>"
                performance_stats += f"<li>Success rate: <strong>{perf.get('success_rate', 0):.1f}%</strong></li>"
                performance_stats += f"<li>Avg orders/run: <strong>{perf.get('avg_orders_per_run', 0):.1f}</strong></li>"
                performance_stats += "</ul>"

            except Exception as e:
                channel_stats = f"Analysis error: {e}"

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
            return jsonify({'error': 'Missing file name'})

        file_path = f"data/{file_name}"
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'})

        if file_name.endswith('.csv'):
            df = pd.read_csv(file_path)
            return jsonify({
                'total_rows': len(df),
                'columns': list(df.columns),
                'sample_data': df.head(10).to_dict('records')
            })
        else:
            return jsonify({'error': 'Only CSV files supported'})

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/download')
def api_download():
    """API download file"""
    try:
        file_path = request.args.get('file')
        if file_path and os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export-excel', methods=['POST'])
def api_export_excel():
    """API xuất Excel"""
    try:
        # Create Excel export
        from data_analytics import DataAnalytics
        analytics = DataAnalytics()
        result = analytics.export_excel_report()

        if 'error' not in result:
            return jsonify({
                'success': True,
                'file': result['excel_file']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    print("🚀 Starting ONE Automation Enterprise Dashboard...")
    print("📍 Access at: http://localhost:5001")
    print("✨ Features: Enterprise UI + Real Automation + Advanced Analytics")
    app.run(debug=True, host='0.0.0.0', port=5001)
