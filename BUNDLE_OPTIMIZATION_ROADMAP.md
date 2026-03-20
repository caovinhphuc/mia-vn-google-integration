# 🚀 Bundle Optimization Roadmap

**Date**: January 22, 2026 (budget script cập nhật 03/2026)
**Current Status**: `npm run perf:budget` dùng **initial JS** (main+app-root) + **hard limits** — phù hợp code-split; tổng chunk vẫn ~2.3MB (lazy).
**Target**: Giữ initial <400KB; tách vendor (714/648); tổng transfer nhỏ hơn nhờ gzip/brotli

---

## 📊 Current State Analysis

### Bundle Size Breakdown:

- **JavaScript**: 2.29 MB (Target: 250 KB) - **938% over budget** ⚠️
- **CSS**: 80.51 KB (Target: 50 KB) - **161% over budget** ⚠️
- **Total**: 2.36 MB (Target: 1 MB) - **236% over budget** ⚠️

### Largest Chunks:

1. `main.f4586a96.js` - **694.58 KB** (main bundle)
2. `714.d25ea931.chunk.js` - **359.75 KB** (likely Ant Design)
3. `849.762801d3.chunk.js` - **165.46 KB**
4. `856.089d1f99.chunk.js` - **118.94 KB**
5. `255.ba2dfe53.chunk.js` - **116.84 KB**

---

## ✅ Completed Optimizations (Jan 22, 2026)

1. ✅ **Removed unused dependencies**:
   - `cors`, `express`, `lodash-es` (saved ~50KB)
   - Unused devDependencies (11 packages)

2. ✅ **Verified icon imports**:
   - All files use specific icon imports (not wildcard)
   - Already optimized

---

## 🎯 Phase 1: Quick Wins (Target: -30%, Save ~700KB)

### 1.1 Split Main Bundle

**Impact**: High | **Effort**: Medium | **Time**: 2-3 hours

**Current Issue**: `main.f4586a96.js` is 694KB

**Actions**:

```javascript
// In src/App.jsx - Add more lazy loading
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Settings = React.lazy(() => import("./pages/Settings"));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>;
```

**Expected Savings**: ~200-300 KB

### 1.2 Optimize Ant Design Imports

**Impact**: High | **Effort**: Low | **Time**: 1 hour

**Current Issue**: `714.d25ea931.chunk.js` (360KB) likely contains full Ant Design

**Actions**:

1. Add babel-plugin-import for tree-shaking:

```bash
npm install --save-dev babel-plugin-import
```

2. Update `.babelrc` or `babel.config.js`:

```javascript
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": "css"
    }]
  ]
}
```

**Expected Savings**: ~150-200 KB

### 1.3 Remove Moment.js (if used)

**Impact**: Medium | **Effort**: Low | **Time**: 30 min

**Actions**:

```bash
# Check if moment is used
npm ls moment

# If found, replace with dayjs
npm uninstall moment
npm install dayjs

# Update imports
# From: import moment from 'moment';
# To: import dayjs from 'dayjs';
```

**Expected Savings**: ~70 KB

### 1.4 Dynamic Imports for Charts

**Impact**: Medium | **Effort**: Low | **Time**: 1 hour

**Current**: Recharts loaded upfront

**Actions**:

```javascript
// Lazy load chart components
const AreaChart = React.lazy(() => import("recharts").then((m) => ({ default: m.AreaChart })));
const BarChart = React.lazy(() => import("recharts").then((m) => ({ default: m.BarChart })));
const LineChart = React.lazy(() => import("recharts").then((m) => ({ default: m.LineChart })));
```

**Expected Savings**: ~80-100 KB (loaded only when needed)

---

## 🎯 Phase 2: Major Optimizations (Target: -40%, Save ~500KB)

### 2.1 Code Splitting by Route

**Impact**: High | **Effort**: High | **Time**: 4-6 hours

**Actions**:

1. Create route-based code splitting:

```javascript
// src/routes/index.js
export const routes = [
  {
    path: "/dashboard",
    component: lazy(() => import("../pages/Dashboard")),
  },
  {
    path: "/analytics",
    component: lazy(() => import("../pages/Analytics")),
  },
  // ... more routes
];
```

2. Implement preloading for likely routes:

```javascript
// Preload dashboard when hovering navigation
<Link to="/dashboard" onMouseEnter={() => import("../pages/Dashboard")}>
  Dashboard
</Link>
```

**Expected Savings**: ~300-400 KB

### 2.2 Optimize Google APIs

**Impact**: High | **Effort**: Medium | **Time**: 2-3 hours

**Current Issue**: `googleapis` package is 500KB

**Actions**:

1. Move Google API calls to backend:

```javascript
// Instead of using googleapis in frontend
// Create backend proxy endpoints
// Backend: GET /api/google/sheets/:id
// Frontend: axios.get('/api/google/sheets/:id')
```

2. Only load Google API scripts when needed:

```javascript
// Dynamic script loading
const loadGoogleAPI = () => {
  return new Promise((resolve) => {
    if (window.gapi) return resolve();
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
};
```

**Expected Savings**: ~200-300 KB

### 2.3 Vendor Bundle Splitting

**Impact**: Medium | **Effort**: Low | **Time**: 1 hour

**Actions**:
Create custom webpack config (if using craco):

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
          },
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: "antd",
            priority: 20,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: "recharts",
            priority: 20,
          },
        },
      };
      return webpackConfig;
    },
  },
};
```

**Expected Savings**: Better caching, ~50KB effective reduction

---

## 🎯 Phase 3: Advanced Optimizations (Target: -20%, Save ~300KB)

### 3.1 Tree Shaking Optimization

**Impact**: Medium | **Effort**: Medium | **Time**: 2-3 hours

**Actions**:

1. Ensure all imports are ES6 modules
2. Remove unused exports
3. Enable production mode optimizations

### 3.2 Compression & CDN

**Impact**: High | **Effort**: Low | **Time**: 1 hour

**Actions**:

1. Enable Brotli compression:

```javascript
// In build process
const CompressionPlugin = require("compression-webpack-plugin");

plugins: [
  new CompressionPlugin({
    filename: "[path][base].br",
    algorithm: "brotliCompress",
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
];
```

2. Serve static assets from CDN

**Expected Savings**: ~40-50% size reduction with compression

### 3.3 Image & Asset Optimization

**Impact**: Low (no images currently) | **Effort**: Low

**Actions**:

- Use WebP format for images
- Lazy load images with `loading="lazy"`
- Use responsive images with srcset

---

## 📋 Implementation Checklist

### Week 1: Quick Wins

- [ ] Implement route-based code splitting
- [ ] Add babel-plugin-import for Ant Design
- [ ] Remove moment.js (if used)
- [ ] Dynamic import for charts
- [ ] **Target**: Reduce to 1.6 MB (-700KB)

### Week 2: Major Optimizations

- [ ] Move Google APIs to backend
- [ ] Implement vendor bundle splitting
- [ ] Add route preloading
- [ ] **Target**: Reduce to 1.1 MB (-500KB)

### Week 3: Advanced

- [ ] Enable Brotli compression
- [ ] Tree shaking audit
- [ ] Performance monitoring setup
- [ ] **Target**: Reduce to < 1 MB

---

## 📊 Expected Results Timeline

| Phase      | Timeline    | Size Reduction     | Final Size | Status      |
| ---------- | ----------- | ------------------ | ---------- | ----------- |
| Baseline   | -           | -                  | 2.36 MB    | ✅ Current  |
| Phase 1    | Week 1      | -700 KB (-30%)     | 1.66 MB    | ⏳ Pending  |
| Phase 2    | Week 2      | -500 KB (-21%)     | 1.16 MB    | ⏳ Pending  |
| Phase 3    | Week 3      | -300 KB (-13%)     | 860 KB     | ⏳ Pending  |
| **Target** | **3 weeks** | **-1.5 MB (-64%)** | **< 1 MB** | 🎯 **Goal** |

---

## 🚀 Quick Start Commands

### Analyze current bundle:

```bash
npm run build -- --stats
npm run analyze:bundle
npm run perf:bundle
```

### Build optimized:

```bash
npm run build:optimized
```

### Monitor bundle size:

```bash
npm run perf:check
```

---

## 📚 Resources

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Ant Design Tree Shaking](https://ant.design/docs/react/getting-started#import-on-demand)
- [Web.dev Performance](https://web.dev/fast/)

---

**Next Action**: Start with Phase 1.1 - Split Main Bundle
**Owner**: Development Team
**Priority**: High
**Deadline**: End of Week 1
