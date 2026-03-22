/**
 * FilterControls Component - Bộ lọc và điều khiển cho đơn hàng
 * Hỗ trợ filter theo platform, carrier, status, search query
 */
import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const FilterControls = ({
  filters,
  updateFilter,
  carriers,
  uploadedOrders,
}) => {
  // Get available platforms from orders
  const availablePlatforms = [
    ...new Set(uploadedOrders.map((order) => order.platform)),
  ].filter(Boolean);

  // Get available carriers from orders
  const availableCarriers = [
    ...new Set(uploadedOrders.map((order) => order.suggestedCarrier)),
  ].filter(Boolean);

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'orderValue') {
      return value.min !== '' || value.max !== '';
    }
    if (key === 'dateRange') {
      return value.start !== '' || value.end !== '';
    }
    return value !== 'all' && value !== '';
  }).length;

  // Clear all filters
  const clearAllFilters = () => {
    updateFilter('platform', 'all');
    updateFilter('carrier', 'all');
    updateFilter('status', 'all');
    updateFilter('slaLevel', 'all');
    updateFilter('timeRemaining', 'all');
    updateFilter('searchQuery', '');
    updateFilter('orderValue', { min: '', max: '' });
    updateFilter('dateRange', { start: '', end: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Bộ lọc đơn hàng
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount} bộ lọc
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo Order ID, tên khách hàng..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Platform Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sàn thương mại
          </label>
          <select
            value={filters.platform}
            onChange={(e) => updateFilter('platform', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả sàn</option>
            {availablePlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Carrier Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nhà vận chuyển
          </label>
          <select
            value={filters.carrier}
            onChange={(e) => updateFilter('carrier', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            {availableCarriers.map((carrier) => (
              <option key={carrier} value={carrier}>
                {carrier}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Trạng thái SLA
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="safe">An toàn</option>
            <option value="warning">Cảnh báo</option>
            <option value="expired">Quá hạn</option>
          </select>
        </div>

        {/* Time Remaining Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Thời gian còn lại
          </label>
          <select
            value={filters.timeRemaining}
            onChange={(e) => updateFilter('timeRemaining', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="expired">Đã hết hạn</option>
            <option value="urgent">Dưới 2 giờ</option>
            <option value="soon">2-6 giờ</option>
            <option value="safe">Trên 6 giờ</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">Bộ lọc nâng cao</h4>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Order Value Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Giá trị đơn hàng (VND)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={filters.orderValue.min}
                onChange={(e) =>
                  updateFilter('orderValue', {
                    ...filters.orderValue,
                    min: e.target.value,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Đến"
                value={filters.orderValue.max}
                onChange={(e) =>
                  updateFilter('orderValue', {
                    ...filters.orderValue,
                    max: e.target.value,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ngày đặt hàng
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  updateFilter('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  updateFilter('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.platform !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Sàn: {filters.platform}
                  <button
                    onClick={() => updateFilter('platform', 'all')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.carrier !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Vận chuyển: {filters.carrier}
                  <button
                    onClick={() => updateFilter('carrier', 'all')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Trạng thái: {filters.status}
                  <button
                    onClick={() => updateFilter('status', 'all')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Tìm kiếm: "{filters.searchQuery}"
                  <button
                    onClick={() => updateFilter('searchQuery', '')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
