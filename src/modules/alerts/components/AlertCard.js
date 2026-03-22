// ==================== ALERT CARD COMPONENT ====================
import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, X, Eye, MapPin, Clock, Zap, Flag } from 'lucide-react';
import { ALERT_TYPES, CATEGORIES } from '../config/constants';
import logger from "../../../utils/logger";
// This component displays a single alert card with actions for acknowledging and resolving the alert.
// It uses icons from Lucide and supports different alert types and categories.

const AlertCard = ({ alert, onAction, onSelect, isSelected }) => {
  // Determine alert type and category
  if (!ALERT_TYPES[alert.type] || !CATEGORIES[alert.category]) {
    logger.error('Invalid alert type or category:', alert);
    return null; // or handle error appropriately
  }
  const alertType = ALERT_TYPES[alert.type];
  const category = CATEGORIES[alert.category];
  const AlertIcon = alertType.icon;
  const CategoryIcon = category.icon;

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return timestamp.toLocaleDateString('vi-VN');
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 border shadow-sm hover:shadow-md transition-all duration-200 ${
        alertType.borderColor
      } ${alertType.bgColor} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Alert icon */}
            <div
              className={`p-2 rounded-lg ${
                alert.type === 'critical'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : alert.type === 'warning'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <AlertIcon size={20} className={alertType.textColor} />
            </div>

            {/* Alert content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {alert.title}
                </h3>
                {alert.escalated && (
                  <Flag size={14} className="text-red-500 flex-shrink-0" />
                )}
                {!alert.acknowledged && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                {alert.message}
              </p>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <CategoryIcon size={12} />
                  <span>{category.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{alert.zone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {alert.status === 'active' && (
              <>
                {!alert.acknowledged && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction('acknowledge');
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="Xác nhận"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction('resolve');
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                  title="Giải quyết"
                >
                  <X size={16} />
                </button>
              </>
            )}

            <button
              onClick={onSelect}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Xem chi tiết"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Priority indicator */}
        {alert.type === 'critical' && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <Zap size={14} className="text-red-600" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                CẦN XỬ LÝ NGAY LẬP TỨC
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AlertCard.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    zone: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    acknowledged: PropTypes.bool,
    escalated: PropTypes.bool,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onAction: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};
AlertCard.defaultProps = {
  isSelected: false,
};
export default AlertCard;
// This component displays a single alert card with actions for acknowledging and resolving the alert.
// It uses icons from Lucide and supports different alert types and categories.
// It also formats the timestamp to show how long ago the alert was triggered.
// This code is part of a warehouse management system's alerts module.
