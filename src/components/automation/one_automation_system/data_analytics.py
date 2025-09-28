#!/usr/bin/env python3
"""
ONE Automation System - Data Analytics
Phân tích chi tiết dữ liệu đơn hàng
"""

import pandas as pd
import json
import glob
import os
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter

class DataAnalytics:
    """Phân tích dữ liệu đơn hàng"""

    def __init__(self):
        self.data_dir = "data"
        self.reports_dir = "reports"
        os.makedirs(self.reports_dir, exist_ok=True)

    def load_all_data(self):
        """Tải tất cả dữ liệu CSV"""
        all_data = []
        csv_files = glob.glob(f"{self.data_dir}/*.csv")

        for file_path in csv_files:
            try:
                df = pd.read_csv(file_path)
                df['source_file'] = os.path.basename(file_path)
                all_data.append(df)
            except Exception as e:
                print(f"Lỗi đọc file {file_path}: {e}")

        if all_data:
            return pd.concat(all_data, ignore_index=True)
        return pd.DataFrame()

    def analyze_channels(self, df):
        """Phân tích kênh bán hàng"""
        if 'customer' not in df.columns:
            return {}

        # Phân loại kênh
        channels = {
            'Shopee': 0,
            'Tiktok': 0,
            'Khách lẻ': 0,
            'Khác': 0
        }

        for customer in df['customer']:
            if pd.isna(customer) or customer == '':
                continue
            customer_lower = str(customer).lower()
            if 'shopee' in customer_lower:
                channels['Shopee'] += 1
            elif 'tiktok' in customer_lower:
                channels['Tiktok'] += 1
            elif any(name in customer_lower for name in ['anh', 'chị', 'nguyễn', 'trần', 'lê', 'phạm', 'hoàng', 'phan', 'vũ', 'đặng', 'bùi', 'đỗ', 'hồ', 'ngô']):
                channels['Khách lẻ'] += 1
            else:
                channels['Khác'] += 1

        return channels

    def analyze_time_patterns(self, df):
        """Phân tích mẫu thời gian"""
        if 'scraped_at' not in df.columns:
            return {}

        df['scraped_at'] = pd.to_datetime(df['scraped_at'])
        df['hour'] = df['scraped_at'].dt.hour
        df['day'] = df['scraped_at'].dt.day_name()
        df['date'] = df['scraped_at'].dt.date

        patterns = {
            'hourly_distribution': df['hour'].value_counts().to_dict(),
            'daily_distribution': df['day'].value_counts().to_dict(),
            'date_distribution': df['date'].value_counts().to_dict(),
            'peak_hour': df['hour'].mode().iloc[0] if not df['hour'].empty else None,
            'total_days': df['date'].nunique()
        }

        return patterns

    def analyze_order_patterns(self, df):
        """Phân tích mẫu đơn hàng"""
        analysis = {
            'total_orders': len(df),
            'unique_customers': df['customer'].nunique() if 'customer' in df.columns else 0,
            'avg_orders_per_customer': 0,
            'top_customers': {},
            'order_code_patterns': {}
        }

        if 'customer' in df.columns and not df['customer'].empty:
            customer_counts = df['customer'].value_counts()
            analysis['avg_orders_per_customer'] = customer_counts.mean()
            analysis['top_customers'] = customer_counts.head(10).to_dict()

        if 'order_code' in df.columns and not df['order_code'].empty:
            # Phân tích pattern mã đơn hàng
            codes = df['order_code'].dropna()
            if not codes.empty:
                # Extract date patterns from order codes
                date_patterns = []
                for code in codes:
                    if 'SO' in str(code) and ':' in str(code):
                        parts = str(code).split(':')
                        if len(parts) > 0:
                            date_part = parts[0].replace('SO', '')
                            date_patterns.append(date_part)

                analysis['order_code_patterns'] = {
                    'total_codes': len(codes),
                    'unique_codes': codes.nunique(),
                    'date_patterns': Counter(date_patterns).most_common(5)
                }

        return analysis

    def generate_summary_report(self):
        """Tạo báo cáo tổng hợp"""
        df = self.load_all_data()

        if df.empty:
            return {'error': 'Không có dữ liệu để phân tích'}

        # Thực hiện các phân tích
        channels = self.analyze_channels(df)
        time_patterns = self.analyze_time_patterns(df)
        order_patterns = self.analyze_order_patterns(df)

        # Tạo báo cáo
        report = {
            'generated_at': datetime.now().isoformat(),
            'data_summary': {
                'total_files': len(glob.glob(f"{self.data_dir}/*.csv")),
                'total_records': len(df),
                'date_range': {
                    'from': df['scraped_at'].min() if 'scraped_at' in df.columns else None,
                    'to': df['scraped_at'].max() if 'scraped_at' in df.columns else None
                }
            },
            'channel_analysis': channels,
            'time_analysis': time_patterns,
            'order_analysis': order_patterns
        }

        # Lưu báo cáo
        report_file = f"{self.reports_dir}/analytics_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)

        return report

    def create_visualizations(self):
        """Tạo biểu đồ phân tích"""
        df = self.load_all_data()

        if df.empty:
            return {'error': 'Không có dữ liệu để tạo biểu đồ'}

        # Set style
        plt.style.use('default')
        sns.set_palette("husl")

        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('📊 ONE Automation - Phân tích dữ liệu đơn hàng', fontsize=16, fontweight='bold')

        # 1. Channel distribution
        if 'customer' in df.columns:
            channels = self.analyze_channels(df)
            if any(channels.values()):
                axes[0, 0].pie(channels.values(), labels=channels.keys(), autopct='%1.1f%%')
                axes[0, 0].set_title('Phân bố kênh bán hàng')

        # 2. Hourly distribution
        if 'scraped_at' in df.columns:
            df['hour'] = pd.to_datetime(df['scraped_at']).dt.hour
            hourly_counts = df['hour'].value_counts().sort_index()
            axes[0, 1].bar(hourly_counts.index, hourly_counts.values)
            axes[0, 1].set_title('Phân bố theo giờ')
            axes[0, 1].set_xlabel('Giờ')
            axes[0, 1].set_ylabel('Số đơn hàng')

        # 3. Daily trend
        if 'scraped_at' in df.columns:
            df['date'] = pd.to_datetime(df['scraped_at']).dt.date
            daily_counts = df['date'].value_counts().sort_index()
            axes[1, 0].plot(daily_counts.index, daily_counts.values, marker='o')
            axes[1, 0].set_title('Xu hướng theo ngày')
            axes[1, 0].set_xlabel('Ngày')
            axes[1, 0].set_ylabel('Số đơn hàng')
            axes[1, 0].tick_params(axis='x', rotation=45)

        # 4. Top customers
        if 'customer' in df.columns:
            top_customers = df['customer'].value_counts().head(10)
            if not top_customers.empty:
                axes[1, 1].barh(range(len(top_customers)), top_customers.values)
                axes[1, 1].set_yticks(range(len(top_customers)))
                axes[1, 1].set_yticklabels([str(c)[:20] + '...' if len(str(c)) > 20 else str(c) for c in top_customers.index])
                axes[1, 1].set_title('Top 10 khách hàng')
                axes[1, 1].set_xlabel('Số đơn hàng')

        plt.tight_layout()

        # Save chart
        chart_file = f"{self.reports_dir}/analytics_chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(chart_file, dpi=300, bbox_inches='tight')
        plt.close()

        return {'chart_file': chart_file}

    def export_excel_report(self):
        """Xuất báo cáo Excel chi tiết"""
        df = self.load_all_data()

        if df.empty:
            return {'error': 'Không có dữ liệu để xuất'}

        excel_file = f"{self.reports_dir}/detailed_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

        with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
            # Sheet 1: Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)

            # Sheet 2: Channel analysis
            if 'customer' in df.columns:
                channels = self.analyze_channels(df)
                channel_df = pd.DataFrame(list(channels.items()), columns=['Kênh', 'Số đơn'])
                channel_df.to_excel(writer, sheet_name='Phân tích kênh', index=False)

            # Sheet 3: Time analysis
            if 'scraped_at' in df.columns:
                df['hour'] = pd.to_datetime(df['scraped_at']).dt.hour
                hourly_df = df['hour'].value_counts().sort_index().reset_index()
                hourly_df.columns = ['Giờ', 'Số đơn']
                hourly_df.to_excel(writer, sheet_name='Phân tích thời gian', index=False)

            # Sheet 4: Customer analysis
            if 'customer' in df.columns:
                customer_df = df['customer'].value_counts().reset_index()
                customer_df.columns = ['Khách hàng', 'Số đơn']
                customer_df.to_excel(writer, sheet_name='Phân tích khách hàng', index=False)

        return {'excel_file': excel_file}

def main():
    """Hàm chính"""
    import sys

    analytics = DataAnalytics()

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == '--report':
            print("📊 Tạo báo cáo phân tích...")
            report = analytics.generate_summary_report()
            if 'error' not in report:
                print("✅ Báo cáo đã được tạo!")
                print(f"📄 Tổng số đơn hàng: {report['data_summary']['total_records']}")
                print(f"📁 Số file: {report['data_summary']['total_files']}")
                print("🏪 Phân bố kênh:")
                for channel, count in report['channel_analysis'].items():
                    print(f"  - {channel}: {count} đơn")
            else:
                print(f"❌ {report['error']}")

        elif command == '--chart':
            print("📈 Tạo biểu đồ phân tích...")
            result = analytics.create_visualizations()
            if 'error' not in result:
                print(f"✅ Biểu đồ đã được tạo: {result['chart_file']}")
            else:
                print(f"❌ {result['error']}")

        elif command == '--excel':
            print("📋 Xuất báo cáo Excel...")
            result = analytics.export_excel_report()
            if 'error' not in result:
                print(f"✅ Báo cáo Excel đã được tạo: {result['excel_file']}")
            else:
                print(f"❌ {result['error']}")

        elif command == '--all':
            print("🚀 Tạo tất cả báo cáo...")

            # Tạo báo cáo JSON
            report = analytics.generate_summary_report()
            if 'error' not in report:
                print("✅ Báo cáo JSON hoàn thành!")

            # Tạo biểu đồ
            chart_result = analytics.create_visualizations()
            if 'error' not in chart_result:
                print("✅ Biểu đồ hoàn thành!")

            # Tạo Excel
            excel_result = analytics.export_excel_report()
            if 'error' not in excel_result:
                print("✅ Báo cáo Excel hoàn thành!")

            print("🎉 Tất cả báo cáo đã được tạo trong thư mục reports/")

        else:
            print("❌ Lệnh không hợp lệ!")
            print("Sử dụng: --report | --chart | --excel | --all")

    else:
        print("📊 ONE Automation - Data Analytics")
        print("=" * 40)
        print("Sử dụng:")
        print("  --report : Tạo báo cáo JSON")
        print("  --chart  : Tạo biểu đồ PNG")
        print("  --excel  : Tạo báo cáo Excel")
        print("  --all    : Tạo tất cả báo cáo")

if __name__ == "__main__":
    main()
