// ==================== ANALYTICS UTILITIES ====================
// File: src/modules/analytics/utils/dataHelpers.js
// Utility functions for data processing and formatting

// Format numbers for display
export const formatNumber = (value, type = 'number') => {
  if (!value && value !== 0) return '-';

  switch (type) {
    case 'currency':
      return `${Math.round(value / 1000)}K VND`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'time':
      return `${value} phút`;
    case 'rate':
      return `${value} đơn/giờ`;
    case 'large':
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
      } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    default:
      return value.toLocaleString();
  }
};

// Calculate percentage change
export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Format change percentage for display
export const formatChange = (change) => {
  if (!change && change !== 0) return '+0.0%';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Determine if change is positive (good) based on metric type
export const isPositiveChange = (change, metricType) => {
  if (!change && change !== 0) return true;

  // For error rate, lower is better
  if (
    metricType === 'error' ||
    metricType === 'cost' ||
    metricType === 'time'
  ) {
    return change < 0;
  }

  // For most metrics, higher is better
  return change > 0;
};

// Generate KPI cards data
export const generateKPICards = (data) => [
  {
    label: 'Tổng đơn hàng',
    value: data.kpis.totalOrders,
    change: '+12.5%',
    positive: true,
    icon: 'Package',
    color: 'blue',
  },
  {
    label: 'SLA Compliance',
    value: `${data.kpis.slaCompliance}%`,
    change: '+2.3%',
    positive: true,
    icon: 'CheckCircle',
    color: 'green',
  },
  {
    label: 'Thời gian xử lý TB',
    value: `${data.kpis.avgProcessingTime} phút`,
    change: '-8.7%',
    positive: true,
    icon: 'Clock',
    color: 'purple',
  },
  {
    label: 'Throughput Rate',
    value: `${data.kpis.throughputRate} đơn/giờ`,
    change: '+15.2%',
    positive: true,
    icon: 'TrendingUp',
    color: 'orange',
  },
  {
    label: 'Tỷ lệ lỗi',
    value: `${data.kpis.errorRate}%`,
    change: '-45.8%',
    positive: true,
    icon: 'AlertTriangle',
    color: 'red',
  },
  {
    label: 'Chi phí/Đơn',
    value: formatNumber(data.kpis.costPerOrder, 'currency'),
    change: '-5.4%',
    positive: true,
    icon: 'DollarSign',
    color: 'indigo',
  },
  {
    label: 'Sử dụng nhân sự',
    value: `${data.kpis.staffUtilization}%`,
    change: '+3.1%',
    positive: true,
    icon: 'Users',
    color: 'teal',
  },
  {
    label: 'Sử dụng kho',
    value: `${data.kpis.warehouseUtilization}%`,
    change: '+7.8%',
    positive: true,
    icon: 'Warehouse',
    color: 'cyan',
  },
];

// Calculate SLA status color
export const getSLAStatusColor = (sla) => {
  if (sla >= 95) return 'bg-green-500';
  if (sla >= 90) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Generate chart data for trends
export const formatChartData = (data, type = 'daily') => {
  switch (type) {
    case 'daily':
      return data.map((item) => ({
        ...item,
        formattedDate: item.date.slice(-2),
        height: (item.orders / 350) * 200,
        slaHeight: (item.sla / 100) * 200,
      }));
    case 'hourly':
      return data.map((item) => ({
        ...item,
        height: (item.orders / 60) * 200,
        isBusinessHour: item.hour >= 8 && item.hour <= 17,
      }));
    case 'monthly':
      return data.map((item) => ({
        ...item,
        ordersHeight: (item.orders / 10000) * 160,
        revenueHeight: (item.revenue / 3500000000) * 160,
        formattedOrders: (item.orders / 1000).toFixed(1) + 'K',
        formattedRevenue: (item.revenue / 1000000000).toFixed(1) + 'B',
      }));
    default:
      return data;
  }
};

// Filter data by time range
export const filterDataByTimeRange = (data, timeRange) => {
  const now = new Date();
  let startDate;

  switch (timeRange) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return data;
  }

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate;
  });
};

// Sort performance data
export const sortPerformanceData = (data, sortBy = 'sla', order = 'desc') => {
  return [...data].sort((a, b) => {
    if (order === 'desc') {
      return b[sortBy] - a[sortBy];
    }
    return a[sortBy] - b[sortBy];
  });
};

// Calculate aggregated metrics
export const calculateAggregatedMetrics = (data) => {
  if (!data || data.length === 0) return {};

  const totals = data.reduce(
    (acc, item) => {
      acc.orders += item.orders || 0;
      acc.revenue += item.revenue || 0;
      acc.errors += item.errors || 0;
      acc.slaSum += item.sla || 0;
      return acc;
    },
    { orders: 0, revenue: 0, errors: 0, slaSum: 0 }
  );

  return {
    totalOrders: totals.orders,
    totalRevenue: totals.revenue,
    totalErrors: totals.errors,
    avgSLA: totals.slaSum / data.length,
    errorRate: (totals.errors / totals.orders) * 100,
  };
};

// Generate insights based on data
export const generateInsights = (data) => {
  const insights = [];

  // SLA insight
  if (data.kpis.slaCompliance >= 95) {
    insights.push({
      type: 'success',
      message: `Excellent SLA performance at ${data.kpis.slaCompliance}%`,
      icon: 'CheckCircle',
    });
  } else if (data.kpis.slaCompliance < 90) {
    insights.push({
      type: 'warning',
      message: `SLA compliance below target at ${data.kpis.slaCompliance}%`,
      icon: 'AlertTriangle',
    });
  }

  // Error rate insight
  if (data.kpis.errorRate <= 1) {
    insights.push({
      type: 'success',
      message: `Low error rate of ${data.kpis.errorRate}%`,
      icon: 'Shield',
    });
  } else if (data.kpis.errorRate > 3) {
    insights.push({
      type: 'warning',
      message: `High error rate requires attention: ${data.kpis.errorRate}%`,
      icon: 'AlertTriangle',
    });
  }

  // Utilization insight
  if (data.kpis.staffUtilization > 90) {
    insights.push({
      type: 'info',
      message: `High staff utilization may indicate capacity constraints`,
      icon: 'Users',
    });
  }

  return insights;
};

// Export data to CSV format
export const exportToCSV = (data, filename = 'analytics-data') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((item) => Object.values(item).join(','));
  const csv = [headers, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Validate data structure
export const validateData = (data) => {
  const errors = [];

  if (!data) {
    errors.push('Data is null or undefined');
    return errors;
  }

  if (!data.kpis) {
    errors.push('Missing KPIs data');
  }

  if (!data.trends) {
    errors.push('Missing trends data');
  }

  if (!data.performance) {
    errors.push('Missing performance data');
  }

  return errors;
};
