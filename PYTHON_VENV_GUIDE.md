# Python — phiên bản & venv (chuẩn repo)

## Một dòng

**Chuẩn dự án: Python 3.11** (file **`.python-version`**, CI `.github/workflows/ci-cd.yml`).  
**Tạo venv mới: dùng 3.11 hoặc 3.12** — **tránh 3.14+** (wheel / thư viện chưa ổn định).  
Biến **`PYTHON_BIN=/path/to/python3.11`** dùng khi script hỗ trợ (xem bảng dưới).

### Lỗi `numpy` / `metadata-generation-failed` / `ninja: build stopped` (log có `cpython-314`)

Venv đang là **Python 3.14** — nhiều wheel chưa có, pip đi compile C++ rồi fail. **Xoá venv** trong thư mục service rồi setup lại bằng **3.11** (xem khối lệnh mục _Tạo / làm lại venv_ bên dưới). Script `one_automation_system/setup.sh` sẽ **thoát lỗi** nếu `pip` fail (không còn báo ✅ giả).

---

## Ma trận: script / service dùng Python nào?

| Khu vực                   | Vị trí venv thường gặp       | Cách chọn interpreter khi _tạo_ venv                                                                         |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **CI GitHub Actions**     | (runner)                     | **`PYTHON_VERSION: "3.11"`** trong `ci-cd.yml`                                                               |
| **ai-service**            | `ai-service/venv`            | `ai-service/setup_venv.sh`: ưu tiên **3.11** → 3.12 → 3.13 → `PYTHON_BIN` hoặc `python3` **&lt; 3.14**       |
| **automation**            | `automation/venv`            | `automation/setup.sh`: **3.11** → 3.12 → 3.13 → `python3` chỉ nếu **&lt; 3.14**                              |
| **one_automation_system** | `one_automation_system/venv` | `one_automation_system/setup.sh`: **3.11** → 3.12 → 3.13 → `python3` **&lt; 3.14**; hoặc `PYTHON_BIN`        |
| **Chạy full stack**       | (không tạo venv)             | `scripts/start-stop/start-all.sh`: ưu tiên **`…/venv/bin/python`** của từng service; cảnh báo nếu ≥ **3.14** |
| **IDE / setup gợi ý**     | có thể có `.venv` ở root     | `scripts/setup/ide-setup.sh` ưu tiên **python3.11**                                                          |

**Lưu ý:** Repo có thể có **nhiều venv** (`ai-service/venv`, `automation/venv`, `one_automation_system/venv`) — đó là thực tế `start.sh` / npm đang dùng. File `.venv` ở root là **tuỳ chọn** (một số hướng dẫn IDE); không bắt buộc để chạy `./start.sh`.

---

## Cài đặt khuyến nghị (macOS)

```bash
brew install python@3.11
# Hoặc nếu team thống nhất 3.12:
brew install python@3.12
```

**pyenv** (nếu dùng): đặt `.python-version` = `3.11` (đã có ở root repo).

---

## Muốn lệnh `python3` trong terminal cũng là 3.11 (không chỉ khi chạy `./start.sh`)

Có 3 hướng — từ **ít đụng máy** → **đổi mặc định cả shell**:

### 1) Chỉ phiên terminal hiện tại (khuyến nghị khi làm việc trong repo)

Từ **thư mục gốc** repo:

```bash
source scripts/shell/use-repo-python.sh
```

Script chèn `ai-service/venv/bin` (hoặc `one_automation_system/venv`, `automation/venv` nếu chưa có ai-service) lên **đầu** `PATH`. `python3 --version` sẽ khớp venv. Đóng terminal hoặc tab mới thì cần `source` lại.

### 2) pyenv (ổn định theo thư mục repo)

1. Cài pyenv + `pyenv install 3.11.15` (hoặc bản 3.11 bạn dùng).
2. Trong `~/.zshrc`: `eval "$(pyenv init -)"` và đảm bảo **shim pyenv đứng trước** `/opt/homebrew/bin` trong `PATH`.
3. Trong repo đã có **`.python-version`** = `3.11` → vào thư mục repo, `python3` sẽ là 3.11.

### 3) Homebrew — đổi `python3` mặc định cả máy (cẩn thận)

```bash
brew install python@3.11
brew unlink python@3.14 2>/dev/null || true
brew link python@3.11 --force --overwrite
```

Có thể ảnh hưởng project khác cần 3.14. Chỉ nên làm khi bạn chủ động quản lý phiên bản toàn máy.

---

## Tạo / làm lại venv đúng bản

```bash
# Từ thư mục gốc repo (cùng cấp với package.json). Cả ba nên dùng Python 3.11 (khớp .python-version / CI).
PY311=/opt/homebrew/opt/python@3.11/bin/python3.11   # Intel Homebrew: thử /usr/local/opt/python@3.11/bin/python3.11

cd ai-service && PYTHON_BIN="$PY311" bash setup_venv.sh --force && cd ..

# Automation: không bắt buộc PYTHON_BIN (setup tự tìm 3.11→3.12→3.13); thêm nếu PATH chỉ có 3.14+
cd automation && PYTHON_BIN="$PY311" ./setup.sh --force && cd ..

cd one_automation_system && PYTHON_BIN="$PY311" bash setup.sh && cd ..
```

(Không có Homebrew: cài `python@3.11` hoặc dùng `pyenv`; đặt `PY311` trỏ đúng file `python3.11` trên máy bạn.)

---

## npm (tham chiếu)

- `npm run setup:ai-service` / `setup:ai-service:force` → `ai-service/setup_venv.sh`
- `npm run setup:automation` / `setup:automation:force` → `automation/setup.sh`

---

## Tài liệu liên quan

- [READ_THIS_FIRST.md](./READ_THIS_FIRST.md) — cổng + FAQ Python 3.14
- [Document/AUTOMATION_PYTHON_GUIDE.md](./Document/AUTOMATION_PYTHON_GUIDE.md) — chi tiết thư mục `automation/`

**Last updated:** 2026-04-22
