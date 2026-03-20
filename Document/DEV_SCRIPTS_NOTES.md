# Ghi chú script dev (chắc cú để tra)

## `scripts/fix/fix-missing-files.sh`

**Mục đích:** So sánh **một danh sách file cố định** trên branch hiện tại với branch nguồn (`main` hoặc branch bạn truyền), rồi **tùy chọn** lấy lại bản từ nguồn nếu file **thiếu** hoặc **khác nội dung**.

**Không phải** công cụ “tìm mọi file thiếu trong repo” — chỉ xử lý đúng các path trong mảng `FILES` trong script (hiện tại):

| File |
|------|
| `src/components/automation/AutomationDashboard.jsx` |
| `src/components/automation/AutomationDashboard.css` |

**Cách chạy:**

```bash
# Từ root repo, đã có git
bash scripts/fix/fix-missing-files.sh           # so với main (hoặc origin/main)
bash scripts/fix/fix-missing-files.sh develop   # so với develop
```

**Luồng hoạt động:**

1. Resolve ref: `main` → `origin/main` nếu cần.
2. Với mỗi file: không có trên source / MISSING / DIFFERENT / OK (so hash với `git show`).
3. Hỏi **y/n** có `git checkout <source> -- <file>` + `git add` không.
4. Hỏi tiếp có **commit + push** không (cẩn thận: có thể ghi đè chỉnh sửa local).

**Lưu ý:** Chỉ dùng khi bạn **cố ý** đồng bộ 2 file automation với branch chuẩn; không chạy bừa nếu đang có thay đổi quan trọng chưa commit.

---

## `scripts/setup/https-setup.sh`

**Mục đích:** Tạo **SSL tự ký** (OpenSSL) trong `certs/` — `key.pem` + `cert.pem`, CN `localhost`, **365 ngày**.

**Dùng cho:** HTTPS **local dev** (Node `https.createServer`, v.v.). Trình duyệt sẽ cảnh báo không tin cậy — bình thường.

**Không dùng** thay chứng chỉ production (cần CA / Let’s Encrypt).

```bash
bash scripts/setup/https-setup.sh
```

---

## Bản đồ repo (frontend vs backend)

Xem thêm: [`REPO_LAYOUT.md`](./REPO_LAYOUT.md) — root = React chính, `backend/` = API riêng.

---

*Cập nhật: 2026-03-20*
