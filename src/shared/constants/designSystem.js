// ==================== MIA WAREHOUSE DESIGN SYSTEM ====================
// Hệ thống thiết kế màu sắc và UI components cho Warehouse Management System
// Phiên bản: 2.0.0 - Cải tiến màu sắc và trải nghiệm người dùng
// Ngày cập nhật: 16/06/2025

// ==================== BRAND COLORS ====================
// Bảng màu chính cho warehouse management - tập trung vào tính chuyên nghiệp và dễ nhìn
export const BRAND_COLORS = {
  // Primary: Xanh dương tin cậy - màu chủ đạo của hệ thống
  primary: {
    50: "#eff6ff", // Xanh rất nhạt - backgrounds
    100: "#dbeafe", // Xanh nhạt - hover states
    200: "#bfdbfe", // Xanh sáng - borders
    300: "#93c5fd", // Xanh trung bình - disabled
    400: "#60a5fa", // Xanh đậm - secondary actions
    500: "#3b82f6", // Xanh chính - primary actions
    600: "#2563eb", // Xanh đậm hơn - hover primary
    700: "#1d4ed8", // Xanh rất đậm - active states
    800: "#1e40af", // Xanh tối - pressed
    900: "#1e3a8a", // Xanh rất tối - text emphasis
  },

  // Secondary: Xám hiện đại - màu phụ trợ chính
  secondary: {
    50: "#f8fafc", // Xám rất nhạt - backgrounds
    100: "#f1f5f9", // Xám nhạt - subtle borders
    200: "#e2e8f0", // Xám sáng - dividers
    300: "#cbd5e1", // Xám trung bình - placeholders
    400: "#94a3b8", // Xám đậm - secondary text
    500: "#64748b", // Xám chính - muted text
    600: "#475569", // Xám đậm hơn - body text
    700: "#334155", // Xám rất đậm - headings
    800: "#1e293b", // Xám tối - dark mode surfaces
    900: "#0f172a", // Xám rất tối - dark mode backgrounds
  },

  // Accent: Xanh lam warehouse - màu nhấn cho warehouse operations
  accent: {
    50: "#f0f9ff", // Xanh lam rất nhạt
    100: "#e0f2fe", // Xanh lam nhạt
    200: "#bae6fd", // Xanh lam sáng
    300: "#7dd3fc", // Xanh lam trung bình
    400: "#38bdf8", // Xanh lam đậm
    500: "#0ea5e9", // Xanh lam chính - cho logistics
    600: "#0284c7", // Xanh lam đậm hơn
    700: "#0369a1", // Xanh lam rất đậm
    800: "#075985", // Xanh lam tối
    900: "#0c4a6e", // Xanh lam rất tối
  },
};

// ==================== SEMANTIC COLORS ====================
// Màu sắc có ý nghĩa semantic - sử dụng cho status, alerts, feedback
export const SEMANTIC_COLORS = {
  // Success: Xanh lá tươi - cho thành công, hoàn thành
  success: {
    light: "#dcfce7", // Nền xanh lá nhạt
    default: "#16a34a", // Xanh lá chuẩn - thành công
    dark: "#15803d", // Xanh lá đậm - hover
    text: "#166534", // Text xanh lá đậm
    border: "#bbf7d0", // Border xanh lá nhạt
  },

  // Warning: Vàng amber - cho cảnh báo, chờ xử lý
  warning: {
    light: "#fef3c7", // Nền vàng nhạt
    default: "#f59e0b", // Vàng chuẩn - cảnh báo
    dark: "#d97706", // Vàng đậm - hover
    text: "#92400e", // Text vàng đậm
    border: "#fed7aa", // Border vàng nhạt
  },

  // Error: Đỏ cherry - cho lỗi, thất bại, nguy hiểm
  error: {
    light: "#fee2e2", // Nền đỏ nhạt
    default: "#dc2626", // Đỏ chuẩn - lỗi
    dark: "#b91c1c", // Đỏ đậm - hover
    text: "#991b1b", // Text đỏ đậm
    border: "#fecaca", // Border đỏ nhạt
  },

  // Info: Xanh dương - cho thông tin, tips
  info: {
    light: "#dbeafe", // Nền xanh dương nhạt
    default: "#2563eb", // Xanh dương chuẩn - thông tin
    dark: "#1d4ed8", // Xanh dương đậm - hover
    text: "#1e40af", // Text xanh dương đậm
    border: "#bfdbfe", // Border xanh dương nhạt
  },

  // Neutral: Xám - cho các trạng thái trung tính
  neutral: {
    light: "#f3f4f6", // Nền xám nhạt
    default: "#6b7280", // Xám chuẩn - trung tính
    dark: "#4b5563", // Xám đậm - hover
    text: "#374151", // Text xám đậm
    border: "#d1d5db", // Border xám nhạt
  },
};

// ==================== THEME COLORS ====================
// Theme colors tối ưu cho warehouse management - cân bằng giữa tính chuyên nghiệp và dễ sử dụng
export const THEME_COLORS = {
  light: {
    // Backgrounds - nền màu sáng cho môi trường làm việc dễ chịu
    background: {
      primary: "#ffffff", // Nền chính - trắng tinh khiết
      secondary: BRAND_COLORS.secondary[50], // Nền phụ - xám rất nhạt
      tertiary: BRAND_COLORS.secondary[100], // Nền thứ ba - xám nhạt
      accent: BRAND_COLORS.primary[50], // Nền accent - xanh rất nhạt
      success: SEMANTIC_COLORS.success.light, // Nền thành công
      warning: SEMANTIC_COLORS.warning.light, // Nền cảnh báo
      error: SEMANTIC_COLORS.error.light, // Nền lỗi
    },

    // Surfaces - các bề mặt UI components
    surface: {
      primary: "#ffffff", // Bề mặt chính - cards, modals
      secondary: BRAND_COLORS.secondary[50], // Bề mặt phụ - sidebars
      elevated: "#ffffff", // Bề mặt nổi (có shadow)
      overlay: "rgba(15, 23, 42, 0.1)", // Overlay mờ
      glass: "rgba(255, 255, 255, 0.8)", // Glass effect
    },

    // Text colors - màu chữ tối ưu cho khả năng đọc
    text: {
      primary: BRAND_COLORS.secondary[900], // Text chính - đen
      secondary: BRAND_COLORS.secondary[600], // Text phụ - xám đậm
      muted: BRAND_COLORS.secondary[500], // Text mờ - xám trung bình
      disabled: BRAND_COLORS.secondary[400], // Text disabled - xám nhạt
      inverse: "#ffffff", // Text ngược - trắng
      accent: BRAND_COLORS.primary[600], // Text accent - xanh
    },

    // Borders - viền và đường kẻ
    border: {
      primary: BRAND_COLORS.secondary[200], // Border chính - xám nhạt
      secondary: BRAND_COLORS.secondary[300], // Border phụ - xám đậm hơn
      focus: BRAND_COLORS.primary[500], // Border focus - xanh chính
      error: SEMANTIC_COLORS.error.default, // Border lỗi - đỏ
      success: SEMANTIC_COLORS.success.default, // Border thành công
      warning: SEMANTIC_COLORS.warning.default, // Border cảnh báo
    },

    // Interactive elements - các thành phần tương tác
    interactive: {
      primary: BRAND_COLORS.primary[500], // Button primary - xanh chính
      primaryHover: BRAND_COLORS.primary[600], // Button primary hover
      primaryActive: BRAND_COLORS.primary[700], // Button primary active
      secondary: BRAND_COLORS.secondary[100], // Button secondary - xám nhạt
      secondaryHover: BRAND_COLORS.secondary[200], // Button secondary hover
      accent: BRAND_COLORS.accent[500], // Accent interactions
      accentHover: BRAND_COLORS.accent[600], // Accent hover
    },
  },

  dark: {
    // Backgrounds - nền tối dễ chịu cho mắt trong môi trường ít ánh sáng
    background: {
      primary: BRAND_COLORS.secondary[900], // Nền chính - đen
      secondary: BRAND_COLORS.secondary[800], // Nền phụ - xám tối
      tertiary: BRAND_COLORS.secondary[700], // Nền thứ ba - xám
      accent: BRAND_COLORS.primary[900], // Nền accent - xanh tối
      success: "rgba(22, 163, 74, 0.1)", // Nền thành công mờ
      warning: "rgba(245, 158, 11, 0.1)", // Nền cảnh báo mờ
      error: "rgba(220, 38, 38, 0.1)", // Nền lỗi mờ
    },

    // Surfaces - bề mặt trong dark mode
    surface: {
      primary: BRAND_COLORS.secondary[800], // Bề mặt chính
      secondary: BRAND_COLORS.secondary[700], // Bề mặt phụ
      elevated: BRAND_COLORS.secondary[600], // Bề mặt nổi
      overlay: "rgba(0, 0, 0, 0.6)", // Overlay đậm
      glass: "rgba(30, 41, 59, 0.8)", // Glass effect tối
    },

    // Text colors - màu chữ trong dark mode
    text: {
      primary: BRAND_COLORS.secondary[50], // Text chính - trắng
      secondary: BRAND_COLORS.secondary[300], // Text phụ - xám nhạt
      muted: BRAND_COLORS.secondary[400], // Text mờ - xám
      disabled: BRAND_COLORS.secondary[500], // Text disabled - xám đậm
      inverse: BRAND_COLORS.secondary[900], // Text ngược - đen
      accent: BRAND_COLORS.primary[400], // Text accent - xanh sáng
    },

    // Borders - viền trong dark mode
    border: {
      primary: BRAND_COLORS.secondary[600], // Border chính
      secondary: BRAND_COLORS.secondary[500], // Border phụ
      focus: BRAND_COLORS.primary[400], // Border focus - xanh sáng
      error: "#ef4444", // Border lỗi sáng hơn
      success: "#22c55e", // Border thành công sáng hơn
      warning: "#f59e0b", // Border cảnh báo
    },

    // Interactive elements - tương tác trong dark mode
    interactive: {
      primary: BRAND_COLORS.primary[500], // Button primary giữ nguyên
      primaryHover: BRAND_COLORS.primary[400], // Button primary hover sáng hơn
      primaryActive: BRAND_COLORS.primary[600], // Button primary active
      secondary: BRAND_COLORS.secondary[700], // Button secondary
      secondaryHover: BRAND_COLORS.secondary[600], // Button secondary hover
      accent: BRAND_COLORS.accent[400], // Accent sáng hơn
      accentHover: BRAND_COLORS.accent[300], // Accent hover
    },
  },
};

// ==================== TYPOGRAPHY ====================
export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    primary: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
    secondary: ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
    mono: ["SF Mono", "Consolas", "Liberation Mono", "monospace"],
  },

  // Font sizes
  fontSize: {
    xs: "0.75rem", // 12px - Text rất nhỏ
    sm: "0.875rem", // 14px - Text nhỏ
    base: "1rem", // 16px - Text cơ bản
    lg: "1.125rem", // 18px - Text lớn
    xl: "1.25rem", // 20px - Heading nhỏ
    "2xl": "1.5rem", // 24px - Heading trung bình
    "3xl": "1.875rem", // 30px - Heading lớn
    "4xl": "2.25rem", // 36px - Heading rất lớn
    "5xl": "3rem", // 48px - Title chính
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ==================== SPACING ====================
export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
};

// ==================== COMPONENT VARIANTS ====================
// Định nghĩa class styles cho các components - tối ưu cho warehouse management
export const COMPONENT_VARIANTS = {
  // Button variants - các biến thể nút bấm
  button: {
    // Primary button - nút chính cho actions quan trọng
    primary: {
      base: "mia-btn mia-btn-primary inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
      disabled:
        "mia-btn mia-btn-disabled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border cursor-not-allowed opacity-50",
    },
    // Secondary button - nút phụ cho actions thứ cấp
    secondary: {
      base: "mia-btn mia-btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
      disabled:
        "mia-btn mia-btn-disabled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border cursor-not-allowed opacity-50",
    },
    // Success button - nút cho actions thành công/xác nhận
    success: {
      base: "mia-btn mia-btn-success inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
      disabled:
        "mia-btn mia-btn-disabled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border cursor-not-allowed opacity-50",
    },
    // Warning button - nút cho actions cần cẩn thận
    warning: {
      base: "mia-btn mia-btn-warning inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
      disabled:
        "mia-btn mia-btn-disabled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border cursor-not-allowed opacity-50",
    },
    // Error/Danger button - nút cho actions nguy hiểm
    error: {
      base: "mia-btn mia-btn-error inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
      disabled:
        "mia-btn mia-btn-disabled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border cursor-not-allowed opacity-50",
    },
    // Ghost button - nút trong suốt
    ghost: {
      base: "mia-btn mia-btn-ghost inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2",
      disabled:
        "mia-btn mia-btn-disabled inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg cursor-not-allowed opacity-50",
    },
  },

  // Card variants - các biến thể thẻ
  card: {
    default:
      "mia-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-shadow duration-200",
    elevated:
      "mia-card mia-card-elevated bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200",
    outlined:
      "mia-card mia-card-outlined bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200",
    filled:
      "mia-card mia-card-filled bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200",
    glass:
      "mia-card mia-card-glass backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg",
  },

  // Badge variants - các biến thể nhãn
  badge: {
    default:
      "mia-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    success:
      "mia-badge mia-badge-success inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    warning:
      "mia-badge mia-badge-warning inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    error:
      "mia-badge mia-badge-error inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    info: "mia-badge mia-badge-info inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    primary:
      "mia-badge mia-badge-primary inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  },

  // Input variants - các biến thể input
  input: {
    default:
      "mia-input block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200",
    error:
      "mia-input mia-input-error block w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-colors duration-200",
    success:
      "mia-input mia-input-success block w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors duration-200",
  },

  // Avatar variants - các biến thể avatar
  avatar: {
    sm: "mia-avatar w-8 h-8 rounded-full object-cover",
    md: "mia-avatar w-10 h-10 rounded-full object-cover",
    lg: "mia-avatar w-12 h-12 rounded-full object-cover",
    xl: "mia-avatar w-16 h-16 rounded-full object-cover",
  },
};

// ==================== VIETNAMESE TRANSLATIONS ====================
export const VIETNAMESE_LABELS = {
  // Common actions
  actions: {
    add: "Thêm",
    edit: "Sửa",
    delete: "Xóa",
    save: "Lưu",
    cancel: "Hủy",
    confirm: "Xác nhận",
    close: "Đóng",
    search: "Tìm kiếm",
    filter: "Lọc",
    export: "Xuất",
    import: "Nhập",
    refresh: "Làm mới",
    print: "In",
    download: "Tải xuống",
    upload: "Tải lên",
    view: "Xem",
    details: "Chi tiết",
    settings: "Cài đặt",
  },

  // Status labels
  status: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    pending: "Đang chờ",
    completed: "Hoàn thành",
    processing: "Đang xử lý",
    cancelled: "Đã hủy",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    draft: "Bản nháp",
    published: "Đã xuất bản",
  },

  // Warehouse specific terms
  warehouse: {
    inventory: "Tồn kho",
    orders: "Đơn hàng",
    picking: "Lấy hàng",
    packing: "Đóng gói",
    shipping: "Giao hàng",
    receiving: "Nhận hàng",
    staff: "Nhân viên",
    analytics: "Phân tích",
    reports: "Báo cáo",
    dashboard: "Bảng điều khiển",
    alerts: "Cảnh báo",
    notifications: "Thông báo",
    products: "Sản phẩm",
    categories: "Danh mục",
    locations: "Vị trí",
    zones: "Khu vực",
    racks: "Kệ hàng",
    bins: "Ngăn chứa",
  },

  // Time related
  time: {
    today: "Hôm nay",
    yesterday: "Hôm qua",
    thisWeek: "Tuần này",
    lastWeek: "Tuần trước",
    thisMonth: "Tháng này",
    lastMonth: "Tháng trước",
    thisYear: "Năm này",
    lastYear: "Năm ngoái",
    realTime: "Thời gian thực",
    lastUpdated: "Cập nhật lần cuối",
  },
};

// ==================== ICON MAPPINGS ====================
export const ICON_MAPPINGS = {
  // Actions
  add: "Plus",
  edit: "Edit",
  delete: "Trash2",
  save: "Save",
  cancel: "X",
  search: "Search",
  filter: "Filter",
  refresh: "RefreshCw",
  download: "Download",
  upload: "Upload",
  settings: "Settings",

  // Status
  success: "CheckCircle",
  warning: "AlertTriangle",
  error: "XCircle",
  info: "Info",

  // Warehouse
  inventory: "Package",
  orders: "ShoppingCart",
  picking: "Package",
  staff: "Users",
  analytics: "BarChart3",
  dashboard: "Grid",
  alerts: "Bell",

  // Navigation
  home: "Home",
  back: "ArrowLeft",
  forward: "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",

  // UI
  theme: "Palette",
  darkMode: "Moon",
  lightMode: "Sun",
  expand: "ChevronDown",
  collapse: "ChevronUp",
  menu: "Menu",
  close: "X",
};

const MiaDesignSystem = {
  BRAND_COLORS,
  SEMANTIC_COLORS,
  THEME_COLORS,
  TYPOGRAPHY,
  SPACING,
  COMPONENT_VARIANTS,
  VIETNAMESE_LABELS,
  ICON_MAPPINGS,
};

export default MiaDesignSystem;
