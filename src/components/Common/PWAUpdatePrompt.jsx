/**
 * PWA Update Prompt - Hiện khi có phiên bản mới (Service Worker update)
 * Tích hợp với CRA service worker
 */
import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { SW_UPDATE_EVENT } from "../../utils/swUpdateEvent";

const PWAUpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setNeedRefresh(true);
      setRegistration(e.detail?.registration ?? null);
    };
    window.addEventListener(SW_UPDATE_EVENT, handler);
    return () => window.removeEventListener(SW_UPDATE_EVENT, handler);
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      message.success("Đang cập nhật...");
      setNeedRefresh(false);
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
    setRegistration(null);
  };

  if (!needRefresh) return null;

  return (
    <div
      className="pwa-update-prompt"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        padding: "12px 16px",
        background: "white",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span>Có phiên bản mới</span>
      <Button type="primary" size="small" onClick={handleUpdate}>
        Cập nhật
      </Button>
      <Button size="small" onClick={handleDismiss}>
        Đóng
      </Button>
    </div>
  );
};

export default PWAUpdatePrompt;
