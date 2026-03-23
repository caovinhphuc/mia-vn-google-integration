# Tồn kho — Tài liệu `Inventory.py`

> Tự động đăng nhập ONE, chọn "Tất cả" để load toàn bộ hàng tồn kho,
> extract bằng JS call duy nhất, xuất CSV từ `one.tga.com.vn/bi_inventory/sale/`.

---

## 1. Cách chạy

```bash
cd automation
source venv/bin/activate
python Inventory.py
```

Kết quả JSON in ra terminal:

```json
{
  "success": true,
  "rows": 1973,
  "csv_file": "data/inventory_YYYYMMDD_HHMMSS.csv",
  "duration": 45.2
}
```

---

## 2. Cấu hình — `config/config.json`

```json
{
  "system": {
    "one_url": "https://one.tga.com.vn",
    "inventory_url": "https://one.tga.com.vn/bi_inventory/sale/?name=&limit=-1&category=all&location=all&type=old",
    "page_load_timeout": 60,
    "inventory_table_timeout": 90
  },
  "credentials": {
    "username": "${ONE_USERNAME}",
    "password": "${ONE_PASSWORD}"
  },
  "data_processing": {
    "data_dir": "data"
  },
  "logging": {
    "level": "INFO"
  }
}
```

### Thông tin xác thực

Lưu trong `.env`:

```
ONE_USERNAME=ten_dang_nhap
ONE_PASSWORD=mat_khau
```

### Headless mode

```bash
HEADLESS=true python Inventory.py   # ẩn browser (mặc định)
HEADLESS=false python Inventory.py  # hiện browser
```

---

## 3. Luồng xử lý

```
Đăng nhập ONE (one.tga.com.vn)
    ↓
GET /bi_inventory/sale/?limit=-1&...
    ↓ Chờ table load
    ↓ Click "Bỏ cố định cột trái" (nếu có)
    ↓ Click dropdown "Hiện" → chọn "Tất cả" → chờ 5s
    ↓
JS call duy nhất: extract toàn bộ thead + tbody
    ↓ Strategy 1: table > thead th + tbody td
    ↓ Strategy 2: any tr/th + tr/td (fallback)
    ↓
Lưu CSV → data/inventory_YYYYMMDD_HHMMSS.csv
```

> **Không dùng pagination** — "Tất cả" load 1,973 dòng trên 1 trang duy nhất.
> JS extract tránh `StaleElementReferenceException` vì không giữ Python DOM reference.

---

## 4. Dữ liệu được trích xuất

### Cột cố định

| Cột            | Mô tả                   | Ví dụ                              |
| -------------- | ----------------------- | ---------------------------------- |
| `Nhóm SP`      | Nhóm sản phẩm           | `Balo`                             |
| `Barcode`      | Mã vạch                 | `00009236`                         |
| `Tên sản phẩm` | Tên đầy đủ              | `Herschel Classic TM Standard 13"` |
| `Tổng cộng`    | Tổng tồn kho tất cả kho | `296,124`                          |

### Cột theo kho/cửa hàng (tự động từ header trang)

| Kho / Cửa hàng                          |
| --------------------------------------- |
| 1 - Kho Trung Tâm                       |
| 2 - Kho Hà Nội                          |
| MIA Bình Dương - Đại lộ Bình Dương      |
| MIA Cần Thơ - 30 tháng 4                |
| MIA Đà Nẵng - 447 Lê Duẩn               |
| MIA Đồng Nai - Vòng xoay Tam Hiệp       |
| MIA Hà Nội - Hàng Bông                  |
| MIA Hà Nội - Tây Sơn                    |
| MIA HCM - 3 Tháng 2                     |
| MIA HCM - Bạch Đằng                     |
| MIA HCM - CMT8                          |
| MIA HCM - Cộng Hòa                      |
| MIA HCM - Cống Quỳnh                    |
| MIA HCM - Dân Chủ                       |
| MIA HCM - Lũy Bán Bích                  |
| MIA HCM - Nguyễn Thị Thập               |
| MIA HCM - NTMK                          |
| MIA HCM - Phạm Văn Đồng                 |
| MIA HCM - Quang Trung                   |
| MIA HCM - Trần Não                      |
| MIA HCM - Trần Quang Diệu               |
| MIA HCM - Trường Chinh                  |
| MIA HCM - vòng xoay Thủ Đức             |
| MIA OUTLET - Phạm Hồng Thái             |
| W - COD                                 |
| W - Kho hàng lỗi                        |
| W - Kho hàng mẫu                        |
| W - Ký gửi                              |
| W - Livestream (MIA 349 Hoàng Văn Thụ)  |
| W - MIA Care (MIA HCM - Ngã 6 Phù Đổng) |
| W - MIA Hội chợ sự kiện                 |
| W - MIA Hội chợ sự kiện 2               |
| W - OEM mượn (MIA Nguyễn Văn Trỗi)      |
| W - Studio                              |

> Danh sách cột kho **tự động** lấy từ `<thead>` trang — nếu mở thêm cửa hàng mới sẽ tự có thêm cột.

---

## 5. File output

| File                                 | Nội dung                               |
| ------------------------------------ | -------------------------------------- |
| `data/inventory_YYYYMMDD_HHMMSS.csv` | Tồn kho toàn bộ sản phẩm × toàn bộ kho |
| `logs/inventory_YYYYMMDD.log`        | Log chi tiết từng bước chạy            |

Encoding: `UTF-8-sig` (Excel mở đúng tiếng Việt).

---

## 6. Dependencies

| Gói               | Mục đích            |
| ----------------- | ------------------- |
| selenium          | Web automation      |
| webdriver-manager | Tự tải ChromeDriver |
| python-dotenv     | Đọc .env            |

Đã có trong `requirements-basic.txt`. Kiểm tra:

```bash
pip install -r requirements-basic.txt
python3 -c "from selenium import webdriver; from webdriver_manager.chrome import ChromeDriverManager; print('✅ OK')"
```

---

## 7. Troubleshooting

| Triệu chứng                               | Nguyên nhân                      | Cách xử lý                                                 |
| ----------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| `0 rows` + `DOM debug: td_total=0`        | JS chạy trước khi table render   | Tăng `time.sleep` sau "Tất cả" lên 10s                     |
| `0 rows` + `iframes > 0`                  | Table nằm trong iframe           | Thêm `driver.switch_to.frame()` trước JS call              |
| `StaleElementReferenceException`          | DOM re-render khi pagination     | Script dùng JS extract — không còn xảy ra                  |
| `Could not select 'Tất cả'`               | Dropdown class thay đổi          | Kiểm tra XPath selector trong `_select_show_all()`         |
| `inventory_url not defined`               | Thiếu key trong config.json      | Thêm `inventory_url` vào `system` section                  |
| `Login failed`                            | Sai credentials                  | Kiểm tra `.env` — `ONE_USERNAME`, `ONE_PASSWORD`           |
| `WebDriver initialization failed`         | ChromeDriver lỗi                 | Script dùng webdriver-manager; kiểm tra Chrome đã cài      |
| `Error navigating to inventory` / Timeout | Trang BI load chậm               | Tăng `inventory_table_timeout` trong config (mặc định 90s) |
| `Table not found`                         | Table trong iframe hoặc DOM khác | Xem `logs/inventory_debug_*.png`; script tự thử iframe     |
