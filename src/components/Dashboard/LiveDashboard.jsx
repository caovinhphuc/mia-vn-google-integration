import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Loading from "../Common/Loading";
import "./LiveDashboard.css";

const LiveDashboard = () => {
  const { loading, error } = useSelector((state) => state.dashboard);
  const { sheets } = useSelector((state) => state.sheets);
  const { files } = useSelector((state) => state.drive);
  const { alerts } = useSelector((state) => state.alerts);

  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [isLive, setIsLive] = useState(true);

  // Sample data for charts
  const [chartData, setChartData] = useState([
    { name: "00:00", sheets: 12, files: 8, alerts: 2 },
    { name: "04:00", sheets: 15, files: 12, alerts: 1 },
    { name: "08:00", sheets: 18, files: 15, alerts: 3 },
    { name: "12:00", sheets: 22, files: 18, alerts: 2 },
    { name: "16:00", sheets: 25, files: 22, alerts: 4 },
    { name: "20:00", sheets: 28, files: 25, alerts: 1 },
    { name: "24:00", sheets: 30, files: 28, alerts: 2 },
  ]);

  const pieData = [
    { name: "Google Sheets", value: sheets.length, color: "#3b82f6" },
    { name: "Google Drive", value: files.length, color: "#10b981" },
    { name: "Alerts", value: alerts.length, color: "#f59e0b" },
  ];

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setChartData((prevData) =>
          prevData.map((item) => ({
            ...item,
            sheets: item.sheets + Math.floor(Math.random() * 3) - 1,
            files: item.files + Math.floor(Math.random() * 2),
            alerts: Math.max(
              0,
              item.alerts + Math.floor(Math.random() * 3) - 1
            ),
          }))
        );
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isLive, refreshInterval]);

  if (loading) {
    return <Loading text="Đang tải dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Lỗi tải dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="live-dashboard">
      <div className="dashboard-header">
        <h2>📊 Live Dashboard</h2>
        <div className="dashboard-controls">
          <div className="live-indicator">
            <div className={`live-dot ${isLive ? "active" : ""}`}></div>
            <span>{isLive ? "LIVE" : "PAUSED"}</span>
          </div>
          <button
            className="toggle-live-btn"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "⏸️ Pause" : "▶️ Resume"}
          </button>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-select"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{sheets.length}</h3>
              <p>Google Sheets</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-content">
              <h3>{files.length}</h3>
              <p>Google Drive Files</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <h3>{alerts.length}</h3>
              <p>Active Alerts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>99.9%</h3>
              <p>System Health</p>
            </div>
          </div>
        </div>

        {/* Real-time Chart */}
        <div className="chart-container">
          <h3>📈 Real-time Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sheets"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="files"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="alerts"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Chart */}
        <div className="chart-container">
          <h3>📊 Data Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="activity-container">
          <h3>🕒 Recent Activity</h3>
          <div className="activity-list">
            {[
              {
                time: "2 phút trước",
                action: 'Sheet "mia-logistics-final" được cập nhật',
                type: "sheets",
              },
              {
                time: "5 phút trước",
                action: "File mới được upload lên Drive",
                type: "drive",
              },
              {
                time: "8 phút trước",
                action: "Alert mới: Low inventory warning",
                type: "alert",
              },
              {
                time: "12 phút trước",
                action: "Backup tự động hoàn thành",
                type: "system",
              },
              {
                time: "15 phút trước",
                action: "Sync dữ liệu thành công",
                type: "sync",
              },
            ].map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-time">{activity.time}</div>
                <div className="activity-action">{activity.action}</div>
                <div className={`activity-type ${activity.type}`}>
                  {activity.type === "sheets" && "📊"}
                  {activity.type === "drive" && "📁"}
                  {activity.type === "alert" && "🔔"}
                  {activity.type === "system" && "⚙️"}
                  {activity.type === "sync" && "🔄"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
