import TelegramBot from 'node-telegram-bot-api';
import { notificationConfig } from '../config/notification.js';

class TelegramService {
  constructor() {
    this.bot = null;
    this.isInitialized = false;
    this.commandHandlers = new Map();
    this.init();
  }

  init() {
    if (!notificationConfig.telegram.token) {
      console.log('⚠️ Telegram bot token not configured');
      return;
    }

    try {
      if (notificationConfig.telegram.webhookUrl) {
        // Webhook mode for production
        this.bot = new TelegramBot(notificationConfig.telegram.token);
        this.setupWebhook();
      } else {
        // Polling mode for development
        this.bot = new TelegramBot(notificationConfig.telegram.token, {
          polling: true,
        });
        console.log('✅ Telegram Bot: Đã khởi động ở chế độ polling');
      }

      this.setupCommandHandlers();
      this.setupMessageHandlers();
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Telegram bot initialization error:', error);
    }
  }

  setupWebhook() {
    const hookUrl = `${notificationConfig.telegram.webhookUrl.replace(/\/$/, '')}/webhook/telegram`;

    this.bot
      .setWebHook(hookUrl)
      .then(() => {
        console.log('✅ Telegram webhook set:', hookUrl);
      })
      .catch((error) => {
        console.error(
          '❌ Webhook setup error:',
          error.response?.body || error.message
        );
      });
  }

  setupCommandHandlers() {
    // Register command handlers
    this.registerCommand('/start', this.handleStart.bind(this));
    this.registerCommand('/help', this.handleHelp.bind(this));
    this.registerCommand('/status', this.handleStatus.bind(this));
    this.registerCommand('/carriers', this.handleCarriers.bind(this));
    this.registerCommand('/orders', this.handleOrders.bind(this));
    this.registerCommand('/report', this.handleReport.bind(this));
    this.registerCommand('/settings', this.handleSettings.bind(this));

    // Setup bot command listeners
    if (this.bot) {
      this.bot.on('message', (msg) => {
        this.handleMessage(msg);
      });
    }
  }

  setupMessageHandlers() {
    if (this.bot) {
      this.bot.on('message', (msg) => {
        const chatId = msg.chat?.id;
        if (chatId) {
          console.log(`📨 [Telegram] Message from chatId: ${chatId}`);
        }
      });
    }
  }

  registerCommand(command, handler) {
    this.commandHandlers.set(command, handler);
  }

  handleMessage(msg) {
    const { text, chat } = msg;
    if (!text || !chat) return;

    const command = text.split(' ')[0].toLowerCase();
    const handler = this.commandHandlers.get(command);

    if (handler) {
      handler(msg);
    } else if (text.startsWith('/')) {
      this.sendMessage(
        chat.id,
        '❌ Lệnh không được hỗ trợ. Gõ /help để xem danh sách lệnh.'
      );
    }
  }

  async handleStart(msg) {
    const welcomeMessage = `🎉 *Chào mừng đến với MIA Logistics Manager!*

🤖 Tôi là bot hỗ trợ quản lý logistics của bạn.

📋 *Các lệnh có sẵn:*
/help - Xem hướng dẫn
/status - Trạng thái hệ thống
/carriers - Thống kê nhà vận chuyển
/orders - Thống kê đơn hàng
/report - Báo cáo nhanh
/settings - Cài đặt thông báo

💡 Gõ /help để biết thêm chi tiết!`;

    await this.sendMessage(msg.chat.id, welcomeMessage);
  }

  async handleHelp(msg) {
    const helpMessage = `📚 *Hướng dẫn sử dụng MIA Logistics Bot*

🔧 *Lệnh cơ bản:*
/start - Khởi động bot
/help - Hiển thị hướng dẫn này
/status - Kiểm tra trạng thái hệ thống

📊 *Lệnh thống kê:*
/carriers - Xem thống kê nhà vận chuyển
/orders - Xem thống kê đơn hàng
/report - Báo cáo tổng quan

⚙️ *Lệnh cài đặt:*
/settings - Cài đặt thông báo

📱 *Thông báo tự động:*
• Cập nhật nhà vận chuyển
• Thay đổi trạng thái đơn hàng
• Báo cáo hàng ngày/tuần/tháng
• Cảnh báo hệ thống

💬 *Hỗ trợ:* Liên hệ admin nếu cần hỗ trợ thêm.`;

    await this.sendMessage(msg.chat.id, helpMessage);
  }

  async handleStatus(msg) {
    const statusMessage = `🟢 *Trạng thái Hệ thống*

📊 **Tổng quan:**
• Nhà vận chuyển: 2 (1 active)
• Đơn hàng: 0
• Hệ thống: Hoạt động bình thường

⏰ **Cập nhật lần cuối:** ${new Date().toLocaleString('vi-VN')}

🔔 **Thông báo:** Đang hoạt động
📧 **Email:** ${notificationConfig.email.sendgrid.enabled ? '✅' : '❌'}
🌐 **Webhook:** ${notificationConfig.telegram.webhookUrl ? '✅' : '❌ (Polling)'}`;

    await this.sendMessage(msg.chat.id, statusMessage);
  }

  async handleCarriers(msg) {
    const carriersMessage = `🚚 *Thống kê Nhà vận chuyển*

📋 **Tổng số:** 2 nhà vận chuyển

✅ **Đang hoạt động:** 2
❌ **Tạm ngưng:** 0

📊 **Theo khu vực:**
• Toàn quốc: 1
• Miền Nam: 1

💰 **Theo phương thức tính giá:**
• PER_KM: 1
• PER_M3: 1

📈 **Đánh giá trung bình:** 4.35/5.0`;

    await this.sendMessage(msg.chat.id, carriersMessage);
  }

  async handleOrders(msg) {
    const ordersMessage = `📦 *Thống kê Đơn hàng*

📋 **Tổng số:** 0 đơn hàng

📊 **Theo trạng thái:**
• Chờ xử lý: 0
• Đang vận chuyển: 0
• Đã giao: 0
• Đã hủy: 0

💰 **Doanh thu hôm nay:** 0 VNĐ
📈 **So với hôm qua:** 0%`;

    await this.sendMessage(msg.chat.id, ordersMessage);
  }

  async handleReport(msg) {
    const reportMessage = `📊 *Báo cáo Nhanh - ${new Date().toLocaleDateString('vi-VN')}*

🚚 **Nhà vận chuyển:**
• Tổng: 2
• Active: 2
• Inactive: 0

📦 **Đơn hàng:**
• Tổng: 0
• Hôm nay: 0
• Tuần này: 0

💰 **Tài chính:**
• Doanh thu hôm nay: 0 VNĐ
• Doanh thu tuần: 0 VNĐ
• Doanh thu tháng: 0 VNĐ

📈 **Hiệu suất:**
• Tỷ lệ giao hàng thành công: N/A
• Thời gian giao hàng trung bình: N/A`;

    await this.sendMessage(msg.chat.id, reportMessage);
  }

  async handleSettings(msg) {
    const settingsMessage = `⚙️ *Cài đặt Thông báo*

🔔 **Kênh thông báo:**
• Telegram: ✅
• Email: ${notificationConfig.email.sendgrid.enabled ? '✅' : '❌'}
• Real-time: ✅

📅 **Lịch báo cáo:**
• Hàng ngày: 8:00 AM ✅
• Hàng tuần: Thứ 2, 9:00 AM ✅
• Hàng tháng: Ngày 1, 10:00 AM ✅

🔧 **Để thay đổi cài đặt:**
Liên hệ admin để cập nhật cấu hình.`;

    await this.sendMessage(msg.chat.id, settingsMessage);
  }

  async sendMessage(chatId, text, options = {}) {
    if (!this.bot || !this.isInitialized) {
      console.error('❌ Telegram bot not initialized');
      return false;
    }

    try {
      const defaultOptions = {
        disable_web_page_preview: true,
      };

      await this.bot.sendMessage(chatId, text, {
        ...defaultOptions,
        ...options,
      });
      return true;
    } catch (error) {
      console.error('❌ Telegram send message error:', error);
      return false;
    }
  }

  // Debug helper: return error details to caller
  async sendMessageDebug(chatId, text, options = {}) {
    if (!this.bot || !this.isInitialized) {
      return { ok: false, error: 'Telegram bot not initialized' };
    }
    try {
      const defaultOptions = { disable_web_page_preview: true };
      const res = await this.bot.sendMessage(chatId, text, {
        ...defaultOptions,
        ...options,
      });
      return { ok: true, result: res };
    } catch (error) {
      const errMsg = error?.response?.body || error?.message || String(error);
      return { ok: false, error: errMsg };
    }
  }

  async sendNotification(template, data, priority = 'medium') {
    const channels =
      notificationConfig.channels[priority] ||
      notificationConfig.channels.medium;

    if (channels.includes('telegram')) {
      const chatId = notificationConfig.telegram.chatId;
      const message = this.formatTemplate(template, data);

      if (message) {
        await this.sendMessage(chatId, message);
      }
    }
  }

  formatTemplate(templateName, data) {
    const template = notificationConfig.templates[templateName];
    if (!template || !template.telegram) return null;

    let message = template.telegram;

    // Replace placeholders with actual data
    Object.keys(data).forEach((key) => {
      const placeholder = `{${key}}`;
      message = message.replace(
        new RegExp(placeholder, 'g'),
        data[key] || 'N/A'
      );
    });

    return message;
  }

  // Webhook handler for production
  handleWebhook(req, res) {
    if (!this.bot) {
      return res.sendStatus(500);
    }

    try {
      this.bot.processUpdate(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.sendStatus(500);
    }
  }

  // Get bot info
  getBotInfo() {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!notificationConfig.telegram.token,
      webhookUrl: notificationConfig.telegram.webhookUrl,
      chatId: notificationConfig.telegram.chatId,
    };
  }
}

export default new TelegramService();
