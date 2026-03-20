#!/bin/bash

# Legacy wrapper for underscore naming compatibility.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/quick-deploy.sh" "$@"
