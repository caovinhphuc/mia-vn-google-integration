// ==================== ALERT DETAIL MODAL ====================
import React from 'react';
import { X } from 'lucide-react';
import { ALERT_TYPES, CATEGORIES } from '../config/constants';

const AlertDetailModal = ({ alert, onClose, onAction }) => {
  const alertType = ALERT_TYPES[alert.type];
  const category = CATEGORIES[alert.category];
  const AlertIcon = alertType.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`p-6 border-b border-gray-200 dark:border-gray-700 ${alertType.bgColor}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl ${
                  alert.type === 'critical'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : alert.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <AlertIcon size={24} className={alertType.textColor} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {alert.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {alert.id} • {category.label} • Zone {alert.zone}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div>
            <h3 className="font-semibold mb-2">Chi tiết vấn đề</h3>
            <p className="text-gray-600 dark:text-gray-300">{alert.message}</p>
          </div>

          {/* Details */}
          {alert.details && (
            <div>
              <h3 className="font-semibold mb-3">Thông tin chi tiết</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                {Object.entries(alert.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">
                  <strong>Phát hiện:</strong>{' '}
                  {alert.timestamp.toLocaleString('vi-VN')}
                </span>
              </div>
              {alert.acknowledged && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong>Đã xác nhận:</strong>{' '}
                    {new Date(
                      alert.timestamp.getTime() + 5 * 60000
                    ).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
              {alert.status === 'resolved' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong>Đã giải quyết:</strong>{' '}
                    {new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Suggested actions */}
          {alert.actions && alert.actions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Hành động đề xuất</h3>
              <div className="space-y-2">
                {alert.actions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          {alert.status === 'active' && !alert.acknowledged && (
            <button
              onClick={() => onAction('acknowledge')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xác nhận
            </button>
          )}
          {alert.status === 'active' && (
            <button
              onClick={() => onAction('resolve')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Giải quyết
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
