#!/bin/bash
BACKUP_DIR="/opt/backups/mia-vn-integration"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  /opt/mia-vn-integration

# Keep only last 7 backups
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs -r rm
