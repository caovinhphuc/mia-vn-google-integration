// ==================== ORDERS EMPTY STATE ====================
// File: src/modules/orders/components/ui/OrdersEmptyState.jsx
// Empty state component for when no orders are found

import React from 'react';
import { Package } from 'lucide-react';

export const OrdersEmptyState = ({ searchTerm, hasFilters }) => {
  return (
    <div className="text-center py-12">
      <Package size={48} className="mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        Không có đơn hàng
      </p>
      <p className="text-gray-600 max-w-md mx-auto">
        {searchTerm || hasFilters
          ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.'
          : 'Chưa có đơn hàng nào trong hệ thống. Đơn hàng mới sẽ được đồng bộ tự động từ các sàn thương mại điện tử.'}
      </p>
    </div>
  );
};
