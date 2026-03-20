#!/bin/bash

# Legacy wrapper (normalized path handling).
# Canonical production deploy script:
#   scripts/deploy/deploy-production.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/deploy/deploy-production.sh" "$@"
