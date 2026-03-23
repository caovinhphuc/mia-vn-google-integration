/**
 * AI Service — gọi trực tiếp ai-service (FastAPI port 8000).
 * Routes khớp với ai_service.py v4.2
 */

import { getAiServiceBaseUrl, parseApiJsonText } from "../utils/apiBase";

const base = () => getAiServiceBaseUrl();

// ── Auth token cache ────────────────────────────────────────────────────────
let _cachedToken = null;
let _tokenExpiry = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const apiKey =
    process.env.REACT_APP_AI_API_KEY || process.env.VITE_AI_API_KEY || "mia-dev-api-key-2026";

  try {
    const res = await fetch(`${base()}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!res.ok) return null; // AUTH_REQUIRED=false mode
    const data = await res.json();
    _cachedToken = data.access_token;
    // expire 5 phút trước hết hạn để tránh race
    _tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    return _cachedToken;
  } catch {
    return null;
  }
}

async function fetchJson(path, options = {}) {
  const token = await getToken();
  const url = `${base()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    const err = new Error(text || `HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return parseApiJsonText(text, url);
}

// ── Helper builders ─────────────────────────────────────────────────────────

function buildDataRows(metrics) {
  // Tạo data array từ metrics object cho các endpoint cần data + value_column
  const keys = Object.keys(metrics || {}).filter((k) => typeof metrics[k] === "number");
  if (keys.length === 0) return { data: [{ value: 0 }], value_column: "value" };
  const col = keys[0];
  return {
    data: [{ [col]: metrics[col] }],
    value_column: col,
  };
}

function buildInsights(trends, anomalies) {
  const insights = [];
  if (trends?.trend) {
    insights.push({
      id: 1,
      type: "trend",
      title: `Xu hướng ${trends.trend === "increasing" ? "tăng trưởng" : trends.trend === "decreasing" ? "giảm" : "ổn định"}`,
      description: `Thay đổi ${Number(trends.change_percentage || 0).toFixed(1)}% — độ tin cậy ${Math.round((trends.confidence || 0) * 100)}%.`,
      confidence: trends.confidence || 0.7,
      impact: Math.abs(trends.change_percentage || 0) > 20 ? "high" : "medium",
      action: "Theo dõi xu hướng và tối ưu vận hành.",
    });
  }
  if (Array.isArray(anomalies) && anomalies.length > 0) {
    insights.push({
      id: 2,
      type: "anomaly",
      title: `Phát hiện ${anomalies.length} bất thường`,
      description: `Loại: ${anomalies.map((a) => a.type).join(", ")}.`,
      confidence: 0.85,
      impact: anomalies.some((a) => a.severity === "high") ? "high" : "medium",
      action: "Kiểm tra và xác minh hoạt động.",
    });
  }
  if (insights.length === 0) {
    insights.push({
      id: 1,
      type: "optimization",
      title: "Hệ thống ổn định",
      description: "Không phát hiện bất thường.",
      confidence: 0.9,
      impact: "low",
      action: "Tiếp tục theo dõi.",
    });
  }
  return insights;
}

// ── AIService class ─────────────────────────────────────────────────────────

class AIService {
  async analyzeData(metrics, timeframe = "7d") {
    const { data, value_column } = buildDataRows(metrics);
    const [trendsRes, anomalyRes] = await Promise.allSettled([
      fetchJson("/ai/analyze/trends", {
        method: "POST",
        body: JSON.stringify({ data, value_column }),
      }),
      fetchJson("/ai/analyze/anomalies", {
        method: "POST",
        body: JSON.stringify({ data, value_column }),
      }),
    ]);
    const trends = trendsRes.status === "fulfilled" ? trendsRes.value?.trend_analysis : null;
    const anomalies = anomalyRes.status === "fulfilled" ? anomalyRes.value?.anomalies : [];
    return { insights: buildInsights(trends, anomalies) };
  }

  async getPredictions(metrics, timeframe = "7d") {
    const { data, value_column } = buildDataRows(metrics);
    try {
      const result = await fetchJson("/ai/predictions", {
        method: "POST",
        body: JSON.stringify({ data, value_column, horizon: 5 }),
      });
      const preds = result.predictions?.[value_column] || [0, 0, 0, 0, 0];
      const base_val = metrics?.[value_column] ?? metrics?.sheets ?? 0;
      return {
        predictions: {
          nextWeek: {
            sheets: Math.max(0, Math.round(preds[4] || base_val)),
            files: Math.max(0, Math.round((metrics?.files ?? 0) * 1.05)),
            alerts: Math.max(0, Math.round((metrics?.alerts ?? 0) * 1.1)),
          },
          nextMonth: {
            sheets: Math.max(0, Math.round((preds[4] || base_val) * 4)),
            files: Math.max(0, Math.round((metrics?.files ?? 0) * 1.2)),
            alerts: Math.max(0, Math.round((metrics?.alerts ?? 0) * 1.3)),
          },
        },
      };
    } catch {
      return {
        predictions: {
          nextWeek: { sheets: 0, files: 0, alerts: 0 },
          nextMonth: { sheets: 0, files: 0, alerts: 0 },
        },
      };
    }
  }

  async detectAnomalies(data) {
    return fetchJson("/ai/analyze/anomalies", {
      method: "POST",
      body: JSON.stringify({
        data: Array.isArray(data) ? data : [],
        value_column: "value",
      }),
    }).catch(() => ({ anomalies: [] }));
  }

  async getRecommendations(context) {
    try {
      const { data, value_column } = buildDataRows(context || { value: 1 });
      const result = await fetchJson("/ai/reports/summary", {
        method: "POST",
        body: JSON.stringify({
          data,
          value_column,
          title: "Dashboard Recommendations",
        }),
      });
      const raw = result?.recommendations || result?.insights || [];
      const texts = Array.isArray(raw)
        ? raw.map((r) => (typeof r === "string" ? r : r?.message || JSON.stringify(r)))
        : [];

      if (texts.length === 0) {
        return {
          recommendations: [
            {
              id: 1,
              category: "ops",
              title: "Tối ưu hóa Google Sheets API",
              description: "Sử dụng batch requests để giảm 40% thời gian xử lý",
              priority: "high",
              effort: "medium",
              impact: "high",
            },
          ],
        };
      }

      return {
        recommendations: texts.map((title, i) => ({
          id: i + 1,
          category: "performance",
          title: title.slice(0, 80),
          description: title,
          priority: i === 0 ? "high" : "medium",
          effort: "medium",
          impact: i === 0 ? "high" : "medium",
        })),
      };
    } catch (e) {
      console.error("getRecommendations:", e);
      return {
        recommendations: [
          {
            id: 1,
            category: "ops",
            title: "Không lấy được khuyến nghị",
            description: e.message || "Kiểm tra ai-service port 8000 và CORS.",
            priority: "high",
            effort: "low",
            impact: "medium",
          },
        ],
      };
    }
  }

  async chat(message, context = {}) {
    try {
      const result = await fetchJson("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ query: message, context }),
      });
      const intent = result?.intent || result?.response || "unknown";
      const conf = typeof result?.confidence === "number" ? result.confidence : 0.7;
      return {
        response:
          typeof intent === "string" && intent.length > 20
            ? intent
            : `Ý định: **${intent}**. ${result?.original_query ? `Truy vấn: "${result.original_query.slice(0, 200)}".` : ""} Gợi ý: kiểm tra Sheets/Drive/Alerts.`,
        confidence: conf,
        suggestions: Object.keys(result?.entities || {}).slice(0, 5),
      };
    } catch (e) {
      return {
        response: "AI Chat tạm thời không khả dụng. Kiểm tra ai-service port 8000.",
        confidence: 0.3,
        suggestions: [],
      };
    }
  }

  async analyzeSheets(sheetData) {
    return fetchJson("/ai/summary", {
      method: "POST",
      body: JSON.stringify({
        data: Array.isArray(sheetData) ? sheetData : [],
        max_length: 400,
      }),
    });
  }

  async analyzeDrive(driveData) {
    return this.analyzeData({ driveFiles: driveData?.length ?? 0 }, "7d");
  }

  async optimizeSystem(systemMetrics) {
    // Dùng report/comprehensive thay cho endpoint không tồn tại
    const { data, value_column } = buildDataRows(systemMetrics || { value: 1 });
    return fetchJson("/ai/reports/comprehensive", {
      method: "POST",
      body: JSON.stringify({ data, value_column, title: "System Optimization" }),
    }).catch(() => ({ recommendations: [] }));
  }

  async analyzeGoogleContext(payload) {
    const rows = Array.isArray(payload?.sheet_values)
      ? payload.sheet_values
          .slice(0, payload?.max_rows_for_stats || 500)
          .map((r, i) => ({ index: i, value: Array.isArray(r) ? r.length : 1 }))
      : [{ index: 0, value: 1 }];

    return fetchJson("/ai/analyze/full", {
      method: "POST",
      body: JSON.stringify({ data: rows, value_column: "value" }),
    }).catch(() => ({}));
  }
}

export const aiService = new AIService();
export default aiService;
