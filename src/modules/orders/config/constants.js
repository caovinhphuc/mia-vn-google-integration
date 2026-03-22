// ==================== CONFIGURATION ====================
// File: src/modules/orders/config/constants.js
// Constants and configuration for orders module

export const ORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKING: 'picking',
  PACKING: 'packing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
};

export const ORDER_PRIORITIES = {
  P1: {
    name: 'Gấp 🚀',
    threshold: 2 * 60, // 2 hours in minutes
    color: 'red',
    urgencyLevel: 'critical',
    autoActions: ['assign_best_staff', 'priority_picking', 'supervisor_alert'],
  },
  P2: {
    name: 'Cảnh báo ⚠️',
    threshold: 4 * 60, // 4 hours
    color: 'yellow',
    urgencyLevel: 'high',
    autoActions: ['assign_available_staff', 'queue_priority'],
  },
  P3: {
    name: 'Bình thường ✅',
    threshold: 8 * 60, // 8 hours
    color: 'green',
    urgencyLevel: 'normal',
    autoActions: ['normal_processing'],
  },
  P4: {
    name: 'Chờ xử lý 🕒',
    threshold: Infinity,
    color: 'blue',
    urgencyLevel: 'low',
    autoActions: ['batch_processing'],
  },
};

export const PLATFORMS = {
  SHOPEE: 'Shopee',
  TIKTOK: 'TikTok Shop',
  LAZADA: 'Lazada',
  WEBSITE: 'Website',
  FACEBOOK: 'Facebook Shop',
  INSTAGRAM: 'Instagram Shop',
};

export const GOOGLE_SHEETS_CONFIG = {
  SPREADSHEET_ID: process.env.REACT_APP_GOOGLE_SHEETS_ID,
  RANGES: {
    ORDERS: 'Orders!A2:M',
    PRODUCTS: 'Products!A2:I',
    STAFF: 'Staff!A2:H',
    AUDIT_LOG: 'AuditLog!A:F',
  },
  COLUMNS: {
    ORDERS: {
      ID: 'A',
      PLATFORM: 'B',
      CUSTOMER_ID: 'C',
      PRIORITY: 'D',
      STATUS: 'E',
      CREATED_AT: 'F',
      SLA_DEADLINE: 'G',
      ASSIGNED_TO: 'H',
      TOTAL_VALUE: 'I',
      NOTES: 'J',
      CARRIER: 'K',
      UPDATED_AT: 'L',
      UPDATED_BY: 'M',
    },
    PRODUCTS: {
      ORDER_ID: 'A',
      SKU: 'B',
      PRODUCT_NAME: 'C',
      QUANTITY: 'D',
      LOCATION: 'E',
      STOCK_LEVEL: 'F',
      PICKING_ORDER: 'G',
      PICKED_AT: 'H',
      PICKED_BY: 'I',
    },
  },
};

export const SLA_THRESHOLDS = {
  COMPLIANCE_TARGET: 98, // Target 98% compliance
  WARNING_THRESHOLD: 30, // Alert when 30 minutes remaining
  CRITICAL_THRESHOLD: 15, // Critical alert when 15 minutes remaining
  OVERDUE_ESCALATION: 60, // Escalate if overdue for 1 hour
};

export const NOTIFICATION_SETTINGS = {
  BROWSER_NOTIFICATIONS: true,
  EMAIL_ALERTS: true,
  SMS_ALERTS: false,
  ALERT_INTERVALS: {
    CRITICAL: 5 * 60 * 1000, // 5 minutes
    WARNING: 15 * 60 * 1000, // 15 minutes
    OVERDUE: 30 * 60 * 1000, // 30 minutes
  },
};

export const STAFF_LIST = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
];

export const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xử lý',
  [ORDER_STATUS.ASSIGNED]: 'Đã phân công',
  [ORDER_STATUS.PICKING]: 'Đang lấy hàng',
  [ORDER_STATUS.PACKING]: 'Đang đóng gói',
  [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.OVERDUE]: 'Quá hạn',
};
