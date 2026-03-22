// Statistics Cards Component
import React from 'react';
import {
  BuildingStorefrontIcon,
  CubeIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatNumber } from '../../utils/helpers';

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-75 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <span className={`${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </span>
              <span className="opacity-75 ml-1">{trend.period}</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <Icon className="h-12 w-12 opacity-80" />
        </div>
      </div>
    </div>
  );
};

export const StatisticsCards = ({ statistics, className = "" }) => {
  if (!statistics) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Tổng Vị Trí',
      value: formatNumber(statistics.totalLocations || 0),
      icon: BuildingStorefrontIcon,
      color: 'from-blue-500 to-blue-600',
      subtitle: `${formatNumber(statistics.availableLocations || 0)} còn trống`,
      trend: {
        isPositive: true,
        value: '+5%',
        period: 'tuần này'
      }
    },
    {
      title: 'Tổng Sản Phẩm',
      value: formatNumber(statistics.totalItems || 0),
      icon: CubeIcon,
      color: 'from-green-500 to-green-600',
      subtitle: 'Trong kho',
      trend: {
        isPositive: true,
        value: '+12%',
        period: 'tháng này'
      }
    },
    {
      title: 'Sức Chứa',
      value: formatNumber(statistics.totalCapacity || 0),
      icon: ChartBarIcon,
      color: 'from-yellow-500 to-orange-500',
      subtitle: `${formatNumber(statistics.usedCapacity || 0)} đã sử dụng`,
      trend: {
        isPositive: false,
        value: '-2%',
        period: 'so với tháng trước'
      }
    },
    {
      title: 'Tỷ Lệ Sử Dụng',
      value: `${statistics.utilizationRate || 0}%`,
      icon: ClockIcon,
      color: 'from-purple-500 to-pink-500',
      subtitle: 'Hiệu suất kho',
      trend: {
        isPositive: true,
        value: '+8%',
        period: 'cải thiện'
      }
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          subtitle={stat.subtitle}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};
