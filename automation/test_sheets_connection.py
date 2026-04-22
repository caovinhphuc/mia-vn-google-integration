#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Sheets Connection Test Script
Kiểm tra kết nối và cấu hình Google Sheets API
"""

import os
import sys
import json
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_imports():
    """Test if required modules are installed"""
    print("🔍 Testing Python imports...")
    try:
        import gspread
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
        print("✅ All required modules are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing module: {e}")
        print("   Install with: pip install gspread google-auth google-api-python-client")
        return False

def test_env_vars():
    """Test environment variables"""
    print("\n🔍 Testing environment variables...")
    from dotenv import load_dotenv
    from google_sheets_config import resolve_service_account_credentials_path

    load_dotenv()

    sheet_id = os.getenv('GOOGLE_SHEET_ID')

    if not sheet_id:
        print("❌ GOOGLE_SHEET_ID not found in environment")
        print("   Set in .env file or export GOOGLE_SHEET_ID=your_sheet_id")
        return False
    print(f"✅ GOOGLE_SHEET_ID: {sheet_id[:20]}...")

    service_account_file = resolve_service_account_credentials_path()
    if not service_account_file:
        print("❌ Không tìm thấy service account JSON hợp lệ.")
        print(
            "   Đặt GOOGLE_SERVICE_ACCOUNT_FILE hoặc GOOGLE_APPLICATION_CREDENTIALS trong .env, "
            "hoặc đặt key tại ~/.secrets/google/ (tên GCP dạng *.json), "
            "hoặc config/service_account.json"
        )
        return False
    print(f"✅ Service account: {service_account_file}")

    return True, sheet_id, service_account_file

def test_credentials_file(credentials_path):
    """Test credentials file"""
    print(f"\n🔍 Testing credentials file: {credentials_path}...")
    
    if not os.path.exists(credentials_path):
        print(f"❌ Credentials file not found: {credentials_path}")
        return False
    
    try:
        with open(credentials_path, 'r') as f:
            creds = json.load(f)
        
        # Check required fields
        required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
        missing = [field for field in required_fields if field not in creds]
        
        if missing:
            print(f"❌ Missing required fields: {', '.join(missing)}")
            return False
        
        print(f"✅ Valid credentials file")
        print(f"   Project ID: {creds.get('project_id', 'N/A')}")
        print(f"   Client Email: {creds.get('client_email', 'N/A')}")
        return True
        
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in credentials file")
        return False
    except Exception as e:
        print(f"❌ Error reading credentials: {e}")
        return False

def test_google_sheets_connection(sheet_id, credentials_path):
    """Test actual Google Sheets API connection"""
    print(f"\n🔍 Testing Google Sheets API connection...")
    
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
        
        # Authenticate
        SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.readonly'
        ]
        
        creds = Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        
        service = build('sheets', 'v4', credentials=creds)
        
        # Try to get sheet info
        sheet_metadata = service.spreadsheets().get(
            spreadsheetId=sheet_id
        ).execute()
        
        title = sheet_metadata.get('properties', {}).get('title', 'Unknown')
        sheets = [s['properties']['title'] for s in sheet_metadata.get('sheets', [])]
        
        print(f"✅ Successfully connected to Google Sheets!")
        print(f"   Sheet Title: {title}")
        print(f"   Sheet ID: {sheet_id}")
        print(f"   Number of sheets: {len(sheets)}")
        print(f"   Sheet names: {', '.join(sheets[:5])}")
        if len(sheets) > 5:
            print(f"   ... and {len(sheets) - 5} more")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check if Sheet ID is correct")
        print("   2. Share the Google Sheet with the service account email")
        print("   3. Verify credentials file is valid")
        print("   4. Check Google Cloud Console - APIs are enabled")
        return False

def test_read_data(sheet_id, credentials_path):
    """Test reading data from sheet"""
    print(f"\n🔍 Testing data read...")
    
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
        
        SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        creds = Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=creds)
        
        # Try to read first sheet, first 10 rows
        sheet_metadata = service.spreadsheets().get(
            spreadsheetId=sheet_id
        ).execute()
        
        first_sheet = sheet_metadata.get('sheets', [{}])[0]
        sheet_name = first_sheet.get('properties', {}).get('title', 'Sheet1')
        range_name = f"{sheet_name}!A1:Z10"
        
        result = service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range=range_name
        ).execute()
        
        values = result.get('values', [])
        print(f"✅ Successfully read data from sheet '{sheet_name}'")
        print(f"   Rows read: {len(values)}")
        if values:
            print(f"   First row: {values[0]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Data read failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Google Sheets Connection Test")
    print("=" * 60)
    print()
    
    # Test 1: Imports
    if not test_imports():
        print("\n❌ Test failed: Missing dependencies")
        sys.exit(1)
    
    # Test 2: Environment variables
    env_result = test_env_vars()
    if not env_result:
        print("\n❌ Test failed: Environment variables not configured")
        sys.exit(1)
    
    success, sheet_id, credentials_path = env_result
    
    # Test 3: Credentials file
    if not test_credentials_file(credentials_path):
        print("\n❌ Test failed: Invalid credentials file")
        sys.exit(1)
    
    # Test 4: Google Sheets connection
    if not test_google_sheets_connection(sheet_id, credentials_path):
        print("\n❌ Test failed: Cannot connect to Google Sheets")
        sys.exit(1)
    
    # Test 5: Read data
    if not test_read_data(sheet_id, credentials_path):
        print("\n⚠️  Warning: Cannot read data (may be normal if sheet is empty)")
    
    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)
    print("\n🎉 Google Sheets integration is ready to use!")
    print()

if __name__ == "__main__":
    main()

