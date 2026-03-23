// useNotification.js
import { useState, useCallback, createContext, useContext } from "react";

// Notification Context
const NotificationContext = createContext();

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    // Auto remove after 5 seconds (except errors)
    if (notification.type !== "error") {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export default useNotification;
