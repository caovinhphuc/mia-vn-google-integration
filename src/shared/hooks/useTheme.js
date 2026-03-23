import { useMemo } from "react";
import {
  getButtonClasses,
  getCardClasses,
  getSidebarClasses,
  getStatusColor,
  getThemeClasses,
} from "../constants/theme";

// ==================== THEME HOOK ====================
// Custom hook to easily access theme classes and utilities
export const useTheme = (isDarkMode = false) => {
  const themeClasses = useMemo(() => getThemeClasses(isDarkMode), [isDarkMode]);

  const sidebarClasses = useMemo(() => getSidebarClasses(isDarkMode), [isDarkMode]);

  const getCardTheme = useMemo(
    () =>
      (variant = "default") =>
        getCardClasses(variant),
    []
  );

  const getButtonTheme = useMemo(
    () =>
      (variant = "primary") =>
        getButtonClasses(variant),
    []
  );

  const getStatusTheme = useMemo(
    () => (status) => getStatusColor(status, isDarkMode),
    [isDarkMode]
  );

  return {
    // Core theme classes
    ...themeClasses,

    // Component-specific classes
    sidebar: sidebarClasses,

    // Utility functions
    getCard: getCardTheme,
    getButton: getButtonTheme,
    getStatus: getStatusTheme,

    // Common combinations
    pageContainer: `min-h-screen ${themeClasses.background}`,
    contentContainer: `${themeClasses.surface} rounded-lg ${themeClasses.border}`,
    headerContainer: `${themeClasses.surface} ${themeClasses.card.header}`,
  };
};

// ==================== SEMANTIC THEME HELPERS ====================
// Pre-built semantic combinations for common use cases

export const useSemanticTheme = (isDarkMode = false) => {
  const theme = useTheme(isDarkMode);

  return {
    ...theme,

    // Navigation
    navLink: `${theme.navigation.link} transition-colors duration-200`,
    navLinkActive: `${theme.navigation.linkActive} shadow-sm`,

    // Cards
    cardDefault: `${theme.card.default} transition-shadow duration-200`,
    cardElevated: `${theme.card.elevated} transition-all duration-200`,
    cardInteractive: `${theme.card.elevated} ${theme.interactive.hover} cursor-pointer`,

    // Buttons
    btnPrimary: theme.getButton("primary"),
    btnSecondary: theme.getButton("secondary"),
    btnGhost: theme.getButton("ghost"),

    // Form elements
    input: `${theme.form.input} rounded-lg px-3 py-2 ${theme.interactive.focus}`,
    label: `${theme.form.label} block mb-1`,
    error: `${theme.form.error} text-xs mt-1`,

    // Status badges
    statusSuccess: `${theme.status.success} px-2 py-1 rounded-full text-xs font-medium`,
    statusWarning: `${theme.status.warning} px-2 py-1 rounded-full text-xs font-medium`,
    statusError: `${theme.status.error} px-2 py-1 rounded-full text-xs font-medium`,
    statusInfo: `${theme.status.info} px-2 py-1 rounded-full text-xs font-medium`,

    // Layout
    pageLayout: `${theme.pageContainer} ${theme.text.primary}`,
    contentLayout: `${theme.contentContainer} p-6`,
    headerLayout: `${theme.headerContainer} p-4`,

    // Typography
    heading1: `text-2xl font-bold ${theme.text.primary}`,
    heading2: `text-xl font-semibold ${theme.text.primary}`,
    heading3: `text-lg font-medium ${theme.text.primary}`,
    bodyText: `text-sm ${theme.text.secondary}`,
    mutedText: `text-xs ${theme.text.muted}`,
    subtleText: `text-xs ${theme.text.subtle}`,
  };
};

export default useTheme;
