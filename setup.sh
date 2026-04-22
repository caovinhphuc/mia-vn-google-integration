#!/bin/bash
# Wrapper → scripts/setup/main-setup.sh (venv root + npm + .env.template)
# Setup đầy đủ theo doc hiện tại: node scripts/setup.js  |  IDE: npm run ide:setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/setup/main-setup.sh" "$@"
