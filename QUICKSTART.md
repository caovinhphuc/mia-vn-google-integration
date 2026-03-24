# MIA OAS Integration — Quick Reference

## Dev Stack

| Service              | URL                        | Port |
| -------------------- | -------------------------- | ---- |
| React Frontend       | http://localhost:3000      | 3000 |
| Node.js Backend      | http://localhost:3001      | 3001 |
| AI Service (FastAPI) | http://localhost:8000      | 8000 |
| AI Docs (Swagger)    | http://localhost:8000/docs | 8000 |

---

## Khởi động / Tắt

```bash
./start_ai_platform.sh start    # Bật cả 3 services
./start_ai_platform.sh stop     # Tắt hết
./start_ai_platform.sh restart  # Restart
./start_ai_platform.sh status   # Kiểm tra trạng thái
./start_ai_platform.sh logs     # Xem log 20 dòng cuối
```

---

## Deploy

```bash
./deploy_platform.sh check    # Kiểm tra prereqs (không build)
./deploy_platform.sh local    # Build + smoke test (không Vercel)
./deploy_platform.sh vercel   # Deploy Vercel production
./deploy_platform.sh full     # Lint + test + build + smoke + Vercel
```

---

## Lệnh npm hay dùng

```bash
npm start              # Dev server (port 3000)
npm run build          # Production build → build/
npm test               # Unit tests
npm run test:ci        # Tests không interactive (cho CI)
npm run lint:fix        # Lint + auto-fix
npm run perf:check     # Lighthouse score
```

---

## AI Service

```bash
# Xem log AI service
tail -f logs/ai-service.log

# Test auth token
curl -s -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key":"mia-dev-api-key-2026"}'

# Test chat
TOKEN=mia-dev-bearer-2026
curl -s -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"show total revenue","context":{}}'
```

---

## Nếu bị lỗi

| Triệu chứng         | Fix                                           |
| ------------------- | --------------------------------------------- |
| Port đang bị chiếm  | `./start_ai_platform.sh stop` rồi `start` lại |
| AI Service crash    | `tail -f logs/ai-service.log` để xem lỗi      |
| Frontend không load | `tail -f logs/frontend.log`                   |
| Backend lỗi         | `tail -f logs/backend.log`                    |
| Build fail          | `npm run lint:fix` trước, rồi build lại       |
| Vercel deploy fail  | Chạy `./deploy_platform.sh check` trước       |

---

## Env quan trọng (`.env`)

```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:8000
REACT_APP_AI_API_KEY=mia-dev-api-key-2026
AI_API_KEY=mia-dev-api-key-2026
ANTHROPIC_API_KEY=          ← thêm key để bật NLP hybrid
```

---

> Logs: `logs/frontend.log` · `logs/backend.log` · `logs/ai-service.log`
