/**
 * Automation Logs - Xem nhật ký chi tiết
 */
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import AutomationAPI from '../services/automationAPI';
import logger from "../../../utils/logger";

const AutomationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const automationAPI = new AutomationAPI();

  // Load logs from backend
  const loadLogs = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiFilters = {};
      if (filter !== 'all') {
        apiFilters.type = filter;
      }

      const logsData = await automationAPI.getLogs(apiFilters);

      // Transform backend data to match frontend format
      const transformedLogs = logsData.map((log, index) => ({
        id: log.id || Date.now() + index,
        timestamp: log.timestamp || new Date().toISOString(),
        type: mapLogLevel(log.level || 'info'),
        category: log.category || 'general',
        message: log.message || 'No message',
        details: log.details || '',
        duration: log.duration || null,
        recordsProcessed: log.records_processed || null,
      }));

      setLogs(transformedLogs);
    } catch (error) {
      logger.error('Failed to load logs:', error);
      setError('Không thể tải logs từ hệ thống');

      // Fallback to sample data if API fails
      setLogs([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          type: 'info',
          category: 'system',
          message: 'Không thể kết nối với automation system',
          details:
            'Đang hiển thị dữ liệu mẫu. Vui lòng kiểm tra kết nối backend.',
          duration: null,
          recordsProcessed: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Map backend log levels to frontend types
  const mapLogLevel = (level) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
      case 'warn':
        return 'warning';
      case 'success':
      case 'info':
        return 'success';
      default:
        return 'info';
    }
  };

  // Load logs on component mount and when filter changes
  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Auto-refresh logs every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadLogs();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nhật ký Automation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Theo dõi chi tiết các hoạt động tự động hóa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <button
            onClick={() => loadLogs()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          {/* Export button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} />
            <span>Xuất logs</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trong logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="success">Thành công</option>
              <option value="warning">Cảnh báo</option>
              <option value="error">Lỗi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-6 rounded-lg border ${getStatusBg(log.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(log.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {log.message}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {log.details}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{log.timestamp}</span>
                    </span>
                    <span>Thời gian: {formatDuration(log.duration)}</span>
                    {log.recordsProcessed > 0 && (
                      <span>Bản ghi: {log.recordsProcessed}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy logs phù hợp với bộ lọc
          </p>
        </div>
      )}
    </div>
  );
};

export default AutomationLogs;
