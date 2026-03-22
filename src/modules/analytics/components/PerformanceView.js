import React from 'react';
import { Award } from 'lucide-react';
import { useTheme } from '../../../App';

const PerformanceView = ({ data }) => {
  const { themeClasses } = useTheme();

  return (
    <div className="space-y-6">
      {/* Staff performance */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-6">Hiệu suất nhân viên</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">Nhân viên</th>
                <th className="text-left py-3 px-4">Đơn hàng</th>
                <th className="text-left py-3 px-4">SLA (%)</th>
                <th className="text-left py-3 px-4">Hiệu suất (%)</th>
                <th className="text-left py-3 px-4">Lỗi</th>
                <th className="text-left py-3 px-4">Xếp hạng</th>
              </tr>
            </thead>
            <tbody>
              {data.byStaff.map((staff, index) => (
                <tr
                  key={staff.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                      >
                        {staff.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-xs text-gray-500">{staff.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{staff.orders}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span>{staff.sla}%</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            staff.sla >= 95 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${staff.sla}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span>{staff.efficiency}%</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${staff.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        staff.errors <= 3
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {staff.errors}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {index === 0 && (
                        <Award className="text-yellow-500" size={16} />
                      )}
                      <span className="font-medium">#{index + 1}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-6">Hiệu suất theo khu vực</h3>
          <div className="space-y-4">
            {data.byZone.map((zone) => (
              <div
                key={zone.zone}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Zone {zone.zone}</span>
                  <span className="text-sm text-gray-500">
                    {zone.utilization}% utilization
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Avg Time</p>
                    <p className="font-medium">{zone.avgTime} min</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Accuracy</p>
                    <p className="font-medium">{zone.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-medium">
                      {Math.round(zone.revenue / 1000000)}M
                    </p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${zone.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product performance */}
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-6">Top sản phẩm</h3>
          <div className="space-y-3">
            {data.byProduct.slice(0, 5).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.orders} đơn • {product.stockTurns} turns
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {Math.round(product.revenue / 1000000)}M
                  </p>
                  <p className="text-sm text-green-600">
                    {product.margin}% margin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
