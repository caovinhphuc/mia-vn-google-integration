/**
 * WebSocket Server cho Real-time Communication
 * Hỗ trợ real-time updates, notifications, và live data
 */

const WebSocket = require("ws");
const http = require("http");
const url = require("url");

class WebSocketServer {
  constructor(port = 3002) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.clients = new Map(); // Map<clientId, WebSocket>
    this.rooms = new Map(); // Map<roomId, Set<clientId>>

    // Statistics
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      startTime: new Date(),
    };
  }

  /**
   * Start WebSocket server
   */
  start(httpServer = null) {
    if (httpServer) {
      // Attach to existing HTTP server
      this.wss = new WebSocket.Server({ server: httpServer, path: "/ws" });
    } else {
      // Create standalone server
      this.server = http.createServer();
      this.wss = new WebSocket.Server({ server: this.server, path: "/ws" });
      this.server.listen(this.port, () => {
        console.log(`✅ WebSocket Server started on ws://localhost:${this.port}/ws`);
      });
    }

    this.setupEventHandlers();
    return this;
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.wss.on("connection", (ws, req) => {
      const clientId = this.generateClientId();
      const clientInfo = {
        id: clientId,
        ip: req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
        connectedAt: new Date(),
        rooms: new Set(),
      };

      this.clients.set(clientId, { ws, info: clientInfo });
      this.stats.totalConnections++;
      this.stats.activeConnections++;

      console.log(`🔌 Client connected: ${clientId} (${this.stats.activeConnections} active)`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: "connected",
        clientId,
        timestamp: new Date().toISOString(),
        message: "Connected to WebSocket server",
      });

      // Handle messages
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error("Error parsing message:", error);
          this.sendToClient(clientId, {
            type: "error",
            message: "Invalid message format",
          });
        }
      });

      // Handle close
      ws.on("close", () => {
        this.handleDisconnect(clientId);
      });

      // Handle error
      ws.on("error", (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    });
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle incoming message
   */
  handleMessage(clientId, message) {
    this.stats.totalMessages++;

    switch (message.type) {
      case "join":
        this.joinRoom(clientId, message.room);
        break;
      case "leave":
        this.leaveRoom(clientId, message.room);
        break;
      case "broadcast":
        this.broadcastToRoom(message.room, message.data);
        break;
      case "ping":
        this.sendToClient(clientId, {
          type: "pong",
          timestamp: new Date().toISOString(),
        });
        break;
      case "get_stats":
        this.sendToClient(clientId, {
          type: "stats",
          stats: this.getStats(),
        });
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Join a room
   */
  joinRoom(clientId, roomId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    this.rooms.get(roomId).add(clientId);
    client.info.rooms.add(roomId);

    this.sendToClient(clientId, {
      type: "joined",
      room: roomId,
      timestamp: new Date().toISOString(),
    });

    // Notify others in room
    this.broadcastToRoom(
      roomId,
      {
        type: "user_joined",
        clientId,
        timestamp: new Date().toISOString(),
      },
      clientId
    );

    console.log(`👤 Client ${clientId} joined room: ${roomId}`);
  }

  /**
   * Leave a room
   */
  leaveRoom(clientId, roomId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(clientId);
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }

    client.info.rooms.delete(roomId);

    this.sendToClient(clientId, {
      type: "left",
      room: roomId,
      timestamp: new Date().toISOString(),
    });

    console.log(`👋 Client ${clientId} left room: ${roomId}`);
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to all clients in a room
   */
  broadcastToRoom(roomId, data, excludeClientId = null) {
    if (!this.rooms.has(roomId)) {
      return 0;
    }

    let sent = 0;
    this.rooms.get(roomId).forEach((clientId) => {
      if (clientId !== excludeClientId) {
        if (this.sendToClient(clientId, { ...data, room: roomId })) {
          sent++;
        }
      }
    });

    return sent;
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(data, excludeClientId = null) {
    let sent = 0;
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        if (this.sendToClient(clientId, data)) {
          sent++;
        }
      }
    });
    return sent;
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all rooms
    client.info.rooms.forEach((roomId) => {
      this.leaveRoom(clientId, roomId);
    });

    this.clients.delete(clientId);
    this.stats.activeConnections--;

    console.log(`🔌 Client disconnected: ${clientId} (${this.stats.activeConnections} active)`);
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeConnections: this.stats.activeConnections,
      totalRooms: this.rooms.size,
      uptime: Math.floor((Date.now() - this.stats.startTime.getTime()) / 1000),
    };
  }

  /**
   * Stop server
   */
  stop() {
    // Close all connections
    this.clients.forEach((client) => {
      client.ws.close();
    });

    if (this.wss) {
      this.wss.close();
    }

    if (this.server) {
      this.server.close();
    }

    console.log("🛑 WebSocket Server stopped");
  }
}

// Export singleton instance
let wsServerInstance = null;

function getWebSocketServer(port = 3002) {
  if (!wsServerInstance) {
    wsServerInstance = new WebSocketServer(port);
  }
  return wsServerInstance;
}

module.exports = { WebSocketServer, getWebSocketServer };

// Start server if run directly
if (require.main === module) {
  const server = getWebSocketServer(3002);
  server.start();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down WebSocket server...");
    server.stop();
    process.exit(0);
  });
}
