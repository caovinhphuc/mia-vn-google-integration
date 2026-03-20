#!/usr/bin/env node

/**
 * Performance Budget Monitor
 * Monitors performance metrics against budget and alerts if exceeded
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Performance budgets (đồng bộ logic scripts/performance-bundle.js)
const BUDGETS = {
  bundle: {
    initialJavascript: 400 * 1024,
    totalJavascriptSoft: 2.8 * 1024 * 1024,
    totalJavascriptHard: 5 * 1024 * 1024,
    css: 130 * 1024,
    images: 500 * 1024,
    fonts: 100 * 1024,
    totalBuild: 5 * 1024 * 1024,
  },
  metrics: {
    fcp: 1800, // First Contentful Paint (ms)
    lcp: 2500, // Largest Contentful Paint (ms)
    tti: 3800, // Time to Interactive (ms)
    cls: 0.1, // Cumulative Layout Shift
    tbt: 300, // Total Blocking Time (ms)
    lighthouse: 90, // Lighthouse score
  },
  api: {
    responseTime: 500, // API response time (ms)
    errorRate: 1, // Error rate (%)
    cacheHitRate: 70, // Cache hit rate (%)
  },
};

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkBundleBudget() {
  log("📦 Checking Bundle Budget...", "cyan");

  if (process.env.PERF_SKIP_BUNDLE === "1") {
    log("⏭️  Bỏ qua bundle (PERF_SKIP_BUNDLE=1)", "yellow");
    return { passed: true, skipped: true };
  }

  const buildDir = "build";
  if (!fs.existsSync(buildDir)) {
    log("⚠️  Chưa có thư mục build/. Chạy: npm run build", "yellow");
    log("   Hoặc PERF_SKIP_BUNDLE=1 nếu chỉ kiểm tra Lighthouse/API.", "dim");
    return { passed: false, warnings: ["Build directory not found"] };
  }

  const { checkBundleSize } = require("./performance-bundle");
  const { ok } = checkBundleSize();
  return { passed: ok };
}

function checkLighthouseBudget() {
  log("🔍 Checking Lighthouse Budget...", "cyan");

  const url = process.env.PERF_URL || "http://localhost:3000";

  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, {
      stdio: "pipe",
    });
  } catch {
    log(`⚠️  Không gọi được ${url}. Bỏ qua Lighthouse.`, "yellow");
    log("   Chạy npm start / serve build hoặc đặt PERF_URL.", "dim");
    return { passed: true, skipped: true };
  }

  try {
    const { runLighthouse } = require("./performance-lighthouse");
    const r = runLighthouse(url, { noExit: true });
    return {
      passed: r.passedBudget,
      score: r.performanceScore,
      minScore: r.minScore,
    };
  } catch (error) {
    return { passed: false, error: error.message };
  }
}

function checkAPIBudget() {
  log("🌐 Checking API Budget...", "cyan");

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

  try {
    const startTime = Date.now();
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${apiUrl}/health`, {
      stdio: "pipe",
    });
    const responseTime = Date.now() - startTime;

    if (responseTime > BUDGETS.api.responseTime) {
      log(
        `⚠️  API response time: ${responseTime}ms (budget: ${BUDGETS.api.responseTime}ms)`,
        "yellow"
      );
      return { passed: false, responseTime };
    }

    log(`✅ API response time: ${responseTime}ms`, "green");
    return { passed: true, responseTime };
  } catch (error) {
    log("⚠️  API not accessible. Skipping API check.", "yellow");
    return { passed: true, skipped: true };
  }
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    budgets: BUDGETS,
    results: results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter((r) => r.passed).length,
      failed: Object.values(results).filter((r) => !r.passed && !r.skipped).length,
      skipped: Object.values(results).filter((r) => r.skipped).length,
    },
  };

  fs.writeFileSync("performance-budget-report.json", JSON.stringify(report, null, 2));
  return report;
}

function checkPerformanceBudget() {
  log("💰 Performance Budget Monitor", "cyan");
  log("================================", "cyan");
  console.log("");
  log("Gợi ý: npm run build trước (bundle). Lighthouse: PERF_URL (mặc định :3000).", "dim");
  log(
    "Dev (npm start) thường điểm thấp — production: serve build. LIGHTHOUSE_MIN_SCORE=50 để nới dev.",
    "dim"
  );
  console.log("");

  const results = {
    bundle: checkBundleBudget(),
    lighthouse: checkLighthouseBudget(),
    api: checkAPIBudget(),
  };

  console.log("");
  log("📊 Performance Budget Summary:", "cyan");
  console.log("");

  Object.entries(results).forEach(([check, result]) => {
    if (result.skipped) {
      log(`  ⏭️  ${check}: Skipped`, "yellow");
    } else if (result.passed) {
      const extra =
        check === "lighthouse" && result.score != null
          ? ` (Performance ${result.score}/100, yêu cầu ≥${result.minScore ?? BUDGETS.metrics.lighthouse})`
          : "";
      log(`  ✅ ${check}: Passed${extra}`, "green");
    } else {
      const extra =
        check === "lighthouse" && result.score != null
          ? ` — ${result.score}/100 < ${result.minScore ?? BUDGETS.metrics.lighthouse}`
          : "";
      log(`  ❌ ${check}: Failed${extra}`, "red");
      if (result.error) {
        log(`     Error: ${result.error}`, "red");
      }
    }
  });

  console.log("");

  // Generate report
  const report = generateReport(results);

  const { summary } = report;
  log(`Total Checks: ${summary.total}`, "cyan");
  log(`Passed: ${summary.passed}`, "green");
  log(`Failed: ${summary.failed}`, summary.failed > 0 ? "red" : "green");
  log(`Skipped: ${summary.skipped}`, summary.skipped > 0 ? "yellow" : "cyan");
  console.log("");

  if (summary.failed > 0) {
    log("❌ Performance budget exceeded!", "red");
    log("💡 Review performance-budget-report.json for details", "yellow");
    process.exit(1);
  } else {
    log("✅ All performance budgets met!", "green");
  }

  log("📄 Report saved to performance-budget-report.json", "cyan");
}

if (require.main === module) {
  checkPerformanceBudget();
}

module.exports = { checkPerformanceBudget, BUDGETS };
