/**
 * Inventory Form Component
 * Form for creating and editing inventory items
 */

import React, { useState, useEffect } from 'react';
import { Package, Save, X, Plus, Minus } from 'lucide-react';
import logger from "../../../../../utils/logger";

export function InventoryForm({
  item = null,
  locations = [],
  categories = [],
  onSubmit,
  onCancel,
  mode = 'create'
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    locationId: '',
    quantity: 0,
    price: 0,
    unit: 'pieces',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    expiryDate: '',
    batchNumber: '',
    supplier: '',
    status: 'available'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        category: item.category || '',
        locationId: item.locationId || '',
        quantity: item.quantity || 0,
        price: item.price || 0,
        unit: item.unit || 'pieces',
        weight: item.weight || 0,
        dimensions: item.dimensions || { length: 0, width: 0, height: 0 },
        expiryDate: item.expiryDate || '',
        batchNumber: item.batchNumber || '',
        supplier: item.supplier || '',
        status: item.status || 'available'
      });
    }
  }, [item, mode]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const adjustQuantity = (delta) => {
    const newQuantity = Math.max(0, formData.quantity + delta);
    handleChange('quantity', newQuantity);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'Mã SKU là bắt buộc';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Số lượng không thể âm';
    }

    if (formData.price < 0) {
      newErrors.price = 'Giá không thể âm';
    }

    if (formData.weight < 0) {
      newErrors.weight = 'Trọng lượng không thể âm';
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
      const itemData = {
        ...formData,
        id: item?.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        weight: Number(formData.weight),
        dimensions: {
          length: Number(formData.dimensions.length),
          width: Number(formData.dimensions.width),
          height: Number(formData.dimensions.height)
        },
        value: Number(formData.quantity) * Number(formData.price),
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSubmit(itemData);
    } catch (error) {
      logger.error('Error submitting inventory form:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu sản phẩm' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const units = [
    { value: 'pieces', label: 'Cái' },
    { value: 'kg', label: 'Kg' },
    { value: 'liter', label: 'Lít' },
    { value: 'meter', label: 'Mét' },
    { value: 'box', label: 'Hộp' },
    { value: 'pallet', label: 'Pallet' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Có sẵn' },
    { value: 'reserved', label: 'Đặt trước' },
    { value: 'damaged', label: 'Hỏng' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'quarantine', label: 'Cách ly' }
  ];

  return (
    <div className="inventory-form bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'create' ? 'Thêm Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm'}
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
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã SKU *
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="VD: PRD001"
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Mô tả chi tiết về sản phẩm..."
          />
        </div>

        {/* Category, Location, and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => handleChange('locationId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Chọn vị trí</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.code} - {location.name}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity, Price, and Unit */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng *
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', Number(e.target.value))}
                className={`flex-1 px-3 py-2 border-t border-b text-center ${errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                min="0"
              />
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá đơn vị (VNĐ)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              min="0"
              step="0.01"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng giá trị
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              {(formData.quantity * formData.price).toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
        </div>

        {/* Physical Properties */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trọng lượng (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange('weight', Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.weight ? 'border-red-500' : 'border-gray-300'
                }`}
              min="0"
              step="0.01"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dài (cm)
            </label>
            <input
              type="number"
              value={formData.dimensions.length}
              onChange={(e) => handleChange('dimensions.length', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rộng (cm)
            </label>
            <input
              type="number"
              value={formData.dimensions.width}
              onChange={(e) => handleChange('dimensions.width', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cao (cm)
            </label>
            <input
              type="number"
              value={formData.dimensions.height}
              onChange={(e) => handleChange('dimensions.height', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              min="0"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhà cung cấp
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Tên nhà cung cấp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lô
            </label>
            <input
              type="text"
              value={formData.batchNumber}
              onChange={(e) => handleChange('batchNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Mã số lô"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày hết hạn
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo sản phẩm' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventoryForm;
