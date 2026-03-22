// ==================== DATE HELPERS ====================
// File: src/modules/alerts/utils/dateHelpers.js
// Date and time utility functions for alerts

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'full', 'short', 'time', 'relative'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'full') => {
  if (!date) return '--';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  switch (format) {
    case 'relative':
      return formatRelativeTime(diff);

    case 'time':
      return dateObj.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });

    case 'short':
      return dateObj.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

    case 'full':
    default:
      return dateObj.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
  }
};

/**
 * Format relative time (e.g., "2 phút trước")
 * @param {number} diff - Time difference in milliseconds
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (diff) => {
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;

  return formatDate(new Date(Date.now() - diff), 'short');
};

/**
 * Get time ago string
 * @param {Date|string} timestamp - Timestamp to calculate from
 * @returns {string} Time ago string
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return '--';

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  return formatRelativeTime(diff);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();

  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if date is within range
 * @param {Date|string} date - Date to check
 * @param {string} range - Range type: 'today', '7days', '30days', 'all'
 * @returns {boolean} True if date is within range
 */
export const isWithinRange = (date, range) => {
  if (!date || range === 'all') return true;

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  switch (range) {
    case 'today':
      return isToday(dateObj);

    case '7days':
      return now.getTime() - dateObj.getTime() <= 7 * 24 * 60 * 60 * 1000;

    case '30days':
      return now.getTime() - dateObj.getTime() <= 30 * 24 * 60 * 60 * 1000;

    default:
      return true;
  }
};

/**
 * Get duration string between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Duration string
 */
export const getDuration = (startDate, endDate = new Date()) => {
  if (!startDate) return '--';

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  const diff = end.getTime() - start.getTime();

  if (diff < 0) return '0 phút';

  return formatRelativeTime(-diff).replace(' trước', '');
};

/**
 * Format timestamp for alerts
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {object} Formatted timestamp object
 */
export const formatAlertTimestamp = (timestamp) => {
  if (!timestamp) {
    return {
      full: '--',
      short: '--',
      relative: '--',
      time: '--',
    };
  }

  return {
    full: formatDate(timestamp, 'full'),
    short: formatDate(timestamp, 'short'),
    relative: formatDate(timestamp, 'relative'),
    time: formatDate(timestamp, 'time'),
  };
};
