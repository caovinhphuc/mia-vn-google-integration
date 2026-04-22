const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
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

function isPlaceholderSheetId(id) {
  const s = String(id).trim();
  const u = s.toUpperCase();
  if (!s) return true;
  if (u === "YOUR_SHEET_ID" || u === "YOUR_SPREADSHEET_ID") return true;
  if (/^YOUR[_-]/i.test(s)) return true;
  const substrings = ["YOUR_SPREADSHEET", "PLACEHOLDER", "REPLACE_ME", "CHANGEME", "EXAMPLE_ID", "TODO"];
  if (substrings.some((x) => u.includes(x))) return true;
  return false;
}

const SHEET_ID_ENV_KEYS = [
  "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
  "REACT_APP_GOOGLE_SHEET_ID",
  "REACT_APP_GOOGLE_SHEETS_ID",
  "GOOGLE_SHEETS_ID",
  "GOOGLE_SHEET_ID",
  "GOOGLE_SHEETS_SPREADSHEET_ID",
  "VITE_GOOGLE_SHEETS_SPREADSHEET_ID",
];

function resolveSpreadsheetId() {
  for (const k of SHEET_ID_ENV_KEYS) {
    const v = stripEnvQuotes(process.env[k]);
    if (v && !isPlaceholderSheetId(v)) return { id: v, fromKey: k };
  }
  return { id: null, fromKey: null };
}

function maskSpreadsheetId(id) {
  if (!id) return "(trống)";
  const s = String(id).trim();
  if (s.length < 12) return `${s} (${s.length} ký tự — ID Sheet thường ~40+ ký tự)`;
  return `${s.slice(0, 6)}…${s.slice(-4)} (${s.length} ký tự)`;
}

/**
 * Chuẩn hóa private key từ .env — tránh OpenSSL DECODER unsupported (Node/OpenSSL 3).
 * Thường gặp: dấu " bao quanh cả key, \\n chưa thành xuống dòng, CRLF, khoảng trắng thừa.
 */
function normalizePrivateKey(raw) {
  if (!raw || typeof raw !== "string") return raw;
  let k = raw.trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  k = k.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  return k.trim();
}

async function testGoogleConnection() {
  try {
    console.log("Testing Google Service Account connection...");

    // Ưu tiên dùng file JSON — tránh parse key từ .env (OpenSSL DECODER lỗi)
    const credPath =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
      process.env.GOOGLE_CREDENTIALS_PATH;
    const credFile = credPath ? path.resolve(credPath) : null;

    let auth;
    if (credFile && fs.existsSync(credFile)) {
      console.log("ℹ️  Dùng credentials từ file:", credFile);
      auth = new GoogleAuth({
        keyFilename: credFile,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.file",
        ],
      });
    } else {
      // Fallback: build từ env (cần đủ biến)
      const requiredVars = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY"];
      const missingVars = requiredVars.filter((varName) => !process.env[varName]);
      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
      }
      let privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
      if (!privateKey || !privateKey.includes("BEGIN") || privateKey.includes("Your private key here")) {
        throw new Error(
          "GOOGLE_PRIVATE_KEY không hợp lệ. Đặt GOOGLE_APPLICATION_CREDENTIALS trỏ tới file JSON."
        );
      }
      const credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      };
      auth = new GoogleAuth({
        credentials,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.file",
        ],
      });
    }

    // Test authentication
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    console.log("✅ Google Service Account connection successful!");
    console.log("Access token obtained:", accessToken.token ? "Yes" : "No");

    let saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || authClient?.email;
    if (!saEmail && credFile && fs.existsSync(credFile)) {
      try {
        const j = JSON.parse(fs.readFileSync(credFile, "utf8"));
        if (j.client_email) saEmail = j.client_email;
      } catch (_) {
        /* ignore */
      }
    }
    if (saEmail) console.log("Service Account email:", saEmail);

    const { id: sheetId, fromKey: sheetIdFromKey } = resolveSpreadsheetId();
    console.log(
      "Sheet ID configured:",
      sheetId ? `Yes (${sheetIdFromKey})` : "No (hoặc chỉ có placeholder)"
    );
    if (sheetId) console.log("   ID (rút gọn):", maskSpreadsheetId(sheetId));

    // Test Google Sheets API connection
    console.log("\n📊 Testing Google Sheets API...");
    const sheets = google.sheets({ version: "v4", auth: authClient });

    if (sheetId) {
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
        });
        console.log("✅ Google Sheets API connection successful!");
        console.log("   Spreadsheet title:", response.data.properties.title);
        console.log("   Number of sheets:", response.data.sheets.length);
        console.log(
          "   Sheet names:",
          response.data.sheets.map((s) => s.properties.title).join(", ")
        );

        // Test read data
        const firstSheetName = response.data.sheets[0].properties.title;
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `${firstSheetName}!A1:Z10`,
        });
        const rows = readResponse.data.values || [];
        console.log("✅ Read data successful!");
        console.log("   Sheet:", firstSheetName);
        console.log("   Rows read:", rows.length);
        if (rows.length > 0) {
          console.log("   Columns:", rows[0].length);
          console.log("   First row sample:", rows[0].slice(0, 5).join(", "));
        }
      } catch (error) {
        const status = error.response?.status ?? error.code;
        console.error("❌ Google Sheets API test failed:", error.message);
        if (status === 403) {
          console.error("   → 403: Service Account chưa được share quyền trên Sheet.");
          console.error("   → Mở Google Sheet → Share → thêm email:", saEmail || "(lấy từ JSON client_email)");
          console.error("   → Quyền tối thiểu: Viewer (đọc); Editor nếu app cần ghi.");
        }
        if (
          status === 404 ||
          /not found|NOT_FOUND/i.test(String(error.message)) ||
          /Requested entity was not found/i.test(String(error.message))
        ) {
          console.error("   → 404 / Requested entity was not found — thường do một trong các nguyên nhân:");
          console.error("      1) Sai Spreadsheet ID (copy đoạn giữa /d/ và /edit trong URL Sheet).");
          console.error("      2) File đã xóa hoặc URL không phải Google Sheet.");
          console.error("      3) Sheet chưa share cho Service Account — Google đôi khi trả 404 thay vì 403.");
          console.error("      4) Đang trỏ biến env khác file thật (đã dùng:", sheetIdFromKey + ").");
          console.error("   → Kiểm tra ID:", maskSpreadsheetId(sheetId));
          console.error("   → Share với:", saEmail || "(email trong service_account.json → client_email)");
        }
      }
    } else {
      console.log("⏭️  Bỏ qua test Sheet: không có ID hợp lệ.");
      console.log(
        "   Đặt một trong:",
        SHEET_ID_ENV_KEYS.slice(0, 4).join(", "),
        "… (xem scripts/tests/test_google_sheets.js)"
      );
    }

    console.log(
      "\nGoogle Maps API configured:",
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? "Yes" : "No"
    );
    console.log("Telegram Bot configured:", process.env.TELEGRAM_BOT_TOKEN ? "Yes" : "No");
    console.log(
      "Email service configured:",
      process.env.SENDGRID_API_KEY || process.env.SMTP_USER ? "Yes" : "No"
    );
  } catch (error) {
    console.error("❌ Google Service Account connection failed:");
    console.error(error.message);

    if (
      String(error.message).includes("DECODER") ||
      String(error.message).includes("unsupported")
    ) {
      console.error("\n💡 Lỗi OpenSSL decode private key — thường do .env:");
      console.error("   1) GOOGLE_PRIVATE_KEY phải là PEM đầy đủ (có -----BEGIN ... KEY-----)");
      console.error(
        '   2) Trong .env một dòng: dùng \\n thay vì xuống dòng thật, KHÔNG bọc thêm " ngoài cả chuỗi nếu parser đã thêm quote'
      );
      console.error(
        "   3) Hoặc đặt GOOGLE_APPLICATION_CREDENTIALS=/đường/dẫn/service-account.json (file JSON tải từ GCP)"
      );
      console.error("   4) Không copy thiếu dòng; tránh Word/Google Docs làm hỏng ký tự");
    }

    if (error.message.includes("Missing environment variables")) {
      console.error("\n💡 Make sure to:");
      console.error("1. Copy env.example to .env");
      console.error("2. Fill in all required environment variables");
      console.error("3. Get the values from your Google Service Account JSON file");
    }
  }
}

testGoogleConnection();
