/**
 * OrdersTable Component - Bảng hiển thị và quản lý đơn hàng
 * Hỗ trợ sorting, filtering, selection và bulk actions
 */
import React from 'react';
import {
  Clock,
  Truck,
  User,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

const OrdersTable = ({
  orders,
  selectedOrders,
  setSelectedOrders,
  sortConfig,
  setSortConfig,
  formatTimeRemaining,
}) => {
  // Function handle sort
  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Function handle select order
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Function handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.orderId));
    }
  };

  // Function get status icon
  const getStatusIcon = (slaStatus) => {
    switch (slaStatus?.level) {
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Function get platform badge color
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'tiktok':
        return 'bg-black text-white';
      case 'shopee':
        return 'bg-orange-500 text-white';
      case 'website':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-gray-500">
          Upload file dữ liệu hoặc load demo data để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Info */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Đã chọn {selectedOrders.length} / {orders.length} đơn hàng
            </span>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === orders.length &&
                      orders.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderId')}
                >
                  <div className="flex items-center gap-1">
                    Order ID
                    {sortConfig.field === 'orderId' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">
                  Sàn
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">
                  Nhà vận chuyển
                </th>
                <th
                  className="px-4 py-3 text-right font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderValue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Giá trị
                    {sortConfig.field === 'orderValue' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timeRemaining')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Thời gian còn lại
                    {sortConfig.field === 'timeRemaining' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Priority
                    {sortConfig.field === 'priority' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr
                  key={order.orderId}
                  className={`hover:bg-gray-50 ${
                    selectedOrders.includes(order.orderId) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.orderId)}
                      onChange={() => handleSelectOrder(order.orderId)}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.slaStatus)}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.slaStatus?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.slaStatus?.level === 'expired'
                          ? 'Quá hạn'
                          : order.slaStatus?.level === 'warning'
                          ? 'Cảnh báo'
                          : order.slaStatus?.level === 'safe'
                          ? 'An toàn'
                          : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {order.orderId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.orderTime
                        ? new Date(order.orderTime).toLocaleString('vi-VN')
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {order.customerName || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getPlatformColor(
                        order.platform
                      )}`}
                    >
                      {order.platform?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {order.suggestedCarrier || 'Chưa gán'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {order.orderValue
                          ? order.orderValue.toLocaleString('vi-VN')
                          : '0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={`font-bold ${
                          order.timeRemaining <= 0
                            ? 'text-red-600'
                            : order.timeRemaining <= 2
                            ? 'text-orange-600'
                            : order.timeRemaining <= 6
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {order.timeRemaining <= 0
                          ? 'Hết hạn'
                          : formatTimeRemaining(order.timeRemaining)}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${
                            order.timeRemaining <= 0
                              ? 'bg-red-500'
                              : order.timeRemaining <= 2
                              ? 'bg-orange-500'
                              : order.timeRemaining <= 6
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, (order.timeRemaining / 24) * 100)
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.priority >= 8
                          ? 'bg-red-100 text-red-800'
                          : order.priority >= 5
                          ? 'bg-orange-100 text-orange-800'
                          : order.priority >= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {Math.round(order.priority || 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600 px-4">
        <span>Hiển thị {orders.length} đơn hàng</span>
        <span>Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</span>
      </div>
    </div>
  );
};

export default OrdersTable;
