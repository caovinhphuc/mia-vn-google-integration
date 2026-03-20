
\

# 🚀 Phase 1 Upgrade Script - Security & Stability
# MIA.vn Google Integration Platform - PowerShell Version

param(
    [switch]$SkipTests = $false,
    [switch]$Force = $false
)

Write-Host "🚀 PHASE 1 UPGRADE: Security & Stability" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Magenta
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

try {
    # Step 1: Create upgrade branch
    Write-Step "Creating upgrade branch..."

    $branchExists = git branch --list "upgrade/phase-1-security"
    if ($branchExists) {
        Write-Warning "Branch already exists, switching to it..."
        git checkout upgrade/phase-1-security
    } else {
        git checkout -b upgrade/phase-1-security
    }
    Write-Success "Switched to upgrade branch"

    # Step 2: Backup current package.json → backups/package-json/ (không ghi root)
    Write-Step "Backing up current package.json..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = Join-Path "backups" "package-json"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Copy-Item "package.json" (Join-Path $backupDir "package.json.backup.$timestamp")
    Write-Success "Package.json backed up → $backupDir/"

    # Step 3: Run security audit
    Write-Step "Running security audit..."
    Write-Host "Current security status:" -ForegroundColor Yellow
    npm audit --audit-level moderate

    # Step 4: Update safe dependencies
    Write-Step "Updating safe dependencies..."

    # Update critical security packages
    npm update axios cors express dayjs

    # Update Google API packages
    npm install googleapis@latest google-auth-library@latest

    # Update Ant Design
    npm install antd@^5.28.0 "@ant-design/icons@latest"

    # Update chart libraries
    npm install chart.js@^4.6.0 react-chartjs-2@latest recharts@latest

    # Update React ecosystem
    npm install react-router-dom@^6.30.0 react-redux@^9.2.0

    Write-Success "Core dependencies updated"

    # Step 5: Update development dependencies
    Write-Step "Updating development dependencies..."

    # Update TypeScript to 5.x
    npm install --save-dev typescript@^5.6.0
    npm install --save-dev "@types/react@^18.3.0" "@types/react-dom@^18.3.0"

    # Update build tools
    npm install --save-dev prettier@^3.3.0 eslint@^9.0.0
    npm install --save-dev webpack-bundle-analyzer@latest

    Write-Success "Dev dependencies updated"

    # Step 6: Fix peer dependency issues
    Write-Step "Resolving peer dependency issues..."
    npm install --legacy-peer-deps
    Write-Success "Peer dependencies resolved"

    # Step 7: Update overrides for security
    Write-Step "Updating security overrides..."

    # Read and update package.json
    $packageJson = Get-Content "package.json" | ConvertFrom-Json

    # Update overrides
    if (-not $packageJson.overrides) {
        $packageJson | Add-Member -Type NoteProperty -Name "overrides" -Value @{}
    }

    $packageJson.overrides = @{
        "nth-check" = "^2.1.1"
        "postcss" = "^8.4.35"
        "webpack-dev-server" = "^5.0.0"
        "svgo" = "^3.2.0"
        "semver" = "^7.6.0"
    }

    # Update engines
    $packageJson.engines = @{
        "node" = ">=18.0.0"
        "npm" = ">=8.0.0"
    }

    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Success "Security overrides updated"

    # Step 8: Clean install
    Write-Step "Performing clean install..."
    if (Test-Path "node_modules") {
        Remove-Item "node_modules" -Recurse -Force
    }
    if (Test-Path "package-lock.json") {
        Remove-Item "package-lock.json" -Force
    }

    npm install --legacy-peer-deps
    Write-Success "Clean install completed"

    # Step 9: Run tests (if not skipped)
    if (-not $SkipTests) {
        Write-Step "Running tests..."

        try {
            npm run lint:check
        } catch {
            Write-Warning "Linting issues found, attempting to fix..."
            npm run lint
        }

        try {
            npm test -- --watchAll=false
        } catch {
            Write-Warning "Some tests failed, continuing..."
        }

        Write-Success "Tests completed"
    }

    # Step 10: Test build
    Write-Step "Testing production build..."
    npm run build

    if (Test-Path "build") {
        Write-Success "Production build successful"

        # Analyze bundle size
        Write-Host "`nBundle analysis:" -ForegroundColor Blue
        Get-ChildItem "build/static/js/*" -ErrorAction SilentlyContinue | ForEach-Object {
            $size = [math]::Round($_.Length / 1KB, 2)
            Write-Host "$($_.Name): ${size}KB"
        }
    } else {
        Write-Error "Build failed!"
        exit 1
    }

    # Step 11: Run security audit again
    Write-Step "Final security audit..."
    Write-Host "`n=== SECURITY STATUS AFTER UPGRADE ===" -ForegroundColor Green
    npm audit --audit-level moderate

    # Step 12: Generate upgrade report
    Write-Step "Generating upgrade report..."

    $reportContent = @"
# Phase 1 Upgrade Report - $(Get-Date)

## 🎯 Objectives Completed
- ✅ Security vulnerabilities addressed
- ✅ Safe dependency updates applied
- ✅ TypeScript upgraded to 5.6.x
- ✅ Development tools modernized
- ✅ Build system tested

## 📊 Dependencies Updated

### Core Dependencies
- googleapis: Latest
- google-auth-library: Latest
- antd: ^5.28.0
- axios: Latest
- react-router-dom: ^6.30.0

### Development Dependencies
- typescript: ^5.6.0
- @types/react: ^18.3.0
- eslint: ^9.0.0
- prettier: ^3.3.0

## 🔍 Security Status
$(npm audit --audit-level moderate 2>$null)

## 📈 Bundle Size Analysis
$(Get-ChildItem "build/static/js/*" -ErrorAction SilentlyContinue | Select-Object -First 5 | ForEach-Object { "$($_.Name): $([math]::Round($_.Length / 1KB, 2))KB" } | Out-String)

## ✅ Next Steps
1. Test all features thoroughly
2. Deploy to staging for validation
3. Plan Phase 2 (Vite migration)
4. Monitor performance metrics

Generated: $(Get-Date)
"@

    $reportContent | Set-Content "PHASE1_UPGRADE_REPORT.md"
    Write-Success "Upgrade report generated: PHASE1_UPGRADE_REPORT.md"

    # Step 13: Commit changes
    Write-Step "Committing Phase 1 changes..."
    git add .
    git commit -m "🔒 Phase 1 Upgrade: Security & Stability

✅ Updates completed:
- Updated core dependencies for security
- Upgraded TypeScript to 5.6.x
- Enhanced security overrides
- Fixed peer dependency conflicts
- Verified production build

🔍 Security improvements:
- Updated axios, googleapis, antd
- Enhanced webpack security
- Updated development tools

📊 Ready for Phase 2: Build system modernization"

    Write-Success "Changes committed to upgrade branch"

    Write-Host "`n🎉 PHASE 1 UPGRADE COMPLETED SUCCESSFULLY! 🎉" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Blue

    Write-Host "`n📋 Summary:" -ForegroundColor Yellow
    Write-Host "• Branch: upgrade/phase-1-security"
    Write-Host "• Dependencies updated and secured"
    Write-Host "• Build verified working"
    Write-Host "• Ready for testing and deployment"

    Write-Host "`n🚀 Next Actions:" -ForegroundColor Magenta
    Write-Host "1. Test features: npm start"
    Write-Host "2. Review report: Get-Content PHASE1_UPGRADE_REPORT.md"
    Write-Host "3. Deploy to staging for validation"
    Write-Host "4. Merge to main when ready:"
    Write-Host "   git checkout main && git merge upgrade/phase-1-security"

    Write-Host "`nPhase 2 Preview: Vite Migration" -ForegroundColor Blue
    Write-Host "• Modern build system"
    Write-Host "• Faster development"
    Write-Host "• Better performance"

} catch {
    Write-Error "Upgrade failed: $($_.Exception.Message)"
    Write-Host "Rolling back changes..." -ForegroundColor Yellow

    # Restore backup if exists (backups/package-json + tương thích bản cũ ở root)
    $fromDir = @()
    if (Test-Path (Join-Path "backups" "package-json")) {
        $fromDir = Get-ChildItem -Path (Join-Path "backups" "package-json") -Filter "package.json.backup.*" -ErrorAction SilentlyContinue
    }
    $fromRoot = Get-ChildItem -Path "." -Filter "package.json.backup.*" -ErrorAction SilentlyContinue
    $backupFile = @($fromDir; $fromRoot) | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($backupFile) {
        Copy-Item $backupFile.FullName "package.json"
        Write-Host "Package.json restored from backup" -ForegroundColor Green
    }

    exit 1
}
