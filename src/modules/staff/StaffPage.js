
// Enhanced Staff Module - Quản lý nhân sự với UX/UI tối ưu
// File: staff/StaffPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  TrophyIcon,
  ChartBarIcon,
  XMarkIcon,
  CameraIcon,
  DocumentTextIcon,
  KeyIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const StaffPage = () => {
  const [staff, setStaff] = useState([
    {
      id: 'ST001',
      employeeId: 'EMP001',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@company.com',
      phone: '0987654321',
      position: 'Quản lý kho',
      department: 'Kho vận',
      level: 'Senior',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinDate: '2020-01-15',
      lastActive: '2024-01-15 14:30:00',
      address: '123 Nguyễn Trãi, Q.1, TP.HCM',
      salary: 15000000,
      skills: ['Quản lý kho', 'Logistics', 'Leadership'],
      certifications: ['Chứng chỉ quản lý kho', 'ISO 9001'],
      performance: 95,
      attendance: 98,
      workHours: 40,
      overtimeHours: 8,
      projects: 12,
      tasksCompleted: 145,
      rating: 4.8
    },
    {
      id: 'ST002', 
      employeeId: 'EMP002',
      name: 'Trần Thị Bình',
      email: 'tranthibibh@company.com',
      phone: '0912345678',
      position: 'Nhân viên picking',
      department: 'Picking',
      level: 'Junior',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinDate: '2022-06-01',
      lastActive: '2024-01-15 15:45:00',
      address: '456 Lê Lợi, Q.3, TP.HCM',
      salary: 8500000,
      skills: ['Picking', 'Inventory Management', 'Quality Control'],
      certifications: ['Chứng chỉ an toàn lao động'],
      performance: 88,
      attendance: 96,
      workHours: 40,
      overtimeHours: 4,
      projects: 8,
      tasksCompleted: 234,
      rating: 4.5
    },
    {
      id: 'ST003',
      employeeId: 'EMP003', 
      name: 'Lê Văn Cường',
      email: 'levancuong@company.com',
      phone: '0966666666',
      position: 'Tài xế giao hàng',
      department: 'Vận chuyển',
      level: 'Mid',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinDate: '2021-03-10',
      lastActive: '2024-01-15 16:20:00',
      address: '789 Võ Văn Tần, Q.10, TP.HCM',
      salary: 12000000,
      skills: ['Lái xe', 'Customer Service', 'Route Planning'],
      certifications: ['Bằng lái B2', 'Chứng chỉ vận tải'],
      performance: 92,
      attendance: 94,
      workHours: 45,
      overtimeHours: 12,
      projects: 6,
      tasksCompleted: 189,
      rating: 4.6
    },
    {
      id: 'ST004',
      employeeId: 'EMP004',
      name: 'Phạm Thị Dung',
      email: 'phamthidung@company.com',
      phone: '0933333333',
      position: 'Kế toán kho',
      department: 'Tài chính',
      level: 'Senior',
      status: 'on_leave',
      avatar: '/api/placeholder/100/100',
      joinDate: '2019-08-20',
      lastActive: '2024-01-10 17:00:00',
      address: '321 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
      salary: 13500000,
      skills: ['Accounting', 'Financial Analysis', 'Excel'],
      certifications: ['Chứng chỉ kế toán', 'CPA'],
      performance: 96,
      attendance: 99,
      workHours: 40,
      overtimeHours: 2,
      projects: 15,
      tasksCompleted: 167,
      rating: 4.9
    },
    {
      id: 'ST005',
      employeeId: 'EMP005',
      name: 'Hoàng Văn Ê',
      email: 'hoangvane@company.com',
      phone: '0977777777',
      position: 'Nhân viên bảo trì',
      department: 'Kỹ thuật',
      level: 'Mid',
      status: 'inactive',
      avatar: '/api/placeholder/100/100',
      joinDate: '2021-11-05',
      lastActive: '2024-01-05 08:30:00',
      address: '654 Cách Mạng Tháng 8, Q.Tân Bình, TP.HCM',
      salary: 9500000,
      skills: ['Maintenance', 'Electrical', 'Troubleshooting'],
      certifications: ['Chứng chỉ điện công nghiệp'],
      performance: 82,
      attendance: 85,
      workHours: 40,
      overtimeHours: 6,
      projects: 4,
      tasksCompleted: 98,
      rating: 4.2
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [animatingCards, setAnimatingCards] = useState(new Set());

  // Animation triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatingCards(new Set(staff.map(s => s.id)));
    }, 100);
    return () => clearTimeout(timer);
  }, [staff]);

  // Filter and sort staff
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staff.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.phone.includes(searchTerm) ||
                           member.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesLevel = levelFilter === 'all' || member.level === levelFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesLevel;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'joinDate' || sortBy === 'lastActive') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [staff, searchTerm, statusFilter, departmentFilter, levelFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const onLeave = staff.filter(s => s.status === 'on_leave').length;
    const inactive = staff.filter(s => s.status === 'inactive').length;
    const avgPerformance = Math.round(staff.reduce((sum, s) => sum + s.performance, 0) / staff.length);
    const avgAttendance = Math.round(staff.reduce((sum, s) => sum + s.attendance, 0) / staff.length);

    return { total, active, onLeave, inactive, avgPerformance, avgAttendance };
  }, [staff]);

  const getStatusConfig = (status) => {
    const configs = {
      active: { 
        label: 'Hoạt động', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        dotColor: 'bg-green-500',
        icon: CheckCircleIcon 
      },
      on_leave: { 
        label: 'Nghỉ phép', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        dotColor: 'bg-yellow-500',
        icon: ClockIcon 
      },
      inactive: { 
        label: 'Không hoạt động', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        dotColor: 'bg-red-500',
        icon: XCircleIcon 
      }
    };
    return configs[status] || configs.active;
  };

  const getLevelConfig = (level) => {
    const configs = {
      Junior: { label: 'Junior', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      Mid: { label: 'Mid', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      Senior: { label: 'Senior', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' }
    };
    return configs[level] || configs.Mid;
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCardClick = useCallback((member) => {
    setSelectedStaff(member);
    setShowModal(true);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return time.toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                Quản lý Nhân sự
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                Theo dõi và quản lý thông tin nhân viên kho hàng
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base transform"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Thêm nhân viên
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: 'Tổng nhân viên', value: stats.total, icon: UserGroupIcon, color: 'gray' },
              { label: 'Hoạt động', value: stats.active, icon: CheckCircleIcon, color: 'green' },
              { label: 'Nghỉ phép', value: stats.onLeave, icon: ClockIcon, color: 'yellow' },
              { label: 'Không hoạt động', value: stats.inactive, icon: XCircleIcon, color: 'red' },
              { label: 'Hiệu suất TB', value: `${stats.avgPerformance}%`, icon: ChartBarIcon, color: 'blue' },
              { label: 'Chuyên cần TB', value: `${stats.avgAttendance}%`, icon: CalendarDaysIcon, color: 'purple' }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className={`bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border-l-4 border-${stat.color}-500 hover:shadow-xl transition-all duration-300 hover:scale-105 transform animate-slide-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className={`text-lg sm:text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${stat.color}-500`} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 animate-fade-in">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại, vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base transition-all duration-200 focus:scale-105"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base transition-all duration-200"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="on_leave">Nghỉ phép</option>
                  <option value="inactive">Không hoạt động</option>
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base transition-all duration-200"
                >
                  <option value="all">Tất cả phòng ban</option>
                  <option value="Kho vận">Kho vận</option>
                  <option value="Picking">Picking</option>
                  <option value="Vận chuyển">Vận chuyển</option>
                  <option value="Tài chính">Tài chính</option>
                  <option value="Kỹ thuật">Kỹ thuật</option>
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base transition-all duration-200"
                >
                  <option value="all">Tất cả cấp độ</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base transition-all duration-200"
                >
                  <option value="name">Tên</option>
                  <option value="joinDate">Ngày vào làm</option>
                  <option value="performance">Hiệu suất</option>
                  <option value="salary">Lương</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <ListBulletIcon className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedStaff.map((member, index) => {
              const statusConfig = getStatusConfig(member.status);
              const levelConfig = getLevelConfig(member.level);

              return (
                <div 
                  key={member.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105 transform ${
                    animatingCards.has(member.id) ? 'animate-bounce-in' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCardClick(member)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusConfig.dotColor} rounded-full border-2 border-white animate-pulse`}></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.position}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{member.department}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} animate-fade-in`}>
                        <statusConfig.icon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelConfig.color}`}>
                        {levelConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Tham gia: {new Date(member.joinDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`text-lg font-bold ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Hiệu suất</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`text-lg font-bold ${getPerformanceColor(member.attendance)}`}>
                        {member.attendance}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Chuyên cần</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-purple-600 flex items-center justify-center gap-1">
                        {member.rating}
                        <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Đánh giá</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Kỹ năng chính:</div>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded animate-fade-in"
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Hoạt động: {formatTimeAgo(member.lastActive)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(member.salary)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      Liên hệ
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Hiệu suất
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Trạng thái
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredAndSortedStaff.map((member, index) => {
                    const statusConfig = getStatusConfig(member.status);
                    const levelConfig = getLevelConfig(member.level);

                    return (
                      <tr 
                        key={member.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.01] transform animate-slide-in-left"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative mr-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {member.name.charAt(0)}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusConfig.dotColor} rounded-full border-2 border-white`}></div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {member.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-900 dark:text-white">{member.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">{member.position}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.department}</div>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${levelConfig.color}`}>
                            {levelConfig.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-24">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  member.performance >= 90 ? 'bg-green-500' :
                                  member.performance >= 80 ? 'bg-blue-500' :
                                  member.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${member.performance}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${getPerformanceColor(member.performance)}`}>
                              {member.performance}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <statusConfig.icon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex justify-center space-x-1 sm:space-x-2">
                            <button 
                              onClick={() => handleCardClick(member)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:scale-110 transition-all duration-200"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 hover:scale-110 transition-all duration-200"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 hover:scale-110 transition-all duration-200"
                              title="Xóa"
                            >
                              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedStaff && showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedStaff.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedStaff.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedStaff.position} - {selectedStaff.department}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {selectedStaff.employeeId}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:scale-110 transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <div className="animate-slide-in-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Thông tin cá nhân
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Email:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedStaff.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Điện thoại:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedStaff.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Địa chỉ:</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right">{selectedStaff.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Ngày vào làm:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(selectedStaff.joinDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Lương:</span>
                          <span className="font-bold text-green-600">{formatCurrency(selectedStaff.salary)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="animate-slide-in-left" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AcademicCapIcon className="h-5 w-5" />
                        Kỹ năng & Chứng chỉ
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300 block mb-2">Kỹ năng:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedStaff.skills.map((skill, index) => (
                              <span 
                                key={index} 
                                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full animate-bounce-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300 block mb-2">Chứng chỉ:</span>
                          <div className="space-y-2">
                            {selectedStaff.certifications.map((cert, index) => (
                              <div key={index} className="flex items-center gap-2 animate-slide-in-right" style={{ animationDelay: `${index * 150}ms` }}>
                                <TrophyIcon className="h-4 w-4 text-yellow-500" />
                                <span className="text-gray-900 dark:text-white">{cert}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance & Stats */}
                  <div className="space-y-6">
                    <div className="animate-slide-in-right">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Hiệu suất & Thống kê
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.performance)}`}>
                              {selectedStaff.performance}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Hiệu suất</div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.attendance)}`}>
                              {selectedStaff.attendance}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Chuyên cần</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">{selectedStaff.projects}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Dự án</div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="text-xl font-bold text-green-600">{selectedStaff.tasksCompleted}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Công việc hoàn thành</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-5 w-5 ${i < Math.floor(selectedStaff.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} animate-pulse`}
                                style={{ animationDelay: `${i * 100}ms` }}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedStaff.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="animate-slide-in-right" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        Thời gian làm việc
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Giờ làm việc/tuần:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedStaff.workHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Tăng ca/tuần:</span>
                          <span className="font-medium text-orange-600">{selectedStaff.overtimeHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Hoạt động cuối:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTimeAgo(selectedStaff.lastActive)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Trạng thái:</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusConfig(selectedStaff.status).color}`}>
                            {React.createElement(getStatusConfig(selectedStaff.status).icon, { className: 'h-4 w-4' })}
                            {getStatusConfig(selectedStaff.status).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    Đóng
                  </button>
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2">
                    <PencilIcon className="h-4 w-4" />
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add custom CSS for animations
const customCSS = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in-left {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out;
  }

  .animate-slide-in-up {
    animation: slide-in-up 0.6s ease-out;
  }

  .animate-slide-in-left {
    animation: slide-in-left 0.6s ease-out;
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.6s ease-out;
  }

  .animate-bounce-in {
    animation: bounce-in 0.6s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }

  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
`;

export default StaffPage;
