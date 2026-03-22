// Enhanced Alerts Module - Quản lý cảnh báo tối ưu
import React, { useState, useEffect, useMemo } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  UserIcon,
  CubeIcon,
  FireIcon,
  ShieldExclamationIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT001',
      title: 'Kho lạnh vượt nhiệt độ cho phép',
      description: 'Khu vực B1 đang có nhiệt độ -2°C, vượt ngưỡng an toàn -5°C',
      type: 'critical',
      category: 'environment',
      status: 'active',
      priority: 'high',
      source: 'Khu B1',
      timestamp: '2024-01-15 14:30:25',
      acknowledged: false,
      assignedTo: 'Nguyễn Văn A',
      location: 'Khu vực B1',
      metadata: {
        currentTemp: -2,
        thresholdTemp: -5,
        duration: '15 phút'
      }
    },
    {
      id: 'ALT002',
      title: 'Hàng hóa sắp hết hạn',
      description: '25 sản phẩm trong kho A2 sẽ hết hạn trong vòng 3 ngày',
      type: 'warning',
      category: 'inventory',
      status: 'active',
      priority: 'medium',
      source: 'Hệ thống kho',
      timestamp: '2024-01-15 12:15:10',
      acknowledged: true,
      assignedTo: 'Trần Thị B',
      location: 'Khu vực A2',
      metadata: {
        itemCount: 25,
        daysLeft: 3,
        totalValue: 15000000
      }
    },
    {
      id: 'ALT003',
      title: 'Xe nâng cần bảo trì',
      description: 'Xe nâng FL-002 đã hoạt động 200 giờ, cần bảo trì định kỳ',
      type: 'info',
      category: 'maintenance',
      status: 'resolved',
      priority: 'low',
      source: 'Xe nâng FL-002',
      timestamp: '2024-01-15 09:45:00',
      acknowledged: true,
      assignedTo: 'Lê Văn C',
      location: 'Khu vực C1',
      resolvedAt: '2024-01-15 16:20:00',
      metadata: {
        operatingHours: 200,
        maintenanceThreshold: 180,
        lastMaintenance: '2024-01-01'
      }
    },
    {
      id: 'ALT004',
      title: 'Mức tồn kho thấp',
      description: 'Sản phẩm SP001 chỉ còn 15 đơn vị, dưới mức tồn kho tối thiểu',
      type: 'warning',
      category: 'inventory',
      status: 'active',
      priority: 'medium',
      source: 'Hệ thống tồn kho',
      timestamp: '2024-01-15 08:20:15',
      acknowledged: false,
      assignedTo: 'Phạm Văn D',
      location: 'Khu vực A1',
      metadata: {
        currentStock: 15,
        minThreshold: 50,
        productCode: 'SP001',
        supplier: 'NCC ABC'
      }
    },
    {
      id: 'ALT005',
      title: 'Phát hiện truy cập bất thường',
      description: 'Có người truy cập vào khu vực hạn chế ngoài giờ làm việc',
      type: 'critical',
      category: 'security',
      status: 'active',
      priority: 'high',
      source: 'Hệ thống bảo mật',
      timestamp: '2024-01-15 22:15:30',
      acknowledged: false,
      assignedTo: 'Võ Thị E',
      location: 'Khu vực C2',
      metadata: {
        accessTime: '22:15',
        normalHours: '08:00 - 18:00',
        cardId: 'CARD789'
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all',
    priority: 'all',
    acknowledged: 'all'
  });

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || alert.type === filters.type;
      const matchesCategory = filters.category === 'all' || alert.category === filters.category;
      const matchesStatus = filters.status === 'all' || alert.status === filters.status;
      const matchesPriority = filters.priority === 'all' || alert.priority === filters.priority;
      const matchesAcknowledged = filters.acknowledged === 'all' || 
                                 (filters.acknowledged === 'true' && alert.acknowledged) ||
                                 (filters.acknowledged === 'false' && !alert.acknowledged);
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && 
             matchesPriority && matchesAcknowledged;
    });
  }, [alerts, searchTerm, filters]);

  // Get alert icon
  const getAlertIcon = (type, category) => {
    if (type === 'critical') {
      return category === 'security' ? ShieldExclamationIcon : FireIcon;
    } else if (type === 'warning') {
      return ExclamationTriangleIcon;
    } else if (type === 'info') {
      return InformationCircleIcon;
    }
    return BellIcon;
  };

  // Get alert color classes
  const getAlertColorClasses = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'inventory': return CubeIcon;
      case 'environment': return BuildingStorefrontIcon;
      case 'maintenance': return TruckIcon;
      case 'security': return ShieldExclamationIcon;
      case 'system': return InformationCircleIcon;
      default: return BellIcon;
    }
  };

  // Get category text
  const getCategoryText = (category) => {
    switch (category) {
      case 'inventory': return 'Kho hàng';
      case 'environment': return 'Môi trường';
      case 'maintenance': return 'Bảo trì';
      case 'security': return 'Bảo mật';
      case 'system': return 'Hệ thống';
      default: return 'Khác';
    }
  };

  // Get priority text and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { text: 'Cao', color: 'text-red-600 bg-red-100' };
      case 'medium':
        return { text: 'Trung bình', color: 'text-yellow-600 bg-yellow-100' };
      case 'low':
        return { text: 'Thấp', color: 'text-green-600 bg-green-100' };
      default:
        return { text: 'Không xác định', color: 'text-gray-600 bg-gray-100' };
    }
  };

  // Handle acknowledge alert
  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : alert
    ));
  };

  // Handle resolve alert
  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() }
        : alert
    ));
  };

  // Statistics
  const stats = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter(a => a.status === 'active').length;
    const critical = alerts.filter(a => a.type === 'critical' && a.status === 'active').length;
    const unacknowledged = alerts.filter(a => !a.acknowledged && a.status === 'active').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    
    return { total, active, critical, unacknowledged, resolved };
  }, [alerts]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý cảnh báo</h1>
                <p className="text-gray-600">Theo dõi và xử lý các cảnh báo hệ thống</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng cảnh báo</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BellIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nghiêm trọng</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FireIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa xác nhận</p>
                <p className="text-3xl font-bold text-orange-600">{stats.unacknowledged}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cảnh báo, nguồn, vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-lg transition-colors flex items-center space-x-2 ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span>Bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="critical">Nghiêm trọng</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="info">Thông tin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="inventory">Kho hàng</option>
                    <option value="environment">Môi trường</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="security">Bảo mật</option>
                    <option value="system">Hệ thống</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="dismissed">Đã bỏ qua</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ưu tiên</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="high">Cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận</label>
                  <select
                    value={filters.acknowledged}
                    onChange={(e) => setFilters(prev => ({...prev, acknowledged: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="true">Đã xác nhận</option>
                    <option value="false">Chưa xác nhận</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const colorClasses = getAlertColorClasses(alert.type);
            const AlertIcon = getAlertIcon(alert.type, alert.category);
            const CategoryIcon = getCategoryIcon(alert.category);
            const priorityInfo = getPriorityInfo(alert.priority);
            
            return (
              <div key={alert.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${colorClasses.border} border-r border-t border-b transition-all hover:shadow-md cursor-pointer`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                        <AlertIcon className={`w-6 h-6 ${colorClasses.icon}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {alert.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                            {priorityInfo.text}
                          </span>
                          {!alert.acknowledged && alert.status === 'active' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Chưa xác nhận
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {alert.description}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <CategoryIcon className="w-4 h-4" />
                            <span>{getCategoryText(alert.category)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BuildingStorefrontIcon className="w-4 h-4" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-4 h-4" />
                            <span>{alert.assignedTo}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{getTimeAgo(alert.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      
                      {!alert.acknowledged && alert.status === 'active' && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Xác nhận"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Đánh dấu đã giải quyết"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy cảnh báo</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {showModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getAlertColorClasses(selectedAlert.type).bg}`}>
                    {React.createElement(getAlertIcon(selectedAlert.type, selectedAlert.category), {
                      className: `w-6 h-6 ${getAlertColorClasses(selectedAlert.type).icon}`
                    })}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Chi tiết cảnh báo</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <AlertDetail alert={selectedAlert} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Alert Detail Component
const AlertDetail = ({ alert }) => {
  const priorityInfo = getPriorityInfo(alert.priority);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h2>
        <p className="text-gray-700 leading-relaxed">{alert.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Cảnh báo</label>
            <p className="text-gray-900 font-mono">{alert.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {alert.type === 'critical' ? 'Nghiêm trọng' : 
                 alert.type === 'warning' ? 'Cảnh báo' : 'Thông tin'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <p className="text-gray-900">{getCategoryText(alert.category)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ưu tiên</label>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
              {priorityInfo.text}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              alert.status === 'active' ? 'bg-blue-100 text-blue-800' :
              alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {alert.status === 'active' ? 'Đang hoạt động' :
               alert.status === 'resolved' ? 'Đã giải quyết' : 'Đã bỏ qua'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
            <p className="text-gray-900">{alert.source}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
            <p className="text-gray-900">{alert.location}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Người phụ trách</label>
            <p className="text-gray-900">{alert.assignedTo}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian phát sinh</label>
            <p className="text-gray-900">{new Date(alert.timestamp).toLocaleString('vi-VN')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận</label>
            <div className="flex items-center space-x-2">
              {alert.acknowledged ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Đã xác nhận
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  Chưa xác nhận
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {alert.metadata && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Thông tin bổ sung</label>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(alert.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {alert.resolvedAt && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian giải quyết</label>
          <p className="text-gray-900">{new Date(alert.resolvedAt).toLocaleString('vi-VN')}</p>
        </div>
      )}
    </div>
  );
};

// Helper function (moved inside component for consistency)
function getCategoryText(category) {
  switch (category) {
    case 'inventory': return 'Kho hàng';
    case 'environment': return 'Môi trường';
    case 'maintenance': return 'Bảo trì';
    case 'security': return 'Bảo mật';
    case 'system': return 'Hệ thống';
    default: return 'Khác';
  }
}

function getPriorityInfo(priority) {
  switch (priority) {
    case 'high':
      return { text: 'Cao', color: 'text-red-600 bg-red-100' };
    case 'medium':
      return { text: 'Trung bình', color: 'text-yellow-600 bg-yellow-100' };
    case 'low':
      return { text: 'Thấp', color: 'text-green-600 bg-green-100' };
    default:
      return { text: 'Không xác định', color: 'text-gray-600 bg-gray-100' };
  }
}

export default AlertsPage;