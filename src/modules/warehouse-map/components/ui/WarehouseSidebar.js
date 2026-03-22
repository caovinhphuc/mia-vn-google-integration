// Sidebar Navigation Component
import React from 'react';
import {
  ChartPieIcon,
  MapIcon,
  CubeIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: ChartPieIcon,
    description: 'Tổng quan hệ thống'
  },
  {
    id: 'warehouse-map',
    label: 'Sơ Đồ Kho',
    icon: MapIcon,
    description: 'Bản đồ khu vực kho'
  },
  {
    id: 'inventory',
    label: 'Hàng Tồn Kho',
    icon: CubeIcon,
    description: 'Quản lý sản phẩm'
  },
  {
    id: 'import-export',
    label: 'Import/Export',
    icon: DocumentArrowUpIcon,
    description: 'Nhập xuất dữ liệu'
  },
  {
    id: 'search',
    label: 'Tìm Kiếm',
    icon: MagnifyingGlassIcon,
    description: 'Tìm kiếm nâng cao'
  },
  {
    id: 'reports',
    label: 'Báo Cáo',
    icon: ChartBarIcon,
    description: 'Thống kê và báo cáo'
  }
];

export const WarehouseSidebar = ({ activeSection, onSectionChange, isCollapsed = false }) => {
  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-md transform translate-x-1'
                    : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                  }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
