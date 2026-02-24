#!/usr/bin/env node

/**
 * Cargo optimization advisor
 * - Safe checks only
 * - No destructive actions
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function findCargoTomls(dir, maxDepth = 4, depth = 0, acc = []) {
  if (depth > maxDepth) return acc;
  const skip = new Set(["node_modules", ".git", "build", "dist", "venv", ".venv", "__pycache__"]);

  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name === "Cargo.toml") {
      acc.push(fullPath);
      continue;
    }

    if (entry.isDirectory()) {
      findCargoTomls(fullPath, maxDepth, depth + 1, acc);
    }
  }

  return acc;
}

function getReleaseSection(content) {
  const match = content.match(/\[profile\.release\]([\s\S]*?)(\n\[|$)/m);
  return match ? match[1] : "";
}

function hasKey(section, key) {
  return new RegExp(`^\\s*${key}\\s*=`, "m").test(section);
}

function checkCargoToml(cargoTomlPath) {
  const content = fs.readFileSync(cargoTomlPath, "utf8");
  const releaseSection = getReleaseSection(content);

  const checks = [
    { key: "opt-level", recommendation: "opt-level = 3" },
    { key: "lto", recommendation: "lto = true" },
    { key: "codegen-units", recommendation: "codegen-units = 1" },
    { key: "panic", recommendation: 'panic = "abort"' },
    { key: "strip", recommendation: "strip = true" },
  ];

  const missing = [];
  for (const item of checks) {
    if (!hasKey(releaseSection, item.key)) {
      missing.push(item.recommendation);
    }
  }

  return {
    cargoTomlPath,
    hasReleaseSection: Boolean(releaseSection),
    missing,
  };
}

function main() {
  console.log("\n🦀 Cargo Optimization Advisor\n");

  try {
    console.log(`✅ Cargo: ${run("cargo --version")}`);
  } catch {
    console.log("❌ Cargo chưa được cài đặt");
    console.log("   Install: https://rustup.rs/");
    process.exit(1);
  }

  try {
    console.log(`✅ Rustc: ${run("rustc --version")}`);
  } catch {
    console.log("⚠️  Rustc chưa sẵn sàng");
  }

  try {
    run("rustup --version");
    const installedTargets = run("rustup target list --installed");
    if (installedTargets.includes("wasm32-unknown-unknown")) {
      console.log("✅ WASM target: wasm32-unknown-unknown (installed)");
    } else {
      console.log("⚠️  WASM target chưa cài đặt");
      console.log("   Run: rustup target add wasm32-unknown-unknown");
    }
  } catch {
    console.log("⚪ Rustup không khả dụng (optional)");
  }

  const root = process.cwd();
  const cargoTomls = findCargoTomls(root);

  if (cargoTomls.length === 0) {
    console.log("\nℹ️  Chưa có Cargo.toml trong workspace.");
    console.log("   Nếu muốn tối ưu Rust/WASM, tạo crate trước rồi chạy lại cargo:optimize.");
    process.exit(0);
  }

  console.log(`\n📦 Found ${cargoTomls.length} Cargo project(s):`);

  let totalMissing = 0;
  for (const filePath of cargoTomls) {
    const result = checkCargoToml(filePath);
    const relativePath = path.relative(root, result.cargoTomlPath);
    console.log(`\n- ${relativePath}`);

    if (!result.hasReleaseSection) {
      console.log("  ⚠️  Missing [profile.release] section");
      console.log("  Suggested baseline:");
      console.log("    [profile.release]");
      console.log("    opt-level = 3");
      console.log("    lto = true");
      console.log("    codegen-units = 1");
      console.log('    panic = "abort"');
      console.log("    strip = true");
      totalMissing += 5;
      continue;
    }

    if (result.missing.length === 0) {
      console.log("  ✅ Release profile looks optimized");
    } else {
      console.log("  ⚠️  Missing optimizations:");
      result.missing.forEach((item) => console.log(`    - ${item}`));
      totalMissing += result.missing.length;
    }
  }

  console.log("\n📋 Next commands:");
  console.log("   cargo build --release");
  console.log("   cargo test --release");
  console.log("   cargo clippy --all-targets --all-features");

  if (totalMissing > 0) {
    process.exitCode = 1;
  }
}

main();
