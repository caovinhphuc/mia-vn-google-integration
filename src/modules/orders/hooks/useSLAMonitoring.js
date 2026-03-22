// ==================== SLA MONITORING HOOK ====================
// File: src/modules/orders/hooks/useSLAMonitoring.js
// Hook to monitor SLA real-time with notifications

import { useState, useEffect, useCallback, useRef } from 'react';
import { SLA_THRESHOLDS } from '../config/constants';

export const useSLAMonitoring = (orders, options = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({});

  const {
    enableNotifications = true,
    notificationThresholds = {
      critical: SLA_THRESHOLDS.CRITICAL_THRESHOLD,
      warning: SLA_THRESHOLDS.WARNING_THRESHOLD,
    },
  } = options;

  // Use refs to avoid dependency issues
  const thresholdsRef = useRef(notificationThresholds);
  thresholdsRef.current = notificationThresholds;

  // Calculate real-time SLA metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const now = new Date();
      const activeOrders = orders.filter(
        (order) => order.status !== 'completed' && order.status !== 'cancelled'
      );

      const criticalOrders = activeOrders.filter(
        (order) => order.remainingMinutes <= thresholdsRef.current.critical
      );

      const warningOrders = activeOrders.filter(
        (order) =>
          order.remainingMinutes <= thresholdsRef.current.warning &&
          order.remainingMinutes > thresholdsRef.current.critical
      );

      const overdueOrders = activeOrders.filter((order) => order.isOverdue);

      // Calculate compliance rate
      const totalCompleted = orders.filter(
        (order) => order.status === 'completed'
      ).length;
      const totalOverdue = orders.filter((order) => order.isOverdue).length;
      const complianceRate =
        totalCompleted > 0
          ? (((totalCompleted - totalOverdue) / totalCompleted) * 100).toFixed(
              1
            )
          : 100;

      // Calculate average processing time
      const completedOrders = orders.filter(
        (order) => order.status === 'completed'
      );
      const avgProcessingTime =
        completedOrders.length > 0
          ? completedOrders.reduce((sum, order) => {
              const processingTime =
                (order.updatedAt - order.createdAt) / (1000 * 60); // minutes
              return sum + processingTime;
            }, 0) / completedOrders.length
          : 0;

      setMetrics({
        totalActive: activeOrders.length,
        critical: criticalOrders.length,
        warning: warningOrders.length,
        overdue: overdueOrders.length,
        complianceRate: parseFloat(complianceRate),
        avgProcessingTime: Math.round(avgProcessingTime),
        lastCalculated: now,
      });

      // Generate alerts
      const newAlerts = [];

      criticalOrders.forEach((order) => {
        newAlerts.push({
          id: `critical-${order.id}`,
          type: 'critical',
          orderId: order.id,
          message: `Đơn ${order.id} sẽ quá hạn trong ${Math.round(
            order.remainingMinutes
          )} phút`,
          timestamp: now,
          acknowledged: false,
        });
      });

      overdueOrders.forEach((order) => {
        newAlerts.push({
          id: `overdue-${order.id}`,
          type: 'overdue',
          orderId: order.id,
          message: `Đơn ${order.id} đã quá hạn ${Math.round(
            Math.abs(order.remainingMinutes)
          )} phút`,
          timestamp: now,
          acknowledged: false,
        });
      });

      setAlerts(newAlerts);

      // Send browser notifications if enabled
      if (
        enableNotifications &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        newAlerts.forEach((alert) => {
          if (alert.type === 'critical' || alert.type === 'overdue') {
            new Notification('SLA Alert - MIA Warehouse', {
              body: alert.message,
              icon: '/favicon.ico',
              tag: alert.id,
            });
          }
        });
      }
    };

    // Calculate immediately
    calculateMetrics();

    // Update every minute
    const interval = setInterval(calculateMetrics, 60000);
    return () => clearInterval(interval);
  }, [orders, enableNotifications]); // Only depend on orders and enableNotifications

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    alerts,
    metrics,
    acknowledgeAlert,
    clearAllAlerts,
    requestNotificationPermission,
  };
};
