# Pipeline: Automation ONE → Sheets/Drive → Dashboard → AI

Tài liệu triển khai khi bạn cần **phân tích chỉ số**, **đề xuất**, **chat** dựa trên dữ liệu thật từ Google (do automation đổ vào).

---

## 1. Luỗng tổng quan (chuẩn khuyến nghị)

```text
ONE (Selenium) ──ghi──► Google Sheets  ──đọc──► Backend 3001 (/api/sheets/*)
                              │                        │
                              │                        └──► Frontend (Redux / hook)
                              │
Google Drive (export/báo cáo) ◄──list── Backend 3001 (/api/drive/*)
                                      │
                                      ▼
                    Frontend gom "ngữ cảnh" (grid + metadata file)
                                      │
                                      ▼
                    AI Service 8000  POST /api/ml/context/analyze
                                      │
                    insights + recommendations (+ mia_models nếu bật)
```

- **Automation** không gọi AI trực tiếp; nó chỉ **chuẩn hoá dữ liệu lên Sheets** (và tùy chọn file Drive).
- **AI** không nên cầm credential Google; chỉ nhận **payload JSON** đã lấy qua backend (service account nằm ở server).

---

## 2. Đã có trong repo (bạn bật là chạy)

| Thành phần           | Việc làm                                                                     |
| -------------------- | ---------------------------------------------------------------------------- |
| Đọc Sheets           | `googleSheetsApiService.readSheet(range)` → backend proxy                    |
| List Drive           | `googleDriveApiService.listFiles(folderId)`                                  |
| AI theo dữ liệu thật | `POST /api/ml/context/analyze` (`ai-service/main_simple.py`)                 |
| UI                   | `/ai-analytics` — trước khi gọi mock, dashboard **đọc range** và gửi sang AI |

**Env frontend (CRA):**

```bash
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_AI_SERVICE_URL=http://localhost:8000
# Tab/range sheet automation ghi (ví dụ):
REACT_APP_AI_CONTEXT_RANGE=Orders!A1:Z500
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=   # optional, folder chứa export
```

**Chạy:** `npm run dev` (hoặc backend + `npm run ai-service` + `npm start`).

---

## 3. Các bước triển khai theo phase

### Phase A — Dữ liệu automation “ăn được” cho AI

1. **Thống nhất sheet nguồn**: một tab rõ ràng (vd. `Orders`), header cố định, có **cột số** (SLA phút, phí, số đơn…).
2. **Cấu hình range** khớp tab đó (`REACT_APP_AI_CONTEXT_RANGE`).
3. **Kiểm tra quyền** service account spreadsheet + Drive folder.

### Phase B — Đề xuất & chỉ số (hiện tại)

- Endpoint **`/api/ml/context/analyze`**: thống kê cột số, số dòng, MIME Drive, gợi ý vận hành.
- Nếu cài đủ **`mia_models`**: thêm section báo cáo tóm tắt (`report_generator`).

### Phase C — Chat “hiểu” sheet (nâng cao)

1. **Ngắn hạn**: chat vẫn qua `/api/ml/legacy/nlp/parse` (rule-based) — cần `mia_models`.
2. **Dài hạn**: thêm backend route kiểu `POST /api/ai/chat` gọi **LLM** + RAG trên snapshot sheet (embedding / chunk) — _chưa có sẵn_, cần API key + chính sách dữ liệu.

### Phase D — Production

- Deploy **ai-service** public HTTPS, set `REACT_APP_AI_SERVICE_URL` trên Vercel.
- Giới hạn kích thước body (đã cap ~500 dòng mặc định); lớn hơn nên **aggregate trên backend** rồi gửi bản tóm.

---

## 4. Ràng buộc & an toàn

- Không đưa **private key** Google vào browser hay vào AI service.
- Logistic: tránh gửi PII thô qua AI nếu chưa anonymize.
- Rate limit: Google Sheets API + tần suất bấm “Phân tích” trên UI.

---

## 5. File tham chiếu

- **Automation Python (cài đặt, script, cập nhật):** [AUTOMATION_PYTHON_GUIDE.md](AUTOMATION_PYTHON_GUIDE.md)
- `src/components/ai/AIDashboard.jsx` — gọi `fetchLiveGoogleContext` + `analyzeGoogleContext`
- `src/services/aiService.js` — `analyzeGoogleContext`
- `ai-service/main_simple.py` — `_build_context_analysis`, route `context/analyze`
- [AI_SERVICE_GUIDE.md](AI_SERVICE_GUIDE.md) — cổng, env, API đầy đủ

---

**Tóm lại:** Triển khai = **automation ghi sheet chuẩn** → **đúng range env** → **backend đọc được** → **AI 8000 nhận payload** → mở rộng chat/LLM ở phase sau.
