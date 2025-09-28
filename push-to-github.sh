#!/bin/bash

# =============================================================================
# Quick GitHub Push Script for MIA.vn Google Integration
# =============================================================================

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Banner
echo -e "${BLUE}🚀 MIA.vn Google Integration - GitHub Push${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_warn "Not in a git repository. Initializing..."
    git init
fi

# Add all files
log_info "Adding all files..."
git add .

# Commit changes
log_info "Committing changes..."
git commit -m "🚀 Complete MIA.vn Google Integration Platform

✨ Features:
- React 19.1.1 frontend with Redux state management
- Google Sheets, Drive, Apps Script integration
- Telegram Bot integration
- Python automation system
- AI Analytics dashboard
- Vietnamese UI localization

🐳 Production Ready:
- Docker multi-service architecture
- Nginx production configuration
- Build optimization scripts
- Comprehensive deployment guide
- Security hardening
- Health monitoring

📚 Documentation:
- Organized docs structure
- Quick start guide
- Deployment guide
- API reference
- System architecture

🔧 DevOps:
- Docker Compose setup
- Production deployment scripts
- Environment configuration
- Monitoring dashboard
- Automated health checks"

# Get repository URL
echo ""
echo -e "${YELLOW}📝 GitHub Repository Setup${NC}"
echo ""
echo "Please provide your GitHub repository URL:"
echo "Example: https://github.com/username/mia-vn-google-integration.git"
echo ""
read -p "Repository URL: " REPO_URL

if [[ -z "$REPO_URL" ]]; then
    log_warn "No repository URL provided. Exiting..."
    exit 1
fi

# Add remote
log_info "Adding remote repository..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# Push to GitHub
log_info "Pushing to GitHub..."
git push -u origin main

echo ""
echo -e "${GREEN}🎉 Successfully pushed to GitHub!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Configure environment variables in repository settings"
echo "2. Deploy to Vercel/Netlify"
echo "3. Setup monitoring and health checks"
echo ""
echo -e "${BLUE}🔗 Repository:${NC} $REPO_URL"
echo ""
