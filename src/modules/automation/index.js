// Automation Module - Main Entry Point
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import AutomationDashboard from './components/AutomationDashboard';
import AutomationLogs from './components/AutomationLogs';
import AutomationConfig from './components/AutomationConfig';

const AutomationModule = () => {
  return (
    <ErrorBoundary
      fallback={<div className="p-6 text-red-600">Lỗi trong module Automation</div>}
    >
      <Routes>
        <Route index element={<AutomationDashboard />} />
        <Route path="dashboard" element={<AutomationDashboard />} />
        <Route path="logs" element={<AutomationLogs />} />
        <Route path="config" element={<AutomationConfig />} />
      </Routes>
    </ErrorBoundary>
  );
};

AutomationModule.displayName = 'AutomationModule';
export default AutomationModule;
