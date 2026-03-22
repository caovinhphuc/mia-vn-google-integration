import React from 'react';
import {
  Lightbulb,
  Package,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  Target,
  MapPin,
} from 'lucide-react';
import { useTheme } from '../../../App';

const PredictionsView = ({ data }) => {
  const { themeClasses } = useTheme();

  return (
    <div className="space-y-6">
      {/* Next week forecast */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
          <Lightbulb className="text-yellow-500" size={20} />
          <span>Dự báo tuần tới</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Package className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-blue-600">
              {data.nextWeek.expectedOrders}
            </p>
            <p className="text-sm text-gray-600">Dự kiến đơn hàng</p>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Calendar className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-2xl font-bold text-green-600">
              {data.nextWeek.peakDay}
            </p>
            <p className="text-sm text-gray-600">Ngày cao điểm</p>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Clock className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-2xl font-bold text-purple-600">
              {data.nextWeek.peakHour}:00
            </p>
            <p className="text-sm text-gray-600">Giờ cao điểm</p>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Users className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-2xl font-bold text-orange-600">
              {data.nextWeek.recommendedStaff}
            </p>
            <p className="text-sm text-gray-600">Nhân viên cần</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Risk Factors</h4>
          <div className="space-y-2">
            {data.nextWeek.riskFactors.map((risk, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded"
              >
                <AlertTriangle size={14} className="text-yellow-600" />
                <span className="text-sm">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
          <Activity className="text-purple-500" size={20} />
          <span>AI-Generated Insights</span>
        </h3>

        <div className="space-y-4">
          {data.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${alert.type === 'opportunity'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : alert.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
            >
              <div className="flex items-start space-x-3">
                {alert.type === 'opportunity' ? (
                  <TrendingUp className="text-green-600 mt-1" size={16} />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="text-yellow-600 mt-1" size={16} />
                ) : (
                  <Lightbulb className="text-blue-600 mt-1" size={16} />
                )}
                <div>
                  <p className="text-sm font-medium capitalize">{alert.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization recommendations */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-6">Đề xuất tối ưu hóa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Target className="mb-2 text-blue-600" size={20} />
            <h4 className="font-medium mb-2">Staffing Optimization</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Thêm 1 nhân viên vào ca chiều để tăng 15% throughput và giảm
              overtime cost.
            </p>
            <div className="mt-3">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Tiết kiệm: 2.3M VND/tháng
              </span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <MapPin className="mb-2 text-green-600" size={20} />
            <h4 className="font-medium mb-2">Layout Optimization</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Di chuyển fast-moving items gần picking station để giảm 25% di
              chuyển.
            </p>
            <div className="mt-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Tiết kiệm: 1.8 phút/đơn
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsView;
