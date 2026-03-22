//index.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../components/ui/ErrorFallback';

export const OrdersModule = () => {
  // Mock data for orders (replace with real data later)
  const orders = [
    {
      id: 'ORD-001',
      priority: 'P1',
      status: 'processing',
      customer: 'Công ty ABC',
      items: 15,
      createdAt: new Date(),
    },
    {
      id: 'ORD-002',
      priority: 'P2',
      status: 'pending',
      customer: 'Cửa hàng XYZ',
      items: 8,
      createdAt: new Date(),
    },
  ];

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Đơn hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Theo dõi và xử lý đơn hàng P1-P4
          </p>
        </div>

        {/* Orders List */}
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {order.id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.customer} • {order.items} sản phẩm
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.priority === 'P1'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {order.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'processing'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {order.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </ErrorBoundary>
  );
};

export default OrdersModule;

// This module serves as the entry point for the Orders feature, providing a basic orders management interface
// It displays a list of orders with priority and status information
