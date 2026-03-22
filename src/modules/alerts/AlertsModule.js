// ==================== ALERTS MODULE ====================
// File: src/modules/alerts/index.jsx
// Main alerts module component

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Simple alerts component for now
const AlertsList = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hệ thống Cảnh báo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Theo dõi và quản lý các cảnh báo trong hệ thống kho vận
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Module Cảnh báo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chức năng cảnh báo đang được phát triển
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
              🚧 Đang xây dựng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Lỗi trong module Alerts
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
};

// Main Alerts Module component with routing
const AlertsModule = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Routes>
        <Route index element={<AlertsList />} />
        <Route path="list" element={<AlertsList />} />
        {/* Add more routes as needed */}
      </Routes>
    </ErrorBoundary>
  );
};

AlertsModule.displayName = 'AlertsModule';
export default AlertsModule;

// Export components for external use
export { AlertsList };
