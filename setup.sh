#!/bin/bash
# Wrapper: gọi scripts/setup/main-setup.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/setup/main-setup.sh" "$@"
