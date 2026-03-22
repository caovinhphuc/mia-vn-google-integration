/**
 * Automation Dashboard - Theo dõi tiến trình tự động hóa ONE
 * Tích hợp với Python automation system
 */
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Bot,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  Loader2,
  Mail,
  Package,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import AutomationAPI from "../services/automationAPI";
import logger from "../../../utils/logger";

const AutomationDashboard = () => {
  const [automationStatus, setAutomationStatus] = useState({
    isRunning: false,
    lastRun: null,
    currentTask: "Idle",
    totalRuns: 0,
    successRuns: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [logs, setLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, data-collection

  const automationAPI = new AutomationAPI();

  // Inject shimmer CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load automation status
  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const status = await automationAPI.getStatus();
      setAutomationStatus(status);
    } catch (error) {
      logger.error("Failed to load status:", error);
      showNotification("error", "Không thể tải trạng thái hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  // Load recent logs
  const loadLogs = async () => {
    try {
      const logs = await automationAPI.getLogs({ limit: 5 });
      setLogs(
        logs.map((log, index) => ({
          id: index + 1,
          timestamp: log.timestamp,
          type:
            log.level === "error"
              ? "error"
              : log.level === "warning"
              ? "warning"
              : "success",
          message: log.message,
          details: log.details,
        }))
      );
    } catch (error) {
      logger.error("Failed to load logs:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await loadStatus();
      await loadLogs();
    };

    loadData();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartAutomation = async () => {
    try {
      setIsStarting(true);

      // Visual feedback với vibration (mobile)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      showNotification("info", "Đang khởi động automation...");

      const result = await automationAPI.start();

      if (result.success) {
        // Success vibration
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 100]);
        }

        showNotification("success", "Automation đã được khởi động thành công");
        await loadStatus();
        await loadLogs();
      } else {
        // Error vibration
        if (navigator.vibrate) {
          navigator.vibrate([500]);
        }

        showNotification(
          "error",
          result.message || "Không thể khởi động automation"
        );
      }
    } catch (error) {
      logger.error("Failed to start automation:", error);
      showNotification("error", "Lỗi khi khởi động automation");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopAutomation = async () => {
    try {
      setIsStopping(true);
      showNotification("info", "Đang dừng automation...");

      const result = await automationAPI.stop();

      if (result.success) {
        showNotification("success", "Automation đã được dừng");
        await loadStatus();
        await loadLogs();
      } else {
        showNotification(
          "error",
          result.message || "Không thể dừng automation"
        );
      }
    } catch (error) {
      logger.error("Failed to stop automation:", error);
      showNotification("error", "Lỗi khi dừng automation");
    } finally {
      setIsStopping(false);
    }
  };

  const stats = [
    {
      title: "Trạng thái hệ thống",
      value: automationStatus.isRunning ? "Đang chạy" : "Dừng",
      icon: automationStatus.isRunning ? Activity : Pause,
      color: automationStatus.isRunning ? "text-green-600" : "text-gray-500",
      bgColor: automationStatus.isRunning ? "bg-green-100" : "bg-gray-100",
    },
    {
      title: "Tác vụ hiện tại",
      value: automationStatus.currentTask || "Idle",
      icon: Database,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Lần chạy cuối",
      value: automationStatus.lastRun
        ? new Date(automationStatus.lastRun).toLocaleString("vi-VN")
        : "Chưa chạy",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổng số lần chạy",
      value: automationStatus.totalRuns.toLocaleString(),
      icon: RotateCcw,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tỷ lệ thành công",
      value:
        automationStatus.totalRuns > 0
          ? `${(
              (automationStatus.successRuns / automationStatus.totalRuns) *
              100
            ).toFixed(1)}%`
          : "0%",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            notification.type === "success"
              ? "bg-green-100 border border-green-200 text-green-800"
              : notification.type === "error"
              ? "bg-red-100 border border-red-200 text-red-800"
              : "bg-blue-100 border border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <AlertTriangle className="w-5 h-5" />
            )}
            {notification.type === "info" && <Activity className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      {automationStatus.isRunning && (
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 dark:text-green-400 font-medium text-sm">
              🤖 Automation đang hoạt động
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar khi đang khởi động */}
      {isStarting && (
        <div className="w-full mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3 overflow-hidden shadow-inner border">
            <div className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg font-bold text-gray-700 dark:text-gray-300 animate-pulse">
              🚀 Đang kết nối với hệ thống ONE...
            </div>
            <div className="flex justify-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                🔄 Khởi tạo WebDriver
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                •
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                🔐 Đăng nhập
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                •
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                📊 Thu thập dữ liệu
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ONE Automation System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tự động thu thập và xử lý dữ liệu từ hệ thống ONE
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          {!automationStatus.isRunning ? (
            <button
              onClick={handleStartAutomation}
              disabled={isStarting || isLoading}
              className={`relative flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-500 disabled:cursor-not-allowed transform ${
                isStarting
                  ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white scale-110 shadow-2xl ring-8 ring-green-300 ring-opacity-75 animate-pulse"
                  : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 hover:scale-110 hover:shadow-xl shadow-lg hover:ring-4 hover:ring-green-300 hover:ring-opacity-50"
              } ${!isStarting ? "hover:rotate-1" : ""}`}
            >
              {/* Background Animation */}
              {isStarting && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-xl opacity-75 animate-pulse"></div>
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center space-x-3">
                {isStarting ? (
                  <>
                    <div className="relative">
                      <Loader2 size={24} className="animate-spin" />
                      <div className="absolute inset-0 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="font-bold text-lg">
                      🚀 Đang khởi động...
                    </span>

                    {/* Enhanced dots animation */}
                    <div className="flex space-x-1 ml-3">
                      {[0, 150, 300, 450].map((delay, index) => (
                        <div
                          key={index}
                          className="w-2 h-2 bg-white rounded-full animate-bounce shadow-lg"
                          style={{
                            animationDelay: `${delay}ms`,
                            animationDuration: "1s",
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Play size={24} className="animate-pulse" />
                    <span className="font-bold text-lg">
                      🤖 Khởi động Automation
                    </span>
                    <div className="ml-2 text-xl">⚡</div>
                  </>
                )}
              </div>

              {/* Ripple effect on click */}
              {isStarting && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-20 animate-ping"></div>
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={handleStopAutomation}
              disabled={isStopping || isLoading}
              className={`flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${
                isStopping ? "animate-pulse shadow-lg" : "shadow-md"
              }`}
            >
              {isStopping ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="font-medium">Đang dừng...</span>
                  <div className="flex space-x-1 ml-2">
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </>
              ) : (
                <>
                  <Pause size={20} />
                  <span className="font-medium">Dừng Automation</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              loadStatus();
              loadLogs();
            }}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RotateCcw size={16} />
            )}
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === "dashboard"
              ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("data-collection")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === "data-collection"
              ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Download size={18} />
          <span>Thu thập dữ liệu</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Existing dashboard content */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}
                    >
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Task Status */}
          {automationStatus.currentTask &&
            automationStatus.currentTask !== "Idle" && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {automationStatus.isRunning ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <Activity className="w-5 h-5 text-gray-600" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      Tác vụ hiện tại:
                    </span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400">
                    {automationStatus.currentTask}
                  </span>
                </div>
              </div>
            )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Database className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Thu thập dữ liệu
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FileText className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Tạo báo cáo
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Mail className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Gửi email
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <RotateCcw className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Đồng bộ lại
                </span>
              </button>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nhật ký hoạt động
            </h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div
                    className={`p-1 rounded ${
                      log.type === "success"
                        ? "bg-green-100 text-green-600"
                        : log.type === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {log.type === "success" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {log.message}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.details}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "data-collection" && (
        <DataCollectionPanel
          automationAPI={automationAPI}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

// Data Collection Panel Component
const DataCollectionPanel = ({ automationAPI, showNotification }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);

  const dataTypes = [
    {
      id: "orders",
      title: "Dữ liệu đơn hàng",
      description: "Thu thập thông tin đơn hàng từ hệ thống ONE",
      icon: Package,
      color: "blue",
      stats: { total: 0, updated: "Chưa thu thập" },
    },
    {
      id: "inventory",
      title: "Dữ liệu tồn kho",
      description: "Theo dõi số lượng hàng tồn kho",
      icon: Archive,
      color: "green",
      stats: { total: 0, updated: "Chưa thu thập" },
    },
    {
      id: "transfers",
      title: "Dữ liệu chuyển kho",
      description: "Lịch sử chuyển kho giữa các chi nhánh",
      icon: Truck,
      color: "orange",
      stats: { total: 0, updated: "Chưa thu thập" },
    },
    {
      id: "imports",
      title: "Dữ liệu nhập hàng",
      description: "Thông tin nhập hàng từ nhà cung cấp",
      icon: Database,
      color: "purple",
      stats: { total: 0, updated: "Chưa thu thập" },
    },
  ];

  const handleCollectData = async (dataType) => {
    setSelectedType(dataType.id);
    setIsCollecting(true);
    setCollectionProgress(0);

    try {
      showNotification(
        "info",
        `Đang thu thập ${dataType.title.toLowerCase()}...`
      );

      // Simulate collection progress
      const progressInterval = setInterval(() => {
        setCollectionProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // Call automation API to collect specific data type
      const result = await automationAPI.collectData(dataType.id);

      clearInterval(progressInterval);
      setCollectionProgress(100);

      if (result.success) {
        showNotification(
          "success",
          `Thu thập ${dataType.title.toLowerCase()} thành công! Đã lưu ${
            result.count || 0
          } bản ghi.`
        );
      } else {
        showNotification(
          "error",
          `Lỗi thu thập ${dataType.title.toLowerCase()}: ${result.message}`
        );
      }
    } catch (error) {
      showNotification("error", `Lỗi thu thập dữ liệu: ${error.message}`);
    } finally {
      setIsCollecting(false);
      setSelectedType(null);
      setCollectionProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Thu thập dữ liệu từ hệ thống ONE
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Chọn loại dữ liệu cần thu thập để cập nhật hệ thống
        </p>
      </div>

      {/* Progress Bar */}
      {isCollecting && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Đang thu thập dữ liệu...
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {collectionProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${collectionProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Data Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dataTypes.map((dataType) => {
          const IconComponent = dataType.icon;
          const isActive = selectedType === dataType.id;

          return (
            <div
              key={dataType.id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-lg border transition-all duration-300 ${
                isActive
                  ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-lg bg-${dataType.color}-100 dark:bg-${dataType.color}-900/30`}
                  >
                    <IconComponent
                      size={24}
                      className={`text-${dataType.color}-600 dark:text-${dataType.color}-400`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {dataType.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dataType.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tổng số bản ghi:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dataType.stats.total}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cập nhật lần cuối:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dataType.stats.updated}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCollectData(dataType)}
                disabled={isCollecting}
                className={`w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isCollecting
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : `bg-${dataType.color}-600 hover:bg-${dataType.color}-700 text-white shadow-md hover:shadow-lg transform hover:scale-105`
                }`}
              >
                {isActive && isCollecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang thu thập...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Thu thập ngay</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Thao tác nhanh
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              handleCollectData({ id: "all", title: "tất cả dữ liệu" })
            }
            disabled={isCollecting}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            <Download size={16} />
            <span>Thu thập tất cả</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all">
            <Settings size={16} />
            <span>Cấu hình</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationDashboard;
