// ==================== DATE HELPERS ====================
// File: src/modules/orders/utils/dateHelpers.js
// Utility functions for date/time formatting and calculations

export const dateHelpers = {
  // Format date for Vietnamese locale
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options,
    };

    return new Date(date).toLocaleDateString('vi-VN', defaultOptions);
  },

  // Format time for Vietnamese locale
  formatTime: (date, options = {}) => {
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };

    return new Date(date).toLocaleTimeString('vi-VN', defaultOptions);
  },

  // Format datetime
  formatDateTime: (date) => {
    return `${dateHelpers.formatDate(date)} ${dateHelpers.formatTime(date)}`;
  },

  // Get relative time (e.g., "2 giờ trước")
  getRelativeTime: (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return dateHelpers.formatDate(date);
  },

  // Get remaining time until deadline
  getRemainingTime: (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 0) {
      return {
        text: `Quá hạn ${Math.abs(diffMinutes)} phút`,
        color: 'red',
        isOverdue: true,
      };
    }

    if (diffMinutes < 60) {
      return {
        text: `${diffMinutes} phút`,
        color:
          diffMinutes <= 15 ? 'red' : diffMinutes <= 30 ? 'orange' : 'green',
        isOverdue: false,
      };
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return {
      text: `${hours}h ${minutes}m`,
      color: hours < 1 ? 'orange' : 'green',
      isOverdue: false,
    };
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);

    return (
      today.getDate() === checkDate.getDate() &&
      today.getMonth() === checkDate.getMonth() &&
      today.getFullYear() === checkDate.getFullYear()
    );
  },

  // Get start of day
  getStartOfDay: (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  },

  // Get end of day
  getEndOfDay: (date = new Date()) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  },

  // Add business hours to date (skip weekends)
  addBusinessHours: (date, hours) => {
    const result = new Date(date);
    let remainingHours = hours;

    while (remainingHours > 0) {
      const dayOfWeek = result.getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        result.setDate(result.getDate() + 1);
        result.setHours(8, 0, 0, 0); // Start at 8 AM
        continue;
      }

      const currentHour = result.getHours();

      // Business hours: 8 AM to 6 PM
      if (currentHour < 8) {
        result.setHours(8, 0, 0, 0);
      } else if (currentHour >= 18) {
        result.setDate(result.getDate() + 1);
        result.setHours(8, 0, 0, 0);
        continue;
      }

      const hoursUntilEndOfDay = 18 - result.getHours();
      const hoursToAdd = Math.min(remainingHours, hoursUntilEndOfDay);

      result.setHours(result.getHours() + hoursToAdd);
      remainingHours -= hoursToAdd;

      if (remainingHours > 0 && result.getHours() >= 18) {
        result.setDate(result.getDate() + 1);
        result.setHours(8, 0, 0, 0);
      }
    }

    return result;
  },
};

// Format remaining time for display
export const formatRemainingTime = (order) => {
  const minutes = order.remainingMinutes;
  if (order.isOverdue) {
    return {
      text: `Quá hạn ${Math.abs(minutes).toFixed(0)}m`,
      color: 'text-red-600 bg-red-50',
    };
  }

  if (minutes < 60) {
    return {
      text: `${minutes.toFixed(0)} phút`,
      color:
        minutes < 30
          ? 'text-red-600 bg-red-50'
          : 'text-orange-600 bg-orange-50',
    };
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.floor(minutes % 60);
  return {
    text: `${hours}h ${remainingMins}m`,
    color: 'text-green-600 bg-green-50',
  };
};
