#!/usr/bin/env python3
"""
Google Drive Service - List files, upload (automation export)
Dùng chung service account với Sheets.
"""

import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly",
]


class GoogleDriveService:
    """Service cho Google Drive API"""

    def __init__(
        self,
        credentials_path: str = None,
        folder_id: str = None,
    ):
        self.credentials_path = (
            credentials_path
            or os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
            or "config/service_account.json"
        )
        self.folder_id = folder_id or os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")
        self._drive = None
        self._configured = False
        self._init_client()

    def _init_client(self):
        try:
            if not os.path.exists(self.credentials_path):
                logger.warning(f"Credentials not found: {self.credentials_path}")
                return
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build

            creds = Credentials.from_service_account_file(
                self.credentials_path, scopes=SCOPES
            )
            self._drive = build("drive", "v3", credentials=creds)
            self._configured = True
            logger.info("Google Drive client initialized")
        except Exception as e:
            logger.error(f"Drive init failed: {e}")

    def is_configured(self) -> bool:
        return self._configured and self._drive is not None

    def list_files(
        self,
        folder_id: str = None,
        page_size: int = 20,
        mime_type: str = None,
    ) -> List[Dict[str, Any]]:
        """List files in folder (or root if no folder_id)."""
        if not self.is_configured():
            return []
        fid = folder_id or self.folder_id
        try:
            q = "trashed = false"
            if fid:
                q += f" and '{fid}' in parents"
            if mime_type:
                q += f" and mimeType = '{mime_type}'"
            r = (
                self._drive.files()
                .list(
                    q=q,
                    pageSize=page_size,
                    fields="files(id,name,mimeType,modifiedTime,size)",
                    orderBy="modifiedTime desc",
                )
                .execute()
            )
            return r.get("files", [])
        except Exception as e:
            logger.error(f"Drive list_files failed: {e}")
            return []

    def upload_file(
        self,
        file_path: str,
        folder_id: str = None,
        name: str = None,
    ) -> Optional[str]:
        """Upload file, return file ID or None."""
        if not self.is_configured() or not os.path.exists(file_path):
            return None
        fid = folder_id or self.folder_id
        try:
            from googleapiclient.http import MediaFileUpload

            name = name or os.path.basename(file_path)
            meta = {"name": name}
            if fid:
                meta["parents"] = [fid]
            media = MediaFileUpload(file_path, resumable=True)
            f = self._drive.files().create(body=meta, media_body=media, fields="id").execute()
            return f.get("id")
        except Exception as e:
            logger.error(f"Drive upload failed: {e}")
            return None


# Alias
GoogleDriveApiService = GoogleDriveService
