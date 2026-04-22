const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

function loadProjectEnv() {
  const files = [
    path.join(PROJECT_ROOT, ".env"),
    path.join(PROJECT_ROOT, ".env.local"),
    path.join(PROJECT_ROOT, "backend/.env"),
    path.join(PROJECT_ROOT, "automation/.env"),
  ];
  for (const p of files) {
    if (fs.existsSync(p)) require("dotenv").config({ path: p });
  }
}

loadProjectEnv();

function stripEnvQuotes(val) {
  if (val == null || val === "") return "";
  let s = String(val).trim();
  if (s.length >= 2) {
    const a = s[0];
    const b = s[s.length - 1];
    if ((a === '"' && b === '"') || (a === "'" && b === "'")) s = s.slice(1, -1).trim();
  }
  return s;
}

function looksPlaceholderEmailSecret(v) {
  const s = stripEnvQuotes(v).toLowerCase();
  if (!s) return true;
  if (s.includes("your_") || s.includes("your-") || s.includes("changeme") || s === "xxx")
    return true;
  if (s.includes("replace_me") || s.includes("placeholder")) return true;
  return false;
}

/**
 * Ưu tiên SMTP (Gmail / provider). SendGrid chỉ là tùy chọn.
 * Mật khẩu: SMTP_PASS hoặc SMTP_PASSWORD (và alias EMAIL_* / MAIL_*).
 */
function resolveEmailFromEnv() {
  const sendgridApiKey = stripEnvQuotes(process.env.SENDGRID_API_KEY);
  const sendgridFromEmail = stripEnvQuotes(
    process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || ""
  );
  const sendgridFromName = stripEnvQuotes(process.env.SENDGRID_FROM_NAME || "");

  const smtpHost = stripEnvQuotes(
    process.env.SMTP_HOST ||
      process.env.MAIL_HOST ||
      process.env.EMAIL_SMTP_SERVER ||
      process.env.REACT_APP_SMTP_HOST ||
      ""
  );
  const smtpUser = stripEnvQuotes(
    process.env.SMTP_USER ||
      process.env.SMTP_USERNAME ||
      process.env.MAIL_USERNAME ||
      process.env.EMAIL_USER ||
      process.env.EMAIL_ADDRESS ||
      process.env.EMAIL_USERNAME ||
      ""
  );
  const smtpPass = stripEnvQuotes(
    process.env.SMTP_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.MAIL_PASSWORD ||
      process.env.EMAIL_PASS ||
      process.env.EMAIL_PASSWORD ||
      ""
  );

  const sgKeyOk = sendgridApiKey && !looksPlaceholderEmailSecret(sendgridApiKey);
  const sgFromOk = sendgridFromEmail && !looksPlaceholderEmailSecret(sendgridFromEmail);
  const hasSendGrid = !!(sgKeyOk && sgFromOk);

  const hostOk = smtpHost && !looksPlaceholderEmailSecret(smtpHost);
  const userOk = smtpUser && !looksPlaceholderEmailSecret(smtpUser);
  const passOk = smtpPass && !looksPlaceholderEmailSecret(smtpPass);
  const hasSMTP = !!(hostOk && userOk && passOk);

  return {
    sendgridApiKey: sgKeyOk ? sendgridApiKey : "",
    sendgridFromEmail: sgFromOk ? sendgridFromEmail : "",
    sendgridFromName,
    smtpHost: hostOk ? smtpHost : "",
    smtpUser: userOk ? smtpUser : "",
    smtpPass: passOk ? smtpPass : "",
    hasSendGrid,
    hasSMTP,
  };
}

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`),
};

class EmailTester {
  constructor() {
    this.results = [];
    const r = resolveEmailFromEnv();
    this.sendgridApiKey = r.sendgridApiKey;
    this.sendgridFromEmail = r.sendgridFromEmail;
    this.sendgridFromName = r.sendgridFromName;
    this.smtpHost = r.smtpHost;
    this.smtpUser = r.smtpUser;
    this.smtpPass = r.smtpPass;
    this.emailFrom = stripEnvQuotes(
      process.env.EMAIL_FROM || this.sendgridFromEmail || this.smtpUser
    );
  }

  addResult(test, status, message, details = null) {
    this.results.push({
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    });

    const statusIcon = status === "success" ? "✅" : status === "error" ? "❌" : "⚠️";
    const color =
      status === "success" ? colors.green : status === "error" ? colors.red : colors.yellow;

    console.log(`${color}${statusIcon}${colors.reset} ${test}: ${message}`);

    if (details) {
      console.log(`   ${colors.dim}Details: ${JSON.stringify(details, null, 2)}${colors.reset}`);
    }
  }

  async checkEnvironmentVariables() {
    log.step("Kiểm tra Environment Variables...");

    const r = resolveEmailFromEnv();
    const { hasSendGrid, hasSMTP } = r;

    if (hasSendGrid || hasSMTP) {
      const available = [];
      if (hasSMTP) available.push("SMTP");
      if (hasSendGrid) available.push("SendGrid (tùy chọn)");

      this.addResult("environment-check", "success", `Đã cấu hình: ${available.join(" + ")}`, {
        smtp: hasSMTP,
        sendgrid: hasSendGrid,
        available_methods: available,
      });
      return { hasSendGrid, hasSMTP };
    }

    const rawHost = stripEnvQuotes(
      process.env.SMTP_HOST ||
        process.env.MAIL_HOST ||
        process.env.EMAIL_SMTP_SERVER ||
        process.env.REACT_APP_SMTP_HOST ||
        ""
    );
    const rawUser = stripEnvQuotes(
      process.env.SMTP_USER ||
        process.env.SMTP_USERNAME ||
        process.env.MAIL_USERNAME ||
        process.env.EMAIL_USER ||
        process.env.EMAIL_ADDRESS ||
        process.env.EMAIL_USERNAME ||
        ""
    );
    const rawPass = stripEnvQuotes(
      process.env.SMTP_PASS ||
        process.env.SMTP_PASSWORD ||
        process.env.MAIL_PASSWORD ||
        process.env.EMAIL_PASS ||
        process.env.EMAIL_PASSWORD ||
        ""
    );

    const smtpThieu = [];
    if (!rawHost || looksPlaceholderEmailSecret(rawHost)) {
      smtpThieu.push("host: SMTP_HOST | MAIL_HOST | EMAIL_SMTP_SERVER");
    }
    if (!rawUser || looksPlaceholderEmailSecret(rawUser)) {
      smtpThieu.push("user: SMTP_USER | SMTP_USERNAME | EMAIL_ADDRESS | EMAIL_USER | …");
    }
    if (!rawPass || looksPlaceholderEmailSecret(rawPass)) {
      smtpThieu.push("pass: SMTP_PASS | SMTP_PASSWORD | EMAIL_PASSWORD | EMAIL_PASS | …");
    }

    this.addResult(
      "environment-check",
      "error",
      "Chưa đủ SMTP (ưu tiên). SendGrid không bắt buộc.",
      {
        hint: "Chỉ cần đủ bộ SMTP: host + user + mật khẩu (SMTP_PASS hoặc SMTP_PASSWORD). EMAIL_FROM dùng làm From khi gửi.",
        smtp_thieu: smtpThieu,
        sendgrid_tuy_chon:
          "Nếu sau này dùng SendGrid: SENDGRID_API_KEY + (SENDGRID_FROM_EMAIL hoặc EMAIL_FROM).",
      }
    );
    return { hasSendGrid: false, hasSMTP: false };
  }

  async testSendGridConnection() {
    log.step("Test SendGrid API connection...");

    if (!this.sendgridApiKey) {
      this.addResult("sendgrid-connection", "warning", "SendGrid API key không được cấu hình");
      return false;
    }

    try {
      // Test SendGrid API với HTTP request
      const axios = require("axios");

      const response = await axios.get("https://api.sendgrid.com/v3/user/profile", {
        headers: {
          Authorization: `Bearer ${this.sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        this.addResult("sendgrid-connection", "success", "SendGrid API connection successful", {
          username: response.data.username,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
        });
        return true;
      }
    } catch (error) {
      let errorMessage = error.message;
      const errorDetails = { error: error.message };

      if (error.response) {
        errorMessage = `SendGrid API error: ${error.response.status} - ${error.response.statusText}`;
        errorDetails.status = error.response.status;
        errorDetails.response = error.response.data;
      }

      this.addResult(
        "sendgrid-connection",
        "error",
        `SendGrid connection failed: ${errorMessage}`,
        errorDetails
      );
      return false;
    }
  }

  async testSMTPConnection() {
    log.step("Test SMTP connection...");

    if (!this.smtpHost || !this.smtpUser || !this.smtpPass) {
      this.addResult("smtp-connection", "warning", "SMTP credentials không đầy đủ");
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass,
        },
      });

      // Test connection
      await transporter.verify();

      this.addResult("smtp-connection", "success", "SMTP connection successful", {
        host: this.smtpHost,
        port: process.env.SMTP_PORT || 587,
        user: this.smtpUser,
        secure: process.env.SMTP_SECURE === "true",
      });
      return true;
    } catch (error) {
      this.addResult("smtp-connection", "error", `SMTP connection failed: ${error.message}`, {
        error: error.message,
      });
      return false;
    }
  }

  async sendTestEmailViaSendGrid() {
    log.step("Gửi test email qua SendGrid...");

    if (!this.sendgridApiKey) {
      this.addResult("sendgrid-test-email", "warning", "Bỏ qua test SendGrid - không có API key");
      return false;
    }

    try {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(this.sendgridApiKey);

      const testEmail = {
        to: this.sendgridFromEmail, // Gửi về chính email của mình để test
        from: {
          email: this.sendgridFromEmail,
          name: this.sendgridFromName || "MIA Logistics",
        },
        subject: "🧪 Test Email từ MIA Logistics System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🧪 Test Email - MIA Logistics</h2>
            <p>Đây là email test từ hệ thống MIA.vn Google Integration.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">📊 Thông tin hệ thống:</h3>
              <ul style="color: #6b7280;">
                <li><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</li>
                <li><strong>Service:</strong> SendGrid API</li>
                <li><strong>From:</strong> ${this.sendgridFromEmail}</li>
                <li><strong>Status:</strong> ✅ Hoạt động bình thường</li>
              </ul>
            </div>

            <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; color: #166534;">
                <strong>✅ Kết quả:</strong> Email service hoạt động tốt và sẵn sàng gửi thông báo!
              </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Email này được gửi tự động từ MIA Logistics Integration System.<br>
              Nếu bạn nhận được email này, có nghĩa là hệ thống email đang hoạt động bình thường.
            </p>
          </div>
        `,
      };

      const response = await sgMail.send(testEmail);

      this.addResult(
        "sendgrid-test-email",
        "success",
        "Test email đã được gửi thành công qua SendGrid",
        {
          message_id: response[0].headers["x-message-id"],
          to: testEmail.to,
          from: testEmail.from.email,
          subject: testEmail.subject,
        }
      );
      return true;
    } catch (error) {
      let errorMessage = error.message;
      const errorDetails = { error: error.message };

      if (error.response && error.response.body) {
        errorMessage = `SendGrid error: ${error.response.body.errors?.[0]?.message || error.message}`;
        errorDetails.response = error.response.body;
      }

      this.addResult(
        "sendgrid-test-email",
        "error",
        `Không thể gửi email qua SendGrid: ${errorMessage}`,
        errorDetails
      );
      return false;
    }
  }

  async sendTestEmailViaSMTP() {
    log.step("Gửi test email qua SMTP...");

    if (!this.smtpHost || !this.smtpUser || !this.smtpPass) {
      this.addResult("smtp-test-email", "warning", "Bỏ qua test SMTP - thiếu credentials");
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass,
        },
      });

      const testEmail = {
        from: `"${this.sendgridFromName || "MIA Logistics"}" <${this.emailFrom || this.smtpUser}>`,
        to: this.smtpUser, // Gửi về chính email của mình để test
        subject: "🧪 Test Email từ MIA Logistics System (SMTP)",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🧪 Test Email - MIA Logistics (SMTP)</h2>
            <p>Đây là email test từ hệ thống MIA.vn Google Integration qua SMTP.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">📊 Thông tin hệ thống:</h3>
              <ul style="color: #6b7280;">
                <li><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</li>
                <li><strong>Service:</strong> SMTP (${this.smtpHost})</li>
                <li><strong>From:</strong> ${this.emailFrom || this.smtpUser}</li>
                <li><strong>Status:</strong> ✅ Hoạt động bình thường</li>
              </ul>
            </div>

            <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; color: #166534;">
                <strong>✅ Kết quả:</strong> SMTP email service hoạt động tốt và sẵn sàng gửi thông báo!
              </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Email này được gửi tự động từ MIA Logistics Integration System.<br>
              Nếu bạn nhận được email này, có nghĩa là hệ thống SMTP đang hoạt động bình thường.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(testEmail);

      this.addResult("smtp-test-email", "success", "Test email đã được gửi thành công qua SMTP", {
        message_id: info.messageId,
        to: testEmail.to,
        from: testEmail.from,
        subject: testEmail.subject,
      });
      return true;
    } catch (error) {
      this.addResult("smtp-test-email", "error", `Không thể gửi email qua SMTP: ${error.message}`, {
        error: error.message,
      });
      return false;
    }
  }

  async runAllTests() {
    console.log(`${colors.bright}📧 EMAIL SERVICE TEST${colors.reset}`);
    console.log("=".repeat(50));

    // Check environment variables
    const envCheck = await this.checkEnvironmentVariables();
    if (!envCheck.hasSendGrid && !envCheck.hasSMTP) {
      console.log(
        `\n${colors.red}❌ Test dừng lại — chưa đủ SMTP (host + user + pass). SendGrid không bắt buộc.${colors.reset}`
      );
      return this.generateReport();
    }

    // Test connections (SMTP trước)
    if (envCheck.hasSMTP) {
      await this.testSMTPConnection();
    }

    if (envCheck.hasSendGrid) {
      await this.testSendGridConnection();
    }

    // Send test emails
    if (envCheck.hasSMTP) {
      await this.sendTestEmailViaSMTP();
    }

    if (envCheck.hasSendGrid) {
      await this.sendTestEmailViaSendGrid();
    }

    return this.generateReport();
  }

  generateReport() {
    const report = {
      title: "Email Service Test Report",
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.results.length,
        passed: this.results.filter((r) => r.status === "success").length,
        failed: this.results.filter((r) => r.status === "error").length,
        warnings: this.results.filter((r) => r.status === "warning").length,
      },
      configuration: {
        sendgrid_api_key: this.sendgridApiKey ? "configured" : "missing",
        sendgrid_from_email: this.sendgridFromEmail || "missing",
        smtp_host: this.smtpHost || "missing",
        smtp_user: this.smtpUser || "missing",
      },
      results: this.results,
    };

    console.log("\n" + "=".repeat(50));
    console.log(`${colors.bright}📊 KẾT QUA TEST${colors.reset}`);
    console.log("=".repeat(50));

    console.log(`${colors.green}✅ Passed: ${report.summary.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${report.summary.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Warnings: ${report.summary.warnings}${colors.reset}`);
    console.log(`📊 Total: ${report.summary.total_tests}`);

    // Save report
    const reportPath = `email-test-report-${new Date().toISOString().split("T")[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report đã được lưu: ${reportPath}`);

    if (report.summary.failed > 0) {
      console.log(`\n${colors.red}❌ Có lỗi trong quá trình test email service${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`\n${colors.green}🎉 Email service test thành công!${colors.reset}`);
      process.exit(0);
    }
  }
}

// Main execution
async function main() {
  try {
    const tester = new EmailTester();
    await tester.runAllTests();
  } catch (error) {
    console.error(`${colors.red}❌ Lỗi không mong muốn: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = EmailTester;
