/**
 * BulkActions Component - Các thao tác hàng loạt cho đơn hàng
 * Hỗ trợ confirm, export, assign carrier
 */
import React, { useState } from "react";
import {
  CheckCircle,
  Download,
  Truck,
  Package,
  Mail,
  FileText,
} from "lucide-react";
import logger from "../../../utils/logger";

const BulkActions = ({
  selectedOrders,
  uploadedOrders,
  handleBulkAction,
  exportSelectedOrders,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Function handle confirm orders
  const handleConfirmOrders = () => {
    if (selectedOrders.length === 0) return;
    handleBulkAction("confirm");
  };

  // Function handle export with loading
  const handleExportWithLoading = async () => {
    setIsExporting(true);
    try {
      await exportSelectedOrders();
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  // Function assign carrier to selected orders
  const handleAssignCarrier = (carrier) => {
    if (selectedOrders.length === 0) return;
    // Implementation for assigning carrier
    logger.info(`Assigning carrier ${carrier} to orders:`, selectedOrders);
  };

  // Get selected orders data
  const selectedOrdersData = uploadedOrders.filter((order) =>
    selectedOrders.includes(order.orderId)
  );

  // Calculate statistics for selected orders
  const selectedStats = {
    total: selectedOrdersData.length,
    totalValue: selectedOrdersData.reduce(
      (sum, order) => sum + (order.orderValue || 0),
      0
    ),
    critical: selectedOrdersData.filter(
      (order) => order.slaStatus?.urgency === "critical"
    ).length,
    platforms: [...new Set(selectedOrdersData.map((order) => order.platform))],
    carriers: [
      ...new Set(selectedOrdersData.map((order) => order.suggestedCarrier)),
    ],
  };

  if (selectedOrders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Chưa chọn đơn hàng nào
        </h3>
        <p className="text-gray-500">
          Chọn các đơn hàng trong bảng để sử dụng bulk actions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📋 Tóm tắt đơn hàng đã chọn
        </h3>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {selectedStats.total}
            </div>
            <div className="text-sm text-blue-700">Đơn hàng</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-green-600">
              {selectedStats.totalValue.toLocaleString("vi-VN")}
            </div>
            <div className="text-sm text-green-700">VND</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-red-600">
              {selectedStats.critical}
            </div>
            <div className="text-sm text-red-700">Cần gấp</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-purple-600">
              {selectedStats.platforms.length}
            </div>
            <div className="text-sm text-purple-700">Sàn</div>
          </div>
        </div>

        {/* Platform and Carrier Distribution */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Phân bố theo sàn:
            </h4>
            <div className="flex flex-wrap gap-1">
              {selectedStats.platforms.map((platform) => (
                <span
                  key={platform}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {platform} (
                  {
                    selectedOrdersData.filter((o) => o.platform === platform)
                      .length
                  }
                  )
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Nhà vận chuyển:
            </h4>
            <div className="flex flex-wrap gap-1">
              {selectedStats.carriers.map((carrier) => (
                <span
                  key={carrier}
                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                >
                  {carrier} (
                  {
                    selectedOrdersData.filter(
                      (o) => o.suggestedCarrier === carrier
                    ).length
                  }
                  )
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚡ Thao tác hàng loạt
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Confirm Orders */}
          <button
            onClick={handleConfirmOrders}
            className="flex flex-col items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <div className="font-medium text-green-800">Xác nhận đơn</div>
              <div className="text-xs text-green-600">
                {selectedOrders.length} đơn hàng
              </div>
            </div>
          </button>

          {/* Export Orders */}
          <button
            onClick={handleExportWithLoading}
            disabled={isExporting}
            className="flex flex-col items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Download
              className={`w-8 h-8 text-blue-600 ${
                isExporting ? "animate-bounce" : ""
              }`}
            />
            <div className="text-center">
              <div className="font-medium text-blue-800">
                {isExporting ? "Đang xuất..." : "Xuất CSV"}
              </div>
              <div className="text-xs text-blue-600">
                {selectedOrders.length} đơn hàng
              </div>
            </div>
          </button>

          {/* Print Labels */}
          <button className="flex flex-col items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="w-8 h-8 text-purple-600" />
            <div className="text-center">
              <div className="font-medium text-purple-800">In nhãn</div>
              <div className="text-xs text-purple-600">
                {selectedOrders.length} nhãn
              </div>
            </div>
          </button>

          {/* Send Email */}
          <button className="flex flex-col items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
            <Mail className="w-8 h-8 text-orange-600" />
            <div className="text-center">
              <div className="font-medium text-orange-800">Gửi email</div>
              <div className="text-xs text-orange-600">
                Thông báo khách hàng
              </div>
            </div>
          </button>
        </div>

        {/* Carrier Assignment */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            🚚 Gán nhà vận chuyển cho {selectedOrders.length} đơn hàng:
          </h4>

          <div className="flex flex-wrap gap-2">
            {["GHN", "GHTK", "Viettel Post", "J&T Express", "Ninja Van"].map(
              (carrier) => (
                <button
                  key={carrier}
                  onClick={() => handleAssignCarrier(carrier)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Truck className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {carrier}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Quick Actions for Critical Orders */}
        {selectedStats.critical > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-800">
                  ⚠️ {selectedStats.critical} đơn hàng cần xử lý gấp!
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Ưu tiên xử lý ngay
                </button>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                  Thông báo quản lý
                </button>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  Gọi shipper ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          📊 Tùy chọn xuất dữ liệu
        </h4>

        <div className="grid md:grid-cols-3 gap-3">
          <button className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">CSV cơ bản</div>
            <div className="text-xs text-gray-500">
              Order ID, khách hàng, giá trị
            </div>
          </button>

          <button className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">Báo cáo SLA</div>
            <div className="text-xs text-gray-500">
              Bao gồm thời gian, trạng thái
            </div>
          </button>

          <button className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">Excel đầy đủ</div>
            <div className="text-xs text-gray-500">
              Tất cả thông tin + biểu đồ
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
