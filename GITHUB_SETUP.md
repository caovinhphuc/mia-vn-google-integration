# 🚀 GitHub Setup Guide - MIA.vn Google Integration

## 📋 Hướng Dẫn Tạo Repository và Push Code

### 1. 🔧 Tạo Repository trên GitHub

1. **Đăng nhập GitHub**: Truy cập [github.com](https://github.com)
2. **Tạo Repository mới**:
   - Click "New repository" hoặc "+" → "New repository"
   - Repository name: `mia-vn-google-integration`
   - Description: `MIA.vn Google Integration Platform - Comprehensive automation and data management system`
   - Visibility: Public hoặc Private (tùy chọn)
   - **KHÔNG** check "Initialize with README" (vì đã có code)
   - Click "Create repository"

### 2. 🔑 Cấu Hình Authentication

#### Option A: Personal Access Token (Recommended)

1. **Tạo Personal Access Token**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `write:packages`
   - Copy token (lưu lại an toàn)

2. **Sử dụng token**:

   ```bash
   git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/mia-vn-google-integration.git
   ```

#### Option B: SSH Key

1. **Tạo SSH Key**:

   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Thêm SSH Key vào GitHub**:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste public key

3. **Sử dụng SSH**:

   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/mia-vn-google-integration.git
   ```

### 3. 🚀 Push Code

```bash
# Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/mia-vn-google-integration.git

# Push code
git push -u origin main
```

### 4. 🐳 Deploy với GitHub Actions

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy MIA.vn Google Integration

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build:prod

    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add your deployment commands here
```

### 5. 🌐 Deploy với Vercel/Netlify

#### Vercel

1. **Connect GitHub**:
   - Truy cập [vercel.com](https://vercel.com)
   - Import project từ GitHub
   - Select repository: `mia-vn-google-integration`

2. **Configure Build**:
   - Build Command: `npm run build:prod`
   - Output Directory: `build`
   - Install Command: `npm install`

#### Netlify

1. **Connect GitHub**:
   - Truy cập [netlify.com](https://netlify.com)
   - New site from Git
   - Connect GitHub repository

2. **Configure Build**:
   - Build Command: `npm run build:prod`
   - Publish Directory: `build`

### 6. 🔧 Environment Variables

Thêm environment variables trong deployment platform:

```bash
# Google Services
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# API Configuration
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_API_TIMEOUT=30000

# Features
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_AUTOMATION=true
```

### 7. 📊 Monitoring

#### GitHub Actions

- **Actions tab**: Xem build status
- **Issues**: Track bugs và feature requests
- **Pull Requests**: Code review process

#### Deployment Monitoring

- **Vercel**: Dashboard → Analytics
- **Netlify**: Site overview → Analytics
- **Custom**: Health check endpoints

### 8. 🚀 Quick Commands

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/mia-vn-google-integration.git
cd mia-vn-google-integration

# Install dependencies
npm install

# Development
npm start

# Production build
npm run build:prod

# Deploy
./deploy-production.sh
```

### 9. 🔒 Security

#### Repository Security

- [ ] Enable branch protection
- [ ] Require pull request reviews
- [ ] Enable security alerts
- [ ] Use Dependabot for updates

#### Environment Security

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Configure security headers
- [ ] Regular security updates

### 10. 📚 Documentation

#### README.md

- [x] Project description
- [x] Installation instructions
- [x] Usage examples
- [x] API documentation
- [x] Contributing guidelines

#### GitHub Pages

1. **Enable GitHub Pages**:
   - Repository → Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `docs`

2. **Documentation Site**:
   - URL: `https://YOUR_USERNAME.github.io/mia-vn-google-integration`

---

## 🎯 Next Steps

1. **Tạo repository** trên GitHub
2. **Cấu hình authentication** (token hoặc SSH)
3. **Push code** lên repository
4. **Setup deployment** (Vercel/Netlify)
5. **Configure environment variables**
6. **Test deployment**
7. **Setup monitoring**

---

**🚀 MIA.vn Google Integration Platform sẵn sàng deploy!**
