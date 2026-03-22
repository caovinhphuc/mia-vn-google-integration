// ==================== ORDERS TABLE HEADER ====================
// File: src/modules/orders/components/ui/OrdersTableHeader.jsx
// Reusable table header component with sorting

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const OrdersTableHeader = ({
  sortConfig,
  onSort,
  selectedCount,
  totalCount,
  onSelectAll,
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const SortableHeader = ({ sortKey, children, className = '' }) => (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        {sortConfig.key === sortKey &&
          (sortConfig.direction === 'asc' ? (
            <ArrowUp size={14} className="ml-1" />
          ) : (
            <ArrowDown size={14} className="ml-1" />
          ))}
      </div>
    </th>
  );

  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left">
          <input
            type="checkbox"
            checked={selectedCount === totalCount && totalCount > 0}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </th>

        <SortableHeader sortKey="id">Mã đơn hàng</SortableHeader>

        <SortableHeader sortKey="priority">Ưu tiên</SortableHeader>

        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Khách hàng/Sàn
        </th>

        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Sản phẩm
        </th>

        <SortableHeader sortKey="remainingMinutes">SLA còn lại</SortableHeader>

        <SortableHeader sortKey="status">Trạng thái</SortableHeader>

        <SortableHeader sortKey="assignedTo">Nhân viên</SortableHeader>

        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Thao tác
        </th>
      </tr>
    </thead>
  );
};
