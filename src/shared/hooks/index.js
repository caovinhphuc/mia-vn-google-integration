// ==================== NOTIFICATION PROVIDER ====================
/**
 * Provider quản lý thông báo toàn hệ thống
 * Tích hợp với Google Sheets sync status và warehouse alerts
 * Cập nhật: 08/06/2025 - Trưởng phòng Kho vận
 */

import React, { createContext, useContext, useState } from "react";
import NotificationContainer from "./NotificationContainer";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import PropTypes from "prop-types";

// PropTypes cho NotificationProvider
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// PropTypes cho NotificationContext
NotificationContext.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      timestamp: PropTypes.instanceOf(Date).isRequired,
      type: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
      message: PropTypes.string.isRequired,
      details: PropTypes.string,
      action: PropTypes.shape({
        label: PropTypes.string,
        href: PropTypes.string,
      }),
    })
  ).isRequired,
  addNotification: PropTypes.func.isRequired,
  removeNotification: PropTypes.func.isRequired,
  clearAll: PropTypes.func.isRequired,
  notifySuccess: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  notifyWarning: PropTypes.func.isRequired,
  notifyInfo: PropTypes.func.isRequired,
  notifySLAAlert: PropTypes.func.isRequired,
  notifySyncStatus: PropTypes.func.isRequired,
};

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [maxNotifications] = useState(5); // Giới hạn 5 thông báo hiển thị

  // Thêm thông báo mới
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Tự động xóa thông báo sau 5s (trừ loại 'error' và 'warning')
    if (!["error", "warning"].includes(notification.type)) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  };

  // Xóa thông báo
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear tất cả thông báo
  const clearAll = () => {
    setNotifications([]);
  };

  // Các method tiện ích cho warehouse operations
  const notifySuccess = (message, details = "") =>
    addNotification({ type: "success", message, details });

  const notifyError = (message, details = "") =>
    addNotification({ type: "error", message, details });

  const notifyWarning = (message, details = "") =>
    addNotification({ type: "warning", message, details });

  const notifyInfo = (message, details = "") => addNotification({ type: "info", message, details });

  // Thông báo đặc biệt cho SLA và sync
  const notifySLAAlert = (orderID, remainingTime) =>
    addNotification({
      type: "warning",
      message: `Đơn hàng ${orderID} sắp quá hạn SLA`,
      details: `Còn ${remainingTime} phút để hoàn thành`,
      action: { label: "Xem đơn", href: `/orders/${orderID}` },
    });

  const notifySyncStatus = (status, details) =>
    addNotification({
      type: status === "success" ? "success" : "error",
      message: `Google Sheets ${status === "success" ? "đồng bộ thành công" : "lỗi đồng bộ"}`,
      details: details,
    });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
        notifySLAAlert,
        notifySyncStatus,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook sử dụng notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
