// Orders List Component - Main Implementation
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  LoadingSpinner,
  ToastNotification,
} from '../../../components/ui/CommonComponents';
import {
  OrdersHeader,
  OrdersStatsCards,
  OrdersSearchBar,
  OrdersBulkActions,
  OrdersTableHeader,
  OrderRow,
  OrdersEmptyState,
  OrdersPagination,
} from './ui';
import { useOrdersData, useSLAMonitoring } from '../hooks';

export const OrdersList = () => {
  const { status: routeStatus } = useParams();

  // Local state
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: routeStatus || 'all',
    priority: 'all',
    platform: 'all',
    assignee: 'all',
    dateRange: 'today',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [toast, setToast] = useState(null);

  // Custom hooks
  const { orders, loading, error, lastSync, loadData, updateOrder } =
    useOrdersData({
      autoSync: true,
      syncInterval: 30000,
      enableRealTimeUpdates: true,
    });

  // SLA monitoring options (stable reference to avoid infinite loop)
  const slaOptions = useMemo(
    () => ({
      enableNotifications: true,
    }),
    []
  );

  // SLA monitoring (alerts can be used for future notifications)
  useSLAMonitoring(orders, slaOptions);

  // Update filter from route
  useEffect(() => {
    if (routeStatus && routeStatus !== filters.status) {
      setFilters((prev) => ({ ...prev, status: routeStatus }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeStatus]); // Remove filters.status from dependency array to avoid infinite loop

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.id.toLowerCase().includes(searchLower) ||
        order.customerId.toLowerCase().includes(searchLower) ||
        order.platform.toLowerCase().includes(searchLower) ||
        order.items.some(
          (item) =>
            item.product.toLowerCase().includes(searchLower) ||
            item.sku.toLowerCase().includes(searchLower)
        );
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && order.priority !== filters.priority) {
      return false;
    }

    // Platform filter
    if (filters.platform !== 'all' && order.platform !== filters.platform) {
      return false;
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned' && order.assignedTo) return false;
      if (
        filters.assignee !== 'unassigned' &&
        order.assignedTo !== filters.assignee
      )
        return false;
    }

    // Date range filter
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filters.dateRange) {
      case 'today':
        return orderDate >= today;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDate >= yesterday && orderDate < today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue = a[key];
    let bValue = b[key];

    // Handle different data types
    if (key === 'createdAt' || key === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (key === 'remainingMinutes') {
      aValue = a.remainingMinutes || 0;
      bValue = b.remainingMinutes || 0;
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const itemsPerPage = 20;
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Event handlers
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.length === paginatedOrders.length
        ? []
        : paginatedOrders.map((order) => order.id)
    );
  };

  const handleBulkAction = async (action, value) => {
    if (selectedOrders.length === 0) return;

    try {
      const updates = {};
      switch (action) {
        case 'assign':
          updates.assignedTo = value;
          updates.status = 'assigned';
          break;
        case 'status':
          updates.status = value;
          break;
        case 'priority':
          updates.priority = value;
          break;
        default:
          break;
      }

      // Update each selected order
      const updatePromises = selectedOrders.map((orderId) =>
        updateOrder(orderId, updates)
      );

      await Promise.all(updatePromises);

      setSelectedOrders([]);
      setToast({
        type: 'success',
        title: 'Cập nhật thành công',
        message: `Đã cập nhật ${selectedOrders.length} đơn hàng`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Lỗi cập nhật',
        message: 'Không thể cập nhật đơn hàng. Vui lòng thử lại.',
      });
    }
  };

  const handleSync = async () => {
    try {
      await loadData();
      setToast({
        type: 'success',
        title: 'Đồng bộ thành công',
        message: 'Dữ liệu đã được cập nhật từ Google Sheets',
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Lỗi đồng bộ',
        message: 'Không thể đồng bộ dữ liệu. Vui lòng thử lại.',
      });
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    setToast({
      type: 'info',
      title: 'Xuất dữ liệu',
      message: 'Tính năng xuất dữ liệu đang được phát triển',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== 'all' && value !== 'today'
  );

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Đang tải danh sách đơn hàng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {toast && (
        <ToastNotification
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <OrdersHeader
        orderCount={orders.length}
        selectedCount={selectedOrders.length}
        syncStatus={{ lastSync, isSyncing: loading }}
        onSync={handleSync}
        onExport={handleExport}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {/* Quick Stats */}
      <OrdersStatsCards orders={orders} />

      {/* Search & Filters */}
      <OrdersSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        showAdvancedFilters={showFilters}
        onToggleAdvancedFilters={() => setShowFilters(!showFilters)}
      />

      {/* Bulk Actions */}
      <OrdersBulkActions
        selectedOrders={selectedOrders}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedOrders([])}
      />

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {paginatedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <OrdersTableHeader
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedCount={selectedOrders.length}
                totalCount={paginatedOrders.length}
                onSelectAll={handleSelectAll}
              />
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isSelected={selectedOrders.includes(order.id)}
                    onSelect={handleSelectOrder}
                    onStatusChange={updateOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <OrdersEmptyState
            searchTerm={searchTerm}
            hasFilters={hasActiveFilters}
          />
        )}
      </div>

      {/* Pagination */}
      <OrdersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedOrders.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
