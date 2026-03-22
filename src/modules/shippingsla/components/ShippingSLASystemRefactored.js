/**
 * ShippingSLASystemRefactored - Hệ thống SLA shipping đã được refactor
 * Sử dụng các component con để dễ quản lý và maintain
 */
import React, { useState, useEffect } from 'react';
import { Truck, Bell, Clock } from 'lucide-react';

// Import các component con
import DataUpload from './DataUpload';
import SLACarrierTable from './SLACarrierTable';
import AlertsSystem from './AlertsSystem';
import OrdersTable from './OrdersTable';
import FilterControls from './FilterControls';
import BulkActions from './BulkActions';
import StatsCards from './StatsCards';
import logger from "../../../utils/logger";

const ShippingSLASystemRefactored = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts] = useState([]);

  // State cho upload và data processing
  const [uploadedOrders, setUploadedOrders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dataQuality, setDataQuality] = useState({
    total: 0,
    clean: 0,
    needsCleaning: 0,
    errors: 0,
    duplicates: 0,
  });

  // State cho filtering và sorting
  const [filters, setFilters] = useState({
    platform: 'all',
    carrier: 'all',
    status: 'all',
    slaLevel: 'all',
    timeRemaining: 'all',
    orderValue: { min: '', max: '' },
    searchQuery: '',
    dateRange: { start: '', end: '' },
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'timeRemaining',
    direction: 'asc',
  });
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Ma trận thời gian tùy chỉnh theo sàn và nhà vận chuyển
  const [platformCarrierMatrix] = useState({
    shopee: {
      GHN: { confirmDeadlineHours: 48, handoverDeadlineHours: 72 },
      GHTK: { confirmDeadlineHours: 24, handoverDeadlineHours: 96 },
      'Viettel Post': { confirmDeadlineHours: 36, handoverDeadlineHours: 60 },
      'J&T Express': { confirmDeadlineHours: 24, handoverDeadlineHours: 48 },
      'Ninja Van': { confirmDeadlineHours: 12, handoverDeadlineHours: 36 },
    },
    tiktok: {
      GHN: { confirmDeadlineHours: 12, handoverDeadlineHours: 24 },
      GHTK: { confirmDeadlineHours: 8, handoverDeadlineHours: 36 },
      'Viettel Post': { confirmDeadlineHours: 6, handoverDeadlineHours: 18 },
      'J&T Express': { confirmDeadlineHours: 4, handoverDeadlineHours: 12 },
      'Ninja Van': { confirmDeadlineHours: 2, handoverDeadlineHours: 8 },
    },
    website: {
      GHN: { confirmDeadlineHours: 2, handoverDeadlineHours: 48 },
      GHTK: { confirmDeadlineHours: 4, handoverDeadlineHours: 72 },
      'Viettel Post': { confirmDeadlineHours: 1, handoverDeadlineHours: 24 },
      'J&T Express': { confirmDeadlineHours: 0.5, handoverDeadlineHours: 18 },
      'Ninja Van': { confirmDeadlineHours: 0.25, handoverDeadlineHours: 12 },
    },
  });

  // Dữ liệu nhà vận chuyển
  const carriers = [
    {
      name: 'GHN',
      marketShare: '7.91%',
      cutoffTime: '14:00',
      pickupTime: '2-4h',
      reliability: 85,
      color: 'bg-orange-500',
    },
    {
      name: 'GHTK',
      marketShare: '14.5%',
      cutoffTime: '14:00',
      pickupTime: '2-6h',
      reliability: 78,
      color: 'bg-green-500',
    },
    {
      name: 'Viettel Post',
      marketShare: '17.2%',
      cutoffTime: '16:00',
      pickupTime: '1-3h',
      reliability: 92,
      color: 'bg-red-500',
    },
    {
      name: 'J&T Express',
      marketShare: '10.6%',
      cutoffTime: '21:00',
      pickupTime: '1-2h',
      reliability: 95,
      color: 'bg-purple-500',
    },
    {
      name: 'Ninja Van',
      marketShare: '2.8%',
      cutoffTime: '11:45',
      pickupTime: '2-4h',
      reliability: 82,
      color: 'bg-indigo-500',
    },
  ];

  // Utility functions
  const formatTimeRemaining = (hours) => {
    if (hours < 2) {
      const minutes = Math.round(hours * 60);
      return `${minutes} phút`;
    } else {
      const wholeHours = Math.floor(hours);
      const remainingMinutes = Math.round((hours - wholeHours) * 60);
      return remainingMinutes > 0
        ? `${wholeHours}h ${remainingMinutes}p`
        : `${wholeHours}h`;
    }
  };

  const calculateSLAStatus = (order) => {
    const { platform, orderTime, suggestedCarrier } = order;
    const now = new Date();
    const hoursSinceOrder = (now - orderTime) / (1000 * 60 * 60);

    const matrix = platformCarrierMatrix[platform];
    if (!matrix || !matrix[suggestedCarrier]) {
      return { level: 'unknown', color: 'bg-gray-100 text-gray-800' };
    }

    const confirmDeadline = matrix[suggestedCarrier].confirmDeadlineHours;

    if (hoursSinceOrder > confirmDeadline) {
      return {
        level: 'expired',
        color: 'bg-red-100 text-red-800',
        urgency: 'critical',
      };
    } else if (hoursSinceOrder > confirmDeadline * 0.8) {
      return {
        level: 'warning',
        color: 'bg-yellow-100 text-yellow-800',
        urgency: 'medium',
      };
    } else {
      return {
        level: 'safe',
        color: 'bg-green-100 text-green-800',
        urgency: 'low',
      };
    }
  };

  const calculateTimeRemaining = (order) => {
    const { platform, orderTime, suggestedCarrier } = order;
    const now = new Date();

    const matrix = platformCarrierMatrix[platform];
    if (!matrix || !matrix[suggestedCarrier]) return Infinity;

    const confirmDeadline = matrix[suggestedCarrier].confirmDeadlineHours;
    const deadlineTime = new Date(
      orderTime.getTime() + confirmDeadline * 60 * 60 * 1000
    );
    const timeRemaining = (deadlineTime - now) / (1000 * 60 * 60);

    return Math.max(0, timeRemaining);
  };

  const suggestCarrier = (order) => {
    const { platform, orderValue } = order;

    if (platform === 'tiktok') {
      return 'J&T Express';
    } else if (platform === 'website' && orderValue > 2000000) {
      return 'J&T Express';
    } else if (platform === 'shopee' && orderValue < 500000) {
      return 'GHTK';
    } else {
      return 'Viettel Post';
    }
  };

  const calculatePriority = (order) => {
    const timeRemainingHours = order.timeRemaining;
    const platformWeight = { tiktok: 3, website: 2, shopee: 1 };
    const valueWeight = Math.min(order.orderValue / 1000000, 3);

    const platformScore = platformWeight[order.platform] || 1;
    const urgencyScore =
      timeRemainingHours < 1 ? 10 : timeRemainingHours < 4 ? 5 : 1;

    return platformScore * 3 + urgencyScore * 2 + valueWeight * 1;
  };

  const processOrder = async (rawOrder) => {
    try {
      const cleanOrder = { ...rawOrder };

      // Clean order value
      if (cleanOrder.orderValue) {
        cleanOrder.orderValue =
          parseFloat(
            cleanOrder.orderValue.toString().replace(/[^0-9.]/g, '')
          ) || 0;
      } else {
        cleanOrder.orderValue = 0;
      }

      // Parse order time
      if (cleanOrder.orderTime) {
        cleanOrder.orderTime = new Date(cleanOrder.orderTime);
        if (isNaN(cleanOrder.orderTime)) {
          cleanOrder.orderTime = new Date();
        }
      } else {
        cleanOrder.orderTime = new Date();
      }

      // Auto-assign carrier
      cleanOrder.suggestedCarrier = suggestCarrier(cleanOrder);

      return cleanOrder;
    } catch (error) {
      logger.error('Error processing order:', error);
      return null;
    }
  };

  const cleanAndProcessData = async (rawData) => {
    const cleaned = [];
    const quality = {
      total: rawData.length,
      clean: 0,
      needsCleaning: 0,
      errors: 0,
      duplicates: 0,
    };

    for (const order of rawData) {
      const cleanedOrder = await processOrder(order);

      if (cleanedOrder) {
        cleanedOrder.slaStatus = calculateSLAStatus(cleanedOrder);
        cleanedOrder.timeRemaining = calculateTimeRemaining(cleanedOrder);
        cleanedOrder.priority = calculatePriority(cleanedOrder);

        cleaned.push(cleanedOrder);
        quality.clean++;
      } else {
        quality.errors++;
      }
    }

    setDataQuality(quality);
    return cleaned.sort((a, b) => a.timeRemaining - b.timeRemaining);
  };

  const updateFilter = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const getFilteredOrders = () => {
    let filtered = [...uploadedOrders];

    if (filters.platform !== 'all') {
      filtered = filtered.filter(
        (order) => order.platform === filters.platform
      );
    }

    if (filters.carrier !== 'all') {
      filtered = filtered.filter(
        (order) => order.suggestedCarrier === filters.carrier
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(
        (order) => order.slaStatus.level === filters.status
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(query) ||
          (order.customerName &&
            order.customerName.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue = a[field];
      let bValue = b[field];

      if (
        field === 'timeRemaining' ||
        field === 'orderValue' ||
        field === 'priority'
      ) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleBulkAction = (action) => {
    if (selectedOrders.length === 0 && action !== 'export') return;

    switch (action) {
      case 'confirm':
        setUploadedOrders((prev) =>
          prev.map((order) =>
            selectedOrders.includes(order.orderId)
              ? { ...order, status: 'confirmed', confirmedAt: new Date() }
              : order
          )
        );
        break;
      case 'export':
        exportSelectedOrders();
        break;
      default:
        break;
    }
    setSelectedOrders([]);
  };

  const exportSelectedOrders = () => {
    const ordersToExport = uploadedOrders.filter(
      (order) =>
        selectedOrders.length === 0 || selectedOrders.includes(order.orderId)
    );

    const headers = [
      'Order ID',
      'Customer',
      'Platform',
      'Carrier',
      'Value',
      'Time Remaining',
      'Priority',
    ];
    const csvContent = [
      headers.join(','),
      ...ordersToExport.map((order) =>
        [
          order.orderId,
          order.customerName || '',
          order.platform,
          order.suggestedCarrier,
          order.orderValue,
          formatTimeRemaining(order.timeRemaining),
          Math.round(order.priority),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_export_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Auto update thời gian mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get filtered orders for display
  const filteredOrders = getFilteredOrders();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hệ Thống SLA Vận Chuyển Hoàn Chỉnh - Mia.vn
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Miền Nam | Volume: 600-700 đơn/ngày | Sản phẩm: Vali</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                Cập nhật: {currentTime.toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            {
              id: 'upload',
              label: 'Upload & Process',
              icon: Truck,
              badge:
                uploadedOrders.length > 0 ? uploadedOrders.length : 'START',
            },
            { id: 'orders', label: 'Quản lý đơn hàng', icon: Truck },
            { id: 'sla', label: 'SLA Nhà Vận Chuyển', icon: Clock },
            {
              id: 'alerts',
              label: 'Cảnh Báo & Tracking',
              icon: Bell,
              badge: alerts.length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all relative text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {typeof tab.badge === 'string' && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {tab.badge}
                  </span>
                )}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <DataUpload
            uploadedOrders={uploadedOrders}
            setUploadedOrders={setUploadedOrders}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
            dataQuality={dataQuality}
            setDataQuality={setDataQuality}
            cleanAndProcessData={cleanAndProcessData}
          />
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <StatsCards
              uploadedOrders={uploadedOrders}
              currentTime={currentTime}
            />

            {/* Filter Controls */}
            <FilterControls
              filters={filters}
              updateFilter={updateFilter}
              carriers={carriers}
              uploadedOrders={uploadedOrders}
            />

            {/* Bulk Actions */}
            <BulkActions
              selectedOrders={selectedOrders}
              uploadedOrders={uploadedOrders}
              handleBulkAction={handleBulkAction}
              exportSelectedOrders={exportSelectedOrders}
            />

            {/* Orders Table */}
            <OrdersTable
              orders={filteredOrders}
              selectedOrders={selectedOrders}
              setSelectedOrders={setSelectedOrders}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              formatTimeRemaining={formatTimeRemaining}
            />
          </div>
        )}

        {activeTab === 'sla' && <SLACarrierTable carriers={carriers} />}

        {activeTab === 'alerts' && (
          <AlertsSystem
            alerts={alerts}
            currentTime={currentTime}
            uploadedOrders={uploadedOrders}
          />
        )}
      </div>
    </div>
  );
};

export default ShippingSLASystemRefactored;
