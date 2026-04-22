#!/usr/bin/env python3
"""
Google Sheets Service
"""

import os
import logging
from typing import List, Dict, Any, Optional

import gspread
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from utils.google_credentials import resolve_service_account_credentials_path


class GoogleSheetsService:
    """Service for Google Sheets + optional Google Drive API (cùng service account)."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.client = None
        self.drive = None
        self._credentials_path: Optional[str] = None
        self._initialized = False

    async def initialize(self):
        """Initialize Google Sheets (gspread) và Drive v3 (googleapiclient) nếu có key hợp lệ."""
        try:
            credentials_path = resolve_service_account_credentials_path()
            if not credentials_path:
                credentials_path = os.path.expanduser(
                    os.path.expandvars(
                        os.getenv('GOOGLE_CREDENTIALS_PATH', 'config/service_account.json')
                    )
                )

            self._credentials_path = credentials_path

            if not os.path.isfile(credentials_path):
                self.logger.warning('Credentials file not found: %s', credentials_path)
                self._initialized = False
                return False

            scopes = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive',
            ]

            creds = Credentials.from_service_account_file(credentials_path, scopes=scopes)
            self.client = gspread.authorize(creds)
            try:
                self.drive = build('drive', 'v3', credentials=creds, cache_discovery=False)
                self.logger.info('Google Drive API v3 client ready')
            except Exception as drive_err:
                self.drive = None
                self.logger.warning('Google Drive API init skipped: %s', drive_err)

            self._initialized = True
            self.logger.info('Google Sheets service initialized (key: %s)', credentials_path)
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize Google Sheets: {e}")
            self._initialized = False
            return False

    async def read_data(
        self,
        spreadsheet_id: str,
        range_name: str = "Sheet1!A:Z"
    ) -> List[List[Any]]:
        """Read data from Google Sheets"""
        if not self._initialized or not self.client:
            raise RuntimeError("Google Sheets service not initialized")

        try:
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            sheet_name, range_part = range_name.split('!')
            worksheet = spreadsheet.worksheet(sheet_name)
            data = worksheet.get(range_part)
            return data
        except Exception as e:
            self.logger.error(f"Failed to read data: {e}")
            raise

    async def update_data(
        self,
        spreadsheet_id: str,
        range_name: str,
        values: List[List[Any]]
    ) -> Dict[str, Any]:
        """Update data in Google Sheets"""
        if not self._initialized or not self.client:
            raise RuntimeError("Google Sheets service not initialized")

        try:
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            sheet_name, range_part = range_name.split('!')
            worksheet = spreadsheet.worksheet(sheet_name)
            worksheet.update(range_name, values)
            return {
                "status": "success",
                "range": range_name,
                "rows_updated": len(values)
            }
        except Exception as e:
            self.logger.error(f"Failed to update data: {e}")
            raise

    def is_connected(self) -> bool:
        """Check if service is connected"""
        return self._initialized and self.client is not None

    def is_drive_ready(self) -> bool:
        return self.drive is not None

    def credentials_path_used(self) -> Optional[str]:
        return self._credentials_path

