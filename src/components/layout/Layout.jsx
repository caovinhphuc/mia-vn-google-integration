import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connectionStatusExpanded, setConnectionStatusExpanded] =
    useState(false);
  const location = useLocation();

  const menuItems = [
    {
      path: "/",
      icon: "🏠",
      label: "Trang chủ",
      description: "Tổng quan hệ thống",
    },
    {
      path: "/dashboard",
      icon: "📊",
      label: "Bảng điều khiển",
      description: "Theo dõi thời gian thực",
    },
    {
      path: "/ai-analytics",
      icon: "🧠",
      label: "Phân tích AI",
      description: "Thông minh và dự đoán",
    },
    {
      path: "/google-sheets",
      icon: "📋",
      label: "Google Sheets",
      description: "Quản lý bảng tính",
    },
    {
      path: "/google-drive",
      icon: "📁",
      label: "Google Drive",
      description: "Quản lý tệp tin",
    },
    {
      path: "/google-apps-script",
      icon: "⚙️",
      label: "Google Apps Script",
      description: "Tự động hóa công việc",
    },
    {
      path: "/telegram",
      icon: "💬",
      label: "Telegram Bot",
      description: "Gửi thông báo",
    },
    {
      path: "/automation",
      icon: "🤖",
      label: "Automation",
      description: "Tự động hóa quy trình",
      children: [
        {
          path: "/automation",
          icon: "📊",
          label: "Dashboard",
          description: "Tổng quan automation",
        },
        {
          path: "/automation/control",
          icon: "🎮",
          label: "Control Panel",
          description: "Điều khiển automation",
        },
        {
          path: "/automation/config",
          icon: "⚙️",
          label: "Configuration",
          description: "Cấu hình hệ thống",
        },
      ],
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          <div className="brand">
            <span className="brand-icon">🚀</span>
            <span className="brand-text">MIA Logistics</span>
            <span className="brand-version">v3.0</span>
          </div>
        </div>

        <div className="header-center">
          <div className="system-status">
            <div className="status-indicator online"></div>
            <span>Hệ thống hoạt động bình thường</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-role">Quản trị viên</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn" title="Thông báo">
              🔔
            </button>
            <button className="action-btn" title="Cài đặt">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-section-title">Điều hướng</h3>
              {menuItems.map((item) => (
                <div key={item.path}>
                  {item.children ? (
                    // Parent item with children
                    <div className="nav-parent">
                      <div className="nav-item nav-parent-header">
                        <span className="nav-icon">{item.icon}</span>
                        <div className="nav-content">
                          <span className="nav-label">{item.label}</span>
                          {!sidebarCollapsed && (
                            <span className="nav-description">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {!sidebarCollapsed && (
                        <div className="nav-children">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`nav-item nav-child ${
                                isActive(child.path) ? "active" : ""
                              }`}
                            >
                              <span className="nav-icon">{child.icon}</span>
                              <div className="nav-content">
                                <span className="nav-label">{child.label}</span>
                                <span className="nav-description">
                                  {child.description}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular item without children
                    <Link
                      to={item.path}
                      className={`nav-item ${
                        isActive(item.path) ? "active" : ""
                      }`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <div className="nav-content">
                        <span className="nav-label">{item.label}</span>
                        {!sidebarCollapsed && (
                          <span className="nav-description">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">Công cụ</h3>
              <div className="nav-item">
                <span className="nav-icon">📈</span>
                <div className="nav-content">
                  <span className="nav-label">Báo cáo</span>
                  {!sidebarCollapsed && (
                    <span className="nav-description">Xuất báo cáo</span>
                  )}
                </div>
              </div>
              <div className="nav-item">
                <span className="nav-icon">🔧</span>
                <div className="nav-content">
                  <span className="nav-label">Cài đặt</span>
                  {!sidebarCollapsed && (
                    <span className="nav-description">Cấu hình hệ thống</span>
                  )}
                </div>
              </div>
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">Hỗ trợ</h3>
              <div className="nav-item">
                <span className="nav-icon">📚</span>
                <div className="nav-content">
                  <span className="nav-label">Hướng dẫn</span>
                  {!sidebarCollapsed && (
                    <span className="nav-description">Tài liệu sử dụng</span>
                  )}
                </div>
              </div>
              <div className="nav-item">
                <span className="nav-icon">💬</span>
                <div className="nav-content">
                  <span className="nav-label">Liên hệ</span>
                  {!sidebarCollapsed && (
                    <span className="nav-description">Hỗ trợ kỹ thuật</span>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="connection-status-section">
              <div
                className="connection-status-header"
                onClick={() =>
                  setConnectionStatusExpanded(!connectionStatusExpanded)
                }
              >
                <h4 className="connection-title">Trạng thái kết nối</h4>
                <span className="expand-icon">
                  {connectionStatusExpanded ? "▼" : "▶"}
                </span>
              </div>

              {connectionStatusExpanded && (
                <div className="connection-items">
                  <div className="connection-item">
                    <div className="connection-icon">📊</div>
                    <div className="connection-info">
                      <div className="connection-name">Google Sheets</div>
                      <div className="connection-status">
                        <span className="status-dot connected"></span>
                        <span>Đã kết nối</span>
                      </div>
                    </div>
                  </div>

                  <div className="connection-item">
                    <div className="connection-icon">📁</div>
                    <div className="connection-info">
                      <div className="connection-name">Google Drive</div>
                      <div className="connection-status">
                        <span className="status-dot connected"></span>
                        <span>Đã kết nối</span>
                      </div>
                    </div>
                  </div>

                  <div className="connection-item">
                    <div className="connection-icon">⚙️</div>
                    <div className="connection-info">
                      <div className="connection-name">Google Apps Script</div>
                      <div className="connection-status">
                        <span className="status-dot connected"></span>
                        <span>Đã kết nối</span>
                      </div>
                    </div>
                  </div>

                  <div className="connection-item">
                    <div className="connection-icon">💬</div>
                    <div className="connection-info">
                      <div className="connection-name">Telegram Bot</div>
                      <div className="connection-status">
                        <span className="status-dot connected"></span>
                        <span>Đã kết nối</span>
                      </div>
                    </div>
                  </div>

                  <div className="connection-item">
                    <div className="connection-icon">🤖</div>
                    <div className="connection-info">
                      <div className="connection-name">Automation</div>
                      <div className="connection-status">
                        <span className="status-dot connected"></span>
                        <span>Đã kết nối</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
