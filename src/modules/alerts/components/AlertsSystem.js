import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Settings,
  Volume2,
  VolumeX,
  Search,
  Play,
  Pause,
} from "lucide-react";

import AlertDetailModal from "./AlertDetailModal";
import AlertCard from "./AlertCard";
import { ALERT_TYPES, CATEGORIES } from "../config/constants";
import logger from "../../../utils/logger";

// ==================== MOCK DATA ====================
const generateAlerts = () => [
  {
    id: "ALR001",
    type: "critical",
    category: "sla",
    title: "SLA Breach - Đơn P1 sắp quá hạn",
    message:
      "3 đơn hàng ưu tiên cao (P1) còn lại < 15 phút để hoàn thành. Cần can thiệp ngay lập tức.",
    details: {
      orders: ["MIA001234", "MIA001235", "MIA001236"],
      timeRemaining: [8, 12, 14],
      assignedStaff: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"],
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    zone: "A1-A3",
    priority: 1,
    status: "active",
    escalated: true,
    acknowledged: false,
    actions: [
      "Gán thêm nhân viên",
      "Ưu tiên tuyến pick",
      "Thông báo supervisor",
    ],
  },
  {
    id: "ALR002",
    type: "warning",
    category: "inventory",
    title: 'Tồn kho thấp - Vali Larita 28"',
    message:
      "Sản phẩm bán chạy nhất hiện chỉ còn 8 cái trong kho, dưới ngưỡng tối thiểu 15 cái.",
    details: {
      product: 'Vali Larita 28"',
      currentStock: 8,
      minimumStock: 15,
      location: "A-12",
      avgDailySales: 12,
      estimatedStockout: "2 ngày",
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    zone: "A-12",
    priority: 2,
    status: "active",
    escalated: false,
    acknowledged: true,
    actions: ["Liên hệ supplier", "Chuyển từ kho khác", "Tạm dừng promotion"],
  },
  {
    id: "ALR003",
    type: "warning",
    category: "performance",
    title: "Hiệu suất nhân viên giảm",
    message:
      "Phạm Thị D có hiệu suất giảm 25% so với tuần trước. Cần kiểm tra và hỗ trợ.",
    details: {
      staff: "Phạm Thị D",
      currentRate: 28,
      normalRate: 37,
      decrease: "25%",
      possibleCauses: ["Nghỉ phép dài", "Khu vực khó", "Training needed"],
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    zone: "B2-B5",
    priority: 2,
    status: "active",
    escalated: false,
    acknowledged: false,
    actions: ["1-on-1 meeting", "Reassignment", "Additional training"],
  },
  {
    id: "ALR004",
    type: "info",
    category: "system",
    title: "Cập nhật hệ thống thành công",
    message:
      "Backup dữ liệu và sync với Google Sheets hoàn tất. Tất cả module hoạt động bình thường.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    zone: "System",
    priority: 3,
    status: "resolved",
    escalated: false,
    acknowledged: true,
    actions: [],
  },
  {
    id: "ALR005",
    type: "critical",
    category: "equipment",
    title: "Máy scan khu B bị lỗi",
    message:
      "Barcode scanner tại khu B2 không hoạt động. Ảnh hưởng đến 15 đơn hàng đang xử lý.",
    details: {
      equipment: "Honeywell Scanner B2-001",
      errorCode: "ERR_CONN_LOST",
      affectedOrders: 15,
      backupAvailable: true,
      estimatedRepairTime: "30 phút",
    },
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    zone: "B2",
    priority: 1,
    status: "active",
    escalated: false,
    acknowledged: false,
    actions: [
      "Chuyển sang backup scanner",
      "Liên hệ IT support",
      "Manual input tạm thời",
    ],
  },
];

// ==================== MAIN COMPONENT ====================
const AlertsSystem = () => {
  const [alerts, setAlerts] = useState(generateAlerts());
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    autoRefresh: true,
    showResolved: false,
    notificationChannels: {
      email: true,
      sms: false,
      push: true,
      dashboard: true,
    },
    priorityFilter: "all",
    categoryFilter: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isRealTime, setIsRealTime] = useState(true);

  // Real-time simulation
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      // Simulate new alerts
      if (Math.random() < 0.1) {
        // 10% chance every 3 seconds
        const newAlert = generateRandomAlert();
        setAlerts((prev) => [newAlert, ...prev]);

        if (settings.soundEnabled) {
          playNotificationSound(newAlert.type);
        }
      }

      // Update timestamps and status
      setAlerts((prev) =>
        prev.map((alert) => ({
          ...alert,
          timestamp:
            alert.status === "active" ? alert.timestamp : alert.timestamp,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTime, settings.soundEnabled]);

  // Filter alerts
  useEffect(() => {
    let filtered = alerts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by priority
    if (settings.priorityFilter !== "all") {
      filtered = filtered.filter(
        (alert) => alert.type === settings.priorityFilter
      );
    }

    // Filter by category
    if (settings.categoryFilter !== "all") {
      filtered = filtered.filter(
        (alert) => alert.category === settings.categoryFilter
      );
    }

    // Filter resolved alerts
    if (!settings.showResolved) {
      filtered = filtered.filter((alert) => alert.status !== "resolved");
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, settings]);

  const generateRandomAlert = () => {
    const types = ["critical", "warning", "info"];
    const categories = Object.keys(CATEGORIES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    const templates = {
      critical: [
        "Đơn hàng P1 #MIA00{id} sắp quá hạn trong 5 phút",
        "Thiết bị quan trọng tại zone {zone} ngừng hoạt động",
        "SLA breach: {count} đơn hàng cần can thiệp ngay",
      ],
      warning: [
        "Hiệu suất zone {zone} giảm 15% trong 2 giờ qua",
        "Tồn kho sản phẩm hot sắp hết",
        "Nhân viên {staff} cần hỗ trợ thêm",
      ],
      info: [
        "Backup system hoàn tất thành công",
        "Cập nhật inventory sync với Shopee",
        "Weekly report đã được tạo tự động",
      ],
    };

    const template =
      templates[randomType][
        Math.floor(Math.random() * templates[randomType].length)
      ];
    const message = template
      .replace(
        "{id}",
        Math.floor(Math.random() * 9999)
          .toString()
          .padStart(4, "0")
      )
      .replace(
        "{zone}",
        ["A1", "A2", "B1", "B2", "C1"][Math.floor(Math.random() * 5)]
      )
      .replace("{count}", Math.floor(Math.random() * 5) + 2)
      .replace(
        "{staff}",
        ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"][
          Math.floor(Math.random() * 3)
        ]
      );

    return {
      id: "ALR" + Date.now(),
      type: randomType,
      category: randomCategory,
      title: `${CATEGORIES[randomCategory].label} Alert`,
      message: message,
      timestamp: new Date(),
      zone: ["A1", "A2", "B1", "B2", "C1"][Math.floor(Math.random() * 5)],
      priority:
        randomType === "critical" ? 1 : randomType === "warning" ? 2 : 3,
      status: "active",
      escalated: randomType === "critical" && Math.random() < 0.3,
      acknowledged: false,
      actions: ["Xem chi tiết", "Gán người xử lý", "Báo cáo supervisor"],
    };
  };

  const playNotificationSound = (type) => {
    // Simulated - in real app would play actual sounds
    logger.info(`🔊 Playing ${ALERT_TYPES[type].sound} for ${type} alert`);
  };

  const handleAlertAction = (alertId, action) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === alertId) {
          switch (action) {
            case "acknowledge":
              return { ...alert, acknowledged: true };
            case "resolve":
              return { ...alert, status: "resolved", acknowledged: true };
            case "escalate":
              return { ...alert, escalated: true };
            case "snooze":
              return { ...alert, status: "snoozed" };
            default:
              return alert;
          }
        }
        return alert;
      })
    );
  };

  const criticalCount = alerts.filter(
    (a) => a.type === "critical" && a.status === "active"
  ).length;
  const warningCount = alerts.filter(
    (a) => a.type === "warning" && a.status === "active"
  ).length;
  const unacknowledgedCount = alerts.filter(
    (a) => !a.acknowledged && a.status === "active"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Real-time Alerts & Notifications
              </h1>
              <p className="text-gray-500">
                Hệ thống cảnh báo thông minh • 01/06/2025 14:30
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Real-time toggle */}
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isRealTime
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {isRealTime ? <Play size={16} /> : <Pause size={16} />}
              <span className="text-sm font-medium">
                {isRealTime ? "Live" : "Paused"}
              </span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
              className={`p-2 rounded-lg transition-colors ${
                settings.soundEnabled
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 size={16} />
              ) : (
                <VolumeX size={16} />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Alert counters */}
        <div className="flex items-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {criticalCount} Critical
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">{warningCount} Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bell size={16} className="text-gray-500" />
            <span className="text-sm font-medium">
              {unacknowledgedCount} Chưa xác nhận
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters & Search */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <h3 className="font-semibold">Bộ lọc & Tìm kiếm</h3>

              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>

              {/* Priority filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mức độ ưu tiên
                </label>
                <select
                  value={settings.priorityFilter}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      priorityFilter: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục
                </label>
                <select
                  value={settings.categoryFilter}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      categoryFilter: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tất cả danh mục</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show resolved toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showResolved"
                  checked={settings.showResolved}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      showResolved: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label htmlFor="showResolved" className="text-sm">
                  Hiển thị đã xử lý
                </label>
              </div>

              {/* Quick actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-2">Thao tác nhanh</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                    Xem tất cả Critical
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors">
                    Chưa xác nhận
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    Export báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts list */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <CheckCircle
                    size={64}
                    className="mx-auto mb-4 text-green-500"
                  />
                  <h3 className="text-lg font-medium mb-2">
                    Không có cảnh báo nào
                  </h3>
                  <p className="text-gray-500">
                    Hệ thống đang hoạt động bình thường. Tất cả metrics trong
                    ngưỡng an toàn.
                  </p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAction={(action) => handleAlertAction(alert.id, action)}
                    onSelect={() => setSelectedAlert(alert)}
                    isSelected={selectedAlert?.id === alert.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alert detail modal */}
        {selectedAlert && (
          <AlertDetailModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onAction={(action) => handleAlertAction(selectedAlert.id, action)}
          />
        )}
      </div>
    </div>
  );
};

export default AlertsSystem;
