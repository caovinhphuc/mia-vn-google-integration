#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Bridge — gửi dữ liệu đã consolidate lên ai-service để phân tích.

Đọc:
  data/daily_revenue_YYYYMMDD.json   → POST /ai/analyze/trends + /ai/anomalies
  data/orders_latest.csv             → POST /ai/sla/check (theo platform)

Ghi:
  data/ai_analysis_YYYYMMDD.json     — kết quả phân tích từ ai-service

Usage:
  python scripts/ai_bridge.py
  python scripts/ai_bridge.py --ai-url http://localhost:8000 --token <jwt>
  python scripts/ai_bridge.py --api-key mia-dev-api-key-2026
"""

import os
import sys
import json
import csv
import glob
import logging
import argparse
import requests
from datetime import datetime
from collections import defaultdict

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] ai_bridge: %(message)s",
)
logger = logging.getLogger("ai_bridge")

_DEFAULT_AI_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")
_DEFAULT_API_KEY = os.getenv("AI_API_KEY", "mia-dev-api-key-2026")


# ─── Auth ─────────────────────────────────────────────────────────────────────

def get_jwt_token(ai_url, api_key):
    """Exchange API key for JWT token."""
    try:
        resp = requests.post(
            f"{ai_url}/auth/token",
            json={"api_key": api_key},
            timeout=10,
        )
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            logger.info("JWT obtained successfully")
            return token
        # Auth may be disabled (dev mode)
        if resp.status_code == 404:
            logger.info("Auth endpoint not found — assuming auth disabled")
            return None
        logger.warning("Token request failed: %s %s", resp.status_code, resp.text[:200])
        return None
    except Exception as e:
        logger.warning("Cannot connect to ai-service: %s", e)
        return None


def _headers(token):
    if token:
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return {"Content-Type": "application/json"}


# ─── Loaders ─────────────────────────────────────────────────────────────────

def _load_latest_revenue(data_dir):
    """Load daily revenue JSON — newest file wins."""
    files = sorted(glob.glob(os.path.join(data_dir, "daily_revenue_*.json")))
    if not files:
        return []
    with open(files[-1], encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %d daily revenue records from %s", len(data), files[-1])
    return data


def _load_latest_orders(data_dir):
    """Load orders_latest.csv → list of dicts."""
    latest = os.path.join(data_dir, "orders_latest.csv")
    if not os.path.exists(latest):
        # Try normalized CSV
        files = sorted(glob.glob(os.path.join(data_dir, "orders_normalized_*.csv")))
        if not files:
            return []
        latest = files[-1]
    orders = []
    with open(latest, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            orders.append(row)
    logger.info("Loaded %d orders from %s", len(orders), latest)
    return orders


# ─── AI Service calls ─────────────────────────────────────────────────────────

def analyze_trends(ai_url, headers, daily_revenue):
    """POST /ai/analyze/trends với daily revenue time series."""
    if not daily_revenue:
        return {"error": "No revenue data"}
    payload = {
        "data": [{"date": r["date"], "value": r["value"]} for r in daily_revenue],
        "value_column": "value",
        "date_column": "date",
    }
    try:
        resp = requests.post(
            f"{ai_url}/ai/analyze/trends", json=payload, headers=headers, timeout=15
        )
        result = resp.json()
        logger.info(
            "Trends: %s | slope=%.1f | confidence=%.2f",
            result.get("trend_analysis", {}).get("trend", "?"),
            result.get("trend_analysis", {}).get("slope", 0),
            result.get("trend_analysis", {}).get("confidence", 0),
        )
        return result
    except Exception as e:
        logger.error("analyze_trends failed: %s", e)
        return {"error": str(e)}


def detect_anomalies(ai_url, headers, daily_revenue):
    """POST /ai/analyze/anomalies với daily revenue."""
    if not daily_revenue:
        return {"error": "No revenue data"}
    payload = {
        "data": [{"date": r["date"], "value": r["value"]} for r in daily_revenue],
        "value_column": "value",
        "date_column": "date",
    }
    try:
        resp = requests.post(
            f"{ai_url}/ai/analyze/anomalies", json=payload, headers=headers, timeout=15
        )
        result = resp.json()
        anomaly_count = len(result.get("anomalies", []))
        logger.info("Anomalies detected: %d | risk=%s", anomaly_count,
                    result.get("risk_level", "?"))
        return result
    except Exception as e:
        logger.error("detect_anomalies failed: %s", e)
        return {"error": str(e)}


def check_sla_by_platform(ai_url, headers, orders):
    """POST /ai/sla/check cho từng platform trong dataset."""
    if not orders:
        return {}

    # Group orders by platform
    by_platform = defaultdict(list)
    for o in orders:
        platform = (
            o.get("platform_normalized")
            or o.get("platform")
            or o.get("col_5", "other")
        ).lower()
        by_platform[platform].append({
            "id": o.get("id") or o.get("order_code") or o.get("order_id_raw", ""),
            "platform": platform,
            "status": o.get("status_normalized") or o.get("status") or o.get("col_6", ""),
            "created_at": o.get("date_str") or o.get("created_date") or "",
        })

    results = {}
    for platform, platform_orders in by_platform.items():
        if platform in ("unknown", "other") and len(platform_orders) > 50:
            # Too many unknowns — skip to avoid noisy alerts
            results[platform] = {"skipped": True, "reason": "platform unknown"}
            continue
        try:
            resp = requests.post(
                f"{ai_url}/ai/sla/check",
                json={"orders": platform_orders, "platform": platform},
                headers=headers,
                timeout=15,
            )
            result = resp.json()
            logger.info(
                "SLA %s: %d orders | violations=%d | warnings=%d | status=%s",
                platform,
                len(platform_orders),
                result.get("violation_count", 0),
                result.get("warning_count", 0),
                result.get("status", "?"),
            )
            results[platform] = result
        except Exception as e:
            logger.error("SLA check for %s failed: %s", platform, e)
            results[platform] = {"error": str(e)}

    return results


def generate_chat_summary(ai_url, headers, summary_stats):
    """POST /ai/chat với query tóm tắt toàn bộ dataset."""
    query = (
        f"Summarize: {summary_stats.get('total_orders', 0)} orders, "
        f"total revenue {summary_stats.get('total_revenue', 0):.0f}, "
        f"date range {summary_stats.get('date_min', '?')} to "
        f"{summary_stats.get('date_max', '?')}"
    )
    try:
        resp = requests.post(
            f"{ai_url}/ai/chat",
            json={"query": query},
            headers=headers,
            timeout=15,
        )
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


# ─── Main ─────────────────────────────────────────────────────────────────────

def run_analysis(ai_url=_DEFAULT_AI_URL, api_key=_DEFAULT_API_KEY, data_dir="data"):
    """Full analysis pipeline: load data → call ai-service → save results."""

    # 1. Auth
    token = get_jwt_token(ai_url, api_key)
    hdrs = _headers(token)

    # 2. Load data
    daily_revenue = _load_latest_revenue(data_dir)
    orders = _load_latest_orders(data_dir)

    if not daily_revenue and not orders:
        logger.error(
            "No data found in %s. Run data_consolidator.py first.", data_dir
        )
        return {"error": "No data available"}

    # 3. Summary stats for context
    amounts = [r.get("value", 0) for r in daily_revenue]
    dates = [r.get("date") for r in daily_revenue if r.get("date")]
    stats = {
        "total_orders": len(orders),
        "total_revenue": sum(amounts),
        "date_min": min(dates) if dates else None,
        "date_max": max(dates) if dates else None,
        "days_with_data": len(daily_revenue),
    }
    logger.info(
        "Dataset: %d orders | %d revenue days | revenue=%.0f",
        stats["total_orders"], stats["days_with_data"], stats["total_revenue"],
    )

    # 4. AI analysis calls
    results = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "ai_service_url": ai_url,
            "data_stats": stats,
        }
    }

    if daily_revenue:
        results["trends"] = analyze_trends(ai_url, hdrs, daily_revenue)
        results["anomalies"] = detect_anomalies(ai_url, hdrs, daily_revenue)

    if orders:
        results["sla"] = check_sla_by_platform(ai_url, hdrs, orders)

    results["summary_query"] = generate_chat_summary(ai_url, hdrs, stats)

    # 5. Save results
    os.makedirs(data_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = os.path.join(data_dir, f"ai_analysis_{ts}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    logger.info("Analysis saved to %s", out_path)

    results["_output_file"] = out_path
    return results


def main():
    parser = argparse.ArgumentParser(description="Send consolidated data to ai-service")
    parser.add_argument("--ai-url", default=_DEFAULT_AI_URL)
    parser.add_argument("--api-key", default=_DEFAULT_API_KEY)
    parser.add_argument("--dir", default="data", help="Data directory")
    parser.add_argument("--token", default=None, help="JWT token (skip auth step)")
    args = parser.parse_args()

    result = run_analysis(
        ai_url=args.ai_url,
        api_key=args.api_key,
        data_dir=args.dir,
    )
    print(json.dumps(result.get("metadata", {}), ensure_ascii=False, indent=2))
    if "trends" in result:
        trend = result["trends"].get("trend_analysis", {})
        print(f"\nTrend: {trend.get('trend')} | slope={trend.get('slope')} "
              f"| confidence={trend.get('confidence')}")
    if "anomalies" in result:
        print(f"Anomalies: {len(result['anomalies'].get('anomalies', []))} detected")
    if "sla" in result:
        for platform, sla in result["sla"].items():
            v = sla.get("violation_count", 0)
            w = sla.get("warning_count", 0)
            print(f"SLA {platform}: violations={v} warnings={w}")


if __name__ == "__main__":
    main()
