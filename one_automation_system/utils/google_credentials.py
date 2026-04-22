"""Đường dẫn JSON service account (tách khỏi pandas/gspread)."""
from __future__ import annotations

import json
import os
from typing import List, Optional


def _is_google_service_account_file(path: str) -> bool:
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        ok_type = data.get('type') == 'service_account'
        return ok_type and bool(data.get('client_email'))
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        return False


def resolve_service_account_credentials_path() -> Optional[str]:
    """Env GOOGLE_* và ~/.secrets/google → config/service_account.json."""
    candidates: List[str] = []

    def push(p: Optional[str]) -> None:
        if not p:
            return
        x = os.path.expanduser(os.path.expandvars(str(p).strip()))
        if x and x not in candidates:
            candidates.append(x)

    push(os.environ.get('GOOGLE_CREDENTIALS_PATH'))
    push(os.environ.get('GOOGLE_SERVICE_ACCOUNT_FILE'))
    push(os.environ.get('GOOGLE_SERVICE_ACCOUNT_KEY_PATH'))
    push(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))

    secrets_dir = os.path.expanduser('~/.secrets/google')
    push(os.path.join(secrets_dir, 'service_account.json'))
    push(os.path.join(secrets_dir, 'service_key.json'))
    push(os.path.join(secrets_dir, 'service_key'))

    if os.path.isdir(secrets_dir):
        json_paths = [
            os.path.join(secrets_dir, f)
            for f in os.listdir(secrets_dir)
            if f.endswith('.json')
        ]
        json_paths.sort(key=lambda p: os.path.getmtime(p), reverse=True)
        for p in json_paths:
            push(p)

    push('config/service_account.json')

    for p in candidates:
        if os.path.isfile(p) and _is_google_service_account_file(p):
            return p
    return None
