/**
 * Tạo / cập nhật khối biến Google trong `.env` từ file JSON service account.
 *
 * Đường dẫn JSON (ưu tiên):
 *   1. Tham số CLI: node scripts/create-env-from-json.js path/to/key.json
 *   2. GOOGLE_SERVICE_ACCOUNT_JSON hoặc GOOGLE_APPLICATION_CREDENTIALS (file tồn tại)
 *   3. config/google-credentials.json
 *   4. automation/config/google-credentials.json | service_account.json
 *
 * Sheet ID (tuỳ chọn): tham số thứ 2 — mặc định placeholder your_spreadsheet_id
 *
 * Không nhúng token Telegram / SendGrid thật; điền thủ công theo .env.example.
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
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
};

const REPO_ROOT = path.join(__dirname, "..");

function toPosixRel(fromRoot, absPath) {
  const rel = path.relative(fromRoot, absPath);
  if (rel.startsWith("..")) return absPath;
  return rel.split(path.sep).join("/");
}

function privateKeyForEnvLine(pk) {
  return String(pk || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"');
}

function findServiceAccountJson(cliPath) {
  const candidates = [
    cliPath,
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(REPO_ROOT, "config", "google-credentials.json"),
    path.join(REPO_ROOT, "automation", "config", "google-credentials.json"),
    path.join(REPO_ROOT, "automation", "config", "service_account.json"),
  ].filter(Boolean);

  const seen = new Set();
  for (const p of candidates) {
    const abs = path.isAbsolute(p) ? path.normalize(p) : path.join(REPO_ROOT, p);
    if (seen.has(abs)) continue;
    seen.add(abs);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

function buildEnvSnippet(serviceAccount, jsonAbsPath, spreadsheetId) {
  const credRel = toPosixRel(REPO_ROOT, jsonAbsPath);
  const pk = privateKeyForEnvLine(serviceAccount.private_key);

  return `# --- Google (tạo bởi scripts/create-env-from-json.js) ---
GOOGLE_APPLICATION_CREDENTIALS=${credRel}
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=${credRel}
GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccount.client_email}
GOOGLE_PRIVATE_KEY="${pk}"
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=${spreadsheetId}
REACT_APP_GOOGLE_SHEET_ID=${spreadsheetId}
REACT_APP_GOOGLE_SHEETS_ID=${spreadsheetId}
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=${spreadsheetId}
GOOGLE_PROJECT_ID=${serviceAccount.project_id}
GOOGLE_PRIVATE_KEY_ID=${serviceAccount.private_key_id || ""}
GOOGLE_CLIENT_ID=${serviceAccount.client_id || ""}
GOOGLE_AUTH_URI=${serviceAccount.auth_uri || ""}
GOOGLE_TOKEN_URI=${serviceAccount.token_uri || ""}
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=${serviceAccount.auth_provider_x509_cert_url || ""}
GOOGLE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url || ""}
GOOGLE_UNIVERSE_DOMAIN=${serviceAccount.universe_domain || "googleapis.com"}
# --- /Google ---
`;
}

function createEnvFromJson() {
  log.header("🔧 TẠO .ENV — KHỐI GOOGLE TỪ SERVICE ACCOUNT JSON");

  const cliJson = process.argv[2];
  const cliSheet = process.argv[3] || "your_spreadsheet_id";

  const jsonPath = findServiceAccountJson(cliJson);
  if (!jsonPath) {
    log.error("Không tìm thấy file JSON service account.");
    log.info("Gợi ý: đặt key tại config/google-credentials.json hoặc chạy:");
    log.info("  node scripts/create-env-from-json.js path/to/key.json [SPREADSHEET_ID]");
    return false;
  }

  log.step(`Đọc: ${jsonPath}`);
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (e) {
    log.error(`JSON không hợp lệ: ${e.message}`);
    return false;
  }

  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    log.error("JSON thiếu client_email hoặc private_key.");
    return false;
  }

  const envPath = path.join(REPO_ROOT, ".env");
  const snippet = buildEnvSnippet(serviceAccount, jsonPath, cliSheet);

  let merged = snippet;
  if (fs.existsSync(envPath)) {
    const existing = fs.readFileSync(envPath, "utf8");
    const marker =
      /# --- Google \(tạo bởi scripts\/create-env-from-json\.js\) ---[\s\S]*?# --- \/Google ---\n?/;
    if (marker.test(existing)) {
      merged = existing.replace(marker, snippet);
      log.info("Đã thay khối Google có marker trong .env hiện có.");
    } else {
      merged = `${existing.trimEnd()}\n\n${snippet}`;
      log.info("Đã nối khối Google vào cuối .env hiện có.");
    }
  } else {
    merged = `${snippet}
# --- Phần còn lại: sao chép từ .env.example và điền your_* ---
BACKEND_PORT=3001
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:8000

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your@email.com
`;
    log.warning("Chưa có .env — tạo mới tối thiểu + placeholder; bổ sung từ .env.example.");
  }

  fs.writeFileSync(envPath, merged.endsWith("\n") ? merged : `${merged}\n`);
  log.success(`Đã ghi: ${envPath}`);

  log.header("📋 ĐÃ GHI (không in private key / token)");
  log.success(`client_email: ${serviceAccount.client_email}`);
  log.success(`project_id: ${serviceAccount.project_id}`);
  log.success(`credentials file (relative repo): ${toPosixRel(REPO_ROOT, jsonPath)}`);
  log.success(`REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID: ${cliSheet}`);

  log.header("🚀 BƯỚC TIẾP");
  log.info("./scripts/check-env.sh");
  log.info("npm run test:google-sheets  (hoặc npm run test:google)");
  return true;
}

if (require.main === module) {
  const ok = createEnvFromJson();
  process.exit(ok ? 0 : 1);
}

module.exports = { createEnvFromJson, findServiceAccountJson, buildEnvSnippet };
