// ==================== ORDERS SEARCH BAR ====================
// File: src/modules/orders/components/ui/OrdersSearchBar.jsx
// Search and filter controls with unified system design

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  ORDER_PRIORITIES,
  PLATFORMS,
  STAFF_LIST,
} from '../../config/constants';
import { useSemanticTheme } from '../../../../shared/hooks/useTheme'
import { useTheme } from '../../../../App'

export const OrdersSearchBar = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
}) => {
  const { isDarkMode } = useTheme()
  const theme = useSemanticTheme(isDarkMode);
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== 'all' && value !== 'today'
  );

  return (
    <div className={theme.card.default}>
      {/* Main Search Row */}
      <div className={theme.card.header}>
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className={theme.text.muted} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, khách hàng, sản phẩm..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 ${theme.form.input} sm:text-sm`}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X
                  size={16}
                  className={`${theme.text.muted} hover:${theme.text.secondary}`}
                />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className={`px-3 py-2 ${theme.form.select} text-sm`}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="assigned">Đã phân công</option>
            <option value="picking">Đang lấy hàng</option>
            <option value="packing">Đang đóng gói</option>
            <option value="completed">Hoàn thành</option>
            <option value="overdue">Quá hạn</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              onFiltersChange({ ...filters, priority: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm"
          >
            <option value="all">Tất cả ưu tiên</option>
            {Object.entries(ORDER_PRIORITIES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={onToggleAdvancedFilters}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-200'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Bộ lọc nâng cao
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center w-2 h-2 text-xs font-bold leading-none text-white bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sàn thương mại
              </label>
              <select
                value={filters.platform}
                onChange={(e) =>
                  onFiltersChange({ ...filters, platform: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm"
              >
                <option value="all">Tất cả sàn</option>
                {Object.values(PLATFORMS).map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nhân viên
              </label>
              <select
                value={filters.assignee}
                onChange={(e) =>
                  onFiltersChange({ ...filters, assignee: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm"
              >
                <option value="all">Tất cả nhân viên</option>
                <option value="unassigned">Chưa phân công</option>
                {STAFF_LIST.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thời gian
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm"
              >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  onFiltersChange({
                    status: 'all',
                    priority: 'all',
                    platform: 'all',
                    assignee: 'all',
                    dateRange: 'today',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
