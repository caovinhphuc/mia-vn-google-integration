#!/usr/bin/env node

/**
 * 🏥 React Google Integration - Health Check Script
 *
 * Script kiểm tra sức khỏe của ứng dụng và các services
 * Bao gồm: Google APIs, Email service, Telegram, Database connections
 */

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
  for (let i = 0; i < files.length; i++) {
    const p = files[i];
    if (!fs.existsSync(p)) continue;
    require("dotenv").config({ path: p, override: i > 0 });
  }
}
loadProjectEnv();

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Console logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
};

// Health check results
const healthResults = {
  timestamp: new Date().toISOString(),
  overall: "healthy",
  services: {},
  errors: [],
  warnings: [],
};

// Utility functions
const addResult = (service, status, message, details = null) => {
  healthResults.services[service] = {
    status,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  if (status === "error") {
    healthResults.errors.push({ service, message, details });
    healthResults.overall = "unhealthy";
  } else if (status === "warning") {
    healthResults.warnings.push({ service, message, details });
    if (healthResults.overall === "healthy") {
      healthResults.overall = "degraded";
    }
  }
};

function stripEnvQuotes(val) {
  if (val == null || val === "") return val;
  const t = String(val).trim();
  if (t.length >= 2) {
    const a = t[0];
    const b = t[t.length - 1];
    if ((a === '"' && b === '"') || (a === "'" && b === "'")) return t.slice(1, -1).trim();
  }
  return t;
}

function normalizeTelegramBotToken(raw) {
  let t = stripEnvQuotes(raw);
  if (!t) return "";
  t = String(t).replace(/\s/g, "").trim();
  const urlMatch = t.match(/(?:https?:)?\/\/api\.telegram\.org\/bot([^/?\s#]+)/i);
  if (urlMatch) return urlMatch[1].trim();
  if (/^bot\d+:/i.test(t)) t = t.replace(/^bot/i, "");
  return t.trim();
}

function isPlaceholderTelegramToken(t) {
  const s = normalizeTelegramBotToken(t).toLowerCase();
  if (!s) return true;
  if (s.includes("your_") || s.includes("your-") || s.includes("changeme") || s === "xxx") return true;
  return false;
}

function resolveGoogleCredentialJsonFile() {
  const raw = stripEnvQuotes(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
      process.env.GOOGLE_CREDENTIALS_PATH ||
      ""
  );
  if (raw) {
    const p = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
    if (fs.existsSync(p)) return { path: p, fromEnv: raw };
  }
  const defaults = [
    "config/google-credentials.json",
    "automation/config/google-credentials.json",
    "automation/config/service_account.json",
  ];
  for (const rel of defaults) {
    const p = path.resolve(process.cwd(), rel);
    if (fs.existsSync(p)) return { path: p, fromEnv: null };
  }
  return { path: null, fromEnv: raw || null };
}

const checkEnvironmentVariables = () => {
  log.step("Kiểm tra Environment Variables...");

  const sheetId =
    process.env.REACT_APP_GOOGLE_SHEET_ID ||
    process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_ID;

  const { path: credResolved, fromEnv: credFromEnv } = resolveGoogleCredentialJsonFile();
  const hasCredFile = Boolean(credResolved);

  const clientEmail = stripEnvQuotes(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.REACT_APP_GOOGLE_CLIENT_EMAIL || ""
  );
  const privateKeyRaw = stripEnvQuotes(
    process.env.GOOGLE_PRIVATE_KEY || process.env.REACT_APP_GOOGLE_PRIVATE_KEY || ""
  );
  const hasInlinePem = Boolean(privateKeyRaw && String(privateKeyRaw).includes("BEGIN"));

  const googleCredsOk = hasCredFile || (clientEmail && hasInlinePem);
  const googleOk = Boolean(sheetId && googleCredsOk);

  if (!googleOk) {
    const missing = [];
    if (!sheetId) {
      missing.push(
        "Spreadsheet ID: REACT_APP_GOOGLE_SHEET_ID hoặc REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID hoặc GOOGLE_SHEETS_ID"
      );
    }
    if (!googleCredsOk) {
      const hint = credFromEnv
        ? `biến path "${credFromEnv}" không trỏ tới file tồn tại`
        : "chưa có GOOGLE_* path hoặc file không tồn tại";
      missing.push(
        `Credentials (${hint}). Cần JSON đúng HOẶC email + GOOGLE_PRIVATE_KEY (PEM). Script cũng tự tìm: config/google-credentials.json, automation/config/google-credentials.json, automation/config/service_account.json`
      );
    }
    addResult("environment", "error", `Thiếu cấu hình Google: ${missing.join("; ")}`);
    return false;
  }

  const optionalVars = [
    "REACT_APP_GOOGLE_MAPS_API_KEY",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "SENDGRID_API_KEY",
    "EMAIL_FROM",
    "SMTP_USER",
    "SMTP_PASS",
    "REDIS_URL",
  ];
  const missingOptional = optionalVars.filter((varName) => !process.env[varName]);

  // Không dùng warning ở đây: hầu hết dev local không cần Maps/Telegram/Email/Redis → tránh overall "degraded".
  if (missingOptional.length > 0) {
    log.info(
      `Tích hợp tùy chọn chưa đặt (${missingOptional.length} biến): ${missingOptional.join(", ")} — bình thường nếu không dùng. Muốn coi là cảnh báo CI: HEALTH_CHECK_WARN_OPTIONAL=1`
    );
    if (process.env.HEALTH_CHECK_WARN_OPTIONAL === "1") {
      addResult("environment", "warning", `Optional chưa đặt: ${missingOptional.join(", ")}`);
    } else {
      addResult(
        "environment",
        "healthy",
        `Google (bắt buộc) OK; ${missingOptional.length} biến tích hợp tùy chọn chưa đặt`,
        { optionalMissing: missingOptional }
      );
    }
  } else {
    addResult("environment", "healthy", "Environment variables OK");
  }
  return true;
};

const checkGoogleSheetsAPI = async () => {
  log.step("Kiểm tra Google Sheets API...");

  try {
    const { GoogleAuth } = require("google-auth-library");
    const { google } = require("googleapis");

    const { path: credFile } = resolveGoogleCredentialJsonFile();

    let auth;
    if (credFile && fs.existsSync(credFile)) {
      auth = new GoogleAuth({
        keyFilename: credFile,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    } else {
      const pk = stripEnvQuotes(
        process.env.GOOGLE_PRIVATE_KEY || process.env.REACT_APP_GOOGLE_PRIVATE_KEY || ""
      );
      const credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID || process.env.REACT_APP_GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: pk ? pk.replace(/\\n/g, "\n") : undefined,
        client_email: stripEnvQuotes(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.REACT_APP_GOOGLE_CLIENT_EMAIL || ""
        ),
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      };
      auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Test connection
    const sheetId =
      process.env.REACT_APP_GOOGLE_SHEET_ID ||
      process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
      process.env.GOOGLE_SHEETS_ID;
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    addResult(
      "google-sheets",
      "healthy",
      `Connected to Google Sheets: "${response.data.properties.title}"`,
      {
        sheetId,
        title: response.data.properties.title,
        sheetsCount: response.data.sheets.length,
      }
    );

    return true;
  } catch (error) {
    addResult("google-sheets", "error", `Google Sheets API connection failed: ${error.message}`, {
      error: error.message,
      code: error.code,
    });
    return false;
  }
};

const checkGoogleDriveAPI = async () => {
  log.step("Kiểm tra Google Drive API...");

  try {
    const { GoogleAuth } = require("google-auth-library");
    const { google } = require("googleapis");

    const { path: credFile } = resolveGoogleCredentialJsonFile();

    let auth;
    if (credFile && fs.existsSync(credFile)) {
      auth = new GoogleAuth({
        keyFilename: credFile,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });
    } else {
      const getEnvVar = (reactAppName, fallbackName) =>
        process.env[reactAppName] || process.env[fallbackName];
      const credentials = {
        type: "service_account",
        project_id: getEnvVar("REACT_APP_GOOGLE_PROJECT_ID", "GOOGLE_PROJECT_ID"),
        private_key_id: getEnvVar("REACT_APP_GOOGLE_PRIVATE_KEY_ID", "GOOGLE_PRIVATE_KEY_ID"),
        private_key: getEnvVar("REACT_APP_GOOGLE_PRIVATE_KEY", "GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
        client_email: getEnvVar("REACT_APP_GOOGLE_CLIENT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        client_id: getEnvVar("REACT_APP_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID"),
        auth_uri: process.env.GOOGLE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.GOOGLE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL ||
          "https://www.googleapis.com/oauth2/v1/certs",
      };
      auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });
    }

    const authClient = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: authClient });

    // Test connection
    const response = await drive.about.get({ fields: "user" });

    addResult(
      "google-drive",
      "healthy",
      `Connected to Google Drive: ${response.data.user.displayName}`,
      {
        user: response.data.user.displayName,
        email: response.data.user.emailAddress,
      }
    );

    return true;
  } catch (error) {
    addResult("google-drive", "error", `Google Drive API connection failed: ${error.message}`, {
      error: error.message,
      code: error.code,
    });
    return false;
  }
};

const checkEmailService = async () => {
  log.step("Kiểm tra Email Service...");

  const emailUser = process.env.REACT_APP_EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.REACT_APP_EMAIL_PASS || process.env.SMTP_PASS;

  if (!process.env.SENDGRID_API_KEY && (!emailUser || !emailPass)) {
    const msg = "Email chưa cấu hình (SendGrid hoặc SMTP user/pass) — tuỳ chọn; phần environment đã liệt kê biến thiếu nếu bật HEALTH_CHECK_WARN_OPTIONAL=1";
    log.info(msg);
    addResult("email-service", "healthy", "Optional — email not configured", { skipped: true });
    return true;
  }

  try {
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: process.env.REACT_APP_EMAIL_SERVICE || process.env.SMTP_HOST || "gmail",
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Test connection
    await transporter.verify();

    addResult("email-service", "healthy", "Email service connection successful", {
      user: emailUser || process.env.REACT_APP_EMAIL_USER || process.env.EMAIL_FROM,
    });

    return true;
  } catch (error) {
    addResult("email-service", "error", `Email service connection failed: ${error.message}`, {
      error: error.message,
    });
    return false;
  }
};

const checkTelegramService = async () => {
  log.step("Kiểm tra Telegram Service...");

  const rawToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const botToken = normalizeTelegramBotToken(rawToken);
  const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || isPlaceholderTelegramToken(botToken)) {
    const msg =
      "Telegram chưa cấu hình (TELEGRAM_BOT_TOKEN / REACT_APP_TELEGRAM_BOT_TOKEN) — tuỳ chọn; biến token nằm trong danh sách optional của environment nếu bật HEALTH_CHECK_WARN_OPTIONAL=1";
    log.info(msg);
    addResult("telegram-service", "healthy", "Optional — Telegram not configured", {
      skipped: true,
      chatIdConfigured: Boolean(chatId),
    });
    return true;
  }

  try {
    const axios = require("axios");

    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`, {
      timeout: 10000,
      validateStatus: () => true,
    });

    if (response.status === 200 && response.data?.ok) {
      addResult(
        "telegram-service",
        "healthy",
        `Telegram bot connected: ${response.data.result.first_name}`,
        {
          botName: response.data.result.first_name,
          username: response.data.result.username,
        }
      );
      return true;
    }

    const http = response.status;
    const desc = response.data?.description || response.data?.error || "Unknown";
    throw new Error(`HTTP ${http}: ${desc}`);
  } catch (error) {
    const status = error.response?.status;
    const hint =
      status === 404 || status === 401 || String(error.message).includes("404")
        ? "Token sai / thừa tiền tố bot / có khoảng trắng / URL dán nhầm — lấy token từ @BotFather (dạng 123456789:AAH...)."
        : "Kiểm tra mạng và biến TELEGRAM_BOT_TOKEN.";
    log.warning(`   💡 ${hint}`);
    addResult("telegram-service", "error", `Telegram service connection failed: ${error.message}`, {
      error: error.message,
      httpStatus: status,
      hint,
    });
    return false;
  }
};

const checkFileSystem = () => {
  log.step("Kiểm tra File System...");

  const requiredFiles = ["package.json", ".env", "src/App.jsx"];

  const requiredDirs = ["src", "src/components", "src/services", "public"];

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));
  const missingDirs = requiredDirs.filter((dir) => !fs.existsSync(dir));

  if (missingFiles.length > 0 || missingDirs.length > 0) {
    addResult(
      "file-system",
      "error",
      `Missing files/directories: ${[...missingFiles, ...missingDirs].join(", ")}`
    );
    return false;
  }

  addResult("file-system", "healthy", "All required files and directories present");
  return true;
};

const checkDependencies = () => {
  log.step("Kiểm tra Dependencies...");

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const nodeModulesExists = fs.existsSync("node_modules");

    if (!nodeModulesExists) {
      addResult("dependencies", "error", "node_modules directory not found. Run npm install");
      return false;
    }

    // Check for critical dependencies
    const criticalDeps = ["react", "googleapis", "google-auth-library"];
    const missingDeps = criticalDeps.filter(
      (dep) => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );

    if (missingDeps.length > 0) {
      addResult(
        "dependencies",
        "warning",
        `Missing critical dependencies: ${missingDeps.join(", ")}`
      );
    } else {
      addResult("dependencies", "healthy", "All critical dependencies present");
    }

    return true;
  } catch (error) {
    addResult("dependencies", "error", `Error checking dependencies: ${error.message}`);
    return false;
  }
};

const generateHealthReport = () => {
  log.header("🏥 HEALTH CHECK REPORT");

  const statusColor = {
    healthy: colors.green,
    degraded: colors.yellow,
    unhealthy: colors.red,
  };

  console.log(`
${statusColor[healthResults.overall]
    }Overall Status: ${healthResults.overall.toUpperCase()}${colors.reset}
${colors.blue}Timestamp: ${healthResults.timestamp}${colors.reset}

${colors.cyan}📊 Service Status:${colors.reset}
`);

  Object.entries(healthResults.services).forEach(([service, result]) => {
    const statusIcon = {
      healthy: "✅",
      warning: "⚠️",
      error: "❌",
    };

    console.log(`${statusIcon[result.status]} ${service}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  if (healthResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  Warnings:${colors.reset}`);
    healthResults.warnings.forEach((warning) => {
      console.log(`   - ${warning.service}: ${warning.message}`);
    });
  }

  if (healthResults.errors.length > 0) {
    console.log(`\n${colors.red}❌ Errors:${colors.reset}`);
    healthResults.errors.forEach((error) => {
      console.log(`   - ${error.service}: ${error.message}`);
    });
  }

  // Recommendations
  console.log(`\n${colors.cyan}💡 Recommendations:${colors.reset}`);

  if (healthResults.overall === "unhealthy") {
    console.log("   - Fix all errors before deploying to production");
    console.log("   - Check environment variables configuration");
    console.log("   - Verify Google Service Account permissions");
  } else if (healthResults.overall === "degraded") {
    console.log("   - Address warnings for optimal performance");
    console.log("   - Consider configuring optional services");
  } else {
    console.log("   - All systems are healthy! Ready for production");
    console.log("   - Consider setting up monitoring and alerts");
  }

  // Save report to file
  const reportFile = `health-report-${new Date().toISOString().split("T")[0]}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(healthResults, null, 2));
  console.log(`\n${colors.blue}📄 Health report saved to: ${reportFile}${colors.reset}`);
};

const main = async () => {
  log.header("🏥 REACT GOOGLE INTEGRATION - HEALTH CHECK");

  try {
    // Run all health checks
    checkFileSystem();
    checkDependencies();
    checkEnvironmentVariables();

    // Only run API checks if environment is configured
    if (healthResults.services.environment?.status !== "error") {
      await checkGoogleSheetsAPI();
      await checkGoogleDriveAPI();
      await checkEmailService();
      await checkTelegramService();
    }

    // Generate and display report
    generateHealthReport();

    // Exit with appropriate code
    process.exit(healthResults.overall === "unhealthy" ? 1 : 0);
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGINT", () => {
  log.warning("\nHealth check interrupted");
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkGoogleSheetsAPI,
  checkGoogleDriveAPI,
  checkEmailService,
  checkTelegramService,
  checkFileSystem,
  checkDependencies,
  generateHealthReport,
};
