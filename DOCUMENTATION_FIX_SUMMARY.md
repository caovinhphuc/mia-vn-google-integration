# Documentation Fix Summary (hub + lịch sử chỉnh port)

> File **không chỉ** redirect: tóm tắt lỗi tài liệu cũ và **trạng thái chuẩn hiện tại** của repo.

**Mục lục chính:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) · [DOCUMENTATION_UPDATE_REPORT.md](./DOCUMENTATION_UPDATE_REPORT.md) · [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

**Cổng chuẩn:** [PORT_CLARIFICATION.md](./PORT_CLARIFICATION.md)

_Cập nhật: 2026-04-22_

---

## 1. Vấn đề từng có (tài liệu cũ)

- Một số file gộp nhầm **AI** và **Automation** hoặc gán cả hai lên **một** cổng.
- Bản tóm tắt cũ (trước 2026-04) từng khẳng định _“không có AI service riêng”_ — **trái** với code: thư mục `ai-service/`, `npm run ai-service`, uvicorn **:8000**.
- Thiếu phân biệt **bắt buộc** vs **tuỳ chọn** cho từng process Python.

---

## 2. Kiến trúc & port — chuẩn hiện tại

| Cổng     | Dịch vụ                                      | Vai trò                                  |
| -------- | -------------------------------------------- | ---------------------------------------- |
| **3000** | CRA frontend                                 | Dev UI                                   |
| **3001** | Backend Node (`backend/`)                    | API + health `/health`                   |
| **8000** | AI FastAPI (`ai-service/`, `main_simple.py`) | ML / mock API, `GET /api/predictions`, … |
| **8001** | Automation FastAPI (`automation/` …)         | Sheet/email/logs API tích hợp automation |

**Tối thiểu làm việc:** thường chỉ cần **3000 + 3001**. Stack đầy đủ dev: `npm run dev` = frontend + backend + **AI 8000** (xem `package.json`).

Chi tiết AI vs Automation: [Document/AI_SERVICE_GUIDE.md](./Document/AI_SERVICE_GUIDE.md)

---

## 3. Tài liệu & script đã/canonical

| Nội dung                                          | File / lệnh                                        |
| ------------------------------------------------- | -------------------------------------------------- |
| Env đa file, `REACT_APP_AI_SERVICE_URL`, Sheet ID | [ENV_SETUP.md](./ENV_SETUP.md)                     |
| Health nhanh có màu + ms                          | `npm run health:quick` → `scripts/health-quick.sh` |
| Health đầy đủ                                     | `npm run health-check` → `scripts/health-check.js` |
| Test API tách 8000 / 8001                         | `npm run test:api`                                 |
| Hub lệnh                                          | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)         |

**Lưu ý:** Nếu thấy markdown khác với bảng trên → ưu tiên **PORT_CLARIFICATION.md** + **ENV_SETUP.md** (2026-04-22).

---

## 4. Xác minh nhanh

```bash
# Process đang listen (local)
lsof -i :3000 -i :3001 -i :8000 -i :8001 2>/dev/null | grep LISTEN || true

npm run health:quick

# Test endpoint (đã tách URL AI vs automation)
npm run test:api
```

Test kết nối frontend → backend / Google (script trong repo):

```bash
npm run test:frontend-connection
```

---

## 5. Nguyên tắc chỉnh doc sau này

1. Đối chiếu **package.json** + **script thật** trước khi ghi port.
2. **8000** = AI (`ai-service`), **8001** = automation — không đảo.
3. Cập nhật **PORT_CLARIFICATION.md** cùng lúc với bảng port ở hub (`QUICK_REFERENCE.md`).
4. Một dòng “Updated: YYYY-MM-DD” ở cuối file hub sau mỗi lần sửa lớn.

---

**Version hub:** 4.x monorepo  
**Trạng thái:** Đồng bộ với `package.json` (Node 20, `npm run dev` / `ai-service` / `health:quick`).
