# Automated Setup — `scripts/setup.js`

Script Node **một lần** giúp khởi tạo nhanh monorepo Mia.vn (React + backend + Google): tạo thư mục chuẩn, `npm install` root, gợi ý `.env`, kiểm tra biến bắt buộc, (tuỳ chọn) chạy test Google.

## Chạy như thế nào

```bash
cd /path/to/mia-vn-google-integration
node scripts/setup.js
```

**Bắt buộc:** thư mục hiện tại là **root repo** (có `package.json` ở root).

## Script làm gì (theo thứ tự)

| Bước | Nội dung                                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tạo các thư mục `src/components/*`, `src/services`, `scripts`, … nếu chưa có                                                                                                                |
| 2    | `npm install` ở **root** (frontend)                                                                                                                                                         |
| 3    | Cài thêm một số package backend qua `npm install express nodemailer …` (vẫn tại root — xem mục _Hạn chế_)                                                                                   |
| 4    | Nếu chưa có `.env`: tạo `.env` mẫu (hoặc hỏi ghi đè nếu đã có)                                                                                                                              |
| 5    | `validateEnvironment()`: kiểm tra trong `.env` có dòng `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` và không còn placeholder kiểu `your-` |
| 6    | Nếu bước 5 pass: chạy `node scripts/testGoogleConnection.js`                                                                                                                                |
| 7    | In “next steps” + link tài liệu                                                                                                                                                             |

## Sau khi chạy xong

1. **Điền `.env` thật** — ưu tiên copy từ `.env.example` rồi merge `backend/.env`, `automation/.env` nếu team dùng nhiều file: xem `ENV_SETUP.md`.
2. **Google:** JSON service account (`GOOGLE_APPLICATION_CREDENTIALS` hoặc `config/service_account.json`) + Sheet ID (`GOOGLE_SHEETS_ID` hoặc `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`): `GOOGLE_SHEETS_SETUP_GUIDE.md`, `docs/GOOGLE_CREDENTIALS_SETUP.md`.
3. **Kiểm tra nhanh (không thay setup.js):**
   - `node scripts/testGoogleConnection.cjs` — khuyến nghị (JSON + Sheets)
   - `node scripts/test-google-apis-simple.js`
   - `node scripts/test_frontend_api_connection.js` (backend phải đang chạy)

## Hạn chế / lưu ý

- **Backend đầy đủ:** dependency backend nằm trong `backend/package.json` — cài đặt chuẩn là `cd backend && npm install`, không chỉ dựa vào bước cài package lẻ ở root trong script.
- **Template `.env` trong script** là bản rút gọn; nguồn đầy đủ nên lấy từ **`.env.example`** trong repo.
- **Test Google:** script gọi `testGoogleConnection.js`; có thể dùng thêm `testGoogleConnection.cjs` nếu môi trường ưu tiên CommonJS.

## Tài liệu liên quan

| File                           | Mục đích                             |
| ------------------------------ | ------------------------------------ |
| `ENV_SETUP.md`                 | Biến môi trường, nhiều file `.env`   |
| `HEALTH_CHECK_GUIDE.md`        | Kiểm tra sức khỏe dịch vụ            |
| `GOOGLE_SHEETS_SETUP_GUIDE.md` | Sheet ID, share SA                   |
| `PHASE_1_DETAILED_GUIDE.md`    | Luồng phase 1                        |
| `scripts/check-env.sh`         | Kiểm tra env trước khi chạy CI/local |

---

_Cập nhật theo `scripts/setup.js` — khi đổi flow trong script, sửa song song file này._
