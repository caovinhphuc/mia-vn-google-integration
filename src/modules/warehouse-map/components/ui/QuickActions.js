// Quick Actions Component
import React from 'react';
import {
  PlusIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  CogIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const ActionButton = ({
  title,
  icon: Icon,
  onClick,
  color = "blue",
  disabled = false,
  loading = false
}) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    gray: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-medium
        transition-all duration-200 transform hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${colorClasses[color]}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <Icon className="h-5 w-5" />
      )}
      <span>{title}</span>
    </button>
  );
};

export const QuickActions = ({
  onAddLocation,
  onImportSample,
  onGenerateReport,
  onBackupData,
  onShowSettings,
  onExportData,
  loading = {}
}) => {
  const actions = [
    {
      title: 'Thêm Vị Trí Mới',
      icon: PlusIcon,
      onClick: onAddLocation,
      color: 'blue',
      loading: loading.addLocation
    },
    {
      title: 'Import Dữ Liệu Mẫu',
      icon: DocumentArrowUpIcon,
      onClick: onImportSample,
      color: 'green',
      loading: loading.importSample
    },
    {
      title: 'Tạo Báo Cáo',
      icon: ChartBarIcon,
      onClick: onGenerateReport,
      color: 'yellow',
      loading: loading.generateReport
    },
    {
      title: 'Sao Lưu Dữ Liệu',
      icon: CloudArrowUpIcon,
      onClick: onBackupData,
      color: 'purple',
      loading: loading.backupData
    },
    {
      title: 'Cài Đặt',
      icon: CogIcon,
      onClick: onShowSettings,
      color: 'gray',
      loading: loading.settings
    },
    {
      title: 'Xuất Dữ Liệu',
      icon: ArrowDownTrayIcon,
      onClick: onExportData,
      color: 'blue',
      loading: loading.exportData
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <ChartBarIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 ml-3">Thao Tác Nhanh</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            title={action.title}
            icon={action.icon}
            onClick={action.onClick}
            color={action.color}
            loading={action.loading}
          />
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Mẹo:</strong> Sử dụng các thao tác nhanh để quản lý kho hiệu quả hơn.
          Nhấp vào "Import Dữ Liệu Mẫu" để bắt đầu với dữ liệu demo.
        </p>
      </div>
    </div>
  );
};
