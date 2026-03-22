/**
 * ShippingSLASystemIntegrated - Hệ thống SLA shipping tích hợp với backend
 * Sử dụng useShippingSLAData hook và API services
 */
import React, { useState } from 'react';
import { Truck, Bell, Clock } from 'lucide-react';

// Import các component đã tích hợp
import DataUploadIntegrated from './DataUploadIntegrated';
import SLACarrierTable from './SLACarrierTable';
import AlertsSystem from './AlertsSystem';
import OrdersTable from './OrdersTable';
import FilterControls from './FilterControls';
import BulkActions from './BulkActions';
import StatsCards from './StatsCards';

// Import hook tích hợp
import { useShippingSLAData } from '../../../hooks/useShippingSLAData';
import logger from "../../../utils/logger";

const ShippingSLASystemIntegrated = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sử dụng hook để quản lý data và API calls
  const {
    // Data
    orders,
    filteredOrders,
    // stats,
    carriers,

    // UI state
    loading,
    error,
    lastUpdated,
    // dataQuality,

    // Filters and sorting
    filters,
    sortConfig,
    selectedOrders,

    // Actions
    updateFilter,
    updateSortConfig,
    updateSelectedOrders,
    performBulkAction,
    exportOrders,

    // Helpers
    formatTimeRemaining,
    // getSLAStatusColor,
    // getPlatformColor,
  } = useShippingSLAData(false, 60000); // Disable auto-refresh initially

  // Update current time mỗi giây
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle bulk actions
  const handleBulkAction = async (action, additionalData = {}) => {
    try {
      await performBulkAction(action, additionalData);
    } catch (error) {
      logger.error('Bulk action failed:', error);
      alert(`Bulk action failed: ${error.message}`);
    }
  };

  // Handle export
  const handleExportSelectedOrders = async () => {
    try {
      const response = await exportOrders('csv');
      alert(`Exported successfully: ${response.data?.filename}`);
    } catch (error) {
      logger.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  // Create alerts data from orders
  const alerts = React.useMemo(() => {
    const alerts = [];

    // Create alerts based on SLA status
    filteredOrders.forEach((order) => {
      if (order.slaStatus?.level === 'expired') {
        alerts.push({
          id: `expired-${order.orderId}`,
          type: 'critical',
          message: `Order ${order.orderId} đã quá hạn SLA`,
          order: order,
        });
      } else if (order.slaStatus?.level === 'warning') {
        alerts.push({
          id: `warning-${order.orderId}`,
          type: 'warning',
          message: `Order ${order.orderId} sắp hết hạn SLA`,
          order: order,
        });
      }
    });

    return alerts;
  }, [filteredOrders]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hệ Thống SLA Vận Chuyển - Mia.vn (Integrated)
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Miền Nam | Volume: 600-700 đơn/ngày | Sản phẩm: Vali</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                🔄 Live: {currentTime.toLocaleTimeString('vi-VN')}
              </span>
              {lastUpdated && (
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  📊 Data: {lastUpdated.toLocaleTimeString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800 font-medium">Lỗi: {error}</span>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            {
              id: 'upload',
              label: 'Upload & Process',
              icon: Truck,
              badge: orders.length > 0 ? orders.length : 'START',
            },
            {
              id: 'orders',
              label: 'Quản lý đơn hàng',
              icon: Truck,
              badge: filteredOrders.length,
            },
            {
              id: 'sla',
              label: 'SLA Nhà Vận Chuyển',
              icon: Clock,
              badge: carriers.length,
            },
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
        {activeTab === 'upload' && <DataUploadIntegrated />}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <StatsCards
              uploadedOrders={filteredOrders}
              currentTime={currentTime}
            />

            {/* Filter Controls */}
            <FilterControls
              filters={filters}
              updateFilter={updateFilter}
              carriers={carriers}
              uploadedOrders={orders}
            />

            {/* Bulk Actions */}
            <BulkActions
              selectedOrders={selectedOrders}
              uploadedOrders={filteredOrders}
              handleBulkAction={handleBulkAction}
              exportSelectedOrders={handleExportSelectedOrders}
            />

            {/* Orders Table */}
            <OrdersTable
              orders={filteredOrders}
              selectedOrders={selectedOrders}
              setSelectedOrders={updateSelectedOrders}
              sortConfig={sortConfig}
              setSortConfig={(config) =>
                updateSortConfig(config.field, config.direction)
              }
              formatTimeRemaining={formatTimeRemaining}
            />
          </div>
        )}

        {activeTab === 'sla' && <SLACarrierTable carriers={carriers} />}

        {activeTab === 'alerts' && (
          <AlertsSystem
            alerts={alerts}
            currentTime={currentTime}
            uploadedOrders={filteredOrders}
          />
        )}

        {/* API Connection Status */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  error ? 'bg-red-500' : 'bg-green-500'
                }`}
              ></div>
              <span className="text-gray-600">
                API Status: {error ? 'Disconnected' : 'Connected'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>Backend: automation_bridge.py</span>
              <span>Port: 8000</span>
              <span>Env: {process.env.NODE_ENV || 'development'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSLASystemIntegrated;
