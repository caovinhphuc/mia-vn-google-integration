#!/usr/bin/env node
/**
 * Test All - Comprehensive Test Runner
 * Chạy tất cả các test suites trong dự án
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/** Luôn chạy child process từ project root để dotenv đọc .env và path tới package.json/src đúng */
const PROJECT_ROOT = path.join(__dirname, "..");

console.log("🧪 Test All - Comprehensive Test Runner");
console.log("=".repeat(70));

const testFiles = [
  {
    name: "Google Sheets Connection",
    file: path.join(__dirname, "testGoogleConnection.cjs"),
    type: "cjs",
  },
  {
    name: "Google Sheets Service",
    file: path.join(__dirname, "tests", "test_google_sheets.js"),
    type: "commonjs",
  },
  {
    name: "Google Drive (via Backend API)",
    file: path.join(__dirname, "tests", "test_google_drive.js"),
    type: "commonjs",
  },
  {
    name: "Frontend API Connection",
    file: path.join(__dirname, "test_frontend_api_connection.js"),
    type: "commonjs",
  },
  {
    name: "Telegram Connection",
    file: path.join(__dirname, "testTelegramConnection.js"),
    type: "commonjs",
  },
  {
    name: "Health Check",
    file: path.join(__dirname, "health-check.cjs"),
    type: "cjs",
  },
  {
    name: "WebSocket Connection",
    file: path.join(__dirname, "test-websocket.js"),
    type: "commonjs",
  },
];

// Test suites từ root
const rootTestFiles = [
  {
    name: "Complete System Test",
    file: path.join(__dirname, "tests", "complete_system_test.js"),
    type: "commonjs",
  },
  {
    name: "End-to-End Test",
    file: path.join(__dirname, "tests", "end_to_end_test.js"),
    type: "commonjs",
  },
  {
    name: "Integration Test",
    file: path.join(__dirname, "tests", "integration_test.js"),
    type: "commonjs",
  },
  {
    name: "Frontend Connection Test",
    file: path.join(__dirname, "tests", "frontend_connection_test.js"),
    type: "commonjs",
  },
];

async function runTest(testConfig, index, total) {
  return new Promise((resolve) => {
    console.log(`\n[${index}/${total}] 🚀 Running: ${testConfig.name}`);
    console.log("-".repeat(70));

    if (!fs.existsSync(testConfig.file)) {
      console.log(`⚠️  File not found: ${testConfig.file}`);
      console.log(`⏭️  Skipping ${testConfig.name}\n`);
      resolve({ name: testConfig.name, success: false, skipped: true });
      return;
    }

    const startTime = Date.now();
    const nodeProcess = spawn("node", [testConfig.file], {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
      shell: true,
    });

    nodeProcess.on("close", (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const success = code === 0;

      if (success) {
        console.log(`\n✅ ${testConfig.name} completed successfully (${duration}s)`);
      } else {
        console.log(`\n❌ ${testConfig.name} failed with code ${code} (${duration}s)`);
      }

      resolve({
        name: testConfig.name,
        success,
        duration: parseFloat(duration),
        exitCode: code,
      });
    });

    nodeProcess.on("error", (error) => {
      console.log(`\n❌ Error running ${testConfig.name}: ${error.message}`);
      resolve({
        name: testConfig.name,
        success: false,
        error: error.message,
      });
    });
  });
}

async function runAllTests() {
  console.log("\n📋 Test Plan:");
  const allTests = [...testFiles, ...rootTestFiles].filter(
    (test) => fs.existsSync(test.file) || fs.existsSync(test.file.replace(".js", ".cjs"))
  );

  allTests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.name}`);
  });

  console.log(`\n📊 Total tests to run: ${allTests.length}\n`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < allTests.length; i++) {
    const result = await runTest(allTests[i], i + 1, allTests.length);
    results.push(result);

    // Small delay between tests
    if (i < allTests.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  // Generate summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(70));

  const passed = results.filter((r) => r.success && !r.skipped).length;
  const failed = results.filter((r) => !r.success && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`⏱️  Total Time: ${totalTime}s`);

  console.log("\n📋 Detailed Results:");
  results.forEach((result, index) => {
    const status = result.skipped ? "⏭️  SKIPPED" : result.success ? "✅ PASSED" : "❌ FAILED";
    const duration = result.duration ? ` (${result.duration}s)` : "";
    console.log(`  ${index + 1}. ${status} - ${result.name}${duration}`);
  });

  // Save report: reports/test-runs/ (không ghi root — xem reports/README.md)
  const reportDir = path.join(PROJECT_ROOT, "reports", "test-runs");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `test-report-${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      totalTime: parseFloat(totalTime),
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Check if .env exists
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.log("⚠️  Warning: .env file not found. Some tests may fail.");
  console.log("   Create .env file with required environment variables.\n");
}

// Run all tests
runAllTests().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
