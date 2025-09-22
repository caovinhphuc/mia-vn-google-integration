import React, { useState, useEffect } from "react";
import "./SimpleAutomationPanel.css";

const SimpleAutomationPanel = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("stopped"); // stopped, running, paused
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    processedOrders: 0,
    failedOrders: 0,
    lastRunTime: null,
  });

  // Mock automation control functions
  const startAutomation = async () => {
    try {
      setLoading(true);
      setStatus("running");
      setProgress(0);

      console.log("🚀 Starting automation request...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastResult({
        status: "success",
        mode: "automated",
        message: "Automation started successfully!",
        success: true,
      });

      console.log(
        "🎉 Automation started successfully, starting progress simulation..."
      );

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          console.log(`📊 Progress update: ${newProgress}%`);

          if (newProgress >= 100) {
            clearInterval(interval);
            setStatus("stopped");
            setStats((prevStats) => ({
              ...prevStats,
              processedOrders: prevStats.processedOrders + 15,
              lastRunTime: new Date().toISOString(),
            }));
            console.log("✅ Automation simulation completed!");
            return 100;
          }
          return newProgress;
        });
      }, 1500);
    } catch (error) {
      console.error("❌ Automation error:", error);
      setStatus("stopped");
    } finally {
      setLoading(false);
    }
  };

  const stopAutomation = () => {
    setStatus("stopped");
    setProgress(0);
    console.log("⏹️ Automation stopped");
  };

  const pauseAutomation = () => {
    setStatus("paused");
    console.log("⏸️ Automation paused");
  };

  const resumeAutomation = () => {
    setStatus("running");
    console.log("▶️ Automation resumed");
  };

  // Mock log data
  useEffect(() => {
    const mockLogs = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        message: "System initialized successfully",
        details: "Chrome driver ready, Google Sheets connected",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "success",
        message: "Processed 15 orders from Shopee",
        details: "All orders processed within SLA",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: "warning",
        message: "SLA warning for order SO240001",
        details: "Order approaching deadline",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 180000).toISOString(),
        level: "error",
        message: "Failed to process order SO240002",
        details: "Element not found: confirm button",
      },
    ];

    setLogs(mockLogs);
    setStats({
      totalOrders: 150,
      processedOrders: 135,
      failedOrders: 3,
      lastRunTime: new Date(Date.now() - 300000).toISOString(),
    });
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return "▶️";
      case "paused":
        return "⏸️";
      default:
        return "⏹️";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "#52c41a";
      case "paused":
        return "#fa8c16";
      default:
        return "#f5222d";
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case "info":
        return "#1890ff";
      case "success":
        return "#52c41a";
      case "warning":
        return "#fa8c16";
      case "error":
        return "#f5222d";
      default:
        return "#666";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="simple-automation-panel">
      <div className="panel-header">
        <h1>🤖 Automation Control Panel</h1>
        <p>Điều khiển và giám sát hệ thống automation</p>
      </div>

      {/* Last Automation Result */}
      {lastResult && (
        <div
          className={`alert alert-${lastResult.success ? "success" : "error"}`}
        >
          <div className="alert-content">
            <h3>✅ Automation Response</h3>
            <p>
              <strong>Status:</strong> {lastResult.status}
            </p>
            <p>
              <strong>Mode:</strong> {lastResult.mode}
            </p>
            <p>
              <strong>Message:</strong> {lastResult.message}
            </p>
            <p>
              <strong>Success:</strong> {lastResult.success ? "Yes" : "No"}
            </p>
          </div>
          <button className="close-btn" onClick={() => setLastResult(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Status Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Tổng đơn hàng</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Đã xử lý</h3>
            <p className="stat-value success">{stats.processedOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Thất bại</h3>
            <p className="stat-value error">{stats.failedOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Tỷ lệ thành công</h3>
            <p className="stat-value success">
              {stats.totalOrders > 0
                ? ((stats.processedOrders / stats.totalOrders) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-section">
        <div className="control-panel">
          <div className="panel-title">
            <h2>🎮 Điều khiển Automation</h2>
            <span
              className="status-indicator"
              style={{ color: getStatusColor() }}
            >
              {getStatusIcon()}
            </span>
          </div>

          <div className="control-info">
            <div className="info-item">
              <label>Trạng thái:</label>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor() }}
              >
                {status === "running"
                  ? "Đang chạy"
                  : status === "paused"
                  ? "Tạm dừng"
                  : "Đã dừng"}
              </span>
            </div>
            <div className="info-item">
              <label>Tiến độ:</label>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
                <span className="progress-text">{progress}%</span>
              </div>
            </div>
            <div className="info-item">
              <label>Lần chạy cuối:</label>
              <span>
                {stats.lastRunTime
                  ? formatDate(stats.lastRunTime)
                  : "Chưa chạy"}
              </span>
            </div>
          </div>

          <div className="control-buttons">
            <button
              className="btn btn-primary"
              onClick={startAutomation}
              disabled={loading || status === "running"}
            >
              {loading ? "⏳" : "▶️"} Bắt đầu
            </button>
            <button
              className="btn btn-secondary"
              onClick={stopAutomation}
              disabled={status === "stopped"}
            >
              ⏹️ Dừng
            </button>
            <button
              className="btn btn-warning"
              onClick={status === "paused" ? resumeAutomation : pauseAutomation}
              disabled={status === "stopped"}
            >
              {status === "paused" ? "▶️ Tiếp tục" : "⏸️ Tạm dừng"}
            </button>
            <button className="btn btn-info">🔄 Restart</button>
            <button className="btn btn-outline">⚙️ Cài đặt</button>
          </div>
        </div>

        <div className="system-status">
          <h2>📊 Thống kê thời gian thực</h2>
          <div className="status-alert success">
            <h3>✅ Hệ thống đang hoạt động bình thường</h3>
            <p>Tất cả các dịch vụ đang kết nối và hoạt động ổn định.</p>
          </div>

          <div className="service-status">
            <div className="service-item">
              <span className="service-name">Chrome Driver:</span>
              <span className="status-dot connected">🟢 Kết nối</span>
            </div>
            <div className="service-item">
              <span className="service-name">Google Sheets:</span>
              <span className="status-dot connected">🟢 Kết nối</span>
            </div>
            <div className="service-item">
              <span className="service-name">ONE System:</span>
              <span className="status-dot connected">🟢 Kết nối</span>
            </div>
            <div className="service-item">
              <span className="service-name">Lần cập nhật cuối:</span>
              <span>{new Date().toLocaleTimeString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Logs */}
      <div className="logs-section">
        <h2>📋 Nhật ký Automation</h2>
        <div className="logs-table">
          <div className="logs-header">
            <div className="log-col time">Thời gian</div>
            <div className="log-col level">Mức độ</div>
            <div className="log-col message">Thông báo</div>
            <div className="log-col details">Chi tiết</div>
          </div>
          <div className="logs-body">
            {logs.map((log) => (
              <div key={log.id} className="log-row">
                <div className="log-col time">{formatDate(log.timestamp)}</div>
                <div className="log-col level">
                  <span
                    className="log-level-badge"
                    style={{ backgroundColor: getLogLevelColor(log.level) }}
                  >
                    {log.level.toUpperCase()}
                  </span>
                </div>
                <div className="log-col message">{log.message}</div>
                <div className="log-col details">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Hành động nhanh</h2>
        <div className="action-buttons">
          <button className="btn btn-outline">✅ Kiểm tra hệ thống</button>
          <button className="btn btn-outline">🔄 Sync Google Sheets</button>
          <button className="btn btn-outline">⚠️ Kiểm tra SLA</button>
          <button className="btn btn-outline">⚙️ Cấu hình nâng cao</button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAutomationPanel;
