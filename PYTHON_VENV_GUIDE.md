# Hướng dẫn Python venv thống nhất

## Python version: 3.11

Project chuẩn hóa **Python 3.11** (khớp CI, ai-service, pydantic).

- **pyenv**: `.python-version` → tự động dùng 3.11 khi cd vào project
- **Cài đặt**: `brew install python@3.11` hoặc `pyenv install 3.11`

## Chuẩn hóa: dùng `.venv` tại root

Project dùng **một** virtual environment tại `./.venv` cho:

- **ai-service** (FastAPI)
- **one_automation_system** (automation scripts)
- **IDE** (Cursor/VS Code interpreter)
- **Scripts** Python chung

## Kích hoạt

```bash
# Cách 1 (từ project root)
source .venv/bin/activate

# Cách 2 (từ bất kỳ đâu trong project)
source scripts/activate-venv.sh
```

Sau khi kích hoạt, prompt sẽ có `(venv)`.

## Setup lần đầu

```bash
npm run ide:setup
```

Hoặc thủ công:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

## npm scripts

- `npm run ai-service` — tự động dùng `.venv` trước khi chạy
- `npm run dev` — frontend + backend + ai-service (đều dùng .venv cho Python)

## IDE

- **defaultInterpreterPath**: `./.venv/bin/python`
- Chọn interpreter: `Cmd+Shift+P` → **Python: Select Interpreter** → chọn `.venv`

## Khi nào dùng venv riêng

| Thư mục       | venv riêng        | Ghi chú                                                                                                  |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `automation/` | `automation/venv` | Dependencies nặng (selenium-wire, undetected-chromedriver, streamlit). Dùng khi chạy automation độc lập. |
| `ai-service/` | `ai-service/venv` | Fallback nếu cần Python 3.11 riêng cho pydantic. Thường dùng root `.venv`.                               |

## Migrate từ venv cũ

Nếu đang dùng `one_automation_system/venv` hoặc `ai-service/venv`:

1. Kích hoạt `.venv` mới: `source .venv/bin/activate`
2. Cài deps: `pip install -r requirements-dev.txt`
3. Chạy `npm run ide:setup` để đồng bộ IDE
4. Có thể xóa venv cũ khi không còn dùng
