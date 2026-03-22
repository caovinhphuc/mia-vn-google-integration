// ==================== ALERTS CONSTANTS ====================
// File: src/modules/alerts/config/constants.js
// Alert types, categories, and constants

import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Package,
  Users,
  Truck,
  Gauge,
  MapPin,
  Target,
} from "lucide-react";

// Alert Types Configuration
export const ALERT_TYPES = {
  critical: {
    label: "Nghiêm trọng",
    icon: AlertTriangle,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    label: "Cảnh báo",
    icon: AlertCircle,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    textColor: "text-yellow-700 dark:text-yellow-300",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    label: "Thông tin",
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

// Alert Categories Configuration
export const CATEGORIES = {
  sla: {
    label: "SLA",
    icon: Clock,
    description: "Cảnh báo về thời gian xử lý",
  },
  inventory: {
    label: "Tồn kho",
    icon: Package,
    description: "Cảnh báo về tình trạng kho",
  },
  staff: {
    label: "Nhân sự",
    icon: Users,
    description: "Cảnh báo về tình trạng nhân sự",
  },
  shipping: {
    label: "Vận chuyển",
    icon: Truck,
    description: "Cảnh báo về vận chuyển",
  },
  system: {
    label: "Hệ thống",
    icon: Gauge,
    description: "Cảnh báo hệ thống",
  },
  location: {
    label: "Vị trí",
    icon: MapPin,
    description: "Cảnh báo về vị trí kho",
  },
  performance: {
    label: "Hiệu suất",
    icon: Target,
    description: "Cảnh báo về hiệu suất",
  },
};

// Alert Priority Levels
export const PRIORITY_LEVELS = {
  low: {
    label: "Thấp",
    value: 1,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  medium: {
    label: "Trung bình",
    value: 2,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  high: {
    label: "Cao",
    value: 3,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  urgent: {
    label: "Khẩn cấp",
    value: 4,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
};

// Alert Status
export const ALERT_STATUS = {
  active: "active",
  acknowledged: "acknowledged",
  resolved: "resolved",
  dismissed: "dismissed",
};

// Notification Settings
export const NOTIFICATION_SETTINGS = {
  sound: {
    enabled: true,
    volume: 0.7,
    criticalSound: "/sounds/critical-alert.mp3",
    warningSound: "/sounds/warning-alert.mp3",
    infoSound: "/sounds/info-alert.mp3",
  },
  display: {
    desktop: true,
    mobile: true,
    email: false,
    sms: false,
  },
  frequency: {
    immediate: 0,
    every5min: 5 * 60 * 1000,
    every15min: 15 * 60 * 1000,
    every30min: 30 * 60 * 1000,
    hourly: 60 * 60 * 1000,
  },
};

// Filter Options
export const FILTER_OPTIONS = {
  type: Object.keys(ALERT_TYPES),
  category: Object.keys(CATEGORIES),
  priority: Object.keys(PRIORITY_LEVELS),
  status: Object.values(ALERT_STATUS),
  timeRange: [
    { label: "Hôm nay", value: "today" },
    { label: "7 ngày qua", value: "7days" },
    { label: "30 ngày qua", value: "30days" },
    { label: "Tất cả", value: "all" },
  ],
};

// Default Alert Configuration
export const DEFAULT_ALERT_CONFIG = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  maxDisplayedAlerts: 50,
  enableSound: true,
  enableDesktopNotifications: true,
  groupSimilarAlerts: true,
  autoAcknowledgeAfter: 5 * 60 * 1000, // 5 minutes
};

const ALERTS_CONFIG = {
  ALERT_TYPES,
  CATEGORIES,
  PRIORITY_LEVELS,
  ALERT_STATUS,
  NOTIFICATION_SETTINGS,
  FILTER_OPTIONS,
  DEFAULT_ALERT_CONFIG,
};
export default ALERTS_CONFIG;
