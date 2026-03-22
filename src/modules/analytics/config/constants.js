// ==================== ANALYTICS CONSTANTS ====================
// File: src/modules/analytics/config/constants.js
// Analytics configuration, data generators, and constants

// Mock data generator
export const generateAnalyticsData = () => ({
  kpis: {
    totalOrders: 2847,
    completedOrders: 2698,
    slaCompliance: 94.8,
    avgProcessingTime: 22.5, // minutes
    throughputRate: 126, // orders/hour
    errorRate: 1.2,
    costPerOrder: 15500, // VND
    revenueImpact: 847000000, // VND
    staffUtilization: 87.3,
    warehouseUtilization: 78.9,
  },

  trends: {
    daily: [
      {
        date: '2025-05-26',
        orders: 245,
        sla: 92.1,
        errors: 3,
        revenue: 78000000,
      },
      {
        date: '2025-05-27',
        orders: 267,
        sla: 94.3,
        errors: 2,
        revenue: 85000000,
      },
      {
        date: '2025-05-28',
        orders: 289,
        sla: 96.2,
        errors: 4,
        revenue: 92000000,
      },
      {
        date: '2025-05-29',
        orders: 312,
        sla: 93.8,
        errors: 5,
        revenue: 98000000,
      },
      {
        date: '2025-05-30',
        orders: 298,
        sla: 95.7,
        errors: 2,
        revenue: 94000000,
      },
      {
        date: '2025-05-31',
        orders: 334,
        sla: 97.1,
        errors: 3,
        revenue: 106000000,
      },
      {
        date: '2025-06-01',
        orders: 289,
        sla: 94.8,
        errors: 1,
        revenue: 89000000,
      },
    ],

    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: Math.floor(Math.random() * 50) + 10,
      efficiency: Math.floor(Math.random() * 20) + 80,
      staff: Math.floor(Math.random() * 3) + 2,
    })),

    monthly: [
      {
        month: 'Jan',
        orders: 7234,
        sla: 91.2,
        cost: 112000000,
        revenue: 2340000000,
      },
      {
        month: 'Feb',
        orders: 8156,
        sla: 93.1,
        cost: 119000000,
        revenue: 2680000000,
      },
      {
        month: 'Mar',
        orders: 9012,
        sla: 94.8,
        cost: 125000000,
        revenue: 2950000000,
      },
      {
        month: 'Apr',
        orders: 8789,
        sla: 96.2,
        cost: 118000000,
        revenue: 2870000000,
      },
      {
        month: 'May',
        orders: 9543,
        sla: 95.7,
        cost: 131000000,
        revenue: 3120000000,
      },
    ],
  },

  performance: {
    byStaff: [
      {
        id: 'NV001',
        name: 'Nguyễn Văn A',
        orders: 312,
        sla: 98.5,
        efficiency: 94,
        errors: 2,
      },
      {
        id: 'NV002',
        name: 'Trần Thị B',
        orders: 298,
        sla: 97.2,
        efficiency: 91,
        errors: 3,
      },
      {
        id: 'NV003',
        name: 'Lê Văn C',
        orders: 286,
        sla: 95.8,
        efficiency: 89,
        errors: 4,
      },
      {
        id: 'NV004',
        name: 'Phạm Thị D',
        orders: 267,
        sla: 94.1,
        efficiency: 87,
        errors: 5,
      },
      {
        id: 'NV005',
        name: 'Hoàng Văn E',
        orders: 245,
        sla: 92.6,
        efficiency: 85,
        errors: 7,
      },
    ],

    byZone: [
      {
        zone: 'A',
        utilization: 95,
        avgTime: 2.3,
        accuracy: 98.2,
        revenue: 156000000,
      },
      {
        zone: 'B',
        utilization: 78,
        avgTime: 2.8,
        accuracy: 97.1,
        revenue: 98000000,
      },
      {
        zone: 'C',
        utilization: 65,
        avgTime: 3.5,
        accuracy: 95.8,
        revenue: 67000000,
      },
      {
        zone: 'D',
        utilization: 88,
        avgTime: 4.2,
        accuracy: 99.1,
        revenue: 234000000,
      },
    ],

    byProduct: [
      {
        name: 'Vali Larita 28"',
        orders: 456,
        revenue: 198000000,
        margin: 23.5,
        stockTurns: 12.3,
      },
      {
        name: 'Vali Pisani 24"',
        orders: 398,
        revenue: 167000000,
        margin: 21.2,
        stockTurns: 10.8,
      },
      {
        name: 'Luggage Tag Set',
        orders: 623,
        revenue: 89000000,
        margin: 45.6,
        stockTurns: 24.1,
      },
      {
        name: 'Travel Pillow',
        orders: 389,
        revenue: 78000000,
        margin: 38.9,
        stockTurns: 18.7,
      },
      {
        name: 'TSA Lock',
        orders: 512,
        revenue: 56000000,
        margin: 42.1,
        stockTurns: 28.4,
      },
    ],
  },

  predictions: {
    nextWeek: {
      expectedOrders: 2156,
      peakDay: 'Wednesday',
      peakHour: 14,
      recommendedStaff: 6,
      riskFactors: [
        'Holiday surge',
        'New product launch',
        'Competitor promotion',
      ],
    },

    alerts: [
      {
        type: 'opportunity',
        message: 'Zone A có thể tăng capacity 15% với 1 nhân viên thêm',
      },
      {
        type: 'warning',
        message: 'Dự báo thiếu stock Vali Larita trong 3 ngày tới',
      },
      {
        type: 'insight',
        message: 'Peak hour 14:00-16:00 có thể tối ưu bằng pre-staging',
      },
    ],
  },
});

// Report templates
export const REPORT_TEMPLATES = [
  {
    id: 'daily-summary',
    name: 'Daily Operations Summary',
    icon: 'Calendar',
    schedule: 'Daily 08:00',
    recipients: ['manager@mia.com', 'operations@mia.com'],
    format: 'PDF + Excel',
    lastRun: '2025-06-01 08:00',
  },
  {
    id: 'weekly-performance',
    name: 'Weekly Performance Review',
    icon: 'TrendingUp',
    schedule: 'Monday 09:00',
    recipients: ['ceo@mia.com', 'warehouse@mia.com'],
    format: 'PDF',
    lastRun: '2025-05-27 09:00',
  },
  {
    id: 'monthly-analytics',
    name: 'Monthly Analytics Deep Dive',
    icon: 'BarChart3',
    schedule: '1st of month',
    recipients: ['board@mia.com'],
    format: 'Presentation + Data',
    lastRun: '2025-05-01 10:00',
  },
  {
    id: 'inventory-forecast',
    name: 'Inventory & Demand Forecast',
    icon: 'Package',
    schedule: 'Bi-weekly',
    recipients: ['supply@mia.com', 'finance@mia.com'],
    format: 'Excel + Dashboard',
    lastRun: '2025-05-28 14:00',
  },
];

// View configurations
export const ANALYTICS_VIEWS = [
  { id: 'overview', label: 'Tổng quan', icon: 'BarChart3' },
  { id: 'trends', label: 'Xu hướng', icon: 'TrendingUp' },
  { id: 'performance', label: 'Hiệu suất', icon: 'Target' },
  { id: 'reports', label: 'Báo cáo', icon: 'FileText' },
  { id: 'predictions', label: 'Dự báo', icon: 'Lightbulb' },
];

// Time range options
export const TIME_RANGES = [
  { value: '1d', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '3 tháng' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

// KPI card color mapping
export const KPI_COLOR_MAP = {
  blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  red: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  teal: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
  cyan: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
};

// Default metrics selection
export const DEFAULT_SELECTED_METRICS = ['orders', 'sla', 'efficiency'];

// Auto-refresh interval (milliseconds)
export const AUTO_REFRESH_INTERVAL = 30000;

// Chart configuration
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  success: '#10B981',
};

// Data refresh settings
export const REFRESH_SETTINGS = {
  interval: 30000, // 30 seconds
  enableAutoRefresh: true,
  maxRetries: 3,
};
