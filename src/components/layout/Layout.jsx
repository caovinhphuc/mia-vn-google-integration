import { LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, message, Spin } from "antd";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { BRAND_CONFIG } from "../../config/brand";
import { logout } from "../../store/actions/authActions";
import { useHealthConnections } from "../../hooks/useHealthConnections";
import ActionButton from "./ActionButton";
import ConnectionSection from "./ConnectionSection";
import HamburgerMenu from "./HamburgerMenu";
import LayoutConfigButton from "./LayoutConfigButton";
import NavSection from "./NavSection";
import { navigationData } from "./navigationData";
import "./Layout.css";

const LayoutConfigManager = lazy(
  () => import(/* webpackChunkName: "layout-config" */ "./LayoutConfigManager")
);

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connectionStatusExpanded, setConnectionStatusExpanded] = useState(false);
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const connections = useHealthConnections();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Kiểm tra session khi component mount và định kỳ
  useEffect(() => {
    const checkSession = async () => {
      // Chỉ kiểm tra nếu đã authenticated
      if (!isAuthenticated) {
        return;
      }

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:3001";

        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok || response.status === 401) {
          // Session hết hạn, logout và redirect
          try {
            await dispatch(logout(false));
          } catch (e) {
            // Ignore errors
          }
          message.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
        }
      } catch (error) {
        // Network error, không làm gì (có thể backend chưa chạy)
        console.warn("Session check error:", error);
      }
    };

    // Kiểm tra ngay khi mount
    checkSession();

    // Kiểm tra định kỳ mỗi 5 phút
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, dispatch, navigate]);

  const isActive = (path) => {
    if (!path) return false;

    // Exact match for root
    if (path === "/") {
      return location.pathname === "/";
    }

    // Exact match for other paths
    if (location.pathname === path) {
      return true;
    }

    // For nested routes, check if current path starts with the nav path
    // But avoid matching parent paths when on child routes
    const pathSegments = path.split("/").filter(Boolean);
    const currentSegments = location.pathname.split("/").filter(Boolean);

    // Only match if first segment matches (to avoid /security matching /security/mfa)
    if (pathSegments.length > 0 && currentSegments.length > 0) {
      return currentSegments[0] === pathSegments[0] && location.pathname.startsWith(path);
    }

    return false;
  };

  const handleLogout = async (logoutAll = false) => {
    try {
      await dispatch(logout(logoutAll));
      message.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      message.error("Đăng xuất thất bại: " + (error.message || "Unknown error"));
      // Still navigate to login even if logout fails
      navigate("/login");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: () => handleLogout(false),
    },
    {
      key: "logoutAll",
      icon: <LogoutOutlined />,
      label: "Đăng xuất tất cả thiết bị",
      danger: true,
      onClick: () => handleLogout(true),
    },
  ];

  const handleNotificationClick = async () => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.unread || 0);
        }
      }
    } catch {
      // API chưa sẵn sàng
    }
  };

  const handleSettingsClick = () => navigate("/settings");

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <HamburgerMenu
            collapsed={sidebarCollapsed}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="brand">
            <span className="brand-icon">🛒</span>
            <span className="brand-text">{BRAND_CONFIG.companyName}</span>
            <span className="brand-version">v4.0</span>
          </div>
        </div>

        <div className="header-center">
          <div className="system-status">
            <div className="status-indicator online"></div>
            <span>Hệ thống hoạt động bình thường</span>
          </div>
        </div>

        <div className="header-right">
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
              <div className="user-info" style={{ cursor: "pointer" }}>
                <div className="user-avatar">👤</div>
                <div className="user-details">
                  <span className="user-name">{user.email || "User"}</span>
                  <span className="user-role">
                    {user.role === "admin"
                      ? "Quản trị viên"
                      : user.role === "manager"
                        ? "Quản lý"
                        : "Người dùng"}
                  </span>
                </div>
              </div>
            </Dropdown>
          ) : (
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <span className="user-name">Guest</span>
                <span className="user-role">Khách</span>
              </div>
            </div>
          )}
          <div className="header-actions">
            <LayoutConfigButton onClick={() => setLayoutConfigOpen(true)} />
            <ActionButton
              icon="🔔"
              title="Thông báo"
              onClick={handleNotificationClick}
              className={
                notificationCount > 0 ? "notification-btn has-notifications" : "notification-btn"
              }
            />
            <ActionButton
              icon="⚙️"
              title="Cài đặt"
              onClick={handleSettingsClick}
              className="settings-btn"
            />
          </div>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <nav className="sidebar-nav">
            <NavSection
              title="Điều hướng"
              items={navigationData.main}
              collapsed={sidebarCollapsed}
              isActive={isActive}
            />
            <NavSection
              title="Kho Vận"
              items={navigationData.warehouse}
              collapsed={sidebarCollapsed}
            />
            <NavSection title="Công cụ" items={navigationData.tools} collapsed={sidebarCollapsed} />
            <NavSection
              title="Hỗ trợ"
              items={navigationData.support}
              collapsed={sidebarCollapsed}
            />
          </nav>

          <ConnectionSection
            connections={connections}
            expanded={connectionStatusExpanded}
            onToggle={() => setConnectionStatusExpanded(!connectionStatusExpanded)}
          />
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>

      {layoutConfigOpen ? (
        <Suspense
          fallback={
            <div className="layout-config-suspense-fallback" aria-hidden>
              <Spin />
            </div>
          }
        >
          <LayoutConfigManager isOpen onClose={() => setLayoutConfigOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Layout;
