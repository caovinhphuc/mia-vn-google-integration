/* eslint-disable */
/**
 * Smart Automation — gọi ai-service `/api/ml/legacy/*` (mia_models).
 */

import { getAiServiceBaseUrl, parseApiJsonText } from "../utils/apiBase";

const API_BASE_URL = () => getAiServiceBaseUrl();

async function postLegacy(path, body) {
  const url = `${API_BASE_URL()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(text || `${path} ${res.status}`);
  }
  return parseApiJsonText(text, url);
}

class SmartAutomationService {
  async analyzePatterns(data, valueColumn, dateColumn = null) {
    return postLegacy("/api/ml/legacy/patterns/analyze", {
      data,
      value_column: valueColumn,
      date_column: dateColumn,
    });
  }

  async analyzeTrends(data, valueColumn) {
    return postLegacy("/api/ml/legacy/patterns/trends", {
      data,
      value_column: valueColumn,
    });
  }

  async detectAnomalies(data, valueColumn) {
    const r = await postLegacy("/api/ml/legacy/patterns/anomalies", {
      data,
      value_column: valueColumn,
    });
    return r.anomalies ?? r;
  }

  async generatePredictiveAlerts(data, valueColumn, metricName = null, threshold = null) {
    const r = await postLegacy("/api/ml/legacy/alerts/analyze", {
      data,
      value_column: valueColumn,
      metric_name: metricName,
      threshold,
    });
    return r.alerts ?? [];
  }

  async categorizeColumn(columnName, sampleValues = []) {
    return postLegacy("/api/ml/legacy/categorize/column", {
      column_name: columnName,
      sample_values: sampleValues,
    });
  }

  /**
   * Backend chỉ có categorize/column — gắn _categories cho từng row từ meta cột.
   */
  async categorizeRows(data, categoryRules = null) {
    if (!data?.length) return [];
    const keys = Object.keys(data[0]).filter((k) => !k.startsWith("_"));
    const columnMeta = {};
    for (const key of keys) {
      const samples = data
        .slice(0, 25)
        .map((row) => row[key])
        .filter((v) => v !== undefined && v !== null);
      try {
        columnMeta[key] = await this.categorizeColumn(key, samples);
      } catch (e) {
        console.warn("categorizeColumn", key, e.message);
        columnMeta[key] = { category: "other", confidence: 0.5 };
      }
    }
    const tags = [
      ...new Set(
        Object.values(columnMeta)
          .map((m) => m.category)
          .filter(Boolean)
      ),
    ];
    const priority =
      categoryRules?.priority ||
      (tags.includes("financial") || tags.includes("priority") ? "high" : "medium");
    return data.map((row) => ({
      ...row,
      _categories: {
        tags,
        priority,
        byColumn: columnMeta,
      },
    }));
  }

  async generateReport(
    data,
    valueColumn,
    reportType = "comprehensive",
    dateColumn = null,
    title = null
  ) {
    const t = title || `Report ${new Date().toLocaleDateString("vi-VN")}`;
    if (reportType === "summary") {
      return postLegacy("/api/ml/legacy/report/summary", { data, title: t });
    }
    if (reportType === "trend") {
      return postLegacy("/api/ml/legacy/report/trend", {
        data,
        value_column: valueColumn,
        date_column: dateColumn,
        title: t,
      });
    }
    if (reportType === "anomaly") {
      const anomalies = await this.detectAnomalies(data, valueColumn);
      return {
        title: t,
        executive_summary: `Phát hiện ${Array.isArray(anomalies) ? anomalies.length : 0} điểm bất thường (legacy patterns).`,
        sections: { anomalies },
        insights: Array.isArray(anomalies)
          ? anomalies.map(
              (a) =>
                a.message ||
                (a.type
                  ? `Bất thường ${a.type} (z=${Number(a.z_score).toFixed(2)})`
                  : JSON.stringify(a))
            )
          : [],
      };
    }
    return postLegacy("/api/ml/legacy/report/comprehensive", {
      data,
      value_column: valueColumn,
      date_column: dateColumn,
      title: t,
    });
  }

  async processChatQuery(query, context = null) {
    return postLegacy("/api/ml/legacy/nlp/parse", { query, context: context || {} });
  }

  async generateSummary(data, maxLength = 200) {
    return postLegacy("/api/ml/legacy/nlp/summary", {
      data,
      max_length: maxLength,
    });
  }

  async smartSearch(query, data, columns = null) {
    return postLegacy("/api/ml/legacy/nlp/search", {
      query,
      data,
      columns,
    });
  }

  async processVoiceCommand(command, context = null) {
    return postLegacy("/api/ml/legacy/nlp/parse", {
      query: command,
      context: context || {},
    });
  }
}

export const smartAutomationService = new SmartAutomationService();
export default smartAutomationService;
