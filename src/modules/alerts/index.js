// ==================== ALERTS MODULE ====================
// File: src/modules/alerts/index.jsx
// Main alerts module component

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import AlertsSystem from './components/AlertsSystem';

// Main alerts list component using the full AlertsSystem
const AlertsList = () => {
  return <AlertsSystem />;
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
