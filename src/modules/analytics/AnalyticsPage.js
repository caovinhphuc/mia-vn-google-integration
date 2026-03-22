// Enhanced Analytics Module - Phân tích dữ liệu tối ưu
import React, { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  CubeIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('7_days');
  // Removed unused selectedMetric state
  // Removed unused showFilters state
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalOrders: { value: 2485, change: 12.5, trend: 'up' },
      totalRevenue: { value: 125000000, change: -5.2, trend: 'down' },
      avgProcessingTime: { value: 2.4, change: -8.1, trend: 'down' },
      inventoryTurnover: { value: 4.2, change: 15.3, trend: 'up' },
    },
    inventoryAnalysis: {
      categories: ['Điện tử', 'Thực phẩm', 'Quần áo', 'Gia dụng', 'Sách'],
      values: [35, 28, 22, 12, 8],
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    },
    performanceMetrics: {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      datasets: [
        {
          label: 'Đơn hàng xử lý',
          data: [120, 135, 140, 125, 160, 155, 95],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Đơn hàng hoàn thành',
          data: [115, 130, 135, 120, 155, 150, 90],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    },
    warehouseUtilization: {
      labels: ['Khu A1', 'Khu A2', 'Khu B1', 'Khu B2', 'Khu C1', 'Khu C2'],
      datasets: [
        {
          label: 'Tỷ lệ sử dụng (%)',
          data: [85, 72, 95, 68, 78, 82],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
        },
      ],
    },
    topProducts: [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        sales: 245,
        revenue: 610000000,
        growth: 15.2,
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24',
        sales: 198,
        revenue: 450000000,
        growth: -2.1,
      },
      {
        id: 3,
        name: 'MacBook Air M3',
        sales: 156,
        revenue: 520000000,
        growth: 8.7,
      },
      {
        id: 4,
        name: 'iPad Pro 12.9"',
        sales: 134,
        revenue: 380000000,
        growth: 12.5,
      },
      {
        id: 5,
        name: 'AirPods Pro 2',
        sales: 298,
        revenue: 190000000,
        growth: 22.1,
      },
    ],
    monthlyTrends: {
      labels: [
        'T1',
        'T2',
        'T3',
        'T4',
        'T5',
        'T6',
        'T7',
        'T8',
        'T9',
        'T10',
        'T11',
        'T12',
      ],
      datasets: [
        {
          label: 'Doanh thu (triệu VNĐ)',
          data: [85, 92, 110, 95, 125, 140, 135, 150, 145, 165, 180, 195],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Số đơn hàng',
          data: [
            1200, 1350, 1580, 1420, 1680, 1850, 1750, 1950, 1880, 2100, 2250,
            2485,
          ],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    },
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tháng',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (triệu VNĐ)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Số đơn hàng',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format number with suffix
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Get trend icon and color
  const getTrendInfo = (trend, change) => {
    const isPositive = change > 0;
    const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const bgClass = isPositive ? 'bg-green-100' : 'bg-red-100';

    return { Icon, colorClass, bgClass };
  };

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Phân tích dữ liệu
                </h1>
                <p className="text-gray-600">
                  Báo cáo và thống kê hiệu suất kho hàng
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7_days">7 ngày qua</option>
                  <option value="30_days">30 ngày qua</option>
                  <option value="3_months">3 tháng qua</option>
                  <option value="6_months">6 tháng qua</option>
                  <option value="1_year">12 tháng qua</option>
                </select>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                />
                <span>Làm mới</span>
              </button>

              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng đơn hàng
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analyticsData.overview.totalOrders.value)}
                </p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const { Icon, colorClass } = getTrendInfo(
                      analyticsData.overview.totalOrders.trend,
                      analyticsData.overview.totalOrders.change
                    );
                    return (
                      <>
                        <Icon className={`w-4 h-4 mr-1 ${colorClass}`} />
                        <span className={`text-sm font-medium ${colorClass}`}>
                          {Math.abs(analyticsData.overview.totalOrders.change)}%
                        </span>
                      </>
                    );
                  })()}
                  <span className="text-sm text-gray-600 ml-1">
                    so với kỳ trước
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CubeIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(
                    analyticsData.overview.totalRevenue.value / 1000000
                  )}
                  M
                </p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const { Icon, colorClass } = getTrendInfo(
                      analyticsData.overview.totalRevenue.trend,
                      analyticsData.overview.totalRevenue.change
                    );
                    return (
                      <>
                        <Icon className={`w-4 h-4 mr-1 ${colorClass}`} />
                        <span className={`text-sm font-medium ${colorClass}`}>
                          {Math.abs(analyticsData.overview.totalRevenue.change)}
                          %
                        </span>
                      </>
                    );
                  })()}
                  <span className="text-sm text-gray-600 ml-1">
                    so với kỳ trước
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Thời gian xử lý TB
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.overview.avgProcessingTime.value}h
                </p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const { Icon, colorClass } = getTrendInfo(
                      analyticsData.overview.avgProcessingTime.trend,
                      analyticsData.overview.avgProcessingTime.change
                    );
                    return (
                      <>
                        <Icon className={`w-4 h-4 mr-1 ${colorClass}`} />
                        <span className={`text-sm font-medium ${colorClass}`}>
                          {Math.abs(
                            analyticsData.overview.avgProcessingTime.change
                          )}
                          %
                        </span>
                      </>
                    );
                  })()}
                  <span className="text-sm text-gray-600 ml-1">
                    so với kỳ trước
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ClockIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Vòng quay kho
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.overview.inventoryTurnover.value}x
                </p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const { Icon, colorClass } = getTrendInfo(
                      analyticsData.overview.inventoryTurnover.trend,
                      analyticsData.overview.inventoryTurnover.change
                    );
                    return (
                      <>
                        <Icon className={`w-4 h-4 mr-1 ${colorClass}`} />
                        <span className={`text-sm font-medium ${colorClass}`}>
                          {Math.abs(
                            analyticsData.overview.inventoryTurnover.change
                          )}
                          %
                        </span>
                      </>
                    );
                  })()}
                  <span className="text-sm text-gray-600 ml-1">
                    so với kỳ trước
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ArrowPathIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hiệu suất hàng tuần
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div style={{ height: '300px' }}>
                <Line
                  data={analyticsData.performanceMetrics}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>

          {/* Inventory Distribution */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Phân bố hàng tồn kho
              </h2>
            </div>
            <div className="p-6">
              <div style={{ height: '300px' }}>
                <Doughnut
                  data={{
                    labels: analyticsData.inventoryAnalysis.categories,
                    datasets: [
                      {
                        data: analyticsData.inventoryAnalysis.values,
                        backgroundColor: analyticsData.inventoryAnalysis.colors,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Utilization & Monthly Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Warehouse Utilization */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Tỷ lệ sử dụng kho
              </h2>
            </div>
            <div className="p-6">
              <div style={{ height: '300px' }}>
                <Bar
                  data={analyticsData.warehouseUtilization}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Xu hướng theo tháng
              </h2>
            </div>
            <div className="p-6">
              <div style={{ height: '300px' }}>
                <Line
                  data={analyticsData.monthlyTrends}
                  options={dualAxisOptions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Sản phẩm bán chạy nhất
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng bán
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tăng trưởng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.topProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {product.sales.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(product.revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.growth > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            product.growth > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {Math.abs(product.growth)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
