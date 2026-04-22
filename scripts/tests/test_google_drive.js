#!/usr/bin/env node
/**
 * Kiểm tra Google Drive qua Backend Node (GET /api/drive/files).
 * Cần backend chạy (mặc định http://localhost:3001). Hiển thị mock vs dữ liệu Drive thật.
 */

const http = require("http");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const BACKEND =
  process.env.TEST_BACKEND_URL ||
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:3001";

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method: "GET",
      timeout: 15000,
      headers: { Accept: "application/json" },
    };
    const lib = u.protocol === "https:" ? require("https") : http;
    const req = lib.request(opts, (res) => {
      let body = "";
      res.on("data", (c) => {
        body += c;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode, body });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.end();
  });
}

function looksLikeMockDrivePayload(data) {
  if (!Array.isArray(data) || data.length === 0) return false;
  const ids = new Set(data.map((f) => f && f.id).filter(Boolean));
  return ids.has("file_1") && ids.has("folder_1");
}

async function main() {
  console.log("📁 Google Drive — kiểm tra qua Backend API");
  console.log("=".repeat(60));
  console.log(`Backend: ${BACKEND}`);

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || process.env.TEST_DRIVE_FOLDER_ID;
  const qs = new URLSearchParams({ pageSize: "10" });
  if (folderId) qs.set("folderId", folderId);
  const url = `${BACKEND.replace(/\/$/, "")}/api/drive/files?${qs.toString()}`;

  console.log(`GET ${url}\n`);

  try {
    const { status, body } = await getJson(url);
    if (status !== 200) {
      console.log(`❌ HTTP ${status}`);
      console.log(body.slice(0, 500));
      process.exit(1);
    }
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      console.log("❌ Phản hồi không phải JSON");
      console.log(body.slice(0, 300));
      process.exit(1);
    }

    if (!json.success) {
      console.log("❌ success !== true", json.error || "");
      process.exit(1);
    }

    const files = json.data || [];
    const mock = looksLikeMockDrivePayload(files);

    if (mock) {
      console.log("⚠️  Backend trả dữ liệu MOCK (chưa init Google Drive với credentials thật).");
      console.log("   → Xem: docs/GOOGLE_CREDENTIALS_SETUP.md và bật Google Drive API.");
    } else {
      console.log("✅ Google Drive: backend trả danh sách file thật (không phải mock mặc định).");
    }

    console.log(`\nSố file (trang này): ${files.length}`);
    files.slice(0, 8).forEach((f, i) => {
      const name = (f && f.name) || "?";
      const id = (f && f.id) || "?";
      const mime = (f && f.mimeType) || "";
      console.log(`  ${i + 1}. ${name}  [${id}]  ${mime}`);
    });
    if (files.length > 8) console.log(`  … và ${files.length - 8} file khác`);

    if (process.env.STRICT_DRIVE_REAL === "1" && mock) {
      console.log("\n❌ STRICT_DRIVE_REAL=1 nhưng đang mock → exit 1");
      process.exit(1);
    }

    console.log("\n✅ Kiểm tra Drive API (HTTP) hoàn tất.");
    process.exit(0);
  } catch (e) {
    if (e.code === "ECONNREFUSED" || e.message === "timeout") {
      console.log(`❌ Không kết nối được backend (${BACKEND}). Chạy: cd backend && npm start`);
    } else {
      console.log(`❌ ${e.message}`);
    }
    process.exit(1);
  }
}

main();
