// ==================== ORDERS HEADER ====================
// File: src/modules/orders/components/ui/OrdersHeader.jsx
// Header component with unified system design and sync status

import React from 'react';
import { RefreshCw, Download, Filter, Package } from 'lucide-react';
import { LoadingSpinner } from '../../../../components/ui/CommonComponents';

export const OrdersHeader = ({
  orderCount,
  selectedCount,
  syncStatus,
  onSync,
  onExport,
  onToggleFilters,
  showFilters,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title and Stats */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quản lý đơn hàng
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {orderCount} đơn hàng
                </span>
                {selectedCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {selectedCount} đã chọn
                  </span>
                )}
              </div>

              {/* Sync Status */}
              {syncStatus.lastSync && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <span>Cập nhật:</span>
                    <span className="font-medium">
                      {syncStatus.lastSync.toLocaleTimeString('vi-VN')}
                    </span>
                    {syncStatus.isSyncing && <LoadingSpinner size="sm" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSync}
            disabled={syncStatus.isSyncing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Đồng bộ từ Google Sheets"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
            />
            Làm mới
          </button>

          <button
            onClick={onToggleFilters}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-200'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            title="Bộ lọc nâng cao"
          >
            <Filter size={16} className="mr-2" />
            Bộ lọc
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            title="Xuất dữ liệu"
          >
            <Download size={16} className="mr-2" />
            Xuất dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};
