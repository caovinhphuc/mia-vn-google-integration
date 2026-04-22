const { createProxyMiddleware } = require("http-proxy-middleware");

/** WebSocket thuần (backend/ws-server.js). Socket.IO vẫn nằm trên REACT_APP_WS_URL / API (thường :3001). */
module.exports = function (app) {
  app.use(
    "/ws",
    createProxyMiddleware({
      target: "http://localhost:3002",
      ws: true,
      changeOrigin: true,
    })
  );
};
