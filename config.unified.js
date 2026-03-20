/**
 * =============================================================================
 * 🎯 Unified Configuration - React OAS Integration v4.0
 * =============================================================================
 * Central configuration hub for all automation, deployment, and optimization
 * =============================================================================
 */

module.exports = {
  // ============================================================================
  // PROJECT INFO
  // ============================================================================
  project: {
    name: "React OAS Integration",
    version: "4.0.0",
    description: "AI-Powered Warehouse Management Platform",
    repository: "https://github.com/caovinhphuc/React-OAS-Integration-v4.0",
  },

  // ============================================================================
  // PERFORMANCE BUDGETS
  // ============================================================================
  performance: {
    budgets: {
      // Đồng bộ scripts/performance-bundle.js (SPA code-split)
      initialJavascript: 400 * 1024,
      totalJavascriptSoft: 2.8 * 1024 * 1024,
      totalJavascriptHard: 5 * 1024 * 1024,
      css: 130 * 1024,
      images: 500 * 1024,
      fonts: 100 * 1024,
      totalBuild: 5 * 1024 * 1024,
    },
    current: {
      initialJavascriptApprox: 163 * 1024,
      javascriptAllChunks: 2.33 * 1024 * 1024,
      css: 97 * 1024,
      images: 0,
      fonts: 0,
      totalBuild: 2.51 * 1024 * 1024,
    },
    thresholds: {
      warning: 0.8, // 80% of budget
      error: 1.0, // 100% of budget
    },
  },

  // ============================================================================
  // BUILD OPTIMIZATION
  // ============================================================================
  optimization: {
    enabled: true,
    strategies: [
      {
        name: "Code Splitting",
        priority: "high",
        impact: "Reduce initial bundle by 40-60%",
        implementation: "React.lazy() for routes",
      },
      {
        name: "Tree Shaking",
        priority: "high",
        impact: "Remove unused Ant Design components (~500KB)",
        implementation: "babel-plugin-import",
      },
      {
        name: "Dynamic Imports",
        priority: "medium",
        impact: "Lazy load heavy libraries (charts, socket.io)",
        implementation: "import() for non-critical features",
      },
      {
        name: "Compression",
        priority: "high",
        impact: "Reduce transfer size by 70-80%",
        implementation: "gzip/brotli on server",
      },
    ],
    targets: {
      mainBundle: { current: 694, target: 250, unit: "KB" },
      totalJS: { current: 2330, target: 500, unit: "KB" },
      totalCSS: { current: 80, target: 50, unit: "KB" },
    },
  },

  // ============================================================================
  // CARGO / RUST INTEGRATION
  // ============================================================================
  cargo: {
    enabled: false, // Set to true when Rust integration is needed
    optional: true,
    futureUse: [
      "WebAssembly modules for data processing",
      "Performance-critical calculations",
      "CSV/Excel parsing acceleration",
      "Cryptographic operations",
    ],
    scripts: {
      check: "cargo --version",
      build: "cargo build --release",
      wasm: "cargo build --target wasm32-unknown-unknown --release",
      test: "cargo test",
    },
    dependencies: {
      required: ["wasm-pack", "wasm-bindgen"],
      optional: ["cargo-audit", "cargo-clippy"],
    },
  },

  // ============================================================================
  // DEPLOYMENT
  // ============================================================================
  deployment: {
    platforms: {
      netlify: {
        enabled: true,
        domain: "mia-logistics.netlify.app",
        buildCommand: "npm run build:prod",
        publishDir: "build",
        autoPublish: true,
      },
      render: {
        enabled: true,
        services: ["backend", "ai-service"],
        autoPublish: true,
      },
      vercel: {
        enabled: false,
        requiresLinking: true,
      },
    },
    github: {
      enabled: true,
      branch: "main",
      autoDeployOnPush: true,
      actions: ["build", "test", "deploy"],
    },
  },

  // ============================================================================
  // AUTOMATION
  // ============================================================================
  automation: {
    analysis: {
      onBuild: true,
      onCommit: false, // Set to true to analyze before commit
      frequency: "on-demand",
    },
    optimization: {
      autoSuggest: true,
      autoFix: false, // Manual approval required
    },
    monitoring: {
      bundleSize: true,
      performance: true,
      dependencies: true,
      security: true,
    },
  },

  // ============================================================================
  // DEVELOPMENT TOOLS
  // ============================================================================
  tools: {
    required: {
      node: ">=18.0.0",
      npm: ">=8.0.0",
      python: ">=3.8.0",
    },
    optional: {
      cargo: ">=1.70.0",
      rustc: ">=1.70.0",
    },
    recommended: {
      vscode: "Latest",
      git: ">=2.30.0",
    },
  },

  // ============================================================================
  // PATHS
  // ============================================================================
  paths: {
    root: process.cwd(),
    src: "src",
    build: "build",
    scripts: "scripts",
    backend: "backend",
    automation: "automation",
    docs: "docs",
    reports: "reports",
    backups: "backups",
  },

  // ============================================================================
  // SCRIPTS REGISTRY
  // ============================================================================
  scripts: {
    build: {
      prod: "npm run build:prod",
      optimized: "npm run build:optimized",
      analyze: "npm run build:analyze",
      stats: "npm run build:stats",
    },
    analyze: {
      bundle: "npm run analyze:bundle",
      deps: "npm run analyze:deps",
      full: "npm run analyze:full",
      auto: "npm run analyze:auto",
    },
    optimize: {
      bundle: "npm run optimize:bundle",
      suggestions: "npm run optimize:suggestions",
    },
    cargo: {
      check: "npm run cargo:check",
      info: "npm run cargo:info",
    },
    tools: {
      check: "npm run tools:check",
    },
    perf: {
      bundle: "npm run perf:bundle",
      budget: "npm run perf:budget",
      check: "npm run perf:check",
    },
  },

  // ============================================================================
  // PRIORITIES
  // ============================================================================
  priorities: {
    immediate: [
      "Implement React.lazy() for route-based code splitting",
      "Add babel-plugin-import for Ant Design tree-shaking",
      "Enable gzip/brotli compression on deployment",
    ],
    shortTerm: [
      "Replace large dependencies with lighter alternatives",
      "Optimize image assets",
      "Set up bundle size monitoring in CI",
    ],
    longTerm: [
      "Explore WebAssembly integration for CPU-intensive tasks",
      "Implement service worker for offline support",
      "Set up CDN for static assets",
    ],
  },
};
