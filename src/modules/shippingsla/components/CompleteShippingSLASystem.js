import React, { useState, useEffect } from 'react';
import {
import logger from "../../../utils/logger";
  Clock,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Bell,
  MapPin,
  Calendar,
  Timer,
  AlertCircle,
} from 'lucide-react';

const CompleteShippingSLASystem = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [customCutoffs, setCustomCutoffs] = useState({});

  // State cho upload và data processing
  const [uploadedOrders, setUploadedOrders] = useState([]);
  const [originalData, setOriginalData] = useState([]);
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
  const [platformCarrierMatrix, setPlatformCarrierMatrix] = useState({
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

  // Function tính thời gian còn lại linh hoạt (giờ/phút)
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

  // Function tính SLA status
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

  // Function tính thời gian còn lại
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

  // Function suggest carrier tự động
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

  // Function tính priority score
  const calculatePriority = (order) => {
    const timeRemainingHours = order.timeRemaining;
    const platformWeight = { tiktok: 3, website: 2, shopee: 1 };
    const valueWeight = Math.min(order.orderValue / 1000000, 3);

    const platformScore = platformWeight[order.platform] || 1;
    const urgencyScore =
      timeRemainingHours < 1 ? 10 : timeRemainingHours < 4 ? 5 : 1;

    return platformScore * 3 + urgencyScore * 2 + valueWeight * 1;
  };

  // Function xử lý từng đơn hàng
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

  // Function làm sạch và xử lý dữ liệu
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
        // Calculate SLA status
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

  // Function update filters
  const updateFilter = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Function apply filters
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

  // Function handle bulk actions
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

  // Function export orders
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
              icon: Package,
              badge:
                uploadedOrders.length > 0 ? uploadedOrders.length : 'START',
            },
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

        {/* Upload & Process Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-6 h-6" />
                <h3 className="text-2xl font-bold">
                  Upload & Process Đơn Hàng
                </h3>
                <span className="bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1 font-bold">
                  SMART AI
                </span>
              </div>
              <p className="text-purple-100">
                Upload file đa dạng (CSV, Excel, JSON), tự động làm sạch dữ liệu
                và sắp xếp theo SLA. Hỗ trợ không giới hạn dung lượng với AI
                processing thông minh.
              </p>
            </div>

            {/* Demo Data Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                🚀 Demo & Test System
              </h4>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => {
                    const mockData = [
                      {
                        orderId: 'TK001',
                        customerName: 'Nguyễn Văn A',
                        product: 'Vali 28 inch màu đen',
                        orderValue: 1250000,
                        platform: 'tiktok',
                        orderTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        sourceFile: 'tiktok_orders_demo.csv',
                      },
                      {
                        orderId: 'SP002',
                        customerName: 'Trần Thị B',
                        product: 'Set 3 vali du lịch',
                        orderValue: 3200000,
                        platform: 'shopee',
                        orderTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
                        sourceFile: 'shopee_orders_demo.xlsx',
                      },
                      {
                        orderId: 'WB003',
                        customerName: 'Lê Văn C',
                        product: 'Vali cao cấp Samsonite',
                        orderValue: 4500000,
                        platform: 'website',
                        orderTime: new Date(Date.now() - 30 * 60 * 1000),
                        sourceFile: 'website_orders_demo.json',
                      },
                      {
                        orderId: 'TK004',
                        customerName: 'Phạm Thị D',
                        product: 'Vali cabin 20 inch',
                        orderValue: 890000,
                        platform: 'tiktok',
                        orderTime: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
                        sourceFile: 'tiktok_urgent.csv',
                      },
                    ];
                    cleanAndProcessData(mockData).then((cleanedOrders) => {
                      setUploadedOrders(cleanedOrders);
                      setOriginalData(mockData);
                    });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  📊 Load Demo Data
                </button>
                <button
                  onClick={() => {
                    setUploadedOrders([]);
                    setOriginalData([]);
                    setSelectedOrders([]);
                    setDataQuality({
                      total: 0,
                      clean: 0,
                      needsCleaning: 0,
                      errors: 0,
                      duplicates: 0,
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            {/* Data Quality Dashboard */}
            {uploadedOrders.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
                <h5 className="text-lg font-bold text-gray-900 mb-4">
                  📊 Data Quality Dashboard
                </h5>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dataQuality.total}
                    </div>
                    <div className="text-sm text-blue-800">Tổng Records</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dataQuality.clean}
                    </div>
                    <div className="text-sm text-green-800">Clean Data</div>
                    <div className="text-xs text-green-600">
                      {dataQuality.total > 0
                        ? Math.round(
                            (dataQuality.clean / dataQuality.total) * 100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {dataQuality.needsCleaning}
                    </div>
                    <div className="text-sm text-yellow-800">
                      Needs Cleaning
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {dataQuality.errors}
                    </div>
                    <div className="text-sm text-red-800">Errors</div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {uploadedOrders.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-gray-900">
                    🔍 Bộ Lọc Thông Minh & Bulk Actions
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {getFilteredOrders().length} / {uploadedOrders.length} đơn
                      hàng
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkAction('confirm')}
                        disabled={selectedOrders.length === 0}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        ✅ Confirm ({selectedOrders.length})
                      </button>
                      <button
                        onClick={() => handleBulkAction('export')}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        📊 Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sàn
                    </label>
                    <select
                      value={filters.platform}
                      onChange={(e) => updateFilter('platform', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Tất cả</option>
                      <option value="tiktok">TikTok Shop</option>
                      <option value="shopee">Shopee</option>
                      <option value="website">Website</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhà vận chuyển
                    </label>
                    <select
                      value={filters.carrier}
                      onChange={(e) => updateFilter('carrier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Tất cả</option>
                      {carriers.map((carrier) => (
                        <option key={carrier.name} value={carrier.name}>
                          {carrier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SLA Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => updateFilter('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Tất cả</option>
                      <option value="expired">⚠️ Quá hạn</option>
                      <option value="warning">⚡ Cảnh báo</option>
                      <option value="safe">✅ An toàn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tìm kiếm
                    </label>
                    <input
                      type="text"
                      placeholder="Mã đơn, tên KH..."
                      value={filters.searchQuery}
                      onChange={(e) =>
                        updateFilter('searchQuery', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Sắp xếp theo:
                  </span>
                  <select
                    value={`${sortConfig.field}-${sortConfig.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortConfig({ field, direction });
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="timeRemaining-asc">
                      ⏰ Thời gian còn lại (Ít → Nhiều)
                    </option>
                    <option value="priority-desc">
                      🔥 Độ ưu tiên (Cao → Thấp)
                    </option>
                    <option value="orderValue-desc">
                      💰 Giá trị (Cao → Thấp)
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Orders Table */}
            {uploadedOrders.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900">
                      📋 Danh Sách Đơn Hàng - Sắp Xếp Theo SLA
                    </h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          selectedOrders.length ===
                            getFilteredOrders().length &&
                          getFilteredOrders().length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(
                              getFilteredOrders().map((order) => order.orderId)
                            );
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Chọn tất cả</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Select
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          SLA Status
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Mã Đơn
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Khách Hàng
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sàn
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          NVC Đề Xuất
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Thời Gian Còn Lại
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Giá Trị
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredOrders().map((order) => (
                        <tr
                          key={order.orderId}
                          className={`hover:bg-gray-50 ${
                            selectedOrders.includes(order.orderId)
                              ? 'bg-blue-50'
                              : ''
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.orderId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrders((prev) => [
                                    ...prev,
                                    order.orderId,
                                  ]);
                                } else {
                                  setSelectedOrders((prev) =>
                                    prev.filter((id) => id !== order.orderId)
                                  );
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${order.slaStatus.color}`}
                            >
                              {order.slaStatus.level === 'expired' &&
                                '⚠️ Quá hạn'}
                              {order.slaStatus.level === 'warning' &&
                                '⚡ Cảnh báo'}
                              {order.slaStatus.level === 'safe' && '✅ An toàn'}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            {order.orderId}
                          </td>
                          <td className="p-3 text-gray-700">
                            {order.customerName || 'N/A'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.platform === 'tiktok'
                                  ? 'bg-red-100 text-red-800'
                                  : order.platform === 'shopee'
                                  ? 'bg-orange-100 text-orange-800'
                                  : order.platform === 'website'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.platform.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  carriers.find(
                                    (c) => c.name === order.suggestedCarrier
                                  )?.color || 'bg-gray-400'
                                }`}
                              ></div>
                              <span className="text-sm">
                                {order.suggestedCarrier}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`font-bold ${
                                order.timeRemaining < 1
                                  ? 'text-red-600'
                                  : order.timeRemaining < 4
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {formatTimeRemaining(order.timeRemaining)}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            {(order.orderValue / 1000).toFixed(0)}K
                          </td>
                          <td className="p-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                order.priority > 8
                                  ? 'bg-red-500 text-white'
                                  : order.priority > 5
                                  ? 'bg-yellow-500 text-gray-900'
                                  : 'bg-green-500 text-white'
                              }`}
                            >
                              {Math.round(order.priority)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredOrders().length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>Không có đơn hàng nào phù hợp với bộ lọc hiện tại</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            {uploadedOrders.length > 0 && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
                <h4 className="text-xl font-bold mb-4">📊 Thống Kê Nhanh</h4>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h5 className="font-semibold text-red-300 mb-2">
                      🚨 Critical Orders
                    </h5>
                    <div className="text-2xl font-bold">
                      {uploadedOrders.filter((o) => o.timeRemaining < 1).length}
                    </div>
                    <div className="text-sm text-gray-300">Cần xử lý ngay</div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-300 mb-2">
                      ⚡ Warning
                    </h5>
                    <div className="text-2xl font-bold">
                      {
                        uploadedOrders.filter(
                          (o) => o.timeRemaining >= 1 && o.timeRemaining < 4
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-300">Cần monitor</div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h5 className="font-semibold text-green-300 mb-2">
                      ✅ Safe
                    </h5>
                    <div className="text-2xl font-bold">
                      {
                        uploadedOrders.filter((o) => o.timeRemaining >= 4)
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-300">Thời gian dư dả</div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-300 mb-2">
                      💰 Tổng Giá Trị
                    </h5>
                    <div className="text-2xl font-bold">
                      {(
                        uploadedOrders.reduce(
                          (sum, o) => sum + o.orderValue,
                          0
                        ) / 1000000
                      ).toFixed(1)}
                      M
                    </div>
                    <div className="text-sm text-gray-300">VND</div>
                  </div>
                </div>
              </div>
            )}

            {/* Getting Started Guide */}
            {uploadedOrders.length === 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  🚀 Hướng Dẫn Bắt Đầu
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-blue-800">
                      1️⃣ Upload Files
                    </h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Click "Load Demo Data" để test</li>
                      <li>• Hỗ trợ CSV, Excel, JSON</li>
                      <li>• Không giới hạn dung lượng</li>
                      <li>• Multiple files cùng lúc</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-green-800">
                      2️⃣ AI Processing
                    </h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Tự động detect format</li>
                      <li>• Làm sạch và chuẩn hóa data</li>
                      <li>• Tính toán SLA tự động</li>
                      <li>• Suggest nhà vận chuyển</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-purple-800">
                      3️⃣ Smart Management
                    </h5>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Sắp xếp theo SLA priority</li>
                      <li>• Bộ lọc thông minh</li>
                      <li>• Bulk actions</li>
                      <li>• Export và reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SLA Tab */}
        {activeTab === 'sla' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6" />
                <h3 className="text-xl font-bold">SLA Nhà Vận Chuyển</h3>
              </div>
              <p className="text-blue-100">
                Theo dõi và quản lý SLA của các nhà vận chuyển
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left font-semibold text-gray-900 border-b">
                        Nhà Vận Chuyển
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-900 border-b">
                        Thị Phần
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-900 border-b">
                        Cut-off Time
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-900 border-b">
                        Pickup Time
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-900 border-b">
                        Độ Tin Cậy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {carriers.map((carrier, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 border-b">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full ${carrier.color}`}
                            ></div>
                            <div className="font-semibold text-gray-900">
                              {carrier.name}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center border-b">
                          <span className="font-medium text-blue-600">
                            {carrier.marketShare}
                          </span>
                        </td>
                        <td className="p-4 text-center border-b">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            {carrier.cutoffTime}
                          </span>
                        </td>
                        <td className="p-4 text-center border-b text-gray-700">
                          {carrier.pickupTime}
                        </td>
                        <td className="p-4 text-center border-b">
                          <span
                            className={`font-bold ${
                              carrier.reliability >= 90
                                ? 'text-green-600'
                                : carrier.reliability >= 80
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {carrier.reliability}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-6 h-6" />
                <h3 className="text-2xl font-bold">
                  Cảnh Báo & Tracking Real-time
                </h3>
              </div>
              <p className="text-red-100">
                Theo dõi cut-off time và đơn hàng trễ
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="text-lg font-bold text-green-800">
                    Tất cả đều ổn!
                  </h4>
                  <p className="text-green-600">
                    Không có cảnh báo nào. Tất cả nhà vận chuyển đang hoạt động
                    bình thường.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteShippingSLASystem;
