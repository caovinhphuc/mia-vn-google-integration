# 🚀 Vercel Deployment Guide - MIA.vn Google Integration

## 📋 Tổng Quan

Hướng dẫn chi tiết deploy MIA.vn Google Integration Platform lên Vercel.

## 🎯 Prerequisites

- Node.js 18.0+
- npm 8.0+
- GitHub repository: <https://github.com/caovinhphuc/mia-vn-google-integration>
- Vercel account

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# Chạy script tự động
./deploy-vercel.sh
```

### Option 2: Manual Deployment

#### 1. Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

#### 2. Login to Vercel

```bash
# Login to Vercel
vercel login
```

#### 3. Deploy

```bash
# Deploy to production
vercel --prod
```

## 🌐 Web Dashboard Deployment

### 1. Connect GitHub Repository

1. **Truy cập**: <https://vercel.com/new>
2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select: `caovinhphuc/mia-vn-google-integration`
   - Click "Import"

### 2. Configure Project

#### Build Settings

- **Framework Preset**: Create React App
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build:prod`
- **Output Directory**: `build`
- **Install Command**: `npm install`

#### Environment Variables

```bash
# Required
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
REACT_APP_API_URL=https://your-api-domain.com

# Optional
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_AUTOMATION=true
REACT_APP_LANGUAGE=vi
REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
REACT_APP_ENABLE_ANALYTICS=true
```

### 3. Deploy

1. **Click "Deploy"**
2. **Wait for build** (2-3 minutes)
3. **Get deployment URL**

## ⚙️ Configuration

### Environment Variables

#### Required Variables

```bash
# Google Services
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# API Configuration
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_API_TIMEOUT=30000
```

#### Optional Variables

```bash
# Features
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_GOOGLE_APPS_SCRIPT=true
REACT_APP_FEATURE_TELEGRAM=true
REACT_APP_FEATURE_AUTOMATION=true
REACT_APP_FEATURE_ANALYTICS=true

# UI Configuration
REACT_APP_THEME=light
REACT_APP_LANGUAGE=vi
REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
REACT_APP_DATE_FORMAT=DD/MM/YYYY
REACT_APP_TIME_FORMAT=HH:mm

# Performance
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

### Build Configuration

#### vercel.json

```json
{
  "version": 2,
  "name": "mia-vn-google-integration",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🔧 Advanced Configuration

### Custom Domain

1. **Go to Project Settings**
2. **Domains tab**
3. **Add domain**: `your-domain.com`
4. **Configure DNS**:

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### Environment Variables per Environment

#### Production

```bash
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
REACT_APP_API_URL=https://api.your-domain.com
```

#### Preview

```bash
REACT_APP_ENVIRONMENT=preview
REACT_APP_DEBUG=true
REACT_APP_API_URL=https://api-preview.your-domain.com
```

#### Development

```bash
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
REACT_APP_API_URL=http://localhost:8000
```

## 📊 Monitoring & Analytics

### Vercel Analytics

1. **Enable Analytics**:
   - Project Settings → Analytics
   - Enable "Vercel Analytics"

2. **View Analytics**:
   - Dashboard → Analytics
   - Real-time metrics
   - Performance insights

### Custom Monitoring

#### Health Check Endpoint

```javascript
// Add to your app
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION
  });
});
```

#### Error Tracking

```bash
# Add to environment variables
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

## 🚀 Deployment Strategies

### 1. Automatic Deployments

#### GitHub Integration

- **Push to main**: Auto-deploy to production
- **Pull Request**: Auto-deploy to preview
- **Branch**: Auto-deploy to preview

#### Configuration

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": true
    }
  }
}
```

### 2. Manual Deployments

```bash
# Deploy specific branch
vercel --prod --target production

# Deploy with specific environment
vercel --prod --env production

# Deploy with build args
vercel --prod --build-env NODE_ENV=production
```

### 3. Preview Deployments

```bash
# Create preview deployment
vercel

# Deploy to preview
vercel --target preview
```

## 🔒 Security

### Environment Variables Security

1. **Never commit secrets** to repository
2. **Use Vercel environment variables** for sensitive data
3. **Rotate secrets** regularly
4. **Use different secrets** for different environments

### Security Headers

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 📈 Performance Optimization

### Build Optimization

```bash
# Production build
npm run build:prod

# Build with optimizations
GENERATE_SOURCEMAP=false npm run build
```

### Caching

```json
{
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    }
  ]
}
```

### Image Optimization

```bash
# Use Vercel Image Optimization
import Image from 'next/image'

# Or use Vercel's built-in optimization
<img src="/api/optimize?url=/image.jpg" alt="Optimized" />
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check build logs
vercel logs

# Local build test
npm run build:prod

# Check dependencies
npm ci
```

#### 2. Environment Variables

```bash
# Check environment variables
vercel env ls

# Add environment variable
vercel env add REACT_APP_API_URL

# Remove environment variable
vercel env rm REACT_APP_API_URL
```

#### 3. Routing Issues

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 4. CORS Issues

```bash
# Add CORS headers
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Check project info
vercel inspect

# Remove deployment
vercel rm [deployment-url]
```

## 📋 Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Build command tested locally
- [ ] Dependencies up to date
- [ ] Security headers configured
- [ ] Custom domain ready (if applicable)

### Post-Deployment

- [ ] Application loads correctly
- [ ] All features working
- [ ] Environment variables loaded
- [ ] Analytics tracking
- [ ] Error monitoring setup
- [ ] Performance monitoring

### Maintenance

- [ ] Regular dependency updates
- [ ] Security patches applied
- [ ] Performance monitoring
- [ ] Error log review
- [ ] Backup strategy

## 🔗 Useful Links

### Vercel

- **Dashboard**: <https://vercel.com/dashboard>
- **Documentation**: <https://vercel.com/docs>
- **CLI Reference**: <https://vercel.com/docs/cli>
- **Environment Variables**: <https://vercel.com/docs/environment-variables>

### Project

- **Repository**: <https://github.com/caovinhphuc/mia-vn-google-integration>
- **Documentation**: docs/
- **Deployment Guide**: DEPLOYMENT_GUIDE.md

### Support

- **Vercel Support**: <https://vercel.com/support>
- **Community**: <https://github.com/vercel/vercel/discussions>
- **Status**: <https://vercel-status.com>

---

## 🎯 Quick Commands

```bash
# Deploy to production
./deploy-vercel.sh

# Manual deployment
vercel --prod

# Check status
vercel ls

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add REACT_APP_API_URL
```

---

**🚀 MIA.vn Google Integration Platform sẵn sàng deploy lên Vercel!**
