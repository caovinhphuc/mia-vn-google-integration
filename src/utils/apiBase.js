/**
 * Base URLs cho frontend (CRA: REACT_APP_*, Vite: VITE_*).
 * Khớp package.json: backend 3001, ai-service 8000, automation 8001.
 */

const trimSlash = (s) => String(s || "").replace(/\/$/, "");

/** Tránh SyntaxError khi server trả index.html (SPA) thay vì JSON */
export function parseApiJsonText(text, urlHint = "") {
  const t = (text || "").trimStart();
  if (t.startsWith("<")) {
    throw new Error(
      "Nhận HTML thay vì JSON — sai URL hoặc chưa build lại frontend. " +
        (urlHint ? `(${urlHint}) ` : "") +
        "Cần ai-service :8000 và REACT_APP_AI_SERVICE_URL."
    );
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Phản hồi không phải JSON: ${e.message}`);
  }
}

/** Node API (auth, health, sheets proxy…) */
export function getMainApiBaseUrl() {
  return trimSlash(
    process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:3001"
  );
}

/** Python FastAPI ai-service */
export function getAiServiceBaseUrl() {
  return trimSlash(
    process.env.REACT_APP_AI_SERVICE_URL ||
      process.env.REACT_APP_AI_URL ||
      process.env.VITE_AI_SERVICE_URL ||
      process.env.VITE_AI_URL ||
      "http://localhost:8000"
  );
}

/**
 * Base cho route backend `/sheets/*`, `/drive/*` — luôn một segment `/api` cuối.
 * Tránh `.../api/api/...` khi env đã có `/api` mà script/tool lại nối thêm.
 */
export function getGoogleProxyApiBase() {
  const raw =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    process.env.VITE_API_URL;
  if (!raw) return "http://localhost:3001/api";

  let s = String(raw)
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");

  const isAbsoluteHttp = /^https?:\/\//i.test(s);
  const isRootRelative = s.startsWith("/");
  if (!isAbsoluteHttp && !isRootRelative) return "http://localhost:3001/api";

  while (s.includes("/api/api")) {
    s = s.replace(/\/api\/api/g, "/api");
  }

  return s.endsWith("/api") ? s : `${s}/api`;
}
