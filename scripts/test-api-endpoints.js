#!/usr/bin/env node
/**
 * API Endpoints Test — Backend (3001), AI FastAPI (8000), Automation (8001)
 *
 * Lưu ý: /api/predictions và /api/analytics chỉ có trên **ai-service** (port 8000).
 * Port 8001 là **Automation** (OneAutomation) — không có các route AI đó.
 *
 * Env:
 *   REACT_APP_API_URL | API_BASE_URL          → backend (mặc định http://localhost:3001)
 *   REACT_APP_AI_SERVICE_URL | AI_SERVICE_URL → AI (mặc định http://localhost:8000)
 *   REACT_APP_AUTOMATION_API_URL | AUTOMATION_SERVICE_URL → automation (mặc định http://localhost:8001)
 *   AI_SERVICE_TESTS_NO_PORT_FIX=1            → không tự đổi :8001 → :8000 cho AI (nâng cao)
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

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

function firstEnv(...keys) {
  for (const k of keys) {
    const v = stripEnvQuotes(process.env[k]);
    if (v) return v;
  }
  return "";
}

const API_BASE_URL = firstEnv("REACT_APP_API_URL", "API_BASE_URL") || "http://localhost:3001";

const DEFAULT_AI = "http://localhost:8000";
const DEFAULT_AUTOMATION = "http://localhost:8001";

/**
 * Nhiều .env ghi REACT_APP_AI_SERVICE_URL=http://localhost:8001 (nhầm với Automation).
 * Route GET /api/predictions chỉ tồn tại trên ai-service → ép base port 8000 (trừ khi AI_SERVICE_TESTS_NO_PORT_FIX=1).
 */
function resolveAiServiceUrl() {
  let raw =
    firstEnv("REACT_APP_AI_SERVICE_URL", "VITE_AI_SERVICE_URL", "AI_SERVICE_URL") || DEFAULT_AI;
  let corrected = false;
  if (process.env.AI_SERVICE_TESTS_NO_PORT_FIX === "1") {
    return { base: raw.replace(/\/$/, ""), corrected: false };
  }
  try {
    const u = new URL(raw);
    if (u.port === "8001") {
      u.port = "8000";
      corrected = true;
      raw = u.toString().replace(/\/$/, "");
    }
  } catch {
    /* giữ raw */
  }
  return { base: raw.replace(/\/$/, ""), corrected };
}

function resolveAutomationServiceUrl() {
  const raw =
    firstEnv(
      "REACT_APP_AUTOMATION_API_URL",
      "REACT_APP_AUTOMATION_SERVICE_URL",
      "AUTOMATION_SERVICE_URL",
      "AUTOMATION_API_URL"
    ) || DEFAULT_AUTOMATION;
  return raw.replace(/\/$/, "");
}

const { base: AI_SERVICE_URL, corrected: aiUrlCorrectedFrom8001 } = resolveAiServiceUrl();
const AUTOMATION_SERVICE_URL = resolveAutomationServiceUrl();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function print(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const requestModule = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData || data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.setTimeout(options.timeout || 5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  try {
    print(`\n🧪 Testing: ${name}`, "cyan");
    print(`   URL: ${url}`, "blue");

    const startTime = Date.now();
    const response = await makeRequest(url, options);
    const duration = Date.now() - startTime;

    if (response.status >= 200 && response.status < 300) {
      print(`   ✅ SUCCESS (${response.status}) - ${duration}ms`, "green");
      return {
        name,
        success: true,
        status: response.status,
        duration,
        data: response.data,
      };
    }
    print(`   ⚠️  HTTP ${response.status} - ${duration}ms`, "yellow");
    return {
      name,
      success: false,
      status: response.status,
      duration,
      data: response.data,
    };
  } catch (error) {
    print(`   ❌ ERROR: ${error.message}`, "red");
    return { name, success: false, error: error.message };
  }
}

async function runTests() {
  print("🔗 API Endpoints Test", "blue");
  print("=".repeat(70));

  print(`\nℹ️  Backend:     ${API_BASE_URL}`, "blue");
  print(
    `ℹ️  AI Service:  ${AI_SERVICE_URL}${aiUrlCorrectedFrom8001 ? "  (đã sửa :8001→:8000 — predictions/analytics chỉ có trên AI)" : ""}`,
    "blue"
  );
  print(`ℹ️  Automation:  ${AUTOMATION_SERVICE_URL}`, "blue");
  if (aiUrlCorrectedFrom8001) {
    print(
      "   → Nếu đúng ý bạn là gọi AI trên 8001: đặt AI_SERVICE_TESTS_NO_PORT_FIX=1 hoặc sửa REACT_APP_AI_SERVICE_URL trong .env",
      "yellow"
    );
  }

  const results = [];

  print("\n📡 Backend API Endpoints", "blue");
  print("=".repeat(70));

  results.push(await testEndpoint("Health Check", `${API_BASE_URL}/health`));
  results.push(await testEndpoint("API Status", `${API_BASE_URL}/api/status`));
  results.push(await testEndpoint("Get Orders", `${API_BASE_URL}/api/orders`));
  results.push(await testEndpoint("Get Analytics", `${API_BASE_URL}/api/analytics`));
  results.push(await testEndpoint("Get Statistics", `${API_BASE_URL}/api/statistics`));

  print("\n🤖 AI Service (FastAPI — port 8000)", "blue");
  print("=".repeat(70));

  results.push(await testEndpoint("AI Health Check", `${AI_SERVICE_URL}/health`));
  results.push(await testEndpoint("AI Service Info", `${AI_SERVICE_URL}/`));
  results.push(await testEndpoint("AI API Status", `${AI_SERVICE_URL}/api/status`));
  results.push(await testEndpoint("AI Predictions", `${AI_SERVICE_URL}/api/predictions`));
  results.push(await testEndpoint("AI Analytics", `${AI_SERVICE_URL}/api/analytics`));

  print("\n⚙️  Automation Service (port 8001)", "blue");
  print("=".repeat(70));

  results.push(await testEndpoint("Automation Health", `${AUTOMATION_SERVICE_URL}/health`));
  results.push(await testEndpoint("Automation Root", `${AUTOMATION_SERVICE_URL}/`));
  results.push(await testEndpoint("Automation Logs", `${AUTOMATION_SERVICE_URL}/api/logs`));

  print("\n" + "=".repeat(70));
  print("📊 TEST SUMMARY", "blue");
  print("=".repeat(70));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  print(`\n✅ Passed: ${passed}`, "green");
  print(`❌ Failed: ${failed}`, failed > 0 ? "red" : "green");
  print(`⏱️  Total Time: ${totalDuration}ms`);

  print("\n📋 Detailed Results:", "blue");
  results.forEach((result, index) => {
    const status = result.success ? "✅" : "❌";
    const duration = result.duration ? ` (${result.duration}ms)` : "";
    const statusText = result.status ? ` [${result.status}]` : "";
    print(
      `  ${index + 1}. ${status} ${result.name || `Test ${index + 1}`}${statusText}${duration}`
    );
  });

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  print(`\n❌ Fatal error: ${error.message}`, "red");
  process.exit(1);
});
