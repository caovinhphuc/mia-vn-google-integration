/**
 * AlertsSystem Component - Hệ thống cảnh báo và tracking real-time
 * Hiển thị các cảnh báo về cut-off time và đơn hàng trễ
 */
import React from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  AlertCircle,
} from 'lucide-react';

const AlertsSystem = ({ alerts, currentTime, uploadedOrders }) => {
  // Tính toán các thống kê cảnh báo
  const getAlertStats = () => {
    const criticalOrders = uploadedOrders.filter(
      (order) => order.slaStatus?.urgency === 'critical'
    ).length;

    const warningOrders = uploadedOrders.filter(
      (order) => order.slaStatus?.urgency === 'medium'
    ).length;

    const expiredOrders = uploadedOrders.filter(
      (order) => order.timeRemaining <= 0
    ).length;

    return {
      critical: criticalOrders,
      warning: warningOrders,
      expired: expiredOrders,
      total: uploadedOrders.length,
    };
  };

  const alertStats = getAlertStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Cảnh Báo & Tracking Real-time</h3>
        </div>
        <p className="text-red-100">
          Theo dõi cut-off time và đơn hàng trễ - Cập nhật:{' '}
          {currentTime.toLocaleTimeString('vi-VN')}
        </p>
      </div>

      {/* Alert Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Quá hạn</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {alertStats.expired}
          </div>
          <div className="text-xs text-red-600">đơn hàng</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Nguy hiểm
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {alertStats.critical}
          </div>
          <div className="text-xs text-orange-600">đơn hàng</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Cảnh báo
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {alertStats.warning}
          </div>
          <div className="text-xs text-yellow-600">đơn hàng</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">An toàn</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {alertStats.total -
              alertStats.expired -
              alertStats.critical -
              alertStats.warning}
          </div>
          <div className="text-xs text-green-600">đơn hàng</div>
        </div>
      </div>

      {/* Alert Conditions */}
      {alertStats.expired > 0 ||
      alertStats.critical > 0 ||
      alertStats.warning > 0 ? (
        <div className="space-y-4">
          {/* Critical Alerts */}
          {alertStats.expired > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="text-lg font-bold text-red-800">
                  ⚠️ Cảnh báo nghiêm trọng!
                </h4>
              </div>
              <p className="text-red-700 mt-2">
                Có <strong>{alertStats.expired}</strong> đơn hàng đã quá hạn
                SLA. Cần xử lý ngay lập tức để tránh ảnh hưởng đến khách hàng.
              </p>
              <div className="mt-3">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Xem đơn hàng quá hạn
                </button>
              </div>
            </div>
          )}

          {/* Warning Alerts */}
          {alertStats.critical > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="text-lg font-bold text-orange-800">
                  🔶 Cảnh báo khẩn cấp!
                </h4>
              </div>
              <p className="text-orange-700 mt-2">
                Có <strong>{alertStats.critical}</strong> đơn hàng sắp hết hạn
                SLA trong vài giờ tới. Ưu tiên xử lý để đảm bảo đúng cam kết.
              </p>
              <div className="mt-3">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Xem đơn hàng khẩn cấp
                </button>
              </div>
            </div>
          )}

          {/* Medium Warning */}
          {alertStats.warning > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="text-lg font-bold text-yellow-800">
                  🔸 Theo dõi cần thiết
                </h4>
              </div>
              <p className="text-yellow-700 mt-2">
                Có <strong>{alertStats.warning}</strong> đơn hàng cần theo dõi
                gần. Lên kế hoạch xử lý để tránh chậm trễ.
              </p>
              <div className="mt-3">
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Xem đơn hàng cảnh báo
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Alerts */
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="text-lg font-bold text-green-800">
                ✅ Tất cả đều ổn!
              </h4>
              <p className="text-green-600">
                Không có cảnh báo nào. Tất cả đơn hàng đang trong thời gian SLA
                an toàn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Monitoring */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-800 mb-4">
          📡 Giám Sát Thời Gian Thực
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-blue-800">🔄 Auto Refresh</p>
            <p className="text-blue-700">Cập nhật mỗi 60 giây</p>
            <p className="text-blue-700">
              Thời gian hiện tại: {currentTime.toLocaleTimeString('vi-VN')}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-blue-800">⏰ Cut-off Time</p>
            <p className="text-blue-700">
              Theo dõi các mốc thời gian quan trọng
            </p>
            <p className="text-blue-700">Cảnh báo trước 30 phút</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-blue-800">📊 SLA Tracking</p>
            <p className="text-blue-700">Tính toán thời gian còn lại</p>
            <p className="text-blue-700">Phân loại mức độ ưu tiên</p>
          </div>
        </div>
      </div>

      {/* Custom Alert Rules */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">
          ⚙️ Cài Đặt Cảnh Báo
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Cảnh báo trước khi hết hạn (phút)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Âm thanh cảnh báo
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="enabled">Bật</option>
              <option value="disabled">Tắt</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsSystem;
