// ==================== ORDERS DATA HOOK ====================
// File: src/modules/orders/hooks/useOrdersData.js
// Custom hook to manage orders data with real-time updates

import { useState, useEffect, useCallback, useRef } from 'react';
import logger from "../../../utils/logger";

// Mock service for now - replace with actual Google Sheets service
const mockGoogleSheetsService = {
  readOrdersData: async () => {
    // Mock data for development
    return [
      [
        'ORD001',
        'Shopee',
        'CUST001',
        'P1',
        'pending',
        new Date().toISOString(),
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        '',
        '150000',
        'Ghi chú 1',
        'GHN',
        new Date().toISOString(),
        'System',
      ],
      [
        'ORD002',
        'TikTok Shop',
        'CUST002',
        'P2',
        'picking',
        new Date().toISOString(),
        new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        'Nguyễn Văn A',
        '250000',
        'Ghi chú 2',
        'GHTK',
        new Date().toISOString(),
        'System',
      ],
      [
        'ORD003',
        'Lazada',
        'CUST003',
        'P3',
        'completed',
        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        'Trần Thị B',
        '350000',
        'Ghi chú 3',
        'GHN',
        new Date().toISOString(),
        'System',
      ],
    ];
  },
  readProductsData: async () => {
    return [
      ['ORD001', 'SKU001', 'Sản phẩm A', '2', 'A1-B2', '100', '1', '', ''],
      ['ORD002', 'SKU002', 'Sản phẩm B', '1', 'A2-B3', '50', '1', '', ''],
      ['ORD003', 'SKU003', 'Sản phẩm C', '3', 'A3-B4', '75', '1', '', ''],
    ];
  },
  writeOrdersData: async () => true,
  writeProductsData: async () => true,
};

// Mock SLA Calculator
const mockSLACalculator = {
  calculatePriority: (order) => {
    const now = new Date();
    const deadline = new Date(order.slaDeadline);
    const remainingMinutes = (deadline - now) / (1000 * 60);

    return {
      remainingMinutes: Math.round(remainingMinutes),
      isOverdue: remainingMinutes < 0,
      urgencyLevel:
        remainingMinutes < 30
          ? 'critical'
          : remainingMinutes < 120
          ? 'high'
          : 'normal',
    };
  },
};

// Data transformers (simplified)
const transformSheetsData = (ordersData, productsData) => {
  const orders = ordersData.map((row) => {
    const [
      id,
      platform,
      customerId,
      priority,
      status,
      createdAt,
      slaDeadline,
      assignedTo,
      totalValue,
      notes,
      carrierName,
      updatedAt,
      updatedBy,
    ] = row;

    return {
      id,
      platform,
      customerId,
      priority,
      status,
      createdAt: new Date(createdAt),
      slaDeadline: new Date(slaDeadline),
      assignedTo: assignedTo || null,
      totalValue: parseFloat(totalValue) || 0,
      notes: notes || '',
      carrierName: carrierName || '',
      updatedAt: new Date(updatedAt || createdAt),
      updatedBy: updatedBy || 'System',
      items: [],
    };
  });

  // Group products by order ID
  const productsByOrder = {};
  productsData.forEach((row) => {
    const [
      orderId,
      sku,
      productName,
      quantity,
      location,
      stockLevel,
      pickingOrder,
      pickedAt,
      pickedBy,
    ] = row;

    if (!productsByOrder[orderId]) {
      productsByOrder[orderId] = [];
    }

    productsByOrder[orderId].push({
      sku,
      product: productName,
      quantity: parseInt(quantity) || 1,
      location,
      stockLevel,
      pickingOrder: parseInt(pickingOrder) || 999,
      pickedAt: pickedAt ? new Date(pickedAt) : null,
      pickedBy: pickedBy || null,
    });
  });

  // Attach products to orders
  orders.forEach((order) => {
    if (productsByOrder[order.id]) {
      order.items = productsByOrder[order.id].sort(
        (a, b) => a.pickingOrder - b.pickingOrder
      );
    }
  });

  return orders;
};

export const useOrdersData = (config = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const googleSheetsRef = useRef(mockGoogleSheetsService);
  const slaCalculatorRef = useRef(mockSLACalculator);

  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
  } = config;

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, productsData] = await Promise.all([
        googleSheetsRef.current.readOrdersData(),
        googleSheetsRef.current.readProductsData(),
      ]);

      // Transform and merge data
      const transformedOrders = transformSheetsData(ordersData, productsData);

      // Calculate SLA info for each order
      const ordersWithSLA = transformedOrders.map((order) => ({
        ...order,
        ...slaCalculatorRef.current.calculatePriority(order),
      }));

      setOrders(ordersWithSLA);
      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
      logger.error('Failed to load orders data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update single order
  const updateOrder = useCallback(
    async (orderId, updates) => {
      try {
        // Optimistic update
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  ...updates,
                  updatedAt: new Date(),
                  ...slaCalculatorRef.current.calculatePriority({
                    ...order,
                    ...updates,
                  }),
                }
              : order
          )
        );

        return true;
      } catch (err) {
        logger.error('Failed to update order:', err);
        // Reload data on failure
        await loadData();
        return false;
      }
    },
    [loadData]
  );

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      loadData();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    orders,
    loading,
    error,
    lastSync,
    loadData,
    updateOrder,
  };
};
