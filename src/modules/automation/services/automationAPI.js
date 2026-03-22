import logger from "../../../utils/logger";
/**
 * Automation API Service
 * Giao tiếp với Python automation system thông qua API
 */

class AutomationAPI {
  constructor() {
    this.baseUrl = process.env.REACT_APP_AUTOMATION_API_URL || 'http://localhost:8000';
    this.endpoints = {
      status: '/api/automation/status',
      start: '/api/automation/start',
      stop: '/api/automation/stop',
      logs: '/api/automation/logs',
      config: '/api/automation/config',
      test: '/api/automation/test',
    };
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API Request failed:', error);
      throw error;
    }
  }

  // Lấy trạng thái automation system
  async getStatus() {
    return this.makeRequest(this.endpoints.status);
  }

  // Khởi động automation
  async start() {
    return this.makeRequest(this.endpoints.start, {
      method: 'POST',
    });
  }

  // Dừng automation
  async stop() {
    return this.makeRequest(this.endpoints.stop, {
      method: 'POST',
    });
  }

  // Lấy logs
  async getLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`${this.endpoints.logs}?${params}`);
  }

  // Lấy config
  async getConfig() {
    return this.makeRequest(this.endpoints.config);
  }

  // Cập nhật config
  async updateConfig(config) {
    return this.makeRequest(this.endpoints.config, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Test kết nối
  async testConnection(config) {
    return this.makeRequest(this.endpoints.test, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Chạy thu thập dữ liệu thủ công
  async runDataCollection() {
    return this.makeRequest('/api/automation/collect', {
      method: 'POST',
    });
  }

  // Tạo báo cáo
  async generateReport(options = {}) {
    return this.makeRequest('/api/automation/report', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  // Gửi email báo cáo
  async sendEmailReport(recipients) {
    return this.makeRequest('/api/automation/email', {
      method: 'POST',
      body: JSON.stringify({ recipients }),
    });
  }

  // Thu thập dữ liệu theo loại
  async collectData(dataType) {
    return this.makeRequest(`/api/automation/collect/${dataType}`, {
      method: 'POST',
    });
  }
}

// Singleton instance
export const automationAPI = new AutomationAPI();

// Mock data cho development khi không có Python backend
export const mockAutomationData = {
  status: {
    isRunning: true,
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 3600000).toISOString(),
    totalRuns: 156,
    successRuns: 148,
    failedRuns: 8,
  },

  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      type: 'success',
      category: 'data_collection',
      message: 'Thu thập dữ liệu thành công',
      details: 'Đã lấy và xử lý 127 đơn hàng từ hệ thống ONE',
      duration: 45000,
      recordsProcessed: 127,
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'warning',
      category: 'performance',
      message: 'Thời gian phản hồi chậm',
      details: 'Hệ thống ONE phản hồi chậm hơn bình thường',
      duration: 62000,
      recordsProcessed: 89,
    },
  ],

  config: {
    oneUrl: 'https://one.tga.com.vn/',
    username: '',
    password: '',
    schedule: {
      enabled: true,
      interval: 'hourly',
      time: '08:00',
    },
    email: {
      enabled: true,
      sender: '',
      recipients: [''],
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
    },
    options: {
      headless: true,
      timeout: 30,
      retryAttempts: 3,
      retryDelay: 5,
    },
  },
};

// Export the class, not an instance
export default AutomationAPI;
