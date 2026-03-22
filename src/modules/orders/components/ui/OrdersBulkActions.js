// ==================== ORDERS BULK ACTIONS ====================
// File: src/modules/orders/components/ui/OrdersBulkActions.jsx
// Bulk action controls with unified system design

import React, { useState } from 'react';
import { X, Check, Users, Settings, Flag } from 'lucide-react';
import { STAFF_LIST, ORDER_PRIORITIES } from '../../config/constants';

export const OrdersBulkActions = ({ 
  selectedOrders, 
  onBulkAction, 
  onClearSelection 
}) => {
  const [actionType, setActionType] = useState('');

  const handleAction = (action, value) => {
    onBulkAction(action, value);
    setActionType('');
  };

  if (selectedOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <Check size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Đã chọn {selectedOrders.length} đơn hàng
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Action Type Selector */}
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn thao tác</option>
            <option value="assign">Phân công nhân viên</option>
            <option value="status">Thay đổi trạng thái</option>
            <option value="priority">Thay đổi ưu tiên</option>
          </select>

          {/* Assign Staff */}
          {actionType === 'assign' && (
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
              <select
                onChange={(e) => e.target.value && handleAction('assign', e.target.value)}
                className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">Chọn nhân viên</option>
                {STAFF_LIST.map((staff) => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>
          )}

          {/* Change Status */}
          {actionType === 'status' && (
            <div className="flex items-center space-x-2">
              <Settings size={16} className="text-blue-600 dark:text-blue-400" />
              <select
                onChange={(e) => e.target.value && handleAction('status', e.target.value)}
                className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">Chọn trạng thái</option>
                <option value="assigned">Đã phân công</option>
                <option value="picking">Đang lấy hàng</option>
                <option value="packing">Đang đóng gói</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          )}

          {/* Change Priority */}
          {actionType === 'priority' && (
            <div className="flex items-center space-x-2">
              <Flag size={16} className="text-blue-600 dark:text-blue-400" />
              <select
                onChange={(e) => e.target.value && handleAction('priority', e.target.value)}
                className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">Chọn ưu tiên</option>
                {Object.entries(ORDER_PRIORITIES).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="inline-flex items-center px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium transition-colors"
          >
            <X size={14} className="mr-1" />
            Bỏ chọn
          </button>
        </div>
      </div>
    </div>
  );
};
