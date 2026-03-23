// src/shared/hooks/notificationTypes.ts
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import PropTypes from "prop-types";
import { createContext, useState } from "react";

// Định nghĩa các kiểu thông báo
const notificationTypes = {
  success: {
    icon: CheckCircle,
    className: "bg-green-100 text-green-800",
    title: "Thành công",
  },
  error: {
    icon: XCircle,
    className: "bg-red-100 text-red-800",
    title: "Lỗi",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-100 text-yellow-800",
    title: "Cảnh báo",
  },
  info: {
    icon: Info,
    className: "bg-blue-100 text-blue-800",
    title: "Thông tin",
  },
};

// Tạo context để quản lý thông báo
const NotificationContext = createContext();
// PropTypes cho NotificationContext
NotificationContext.propTypes = {
  children: PropTypes.node.isRequired,
};

// Provider để cung cấp context
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      ...notificationTypes[type],
    };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
// PropTypes cho NotificationProvider
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
// Xuất các thành phần
export { useNotification } from "./useNotification";
export default NotificationProvider;

// Xuất các kiểu thông báo
export const notificationTypesList = Object.keys(notificationTypes).map((key) => ({
  type: key,
  icon: notificationTypes[key].icon,
  className: notificationTypes[key].className,
  title: notificationTypes[key].title,
}));
// Xuất các kiểu thông báo dưới dạng mảng
export const notificationTypesArray = Object.entries(notificationTypes).map(([key, value]) => ({
  type: key,
  icon: value.icon,
  className: value.className,
  title: value.title,
}));
// Xuất các kiểu thông báo dưới dạng đối tượng
export const notificationTypesObject = Object.fromEntries(
  Object.entries(notificationTypes).map(([key, value]) => [
    key,
    {
      icon: value.icon,
      className: value.className,
      title: value.title,
    },
  ])
);
