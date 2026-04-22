#!/usr/bin/env node
/**
 * Kiểm tra Frontend → Backend API (Google Sheets / Drive)
 * Usage: node scripts/test_frontend_api_connection.js
 *
 * Sheets: gọi kèm ?sheetId= nếu resolve được ID từ .env (khớp backend sau khi merge GOOGLE_SHEETS_ID).
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

function loadProjectEnv() {
  const files = [
    path.join(PROJECT_ROOT, ".env"),
    path.join(PROJECT_ROOT, "backend/.env"),
    path.join(PROJECT_ROOT, "automation/.env"),
    path.join(PROJECT_ROOT, ".env.local"),
  ];
  for (let i = 0; i < files.length; i++) {
    const p = files[i];
    if (!fs.existsSync(p)) continue;
    require("dotenv").config({ path: p, override: i > 0 });
  }
}

loadProjectEnv();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  bright: "\x1b[1m",
};

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

function isPlaceholderSpreadsheetId(id) {
  const s = String(id || "").trim();
  const u = s.toUpperCase();
  if (!s) return true;
  if (u === "YOUR_SHEET_ID" || u === "YOUR_SPREADSHEET_ID") return true;
  if (/^YOUR[_-]/i.test(s)) return true;
  if (["PLACEHOLDER", "REPLACE_ME", "CHANGEME", "EXAMPLE_ID"].some((x) => u.includes(x)))
    return true;
  return false;
}

const SPREADSHEET_ID_ENV_KEYS = [
  "GOOGLE_SHEETS_ID",
  "GOOGLE_SHEET_ID",
  "GOOGLE_SHEETS_SPREADSHEET_ID",
  "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
  "REACT_APP_GOOGLE_SHEET_ID",
  "REACT_APP_GOOGLE_SHEETS_ID",
  "VITE_GOOGLE_SHEETS_SPREADSHEET_ID",
];

function resolveSpreadsheetIdForTest() {
  for (const k of SPREADSHEET_ID_ENV_KEYS) {
    const v = stripEnvQuotes(process.env[k]);
    if (v && !isPlaceholderSpreadsheetId(v)) return { id: v, fromKey: k };
  }
  return { id: null, fromKey: null };
}

function maskSheetId(id) {
  if (!id) return "(trống)";
  const s = String(id);
  if (s.length < 12) return s;
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

const API_BASE_URL =
  stripEnvQuotes(process.env.REACT_APP_API_BASE_URL) ||
  stripEnvQuotes(process.env.VITE_API_BASE_URL) ||
  (process.env.REACT_APP_API_URL &&
    String(process.env.REACT_APP_API_URL).replace(/\/?$/, "/api")) ||
  "http://localhost:3001/api";

const { id: resolvedSheetId, fromKey: resolvedSheetKey } = resolveSpreadsheetIdForTest();
const sheetQuery = resolvedSheetId ? `sheetId=${encodeURIComponent(resolvedSheetId)}` : "";

console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║  🔌 KIỂM TRA KẾT NỐI FRONTEND API - Google APIs            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.blue}Backend API URL: ${API_BASE_URL}${colors.reset}`);
if (resolvedSheetId) {
  console.log(
    `${colors.blue}Sheet ID (query): ${maskSheetId(resolvedSheetId)} từ ${resolvedSheetKey}${colors.reset}`
  );
} else {
  console.log(
    `${colors.yellow}⚠️  Không resolve được Sheet ID hợp lệ từ .env — gọi API dùng default của backend (restart backend sau khi sửa .env).${colors.reset}`
  );
}
console.log("");

const results = {
  backend: false,
  sheets: false,
  drive: false,
  errors: [],
};

function isNotFoundMessage(msg) {
  if (!msg || typeof msg !== "string") return false;
  return /not found|NOT_FOUND|Requested entity was not found/i.test(msg);
}

async function testBackendConnection() {
  console.log(`${colors.cyan}1. Kiểm tra Backend API Connection...${colors.reset}`);

  try {
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
    const endpoints = [`${baseUrl}/health`, `${baseUrl}/api/health`, `${baseUrl}`];

    let connected = false;
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 5000,
          validateStatus: () => true,
        });

        if (response.status < 500) {
          console.log(`   ${colors.green}✅${colors.reset} Backend đang chạy tại: ${endpoint}`);
          console.log(`   Status: ${response.status}`);
          connected = true;
          break;
        }
      } catch (err) {
        /* next */
      }
    }

    if (!connected) {
      throw new Error("Không thể kết nối đến backend");
    }

    results.backend = true;
    return true;
  } catch (error) {
    console.log(`   ${colors.red}❌${colors.reset} Không thể kết nối đến backend`);
    console.log(`   ${colors.red}   Lỗi: ${error.message}${colors.reset}`);
    console.log(
      `   ${colors.yellow}   → Đảm bảo backend đang chạy (port 3001): npm run dev hoặc cd backend && npm start${colors.reset}`
    );
    results.errors.push({
      service: "Backend",
      error: error.message,
    });
    return false;
  }
}

async function testSheetsAPI() {
  console.log(`\n${colors.cyan}2. Kiểm tra Google Sheets API...${colors.reset}`);

  const q = sheetQuery ? `?${sheetQuery}` : "";
  const readQ = sheetQuery ? `?${sheetQuery}&range=A1:A1` : "?range=A1:A1";

  const endpoints = [
    { name: "Metadata", url: `${API_BASE_URL}/sheets/metadata${q}`, method: "GET" },
    { name: "Read", url: `${API_BASE_URL}/sheets/read${readQ}`, method: "GET" },
  ];

  let allOk = true;

  for (const endpoint of endpoints) {
    try {
      const config = {
        timeout: 10000,
        validateStatus: () => true,
      };

      const response =
        endpoint.method === "GET"
          ? await axios.get(endpoint.url, config)
          : await axios.post(endpoint.url, {}, config);

      if (response.status === 200) {
        console.log(
          `   ${colors.green}✅${colors.reset} ${endpoint.name}: OK (Status ${response.status})`
        );
      } else if (response.status === 401 || response.status === 403) {
        allOk = false;
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: Authentication issue (Status ${response.status})`
        );
        console.log(
          `   ${colors.yellow}   → Kiểm tra Google credentials (JSON / PEM) trên backend${colors.reset}`
        );
      } else if (response.status === 404) {
        allOk = false;
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: Endpoint không tồn tại (Status ${response.status})`
        );
      } else {
        allOk = false;
        const errText = response.data?.error || response.data?.message || "";
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: Status ${response.status}`
        );
        if (errText) {
          console.log(`   ${colors.yellow}   Error: ${errText}${colors.reset}`);
        }
        if (isNotFoundMessage(errText)) {
          console.log(
            `   ${colors.yellow}   → 404/Not found: sai Spreadsheet ID hoặc Sheet chưa share cho service account.${colors.reset}`
          );
          console.log(
            `   ${colors.yellow}   → Đồng bộ GOOGLE_SHEETS_ID (hoặc REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID) rồi restart backend.${colors.reset}`
          );
        }
      }
    } catch (error) {
      allOk = false;
      if (error.code === "ECONNREFUSED") {
        console.log(`   ${colors.red}❌${colors.reset} ${endpoint.name}: Không thể kết nối`);
      } else {
        console.log(`   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: ${error.message}`);
      }
      results.errors.push({
        service: `Sheets ${endpoint.name}`,
        error: error.message,
      });
    }
  }

  results.sheets = allOk;
}

async function testDriveAPI() {
  console.log(`\n${colors.cyan}3. Kiểm tra Google Drive API...${colors.reset}`);

  const endpoints = [
    {
      name: "List Files",
      url: `${API_BASE_URL}/drive/files?pageSize=1`,
      method: "GET",
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const config = {
        timeout: 10000,
        validateStatus: () => true,
      };

      const response =
        endpoint.method === "GET"
          ? await axios.get(endpoint.url, config)
          : await axios.post(endpoint.url, {}, config);

      if (response.status === 200) {
        console.log(
          `   ${colors.green}✅${colors.reset} ${endpoint.name}: OK (Status ${response.status})`
        );
        results.drive = true;
      } else if (response.status === 401 || response.status === 403) {
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: Authentication issue (Status ${response.status})`
        );
      } else if (response.status === 404) {
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: Endpoint không tồn tại (Status ${response.status})`
        );
      } else {
        console.log(
          `   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: Status ${response.status}`
        );
        if (response.data?.error) {
          console.log(`   ${colors.yellow}   Error: ${response.data.error}${colors.reset}`);
        }
      }
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        console.log(`   ${colors.red}❌${colors.reset} ${endpoint.name}: Không thể kết nối`);
      } else {
        console.log(`   ${colors.yellow}⚠️${colors.reset} ${endpoint.name}: ${error.message}`);
      }
      results.errors.push({
        service: `Drive ${endpoint.name}`,
        error: error.message,
      });
    }
  }
}

function generateSummary() {
  console.log(`\n${colors.bright}${colors.cyan}4. TÓM TẮT${colors.reset}`);
  console.log(`${colors.bright}${"─".repeat(80)}${colors.reset}`);

  const totalTests = 3;
  const passedTests = [results.backend, results.sheets, results.drive].filter(Boolean).length;

  console.log(`\n${colors.cyan}Kết quả kiểm tra:${colors.reset}`);
  console.log(
    `   Backend Connection: ${results.backend ? `${colors.green}✅ OK${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`}`
  );
  console.log(
    `   Google Sheets API: ${results.sheets ? `${colors.green}✅ OK${colors.reset}` : `${colors.yellow}⚠️  CHƯA XÁC NHẬN${colors.reset}`}`
  );
  console.log(
    `   Google Drive API: ${results.drive ? `${colors.green}✅ OK${colors.reset}` : `${colors.yellow}⚠️  CHƯA XÁC NHẬN${colors.reset}`}`
  );

  console.log(`\n${colors.cyan}Tỷ lệ thành công: ${passedTests}/${totalTests}${colors.reset}`);

  if (results.errors.length > 0) {
    console.log(`\n${colors.red}❌ Các lỗi phát hiện:${colors.reset}`);
    results.errors.forEach((err) => {
      console.log(`   - ${err.service}: ${err.error}`);
    });
  }

  console.log(`\n${colors.bright}${colors.cyan}5. KHUYẾN NGHỊ${colors.reset}`);
  console.log(`${colors.bright}${"─".repeat(80)}${colors.reset}`);

  if (!results.backend) {
    console.log(`\n${colors.red}⚠️  CẦN HÀNH ĐỘNG NGAY:${colors.reset}`);
    console.log(`\n1. Khởi động Backend: cd backend && npm start`);
    console.log(`\n2. Kiểm tra: ${colors.blue}${API_BASE_URL}${colors.reset}`);
  } else if (!results.sheets || !results.drive) {
    console.log(`\n${colors.yellow}⚠️  Một số API chưa hoạt động đúng:${colors.reset}`);
    console.log(
      `\n1. Backend đã merge .env / backend/.env / automation/.env — restart backend sau khi đổi Sheet ID.`
    );
    console.log(
      `2. ID Sheet: đoạn giữa /d/ và /edit trong URL; biến: GOOGLE_SHEETS_ID hoặc REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID.`
    );
    console.log(`3. Share Sheet với email service account (client_email trong JSON).`);
    console.log(`4. Google Sheets API bật trên GCP project của key đó.`);
  } else {
    console.log(`\n${colors.green}✅ Tất cả API connections đang hoạt động tốt!${colors.reset}`);
  }

  console.log(`\n${colors.cyan}6. CẤU HÌNH ENVIRONMENT VARIABLES${colors.reset}`);
  console.log(`${colors.bright}${"─".repeat(80)}${colors.reset}`);
  console.log(`\n${colors.blue}REACT_APP_API_BASE_URL=${API_BASE_URL}${colors.reset}`);
  console.log(`\nHoặc Vite: ${colors.blue}VITE_API_BASE_URL=${API_BASE_URL}${colors.reset}`);
}

async function main() {
  try {
    await testBackendConnection();

    if (results.backend) {
      await testSheetsAPI();
      await testDriveAPI();
    } else {
      console.log(
        `\n${colors.yellow}⚠️  Bỏ qua kiểm tra Google APIs vì Backend không kết nối được${colors.reset}`
      );
    }

    generateSummary();

    const allPassed = results.backend && results.sheets && results.drive;
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error(`\n${colors.red}❌ Lỗi không mong đợi: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
