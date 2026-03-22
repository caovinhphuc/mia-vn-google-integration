import React from 'react';
import {
  TrendingUp,
  ArrowUp,
  Target,
  Zap,
  Star,
  Lightbulb,
} from 'lucide-react';
import { useTheme } from '../../../App';

const TrendsView = ({ data }) => {
  const { themeClasses } = useTheme();

  return (
    <div className="space-y-6">
      {/* Monthly trends */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-6">Xu hướng theo tháng</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders trend */}
          <div>
            <h4 className="font-medium mb-4">Số lượng đơn hàng</h4>
            <div className="h-48 flex items-end space-x-3">
              {data.monthly.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                    style={{ height: `${(month.orders / 10000) * 160}px` }}
                  ></div>
                  <span className="text-xs mt-2">{month.month}</span>
                  <span className="text-xs text-gray-500">
                    {(month.orders / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue trend */}
          <div>
            <h4 className="font-medium mb-4">Doanh thu (tỷ VND)</h4>
            <div className="h-48 flex items-end space-x-3">
              {data.monthly.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                    style={{
                      height: `${(month.revenue / 3500000000) * 160}px`,
                    }}
                  ></div>
                  <span className="text-xs mt-2">{month.month}</span>
                  <span className="text-xs text-gray-500">
                    {(month.revenue / 1000000000).toFixed(1)}B
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly patterns */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-6">Mẫu hoạt động theo giờ</h3>
        <div className="h-64 flex items-end space-x-1">
          {data.hourly.map((hour, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full">
                <div
                  className={`w-full rounded-t ${
                    hour.hour >= 8 && hour.hour <= 17
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`}
                  style={{ height: `${(hour.orders / 60) * 200}px` }}
                ></div>
                {hour.orders > 40 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {hour.orders}
                  </div>
                )}
              </div>
              <span className="text-xs mt-1">{hour.hour}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Peak hours: 10:00-12:00, 14:00-16:00 • Off-peak: 20:00-06:00
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="text-green-500" size={20} />
            <span>Xu hướng tích cực</span>
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <ArrowUp size={14} className="text-green-500" />
              <span className="text-sm">
                SLA compliance tăng 2.3% trong tháng qua
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <ArrowUp size={14} className="text-green-500" />
              <span className="text-sm">Throughput rate cải thiện 15.2%</span>
            </li>
            <li className="flex items-center space-x-2">
              <ArrowUp size={14} className="text-green-500" />
              <span className="text-sm">Giảm error rate 45.8%</span>
            </li>
          </ul>
        </div>

        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Lightbulb className="text-yellow-500" size={20} />
            <span>Insights & Cơ hội</span>
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <Target size={14} className="text-blue-500" />
              <span className="text-sm">
                Peak efficiency tại 14:00-16:00 hàng ngày
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap size={14} className="text-purple-500" />
              <span className="text-sm">Zone A có thể optimize thêm 12%</span>
            </li>
            <li className="flex items-center space-x-2">
              <Star size={14} className="text-yellow-500" />
              <span className="text-sm">
                Top performer: Nguyễn Văn A (98.5% SLA)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrendsView;
