#!/bin/bash

# 🚀 React OAS Integration v4.0 - Quick Deploy (Wrapper)
# Wrapper script to run quick deployment from root directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/deploy/quick-deploy.sh" "$@"
