#!/usr/bin/env node

/**
 * 🦀 Cargo/Rust — thông tin cài đặt (tùy chọn cho WASM/Rust; frontend không bắt buộc)
 */

const { execSync } = require("child_process");

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

console.log("\n🦀 Cargo/Rust Status:\n");
console.log("=".repeat(60));

const cargoVersion = safeExec("cargo --version");
if (!cargoVersion) {
  console.log("\n⚪ Cargo chưa cài — **tùy chọn** (chỉ cần nếu làm Rust / WebAssembly).\n");
  console.log("   React/Node backend chạy bình thường không cần Rust.\n");
  console.log("📥 Cài đặt (macOS/Linux):");
  console.log("   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh");
  console.log("   hoặc: brew install rustup-init && rustup-init\n");
  console.log("📥 Windows: https://rustup.rs/\n");
  console.log("🔗 https://www.rust-lang.org/\n");
  console.log("=".repeat(60) + "\n");
  process.exit(0);
}

const cargoLocation = safeExec("which cargo") || "(unknown)";

console.log("\n✅ Cargo (Rust Package Manager)");
console.log(`   Version: ${cargoVersion}`);
console.log(`   Location: ${cargoLocation}`);

const rustcVersion = safeExec("rustc --version");
if (rustcVersion) {
  console.log("\n✅ Rustc (Rust Compiler)");
  console.log(`   Version: ${rustcVersion}`);
} else {
  console.log("\n⚠️  Rustc not found separately (usually bundled with cargo)");
}

const rustupVersion = safeExec("rustup --version");
if (rustupVersion) {
  console.log("\n✅ Rustup (Rust Toolchain Manager)");
  console.log(`   Version: ${rustupVersion}`);
} else {
  console.log("\n⚪ Rustup not found (optional)");
}

const targets = safeExec("rustup target list --installed");
if (targets) {
  console.log("\n📦 Installed Rust Targets:");
  targets.split("\n").forEach((target) => {
    if (target.trim()) console.log(`   • ${target.trim()}`);
  });
}

console.log("\n" + "=".repeat(60));
console.log("\n💡 Ready for Rust/WebAssembly integration!");
console.log("\n📚 To add WebAssembly support:");
console.log("   rustup target add wasm32-unknown-unknown");
console.log("   cargo install wasm-pack\n");
