// NotificationContainer.jsx
import React from "react";
import { useNotification } from "./useNotification";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import PropTypes from "prop-types";

// Container hiển thị notifications
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Component notification item
const NotificationItem = ({ notification, onRemove }) => {
  const { type, message, details, timestamp, action } = notification;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      iconColor: "text-red-600 dark:text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} shadow-lg transform transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-start space-x-3">
        <Icon size={20} className={config.iconColor} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{message}</p>
          {details && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{details}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {timestamp.toLocaleTimeString("vi-VN")}
          </p>
          {action && (
            <button
              className="text-xs text-blue-600 hover:text-blue-800 mt-
1"
              onClick={action.onClick}
            >
              {action.label} →
            </button>
          )}
        </div>
        <button
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onRemove}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
    message: PropTypes.string.isRequired,
    details: PropTypes.string,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default NotificationContainer;
export { NotificationItem, NotificationContainer };
// NotificationContainer.jsx
// NotificationItem.jsx
// NotificationItem.jsx
