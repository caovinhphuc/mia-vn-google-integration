// ==================== THEME CONSTANTS ====================
// Centralized theme system for MIA Warehouse Management
// Version: Final 2.0 - Complete theme unification

export const THEME_CONSTANTS = {
  // ==================== SEMANTIC THEME TOKENS ====================
  tokens: {
    // Spacing scale
    spacing: {
      xs: "0.25rem", // 1
      sm: "0.5rem", // 2
      md: "0.75rem", // 3
      lg: "1rem", // 4
      xl: "1.5rem", // 6
      "2xl": "2rem", // 8
      "3xl": "3rem", // 12
    },

    // Border radius scale
    radius: {
      none: "0",
      sm: "0.125rem", // 2px
      md: "0.375rem", // 6px
      lg: "0.5rem", // 8px
      xl: "0.75rem", // 12px
      full: "9999px",
    },

    // Shadow scale
    shadow: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
  },

  // ==================== COLORS ====================
  colors: {
    primary: {
      50: "blue-50",
      100: "blue-100",
      500: "blue-500",
      600: "blue-600",
      700: "blue-700",
      800: "blue-800",
      900: "blue-900",
    },
    gray: {
      50: "gray-50",
      100: "gray-100",
      200: "gray-200",
      300: "gray-300",
      400: "gray-400",
      500: "gray-500",
      600: "gray-600",
      700: "gray-700",
      800: "gray-800",
      900: "gray-900",
    },
    semantic: {
      success: {
        light: "green-600",
        dark: "green-400",
        bg: { light: "green-50", dark: "green-900/20" },
      },
      warning: {
        light: "yellow-600",
        dark: "yellow-400",
        bg: { light: "yellow-50", dark: "yellow-900/20" },
      },
      error: {
        light: "red-600",
        dark: "red-400",
        bg: { light: "red-50", dark: "red-900/20" },
      },
      info: {
        light: "blue-600",
        dark: "blue-400",
        bg: { light: "blue-50", dark: "blue-900/20" },
      },
    },
  },

  // ==================== UNIFIED THEME CLASSES ====================
  theme: {
    // Surface classes - Replaces all bg-white dark:bg-gray-800 patterns
    surface: {
      primary: "theme-surface-primary", // bg-white dark:bg-gray-800
      secondary: "theme-surface-secondary", // bg-gray-50 dark:bg-gray-700/30
      elevated: "theme-surface-elevated", // bg-white dark:bg-gray-800 shadow-sm
      overlay: "theme-surface-overlay", // bg-white/95 dark:bg-gray-800/95
    },

    // Border classes - Unified border styling
    border: {
      default: "theme-border", // border-gray-200 dark:border-gray-700
      light: "theme-border-light", // border-gray-100 dark:border-gray-700
      focus: "theme-border-focus", // border-blue-500 dark:border-blue-400
      accent: "theme-border-accent", // border-blue-600 dark:border-blue-500
    },

    // Text classes - Semantic text colors
    text: {
      primary: "theme-text-primary", // text-gray-900 dark:text-white
      secondary: "theme-text-secondary", // text-gray-700 dark:text-gray-300
      muted: "theme-text-muted", // text-gray-600 dark:text-gray-400
      subtle: "theme-text-subtle", // text-gray-500 dark:text-gray-500
      inverse: "theme-text-inverse", // text-white dark:text-gray-900
      accent: "theme-text-accent", // text-blue-600 dark:text-blue-400
    },

    // Interactive states
    interactive: {
      hover: "theme-hover", // hover:bg-gray-100 dark:hover:bg-gray-700/50
      active: "theme-active", // bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300
      focus: "theme-focus", // focus:ring-blue-500 dark:focus:ring-blue-400
      selected: "theme-selected", // bg-blue-50 dark:bg-blue-900/30
    },

    // Button variants
    button: {
      primary: "theme-btn-primary", // Blue primary button
      secondary: "theme-btn-secondary", // Gray secondary button
      ghost: "theme-btn-ghost", // Transparent ghost button
      danger: "theme-btn-danger", // Red danger button
    },

    // Status variants
    status: {
      success: "theme-status-success", // Green success styling
      warning: "theme-status-warning", // Yellow warning styling
      error: "theme-status-error", // Red error styling
      info: "theme-status-info", // Blue info styling
    },

    // Card variants
    card: {
      default: "theme-card", // Standard card styling
      elevated: "theme-card-elevated", // Card with shadow
      interactive: "theme-card-interactive", // Hoverable card
    },

    // Navigation variants
    nav: {
      link: "theme-nav-link", // Navigation link
      linkActive: "theme-nav-link-active", // Active navigation link
      sidebar: "theme-nav-sidebar", // Sidebar container
    },

    // Form elements
    form: {
      input: "theme-form-input", // Input field styling
      label: "theme-form-label", // Label styling
      error: "theme-form-error", // Error text styling
      helper: "theme-form-helper", // Helper text styling
    },
  },
};

// ==================== THEME UTILITIES ====================
export const getThemeClasses = (isDarkMode = false) => {
  return {
    // Basic surfaces using semantic classes
    background: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    surface: THEME_CONSTANTS.theme.surface.primary,
    surface2: THEME_CONSTANTS.theme.surface.secondary,
    surfaceElevated: THEME_CONSTANTS.theme.surface.elevated,

    // Borders using semantic classes
    border: THEME_CONSTANTS.theme.border.default,
    borderLight: THEME_CONSTANTS.theme.border.light,
    borderFocus: THEME_CONSTANTS.theme.border.focus,

    // Text using semantic classes
    text: {
      primary: THEME_CONSTANTS.theme.text.primary,
      secondary: THEME_CONSTANTS.theme.text.secondary,
      muted: THEME_CONSTANTS.theme.text.muted,
      subtle: THEME_CONSTANTS.theme.text.subtle,
      inverse: THEME_CONSTANTS.theme.text.inverse,
      accent: THEME_CONSTANTS.theme.text.accent,
    },

    // Interactive using semantic classes
    interactive: {
      hover: THEME_CONSTANTS.theme.interactive.hover,
      active: THEME_CONSTANTS.theme.interactive.active,
      focus: THEME_CONSTANTS.theme.interactive.focus,
      selected: THEME_CONSTANTS.theme.interactive.selected,
    },

    // Navigation using semantic classes
    navigation: THEME_CONSTANTS.theme.nav,

    // Cards using semantic classes
    card: THEME_CONSTANTS.theme.card,

    // Forms using semantic classes
    form: THEME_CONSTANTS.theme.form,

    // Status using semantic classes
    status: THEME_CONSTANTS.theme.status,

    // Buttons using semantic classes
    button: THEME_CONSTANTS.theme.button,
  };
};

// ==================== SEMANTIC COLOR HELPERS ====================
export const getStatusColor = (status, isDarkMode = false) => {
  const theme = isDarkMode ? "dark" : "light";

  switch (status) {
    case "success":
    case "healthy":
    case "online":
      return THEME_CONSTANTS.colors.semantic.success[theme];

    case "warning":
    case "degraded":
      return THEME_CONSTANTS.colors.semantic.warning[theme];

    case "error":
    case "critical":
    case "offline":
      return THEME_CONSTANTS.colors.semantic.error[theme];

    case "info":
    default:
      return THEME_CONSTANTS.colors.semantic.info[theme];
  }
};

// ==================== COMPONENT SPECIFIC HELPERS ====================
export const getSidebarClasses = (isDarkMode = false) => {
  return {
    container: THEME_CONSTANTS.theme.nav.sidebar,
    link: `flex items-center px-4 py-2.5 mx-2 space-x-3 text-sm font-medium rounded-lg transition-all duration-200 group ${THEME_CONSTANTS.theme.nav.link}`,
    linkActive: `flex items-center px-4 py-2.5 mx-2 space-x-3 text-sm font-medium rounded-lg transition-all duration-200 group ${THEME_CONSTANTS.theme.nav.linkActive}`,
    linkHover: THEME_CONSTANTS.theme.interactive.hover,
  };
};

export const getCardClasses = (variant = "default") => {
  return THEME_CONSTANTS.theme.card[variant] || THEME_CONSTANTS.theme.card.default;
};

export const getButtonClasses = (variant = "primary") => {
  return THEME_CONSTANTS.theme.button[variant] || THEME_CONSTANTS.theme.button.primary;
};

// ==================== COMPONENT PRESETS ====================
export const COMPONENT_PRESETS = {
  // Standard card preset
  card: "theme-card",

  // Navigation items
  navLink: "theme-nav-link",
  navLinkActive: "theme-nav-link-active",

  // Form elements
  input: "theme-form-input",
  label: "theme-form-label",

  // Buttons
  primaryButton: "theme-btn-primary",
  secondaryButton: "theme-btn-secondary",

  // Status indicators
  successBadge: "theme-status-success",
  warningBadge: "theme-status-warning",
  errorBadge: "theme-status-error",
  infoBadge: "theme-status-info",
};

// ==================== MIGRATION HELPERS ====================
// Helper to migrate from old hardcoded classes to new semantic classes
export const MIGRATION_MAP = {
  "bg-white dark:bg-gray-800": "theme-surface-primary",
  "bg-gray-50 dark:bg-gray-700/30": "theme-surface-secondary",
  "bg-white dark:bg-gray-800 shadow-sm": "theme-surface-elevated",
  "border-gray-200 dark:border-gray-700": "theme-border",
  "text-gray-900 dark:text-white": "theme-text-primary",
  "text-gray-700 dark:text-gray-300": "theme-text-secondary",
  "text-gray-600 dark:text-gray-400": "theme-text-muted",
  "hover:bg-gray-100 dark:hover:bg-gray-700/50": "theme-hover",
  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300": "theme-active",
};

export default THEME_CONSTANTS;
