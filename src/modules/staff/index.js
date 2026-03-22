import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  AlertTriangle,
  UserPlus,
  UserCheck,
  UserX,
  Coffee,
  Moon,
  Sun,
  Settings,
  X,
  Plus,
  Search,
  PlayCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useTheme } from '../../App';

// ==================== MOCK DATA ====================
const generateStaffData = () => ({
  summary: {
    totalStaff: 28,
    activeToday: 22,
    onBreak: 3,
    absent: 3,
    overtime: 5,
    avgEfficiency: 87.3,
    avgSLA: 94.8,
    totalHoursToday: 176,
    plannedHours: 184,
  },

  staff: [
    {
      id: 'NV001',
      name: 'Nguyễn Văn A',
      avatar: '👨‍💼',
      position: 'Senior Picker',
      level: 'senior',
      department: 'Picking',
      phone: '0901234567',
      email: 'nguyenvana@mia.com',
      joinDate: '2023-03-15',
      currentShift: 'morning',
      status: 'working',
      location: 'Zone A',
      todayHours: 8,
      plannedHours: 8,
      overtime: 0,
      performance: {
        efficiency: 94.2,
        sla: 98.5,
        accuracy: 99.1,
        ordersCompleted: 42,
        avgTimePerOrder: 18, // minutes
        errorCount: 1,
      },
      skills: ['Picking', 'Packing', 'Quality Control', 'Training'],
      certifications: ['Safety Level 2', 'Equipment Operation'],
      schedule: {
        monday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        tuesday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        wednesday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        thursday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        friday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        saturday: 'off',
        sunday: 'off',
      },
      recentActivity: [
        { time: '14:30', action: 'Completed route RT001', zone: 'A-12' },
        { time: '13:45', action: 'Started break', zone: 'Break Room' },
        { time: '12:30', action: 'Quality check passed', zone: 'A-08' },
      ],
    },
    {
      id: 'NV002',
      name: 'Trần Thị B',
      avatar: '👩‍💼',
      position: 'Picker',
      level: 'intermediate',
      department: 'Picking',
      phone: '0907654321',
      email: 'tranthib@mia.com',
      joinDate: '2023-08-20',
      currentShift: 'morning',
      status: 'break',
      location: 'Break Room',
      todayHours: 4.5,
      plannedHours: 8,
      overtime: 0,
      performance: {
        efficiency: 91.7,
        sla: 97.2,
        accuracy: 98.3,
        ordersCompleted: 38,
        avgTimePerOrder: 21,
        errorCount: 2,
      },
      skills: ['Picking', 'Inventory Check'],
      certifications: ['Safety Level 1'],
      schedule: {
        monday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        tuesday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        wednesday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        thursday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        friday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        saturday: 'off',
        sunday: 'off',
      },
      recentActivity: [
        { time: '14:00', action: 'Started break', zone: 'Break Room' },
        { time: '11:30', action: 'Completed picking task', zone: 'B-05' },
        { time: '09:15', action: 'Clocked in', zone: 'Entrance' },
      ],
    },
    {
      id: 'NV003',
      name: 'Lê Văn C',
      avatar: '👨‍🔧',
      position: 'Team Lead',
      level: 'senior',
      department: 'Operations',
      phone: '0912345678',
      email: 'levanc@mia.com',
      joinDate: '2022-11-10',
      currentShift: 'morning',
      status: 'working',
      location: 'Zone B',
      todayHours: 8,
      plannedHours: 8,
      overtime: 1,
      performance: {
        efficiency: 89.1,
        sla: 95.8,
        accuracy: 97.9,
        ordersCompleted: 35,
        avgTimePerOrder: 23,
        errorCount: 3,
      },
      skills: [
        'Leadership',
        'Training',
        'Quality Control',
        'Process Improvement',
      ],
      certifications: [
        'Safety Level 3',
        'Leadership Certification',
        'Quality Management',
      ],
      schedule: {
        monday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        tuesday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        wednesday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        thursday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        friday: { start: '08:00', end: '17:00', break: '12:00-13:00' },
        saturday: { start: '08:00', end: '12:00', break: 'none' },
        sunday: 'off',
      },
      recentActivity: [
        {
          time: '15:00',
          action: 'Team meeting completed',
          zone: 'Meeting Room',
        },
        { time: '13:30', action: 'Quality audit Zone B', zone: 'B-ALL' },
        { time: '10:45', action: 'Training new staff', zone: 'Training Room' },
      ],
    },
    {
      id: 'NV004',
      name: 'Phạm Thị D',
      avatar: '👩‍💻',
      position: 'Inventory Specialist',
      level: 'intermediate',
      department: 'Inventory',
      phone: '0918765432',
      email: 'phamthid@mia.com',
      joinDate: '2024-01-15',
      currentShift: 'afternoon',
      status: 'absent',
      location: 'N/A',
      todayHours: 0,
      plannedHours: 8,
      overtime: 0,
      performance: {
        efficiency: 85.4,
        sla: 94.1,
        accuracy: 96.2,
        ordersCompleted: 31,
        avgTimePerOrder: 26,
        errorCount: 4,
      },
      skills: ['Inventory Management', 'Data Entry', 'Cycle Counting'],
      certifications: ['Inventory Management'],
      schedule: {
        monday: { start: '14:00', end: '22:00', break: '18:00-19:00' },
        tuesday: { start: '14:00', end: '22:00', break: '18:00-19:00' },
        wednesday: { start: '14:00', end: '22:00', break: '18:00-19:00' },
        thursday: { start: '14:00', end: '22:00', break: '18:00-19:00' },
        friday: { start: '14:00', end: '22:00', break: '18:00-19:00' },
        saturday: 'off',
        sunday: 'off',
      },
      recentActivity: [
        { time: '13:30', action: 'Called in sick', zone: 'Remote' },
      ],
    },
    {
      id: 'NV005',
      name: 'Hoàng Văn E',
      avatar: '👨‍🎓',
      position: 'Trainee',
      level: 'junior',
      department: 'Picking',
      phone: '0934567890',
      email: 'hoangvane@mia.com',
      joinDate: '2024-05-20',
      currentShift: 'morning',
      status: 'training',
      location: 'Training Room',
      todayHours: 6,
      plannedHours: 6,
      overtime: 0,
      performance: {
        efficiency: 72.6,
        sla: 89.3,
        accuracy: 94.1,
        ordersCompleted: 18,
        avgTimePerOrder: 35,
        errorCount: 8,
      },
      skills: ['Basic Picking'],
      certifications: ['Safety Level 1 (In Progress)'],
      schedule: {
        monday: { start: '09:00', end: '15:00', break: '12:00-13:00' },
        tuesday: { start: '09:00', end: '15:00', break: '12:00-13:00' },
        wednesday: { start: '09:00', end: '15:00', break: '12:00-13:00' },
        thursday: { start: '09:00', end: '15:00', break: '12:00-13:00' },
        friday: { start: '09:00', end: '15:00', break: '12:00-13:00' },
        saturday: 'off',
        sunday: 'off',
      },
      recentActivity: [
        {
          time: '14:15',
          action: 'Picking practice session',
          zone: 'Training Room',
        },
        {
          time: '11:00',
          action: 'Safety training module 3',
          zone: 'Training Room',
        },
        {
          time: '09:30',
          action: 'Mentor assignment with NV001',
          zone: 'Zone A',
        },
      ],
    },
  ],

  shifts: [
    {
      id: 'morning',
      name: 'Ca sáng',
      startTime: '08:00',
      endTime: '17:00',
      breakTime: '12:00-13:00',
      capacity: 15,
      currentStaff: 12,
      departments: ['Picking', 'Packing', 'Quality', 'Operations'],
    },
    {
      id: 'afternoon',
      name: 'Ca chiều',
      startTime: '14:00',
      endTime: '22:00',
      breakTime: '18:00-19:00',
      capacity: 10,
      currentStaff: 7,
      departments: ['Picking', 'Inventory', 'Maintenance'],
    },
    {
      id: 'night',
      name: 'Ca đêm',
      startTime: '22:00',
      endTime: '06:00',
      breakTime: '02:00-03:00',
      capacity: 8,
      currentStaff: 3,
      departments: ['Security', 'Maintenance', 'Inventory'],
    },
  ],

  training: [
    {
      id: 'T001',
      title: 'Safety & Security Protocols',
      type: 'mandatory',
      duration: '4 hours',
      status: 'ongoing',
      participants: 5,
      instructor: 'Lê Văn C',
      schedule: '2025-06-02 09:00',
      progress: 75,
    },
    {
      id: 'T002',
      title: 'Advanced Picking Techniques',
      type: 'skill-development',
      duration: '6 hours',
      status: 'planned',
      participants: 8,
      instructor: 'Nguyễn Văn A',
      schedule: '2025-06-05 13:00',
      progress: 0,
    },
    {
      id: 'T003',
      title: 'Inventory Management System',
      type: 'technical',
      duration: '3 hours',
      status: 'completed',
      participants: 12,
      instructor: 'External Trainer',
      schedule: '2025-05-28 14:00',
      progress: 100,
    },
  ],

  tasks: [
    {
      id: 'TSK001',
      title: 'Cycle Count Zone A',
      assignee: 'Phạm Thị D',
      priority: 'high',
      deadline: '2025-06-01 18:00',
      status: 'pending',
      estimatedTime: 120, // minutes
      description:
        'Complete cycle count for all items in Zone A sections A1-A12',
    },
    {
      id: 'TSK002',
      title: 'Train new hire - Basic Picking',
      assignee: 'Nguyễn Văn A',
      priority: 'medium',
      deadline: '2025-06-02 15:00',
      status: 'in-progress',
      estimatedTime: 240,
      description: 'Provide hands-on picking training to Hoàng Văn E',
    },
    {
      id: 'TSK003',
      title: 'Equipment Maintenance Check',
      assignee: 'Lê Văn C',
      priority: 'low',
      deadline: '2025-06-03 12:00',
      status: 'completed',
      estimatedTime: 90,
      description: 'Weekly maintenance check for picking equipment in Zone B',
    },
  ],

  performance: {
    weekly: [
      { day: 'Mon', efficiency: 89, sla: 95, hours: 184 },
      { day: 'Tue', efficiency: 91, sla: 97, hours: 188 },
      { day: 'Wed', efficiency: 87, sla: 94, hours: 176 },
      { day: 'Thu', efficiency: 93, sla: 98, hours: 192 },
      { day: 'Fri', efficiency: 88, sla: 96, hours: 180 },
      { day: 'Sat', efficiency: 85, sla: 93, hours: 96 },
      { day: 'Sun', efficiency: 82, sla: 91, hours: 48 },
    ],
    trends: {
      efficiency: '+5.2%',
      sla: '+2.8%',
      attendance: '+1.4%',
      overtime: '-8.7%',
    },
  },
});

// ==================== MAIN COMPONENT ====================
const StaffManagement = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [data, setData] = useState(generateStaffData());
  const [activeView, setActiveView] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filters, setFilters] = useState({
    department: 'all',
    shift: 'all',
    status: 'all',
    level: 'all',
  });

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          avgEfficiency: prev.summary.avgEfficiency + (Math.random() - 0.5) * 2,
        },
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const views = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'staff', label: 'Nhân viên', icon: Users },
    { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
    { id: 'training', label: 'Đào tạo', icon: Award },
    { id: 'tasks', label: 'Nhiệm vụ', icon: Target },
    { id: 'performance', label: 'Hiệu suất', icon: TrendingUp },
  ];

  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    surface: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    },
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const filteredStaff = useMemo(() => {
    return data.staff.filter((staff) => {
      if (
        filters.department !== 'all' &&
        staff.department !== filters.department
      )
        return false;
      if (filters.shift !== 'all' && staff.currentShift !== filters.shift)
        return false;
      if (filters.status !== 'all' && staff.status !== filters.status)
        return false;
      if (filters.level !== 'all' && staff.level !== filters.level)
        return false;
      return true;
    });
  }, [data.staff, filters]);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${themeClasses.background} ${themeClasses.text.primary}`}
    >
      {/* Header */}
      <div
        className={`${themeClasses.surface} border-b ${themeClasses.border} p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Staff Management & Scheduling
              </h1>
              <p className={`${themeClasses.text.muted}`}>
                Quản lý nhân sự kho vận • 01/06/2025 14:50 •{' '}
                {data.summary.activeToday}/{data.summary.totalStaff} active
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <UserPlus size={16} />
              <span>Add Staff</span>
            </button>

            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Calendar size={16} />
              <span>Manage Schedule</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${themeClasses.surface} border ${themeClasses.border} hover:opacity-80 transition-colors`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              className={`p-2 rounded-lg ${themeClasses.surface} border ${themeClasses.border} hover:opacity-80 transition-colors`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-2 mt-6 overflow-x-auto">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeView === view.id
                  ? 'bg-blue-600 text-white'
                  : `${themeClasses.surface} ${themeClasses.text.secondary} hover:${themeClasses.text.primary}`
              }`}
            >
              <view.icon size={16} />
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeView === 'overview' && (
          <OverviewView data={data} themeClasses={themeClasses} />
        )}
        {activeView === 'staff' && (
          <StaffView
            staff={filteredStaff}
            filters={filters}
            setFilters={setFilters}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
            themeClasses={themeClasses}
          />
        )}
        {activeView === 'schedule' && (
          <ScheduleView data={data} themeClasses={themeClasses} />
        )}
        {activeView === 'training' && (
          <TrainingView training={data.training} themeClasses={themeClasses} />
        )}
        {activeView === 'tasks' && (
          <TasksView tasks={data.tasks} themeClasses={themeClasses} />
        )}
        {activeView === 'performance' && (
          <PerformanceView
            data={data.performance}
            themeClasses={themeClasses}
          />
        )}
      </div>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          themeClasses={themeClasses}
        />
      )}
    </div>
  );
};

// ==================== OVERVIEW VIEW ====================
const OverviewView = ({ data, themeClasses }) => {
  const statusCards = [
    {
      label: 'Tổng nhân viên',
      value: data.summary.totalStaff,
      change: '+2',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Đang làm việc',
      value: data.summary.activeToday,
      change: '-1',
      icon: UserCheck,
      color: 'green',
    },
    {
      label: 'Nghỉ/Vắng mặt',
      value: data.summary.absent,
      change: '+1',
      icon: UserX,
      color: 'red',
    },
    {
      label: 'Hiệu suất TB',
      value: `${data.summary.avgEfficiency.toFixed(1)}%`,
      change: '+2.3%',
      icon: Target,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${themeClasses.text.muted} mb-1`}>
                  {card.label}
                </p>
                <p className="text-2xl font-bold mb-2">{card.value}</p>
                <div className="flex items-center space-x-1">
                  {card.change.startsWith('+') ? (
                    <ArrowUp size={14} className="text-green-500" />
                  ) : (
                    <ArrowDown size={14} className="text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      card.change.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/30`}
              >
                <card.icon size={20} className={`text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shift overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">Shift Coverage Today</h3>
          <div className="space-y-4">
            {data.shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{shift.name}</h4>
                  <p className="text-sm text-gray-500">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {shift.currentStaff}/{shift.capacity}
                  </p>
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        shift.currentStaff / shift.capacity >= 0.8
                          ? 'bg-green-500'
                          : shift.currentStaff / shift.capacity >= 0.6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${
                          (shift.currentStaff / shift.capacity) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">Today's Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <PlayCircle className="text-blue-600" size={20} />
                <span className="font-medium">Morning shift started</span>
              </div>
              <span className="text-sm text-gray-500">08:00</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Coffee className="text-yellow-600" size={20} />
                <span className="font-medium">3 staff on break</span>
              </div>
              <span className="text-sm text-gray-500">14:00</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="text-green-600" size={20} />
                <span className="font-medium">Training session completed</span>
              </div>
              <span className="text-sm text-gray-500">13:30</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="font-medium">1 staff called in sick</span>
              </div>
              <span className="text-sm text-gray-500">13:30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance metrics */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">Weekly Performance Trend</h3>
        <div className="h-64 flex items-end space-x-2">
          {data.performance.weekly.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex flex-col space-y-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(day.efficiency / 100) * 200}px` }}
                ></div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {day.efficiency}%
                </div>
              </div>
              <span className="text-xs mt-2">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Efficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF VIEW ====================
const StaffView = ({
  staff,
  filters,
  setFilters,
  selectedStaff,
  setSelectedStaff,
  themeClasses,
}) => {
  const getStatusBadge = (status) => {
    const badges = {
      working: 'bg-green-100 text-green-700 border-green-200',
      break: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      absent: 'bg-red-100 text-red-700 border-red-200',
      training: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    const labels = {
      working: 'Đang làm',
      break: 'Nghỉ giải lao',
      absent: 'Vắng mặt',
      training: 'Đào tạo',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const badges = {
      senior: 'bg-purple-100 text-purple-700',
      intermediate: 'bg-blue-100 text-blue-700',
      junior: 'bg-gray-100 text-gray-700',
    };

    const labels = {
      senior: 'Senior',
      intermediate: 'Intermediate',
      junior: 'Junior',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[level]}`}
      >
        {labels[level]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 w-64"
            />
          </div>

          <select
            value={filters.department}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, department: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả phòng ban</option>
            <option value="Picking">Picking</option>
            <option value="Packing">Packing</option>
            <option value="Inventory">Inventory</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={filters.shift}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, shift: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả ca</option>
            <option value="morning">Ca sáng</option>
            <option value="afternoon">Ca chiều</option>
            <option value="night">Ca đêm</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="working">Đang làm</option>
            <option value="break">Nghỉ giải lao</option>
            <option value="absent">Vắng mặt</option>
            <option value="training">Đào tạo</option>
          </select>
        </div>
      </div>

      {/* Staff grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6 hover:shadow-md transition-all cursor-pointer`}
            onClick={() => setSelectedStaff(member)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{member.avatar}</div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.position}</p>
                  <p className="text-xs text-gray-400">{member.id}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                {getStatusBadge(member.status)}
                {getLevelBadge(member.level)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium">{member.department}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">{member.location}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Today hours:</span>
                <span className="font-medium">
                  {member.todayHours}/{member.plannedHours}h
                </span>
              </div>

              {/* Performance indicators */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-gray-500">Efficiency</p>
                    <p className="font-medium">
                      {member.performance.efficiency}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">SLA</p>
                    <p className="font-medium">{member.performance.sla}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Orders</p>
                    <p className="font-medium">
                      {member.performance.ordersCompleted}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== STAFF DETAIL MODAL ====================
const StaffDetailModal = ({ staff, onClose, themeClasses }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`${themeClasses.surface} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{staff.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold">{staff.name}</h2>
                <p className="text-gray-500">
                  {staff.position} • {staff.department}
                </p>
                <p className="text-sm text-gray-400">
                  {staff.id} • Joined {staff.joinDate}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Performance metrics */}
          <div>
            <h3 className="font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {staff.performance.efficiency}%
                </p>
                <p className="text-sm text-gray-600">Efficiency</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {staff.performance.sla}%
                </p>
                <p className="text-sm text-gray-600">SLA Compliance</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {staff.performance.ordersCompleted}
                </p>
                <p className="text-sm text-gray-600">Orders Today</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {staff.performance.avgTimePerOrder}m
                </p>
                <p className="text-sm text-gray-600">Avg Time/Order</p>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <p className="text-2xl font-bold text-teal-600">
                  {staff.performance.accuracy}%
                </p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {staff.performance.errorCount}
                </p>
                <p className="text-sm text-gray-600">Errors Today</p>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {staff.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {staff.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {staff.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.zone}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Edit Staff
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SCHEDULE VIEW ====================
const ScheduleView = ({ data, themeClasses }) => {
  return (
    <div className="space-y-6">
      {/* Shift management */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">Shift Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.shifts.map((shift) => (
            <div
              key={shift.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">{shift.name}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shift.currentStaff / shift.capacity >= 0.8
                      ? 'bg-green-100 text-green-700'
                      : shift.currentStaff / shift.capacity >= 0.6
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {Math.round((shift.currentStaff / shift.capacity) * 100)}%
                  capacity
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span>
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Break:</span>
                  <span>{shift.breakTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Staff:</span>
                  <span>
                    {shift.currentStaff}/{shift.capacity}
                  </span>
                </div>
              </div>

              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    shift.currentStaff / shift.capacity >= 0.8
                      ? 'bg-green-500'
                      : shift.currentStaff / shift.capacity >= 0.6
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${(shift.currentStaff / shift.capacity) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="mt-3 flex space-x-2">
                <button className="flex-1 text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">
                  Assign Staff
                </button>
                <button className="text-sm border border-gray-200 dark:border-gray-600 py-1 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly schedule preview */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">Weekly Schedule Preview</h3>
        <p className="text-gray-500 mb-4">
          💡 Interactive calendar với drag-drop scheduling sẽ được tích hợp
          trong phiên bản production
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300">
            Weekly calendar view với khả năng assign staff vào shifts, manage
            time-off requests, và optimize coverage
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== TRAINING VIEW ====================
const TrainingView = ({ training, themeClasses }) => {
  const getStatusBadge = (status) => {
    const badges = {
      ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
      planned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Training Programs</h3>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>New Training</span>
          </button>
        </div>

        <div className="space-y-4">
          {training.map((program) => (
            <div
              key={program.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{program.title}</h4>
                  <p className="text-sm text-gray-500">
                    {program.type} • {program.duration}
                  </p>
                </div>
                {getStatusBadge(program.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Participants:</span>
                  <span className="font-medium ml-1">
                    {program.participants}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Instructor:</span>
                  <span className="font-medium ml-1">{program.instructor}</span>
                </div>
                <div>
                  <span className="text-gray-500">Schedule:</span>
                  <span className="font-medium ml-1">{program.schedule}</span>
                </div>
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <span className="font-medium ml-1">{program.progress}%</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${program.progress}%` }}
                ></div>
              </div>

              <div className="flex space-x-2">
                <button className="text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                {program.status === 'planned' && (
                  <button className="text-sm bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition-colors">
                    Start Training
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== TASKS VIEW ====================
const TasksView = ({ tasks, themeClasses }) => {
  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[priority]}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
    };

    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Task Management</h3>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {task.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Assignee:</span>
                  <span className="font-medium ml-1">{task.assignee}</span>
                </div>
                <div>
                  <span className="text-gray-500">Deadline:</span>
                  <span className="font-medium ml-1">{task.deadline}</span>
                </div>
                <div>
                  <span className="text-gray-500">Estimated:</span>
                  <span className="font-medium ml-1">
                    {Math.round(task.estimatedTime / 60)}h
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium ml-1">{task.status}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <button className="text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                {task.status !== 'completed' && (
                  <button className="text-sm border border-gray-200 dark:border-gray-600 py-1 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Update Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== PERFORMANCE VIEW ====================
const PerformanceView = ({ data, themeClasses }) => {
  return (
    <div className="space-y-6">
      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.trends).map(([key, value]) => (
          <div
            key={key}
            className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <div
                className={`p-2 rounded-lg ${
                  value.startsWith('+') ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {value.startsWith('+') ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly performance chart */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">Weekly Performance Trend</h3>
        <div className="h-64 flex items-end space-x-2">
          {data.weekly.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex flex-col space-y-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(day.efficiency / 100) * 200}px` }}
                ></div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {day.efficiency}%
                </div>
              </div>
              <span className="text-xs mt-2">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
