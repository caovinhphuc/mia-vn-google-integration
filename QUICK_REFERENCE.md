# ⚡ Quick reference (hub)

> Trang **mục lục ngắn** — nội dung chi tiết nằm ở các file được liên kết (tránh trùng lặp và lệch thời).

## Lệnh & công cụ dev

| Nhu cầu                                   | File                                                           |
| ----------------------------------------- | -------------------------------------------------------------- |
| ESLint, Prettier, Husky, `validate`, hook | [DEVELOPMENT_TOOLS_SUMMARY.md](./DEVELOPMENT_TOOLS_SUMMARY.md) |
| npm scripts, WebSocket, test, `dev`       | [QUICK_SCRIPTS_REFERENCE.md](./QUICK_SCRIPTS_REFERENCE.md)     |
| Cài đặt môi trường, `.env`                | [ENV_SETUP.md](./ENV_SETUP.md)                                 |

## Port & dịch vụ

Chi tiết: [PORT_CLARIFICATION.md](./PORT_CLARIFICATION.md) — tra `grep -r "port" QUICK_REFERENCE.md PORT_CLARIFICATION.md` từ root repo.

| Dịch vụ                            | Port (mặc định) |
| ---------------------------------- | --------------- |
| Frontend (CRA)                     | **3000**        |
| Backend API                        | **3001**        |
| AI service (`ai-service`, uvicorn) | **8000**        |
| Automation API (khi chạy riêng)    | **8001**        |

## Docs HTML

- Generate: `npm run docs:generate` — xem [DOCUMENTATION_HTML_GUIDE.md](./DOCUMENTATION_HTML_GUIDE.md)

---

_2026-03-20 — khôi phục file hub; `grep` / tài liệu cũ trỏ `QUICK_REFERENCE.md` sẽ hoạt động._
