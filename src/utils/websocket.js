/**
 * WebSocket Client Utility
 * Kết nối và quản lý WebSocket connection cho real-time updates
 */

class WebSocketClient {
  constructor(url = "ws://localhost:3002/ws") {
    this.url = url;
    this.ws = null;
    this.clientId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.isConnecting = false;
    this.isConnected = false;
    this.listeners = new Map();
    this.rooms = new Set();

    // Auto-reconnect
    this.autoReconnect = true;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnecting || (this.isConnected && this.ws?.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected");
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.emit("connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.emit("error", error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("🔌 WebSocket disconnected");
          this.isConnected = false;
          this.isConnecting = false;
          this.emit("disconnected");

          // Auto-reconnect
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Schedule reconnection
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      if (!this.isConnected && this.autoReconnect) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    // Handle special message types
    if (data.type === "connected") {
      this.clientId = data.clientId;
      this.emit("connected", data);

      // Rejoin rooms after reconnection
      this.rooms.forEach((room) => {
        this.joinRoom(room);
      });
    } else if (data.type === "error") {
      this.emit("error", data);
    } else {
      // Emit message to listeners
      this.emit(data.type || "message", data);
    }
  }

  /**
   * Send message to server
   */
  send(type, data = {}) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected. Message not sent:", type);
      return false;
    }

    try {
      this.ws.send(JSON.stringify({ type, ...data }));
      return true;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      return false;
    }
  }

  /**
   * Join a room
   */
  joinRoom(roomId) {
    if (this.rooms.has(roomId)) {
      return;
    }

    this.rooms.add(roomId);
    this.send("join", { room: roomId });
    this.emit("room_joined", { room: roomId });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    this.rooms.delete(roomId);
    this.send("leave", { room: roomId });
    this.emit("room_left", { room: roomId });
  }

  /**
   * Broadcast message to room
   */
  broadcastToRoom(roomId, data) {
    this.send("broadcast", { room: roomId, data });
  }

  /**
   * Subscribe to event
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Also emit to 'message' listeners for all messages
    if (event !== "message" && this.listeners.has("message")) {
      this.listeners.get("message").forEach((callback) => {
        try {
          callback({ type: event, ...data });
        } catch (error) {
          console.error("Error in message listener:", error);
        }
      });
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.autoReconnect = false;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.rooms.clear();
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      clientId: this.clientId,
      rooms: Array.from(this.rooms),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Ping server
   */
  ping() {
    this.send("ping");
  }
}

// Create singleton instance
let wsClientInstance = null;

/**
 * Get WebSocket client instance
 */
/** URL cho WebSocket API trình duyệt (ws: / wss:). Không dùng https:// (đó là Socket.IO — xem websocketService). */
function resolveNativeWebSocketUrl() {
  const native = process.env.REACT_APP_NATIVE_WS_URL;
  if (native && /^wss?:\/\//i.test(String(native).trim())) return String(native).trim();
  const legacy = process.env.REACT_APP_WS_URL;
  if (legacy && /^wss?:\/\//i.test(String(legacy).trim())) return String(legacy).trim();
  // Dev: qua cùng host CRA + setupProxy.js (/ws → backend/ws-server.js :3002). Prod/build: gọi thẳng 3002 hoặc set REACT_APP_NATIVE_WS_URL.
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    const { protocol, host } = window.location;
    const wsProto = protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${host}/ws`;
  }
  return "ws://localhost:3002/ws";
}

export function getWebSocketClient(url = null) {
  if (!wsClientInstance) {
    const wsUrl = url || resolveNativeWebSocketUrl();
    wsClientInstance = new WebSocketClient(wsUrl);
  }
  return wsClientInstance;
}

// Note: React Hook đã được tách ra file riêng
// Sử dụng: import { useWebSocket } from '../hooks/useWebSocket';
// Xem file: src/hooks/useWebSocket.js

export default WebSocketClient;
export { WebSocketClient };
