#!/bin/bash

# Canonical root command for Vercel deploy.
# Real implementation: scripts/deploy/deploy-vercel.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/deploy/deploy-vercel.sh" "$@"
