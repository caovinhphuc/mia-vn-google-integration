# CI/CD Pipeline Documentation

## Overview

MIA Logistics Manager uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. Main Deployment Workflow (`.github/workflows/deploy.yml`)

**Triggers:**

- Push to main branch
- Pull requests to main branch

**Jobs:**

- **test**: Run tests, linting, and build
- **security-audit**: Security scanning and dependency checks
- **deploy-staging**: Deploy to staging environment
- **deploy-production**: Deploy to production environment

### 2. Security Workflow (`.github/workflows/security.yml`)

**Triggers:**

- Daily at 2 AM
- Push to main branch
- Pull requests to main branch

**Features:**

- npm audit
- Snyk security scanning
- CodeQL analysis
- Secret detection

### 3. Performance Workflow (`.github/workflows/performance.yml`)

**Triggers:**

- Daily at 4 AM
- Push to main branch

**Features:**

- Lighthouse CI
- Bundle size analysis
- Performance metrics

### 4. Docker Workflow (`.github/workflows/docker.yml`)

**Triggers:**

- Push to main branch
- Version tags

**Features:**

- Multi-platform Docker builds
- Container registry push
- Build caching

## Environment Variables

### Required Secrets

Add these secrets to your GitHub repository:

```bash
# Google APIs
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_SPREADSHEET_ID
GOOGLE_APPS_SCRIPT_ID
GOOGLE_MAPS_API_KEY

# Deployment
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
NETLIFY_SITE_ID_STAGING
VERCEL_TOKEN

# Security
SNYK_TOKEN

# Monitoring
SLACK_WEBHOOK_URL
```

## Deployment Process

### Staging Deployment

1. Code is pushed to main branch
2. Tests and security scans run
3. If successful, deploy to staging
4. Staging URL is available for testing

### Production Deployment

1. After staging deployment succeeds
2. Build optimized production bundle
3. Deploy to production
4. Send notification to Slack

## Local Development

### Prerequisites

- Node.js 16+
- npm 8+
- Git

### Setup

```bash
# Clone repository
git clone <repository-url>
cd mia-logistics-manager

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Run security audit
npm audit

# Build application
npm run build
```

## Monitoring

### Performance Monitoring

- Lighthouse CI runs daily
- Bundle size analysis
- Core Web Vitals tracking

### Security Monitoring

- Daily security scans
- Dependency vulnerability checks
- Secret detection

### Deployment Monitoring

- Deployment success/failure notifications
- Build time tracking
- Error logging

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version
   - Verify environment variables
   - Check dependency versions

2. **Deployment Failures**
   - Verify deployment tokens
   - Check site IDs
   - Review build logs

3. **Security Scan Failures**
   - Update vulnerable dependencies
   - Fix security issues
   - Review secret detection results

### Support

- Check GitHub Actions logs
- Review deployment documentation
- Contact development team

## Best Practices

1. **Branch Protection**
   - Require pull request reviews
   - Require status checks
   - Require up-to-date branches

2. **Environment Management**
   - Use different environments for staging/production
   - Secure environment variables
   - Regular rotation of secrets

3. **Monitoring**
   - Set up alerts for failures
   - Monitor performance metrics
   - Track security issues

4. **Documentation**
   - Keep documentation updated
   - Document deployment process
   - Maintain troubleshooting guides
