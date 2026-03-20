"""
MIA / OAS legacy analytics modules (ai-service).

- nlp_processor: intent parsing, summary, smart search (no extra deps)
- pattern_recognizer: trends, anomalies, cycles (numpy)
- predictive_alerts: trend / anomaly / threshold alerts
- smart_categorizer: column & row categorization
- report_generator: summary / trend / anomaly / comprehensive reports

Not bundled here (need pandas + scikit-learn): retail_predictor, your_domain_predictor.
See sklearn_templates/ if you add pandas+scikit-learn.
"""

from .nlp_processor import NLPProcessor, nlp_processor
from .pattern_recognizer import PatternRecognizer, pattern_recognizer
from .predictive_alerts import PredictiveAlerts, predictive_alerts
from .smart_categorizer import SmartCategorizer, smart_categorizer
from .report_generator import ReportGenerator, report_generator

__all__ = [
    "NLPProcessor",
    "nlp_processor",
    "PatternRecognizer",
    "pattern_recognizer",
    "PredictiveAlerts",
    "predictive_alerts",
    "SmartCategorizer",
    "smart_categorizer",
    "ReportGenerator",
    "report_generator",
]
