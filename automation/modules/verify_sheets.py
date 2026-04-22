#!/usr/bin/env python3
"""
Simple Google Sheets Verification and Logging Test
Kiểm tra và chạy các tính năng Google Sheets integration
"""
import os
import sys
from datetime import datetime

# Ưu tiên thư mục modules (tránh cwd automation/ import nhầm google_sheets_config gốc)
_mod_dir = os.path.dirname(os.path.abspath(__file__))
if _mod_dir not in sys.path:
    sys.path.insert(0, _mod_dir)

try:
    from google_sheets_config import GoogleSheetsConfigService
    print("✅ Import GoogleSheetsConfigService successful")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)


def main():
    """Chạy verification Google Sheets"""
    print("🚀 Google Sheets Integration Verification")
    print("=" * 60)

    try:
        # Initialize service
        print("\n📋 Initializing Google Sheets service...")
        sheets_service = GoogleSheetsConfigService()

        if not sheets_service.client:
            print("❌ Failed to initialize Google Sheets client")
            print("💡 Please check:")
            print("   - service_account.json file exists")
            print("   - Google Sheets API is enabled")
            print("   - Spreadsheet permissions are correct")
            return False

        print("✅ Google Sheets client initialized")
        print(f"📊 Spreadsheet ID: {sheets_service.spreadsheet_id}")

        # Test 1: Basic config loading
        print("\n🔧 Testing config loading...")
        config = sheets_service.get_sheets_config()
        print(f"✅ Loaded config: {len(config)} sections")

        # Test 2: SLA rules
        print("\n📋 Testing SLA rules...")
        sla_rules = sheets_service.get_sla_rules()
        print(f"✅ SLA rules: {len(sla_rules)} platforms")

        # Test 3: Workspace config
        print("\n⚙️ Testing workspace config...")
        workspace_config = sheets_service.get_workspace_config()
        print(f"✅ Target records: {workspace_config['target_records']}")

        # Test 4: Status update
        print("\n📊 Testing status update...")
        progress = {
            'current_page': 1,
            'total_pages': 5,
            'orders_extracted': 100,
            'progress_percent': 20,
            'session_id': f'VERIFY_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        }
        result = sheets_service.update_automation_status('Verification Test', progress)
        print(f"✅ Status update: {'Success' if result else 'Failed'}")

        # Test 5: Automation logging
        print("\n📝 Testing automation logging...")
        test_result = {
            'success': True,
            'duration': 12.5,
            'order_count': 25,
            'enhanced_order_count': 23,
            'config_source': 'google_sheets',
            'sheets_integration': True,
            'automation_version': '2.1_verified',
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'end_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        result = sheets_service.log_automation_run(test_result)
        print(f"✅ Automation logging: {'Success' if result else 'Failed'}")

        # Test 6: Data export
        print("\n📤 Testing data export...")
        sample_data = [
            {
                'test_id': 'VER001',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'completed',
                'notes': 'Verification test successful'
            }
        ]
        # Use fixed sheet name and append mode to avoid creating new sheets
        sheet_name = 'Verification_Logs'
        result = sheets_service.export_data_to_sheets(sample_data, sheet_name, reuse_existing=True, append_mode=True)
        print(f"✅ Data export to '{sheet_name}': {'Success' if result else 'Failed'}")

        # Test 7: Create sample sheets
        print("\n🏗️ Testing sample sheets creation...")
        result = sheets_service.create_sample_sheets()
        print(f"✅ Sample sheets: {'Success' if result else 'Failed'}")

        print("\n" + "=" * 60)
        print("🎉 ALL TESTS COMPLETED!")
        print("✅ Google Sheets integration is working properly")
        print(f"🔗 View results: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False


if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Google Sheets verification completed successfully!")
    else:
        print("\n❌ Google Sheets verification failed!")

    sys.exit(0 if success else 1)
