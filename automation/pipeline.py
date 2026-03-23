#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline — Entry point chạy toàn bộ luồng:

  1. [Extract]     one_automation.py  → data/june_2025_enhanced_page_*.json
  2. [Consolidate] data_consolidator  → data/orders_normalized_*.csv + daily_revenue_*.json
  3. [Analyze]     ai_bridge          → data/ai_analysis_*.json

Usage:
  python pipeline.py                     # full pipeline
  python pipeline.py --skip-extract      # chỉ consolidate + analyze (dùng data có sẵn)
  python pipeline.py --only-analyze      # chỉ analyze (data đã consolidate rồi)
  python pipeline.py --ai-url http://...
"""

import os
import sys
import json
import logging
import argparse
import subprocess
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] pipeline: %(message)s",
)
logger = logging.getLogger("pipeline")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")
AI_API_KEY = os.getenv("AI_API_KEY", "mia-dev-api-key-2026")


# ─── Phases ───────────────────────────────────────────────────────────────────

def phase_extract():
    """Phase 1: Run one_automation.py để lấy data từ ONE."""
    logger.info("=" * 60)
    logger.info("PHASE 1 — EXTRACT: Running one_automation.py")
    logger.info("=" * 60)
    script = os.path.join(os.path.dirname(__file__), "one_automation.py")
    result = subprocess.run(
        [sys.executable, script],
        capture_output=False,   # let output stream to terminal
        cwd=os.path.dirname(__file__),
    )
    if result.returncode != 0:
        logger.warning("one_automation.py exited with code %d", result.returncode)
        return False
    logger.info("Phase 1 complete.")
    return True


def phase_consolidate(data_dir=DATA_DIR):
    """Phase 2: Merge page files → normalized dataset."""
    logger.info("=" * 60)
    logger.info("PHASE 2 — CONSOLIDATE: Merging page files")
    logger.info("=" * 60)
    from scripts.data_consolidator import consolidate
    summary = consolidate(data_dir=data_dir)
    if "error" in summary:
        logger.error("Consolidation failed: %s", summary["error"])
        return None
    logger.info(
        "Phase 2 complete: %d orders | %d days | revenue=%.0f",
        summary.get("total_orders", 0),
        summary.get("days_with_data", 0),
        summary.get("total_revenue", 0),
    )
    return summary


def phase_analyze(ai_url=AI_SERVICE_URL, api_key=AI_API_KEY, data_dir=DATA_DIR):
    """Phase 3: Send consolidated data to ai-service."""
    logger.info("=" * 60)
    logger.info("PHASE 3 — ANALYZE: Calling ai-service at %s", ai_url)
    logger.info("=" * 60)
    from scripts.ai_bridge import run_analysis
    result = run_analysis(ai_url=ai_url, api_key=api_key, data_dir=data_dir)
    if "error" in result:
        logger.error("Analysis failed: %s", result["error"])
        return None
    logger.info("Phase 3 complete. Results: %s", result.get("_output_file", "?"))
    return result


# ─── Entry point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Full automation → AI analysis pipeline")
    parser.add_argument(
        "--skip-extract", action="store_true",
        help="Skip Phase 1 (use existing data files)"
    )
    parser.add_argument(
        "--only-analyze", action="store_true",
        help="Skip Phase 1 and 2 (data already consolidated)"
    )
    parser.add_argument("--ai-url", default=AI_SERVICE_URL)
    parser.add_argument("--api-key", default=AI_API_KEY)
    parser.add_argument("--data-dir", default=DATA_DIR)
    args = parser.parse_args()

    start = datetime.now()
    report = {
        "started_at": start.isoformat(),
        "phases": {},
    }

    # Phase 1
    if not args.skip_extract and not args.only_analyze:
        ok = phase_extract()
        report["phases"]["extract"] = "success" if ok else "failed"
        if not ok:
            logger.warning("Extract phase failed — continuing with existing data")
    else:
        logger.info("Phase 1 skipped.")

    # Phase 2
    if not args.only_analyze:
        consolidate_summary = phase_consolidate(args.data_dir)
        report["phases"]["consolidate"] = consolidate_summary or "failed"
        if not consolidate_summary:
            logger.error("Consolidation failed — cannot proceed to analysis")
            sys.exit(1)
    else:
        logger.info("Phase 2 skipped.")

    # Phase 3
    analysis = phase_analyze(
        ai_url=args.ai_url,
        api_key=args.api_key,
        data_dir=args.data_dir,
    )
    report["phases"]["analyze"] = "success" if analysis else "failed"

    # Summary
    elapsed = (datetime.now() - start).total_seconds()
    report["elapsed_seconds"] = round(elapsed, 1)
    report["completed_at"] = datetime.now().isoformat()

    logger.info("=" * 60)
    logger.info("PIPELINE COMPLETE in %.1fs", elapsed)
    if analysis and "trends" in analysis:
        trend = analysis["trends"].get("trend_analysis", {})
        logger.info(
            "  Trend: %s | slope=%.2f | confidence=%.2f",
            trend.get("trend", "?"),
            trend.get("slope", 0),
            trend.get("confidence", 0),
        )
    if analysis and "sla" in analysis:
        total_violations = sum(
            v.get("violation_count", 0)
            for v in analysis["sla"].values()
            if isinstance(v, dict)
        )
        logger.info("  SLA violations: %d", total_violations)
    logger.info("=" * 60)

    # Save pipeline report
    report_path = os.path.join(
        args.data_dir,
        f"pipeline_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
    )
    os.makedirs(args.data_dir, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    logger.info("Report saved: %s", report_path)


if __name__ == "__main__":
    main()
