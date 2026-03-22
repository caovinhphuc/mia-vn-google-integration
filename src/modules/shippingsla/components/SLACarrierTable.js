/**
 * SLACarrierTable Component - Bảng hiển thị SLA các nhà vận chuyển
 * Hiển thị thông tin thị phần, cut-off time, pickup time và độ tin cậy
 */
import React from 'react';
import { Clock } from 'lucide-react';

const SLACarrierTable = ({ carriers }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6" />
          <h3 className="text-xl font-bold">SLA Nhà Vận Chuyển</h3>
        </div>
        <p className="text-blue-100">
          Theo dõi và quản lý SLA của các nhà vận chuyển
        </p>
      </div>

      {/* Carrier Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold text-gray-900 border-b">
                  Nhà Vận Chuyển
                </th>
                <th className="p-4 text-center font-semibold text-gray-900 border-b">
                  Thị Phần
                </th>
                <th className="p-4 text-center font-semibold text-gray-900 border-b">
                  Cut-off Time
                </th>
                <th className="p-4 text-center font-semibold text-gray-900 border-b">
                  Pickup Time
                </th>
                <th className="p-4 text-center font-semibold text-gray-900 border-b">
                  Độ Tin Cậy
                </th>
              </tr>
            </thead>
            <tbody>
              {carriers.map((carrier, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${carrier.color}`}
                      ></div>
                      <div className="font-semibold text-gray-900">
                        {carrier.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center border-b">
                    <span className="font-medium text-blue-600">
                      {carrier.marketShare}
                    </span>
                  </td>
                  <td className="p-4 text-center border-b">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      {carrier.cutoffTime}
                    </span>
                  </td>
                  <td className="p-4 text-center border-b text-gray-700">
                    {carrier.pickupTime}
                  </td>
                  <td className="p-4 text-center border-b">
                    <span
                      className={`font-bold ${
                        carrier.reliability >= 90
                          ? 'text-green-600'
                          : carrier.reliability >= 80
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {carrier.reliability}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">
            📊 Thông Tin Thêm
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>
                <strong>Cut-off Time:</strong> Thời gian cuối cùng để nhà vận
                chuyển nhận hàng trong ngày
              </p>
              <p>
                <strong>Pickup Time:</strong> Thời gian ước tính từ khi call đến
                khi shipper đến lấy hàng
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Thị Phần:</strong> Tỷ lệ đơn hàng sử dụng nhà vận chuyển
                này
              </p>
              <p>
                <strong>Độ Tin Cậy:</strong> Tỷ lệ giao hàng thành công đúng
                thời gian cam kết
              </p>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {carriers.filter((c) => c.reliability >= 90).length}
            </div>
            <div className="text-sm text-green-700">Độ tin cậy cao (≥90%)</div>
          </div>

          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {
                carriers.filter(
                  (c) => c.reliability >= 80 && c.reliability < 90
                ).length
              }
            </div>
            <div className="text-sm text-yellow-700">Độ tin cậy trung bình</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {carriers.filter((c) => c.reliability < 80).length}
            </div>
            <div className="text-sm text-red-700">Cần cải thiện</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLACarrierTable;
