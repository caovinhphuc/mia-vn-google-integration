/**
 * StatsCards Component - Hiển thị các thẻ thống kê tổng quan
 * Thống kê về đơn hàng, SLA, performance
 */
import React from 'react';
import {
  Package,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Timer,
  DollarSign,
  Truck,
} from 'lucide-react';

const StatsCards = ({ uploadedOrders, currentTime }) => {
  // Calculate statistics
  const getStats = () => {
    if (uploadedOrders.length === 0) {
      return {
        totalOrders: 0,
        totalValue: 0,
        expiredOrders: 0,
        criticalOrders: 0,
        warningOrders: 0,
        safeOrders: 0,
        avgTimeRemaining: 0,
        topPlatform: 'N/A',
        topCarrier: 'N/A',
      };
    }

    const totalOrders = uploadedOrders.length;
    const totalValue = uploadedOrders.reduce(
      (sum, order) => sum + (order.orderValue || 0),
      0
    );

    const expiredOrders = uploadedOrders.filter(
      (order) => order.timeRemaining <= 0
    ).length;
    const criticalOrders = uploadedOrders.filter(
      (order) =>
        order.slaStatus?.urgency === 'critical' && order.timeRemaining > 0
    ).length;
    const warningOrders = uploadedOrders.filter(
      (order) => order.slaStatus?.urgency === 'medium'
    ).length;
    const safeOrders =
      totalOrders - expiredOrders - criticalOrders - warningOrders;

    const avgTimeRemaining =
      uploadedOrders.reduce(
        (sum, order) => sum + (order.timeRemaining || 0),
        0
      ) / totalOrders;

    // Platform distribution
    const platformCounts = uploadedOrders.reduce((acc, order) => {
      acc[order.platform] = (acc[order.platform] || 0) + 1;
      return acc;
    }, {});
    const topPlatform =
      Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'N/A';

    // Carrier distribution
    const carrierCounts = uploadedOrders.reduce((acc, order) => {
      acc[order.suggestedCarrier] = (acc[order.suggestedCarrier] || 0) + 1;
      return acc;
    }, {});
    const topCarrier =
      Object.entries(carrierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'N/A';

    return {
      totalOrders,
      totalValue,
      expiredOrders,
      criticalOrders,
      warningOrders,
      safeOrders,
      avgTimeRemaining,
      topPlatform,
      topCarrier,
    };
  };

  const stats = getStats();

  // Format time remaining
  const formatTimeRemaining = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}p`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}h`;
    } else {
      return `${Math.round((hours / 24) * 10) / 10}d`;
    }
  };

  const statsCards = [
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: 'Đang xử lý',
    },
    {
      title: 'Tổng giá trị',
      value: `${(stats.totalValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: 'VND',
    },
    {
      title: 'Quá hạn SLA',
      value: stats.expiredOrders,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      subtitle: 'Cần xử lý gấp',
      urgent: stats.expiredOrders > 0,
    },
    {
      title: 'Nguy hiểm',
      value: stats.criticalOrders,
      icon: Timer,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      subtitle: 'Sắp hết hạn',
    },
    {
      title: 'Cảnh báo',
      value: stats.warningOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      subtitle: 'Cần theo dõi',
    },
    {
      title: 'An toàn',
      value: stats.safeOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: 'Trong thời hạn',
    },
    {
      title: 'Thời gian TB',
      value: formatTimeRemaining(stats.avgTimeRemaining),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: 'Còn lại',
    },
    {
      title: 'Sàn chính',
      value: stats.topPlatform,
      icon: Truck,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      subtitle: 'Nhiều đơn nhất',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          📊 Thống kê tổng quan
        </h3>
        <div className="text-sm text-gray-500">
          Cập nhật: {currentTime.toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} border-2 ${
                card.urgent
                  ? 'border-red-300 animate-pulse'
                  : 'border-transparent'
              } rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${card.color} rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {card.urgent && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-bounce">
                    URGENT
                  </span>
                )}
              </div>

              <div className={`text-2xl font-bold ${card.textColor} mb-1`}>
                {card.value}
              </div>

              <div className="text-sm font-medium text-gray-700 mb-1">
                {card.title}
              </div>

              <div className="text-xs text-gray-500">{card.subtitle}</div>

              {/* Progress bar for critical stats */}
              {(card.title.includes('Quá hạn') ||
                card.title.includes('Nguy hiểm')) &&
                stats.totalOrders > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          card.title.includes('Quá hạn')
                            ? 'bg-red-500'
                            : 'bg-orange-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (parseInt(card.value) / stats.totalOrders) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (parseInt(card.value) / stats.totalOrders) * 100
                      )}
                      % tổng đơn
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Performance Indicators */}
      {stats.totalOrders > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Chỉ số hiệu suất
          </h4>

          <div className="grid md:grid-cols-3 gap-6">
            {/* SLA Performance */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      40 *
                      (1 - stats.safeOrders / stats.totalOrders)
                    }`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {Math.round((stats.safeOrders / stats.totalOrders) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                SLA Compliance
              </div>
              <div className="text-xs text-gray-500">Đúng thời hạn</div>
            </div>

            {/* Risk Distribution */}
            <div className="text-center">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">An toàn</span>
                  <span className="font-medium">{stats.safeOrders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-600">Cảnh báo</span>
                  <span className="font-medium">{stats.warningOrders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600">Nguy hiểm</span>
                  <span className="font-medium">{stats.criticalOrders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">Quá hạn</span>
                  <span className="font-medium">{stats.expiredOrders}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                Phân bố rủi ro
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.topPlatform.toUpperCase()}
              </div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Sàn có nhiều đơn nhất
              </div>
              <div className="text-xs text-gray-500">
                Nhà vận chuyển chính: {stats.topCarrier}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      {stats.totalOrders > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 Nhận xét nhanh
          </h4>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {stats.expiredOrders > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Có {stats.expiredOrders} đơn hàng đã quá hạn SLA</span>
                </div>
              )}

              {stats.criticalOrders > 0 && (
                <div className="flex items-center gap-2 text-orange-700">
                  <Timer className="w-4 h-4" />
                  <span>Cần xử lý gấp {stats.criticalOrders} đơn hàng</span>
                </div>
              )}

              {stats.expiredOrders === 0 && stats.criticalOrders === 0 && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tất cả đơn hàng đều trong thời hạn an toàn</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Thời gian xử lý trung bình:{' '}
                  {formatTimeRemaining(stats.avgTimeRemaining)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-purple-700">
                <Truck className="w-4 h-4" />
                <span>
                  Sàn chính: {stats.topPlatform} | NVC: {stats.topCarrier}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards;
