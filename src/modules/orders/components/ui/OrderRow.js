// ==================== ORDER ROW COMPONENT ====================
// File: src/modules/orders/components/ui/OrderRow.jsx
// Individual order row with unified system design

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, MoreHorizontal, Clock, User } from 'lucide-react';
import { Badge } from '../../../../components/ui/CommonComponents';
import { ORDER_PRIORITIES, STATUS_LABELS } from '../../config/constants';
import { formatRemainingTime, dateHelpers } from '../../utils/dateHelpers';
import { useSemanticTheme } from '../../../../shared/hooks/useTheme'
import { useTheme } from '../../../../App'

export const OrderRow = ({ order, isSelected, onSelect, onStatusChange }) => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const theme = useSemanticTheme(isDarkMode)

  const timeDisplay = formatRemainingTime(order);
  const priorityConfig = ORDER_PRIORITIES[order.priority];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'picking':
        return 'info';
      case 'overdue':
        return 'error';
      case 'assigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'P1':
        return 'error';
      case 'P2':
        return 'warning';
      case 'P3':
        return 'success';
      case 'P4':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <tr
      className={`${theme.interactive.hover} transition-colors ${
        theme.border.light
      } ${order.isOverdue ? theme.getStatus('error') : ''} ${
        isSelected ? theme.getStatus('info') : ''
      }`}
    >
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(order.id)}
          className={`rounded ${theme.border.default} ${theme.text.primary} ${theme.interactive.focus} ${theme.surface.primary}`}
        />
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {order.id}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {dateHelpers.formatDate(order.createdAt)}{' '}
            {dateHelpers.formatTime(order.createdAt)}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={getPriorityVariant(order.priority)} size="sm">
          {priorityConfig.name}
        </Badge>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {order.customerId}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {order.platform}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="truncate">
              {item.product} ({item.quantity})
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{order.items.length - 2} sản phẩm khác
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant={
            timeDisplay.color.includes('red')
              ? 'error'
              : timeDisplay.color.includes('orange')
              ? 'warning'
              : 'success'
          }
          size="sm"
        >
          <Clock size={12} className="mr-1" />
          {timeDisplay.text}
        </Badge>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={getStatusVariant(order.status)} size="sm">
          {STATUS_LABELS[order.status] || order.status}
        </Badge>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {order.assignedTo ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
              <User size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-sm text-gray-900 dark:text-white">
              {order.assignedTo}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Chưa phân công
          </span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => navigate(`/orders/detail/${order.id}`)}
            className="inline-flex items-center p-2 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() =>
              onStatusChange(order.id, {
                status: order.status === 'pending' ? 'picking' : 'completed',
              })
            }
            className="inline-flex items-center p-2 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Cập nhật trạng thái"
          >
            <CheckCircle size={16} />
          </button>

          <div className="relative">
            <button
              className="inline-flex items-center p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Thêm thao tác"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};
