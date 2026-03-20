# 🔧 WebSocket Troubleshooting Guide

## ❌ Common Errors

### Error: "websocket error" or "Connection error: websocket error"

**Cause:** Backend server is not running or not accessible.

**Solution:**

1. **Check if backend is running:**

   ```bash
   npm run check:backend
   # or
   curl http://localhost:3001/health
   ```

2. **Start backend server:**

   ```bash
   # Option 1: Start backend only
   cd backend
   npm start

   # Option 2: Start from root
   npm run backend

   # Option 3: Start all services
   npm run dev
   ```

3. **Verify backend started successfully:**

   ```bash
   # Should see:
   # 🚀 Backend server running on port 3001
   # 🌐 WebSocket server ready for connections
   ```

4. **Run WebSocket test again:**

   ```bash
   npm run test:websocket
   ```

---

### Error: "ECONNREFUSED"

**Cause:** Cannot connect to backend server at specified URL.

**Solutions:**

1. **Check backend URL:**

   ```bash
   echo $REACT_APP_API_URL
   # Should be: http://localhost:3001
   ```

2. **Check if port is correct:**

   ```bash
   lsof -i:3001
   # Should show backend server process
   ```

3. **Check firewall/network:**
   - Ensure no firewall blocking port 3001
   - If using Docker, check port mapping

---

### Error: "Connection timeout"

**Cause:** Server is not responding within timeout period.

**Solutions:**

1. **Increase timeout in test script:**

   ```javascript
   const socket = io(url, {
     timeout: 10000, // 10 seconds instead of 5
   })
   ```

2. **Check server logs for errors:**

   ```bash
   # Check backend logs
   tail -f logs/backend.log
   ```

3. **Restart backend server:**

   ```bash
   # Kill and restart
   npm run fix:ports
   npm run backend
   ```

---

### Error: "CORS policy" or "Access-Control-Allow-Origin"

**Cause:** CORS configuration issue.

**Solution:**

Check backend `server.js` has proper CORS config:

```javascript
const io = socketIo(server, {
  cors: {
    origin: '*', // or specific origin
    methods: ['GET', 'POST'],
  },
})
```

---

## 🔍 Diagnostic Steps

### Step 1: Check Backend Server

```bash
# Check if backend is running
npm run check:backend

# Or manually
curl http://localhost:3001/health
```

**Expected output:**

```json
{
  "status": "OK",
  "message": "Backend server is running",
  "timestamp": "...",
  "port": 3001
}
```

### Step 2: Check Port Status

```bash
# Check all ports
npm run check:ports

# Check specific port
lsof -i:3001
```

### Step 3: Check WebSocket Connection

```bash
# Run WebSocket test
npm run test:websocket
```

### Step 4: Check Backend Logs

```bash
# View backend logs
tail -f logs/backend.log

# Or if running in terminal, check console output
```

---

## 🚀 Quick Fix Checklist

- [ ] Backend server is running (`npm run check:backend`)
- [ ] Port 3001 is free and accessible (`npm run check:ports`)
- [ ] No firewall blocking connections
- [ ] CORS is properly configured
- [ ] `socket.io-client` is installed (`npm list socket.io-client`)
- [ ] Backend has `socket.io` installed (`cd backend && npm list socket.io`)
- [ ] Environment variable `REACT_APP_API_URL` is set correctly

---

## 📝 Environment Variables

Make sure `.env` file has:

```bash
REACT_APP_API_URL=http://localhost:3001
```

Or set it in your shell:

```bash
export REACT_APP_API_URL=http://localhost:3001
```

---

## 🧪 Test WebSocket Manually

### Using curl

```bash
# Check if WebSocket endpoint is accessible
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  http://localhost:3001/socket.io/?EIO=4&transport=websocket
```

### Using Browser Console

```javascript
// Open browser console and run:
const socket = io('http://localhost:3001')

socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.on('welcome', (data) => {
  console.log('Welcome:', data)
})

socket.on('connect_error', (error) => {
  console.error('Error:', error)
})
```

---

## 🔄 Restart Everything

If nothing works, restart all services:

```bash
# 1. Kill all processes
npm run fix:ports

# 2. Check ports are free
npm run check:ports

# 3. Start backendnpm run fix:ports
cd backend
npm start

# 4. In another terminal, test WebSocket
npm run test:websocket
```

---

## 📚 Additional Resources

- [Socket.IO Troubleshooting](https://socket.io/docs/v4/troubleshooting-connection-issues/)
- [WebSocket Setup Guide](./WEBSOCKET_SETUP_GUIDE.md)
- [Port Conflict Guide](./PORT_CONFLICT_GUIDE.md)

---

**💡 Tip:** Always check backend logs first when debugging WebSocket issues!
