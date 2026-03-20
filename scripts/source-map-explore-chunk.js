#!/usr/bin/env node
/**
 * Gọi source-map-explorer với đường dẫn tuyệt đối (tránh glob zsh + lỗi glob@10 với SME).
 *
 * Dùng:
 *   node scripts/source-map-explore-chunk.js           # chunk số lớn nhất có .map
 *   node scripts/source-map-explore-chunk.js auto      # giống trên
 *   node scripts/source-map-explore-chunk.js 714       # prefix cố định (ID đổi mỗi build)
 *
 * Cần .map: npm run build:maps
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const jsDir = path.join(process.cwd(), "build", "static", "js");
const arg = process.argv[2];
const wantAuto = !arg || arg === "auto" || arg === "largest";

function isNumericChunk(name) {
  return /^\d+\.[a-f0-9]+\.chunk\.js$/i.test(name);
}

function pickChunkFile() {
  if (!fs.existsSync(jsDir)) return null;

  if (!wantAuto) {
    const exact = fs
      .readdirSync(jsDir)
      .filter((n) => n.startsWith(`${arg}.`) && n.endsWith(".js") && !n.endsWith(".map"))
      .sort();
    if (exact.length) return exact[0];
    console.warn(`⚠️  Không có chunk "${arg}." — chọn chunk số lớn nhất có .map.\n`);
  }

  const numeric = fs.readdirSync(jsDir).filter(isNumericChunk);
  const scored = numeric
    .map((n) => {
      const fp = path.join(jsDir, n);
      return {
        n,
        size: fs.statSync(fp).size,
        hasMap: fs.existsSync(`${fp}.map`),
      };
    })
    .filter((x) => x.hasMap)
    .sort((a, b) => b.size - a.size);

  if (scored.length) return scored[0].n;

  return null;
}

if (!fs.existsSync(jsDir)) {
  console.error('❌ Chưa có build/static/js — chạy "npm run build" hoặc "npm run build:maps".');
  process.exit(1);
}

const chosen = pickChunkFile();
if (!chosen) {
  const sample = fs
    .readdirSync(jsDir)
    .filter((n) => n.endsWith(".js") && !n.endsWith(".map"))
    .slice(0, 15)
    .join("\n   ");
  console.error(
    "❌ Không chọn được chunk: không có chunk dạng số (*.chunk.js) kèm file .map.\n" +
      "   Chạy: npm run build:maps\n" +
      "   Một số file trong build/static/js:\n   " +
      sample
  );
  process.exit(1);
}

const js = path.join(jsDir, chosen);
const mapPath = `${js}.map`;
if (!fs.existsSync(mapPath)) {
  console.error(
    "❌ Thiếu .map cho file đã chọn.\n" +
      "   Chạy: npm run build:maps\n" +
      `   File: ${path.relative(process.cwd(), js)}`
  );
  process.exit(1);
}

console.log(`📦 Chunk: ${chosen} (${(fs.statSync(js).size / 1024).toFixed(1)} KB)\n`);

// --no-border-checks: tránh lỗi "column Infinity" với map từ Terser/webpack 5 + CRA
const smeFlags = ["--no-border-checks"];
const cmd = `npx source-map-explorer "${js}" ${smeFlags.join(" ")}`;
console.log("→", cmd, "\n");
try {
  execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
} catch (err) {
  const code = err.status ?? 1;
  console.error("\n❌ source-map-explorer kết thúc với mã", code);
  process.exit(code);
}
