# 🚀 HƯỚNG DẪN DEPLOYMENT REACT GOOGLE INTEGRATION

## 📋 Tổng quan Deployment

Dự án React Google Integration có thể được deploy trên nhiều platform khác nhau, từ development đến production. Tài liệu này cung cấp hướng dẫn chi tiết cho từng môi trường.

## 🎯 Các môi trường Deployment

### 1. **Development Environment**

- Local development với React dev server
- Backend Express server chạy local
- Google APIs với test credentials

### 2. **Staging Environment**

- Preview deployment cho testing
- Production-like environment
- Staging Google Sheets/Drive

### 3. **Production Environment**

- Live application cho end users
- Optimized build và performance
- Production Google APIs

## 🛠️ Prerequisites

### Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Git**: Latest version
- **Google Cloud Account**: Với APIs enabled

### Yêu cầu Google Services

- Google Cloud Project
- Google Sheets API enabled
- Google Drive API enabled
- Service Account với proper permissions

## 📦 Build Process

### 1. **Frontend Build**

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Build output sẽ được tạo trong thư mục 'build/'
```

### 2. **Backend Build**

```bash
# Install backend dependencies
npm install express nodemailer node-cron cors dotenv

# Backend không cần build, chạy trực tiếp với Node.js
node server.js
```

### 3. **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Cấu hình các biến môi trường
# Xem chi tiết trong phần Environment Variables
```

## 🌐 Deployment Options

### Option 1: Netlify (Recommended cho Frontend)

#### Setup Netlify

1. **Tạo tài khoản Netlify**
   - Đăng ký tại [netlify.com](https://netlify.com)
   - Connect với GitHub repository

2. **Cấu hình Build Settings**

   ```yaml
   Build command: npm run build
   Publish directory: build
   Node version: 16
   ```

3. **Environment Variables trong Netlify**

   ```
   REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   REACT_APP_GOOGLE_PROJECT_ID=your-project-id
   REACT_APP_GOOGLE_SHEET_ID=your-sheet-id
   REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id
   REACT_APP_EMAIL_SERVICE=gmail
   REACT_APP_EMAIL_USER=your-email@gmail.com
   REACT_APP_EMAIL_PASS=your-app-password
   REACT_APP_ALERT_EMAIL_TO=recipient@example.com
   REACT_APP_TELEGRAM_BOT_TOKEN=your-bot-token
   REACT_APP_TELEGRAM_CHAT_ID=your-chat-id
   REACT_APP_API_BASE_URL=https://your-backend-url.com/api
   ```

4. **Deploy**

   ```bash
   # Automatic deployment từ Git push
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

#### Netlify Functions cho Backend

```javascript
// netlify/functions/send-email.js
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { to, subject, html } = JSON.parse(event.body);

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### Option 2: Vercel

#### Setup Vercel

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login và Deploy**

   ```bash
   vercel login
   vercel
   ```

3. **Cấu hình vercel.json**

   ```json
   {
     "version": 2,
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
     ],
     "env": {
       "REACT_APP_GOOGLE_CLIENT_EMAIL": "@google-client-email",
       "REACT_APP_GOOGLE_PRIVATE_KEY": "@google-private-key",
       "REACT_APP_GOOGLE_PROJECT_ID": "@google-project-id"
     }
   }
   ```

### Option 3: AWS (Full Stack)

#### Frontend với S3 + CloudFront

1. **Build và Upload**

   ```bash
   npm run build
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

2. **CloudFront Distribution**
   - Tạo CloudFront distribution
   - Point đến S3 bucket
   - Cấu hình custom domain

#### Backend với Lambda

```javascript
// lambda/index.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Your Express app routes
app.use('/api', require('./routes'));

module.exports.handler = serverless(app);
```

### Option 4: Google Cloud Platform

#### App Engine

1. **Tạo app.yaml**

   ```yaml
   runtime: nodejs16
   env: standard

   env_variables:
     REACT_APP_GOOGLE_CLIENT_EMAIL: "your-service-account@project.iam.gserviceaccount.com"
     REACT_APP_GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     REACT_APP_GOOGLE_PROJECT_ID: "your-project-id"

   handlers:
   - url: /static
     static_dir: build/static
   - url: /.*
     static_files: build/index.html
     upload: build/index.html
   ```

2. **Deploy**

   ```bash
   gcloud app deploy
   ```

## 🔧 Environment Variables

### Development (.env.local)

```env
# Google Service Account
REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_PROJECT_ID=your-project-id
REACT_APP_GOOGLE_CLIENT_ID=your-client-id

# Google Resources
REACT_APP_GOOGLE_SHEET_ID=your-sheet-id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Email Configuration
REACT_APP_EMAIL_SERVICE=gmail
REACT_APP_EMAIL_USER=your-email@gmail.com
REACT_APP_EMAIL_PASS=your-app-password
REACT_APP_ALERT_EMAIL_TO=recipient@example.com

# Telegram Configuration (Optional)
REACT_APP_TELEGRAM_BOT_TOKEN=your-bot-token
REACT_APP_TELEGRAM_CHAT_ID=your-chat-id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ALERT_THRESHOLD_LOW=10
REACT_APP_ALERT_THRESHOLD_HIGH=100
```

### Production

```env
# Same variables but with production values
REACT_APP_GOOGLE_SHEET_ID=production-sheet-id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=production-folder-id
REACT_APP_API_BASE_URL=https://your-production-api.com/api
```

## 🚀 Deployment Scripts

### package.json Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "deploy:staging": "npm run build && vercel --env staging",
    "deploy:production": "npm run build && vercel --prod",
    "deploy:netlify": "npm run build && netlify deploy --prod --dir=build",
    "deploy:aws": "npm run build && aws s3 sync build/ s3://your-bucket --delete"
  }
}
```

### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment process..."

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Please switch to main branch before deploying"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Build application
echo "🔨 Building application..."
npm run build

# Deploy to staging first
echo "🚀 Deploying to staging..."
npm run deploy:staging

# Wait for staging deployment
echo "⏳ Waiting for staging deployment..."
sleep 30

# Run staging tests
echo "🧪 Running staging tests..."
# Add your staging tests here

# Deploy to production
echo "🚀 Deploying to production..."
npm run deploy:production

echo "✅ Deployment completed successfully!"
```

## 🔍 Health Checks

### Application Health Check

```javascript
// utils/healthCheck.js
export const healthCheck = async () => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      googleSheets: false,
      googleDrive: false,
      email: false,
      telegram: false
    }
  };

  try {
    // Check Google Sheets
    await googleSheetsService.getSheetMetadata();
    checks.services.googleSheets = true;
  } catch (error) {
    console.error('Google Sheets health check failed:', error);
  }

  try {
    // Check Google Drive
    await googleDriveService.listFiles();
    checks.services.googleDrive = true;
  } catch (error) {
    console.error('Google Drive health check failed:', error);
  }

  // Check if all services are healthy
  const allHealthy = Object.values(checks.services).every(status => status);
  checks.status = allHealthy ? 'healthy' : 'degraded';

  return checks;
};
```

### Monitoring Endpoint

```javascript
// Add to your Express server
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## 📊 Performance Optimization

### Build Optimization

```javascript
// webpack.config.js (if ejected)
const path = require('path');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        google: {
          test: /[\\/]node_modules[\\/](googleapis|google-auth-library)[\\/]/,
          name: 'google',
          chunks: 'all',
        },
      },
    },
  },
};
```

### Caching Strategy

```javascript
// Service Worker for caching
const CACHE_NAME = 'react-google-integration-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🔒 Security Considerations

### HTTPS Configuration

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Security Headers

```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## 🐛 Troubleshooting

### Common Deployment Issues

1. **Build Failures**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   - Check variable names start with `REACT_APP_`
   - Verify no typos in variable names
   - Ensure variables are set in deployment platform

3. **Google API Errors**
   - Verify service account permissions
   - Check API quotas
   - Ensure APIs are enabled

4. **CORS Issues**

   ```javascript
   // Add CORS configuration
   app.use(cors({
     origin: process.env.NODE_ENV === 'production'
       ? ['https://yourdomain.com']
       : ['http://localhost:3000'],
     credentials: true
   }));
   ```

### Debug Commands

```bash
# Check build locally
npm run build
npx serve -s build

# Test environment variables
node -e "console.log(process.env.REACT_APP_GOOGLE_CLIENT_EMAIL)"

# Check Google API connection
npm run test:google
```

## 📈 Monitoring và Analytics

### Error Tracking

```javascript
// Add Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

```javascript
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🎯 Best Practices

### Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Google APIs enabled and configured
- [ ] Build successful locally
- [ ] Health checks implemented
- [ ] Error tracking configured
- [ ] Performance monitoring setup
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Backup strategy in place

### Rollback Strategy

```bash
# Quick rollback script
#!/bin/bash
PREVIOUS_DEPLOYMENT=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)
git checkout $PREVIOUS_DEPLOYMENT
npm run build
npm run deploy:production
```

---

**Deployment này đảm bảo:**

- ✅ Ứng dụng hoạt động ổn định trên production
- ✅ Performance tối ưu và bảo mật cao
- ✅ Monitoring và error tracking đầy đủ
- ✅ Dễ dàng rollback khi có vấn đề
- ✅ Scalable và maintainable
