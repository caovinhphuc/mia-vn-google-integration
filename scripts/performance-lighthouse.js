#!/usr/bin/env node

/**
 * Lighthouse Performance Audit
 * Chạy trực tiếp: điểm < LIGHTHOUSE_MIN_SCORE (mặc 90) → exit 1
 * Gọi từ performance-budget: { noExit: true } → return { passedBudget, ... }
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DEFAULT_MIN_SCORE = 90;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function resolveMinScore(override) {
  if (typeof override === "number" && !Number.isNaN(override)) return override;
  const env = parseInt(process.env.LIGHTHOUSE_MIN_SCORE ?? "", 10);
  if (!Number.isNaN(env) && env >= 0 && env <= 100) return env;
  return DEFAULT_MIN_SCORE;
}

function checkLighthouseInstalled() {
  try {
    execSync("lighthouse --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function installLighthouse() {
  log("📦 Installing Lighthouse...", "cyan");
  try {
    execSync("npm install -g lighthouse", { stdio: "inherit" });
    log("✅ Lighthouse installed successfully", "green");
    return true;
  } catch {
    log("❌ Failed to install Lighthouse", "red");
    return false;
  }
}

function bail(message, noExit) {
  log(message, "red");
  if (noExit) throw new Error(message);
  process.exit(1);
}

/** Bỏ ExperimentalWarning (JSON import) từ Lighthouse / Node 20+ */
function envWithLighthouseNodeOptions() {
  const flag = "--disable-warning=ExperimentalWarning";
  const cur = process.env.NODE_OPTIONS || "";
  const merged = cur.includes("disable-warning=ExperimentalWarning")
    ? cur
    : [cur, flag].filter(Boolean).join(" ").trim();
  return { ...process.env, NODE_OPTIONS: merged };
}

/**
 * @param {string} url
 * @param {{ noExit?: boolean, minScore?: number }} [options]
 * @returns {{ performanceScore: number, passedBudget: boolean, reportPath: string, jsonPath: string, minScore: number }}
 */
function runLighthouse(url = "http://localhost:3000", options = {}) {
  const noExit = Boolean(options.noExit);
  const minScore = resolveMinScore(options.minScore);

  log("🔍 Running Lighthouse Performance Audit", "cyan");
  log("=========================================", "cyan");
  console.log("");

  if (!checkLighthouseInstalled()) {
    log("⚠️  Lighthouse not found. Installing...", "yellow");
    if (!installLighthouse()) {
      bail("❌ Cài Lighthouse: npm install -g lighthouse", noExit);
    }
  }

  log(`🌐 Testing URL: ${url}`, "cyan");
  log(
    "ℹ️  npm start (dev) → bundle lớn, LCP/TTI thường thấp; cảnh báo source map là bình thường.",
    "dim"
  );
  log(
    "   Production: npm run build && npx serve -s build -l 3000 → PERF_URL=http://localhost:3000 npm run perf:check",
    "dim"
  );
  console.log("");

  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, {
      stdio: "pipe",
    });
  } catch {
    bail(`❌ Không truy cập được ${url}. Chạy server hoặc đặt PERF_URL (vd. serve build).`, noExit);
  }

  const outputDir = "lighthouse-reports";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportBase = path.join(outputDir, `lighthouse-${timestamp}`);
  const reportPath = `${reportBase}.report.html`;
  const jsonPath = `${reportBase}.report.json`;

  log("⏳ Running Lighthouse audit (this may take a minute)...", "cyan");
  console.log("");

  try {
    execSync(
      `lighthouse ${url} ` +
        `--output=html,json ` +
        `--output-path=${reportBase} ` +
        `--only-categories=performance ` +
        `--chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" ` +
        `--preset=${process.env.LIGHTHOUSE_PRESET || "desktop"} ` +
        `--quiet`,
      { stdio: "inherit", env: envWithLighthouseNodeOptions() }
    );

    let attempts = 0;
    let jsonReport = null;
    while (attempts < 5 && !jsonReport) {
      try {
        if (fs.existsSync(jsonPath)) {
          jsonReport = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        } else {
          throw new Error(`File not found: ${jsonPath}`);
        }
      } catch {
        attempts++;
        if (attempts < 5) {
          const until = Date.now() + 1000;
          while (Date.now() < until) {}
        }
      }
    }

    if (!jsonReport) {
      throw new Error(`Could not read lighthouse report from ${jsonPath}`);
    }

    const scores = jsonReport.categories;
    const performanceScore = scores.performance?.score
      ? Math.round(scores.performance.score * 100)
      : 0;
    const passedBudget = performanceScore >= minScore;

    console.log("");
    log("📊 Lighthouse Performance Scores:", "cyan");
    console.log("");

    const scoreColor = performanceScore >= 90 ? "green" : performanceScore >= 50 ? "yellow" : "red";
    log(`Performance Score: ${performanceScore}/100 (budget ≥ ${minScore})`, scoreColor);
    console.log("");

    const metrics = jsonReport.audits;
    const keyMetrics = [
      "first-contentful-paint",
      "largest-contentful-paint",
      "total-blocking-time",
      "cumulative-layout-shift",
      "speed-index",
      "interactive",
    ];

    log("📈 Key Metrics:", "cyan");
    keyMetrics.forEach((metric) => {
      const audit = metrics[metric];
      if (audit) {
        const value = formatAuditValue(audit);
        const score = audit.score !== null ? Math.round(audit.score * 100) : "N/A";
        const status = audit.score >= 0.9 ? "✅" : audit.score >= 0.5 ? "⚠️" : "❌";
        log(
          `  ${status} ${audit.title}: ${value} (Score: ${score})`,
          audit.score >= 0.9 ? "green" : audit.score >= 0.5 ? "yellow" : "red"
        );
      }
    });

    console.log("");
    log(`📄 HTML Report: ${reportPath}`, "cyan");
    log(`📄 JSON Report: ${jsonPath}`, "cyan");
    console.log("");

    if (performanceScore < 90) {
      log("💡 Performance Recommendations:", "yellow");
      const opportunities = Object.values(jsonReport.audits)
        .filter((audit) => audit.details?.type === "opportunity" && audit.score < 1)
        .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
        .slice(0, 5);
      opportunities.forEach((opportunity) => {
        const savings = opportunity.numericValue ? formatBytes(opportunity.numericValue) : "";
        log(
          `  • ${opportunity.title}${savings ? ` (Potential savings: ${savings})` : ""}`,
          "yellow"
        );
      });
      console.log("");
    }

    if (passedBudget) {
      log(`✅ Đạt budget Lighthouse (≥ ${minScore}).`, "green");
    } else {
      log(`❌ Chưa đạt budget: ${performanceScore}/100 < ${minScore}.`, "red");
      log(
        `   Dev server: thử LIGHTHOUSE_MIN_SCORE=50 hoặc đo trên build production (serve).`,
        "yellow"
      );
    }

    if (!noExit && !passedBudget) {
      process.exit(1);
    }

    return {
      performanceScore,
      passedBudget,
      reportPath,
      jsonPath,
      minScore,
    };
  } catch (error) {
    log(`❌ Lighthouse audit failed: ${error.message}`, "red");
    if (noExit) throw error;
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/** Ưu tiên displayValue của Lighthouse; fallback format ms → s */
function formatAuditValue(audit) {
  if (audit.displayValue) return audit.displayValue;
  const n = audit.numericValue;
  if (n == null) return "N/A";
  const id = audit.id || "";
  const timeLike =
    id.includes("paint") ||
    id === "speed-index" ||
    id === "interactive" ||
    id === "total-blocking-time" ||
    id === "max-potential-fid";
  if (timeLike && typeof n === "number") {
    if (id === "total-blocking-time" || n < 2000) return `${Math.round(n)} ms`;
    return `${(n / 1000).toFixed(2)} s`;
  }
  if (typeof n === "number" && Math.abs(n) < 1) return n.toFixed(3);
  if (typeof n === "number") return Number.isInteger(n) ? String(n) : n.toFixed(2);
  return String(n);
}

if (require.main === module) {
  const url = process.argv[2] || process.env.PERF_URL || "http://localhost:3000";
  runLighthouse(url, { noExit: false });
}

module.exports = { runLighthouse, resolveMinScore };
