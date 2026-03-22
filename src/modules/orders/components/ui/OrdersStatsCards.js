// ==================== ORDERS STATS CARDS ====================
// File: src/modules/orders/components/ui/OrdersStatsCards.jsx
// Dashboard stats cards with unified system design

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
} from 'lucide-react';
import { ORDER_PRIORITIES } from '../../config/constants';

export const OrdersStatsCards = ({ orders }) => {
  // Calculate additional metrics
  const totalOrders = orders.length;
  const completedToday = orders.filter(
    (order) =>
      order.status === 'completed' &&
      new Date(order.updatedAt).toDateString() === new Date().toDateString()
  ).length;
  const overdueOrders = orders.filter((order) => order.isOverdue).length;
  const inProgress = orders.filter((order) =>
    ['assigned', 'picking', 'packing'].includes(order.status)
  ).length;

  // Base stats array with computed metrics
  const baseStats = [
    {
      id: 'total',
      label: 'Tổng đơn hàng',
      value: totalOrders,
      icon: Package,
      color: 'blue',
      trend: null,
    },
    {
      id: 'completed',
      label: 'Hoàn thành hôm nay',
      value: completedToday,
      icon: CheckCircle,
      color: 'green',
      trend: 'up',
    },
    {
      id: 'in-progress',
      label: 'Đang xử lý',
      value: inProgress,
      icon: Clock,
      color: 'orange',
      trend: null,
    },
    {
      id: 'overdue',
      label: 'Quá hạn',
      value: overdueOrders,
      icon: AlertTriangle,
      color: 'red',
      trend: overdueOrders > 0 ? 'down' : null,
    },
  ];

  // Priority stats
  const priorityStats = Object.entries(ORDER_PRIORITIES).map(
    ([priority, config]) => {
      const count = orders.filter(
        (order) => order.priority === priority
      ).length;
      return {
        id: priority,
        label: config.name,
        value: count,
        color: config.color,
        urgencyLevel: config.urgencyLevel,
      };
    }
  );

  const getIconColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
    }
  };

  const getBorderColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'border-red-200 dark:border-red-800';
      case 'yellow':
        return 'border-yellow-200 dark:border-yellow-800';
      case 'green':
        return 'border-green-200 dark:border-green-800';
      case 'blue':
        return 'border-blue-200 dark:border-blue-800';
      case 'orange':
        return 'border-orange-200 dark:border-orange-800';
      case 'purple':
        return 'border-purple-200 dark:border-purple-800';
      default:
        return 'border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {baseStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border ${getBorderColorClasses(
                stat.color
              )} p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <div className="flex items-center mt-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <div
                        className={`ml-2 flex items-center text-sm ${
                          stat.trend === 'up'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.trend === 'up' ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColorClasses(
                    stat.color
                  )}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Phân loại theo ưu tiên
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityStats.map((stat) => (
            <div
              key={stat.id}
              className={`p-4 rounded-lg border ${getBorderColorClasses(
                stat.color
              )} bg-opacity-50`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {stat.urgencyLevel}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    stat.color === 'red'
                      ? 'bg-red-500'
                      : stat.color === 'yellow'
                      ? 'bg-yellow-500'
                      : stat.color === 'green'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
