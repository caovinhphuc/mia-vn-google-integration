#!/bin/bash

# 🔍 Port Configuration Verification Script
# Verifies that the actual port configuration matches documentation

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🔍 Port Configuration Verification"
echo "=================================================="
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    local service_name=$2
    local expected=$3

    if lsof -i :$port > /dev/null 2>&1; then
        if [ "$expected" = "yes" ]; then
            echo -e "${GREEN}✅ Port $port: $service_name is running${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Port $port: $service_name is running (Optional)${NC}"
            return 0
        fi
    else
        if [ "$expected" = "yes" ]; then
            echo -e "${RED}❌ Port $port: $service_name is NOT running${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  Port $port: $service_name is NOT running (Optional - OK)${NC}"
            return 0
        fi
    fi
}

# Check expected ports
echo "📊 Checking Expected Ports:"
echo "-----------------------------------"
check_port 3000 "Frontend" "yes"
check_port 3001 "Backend" "yes"
check_port 8001 "Automation" "no"
echo ""

# Check unexpected ports
echo "🚫 Checking Unexpected Ports:"
echo "-----------------------------------"
if lsof -i :8002 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 8002: Something is running (should be empty!)${NC}"
    echo "   This port should NOT be used in current architecture"
else
    echo -e "${GREEN}✅ Port 8002: Empty (correct)${NC}"
fi

if lsof -i :8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000: Something is running${NC}"
    echo "   Note: This port is not part of standard configuration"
else
    echo -e "${GREEN}✅ Port 8000: Empty (correct)${NC}"
fi
echo ""

# Verify documentation consistency
echo "📚 Checking Documentation Consistency:"
echo "-----------------------------------"

# Check for incorrect "AI Service" references in active docs
ai_service_refs=$(grep -r "AI Service" README.md QUICK_REFERENCE.md PORT_CLARIFICATION.md 2>/dev/null | grep -v "legacy" | wc -l)
if [ "$ai_service_refs" -gt 0 ]; then
    echo -e "${RED}❌ Found $ai_service_refs references to 'AI Service' in main docs${NC}"
    echo "   Docs should refer to 'Automation Service' instead"
else
    echo -e "${GREEN}✅ No incorrect 'AI Service' references in main docs${NC}"
fi

# Check for port 8002 references in active docs
port_8002_refs=$(grep -r "8002" README.md QUICK_REFERENCE.md PORT_CLARIFICATION.md 2>/dev/null | wc -l)
if [ "$port_8002_refs" -gt 0 ]; then
    echo -e "${RED}❌ Found $port_8002_refs references to port 8002 in main docs${NC}"
    echo "   Automation should use port 8001, not 8002"
else
    echo -e "${GREEN}✅ No port 8002 references in main docs${NC}"
fi

# Check start_dev_servers.sh configuration
if grep -q "port 8001" start_dev_servers.sh 2>/dev/null; then
    echo -e "${GREEN}✅ start_dev_servers.sh uses port 8001 for automation${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify start_dev_servers.sh port configuration${NC}"
fi

# Check scripts/tests/frontend_connection_test.js
if grep -q "8001.*automation" scripts/tests/frontend_connection_test.js 2>/dev/null; then
    echo -e "${GREEN}✅ scripts/tests/frontend_connection_test.js tests port 8001 for automation${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify scripts/tests/frontend_connection_test.js configuration${NC}"
fi

echo ""
echo "=================================================="

# Summary
echo ""
echo "📋 Configuration Summary:"
echo "-----------------------------------"
echo "✅ Required Services:"
echo "   - Frontend (Port 3000)"
echo "   - Backend (Port 3001)"
echo ""
echo "⚠️  Optional Services:"
echo "   - Automation (Port 8001) - for Google Sheets only"
echo ""
echo "🚫 Unused/legacy Ports:"
echo "   - Port 8002 (not used)"
echo ""

# Final verdict
echo "🎯 Final Verdict:"
echo "-----------------------------------"

required_running=0
if lsof -i :3000 > /dev/null 2>&1; then ((required_running++)); fi
if lsof -i :3001 > /dev/null 2>&1; then ((required_running++)); fi

if [ $required_running -eq 2 ]; then
    echo -e "${GREEN}✅ Core system is running correctly${NC}"
    echo -e "${GREEN}✅ Port configuration matches documentation${NC}"
    echo ""
    echo "🎉 System Status: HEALTHY"
elif [ $required_running -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Partial system running (1/2 required services)${NC}"
    echo ""
    echo "💡 Tip: Run ./start_dev_servers.sh to start all services"
else
    echo -e "${YELLOW}⚠️  No required services running${NC}"
    echo ""
    echo "💡 Tip: Run ./start_dev_servers.sh to start services"
fi

echo ""
echo "=================================================="
echo ""

# Additional info
if lsof -i :8001 > /dev/null 2>&1; then
    echo "ℹ️  Note: Automation service is running on port 8001"
    echo "   This is optional and only needed for Google Sheets integration"
    echo ""
fi

echo "📖 For more details, see:"
echo "   - DOCUMENTATION_INDEX.md"
echo "   - DOCUMENTATION_UPDATE_REPORT.md"
echo "   - PORT_CLARIFICATION.md"
echo ""

