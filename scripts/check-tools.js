#!/usr/bin/env node

/**
 * =============================================================================
 * 🔧 Development Tools Check
 * =============================================================================
 * Check all required and optional development tools
 * =============================================================================
 */

const { execSync } = require("child_process");
let chalk;
try {
  chalk = require("chalk");
} catch (error) {
  chalk = {
    green: (s) => s,
    red: (s) => s,
    gray: (s) => s,
    yellow: (s) => s,
  };
}

const tools = {
  node: { desc: "JavaScript Runtime", required: true },
  npm: { desc: "Package Manager", required: true },
  cargo: { desc: "Rust Package Manager", required: false },
  rustc: { desc: "Rust Compiler", required: false },
  python3: { desc: "Python Runtime", required: true },
  pip3: { desc: "Python Package Manager", required: true },
  git: { desc: "Version Control", required: true },
};

console.log("\n🔧 Development Tools Check:\n");
console.log("=".repeat(60) + "\n");

let allRequiredFound = true;

Object.entries(tools).forEach(([tool, { desc, required }]) => {
  try {
    const version = execSync(`${tool} --version`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    })
      .split("\n")[0]
      .trim();

    const status = required ? "✅" : "⚪";
    const label = required ? "REQUIRED" : "OPTIONAL";

    console.log(`${status} ${tool.padEnd(12)} - ${desc}`);
    console.log(`   ${version}`);
    console.log(`   [${label}]\n`);
  } catch (e) {
    const status = required ? "❌" : "⚪";
    const label = required ? "REQUIRED - MISSING!" : "OPTIONAL";

    console.log(`${status} ${tool.padEnd(12)} - ${desc}`);
    console.log(`   Not found ${!required ? "(optional)" : ""}`);
    console.log(`   [${label}]\n`);

    if (required) {
      allRequiredFound = false;
    }
  }
});

console.log("=".repeat(60));

if (allRequiredFound) {
  console.log("\n✅ All required tools are installed!\n");
  process.exit(0);
} else {
  console.log("\n❌ Some required tools are missing. Please install them.\n");
  console.log("📚 Installation guides:");
  console.log("   Node.js: https://nodejs.org/");
  console.log("   Python: https://python.org/");
  console.log("   Git: https://git-scm.com/\n");
  process.exit(1);
}
