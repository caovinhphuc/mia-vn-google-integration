#!/bin/bash

# Legacy wrapper for camelCase command compatibility.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/deploy/deploy-netlify.sh" "$@"
