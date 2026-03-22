/**
 * Automation Config - Cấu hình hệ thống tự động hóa
 */
import React, { useState } from 'react';
import { Settings, Save, TestTube, Key, Clock, Mail } from 'lucide-react';
import logger from "../../../utils/logger";

const AutomationConfig = () => {
  const [config, setConfig] = useState({
    oneUrl: 'https://one.tga.com.vn/',
    username: '',
    password: '',
    schedule: {
      enabled: true,
      interval: 'hourly', // hourly, daily, weekly
      time: '08:00'
    },
    email: {
      enabled: true,
      sender: '',
      recipients: [''],
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587
    },
    options: {
      headless: true,
      timeout: 30,
      retryAttempts: 3,
      retryDelay: 5
    }
  });

  const handleSave = () => {
    // API call to save config
    logger.info('Saving config:', config);
  };

  const handleTest = () => {
    // Test connection
    logger.info('Testing connection...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cấu hình Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thiết lập thông tin kết nối và lịch trình tự động
          </p>
        </div>
      </div>

      {/* ONE System Config */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin đăng nhập ONE
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL hệ thống
            </label>
            <input
              type="url"
              value={config.oneUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, oneUrl: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://one.tga.com.vn/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="username@company.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={config.password}
              onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {/* Schedule Config */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lịch trình tự động
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tần suất
            </label>
            <select
              value={config.schedule.interval}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                schedule: { ...prev.schedule, interval: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="hourly">Mỗi giờ</option>
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thời gian
            </label>
            <input
              type="time"
              value={config.schedule.time}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                schedule: { ...prev.schedule, time: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.schedule.enabled}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, enabled: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Kích hoạt lịch trình</span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Config */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cấu hình Email
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email gửi
            </label>
            <input
              type="email"
              value={config.email.sender}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                email: { ...prev.email, sender: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="automation@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email nhận báo cáo
            </label>
            <input
              type="email"
              value={config.email.recipients[0]}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                email: { ...prev.email, recipients: [e.target.value] }
              }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="manager@company.com"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          <span>Lưu cấu hình</span>
        </button>
        <button
          onClick={handleTest}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <TestTube size={16} />
          <span>Test kết nối</span>
        </button>
      </div>
    </div>
  );
};

export default AutomationConfig;
