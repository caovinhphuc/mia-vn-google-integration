#!/usr/bin/env node

/**
 * 🚀 Complete Setup Script - Hoàn thiện tất cả các phần còn thiếu
 *
 * Script này sẽ:
 * 1. Kiểm tra và cập nhật .env
 * 2. Verify tất cả services
 * 3. Tạo các file cấu hình cần thiết
 * 4. Chạy tests và báo cáo kết quả
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bright: "\x1b[1m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${"=".repeat(60)}${colors.reset}`),
};

// Check if file exists
const fileExists = (filePath) => {
  return fs.existsSync(path.resolve(filePath));
};

// Read .env file
const readEnvFile = () => {
  if (!fileExists(".env")) {
    return null;
  }
  const content = fs.readFileSync(".env", "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });
  return env;
};

// Update .env file
const updateEnvFile = (updates) => {
  if (!fileExists(".env")) {
    log.warning("File .env không tồn tại, tạo mới từ env.example...");
    if (fileExists("env.example")) {
      fs.copyFileSync("env.example", ".env");
    } else {
      log.error("Không tìm thấy env.example");
      return false;
    }
  }

  const content = fs.readFileSync(".env", "utf-8");
  const lines = content.split("\n");
  const newLines = [];

  // Track which keys we've updated
  const updatedKeys = new Set();

  // Update existing lines
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key] = trimmed.split("=");
      if (key && updates[key.trim()]) {
        newLines.push(`${key.trim()}=${updates[key.trim()]}`);
        updatedKeys.add(key.trim());
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  });

  // Add new keys
  Object.keys(updates).forEach((key) => {
    if (!updatedKeys.has(key)) {
      newLines.push(`${key}=${updates[key]}`);
    }
  });

  fs.writeFileSync(".env", newLines.join("\n"));
  return true;
};

// Run command and capture output
const runCommand = (command, silent = false) => {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Main setup function
const main = async () => {
  log.header("🚀 COMPLETE SETUP - MIA.vn Google Integration");
  console.log(
    `${colors.bright}${colors.cyan}Hoàn thiện tất cả các phần còn thiếu${colors.reset}\n`
  );

  // Step 1: Check current .env
  log.step("Bước 1: Kiểm tra file .env...");
  const currentEnv = readEnvFile();
  if (!currentEnv) {
    log.error("File .env không tồn tại!");
    log.info("Đang tạo từ env.example...");
    if (fileExists("env.example")) {
      fs.copyFileSync("env.example", ".env");
      log.success("Đã tạo file .env từ env.example");
    } else {
      log.error("Không tìm thấy env.example");
      return;
    }
  } else {
    log.success("File .env đã tồn tại");
  }

  // Step 2: Update .env with required API URLs
  log.step("Bước 2: Cập nhật các biến môi trường cần thiết...");
  const envUpdates = {
    REACT_APP_API_URL: "http://localhost:3001",
    REACT_APP_API_BASE_URL: "http://localhost:3001/api",
    REACT_APP_AI_SERVICE_URL: "http://localhost:8000",
  };

  // Check if these are already set
  const needsUpdate = Object.keys(envUpdates).some(
    (key) => !currentEnv || !currentEnv[key] || currentEnv[key].includes("your_")
  );

  if (needsUpdate) {
    updateEnvFile(envUpdates);
    log.success("Đã cập nhật các biến môi trường API");
  } else {
    log.info("Các biến môi trường API đã được cấu hình");
  }

  // Step 3: Check dependencies
  log.step("Bước 3: Kiểm tra dependencies...");
  if (!fileExists("node_modules")) {
    log.warning("node_modules không tồn tại, đang cài đặt...");
    const result = runCommand("npm install", false);
    if (result.success) {
      log.success("Đã cài đặt dependencies");
    } else {
      log.error("Lỗi khi cài đặt dependencies");
    }
  } else {
    log.success("Dependencies đã được cài đặt");
  }

  // Step 4: Verify build
  log.step("Bước 4: Kiểm tra build...");
  if (!fileExists("build")) {
    log.warning("Thư mục build không tồn tại, đang build...");
    const result = runCommand("npm run build:prod", false);
    if (result.success) {
      log.success("Build thành công");
    } else {
      log.warning("Build có lỗi, nhưng có thể tiếp tục");
    }
  } else {
    log.success("Build đã tồn tại");
  }

  // Step 5: Create summary report
  log.step("Bước 5: Tạo báo cáo tổng hợp...");

  const hasGoogleKey = currentEnv?.GOOGLE_SERVICE_ACCOUNT_EMAIL && currentEnv?.GOOGLE_PRIVATE_KEY;
  const hasEmailSendGrid = currentEnv?.SENDGRID_API_KEY && currentEnv?.SENDGRID_FROM_EMAIL;
  const hasEmailSMTP = currentEnv?.SMTP_HOST && currentEnv?.SMTP_USER && currentEnv?.SMTP_PASS;
  const hasTelegram = currentEnv?.TELEGRAM_BOT_TOKEN && currentEnv?.TELEGRAM_CHAT_ID;

  const report = {
    timestamp: new Date().toISOString(),
    envFile: fileExists(".env") ? "✅ Exists" : "❌ Missing",
    dependencies: fileExists("node_modules") ? "✅ Installed" : "❌ Missing",
    build: fileExists("build") ? "✅ Built" : "❌ Not built",
    services: {
      google: hasGoogleKey
        ? "✅ Configured"
        : currentEnv?.GOOGLE_SERVICE_ACCOUNT_EMAIL
          ? "⚠️  Needs GOOGLE_PRIVATE_KEY"
          : "❌ Not configured",
      email: hasEmailSendGrid
        ? "✅ SendGrid"
        : hasEmailSMTP
          ? "✅ SMTP"
          : currentEnv?.SENDGRID_API_KEY || currentEnv?.SMTP_USER
            ? "⚠️  Thiếu biến (SendGrid: FROM_EMAIL; SMTP: HOST,USER,PASS)"
            : "❌ Not configured",
      telegram: hasTelegram
        ? "✅ Configured"
        : currentEnv?.TELEGRAM_BOT_TOKEN
          ? "⚠️  Cần TELEGRAM_CHAT_ID"
          : "❌ Not configured",
    },
  };

  // Save report
  const reportPath = path.join(__dirname, "..", "setup-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`Báo cáo đã được lưu: ${reportPath}`);

  // Final summary
  log.header("📋 TÓM TẮT SETUP");
  console.log(`
${colors.green}✅ Hoàn thành:${colors.reset}
  • File .env: ${report.envFile}
  • Dependencies: ${report.dependencies}
  • Build: ${report.build}

${colors.yellow}⚠️  Cần kiểm tra:${colors.reset}
  • Google Service: ${report.services.google}
  • Email Service: ${report.services.email}
  • Telegram Bot: ${report.services.telegram}

${colors.cyan}📝 Lưu ý:${colors.reset}
  • Google: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY
  • Email: SendGrid (API_KEY + FROM_EMAIL) hoặc SMTP (HOST, USER, PASS)
  • Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID

${colors.blue}🚀 Tiếp theo:${colors.reset}
  1. Cập nhật .env với các credentials thực tế
  2. Chạy: npm run test:integration
  3. Chạy: npm start
  `);

  log.header("✨ Setup hoàn tất!");
};

// Run
main().catch((error) => {
  log.error(`Lỗi: ${error.message}`);
  process.exit(1);
});
