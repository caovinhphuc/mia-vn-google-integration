/**
 * Location Form Component
 * Form for creating and editing warehouse locations
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Save, X } from 'lucide-react';
import logger from "../../../../../utils/logger";

export function LocationForm({
  location = null,
  zones = [],
  onSubmit,
  onCancel,
  mode = 'create'
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    zoneId: '',
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    capacity: 100,
    status: 'empty',
    type: 'standard'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location && mode === 'edit') {
      setFormData({
        name: location.name || '',
        code: location.code || '',
        description: location.description || '',
        zoneId: location.zoneId || '',
        x: location.x || 0,
        y: location.y || 0,
        width: location.width || 40,
        height: location.height || 40,
        capacity: location.capacity || 100,
        status: location.status || 'empty',
        type: location.type || 'standard'
      });
    }
  }, [location, mode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên vị trí là bắt buộc';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã vị trí là bắt buộc';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Sức chứa phải lớn hơn 0';
    }

    if (formData.width <= 0) {
      newErrors.width = 'Chiều rộng phải lớn hơn 0';
    }

    if (formData.height <= 0) {
      newErrors.height = 'Chiều cao phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const locationData = {
        ...formData,
        id: location?.id || `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: Number(formData.x),
        y: Number(formData.y),
        width: Number(formData.width),
        height: Number(formData.height),
        capacity: Number(formData.capacity),
        currentStock: location?.currentStock || 0,
        createdAt: location?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSubmit(locationData);
    } catch (error) {
      logger.error('Error submitting location form:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu vị trí' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="location-form bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'create' ? 'Thêm Vị Trí Mới' : 'Chỉnh Sửa Vị Trí'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên vị trí *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Nhập tên vị trí"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã vị trí *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="VD: A001"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả về vị trí này..."
          />
        </div>

        {/* Zone and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khu vực
            </label>
            <select
              value={formData.zoneId}
              onChange={(e) => handleChange('zoneId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn khu vực</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="empty">Trống</option>
              <option value="occupied">Đã sử dụng</option>
              <option value="reserved">Đặt trước</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vị trí
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">Tiêu chuẩn</option>
              <option value="cold">Lạnh</option>
              <option value="hazardous">Nguy hiểm</option>
              <option value="oversized">Quá khổ</option>
            </select>
          </div>
        </div>

        {/* Position and Dimensions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí X
            </label>
            <input
              type="number"
              value={formData.x}
              onChange={(e) => handleChange('x', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí Y
            </label>
            <input
              type="number"
              value={formData.y}
              onChange={(e) => handleChange('y', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều rộng *
            </label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => handleChange('width', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.width ? 'border-red-500' : 'border-gray-300'
                }`}
              min="1"
            />
            {errors.width && (
              <p className="mt-1 text-sm text-red-600">{errors.width}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều cao *
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.height ? 'border-red-500' : 'border-gray-300'
                }`}
              min="1"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-600">{errors.height}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sức chứa *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'
                }`}
              min="1"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo vị trí' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LocationForm;
