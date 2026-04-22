# START HERE — Điều hướng nhanh

Repo **Mia / React OAS Google Integration** — React dashboard, backend Node, AI FastAPI, Python **`automation/`**, FastAPI **`one_automation_system/`** (port **8001**), Google Sheets & Drive.

Bản tóm cổng + FAQ ngắn: [READ_THIS_FIRST.md](READ_THIS_FIRST.md). **Python 3.11 / venv:** [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md).

---

## Bạn là ai?

### Product / vận hành

- [README.md](README.md) — tổng quan, roadmap, trạng thái tính năng
- [DEPLOYMENT_LINKS.md](DEPLOYMENT_LINKS.md) — link deploy production (nếu dùng)
- [automation/INTEGRATIONS_SETUP.md](automation/INTEGRATIONS_SETUP.md) — Telegram, email

### Developer

1. [README.md](README.md) — cài đặt, bảng lệnh canonical (`./start.sh`, `npm run dev`, …)
2. [ENV_SETUP.md](ENV_SETUP.md) — biến môi trường root / frontend
3. [docs/API.md](docs/API.md) — API (nếu cần tích hợp)
4. [SHELL_SCRIPT_STANDARDS.md](SHELL_SCRIPT_STANDARDS.md) — quy ước script (logic trong `scripts/`)

```bash
npm install
./setup.sh          # nếu repo có bước setup tổng (xem README)
./start.sh          # wrapper → scripts/start-stop/start-all.sh
# hoặc chỉ frontend+backend dev:
npm run dev
```

### DevOps / SRE

- [README.md](README.md) — mục **Cài đặt và khởi chạy** (tìm trong file)
- [docker-compose.yml](docker-compose.yml) (nếu dùng container)
- [.github/workflows/](.github/workflows/) — CI
- Health nhanh: [http://localhost:3001/health](http://localhost:3001/health) (backend), [http://localhost:8000/health](http://localhost:8000/health) (AI), [http://localhost:8001/health](http://localhost:8001/health) (`one_automation_system`)

### Google Sheets / automation Python

| Mục                             | File                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Hướng dẫn setup Sheets + `.env` | [automation/GOOGLE_SHEETS_SETUP_GUIDE.md](automation/GOOGLE_SHEETS_SETUP_GUIDE.md)                               |
| Checklist đầy đủ                | [automation/docs/Google_Sheets_Integration_Checklist.md](automation/docs/Google_Sheets_Integration_Checklist.md) |
| Health + path key (resolve)     | `cd automation && bash scripts/health-check.sh` (chú ý: **`scripts/health-check.sh`**, có dấu `/`)               |
| Test kết nối Sheets             | `cd automation && python3 test_sheets_connection.py`                                                             |

Service account JSON có thể ở `~/.secrets/google/` hoặc `automation/config/` — code resolve qua `GOOGLE_SERVICE_ACCOUNT_FILE` / `GOOGLE_APPLICATION_CREDENTIALS` / … (chi tiết trong guide trên).

---

## Quick start (< 10 phút)

```bash
git clone <repo-url>
cd mia-vn-google-integration    # hoặc tên thư mục clone của bạn

cp .env.example .env            # chỉnh theo môi trường
# automation: tạo/chỉnh automation/.env (GOOGLE_SHEET_ID, key path, …)
# → automation/GOOGLE_SHEETS_SETUP_GUIDE.md

npm install
./start.sh
```

**URL thường dùng** (khi mọi service đã lên — bảng đầy đủ trong README, mục **Truy cập ứng dụng**):

- Frontend: <http://localhost:3000>
- Backend health: <http://localhost:3001/health>
- AI Service: <http://localhost:8000/docs>
- One Automation API: <http://localhost:8001/health>

**Lệnh npm hữu ích:** [QUICK_SCRIPTS_REFERENCE.md](QUICK_SCRIPTS_REFERENCE.md) (một số dòng `pwd` mẫu có thể cần sửa cho đúng máy bạn).

---

## Bản đồ tài liệu (rút gọn)

```
README.md                    ← nguồn chính (kiến trúc + bảng lệnh)
ENV_SETUP.md                 ← env tổng quát
automation/
  GOOGLE_SHEETS_SETUP_GUIDE.md
  INTEGRATIONS_SETUP.md
  docs/Google_Sheets_Integration_Checklist.md
Document/                    ← hướng dẫn dài (Automation Python, AI Service, …)
MASTER_INDEX.md              ← mục lục repo (nếu có cập nhật)
```

---

## Checklist trước khi chạy automation / Sheets

- [ ] `automation/.env` có `GOOGLE_SHEET_ID` và một biến trỏ tới JSON service account (hoặc file mặc định `automation/config/service_account.json`)
- [ ] Đã share Google Sheet với **`client_email`** trong JSON
- [ ] `cd automation && bash scripts/health-check.sh` không báo thiếu key
- [ ] Chạy `./start.sh` từ root: `scripts/start-stop/start-all.sh` sẽ `source` `automation/.env` cho process port 8001 (xem guide Sheets)

---

## Hỗ trợ

- Troubleshooting Sheets: [automation/docs/Google_Sheets_Integration_Checklist.md](automation/docs/Google_Sheets_Integration_Checklist.md)
- Issue / PR: GitHub repository của team

**Last updated:** 2026-04-22
