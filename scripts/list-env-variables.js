#!/usr/bin/env node

/**
 * Liệt kê biến môi trường từ file mẫu (parse dòng KEY=value).
 *
 * Cách chạy:
 *   node scripts/list-env-variables.js
 *   node scripts/list-env-variables.js --file .env.example
 *
 * Kiểm tra thực tế (đã source .env): ./scripts/check-env.sh
 */

const fs = require("fs");
const path = require("path");
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  header: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
  item: (name, desc, required = false) => {
    const req = required
      ? `${colors.red}[BẮT BUỘC]${colors.reset}`
      : `${colors.yellow}[TÙY CHỌN]${colors.reset}`;
    console.log(`  ${req} ${colors.green}${name}${colors.reset}`);
    if (desc) console.log(`    ${desc}`);
  },
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
};

function readEnvExample(explicitFile) {
  const root = path.join(__dirname, "..");
  const candidates = explicitFile
    ? [path.isAbsolute(explicitFile) ? explicitFile : path.join(root, explicitFile)]
    : [path.join(root, ".env.example"), path.join(root, "env.example")];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      log.info(`Đang đọc: ${path.relative(root, envPath) || "."}`);
      return fs.readFileSync(envPath, "utf-8");
    }
  }
  log.info(`Không tìm thấy file (${candidates.map((p) => path.relative(root, p)).join(", ")})`);
  return null;
}

function looksLikePlaceholder(value) {
  const v = String(value).trim().toLowerCase();
  if (!v || v === '""' || v === "''") return true;
  const hints = [
    "your_",
    "your-",
    "your@",
    "optional",
    "replace_",
    "changeme",
    "todo",
    "xxx",
    "here",
    "dummy",
    "example.com",
    "path/to/",
    "/to/service-account",
  ];
  return hints.some((h) => v.includes(h));
}

function parseEnvFile(content) {
  const variables = [];
  const lines = content.split("\n");
  let currentSection = "General";

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments và empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      if (trimmed.startsWith("#") && trimmed.length > 1) {
        currentSection = trimmed.replace(/^#+\s*/, "");
      }
      continue;
    }

    // Parse variable
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const [, name, raw] = match;
      const value = raw.replace(/^["']|["']$/g, "");
      const required = !looksLikePlaceholder(raw);
      variables.push({
        name,
        value,
        section: currentSection,
        required,
      });
    }
  }

  return variables;
}

function categorizeVariables(variables) {
  const categories = {
    "Google Services": [],
    Telegram: [],
    Email: [],
    Other: [],
  };

  variables.forEach((v) => {
    const name = v.name.toUpperCase();
    if (name.includes("GOOGLE")) {
      categories["Google Services"].push(v);
    } else if (name.includes("TELEGRAM")) {
      categories["Telegram"].push(v);
    } else if (name.includes("EMAIL") || name.includes("SMTP") || name.includes("SENDGRID")) {
      categories["Email"].push(v);
    } else {
      categories["Other"].push(v);
    }
  });

  return categories;
}

function displayVariables(explicitFile) {
  log.header("📋 DANH SÁCH ENVIRONMENT VARIABLES CẦN CẤU HÌNH");
  console.log("=".repeat(60));

  const content = readEnvExample(explicitFile);
  if (!content) {
    log.info("Không thể đọc file env.example");
    return;
  }

  const variables = parseEnvFile(content);
  const categories = categorizeVariables(variables);

  // Required variables
  log.section("\n🔴 BẮT BUỘC - Các biến quan trọng nhất:");
  const required = variables.filter((v) => v.required);
  required.forEach((v) => {
    log.item(v.name, `Giá trị mẫu: ${v.value.substring(0, 50)}...`, true);
  });

  // Google Services
  if (categories["Google Services"].length > 0) {
    log.section("\n📊 Google Services:");
    categories["Google Services"].forEach((v) => {
      log.item(v.name, v.required ? "Bắt buộc cho Google integration" : "Tùy chọn");
    });
  }

  // Telegram
  if (categories["Telegram"].length > 0) {
    log.section("\n💬 Telegram Bot:");
    categories["Telegram"].forEach((v) => {
      log.item(v.name, v.required ? "Bắt buộc cho Telegram bot" : "Tùy chọn");
    });
  }

  // Email
  if (categories["Email"].length > 0) {
    log.section("\n📧 Email Services:");
    categories["Email"].forEach((v) => {
      log.item(v.name, v.required ? "Bắt buộc cho email service" : "Tùy chọn");
    });
  }

  // Other (CRA / API / WS / … — không còn ép mô tả "Tùy chọn" sai)
  if (categories["Other"].length > 0) {
    log.section("\n🔧 Other (API, CRA, port, Redis, …):");
    categories["Other"].forEach((v) => {
      const desc = v.required
        ? "Trong file mẫu: giá trị trông giống production (heuristic [BẮT BUỘC])"
        : "Tùy chọn / placeholder";
      log.item(v.name, desc, v.required);
    });
  }

  log.section("\n📌 Đồng bộ ./scripts/check-env.sh (local, đã source .env)");
  console.log(`
  ${colors.green}Frontend${colors.reset} — đủ một trong các nhóm:
    • API: VITE_API_URL  HOẶC  REACT_APP_API_URL  HOẶC  REACT_APP_API_BASE_URL
    • Sheet ID: VITE_GOOGLE_SHEETS_SPREADSHEET_ID  HOẶC  REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID  HOẶC
      REACT_APP_GOOGLE_SHEET_ID  HOẶC  GOOGLE_SHEETS_ID …
    • Tuỳ chọn (giống log terminal): VITE_GOOGLE_DRIVE_FOLDER_ID, REACT_APP_GOOGLE_DRIVE_FOLDER_ID,
      VITE_GOOGLE_APPS_SCRIPT_URL, VITE_FEATURE_GOOGLE_SHEETS, VITE_FEATURE_GOOGLE_DRIVE

  ${colors.green}Backend${colors.reset} — Google:
    • GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY  HOẶC  file JSON
      (GOOGLE_APPLICATION_CREDENTIALS / config/google-credentials.json / automation/config/…)
    • Tuỳ chọn local: SESSION_SECRET, CORS_ORIGIN, PORT (thường dùng BACKEND_PORT=3001 với CRA)
    • Deploy nghiêm (Vercel+Vite + Railway): CHECK_ENV_STRICT=1 ./scripts/check-env.sh
  `);

  // Instructions
  log.section("\n📝 HƯỚNG DẪN CẤU HÌNH:");
  console.log(`
  1. Sao chép mẫu: cp .env.example .env (hoặc env.example nếu dùng file đó)
  2. GitHub Actions: Settings → Secrets and variables → Actions → New repository secret
  3. Chi tiết: docs/GITHUB_ENV_VARIABLES_GUIDE.md
  4. Xác minh local sau khi điền: ./scripts/check-env.sh
  `);

  log.success(`Tổng cộng: ${variables.length} biến môi trường`);
  log.info(
    `Có ${required.length} biến gắn nhãn [BẮT BUỘC] (heuristic từ giá trị mẫu — không thay thế ./scripts/check-env.sh)`
  );
}

function parseArgs() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && args[i + 1]) return args[i + 1];
  }
  return null;
}

// Run
displayVariables(parseArgs());
