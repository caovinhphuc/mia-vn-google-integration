# 📦 Bundle Optimization Guide - React OAS Integration v4.0

## 🎯 Mục tiêu

Giảm bundle size để cải thiện:

- ⚡ Tốc độ tải trang (Load Time)
- 📱 Trải nghiệm mobile
- 💰 Chi phí bandwidth
- 🚀 Performance tổng thể

---

## 📊 Phân tích Bundle

### 1. Chạy Bundle Analyzer

```bash
# Phân tích toàn diện (RECOMMENDED) ✅
npm run perf:bundle

# Generate bundle stats ✅
npm run bundle:stats

# Phân tích visual ✅
npm run analyze:bundle

# Kiểm tra dependencies không dùng ✅
npm run perf:deps

# Kiểm tra size limits ✅
npm run perf:size

# Check all tools ✅
npm run check:tools
```

**Note**: Tất cả scripts đã được verified với command surface hiện tại (Feb 2026)

### 2. Hiểu Bundle Structure

```
build/
├── static/
│   ├── js/
│   │   ├── main.[hash].js      # Main application code
│   │   ├── [number].[hash].js  # Code-split chunks
│   │   └── runtime-main.[hash].js  # Webpack runtime
│   └── css/
│       └── main.[hash].css     # Compiled CSS
```

---

## 🔧 Optimization Strategies

### 1. Code Splitting (Ưu tiên cao)

#### Route-based Splitting

```javascript
// ❌ BAD: Import all at once
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// ✅ GOOD: Lazy load routes
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-based Splitting

```javascript
// ❌ BAD: Import heavy component directly
import HeavyChart from "./components/HeavyChart";

// ✅ GOOD: Lazy load heavy components
const HeavyChart = React.lazy(() => import("./components/HeavyChart"));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Spinner />}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}
```

---

### 2. Optimize Dependencies

#### Replace Large Libraries

```bash
# ❌ moment.js (~70KB)
npm uninstall moment

# ✅ dayjs (~2KB) - INSTALLED ✅
npm install dayjs
```

**Status**: ✅ dayjs đã được cài đặt (v1.11.19)

```javascript
// Before
import moment from "moment";
const date = moment().format("YYYY-MM-DD");

// After ✅ (Using dayjs)
import dayjs from "dayjs";
const date = dayjs().format("YYYY-MM-DD");
```

#### Optimize Lodash

```bash
# ❌ lodash (full bundle)
# ✅ lodash-es (tree-shakeable)
npm install lodash-es
```

```javascript
// ❌ BAD: Imports entire lodash
import _ from "lodash";
const result = _.debounce(fn, 300);

// ✅ GOOD: Import specific functions
import { debounce } from "lodash-es";
const result = debounce(fn, 300);

// ✅ BETTER: Import from specific path
import debounce from "lodash/debounce";
const result = debounce(fn, 300);
```

#### Optimize Ant Design

```javascript
// ❌ BAD: Import all icons
import * as Icons from "@ant-design/icons";

// ✅ GOOD: Import specific icons
import { UserOutlined, SettingOutlined } from "@ant-design/icons";

// ❌ BAD: Import entire antd
import antd from "antd";

// ✅ GOOD: Import specific components
import { Button, Modal, Form } from "antd";
```

---

### 3. Tree Shaking

Đảm bảo tree-shaking hoạt động:

```javascript
// ✅ GOOD: Named exports (tree-shakeable)
export const utilityA = () => {};
export const utilityB = () => {};

// ❌ BAD: Default export of object (not tree-shakeable)
export default {
  utilityA: () => {},
  utilityB: () => {},
};
```

---

### 4. Dynamic Imports

```javascript
// ❌ BAD: Import large library upfront
import { parse } from "papaparse";

function ImportCSV() {
  const handleImport = (file) => {
    const result = parse(file);
  };
}

// ✅ GOOD: Dynamic import when needed
function ImportCSV() {
  const handleImport = async (file) => {
    const { parse } = await import("papaparse");
    const result = parse(file);
  };
}
```

---

### 5. Webpack Optimization

#### In `package.json`:

```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "GENERATE_SOURCEMAP=true react-scripts build && npm run analyze",
    "analyze:bundle": "npm run webpack-bundle-analyzer"
  }
}
```

#### Environment Variables:

```bash
# Disable source maps in production
GENERATE_SOURCEMAP=false

# Enable production mode
NODE_ENV=production

# Optimize images
IMAGE_INLINE_SIZE_LIMIT=10000
```

---

## 📏 Bundle Size Targets

### Recommended Limits

| Asset Type | Target   | Warning     | Critical |
| ---------- | -------- | ----------- | -------- |
| Main JS    | < 200 KB | 200-500 KB  | > 500 KB |
| Total JS   | < 1 MB   | 1-2 MB      | > 2 MB   |
| CSS        | < 100 KB | 100-200 KB  | > 200 KB |
| Images     | < 500 KB | 500 KB-1 MB | > 1 MB   |

### Current Status

Run `npm run perf:bundle` to see current bundle sizes.

---

## 🔍 Monitoring

### 1. Size Limit

Tự động kiểm tra bundle size trong CI/CD:

```bash
npm run perf:size
```

### 2. Bundle Analyzer

Visual analysis:

```bash
npm run analyze
```

### 3. Lighthouse

Performance audit:

```bash
npx lighthouse https://your-app.com --view
```

---

## 🚀 Quick Wins

### Immediate Actions (< 1 hour)

1. ✅ **Enable Production Build**

   ```bash
   NODE_ENV=production npm run build
   ```

2. ✅ **Disable Source Maps**

   ```bash
   GENERATE_SOURCEMAP=false npm run build
   ```

3. ✅ **Remove Unused Dependencies**

   ```bash
   npm run perf:deps
   npm uninstall <unused-package>
   ```

4. ✅ **Install dayjs** (Completed - v1.11.19)
   ```bash
   npm install dayjs  # Already installed
   ```

### Short-term (< 1 day)

1. ⏳ **Implement Route Splitting**
   - Convert all routes to React.lazy()
   - Add Suspense boundaries

2. ⏳ **Optimize Ant Design**
   - Import specific components only
   - Import specific icons only

3. ✅ **Replace moment.js** (Completed)
   - ✅ Install dayjs (v1.11.19)
   - ⏳ Replace all moment() calls in code

### Long-term (< 1 week)

1. **Comprehensive Code Splitting**
   - Split by routes
   - Split by features
   - Split heavy components

2. **Dependency Audit**
   - Review all dependencies
   - Replace large libraries
   - Remove unused packages

3. **Asset Optimization**
   - Optimize images (WebP, lazy loading)
   - Optimize fonts (subset, preload)
   - Enable compression (gzip/brotli)

---

## 📚 Tools & Resources

### Analysis Tools (✅ Verified)

```bash
# Bundle stats (comprehensive) ✅
npm run bundle:stats

# Performance bundle analyzer ✅
npm run perf:bundle

# Visual bundle analyzer ✅
npm run analyze:bundle

# Dependency checker ✅
npm run perf:deps

# Size limit ✅
npm run perf:size

# Check all tools ✅
npm run check:tools

# Analyze all (bundle + perf + deps) ✅
npm run analyze:all
```

**Note**: Nếu gặp lỗi với source-map-explorer hoặc webpack-bundle-analyzer:

- Đảm bảo đã build project: `npm run build`
- Chạy qua npm script thay vì gọi binary trực tiếp: `npm run analyze:bundle`

### External Tools

- [Bundlephobia](https://bundlephobia.com/) - Check package sizes
- [Bundle Buddy](https://bundle-buddy.com/) - Find duplicate code
- [Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/)

---

## ✅ Checklist

### Before Deployment

- [x] ✅ Bundle analyzer scripts setup
- [x] ✅ dayjs installed (v1.11.19)
- [x] ✅ Performance scripts configured
- [x] ✅ Check tools verified
- [ ] ⏳ Run `npm run perf:bundle`
- [ ] ⏳ Check bundle size < 2 MB
- [ ] ⏳ Verify code splitting works
- [ ] ⏳ Test lazy loading
- [ ] ⏳ Check Lighthouse score > 90
- [ ] ⏳ Verify production build
- [ ] ⏳ Test on slow 3G network

### After Deployment

- [ ] Monitor bundle size in production
- [ ] Check real user metrics
- [ ] Review performance reports
- [ ] Update optimization targets

### Completed Optimizations (Jan 2026)

- [x] ✅ Installed dayjs (replaced moment.js)
- [x] ✅ Setup bundle analysis tools
- [x] ✅ Configured performance scripts
- [x] ✅ Verified all npm scripts working
- [x] ✅ Development tools with pre-commit hooks

---

## 🆘 Troubleshooting

### Bundle Too Large

1. Run `npm run perf:bundle`
2. Identify largest chunks
3. Implement code splitting
4. Replace large dependencies

### Slow Load Time

1. Check bundle size
2. Enable compression
3. Use CDN for static assets
4. Implement caching strategy

### Build Errors

1. Clear cache: `rm -rf node_modules/.cache`
2. Rebuild: `npm run build`
3. Check for circular dependencies

---

## 📊 Example Results

### Before Optimization

```
Main Bundle:     850 KB
Total JS:        2.5 MB
Load Time:       4.2s
Lighthouse:      65/100
```

### After Optimization

```
Main Bundle:     320 KB  (↓ 62%)
Total JS:        1.2 MB  (↓ 52%)
Load Time:       1.8s    (↓ 57%)
Lighthouse:      92/100  (↑ 42%)
```

---

## 🎯 Next Steps

1. Run `npm run perf:bundle` now
2. Review recommendations
3. Implement quick wins first
4. Monitor results
5. Iterate and improve

---

## 🔄 Recent Updates (January 21, 2026)

### Completed

- ✅ Installed dayjs (v1.11.19) for date manipulation
- ✅ Verified all bundle analysis scripts
- ✅ Setup comprehensive performance tooling
- ✅ Configured analyze:all script
- ✅ Integrated with development tools (Husky, lint-staged)

### In Progress

- ⏳ Replace moment.js usage in codebase with dayjs
- ⏳ Implement route-based code splitting
- ⏳ Optimize Ant Design imports

### Next Steps

1. Run comprehensive bundle analysis
2. Implement code splitting strategies
3. Replace all moment usage with dayjs
4. Optimize third-party dependencies
5. Measure and compare bundle sizes

---

**Initial Version**: December 11, 2025
**Last Updated**: January 21, 2026
**Status**: ✅ Tools verified, optimizations in progress
**Version**: 4.0
