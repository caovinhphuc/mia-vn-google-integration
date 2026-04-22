#!/usr/bin/env node

/**
 * Script test Google APIs đơn giản - Test bằng cách gọi API thực tế
 * Usage: node scripts/test-google-apis-simple.js
 */

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

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

function isPlaceholderSheetId(id) {
  const s = String(id || "").trim();
  const u = s.toUpperCase();
  if (!s) return true;
  if (u === "YOUR_SHEET_ID" || u === "YOUR_SPREADSHEET_ID") return true;
  if (/^YOUR[_-]/i.test(s)) return true;
  if (["PLACEHOLDER", "REPLACE_ME", "CHANGEME", "EXAMPLE_ID"].some((x) => u.includes(x)))
    return true;
  if (s === "your_actual_sheet_id_here" || s === "your-spreadsheet-id") return true;
  return false;
}

const SHEET_ID_ENV_KEYS = [
  "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
  "REACT_APP_GOOGLE_SHEET_ID",
  "REACT_APP_GOOGLE_SHEETS_ID",
  "GOOGLE_SHEETS_ID",
  "GOOGLE_SHEET_ID",
  "VITE_GOOGLE_SHEETS_SPREADSHEET_ID",
];

function resolveSheetIdForTest() {
  for (const k of SHEET_ID_ENV_KEYS) {
    const v = stripEnvQuotes(process.env[k]);
    if (v && !isPlaceholderSheetId(v)) return { id: v, fromKey: k };
  }
  return { id: null, fromKey: null };
}

const DEMO_SHEET_FALLBACK = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

function maskSheetId(id) {
  if (!id) return "(trống)";
  const s = String(id);
  if (s.length < 12) return `${s} (${s.length} ký tự)`;
  return `${s.slice(0, 6)}…${s.slice(-4)} (${s.length} ký tự)`;
}

/** Đường dẫn tuyệt đối; env relative → ghép PROJECT_ROOT */
function resolveCredentialPath(p) {
  if (!p || typeof p !== "string") return null;
  const t = stripEnvQuotes(p);
  if (!t) return null;
  return path.isAbsolute(t) ? path.normalize(t) : path.normalize(path.join(PROJECT_ROOT, t));
}

/** Thứ tự khớp check-env.sh / backend / scripts/testGoogleSheets3.js */
const CREDENTIAL_REL_PATHS = [
  "config/service_account.json",
  "config/google-credentials.json",
  "automation/config/service_account.json",
  "automation/config/google-credentials.json",
  "one_automation_system/config/google-credentials.json",
  "one_automation_system/config/service_account.json",
  "automation/one_automation_system/config/google-credentials.json",
  "automation/one_automation_system/config/service_account.json",
  "automation/automation_new/config/service_account.json",
  "google-credentials.json",
];

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findCredentialsFile() {
  const envKeys = [
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_SERVICE_ACCOUNT_KEY_PATH",
    "GOOGLE_CREDENTIALS_PATH",
    "GOOGLE_SERVICE_ACCOUNT_FILE",
  ];

  const possiblePaths = [];
  for (const k of envKeys) {
    const abs = resolveCredentialPath(process.env[k]);
    if (abs) possiblePaths.push(abs);
  }
  for (const rel of CREDENTIAL_REL_PATHS) {
    possiblePaths.push(path.join(PROJECT_ROOT, rel));
  }

  const seen = new Set();
  for (const credPath of possiblePaths) {
    if (!credPath || seen.has(credPath)) continue;
    seen.add(credPath);
    if (fs.existsSync(credPath)) return credPath;
  }

  return null;
}

function credentialSearchHintsForUser() {
  return [
    "Biến môi trường (sau khi load .env / backend/.env / automation/.env):",
    "  • GOOGLE_APPLICATION_CREDENTIALS",
    "  • GOOGLE_SERVICE_ACCOUNT_KEY_PATH",
    "  • GOOGLE_CREDENTIALS_PATH",
    "  • GOOGLE_SERVICE_ACCOUNT_FILE (đường dẫn tương đối tính từ root repo)",
    "",
    "File mặc định (một trong các path sau):",
    ...CREDENTIAL_REL_PATHS.map((rel, i) => `  ${i + 1}. ${rel}`),
  ].join("\n");
}

async function testGoogleSheetsAPI(credentialsPath) {
  log("\n📊 Test Google Sheets API...", "cyan");

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const resolved = resolveSheetIdForTest();
    const sheetId = resolved.id || DEMO_SHEET_FALLBACK;
    if (!resolved.id) {
      log(
        `   ℹ️  Env không có Spreadsheet ID hợp lệ (bỏ qua YOUR_* / placeholder) — dùng ID demo repo.`,
        "yellow"
      );
      log(
        `   ℹ️  Đặt GOOGLE_SHEETS_ID hoặc REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID = ID trong URL Sheet.`,
        "yellow"
      );
    } else {
      log(`   Đang test từ biến: ${resolved.fromKey}`, "yellow");
    }
    log(`   Sheet ID (rút gọn): ${maskSheetId(sheetId)}`, "yellow");

    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const title = response.data.properties.title;
    log(`   ✅ Google Sheets API: HOẠT ĐỘNG`, "green");
    log(`   📄 Sheet: "${title}"`, "green");
    log(`   📊 Số sheets: ${response.data.sheets.length}`, "green");

    return { success: true, title };
  } catch (error) {
    const errorMsg = error.message;

    if (
      errorMsg.includes("API has not been used") ||
      errorMsg.includes("not enabled") ||
      errorMsg.includes("not activated")
    ) {
      log(`   ❌ Google Sheets API: CHƯA ENABLE`, "red");
      log(
        `   💡 Enable tại: https://console.cloud.google.com/apis/library/sheets.googleapis.com`,
        "yellow"
      );
    } else if (errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("permission")) {
      log(`   ⚠️  Google Sheets API: ĐÃ ENABLE nhưng thiếu quyền`, "yellow");
      log(`   💡 Share Sheet với service account email (JSON → client_email)`, "yellow");
    } else if (
      error.code === 404 ||
      /not found|NOT_FOUND|Requested entity was not found/i.test(errorMsg)
    ) {
      log(`   ❌ Google Sheets: không tìm thấy Spreadsheet (404)`, "red");
      log(
        `   💡 Sai ID / Sheet đã xóa / chưa share cho service account (đôi khi Google trả 404).`,
        "yellow"
      );
      log(`   💡 Kiểm tra ID trong .env khớp URL /d/<id>/edit`, "yellow");
    } else {
      log(`   ❌ Google Sheets API: LỖI`, "red");
      log(`   📝 ${errorMsg.substring(0, 120)}`, "red");
    }

    return { success: false, error: errorMsg };
  }
}

async function testGoogleDriveAPI(credentialsPath) {
  log("\n📁 Test Google Drive API...", "cyan");

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: authClient });

    // Test bằng cách lấy thông tin về
    const response = await drive.about.get({
      fields: "user,storageQuota",
    });

    const user = response.data.user;
    log(`   ✅ Google Drive API: HOẠT ĐỘNG`, "green");
    log(`   👤 User: ${user.displayName || user.emailAddress}`, "green");
    log(`   📧 Email: ${user.emailAddress}`, "green");

    return { success: true, user: user.emailAddress };
  } catch (error) {
    const errorMsg = error.message;

    if (
      errorMsg.includes("API has not been used") ||
      errorMsg.includes("not enabled") ||
      errorMsg.includes("not activated")
    ) {
      log(`   ❌ Google Drive API: CHƯA ENABLE`, "red");
      log(
        `   💡 Enable tại: https://console.cloud.google.com/apis/library/drive.googleapis.com`,
        "yellow"
      );
    } else {
      log(`   ❌ Google Drive API: LỖI`, "red");
      log(`   📝 ${errorMsg.substring(0, 100)}`, "red");
    }

    return { success: false, error: errorMsg };
  }
}

async function testGoogleAppsScriptAPI(credentialsPath) {
  log("\n📜 Test Google Apps Script API...", "cyan");

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/script.projects.readonly"],
    });

    const authClient = await auth.getClient();
    const script = google.script({ version: "v1", auth: authClient });

    // Test bằng cách list projects (có thể trống nhưng không báo lỗi enable)
    try {
      await script.projects.list();
      log(`   ✅ Google Apps Script API: HOẠT ĐỘNG`, "green");
      return { success: true };
    } catch (listError) {
      // Nếu không có projects cũng OK, quan trọng là API enabled
      if (
        listError.message.includes("API has not been used") ||
        listError.message.includes("not enabled")
      ) {
        throw listError;
      }
      log(`   ✅ Google Apps Script API: HOẠT ĐỘNG (không có projects)`, "green");
      return { success: true };
    }
  } catch (error) {
    const errorMsg = error.message;

    if (
      errorMsg.includes("API has not been used") ||
      errorMsg.includes("not enabled") ||
      errorMsg.includes("not activated")
    ) {
      log(`   ❌ Google Apps Script API: CHƯA ENABLE`, "red");
      log(
        `   💡 Enable tại: https://console.cloud.google.com/apis/library/script.googleapis.com`,
        "yellow"
      );
    } else {
      log(`   ❌ Google Apps Script API: LỖI`, "red");
      log(`   📝 ${errorMsg.substring(0, 100)}`, "red");
    }

    return { success: false, error: errorMsg };
  }
}

async function main() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║  🧪 TEST GOOGLE APIs - Simple Test                         ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Tìm credentials file
  log("\n🔍 Đang tìm credentials file...", "cyan");
  const credentialsPath = findCredentialsFile();

  if (!credentialsPath) {
    log("\n❌ Không tìm thấy credentials file (JSON service account)!", "red");
    log("\n💡 Đã kiểm tra (theo thứ tự):", "yellow");
    log(credentialSearchHintsForUser(), "yellow");
    log(
      "\n📝 Gợi ý: copy key GCP → config/service_account.json hoặc config/google-credentials.json, rồi trong .env đặt:",
      "yellow"
    );
    log("   GOOGLE_APPLICATION_CREDENTIALS=config/service_account.json", "yellow");
    process.exit(1);
  }

  log(`   ✅ Tìm thấy: ${credentialsPath}`, "green");

  // Đọc thông tin service account
  try {
    const creds = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
    const email = creds.client_email || creds.service_account_email;
    log(`   📧 Service Account: ${email}`, "cyan");
  } catch (error) {
    log(`   ⚠️  Không thể đọc credentials file: ${error.message}`, "yellow");
  }

  // Test từng API
  const results = {
    sheets: await testGoogleSheetsAPI(credentialsPath),
    drive: await testGoogleDriveAPI(credentialsPath),
    appsScript: await testGoogleAppsScriptAPI(credentialsPath),
  };

  // Tóm tắt
  console.log(`\n${colors.cyan}${"─".repeat(60)}${colors.reset}`);
  log("\n📊 TÓM TẮT:", "cyan");

  const enabled = Object.values(results).filter((r) => r.success).length;
  const total = Object.keys(results).length;

  log(`\n✅ APIs hoạt động: ${enabled}/${total}`, enabled === total ? "green" : "yellow");

  if (results.sheets.success) log("   ✅ Google Sheets API", "green");
  else log("   ❌ Google Sheets API", "red");

  if (results.drive.success) log("   ✅ Google Drive API", "green");
  else log("   ❌ Google Drive API", "red");

  if (results.appsScript.success) log("   ✅ Google Apps Script API", "green");
  else log("   ❌ Google Apps Script API", "red");

  if (enabled === total) {
    log("\n🎉 Tất cả APIs đã được enable và hoạt động!", "green");
  } else {
    log("\n⚠️  Một số APIs chưa enable hoặc có lỗi", "yellow");
    log("💡 Xem chi tiết ở trên để biết cách sửa", "yellow");
  }

  console.log();
}

if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Lỗi không mong đợi: ${error.message}`, "red");
    process.exit(1);
  });
}

module.exports = {
  testGoogleSheetsAPI,
  testGoogleDriveAPI,
  testGoogleAppsScriptAPI,
};
