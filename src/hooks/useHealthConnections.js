/**
 * Hook lấy trạng thái kết nối từ backend /health + ai-service /health
 * Map services (googleSheets, googleDrive, telegram...) -> ConnectionItem format
 */
import { useEffect, useState } from "react";
import { connectionData } from "../components/layout/layoutData";
import { getAiServiceBaseUrl, getMainApiBaseUrl } from "../utils/apiBase";

const API_BASE = getMainApiBaseUrl();
const AI_BASE = getAiServiceBaseUrl();

const SERVICE_MAP = [
  { key: "googleSheets", name: "Google Sheets", icon: "📊" },
  { key: "googleDrive", name: "Google Drive", icon: "📁" },
  { key: "googleAppsScript", name: "Google Apps Script", icon: "⚙️" },
  { key: "telegram", name: "Telegram Bot", icon: "💬" },
  { key: "automation", name: "Automation", icon: "🤖" },
];

const AI_CONNECTION = { name: "AI Service", icon: "🧠" };

const INITIAL_CONNECTIONS = [...connectionData, { ...AI_CONNECTION, status: "disconnected" }];

const statusMap = {
  healthy: "connected",
  degraded: "error",
  unhealthy: "error",
  warning: "disconnected",
};

export function useHealthConnections() {
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(`${API_BASE}/health`, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) return;
        const data = await res.json();
        const svc = data.services || {};
        const main = SERVICE_MAP.map(({ key, name, icon }) => {
          const s = svc[key];
          const status = s ? statusMap[s.status] || "disconnected" : "disconnected";
          return { name, icon, status };
        });

        let aiStatus = "disconnected";
        try {
          const aiCtrl = new AbortController();
          const aiTid = setTimeout(() => aiCtrl.abort(), 4000);
          try {
            const aiRes = await fetch(`${AI_BASE}/health`, {
              signal: aiCtrl.signal,
            });
            if (aiRes.ok) {
              const aiJson = await aiRes.json().catch(() => ({}));
              aiStatus = aiJson.status === "OK" ? "connected" : "error";
            }
          } finally {
            clearTimeout(aiTid);
          }
        } catch {
          aiStatus = "disconnected";
        }

        setConnections([...main, { ...AI_CONNECTION, status: aiStatus }]);
      } catch {
        // Giữ connectionData mặc định khi lỗi
      }
    };
    fetchHealth();
    const t = setInterval(fetchHealth, 60000);
    return () => clearInterval(t);
  }, []);

  return connections;
}
