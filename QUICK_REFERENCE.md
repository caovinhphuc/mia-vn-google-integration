# ⚡ Quick reference (hub)

> Trang **mục lục ngắn** — nội dung chi tiết nằm ở các file được liên kết (tránh trùng lặp và lệch thời).

## Lệnh & công cụ dev

| Nhu cầu                                   | File                                                           |
| ----------------------------------------- | -------------------------------------------------------------- |
| Cổng + FAQ siêu ngắn (đọc trước)          | [READ_THIS_FIRST.md](./READ_THIS_FIRST.md)                     |
| ESLint, Prettier, Husky, `validate`, hook | [DEVELOPMENT_TOOLS_SUMMARY.md](./DEVELOPMENT_TOOLS_SUMMARY.md) |
| npm scripts, WebSocket, test, `dev`       | [QUICK_SCRIPTS_REFERENCE.md](./QUICK_SCRIPTS_REFERENCE.md)     |
| Cài đặt môi trường, `.env`                | [ENV_SETUP.md](./ENV_SETUP.md)                                 |
| Python 3.11 / venv / tránh 3.14           | [PYTHON_VENV_GUIDE.md](./PYTHON_VENV_GUIDE.md)                 |

## Canonical commands (team)

| Tác vụ                   | Lệnh                             |
| ------------------------ | -------------------------------- |
| Setup                    | `./setup.sh`                     |
| Start all services       | `./start.sh`                     |
| Dev stack qua npm        | `npm run dev`                    |
| Stop nhanh (clear ports) | `npm run fix:ports`              |
| Check ports              | `npm run check:ports`            |
| Check backend            | `npm run check:backend`          |
| Deploy prep              | `npm run deploy:prep`            |
| Deploy Vercel            | `npm run deploy:vercel`          |
| Wrapper guard            | `npm run scripts:guard-wrappers` |

## Port & dịch vụ

Chi tiết: [PORT_CLARIFICATION.md](./PORT_CLARIFICATION.md) — tra `grep -r "port" QUICK_REFERENCE.md PORT_CLARIFICATION.md` từ root repo.

| Dịch vụ                            | Port (mặc định) |
| ---------------------------------- | --------------- |
| Frontend (CRA)                     | **3000**        |
| Backend API                        | **3001**        |
| AI service (`ai-service`, uvicorn) | **8000**        |
| `one_automation_system` (uvicorn)  | **8001**        |

## Docs HTML

- Generate: `npm run docs:generate` — xem [DOCUMENTATION_HTML_GUIDE.md](./DOCUMENTATION_HTML_GUIDE.md)

---

_2026-04-22 — hub; liên kết READ_THIS_FIRST + đồng bộ port 8001._
