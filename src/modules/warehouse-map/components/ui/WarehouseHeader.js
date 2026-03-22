// Warehouse Map Header Component
import React from 'react';
import {
  MapIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export const WarehouseHeader = ({
  title = "Hệ Thống Quản Lý Kho",
  onExportData,
  onShowSettings,
  showExport = true,
  showSettings = true
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapIcon className="h-8 w-8" />
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {showExport && (
              <button
                onClick={onExportData}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Xuất Dữ Liệu</span>
              </button>
            )}

            {showSettings && (
              <button
                onClick={onShowSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Cài Đặt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
