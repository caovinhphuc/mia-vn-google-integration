/**
 * Location Details Modal
 * Displays detailed information about a warehouse location
 */

import React from 'react';
import { Modal } from './Modal';
import { MapPin, Package, Calendar, User, Activity, Edit3 } from 'lucide-react';

export function LocationDetailsModal({
  isOpen,
  onClose,
  location,
  inventory = [],
  onEdit
}) {
  if (!location) return null;

  const getStatusColor = (status) => {
    const colors = {
      empty: 'bg-gray-100 text-gray-800',
      occupied: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.empty;
  };

  const getStatusText = (status) => {
    const texts = {
      empty: 'Trống',
      occupied: 'Đã sử dụng',
      reserved: 'Đặt trước',
      maintenance: 'Bảo trì'
    };
    return texts[status] || 'Không xác định';
  };

  const utilizationRate = location.capacity > 0
    ? ((location.currentStock || 0) / location.capacity) * 100
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Vị Trí"
      size="large"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
              <p className="text-lg text-gray-600">{location.code}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(location.status)}`}>
                {getStatusText(location.status)}
              </span>
            </div>
          </div>

          {onEdit && (
            <button
              onClick={() => onEdit(location)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Description */}
        {location.description && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{location.description}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Sức chứa</p>
                <p className="text-lg font-semibold">{location.capacity || 0}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Hiện tại</p>
                <p className="text-lg font-semibold">{location.currentStock || 0}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ sử dụng</p>
                <p className="text-lg font-semibold">{utilizationRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Cập nhật</p>
                <p className="text-lg font-semibold">
                  {location.updatedAt ? new Date(location.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tỷ lệ sử dụng không gian</span>
            <span>{utilizationRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${utilizationRate > 90 ? 'bg-red-500' :
                  utilizationRate > 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                }`}
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Properties */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin kỹ thuật</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Kích thước:</span>
                <span className="font-medium">
                  {location.width || 0} × {location.height || 0} px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vị trí:</span>
                <span className="font-medium">
                  ({location.x || 0}, {location.y || 0})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loại vị trí:</span>
                <span className="font-medium capitalize">
                  {location.type || 'Tiêu chuẩn'}
                </span>
              </div>
              {location.zoneId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Khu vực:</span>
                  <span className="font-medium">{location.zoneName || location.zoneId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Lịch sử</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạo lúc:</span>
                <span className="font-medium">
                  {location.createdAt
                    ? new Date(location.createdAt).toLocaleString('vi-VN')
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật lúc:</span>
                <span className="font-medium">
                  {location.updatedAt
                    ? new Date(location.updatedAt).toLocaleString('vi-VN')
                    : 'N/A'
                  }
                </span>
              </div>
              {location.lastActivity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Hoạt động cuối:</span>
                  <span className="font-medium">
                    {new Date(location.lastActivity).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory List */}
        {inventory && inventory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Hàng hóa trong vị trí</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Sản phẩm</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">SKU</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">Số lượng</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">Giá trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600">{item.sku}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {item.quantity} {item.unit || 'cái'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {((item.quantity || 0) * (item.price || 0)).toLocaleString('vi-VN')} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {inventory && inventory.length === 0 && location.status === 'empty' && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Vị trí này hiện đang trống</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default LocationDetailsModal;
