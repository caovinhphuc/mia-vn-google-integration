#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Consolidator — merge nhiều page JSON files thành một dataset chuẩn hóa.

Input:  data/june_2025_enhanced_page_*.json  (hoặc pattern tùy chỉnh)
Output:
  data/orders_normalized_YYYYMMDD.csv       — flat CSV, mỗi hàng 1 đơn hàng
  data/orders_normalized_YYYYMMDD.json      — JSON array, cùng nội dung
  data/daily_revenue_YYYYMMDD.json          — aggregate theo ngày cho AI trend analysis
  data/orders_latest.csv                    — symlink/copy của output CSV mới nhất

Usage:
  python scripts/data_consolidator.py
  python scripts/data_consolidator.py --pattern "data/orders_COMPLETE_*.csv"
  python scripts/data_consolidator.py --dir /path/to/data
"""

import os
import sys
import json
import csv
import glob
import logging
import argparse
from datetime import datetime
from collections import defaultdict

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] consolidator: %(message)s",
)
logger = logging.getLogger("consolidator")

# ─── Column mapping ───────────────────────────────────────────────────────────
# Đọc từ config/columns_orders.json nếu có, fallback về mapping mặc định.

_DEFAULT_COL_MAP = {
    "col_1": "order_code",
    "col_2": "order_id_raw",
    "col_3": "created_date",
    "col_4": "customer_name",
    "col_5": "platform",
    "col_6": "status",
    "col_7": "amount_display",
    "col_8": "warehouse_note",
}

_PLATFORM_KEYWORDS = {
    "shopee": ["shopee", "sp"],
    "tiktok": ["tiktok", "tt", "tik tok"],
    "lazada": ["lazada", "lz"],
    "website": ["website", "web"],
    "tiki": ["tiki", "tk"],
}


def _load_col_config():
    config_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "config",
        "columns_orders.json",
    )
    try:
        with open(config_path, encoding="utf-8") as f:
            cfg = json.load(f)
        return (
            cfg.get("col_mapping", _DEFAULT_COL_MAP),
            cfg.get("platform_keywords", _PLATFORM_KEYWORDS),
        )
    except Exception:
        return _DEFAULT_COL_MAP, _PLATFORM_KEYWORDS


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _detect_platform(order, platform_keywords):
    """Infer platform from col_5 or known keyword patterns."""
    raw = (
        order.get("platform")
        or order.get("col_5", "")
        or order.get("api_transporter", "")
        or ""
    ).lower()
    for platform, keywords in platform_keywords.items():
        if any(kw in raw for kw in keywords):
            return platform
    return "other" if raw else "unknown"


def _parse_amount(order):
    """Return float amount from api_amount or amount_display."""
    for field in ("api_amount", "amount_display", "col_7"):
        raw = str(order.get(field, "")).strip()
        if not raw:
            continue
        # Remove thousand separators and currency symbols
        cleaned = raw.replace(",", "").replace(".", "").replace("đ", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            continue
    return 0.0


def _parse_date(order):
    """Return YYYY-MM-DD string from created_date, col_3, or scraped_at."""
    for field in ("created_date", "col_3", "processing_timestamp", "scraped_at"):
        raw = str(order.get(field, "")).strip()
        if not raw:
            continue
        # Try ISO format first
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(raw[:10], fmt[:8]).strftime("%Y-%m-%d")
            except ValueError:
                continue
        # fallback: take first 10 chars if they look like a date
        if len(raw) >= 10 and raw[4] in ("-", "/"):
            return raw[:10]
    return None


def _normalize_order(order, col_map, platform_keywords):
    """Return a flat, semantically-named dict for one order."""
    normalized = {}

    # Apply column mapping (col_N → semantic name)
    for col_key, semantic in col_map.items():
        if col_key in order:
            normalized[semantic] = order[col_key]

    # Prefer explicit named fields over col_N fallbacks
    for direct in (
        "id", "order_code", "order_code_clean", "order_id_clean",
        "customer", "customer_name_clean",
        "api_customer", "api_amount", "api_transporter",
        "api_address", "api_phone",
        "product_summary", "product_count", "total_items",
        "session_id", "page_number", "processing_timestamp",
        "has_product_details", "date_range",
    ):
        if direct in order:
            normalized[direct] = order[direct]

    # Derived fields
    normalized["platform_normalized"] = _detect_platform(order, platform_keywords)
    normalized["amount_float"] = _parse_amount(order)
    normalized["date_str"] = _parse_date(order)
    normalized["status_normalized"] = str(
        order.get("status") or order.get("col_6", "")
    ).lower().strip()

    return normalized


# ─── Loaders ─────────────────────────────────────────────────────────────────

def _load_page_json(filepath):
    """Load orders from a june_2025_enhanced_page_*.json file."""
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)
    # Format: {"metadata": {...}, "orders": [...]}
    if isinstance(data, dict) and "orders" in data:
        return data["orders"]
    # Fallback: flat list
    if isinstance(data, list):
        return data
    return []


def _load_orders_csv(filepath):
    """Load orders from a flat CSV file."""
    orders = []
    with open(filepath, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            orders.append(dict(row))
    return orders


def _discover_files(data_dir, pattern=None):
    """Find all page JSON or CSV files to consolidate."""
    if pattern:
        files = sorted(glob.glob(pattern))
    else:
        json_files = sorted(
            glob.glob(os.path.join(data_dir, "*enhanced_page*.json"))
        )
        csv_files = sorted(
            glob.glob(os.path.join(data_dir, "orders_COMPLETE_*.csv"))
        )
        files = json_files or csv_files  # prefer JSON, fallback to CSV

    if not files:
        logger.warning("No source files found in %s", data_dir)
    return files


# ─── Main consolidation ───────────────────────────────────────────────────────

def consolidate(data_dir="data", pattern=None, output_dir=None):
    """
    Merge all page files → normalized CSV/JSON + daily revenue aggregate.
    Returns dict with output file paths and summary stats.
    """
    col_map, platform_keywords = _load_col_config()
    output_dir = output_dir or data_dir
    os.makedirs(output_dir, exist_ok=True)

    files = _discover_files(data_dir, pattern)
    if not files:
        return {"error": "No source files found", "files": []}

    logger.info("Found %d source files to consolidate", len(files))

    all_orders = []
    for filepath in files:
        try:
            if filepath.endswith(".json"):
                orders = _load_page_json(filepath)
            else:
                orders = _load_orders_csv(filepath)
            logger.info("  %s → %d orders", os.path.basename(filepath), len(orders))
            all_orders.extend(orders)
        except Exception as e:
            logger.warning("  Skipping %s: %s", filepath, e)

    if not all_orders:
        return {"error": "No orders loaded from any file", "files": files}

    logger.info("Total raw orders: %d", len(all_orders))

    # Normalize
    normalized = [
        _normalize_order(o, col_map, platform_keywords) for o in all_orders
    ]

    # Deduplicate by order id
    seen_ids = set()
    unique_orders = []
    for o in normalized:
        oid = str(o.get("id") or o.get("order_code") or o.get("order_id_raw") or "")
        if oid and oid in seen_ids:
            continue
        if oid:
            seen_ids.add(oid)
        unique_orders.append(o)

    logger.info("Unique orders after dedup: %d", len(unique_orders))

    # ── Build daily revenue aggregate (for AI trend analysis) ────────────────
    daily = defaultdict(float)
    daily_count = defaultdict(int)
    for o in unique_orders:
        date = o.get("date_str")
        if date:
            daily[date] += o.get("amount_float", 0.0)
            daily_count[date] += 1

    daily_revenue = [
        {"date": d, "value": round(daily[d], 2), "order_count": daily_count[d]}
        for d in sorted(daily.keys())
    ]

    # ── Write outputs ─────────────────────────────────────────────────────────
    ts = datetime.now().strftime("%Y%m%d")

    # 1. Normalized CSV
    csv_path = os.path.join(output_dir, f"orders_normalized_{ts}.csv")
    if unique_orders:
        fieldnames = list(unique_orders[0].keys())
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(unique_orders)
        logger.info("Wrote %s (%d rows)", csv_path, len(unique_orders))

    # 2. Normalized JSON
    json_path = os.path.join(output_dir, f"orders_normalized_{ts}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "total_orders": len(unique_orders),
                    "source_files": len(files),
                    "date_range": {
                        "min": min(daily.keys()) if daily else None,
                        "max": max(daily.keys()) if daily else None,
                    },
                },
                "orders": unique_orders,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    logger.info("Wrote %s", json_path)

    # 3. Daily revenue (for AI)
    revenue_path = os.path.join(output_dir, f"daily_revenue_{ts}.json")
    with open(revenue_path, "w", encoding="utf-8") as f:
        json.dump(daily_revenue, f, ensure_ascii=False, indent=2)
    logger.info("Wrote %s (%d days)", revenue_path, len(daily_revenue))

    # 4. orders_latest.csv — stable name for downstream consumers
    latest_path = os.path.join(output_dir, "orders_latest.csv")
    if unique_orders:
        import shutil
        shutil.copy2(csv_path, latest_path)
        logger.info("Updated %s", latest_path)

    # Summary
    platform_counts = defaultdict(int)
    for o in unique_orders:
        platform_counts[o.get("platform_normalized", "unknown")] += 1

    summary = {
        "total_orders": len(unique_orders),
        "source_files": len(files),
        "date_range": {
            "min": min(daily.keys()) if daily else None,
            "max": max(daily.keys()) if daily else None,
        },
        "days_with_data": len(daily),
        "total_revenue": round(sum(daily.values()), 2),
        "platform_breakdown": dict(platform_counts),
        "outputs": {
            "csv": csv_path,
            "json": json_path,
            "daily_revenue": revenue_path,
            "latest": latest_path,
        },
    }

    logger.info(
        "Done: %d orders | %d days | revenue %.0f",
        summary["total_orders"],
        summary["days_with_data"],
        summary["total_revenue"],
    )
    return summary


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Consolidate automation page files")
    parser.add_argument("--dir", default="data", help="Data directory (default: data)")
    parser.add_argument("--pattern", default=None, help="Glob pattern override")
    parser.add_argument("--output-dir", default=None, help="Output directory")
    args = parser.parse_args()

    result = consolidate(
        data_dir=args.dir,
        pattern=args.pattern,
        output_dir=args.output_dir,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
