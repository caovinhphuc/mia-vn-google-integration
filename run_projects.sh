#!/bin/bash

# Legacy entrypoint kept for compatibility.
# Canonical command: ./start.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "[legacy] run_projects.sh -> use ./start.sh"
exec "$SCRIPT_DIR/start.sh" "$@"
