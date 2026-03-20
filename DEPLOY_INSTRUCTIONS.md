# 🚀 Hướng dẫn Deploy - React OAS Integration v4.0

## ✅ Trạng thái hiện tại

- ✅ **Build thành công**: Production build đã được tạo
- ✅ **Vercel config**: `vercel.json` đã được cấu hình
- ✅ **Scripts**: Scripts deployment đã sẵn sàng
- ✅ **Development tools**: Husky, lint-staged, Prettier đã setup
- ✅ **Git configuration**: Remote origin đã configured
- ✅ **Pre-commit hooks**: Đã tested và working
- ✅ **Code quality**: Auto-format và lint trước mỗi commit

## 🎯 Các phương thức Deploy

### Option 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. **Truy cập Vercel Dashboard**:
   - Mở: <https://vercel.com/new>
   - Đăng nhập với GitHub account

2. **Import Repository**:
   - Click "Import Git Repository"
   - Chọn: `caovinhphuc/React-OAS-Integration-v4.0`
   - Hoặc paste URL: `https://github.com/caovinhphuc/React-OAS-Integration-v4.0`

3. **Configure Project**:
   - Framework Preset: **Create React App** (tự động)
   - Root Directory: `./` (mặc định)
   - Build Command: `npm run build` (tự động)
   - Output Directory: `build` (tự động)
   - Install Command: `npm install` (tự động)

4. **Environment Variables** (Thêm trong Vercel Dashboard):

   ```bash
   # Required
   REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your_id
   REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_id
   REACT_APP_API_URL=https://your-api.com

   # Optional
   REACT_APP_LANGUAGE=vi
   REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
   REACT_APP_ENABLE_ANALYTICS=true
   ```

5. **Click "Deploy"** và chờ build hoàn tất (2-5 phút)

6. **Nhận URL**:
   - Production URL: `https://react-oas-integration-v4-[hash].vercel.app`
   - Tự động deploy mỗi khi push code lên GitHub!

---

### Option 2: Deploy qua Vercel CLI (Local)

1. **Cài đặt Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Đăng nhập**:

   ```bash
   vercel login
   ```

3. **Deploy Preview**:

   ```bash
   ./deploy-vercel.sh
   # Hoặc
   vercel
   ```

4. **Deploy Production**:

   ```bash
   vercel --prod
   ```

---

### Option 3: Deploy qua Git Push (Auto-deploy)

Sau khi đã kết nối repository trong Vercel Dashboard:

1. **Commit và push code**:

   ```bash
   # Pre-commit hooks sẽ tự động chạy khi commit
   git add .
   git commit -m "feat: ready for production"
   # Husky sẽ tự động lint và format code trước khi commit

   # Pull latest changes trước khi push
   git pull origin main --no-rebase

   # Push to GitHub
   git push origin main
   ```

2. **Vercel tự động deploy**:
   - Mỗi push lên `main` branch → Auto deploy production
   - Mỗi push lên branch khác → Auto deploy preview

**Note**: Husky 9 (`prepare` → `husky`). File **`.husky/pre-commit`** chạy **`npx lint-staged`** trên file đã `git add`. Tài liệu đầy đủ: [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md).

- ESLint `--fix` + Prettier (`npx prettier --write`) theo `.lintstagedrc.json`
- Bỏ qua hook khi cần: `git commit -n` hoặc `HUSKY=0`

---

## 📋 Checklist trước khi Deploy

- [x] ✅ Build thành công (`npm run build`)
- [x] ✅ Dependencies đã được cài đặt
- [x] ✅ Vercel config (`vercel.json`) đã có
- [x] ✅ Development tools (Husky, lint-staged, Prettier) đã setup
- [x] ✅ Git remote origin đã configured
- [x] ✅ Pre-commit hooks đã tested
- [x] ✅ Code đã được pushed lên GitHub
- [ ] ⚠️ Environment variables đã được cấu hình trong Vercel Dashboard
- [ ] ⚠️ Đã test các chức năng chính trên local

---

## 🔍 Kiểm tra sau khi Deploy

1. **Kiểm tra URL deployment**:
   - Mở URL được Vercel cung cấp
   - Kiểm tra trang chủ load đúng

2. **Kiểm tra các chức năng**:
   - ✅ Dashboard load được
   - ✅ API calls hoạt động
   - ✅ Google Sheets integration (nếu đã cấu hình)
   - ✅ WebSocket connection (nếu backend đã deploy)

3. **Xem Logs**:
   - Vào Vercel Dashboard → Project → Deployments
   - Click vào deployment mới nhất → View Logs

---

## 🛠️ Troubleshooting

### Build fails

- Kiểm tra logs trong Vercel Dashboard
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra `package.json` scripts

### Environment variables không hoạt động

- Kiểm tra tên biến (phải bắt đầu với `REACT_APP_`)
- Re-deploy sau khi thêm/sửa env vars

### 404 errors

- Kiểm tra `vercel.json` rewrites configuration
- Đảm bảo routing đúng (React Router)

### Git Issues

**Problem: Git remote not found**

```bash
# Solution: Add remote origin
git remote add origin https://github.com/caovinhphuc/React-OAS-Integration-v4.0.git
git remote -v  # Verify
```

**Problem: Non-fast-forward push**

```bash
# Solution: Pull first, then push
git pull origin main --no-rebase
# Resolve conflicts if any
git add .
git commit -m "Merge: Resolve conflicts"
git push origin main
```

**Problem: Prettier EACCES error in pre-commit hook**

- ✅ Đã fix: `.lintstagedrc.json` đã được cấu hình với `npx prettier`
- Pre-commit hooks sẽ chạy mượt mà

**Problem: Pre-commit hook fails**

```bash
# Skip hook temporarily (not recommended)
git commit --no-verify -m "message"

# Better: Fix linting/formatting issues
npm run lint:fix
npm run format
git add .
git commit -m "message"
```

---

## 📚 Tài liệu tham khảo

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://cra.link/deployment)

---

## 🎉 Sau khi Deploy thành công

1. ✅ Kiểm tra URL production
2. ✅ Test các chức năng chính
3. ✅ Cấu hình custom domain (nếu cần)
4. ✅ Setup monitoring và analytics
5. ✅ Thông báo team về deployment

---

## 🔄 Workflow Khuyến Nghị

### Development → Production

1. **Develop locally**:

   ```bash
   npm start  # Development server
   ```

2. **Commit changes**:

   ```bash
   git add .
   git commit -m "feat: your feature"
   # Pre-commit hooks tự động chạy
   ```

3. **Pull latest**:

   ```bash
   git pull origin main --no-rebase
   ```

4. **Push to GitHub**:

   ```bash
   git push origin main
   # Vercel tự động deploy
   ```

5. **Verify deployment**:
   - Check Vercel dashboard
   - Test production URL

---

**Last Updated**: January 21, 2026
**Status**: ✅ Ready for deployment
**Git Repository**: https://github.com/caovinhphuc/React-OAS-Integration-v4.0

---

**Chúc bạn deploy thành công! 🚀**
