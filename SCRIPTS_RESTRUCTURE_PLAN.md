# 📁 KẾ HOẠCH TỔ CHỨC LẠI SCRIPTS - React OAS Integration v4.0

> **Ngày tạo**: 2025-01-27  
> **Refresh**: 2026-03-18  
> **Mục đích**: Đề xuất cấu trúc thư mục + chuẩn hóa root wrappers

## ✅ Trạng thái so với plan (Mar 2026)

- Đã áp dụng chuẩn wrapper root cho nhiều script deploy/start
- Đã có CI/local guard chống wrapper drift:
  - `scripts/utils/check-root-shell-wrappers.sh`
  - `npm run scripts:guard-wrappers`
- Chưa nên coi migration là "done tuyệt đối" vì vẫn còn alias/duplicate để tương thích

## 📌 Ưu tiên hiện tại

1. Giữ nguyên backward-compatible aliases đang dùng thực tế
2. Script mới bắt buộc theo chuẩn `SHELL_SCRIPT_STANDARDS.md`
3. Chỉ dọn/xóa script cũ khi đã có mapping thay thế và test hồi quy

---

## 🎯 MỤC TIÊU

1. ✅ Tổ chức scripts theo mục đích rõ ràng
2. ✅ Loại bỏ scripts trùng lặp
3. ✅ Tạo cấu trúc dễ maintain
4. ✅ Đảm bảo tất cả scripts chạy từ root directory

---

## 📁 CẤU TRÚC ĐỀ XUẤT

```
scripts/
├── README.md                    # Tổng quan về scripts
│
├── setup/                       # Setup scripts
│   ├── main-setup.sh           # Setup chính (từ setup.sh)
│   ├── ide-setup.sh            # Setup IDE (từ setup_ide.sh)
│   ├── https-setup.sh          # Setup HTTPS (từ setup-https.sh)
│   ├── install.sh               # Install dependencies
│   └── verify-setup.sh         # Verify setup
│
├── start-stop/                  # Start/Stop scripts
│   ├── start-all.sh            # Start all services (chính)
│   ├── stop-all.sh             # Stop all services
│   ├── start-backend.sh        # Start backend only
│   ├── start-frontend.sh       # Start frontend only
│   └── restart.sh              # Restart all services
│
├── deploy/                      # Deployment scripts
│   ├── deploy-main.sh          # Deploy chính (từ deploy.sh)
│   ├── deploy-production.sh    # Production deploy
│   ├── deploy-vercel.sh        # Deploy Vercel (gộp 2 scripts)
│   ├── deploy-netlify.sh       # Deploy Netlify
│   ├── deploy-gcp.sh           # Deploy GCP
│   ├── quick-deploy.sh         # Quick deploy (gộp 2 scripts)
│   └── serve-build.sh          # Serve production build
│
├── fix/                         # Fix/Troubleshooting
│   ├── fix-port-conflict.sh
│   ├── fix-chunk-errors.sh     # Gộp 2 scripts
│   ├── fix-api-connection.sh
│   ├── fix-automation-path.sh
│   ├── fix-branch-sync.sh
│   └── fix-missing-files.sh
│
├── utils/                       # Utility scripts
│   ├── check-ports.sh
│   ├── check-env.sh             # Gộp 2 scripts
│   ├── check-backend.sh
│   ├── kill-port.sh
│   ├── verify-port-config.sh
│   └── security-audit.sh
│
├── git/                         # Git operations
│   ├── sync-to-main.sh
│   ├── push-to-github.sh
│   ├── prepare-github-repo.sh
│   └── setup-github.sh         # Gộp 2 scripts
│
└── sub-projects/                # Sub-projects scripts (giữ nguyên)
    ├── automation/
    ├── ai-service/
    ├── one_automation_system/
    └── google-sheets-project/
```

---

## 🔄 MAPPING SCRIPTS CŨ → MỚI

### Setup Scripts

| Script cũ                 | Script mới                      | Ghi chú            |
| ------------------------- | ------------------------------- | ------------------ |
| `setup.sh`                | `scripts/setup/main-setup.sh`   | Rename và move     |
| `setup_ide.sh`            | `scripts/setup/ide-setup.sh`    | Move               |
| `setup-https.sh`          | `scripts/setup/https-setup.sh`  | Move               |
| `scripts/setup.sh`        | `scripts/setup/main-setup.sh`   | Merge với setup.sh |
| `scripts/install.sh`      | `scripts/setup/install.sh`      | Move               |
| `scripts/verify-setup.sh` | `scripts/setup/verify-setup.sh` | Move               |

### Start/Stop Scripts

| Script cũ                  | Script mới                            | Ghi chú                |
| -------------------------- | ------------------------------------- | ---------------------- |
| `start_dev_servers.sh`     | `scripts/start-stop/start-all.sh`     | ⭐ Chính               |
| `deploy_platform.sh`       | `scripts/start-stop/start-all.sh`     | Merge logic            |
| `start_ai_platform.sh`     | `scripts/start-stop/start-all.sh`     | Merge và cập nhật v4.0 |
| `start_data_flow.sh`       | `scripts/start-stop/start-all.sh`     | Merge logic            |
| `scripts/start_all.sh`     | `scripts/start-stop/start-all.sh`     | Merge                  |
| `scripts/start_backend.sh` | `scripts/start-stop/start-backend.sh` | Gộp 2 scripts          |
| `scripts/start-backend.sh` | `scripts/start-stop/start-backend.sh` | Gộp                    |
| `scripts/stop_all.sh`      | `scripts/start-stop/stop-all.sh`      | Move                   |

### Deployment Scripts

| Script cũ              | Script mới                            | Ghi chú       |
| ---------------------- | ------------------------------------- | ------------- |
| `deploy.sh`            | `scripts/deploy/deploy-main.sh`       | ⭐ Chính      |
| `deploy-production.sh` | `scripts/deploy/deploy-production.sh` | Move          |
| `deploy-vercel.sh`     | `scripts/deploy/deploy-vercel.sh`     | Gộp 2 scripts |
| `deployVercel.sh`      | `scripts/deploy/deploy-vercel.sh`     | Gộp           |
| `deployNetlify.sh`     | `scripts/deploy/deploy-netlify.sh`    | Move          |
| `deployGCP.sh`         | `scripts/deploy/deploy-gcp.sh`        | Move          |
| `quick-deploy.sh`      | `scripts/deploy/quick-deploy.sh`      | Gộp 2 scripts |
| `quick_deploy.sh`      | `scripts/deploy/quick-deploy.sh`      | Gộp           |
| `serve-build.sh`       | `scripts/deploy/serve-build.sh`       | Move          |

### Fix Scripts

| Script cũ                        | Script mới                           | Ghi chú       |
| -------------------------------- | ------------------------------------ | ------------- |
| `scripts/fix-port-conflict.sh`   | `scripts/fix/fix-port-conflict.sh`   | Move          |
| `scripts/fix-chunk-errors.sh`    | `scripts/fix/fix-chunk-errors.sh`    | Gộp 2 scripts |
| `fix-chunk-error.sh`             | `scripts/fix/fix-chunk-errors.sh`    | Gộp           |
| `scripts/fix-api-connection.sh`  | `scripts/fix/fix-api-connection.sh`  | Move          |
| `scripts/fix-automation-path.sh` | `scripts/fix/fix-automation-path.sh` | Move          |
| `fix-branch-sync.sh`             | `scripts/fix/fix-branch-sync.sh`     | Move          |
| `fix-missing-files.sh`           | `scripts/fix/fix-missing-files.sh`   | Move          |

### Utility Scripts

| Script cũ                   | Script mới                            | Ghi chú       |
| --------------------------- | ------------------------------------- | ------------- |
| `scripts/check-ports.sh`    | `scripts/utils/check-ports.sh`        | Move          |
| `scripts/check-env.sh`      | `scripts/utils/check-env.sh`          | Gộp 2 scripts |
| `scripts/check-env copy.sh` | `scripts/utils/check-env.sh`          | Gộp và xóa    |
| `scripts/check-backend.sh`  | `scripts/utils/check-backend.sh`      | Move          |
| `scripts/kill-port.sh`      | `scripts/utils/kill-port.sh`          | Move          |
| `verify_port_config.sh`     | `scripts/utils/verify-port-config.sh` | Move          |
| `securityAudit.sh`          | `scripts/utils/security-audit.sh`     | Move          |

### Git Scripts

| Script cũ                        | Script mới                            | Ghi chú       |
| -------------------------------- | ------------------------------------- | ------------- |
| `sync-to-main.sh`                | `scripts/git/sync-to-main.sh`         | Move          |
| `create-repo-and-push.sh`        | `scripts/git/create-repo-and-push.sh` | Move          |
| `scripts/push_to_github.sh`      | `scripts/git/push-to-github.sh`       | Move          |
| `scripts/prepare_github_repo.sh` | `scripts/git/prepare-github-repo.sh`  | Move          |
| `scripts/setup-github.sh`        | `scripts/git/setup-github.sh`         | Gộp 2 scripts |
| `scripts/setup-github copy.sh`   | `scripts/git/setup-github.sh`         | Gộp và xóa    |

---

## 📋 KẾ HOẠCH MIGRATION

### Phase 1: Tạo cấu trúc mới

```bash
# Tạo các thư mục
mkdir -p scripts/{setup,start-stop,deploy,fix,utils,git}
```

### Phase 2: Di chuyển scripts

1. **Setup scripts**: Di chuyển vào `scripts/setup/`
2. **Start/Stop scripts**: Di chuyển vào `scripts/start-stop/`
3. **Deployment scripts**: Di chuyển vào `scripts/deploy/`
4. **Fix scripts**: Di chuyển vào `scripts/fix/`
5. **Utility scripts**: Di chuyển vào `scripts/utils/`
6. **Git scripts**: Di chuyển vào `scripts/git/`

### Phase 3: Gộp scripts trùng lặp

1. Gộp `deploy-vercel.sh` và `deployVercel.sh`
2. Gộp `quick-deploy.sh` và `quick_deploy.sh`
3. Gộp `scripts/start_backend.sh` và `scripts/start-backend.sh`
4. Gộp `scripts/check-env.sh` và `scripts/check-env copy.sh`
5. Gộp `scripts/setup-github.sh` và `scripts/setup-github copy.sh`
6. Gộp `fix-chunk-error.sh` và `scripts/fix-chunk-errors.sh`

### Phase 4: Cập nhật paths

Tất cả scripts cần được cập nhật để:

- Chạy từ root directory
- Sử dụng relative paths đúng
- Không phụ thuộc vào vị trí hiện tại

### Phase 5: Tạo wrapper scripts (Root level)

Tạo các wrapper scripts ở root để backward compatibility:

```bash
# Root level wrappers
./setup.sh          → scripts/setup/main-setup.sh
./start.sh          → scripts/start-stop/start-all.sh
./stop.sh           → scripts/start-stop/stop-all.sh
./deploy.sh         → scripts/deploy/deploy-main.sh
```

---

## ⚠️ LƯU Ý

### 1. Backward Compatibility

- Giữ một số scripts ở root level làm wrapper
- Hoặc tạo symlinks

### 2. Sub-projects

- Giữ nguyên scripts trong sub-projects
- Không di chuyển scripts của sub-projects

### 3. Testing

- Test tất cả scripts sau khi migration
- Đảm bảo paths đúng

### 4. Documentation

- Cập nhật SCRIPTS_GUIDE.md
- Cập nhật README.md nếu cần

---

## 🎯 SCRIPTS NÊN GIỮ Ở ROOT LEVEL

### Wrapper Scripts (Khuyến nghị):

1. `setup.sh` → Wrapper cho `scripts/setup/main-setup.sh`
2. `start.sh` → Wrapper cho `scripts/start-stop/start-all.sh`
3. `stop.sh` → Wrapper cho `scripts/start-stop/stop-all.sh`
4. `deploy.sh` → Wrapper cho `scripts/deploy/deploy-main.sh`
5. `quick-deploy.sh` → Wrapper cho `scripts/deploy/quick-deploy.sh`

### Scripts giữ nguyên ở root:

- `deploy-production.sh` - Production deploy (quan trọng)
- `serve-build.sh` - Serve build (thường dùng)

---

## 📝 CHECKLIST MIGRATION (refresh)

- [x] Thiết lập chuẩn wrapper root + canonical scripts
- [x] Thêm local/CI guard cho root wrappers
- [x] Cập nhật docs scripts chính (index/guide/analysis)
- [ ] Rà soát alias trùng lặp và quyết định giữ/xóa theo mức sử dụng thực tế
- [ ] Test hồi quy trước khi xóa bất kỳ alias legacy nào

---

## 🚀 NEXT STEPS

1. ✅ Phân tích xong - Đã tạo file này
2. ⏳ Review và approve cấu trúc
3. ⏳ Thực hiện migration
4. ⏳ Test scripts
5. ⏳ Cập nhật documentation

---

**Last Updated**: 2026-03-18
