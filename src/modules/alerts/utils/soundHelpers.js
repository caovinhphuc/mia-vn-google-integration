import logger from "../../../utils/logger";
// ==================== SOUND HELPERS ====================
// File: src/modules/alerts/utils/soundHelpers.js
// Utilities for alert sound notifications

/**
 * Play notification sound for alerts
 * @param {string} type - Alert type (critical, warning, info, success)
 */
export const playNotificationSound = (type = 'info') => {
  try {
    // For now, we'll use the Web Audio API to create simple notification sounds
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different alert types
    const frequencies = {
      critical: 800,
      warning: 600,
      info: 400,
      success: 300,
    };

    oscillator.frequency.setValueAtTime(
      frequencies[type] || 400,
      audioContext.currentTime
    );
    oscillator.type = 'sine';

    // Volume and duration settings
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    logger.warn('Could not play notification sound:', error);
  }
};

/**
 * Check if sound notifications are supported
 */
export const isSoundSupported = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

/**
 * Play system notification sound if available
 */
export const playSystemSound = () => {
  try {
    // Try to use browser notification sound
    const audio = new Audio();
    audio.volume = 0.3;

    // Use data URL for a simple beep sound
    audio.src =
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSWV2/DQeisNI2vE8OOYSgwTXabh8bJjGgUsktv20X0vBSF+2OvHfy0HIXzU7N4=';
    audio.play().catch(() => {
      // Fallback to oscillator if audio fails
      playNotificationSound();
    });
  } catch (error) {
    // Fallback to oscillator
    playNotificationSound();
  }
};
