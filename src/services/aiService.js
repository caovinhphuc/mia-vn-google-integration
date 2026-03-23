/**
 * AI Service — gọi trực tiếp ai-service (FastAPI), map response cho AIDashboard.
 */

import { getAiServiceBaseUrl, parseApiJsonText } from "../utils/apiBase";

const base = () => getAiServiceBaseUrl();

async function fetchJson(path, options = {}) {
  const url = `${base()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    const err = new Error(text || `HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return parseApiJsonText(text, url);
}

function mapTimeframeToMl(tf) {
  if (tf === "1d") return "1h";
  if (tf === "7d") return "24h";
  if (tf === "30d") return "7d";
  return "7d";
}

function buildInsightsFromAnalyze(result) {
  const recs = Array.isArray(result.recommendations) ? result.recommendations : [];
  const main = {
    id: result.id || Date.now(),
    type: "optimization",
    title: "Kết quả phân tích AI",
    description: `Chỉ số dự đoán ${Number(result.prediction).toFixed(1)} (độ tin cậy ${Math.round((result.confidence || 0) * 100)}%).`,
    confidence: result.confidence || 0.85,
    impact: "medium",
    action: recs[0] || "Theo dõi xu hướng và tối ưu dữ liệu.",
  };
  const extra = recs.slice(1, 5).map((text, i) => ({
    id: (result.id || Date.now()) + i + 1,
    type: "trend",
    title: text.slice(0, 80),
    description: text,
    confidence: 0.75,
    impact: "low",
    action: "Xem chi tiết trong báo cáo.",
  }));
  return [main, ...extra];
}

function scalePredictions(metrics, preds, weekFactor, monthFactor) {
  const m = metrics || {};
  const p = preds || {};
  const w = (k) => Math.max(0, Math.round((m[k] || 0) * weekFactor * ((p[k] || 100) / 100)));
  const mo = (k) => Math.max(0, Math.round((m[k] || 0) * monthFactor * ((p[k] || 100) / 100)));
  return {
    nextWeek: {
      sheets: w("sheets"),
      files: w("files"),
      alerts: w("alerts"),
    },
    nextMonth: {
      sheets: mo("sheets"),
      files: mo("files"),
      alerts: mo("alerts"),
    },
  };
}

class AIService {
  async analyzeData(data, timeframe = "7d") {
    const result = await fetchJson("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ data: { ...data, timeframe }, type: "dashboard" }),
    });
    return { insights: buildInsightsFromAnalyze(result) };
  }

  async getPredictions(metrics, timeframe = "7d") {
    const body = {
      timeframe: mapTimeframeToMl(timeframe),
      metrics: ["sheets", "files", "alerts"],
    };
    const result = await fetchJson("/api/ml/predict", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const preds = result.predictions || {};
    const m = {
      sheets: metrics?.sheets ?? 0,
      files: metrics?.files ?? 0,
      alerts: metrics?.alerts ?? 0,
    };
    const scaled = scalePredictions(m, preds, 1.08, 1.25);
    return { predictions: scaled };
  }

  async detectAnomalies(data) {
    return fetchJson("/api/ml/legacy/patterns/anomalies", {
      method: "POST",
      body: JSON.stringify({
        data: Array.isArray(data) ? data : [],
        value_column: "value",
      }),
    }).catch(() => ({ anomalies: [] }));
  }

  async getRecommendations(context) {
    try {
      const [insights, optimize] = await Promise.all([
        fetchJson("/api/ml/insights"),
        fetchJson("/api/ml/optimize", {
          method: "POST",
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            active_users: context?.files ?? 0,
            response_time: 1.2,
            error_rate: 0.01,
            cpu_usage: 40,
            memory_usage: 55,
            disk_usage: 60,
            network_io: 10,
          }),
        }),
      ]);
      const fromInsights = insights?.insights?.recommendations || [];
      const fromOpt = optimize?.recommendations || [];
      const texts = [...fromInsights, ...fromOpt];
      const recommendations = texts.map((title, i) => ({
        id: i + 1,
        category: "performance",
        title: typeof title === "string" ? title : JSON.stringify(title),
        description: typeof title === "string" ? title : "Khuyến nghị từ AI service.",
        priority: i === 0 ? "high" : "medium",
        effort: "medium",
        impact: i === 0 ? "high" : "medium",
      }));
      if (recommendations.length === 0) {
        return {
          recommendations: [
            {
              id: 1,
              category: "ops",
              title: "Bật ai-service và mia_models",
              description: "Chạy `npm run ai-service` (port 8000) để có đủ NLP/patterns.",
              priority: "medium",
              effort: "low",
              impact: "high",
            },
          ],
        };
      }
      return { recommendations };
    } catch (e) {
      console.error("getRecommendations:", e);
      return {
        recommendations: [
          {
            id: 1,
            category: "ops",
            title: "Không lấy được khuyến nghị từ server",
            description: e.message || "Kiểm tra REACT_APP_AI_SERVICE_URL và CORS.",
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
      const parsed = await fetchJson("/api/ml/legacy/nlp/parse", {
        method: "POST",
        body: JSON.stringify({ query: message, context }),
      });
      const intent = parsed.intent || "unknown";
      const conf = typeof parsed.confidence === "number" ? parsed.confidence : 0.7;
      const responseText = `Ý định: **${intent}**. ${parsed.original_query ? `Truy vấn: "${parsed.original_query.slice(0, 200)}".` : ""} Gợi ý: kiểm tra Sheets/Drive/Alerts trong dashboard.`;
      return {
        response: responseText,
        confidence: conf,
        suggestions: Object.keys(parsed.entities || {}).slice(0, 5),
      };
    } catch (e) {
      if (e.status === 503 || String(e.message).includes("mia_models")) {
        return {
          response:
            "Module NLP (mia_models) chưa sẵn sàng trên ai-service. Vẫn có thể dùng phân tích /api/analyze.",
          confidence: 0.4,
          suggestions: [],
        };
      }
      throw e;
    }
  }

  async analyzeSheets(sheetData) {
    return fetchJson("/api/ml/legacy/nlp/summary", {
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
    return fetchJson("/api/ml/optimize", {
      method: "POST",
      body: JSON.stringify(systemMetrics || {}),
    });
  }

  /**
   * Phân tích theo dữ liệu thật Sheets + Drive (đọc qua backend), automation ONE ghi sheet.
   * @param {{ sheet_values?: any[][], drive_files?: object[], metrics?: object, data_source_note?: string, max_rows_for_stats?: number }} payload
   */
  async analyzeGoogleContext(payload) {
    return fetchJson("/api/ml/context/analyze", {
      method: "POST",
      body: JSON.stringify({
        sheet_values: payload?.sheet_values || [],
        drive_files: payload?.drive_files || [],
        metrics: payload?.metrics || {},
        data_source_note: payload?.data_source_note || "",
        max_rows_for_stats: payload?.max_rows_for_stats || 500,
      }),
    });
  }
}

export const aiService = new AIService();
export default aiService;
