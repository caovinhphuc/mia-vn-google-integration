#!/usr/bin/env node

/**
 * Performance Bundle Size Checker
 * Budget phù hợp SPA code-split (CRA): kiểm tra JS khởi tạo (main + app-root),
 * không fail vì tổng mọi chunk (~2.3MB) — đó là lazy load theo route.
 */

const fs = require("fs");
const path = require("path");

/**
 * initialJavascript: main + app-root (đường tải đầu sau lazy index)
 * totalJavascript: mọi .js trong build (tham chiếu, cảnh báo mềm)
 * css: mọi .css trong build
 * totalBuild: toàn build/ (trần an toàn chống phình bất thường)
 */
const BUDGET = {
  initialJavascript: 400 * 1024,
  totalJavascriptSoft: 2.8 * 1024 * 1024,
  totalJavascriptHard: 5 * 1024 * 1024,
  css: 130 * 1024,
  images: 500 * 1024,
  fonts: 100 * 1024,
  totalBuild: 5 * 1024 * 1024,
};

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

function getDirectorySize(dir, extensions = []) {
  let size = 0;
  const files = [];

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);
    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.length === 0 || extensions.some((ext) => item.endsWith(ext))) {
          size += stat.size;
          files.push({ path: fullPath, size: stat.size });
        }
      } catch {
        // skip
      }
    });
  }

  traverse(dir);
  return { size, files };
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/** JS tải ngay sau bootstrap: main.*.js + app-root.*.chunk.js (nếu có) */
function getInitialJsSize(buildDir) {
  const jsDir = path.join(buildDir, "static", "js");
  if (!fs.existsSync(jsDir)) return { size: 0, files: [] };

  const matchers = [/^main\.[a-f0-9]+\.js$/i, /^app-root\.[a-f0-9]+\.chunk\.js$/i];
  let size = 0;
  const files = [];

  for (const name of fs.readdirSync(jsDir)) {
    if (!name.endsWith(".js") || name.endsWith(".map")) continue;
    if (!matchers.some((re) => re.test(name))) continue;
    const fp = path.join(jsDir, name);
    const s = fs.statSync(fp).size;
    size += s;
    files.push({ path: fp, size: s });
  }
  return { size, files };
}

/**
 * @returns {{ ok: boolean, results: object }}
 */
function checkBundleSize() {
  log("📦 Performance Bundle Size Checker", "cyan");
  log("=====================================", "cyan");
  console.log("");

  const buildDir = "build";

  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run "npm run build" first.', "red");
    return { ok: false, results: null, error: "no_build" };
  }

  const initialJs = getInitialJsSize(buildDir);
  const jsSize = getDirectorySize(buildDir, [".js"]);
  const cssSize = getDirectorySize(buildDir, [".css"]);
  const imageSize = getDirectorySize(buildDir, [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]);
  const fontSize = getDirectorySize(buildDir, [".woff", ".woff2", ".ttf", ".eot"]);
  const totalSize = getDirectorySize(buildDir);

  const initialOk = initialJs.size <= BUDGET.initialJavascript;
  const cssOk = cssSize.size <= BUDGET.css;
  const imagesOk = imageSize.size <= BUDGET.images;
  const fontsOk = fontSize.size <= BUDGET.fonts;
  const totalOk = totalSize.size <= BUDGET.totalBuild;
  const totalJsOk = jsSize.size <= BUDGET.totalJavascriptHard;

  const results = {
    initialJavascript: {
      size: initialJs.size,
      budget: BUDGET.initialJavascript,
      status: initialOk,
      note: "main + app-root (critical path)",
    },
    totalJavascript: {
      size: jsSize.size,
      budgetSoft: BUDGET.totalJavascriptSoft,
      budgetHard: BUDGET.totalJavascriptHard,
      status: totalJsOk,
      warnSoft:
        jsSize.size > BUDGET.totalJavascriptSoft && jsSize.size <= BUDGET.totalJavascriptHard,
    },
    css: {
      size: cssSize.size,
      budget: BUDGET.css,
      status: cssOk,
    },
    images: {
      size: imageSize.size,
      budget: BUDGET.images,
      status: imagesOk,
    },
    fonts: {
      size: fontSize.size,
      budget: BUDGET.fonts,
      status: fontsOk,
    },
    totalBuild: {
      size: totalSize.size,
      budget: BUDGET.totalBuild,
      status: totalOk,
    },
  };

  const allPassed = initialOk && totalJsOk && cssOk && imagesOk && fontsOk && totalOk;

  console.log("📊 Bundle Size Report:");
  console.log("");

  log(
    `${initialOk ? "✅" : "❌"} INITIAL JS (critical): ${formatBytes(initialJs.size).padEnd(12)} / ${formatBytes(BUDGET.initialJavascript)} — ${results.initialJavascript.note}`,
    initialOk ? "green" : "red"
  );
  if (initialJs.files.length) {
    initialJs.files.forEach((f) => {
      log(`     • ${path.relative(buildDir, f.path)}  ${formatBytes(f.size)}`, "dim");
    });
  }

  const jsSoftWarn = results.totalJavascript.warnSoft;
  const jsLine = `${totalJsOk ? "✅" : "❌"} TOTAL JS (all chunks): ${formatBytes(jsSize.size).padEnd(12)} soft ${formatBytes(BUDGET.totalJavascriptSoft)} / hard ${formatBytes(BUDGET.totalJavascriptHard)}`;
  log(jsLine, totalJsOk ? (jsSoftWarn ? "yellow" : "green") : "red");
  if (jsSoftWarn) {
    log("   ⚠️  Vượt ngưỡng mềm — lazy routes OK; cân nhắc tách vendor (analyze)", "yellow");
  }

  const rowLabel = {
    css: "CSS",
    images: "IMAGES",
    fonts: "FONTS",
    totalBuild: "TOTAL BUILD",
  };
  Object.entries(results).forEach(([type, data]) => {
    if (type === "initialJavascript" || type === "totalJavascript") return;
    const ok = data.status;
    const label = (rowLabel[type] || type).padEnd(14);
    log(
      `${ok ? "✅" : "❌"} ${label}: ${formatBytes(data.size).padEnd(12)} / ${formatBytes(data.budget)}`,
      ok ? "green" : "red"
    );
  });

  console.log("");

  console.log("📁 Largest Files:");
  const allFiles = [...jsSize.files, ...cssSize.files, ...imageSize.files, ...fontSize.files]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  allFiles.forEach((file, index) => {
    const relativePath = path.relative(buildDir, file.path);
    console.log(`  ${index + 1}. ${relativePath.padEnd(50)} ${formatBytes(file.size)}`);
  });

  console.log("");

  if (!allPassed) {
    log("💡 Recommendations:", "yellow");
    if (!initialOk) {
      log("  • Giảm main/app-root: lazy thêm ở index hoặc gỡ import nặng khỏi entry", "yellow");
    }
    if (!totalJsOk) {
      log("  • Tổng JS > hard limit — npm run analyze, googleapis chỉ backend", "yellow");
    }
    if (!cssOk) {
      log("  • Rà CSS / Tailwind purge", "yellow");
    }
    if (!totalOk) {
      log("  • Build tổng quá lớn — kiểm tra asset thừa trong build/", "yellow");
    }
    console.log("");
    log("⚠️  Bundle size exceeds performance budget!", "red");
  } else {
    log("✅ All bundle checks passed (initial path + hard limits).", "green");
    if (jsSoftWarn) {
      log("ℹ️  Có cảnh báo mềm tổng JS — xem trên.", "yellow");
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    budget: BUDGET,
    sizes: Object.fromEntries(
      Object.entries(results).map(([key, value]) => [
        key,
        {
          size: value.size,
          budget: value.budget ?? value.budgetHard,
          percentage:
            value.budget != null
              ? ((value.size / value.budget) * 100).toFixed(1)
              : ((value.size / value.budgetHard) * 100).toFixed(1),
          status: value.status,
        },
      ])
    ),
    largestFiles: allFiles.map((f) => ({
      path: path.relative(buildDir, f.path),
      size: f.size,
    })),
  };

  fs.writeFileSync("bundle-report.json", JSON.stringify(report, null, 2));
  log("📄 Report saved to bundle-report.json", "cyan");

  return { ok: allPassed, results };
}

if (require.main === module) {
  const { ok } = checkBundleSize();
  process.exit(ok ? 0 : 1);
}

module.exports = { checkBundleSize, BUDGET };
