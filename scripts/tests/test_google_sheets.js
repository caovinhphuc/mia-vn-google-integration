#!/usr/bin/env node

/**
 * Test Google Sheets Connection Script
 * Kiểm tra kết nối Google Sheets và tạo dữ liệu mẫu
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

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

/** ID thật từ URL Sheet (…/d/<id>/edit). Từ chối placeholder kiểu YOUR_SHEET_ID / your_… */
function isPlaceholderSheetId(id) {
  const s = String(id).trim();
  const u = s.toUpperCase();
  if (!s) return true;
  if (u === "YOUR_SHEET_ID" || u === "YOUR_SPREADSHEET_ID") return true;
  if (/^YOUR[_-]/i.test(s)) return true;
  const substrings = [
    "YOUR_SPREADSHEET",
    "PLACEHOLDER",
    "REPLACE_ME",
    "CHANGEME",
    "EXAMPLE_ID",
    "TODO",
    "YOUR-SHEET",
  ];
  if (substrings.some((x) => u.includes(x))) return true;
  if (u === "YOUR_SPREADSHEET_ID" || u === "YOUR-SHEET-ID") return true;
  if (s === "your-spreadsheet-id" || s === "your_spreadsheet_id") return true;
  // ID Google Sheets thường dài ~40+ ký tự; chuỗi ngắn + chữ hoa toàn từ = gần như placeholder
  if (s.length < 20 && /^[A-Z0-9_-]+$/i.test(s) && /YOUR|PLACEHOLDER|EXAMPLE/i.test(s)) return true;
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

/** Khớp health-check / backend — ưu tiên biến thường dùng trong .env.example */
function resolveSpreadsheetId() {
  for (const k of SHEET_ID_ENV_KEYS) {
    const v = stripEnvQuotes(process.env[k]);
    if (v && !isPlaceholderSheetId(v)) return { id: v, fromKey: k };
  }
  return { id: null, fromKey: null };
}

/** Biến đầu tiên có giá trị (kể cả placeholder) — để báo lỗi rõ */
function firstSetSheetEnvRaw() {
  for (const k of SHEET_ID_ENV_KEYS) {
    const v = stripEnvQuotes(process.env[k]);
    if (v) return { key: k, value: v };
  }
  return null;
}

// Google Sheets configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const PROJECT_ROOT = path.join(__dirname, "../..");
const CREDENTIALS_CANDIDATES = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  process.env.GOOGLE_CREDENTIALS_PATH,
  path.join(PROJECT_ROOT, "config/google-credentials.json"),
  path.join(PROJECT_ROOT, "automation/config/google-credentials.json"),
].filter(Boolean);

// Sample data
const SAMPLE_DATA = {
  orders: [
    ["Ngày", "Sản phẩm", "Số lượng", "Giá", "Trạng thái", "Khách hàng"],
    ["2025-09-13", "Sản phẩm A", "5", "150000", "Hoàn thành", "Nguyễn Văn A"],
    ["2025-09-13", "Sản phẩm B", "3", "200000", "Đang xử lý", "Trần Thị B"],
    ["2025-09-12", "Sản phẩm C", "2", "300000", "Hoàn thành", "Lê Văn C"],
    ["2025-09-12", "Sản phẩm A", "4", "150000", "Hoàn thành", "Phạm Thị D"],
  ],
  dashboard: [
    ["Metric", "Value", "Change", "Status"],
    ["Tổng đơn hàng", "1250", "+12%", "Tăng"],
    ["Doanh thu", "1250000000", "+8%", "Tăng"],
    ["Khách hàng mới", "89", "+15%", "Tăng"],
    ["Tỷ lệ chuyển đổi", "3.2%", "-0.5%", "Giảm"],
  ],
};

async function testGoogleSheetsConnection() {
  console.log("🔍 KIỂM TRA GOOGLE SHEETS CONNECTION");
  console.log("=====================================");
  console.log("");

  try {
    // 1. Kiểm tra credentials file
    console.log("📋 Bước 1: Kiểm tra credentials file...");
    const CREDENTIALS_PATH = CREDENTIALS_CANDIDATES.find((p) => fs.existsSync(path.resolve(p)));
    if (!CREDENTIALS_PATH) {
      throw new Error(
        `❌ Không tìm thấy credentials file. Thử: config/google-credentials.json, automation/config/google-credentials.json, hoặc đặt GOOGLE_APPLICATION_CREDENTIALS trong .env`
      );
    }
    console.log(`✅ Credentials file: ${path.resolve(CREDENTIALS_PATH)}`);

    // 2. Kiểm tra environment variables
    console.log("📋 Bước 2: Kiểm tra environment variables...");
    const { id: spreadsheetId, fromKey } = resolveSpreadsheetId();
    const rawFirst = firstSetSheetEnvRaw();

    if (!spreadsheetId) {
      if (rawFirst && isPlaceholderSheetId(rawFirst.value)) {
        console.log(
          `❌ ${rawFirst.key}="${rawFirst.value}" là placeholder — không phải ID file Google Sheet.`
        );
        console.log(
          "   Lấy ID từ URL: https://docs.google.com/spreadsheets/d/<DÁN_ID_VÀO_ĐÂY>/edit"
        );
      } else {
        console.log("⚠️  Chưa có Google Sheets ID thực tế");
      }
      console.log("📝 Đặt một trong các biến (ưu tiên):");
      console.log(
        "   REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID | REACT_APP_GOOGLE_SHEET_ID | GOOGLE_SHEETS_ID | VITE_GOOGLE_SHEETS_SPREADSHEET_ID"
      );
      console.log("   1. Tạo Google Sheets: https://sheets.google.com");
      console.log("   2. Copy ID từ URL …/spreadsheets/d/<ID>/edit");
      console.log("");
      return false;
    }
    console.log(`✅ Google Sheets ID (${fromKey}): ${spreadsheetId}`);

    // 3. Load credentials
    console.log("📋 Bước 3: Load Google credentials...");
    const credentials = JSON.parse(fs.readFileSync(path.resolve(CREDENTIALS_PATH), "utf8"));

    if (credentials.project_id === "your-project-id") {
      console.log("⚠️  Credentials file chưa được cấu hình đúng");
      console.log("📝 Hướng dẫn:");
      console.log("   1. Tạo Google Cloud Project");
      console.log("   2. Enable Google Sheets API");
      console.log("   3. Tạo Service Account và download JSON key");
      console.log("   4. Thay thế nội dung file google-credentials.json");
      console.log("");
      return false;
    }
    console.log(`✅ Project ID: ${credentials.project_id}`);

    // 4. Authenticate
    console.log("📋 Bước 4: Authenticate với Google APIs...");
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });
    console.log("✅ Authentication thành công");

    // 5. Test connection
    console.log("📋 Bước 5: Test kết nối với Google Sheets...");
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    console.log(`✅ Kết nối thành công!`);
    console.log(`📊 Spreadsheet title: ${response.data.properties.title}`);
    console.log(`📋 Sheets: ${response.data.sheets.map((s) => s.properties.title).join(", ")}`);

    // 6. Tạo dữ liệu mẫu (nếu cần)
    console.log("📋 Bước 6: Kiểm tra và tạo dữ liệu mẫu...");

    // Kiểm tra sheet "Orders"
    const ordersSheet = response.data.sheets.find((s) => s.properties.title === "Orders");
    if (!ordersSheet) {
      console.log('📝 Tạo sheet "Orders"...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Orders",
                },
              },
            },
          ],
        },
      });
      console.log('✅ Đã tạo sheet "Orders"');
    } else {
      console.log('✅ Sheet "Orders" đã tồn tại');
    }

    // Ghi dữ liệu mẫu vào Orders sheet
    console.log("📝 Ghi dữ liệu mẫu vào Orders sheet...");
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "Orders!A1:F10",
      valueInputOption: "RAW",
      resource: {
        values: SAMPLE_DATA.orders,
      },
    });
    console.log("✅ Đã ghi dữ liệu mẫu vào Orders sheet");

    // Kiểm tra sheet "Dashboard"
    const dashboardSheet = response.data.sheets.find((s) => s.properties.title === "Dashboard");
    if (!dashboardSheet) {
      console.log('📝 Tạo sheet "Dashboard"...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Dashboard",
                },
              },
            },
          ],
        },
      });
      console.log('✅ Đã tạo sheet "Dashboard"');
    } else {
      console.log('✅ Sheet "Dashboard" đã tồn tại');
    }

    // Ghi dữ liệu mẫu vào Dashboard sheet
    console.log("📝 Ghi dữ liệu mẫu vào Dashboard sheet...");
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "Dashboard!A1:D10",
      valueInputOption: "RAW",
      resource: {
        values: SAMPLE_DATA.dashboard,
      },
    });
    console.log("✅ Đã ghi dữ liệu mẫu vào Dashboard sheet");

    console.log("");
    console.log("🎉 GOOGLE SHEETS SETUP HOÀN TẤT!");
    console.log("================================");
    console.log(`📊 Spreadsheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log("📋 Sheets đã tạo: Orders, Dashboard");
    console.log("📊 Dữ liệu mẫu đã được thêm vào");
    console.log("");
    console.log("✅ Bây giờ bạn có thể test Google Sheets integration trong frontend!");

    return true;
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    const sid = resolveSpreadsheetId();
    if (error.message && String(error.message).includes("Requested entity was not found")) {
      console.log("");
      console.log(
        "🔧 Lỗi này = Google không thấy spreadsheet (404) hoặc service account không có quyền."
      );
      if (sid.id) console.log(`   Đang dùng ID: ${sid.id} (từ ${sid.fromKey})`);
      try {
        const cp = CREDENTIALS_CANDIDATES.find((p) => fs.existsSync(path.resolve(p)));
        if (cp) {
          const j = JSON.parse(fs.readFileSync(path.resolve(cp), "utf8"));
          if (j.client_email) {
            console.log(`   Trong Sheet: Chia sẻ → thêm email: ${j.client_email} (Viewer trở lên)`);
          }
        }
      } catch {
        /* ignore */
      }
      console.log(
        "   Nếu có nhiều biến SHEET trong .env: xóa ID cũ / chỉ giữ một ID đúng với URL file Sheet."
      );
    }
    console.log("");
    console.log("🔧 TROUBLESHOOTING:");
    console.log("1. Khớp ID với URL Sheet; ưu tiên REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID");
    console.log("2. Chia sẻ Sheet cho client_email trong JSON credentials");
    console.log("3. Bật Google Sheets API trên đúng GCP project của key");
    return false;
  }
}

// Chạy test
if (require.main === module) {
  testGoogleSheetsConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Unexpected error:", error);
      process.exit(1);
    });
}

module.exports = { testGoogleSheetsConnection };
