import React from 'react';
import { Activity, Users, Gauge } from 'lucide-react';
import { useTheme } from '../../../App';
import { generateKPICards } from '../utils/dataHelpers';
import KPICard from './KPICard';

const OverviewView = ({ data }) => {
  const { themeClasses } = useTheme();
  const kpiCards = generateKPICards(data);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trends chart */}
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Xu hướng 7 ngày gần đây
          </h3>
          <div className="h-64 flex items-end space-x-2">
            {data.trends.daily.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(day.orders / 350) * 200}px` }}
                  ></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {day.orders}
                  </div>
                </div>
                <span className="text-xs mt-2">{day.date.slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA compliance chart */}
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">SLA Compliance Trend</h3>
          <div className="h-64 flex items-end space-x-2">
            {data.trends.daily.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div
                    className={`w-full rounded-t ${day.sla >= 95
                      ? 'bg-green-500'
                      : day.sla >= 90
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                    style={{ height: `${(day.sla / 100) * 200}px` }}
                  ></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {day.sla.toFixed(1)}%
                  </div>
                </div>
                <span className="text-xs mt-2">{day.date.slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time activity */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hoạt động thời gian thực</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Activity className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-blue-600">15</p>
            <p className="text-sm text-gray-600">Đơn đang xử lý</p>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Users className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-600">Nhân viên online</p>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Gauge className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-2xl font-bold text-purple-600">94%</p>
            <p className="text-sm text-gray-600">Hiệu suất hiện tại</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
