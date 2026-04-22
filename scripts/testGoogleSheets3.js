#!/usr/bin/env node
/**
 * Test Google Sheets Service (CommonJS — tránh cảnh báo ESM của Node)
 * Ưu tiên file JSON (GOOGLE_APPLICATION_CREDENTIALS / config/…) giống backend.
 */

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const PROJECT_ROOT = path.join(__dirname, "..");

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
  const s = String(id).trim();
  const u = s.toUpperCase();
  if (!s) return true;
  if (u === "YOUR_SHEET_ID" || u === "YOUR_SPREADSHEET_ID") return true;
  if (/^YOUR[_-]/i.test(s)) return true;
  if (["PLACEHOLDER", "REPLACE_ME", "CHANGEME", "EXAMPLE"].some((x) => u.includes(x))) return true;
  if (s === "your-spreadsheet-id" || s === "your_spreadsheet_id") return true;
  return false;
}

function resolveSpreadsheetId() {
  const keys = [
    "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
    "REACT_APP_GOOGLE_SHEET_ID",
    "REACT_APP_GOOGLE_SHEETS_ID",
    "GOOGLE_SHEETS_ID",
    "GOOGLE_SHEET_ID",
    "VITE_GOOGLE_SHEETS_SPREADSHEET_ID",
  ];
  for (const k of keys) {
    const v = stripEnvQuotes(process.env[k]);
    if (v && !isPlaceholderSheetId(v)) return { id: v, fromKey: k };
  }
  return { id: null, fromKey: null };
}

function findCredentialsJsonPath() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    process.env.GOOGLE_CREDENTIALS_PATH,
    path.join(PROJECT_ROOT, "config/google-credentials.json"),
    path.join(PROJECT_ROOT, "automation/config/google-credentials.json"),
    path.join(PROJECT_ROOT, "automation/config/service_account.json"),
  ].filter(Boolean);
  const seen = new Set();
  for (const p of candidates) {
    const abs = path.isAbsolute(p) ? path.normalize(p) : path.join(PROJECT_ROOT, p);
    if (seen.has(abs)) continue;
    seen.add(abs);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

async function testGoogleSheets() {
  console.log("\n🧪 KIỂM TRA GOOGLE SHEETS SERVICE\n");
  console.log("=".repeat(50));

  log.test("Bước 1: Kiểm tra Environment Variables...");

  const { id: SHEET_ID, fromKey } = resolveSpreadsheetId();
  if (!SHEET_ID) {
    const raw = stripEnvQuotes(process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID || "");
    if (raw && isPlaceholderSheetId(raw)) {
      log.error(
        `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID="${raw}" là placeholder — thay bằng ID từ URL Sheet.`
      );
    } else {
      log.error(
        "Thiếu Spreadsheet ID (đặt REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID hoặc REACT_APP_GOOGLE_SHEET_ID, v.v.)"
      );
    }
    return false;
  }
  log.success(`Sheet ID (${fromKey}): ${SHEET_ID}`);

  const keyFile = findCredentialsJsonPath();
  let auth;

  log.test("\nBước 2: Khởi tạo Google Auth...");
  if (keyFile) {
    log.info(`   Dùng file JSON: ${keyFile}`);
    const raw = JSON.parse(fs.readFileSync(keyFile, "utf8"));
    log.info(`   Project ID: ${raw.project_id}`);
    log.info(`   Client Email: ${raw.client_email}`);
    auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    log.success("Google Auth (keyFile) đã khởi tạo");
  } else {
    const getEnvVar = (a, b) => stripEnvQuotes(process.env[a]) || stripEnvQuotes(process.env[b]);
    const projectId = getEnvVar("REACT_APP_GOOGLE_PROJECT_ID", "GOOGLE_PROJECT_ID");
    const privateKey = (
      getEnvVar("REACT_APP_GOOGLE_PRIVATE_KEY", "GOOGLE_PRIVATE_KEY") || ""
    ).replace(/\\n/g, "\n");
    const clientEmail = getEnvVar("REACT_APP_GOOGLE_CLIENT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const clientId = getEnvVar("REACT_APP_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID");
    const privateKeyId = getEnvVar("REACT_APP_GOOGLE_PRIVATE_KEY_ID", "GOOGLE_PRIVATE_KEY_ID");

    if (!projectId || !privateKey || !clientEmail || !clientId || !privateKeyId) {
      log.error("Thiếu biến để ghép JWT HOẶC không có file JSON credentials.");
      log.error("  → Đặt GOOGLE_APPLICATION_CREDENTIALS=config/google-credentials.json");
      log.error(
        "  → Hoặc đủ: GOOGLE_PROJECT_ID, GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_CLIENT_ID, GOOGLE_PRIVATE_KEY_ID"
      );
      return false;
    }
    log.info(`   Project ID: ${projectId}`);
    log.info(`   Client Email: ${clientEmail}`);
    auth = new google.auth.JWT(clientEmail, null, privateKey, [
      "https://www.googleapis.com/auth/spreadsheets",
    ]);
    log.success("Google Auth (JWT từ .env) đã khởi tạo");
  }

  const authClient = await auth.getClient();

  log.test("\nBước 3: Khởi tạo Google Sheets API...");
  const sheets = google.sheets({ version: "v4", auth: authClient });
  log.success("Google Sheets API đã khởi tạo");

  log.test("\nBước 4: Test 1 - Lấy thông tin Spreadsheet...");
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    const title = response.data.properties.title;
    const sheetCount = response.data.sheets.length;
    log.success("Kết nối thành công!");
    log.info(`   Tên: ${title}`);
    log.info(`   Số sheets: ${sheetCount}`);
    log.info(`   Sheets: ${response.data.sheets.map((s) => s.properties.title).join(", ")}`);
  } catch (error) {
    const msg = error.message || String(error);
    log.error(`Lỗi: ${msg}`);
    const email =
      keyFile && fs.existsSync(keyFile)
        ? JSON.parse(fs.readFileSync(keyFile, "utf8")).client_email
        : stripEnvQuotes(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "");
    if (
      msg.includes("unregistered") ||
      msg.includes("API Key") ||
      msg.includes("consumer identity")
    ) {
      log.error(
        "   → Thường gặp khi: Google Sheets API chưa bật trên project của key; private_key sai; hoặc request không gắn đúng credentials."
      );
      log.error('   → GCP Console → APIs & Services → Enable "Google Sheets API"');
    }
    if (error.code === 403 || msg.includes("PERMISSION_DENIED")) {
      log.error("   → Chia sẻ Sheet với service account (Viewer tối thiểu):");
      if (email) log.error(`      ${email}`);
    }
    if (msg.includes("not found") || msg.includes("Not Found")) {
      log.error("   → Kiểm tra Spreadsheet ID khớp URL / Sheet đã share cho email trên.");
    }
    return false;
  }

  log.test("\nBước 5: Test 2 - Đọc dữ liệu từ Sheet...");
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const firstSheetName = meta.data.sheets[0].properties.title;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${firstSheetName}!A1:Z10`,
    });
    const rows = response.data.values || [];
    log.success("Đọc thành công!");
    log.info(`   Sheet: ${firstSheetName}, số dòng: ${rows.length}`);
  } catch (error) {
    log.error(`Lỗi đọc dữ liệu: ${error.message}`);
    return false;
  }

  log.test("\nBước 6: Test 3 - Ghi ô test Z999...");
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const firstSheetName = meta.data.sheets[0].properties.title;
    const testRange = `${firstSheetName}!Z999`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: testRange,
      valueInputOption: "RAW",
      requestBody: { values: [[`TEST_${Date.now()}`]] },
    });
    log.success("Ghi thành công!");
    log.info(`   Range: ${testRange}`);
  } catch (error) {
    log.error(`Lỗi ghi: ${error.message}`);
    return false;
  }

  console.log("\n" + "=".repeat(50));
  log.success("🎉 TẤT CẢ CÁC TEST ĐÃ THÀNH CÔNG!");
  console.log("");
  return true;
}

testGoogleSheets()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((e) => {
    log.error(`Lỗi không mong đợi: ${e.message}`);
    console.error(e);
    process.exit(1);
  });
