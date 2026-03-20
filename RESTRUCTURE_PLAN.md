# Monorepo Restructure Plan

## Mục tiêu

Chuẩn hoá cấu trúc dự án phân tách rõ: ứng dụng (apps), thư viện tái sử dụng (packages), hạ tầng (infrastructure), tài liệu (docs), script (scripts) và kiểm thử phân tầng. Giảm trùng lặp frontend, gom backend/automation/AI về không gian đặt tên thống nhất, chuẩn hoá môi trường và build.

## Nguyên tắc thiết kế

- Tất cả mã chạy trực tiếp (runnable) nằm trong `apps/`
- Logic chia sẻ nằm trong `packages/`
- Triển khai & DevOps nằm trong `infrastructure/`
- Shell & tiện ích tự động hoá phát triển nằm trong `scripts/`
- Tài liệu gộp về `docs/`
- Output build/log không commit: dùng `.gitignore` chuẩn (`/apps/*/dist`, `/logs`, `/coverage`)
- Mỗi package có: `package.json` (JS) hoặc `pyproject.toml/setup.cfg` (Python) + `README.md` + `.env.example`
- Testing: unit cạnh nguồn, integration & e2e tập trung trong `tests/`

## Cấu trúc mục tiêu đề xuất

```
/README.md
/RESTRUCTURE_PLAN.md
/package.json (root workspace config nếu dùng pnpm/turbo)
/pnpm-workspace.yaml (hoặc turbo.json) [tùy chọn]
/.editorconfig
/.gitignore
/.env.example (chỉ biến chung)

/apps/
  web/                  # Ứng dụng React chính (gộp từ src + shared app chính)
    src/
    public/
    package.json
  backend-api/          # (Nếu giữ server.js Node) hoặc chuyển hẳn sang Python FastAPI/flask
    src/
    package.json
  automation/           # Gom toàn bộ thư mục automation (Python)
    src/                # Di chuyển modules/ -> src/, scripts chuẩn hoá
    tests/
    pyproject.toml or setup.cfg
  ai-service/           # Tách riêng AI service (ai_service.py + Dockerfile.ai)
    src/
    models/
    pyproject.toml
  sandbox/              # (Tuỳ chọn) chứa demo / new-react-router-app code thử nghiệm
    src/
    package.json

/packages/
  ui/                   # Component UI chia sẻ (trích từ shared/src/components)
  google-sheets-sdk/    # Từ shared-services/google-sheets + adapter
  notification-services/# emailService, telegramService, realtimeService
  shared-utils/         # utils, hooks, types chung
  domain-modules/       # (tuỳ chọn) domain logic tách khỏi app

/infrastructure/
  docker/               # Dockerfile, Dockerfile.frontend, nginx.prod.conf
  compose/              # docker-compose.yml, *.prod.yml
  k8s/                  # (mở rộng sau)
  env-templates/        # Các file .env.example chuyên biệt
  deployment/           # production_deploy.sh, quick_deploy.sh

/scripts/
  dev/                  # start_dev_servers.sh, run_projects.sh
  build/
  deploy/
  ops/                  # monitor, sla, system_check

/tests/
  integration/
  e2e/
  performance/

/docs/
  architecture/
  guides/
  roadmap/
  reports/

/tools/                 # Lint, codegen, custom CLIs (tương lai)

/.output/               # (tuỳ chọn) gom build artifact nếu không để trong app
/logs/                  # central logs nếu cần
```

## Ánh xạ (Old → New)

| Hiện tại                                  | Mới đề xuất                                                    | Ghi chú                                           |
| ----------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- | ------------------ |
| `src/` (App.jsx, components/google)` | `apps/web/src/` | Gộp vào web chính                                 |
| `shared/` (React TS app)                  | (Phân rã) `apps/web/` + `packages/ui`,`packages/shared-utils` | Quyết định app chính dựa trên code hoàn thiện hơn |
| `new-react-router-app/` | `apps/sandbox/` | Giữ làm playground hoặc bỏ nếu dư                 |
| `shared-services/google-sheets` | `packages/google-sheets-sdk/` | Chuẩn hoá export index.ts                         |
| `shared-services/service/*.js` | `packages/notification-services/` | Module hoá                                        |
| `shared-services/shared/*` (docs, docker) | `infrastructure/` + `docs/` | Phân loại lại                                     |
| `automation/automation.py ...` | `apps/automation/src/` | Modules → src/                                    |
| `automation/modules/` | `apps/automation/src/modules/` | Đổi import relative                               |
| `automation/tests/` | `apps/automation/tests/` | Giữ gần code hoặc merge root `/tests/automation` |
| `ai_service.py` | `apps/ai-service/src/ai_service.py` | Tạo package Python                                |
| `Dockerfile.ai` | `apps/ai-service/Dockerfile` | Chuẩn tên                                         |
| `server.js` (trong shared)                | `apps/backend-api/src/server.js` | Nếu vẫn dùng Node backend                         |
| Root `integration_test.js`...             |`/tests/integration/\*.test.(js                                | ts)` | Chuẩn hoá tên file |
| Root `*.sh` scripts                       | `/scripts/{dev,deploy,ops}/` | Đổi tên chuẩn snake-case                          |
| Tài liệu root \*.md                       | `/docs/` | Giữ alias README ở root với link                  |
| `backup_markdown/` | `/docs/reports/legacy/` | Hoặc lưu trữ ngoài repo                           |
| `logs/` | `/logs/` | Thêm ignore & xoá rác cũ                          |
| Rải rác `.env*` | `.env.example` + `infrastructure/env-templates/`               | Không commit env thực                             |

## Chi tiết di trú Python (Automation & AI)

1. Tạo `apps/automation/pyproject.toml`
2. Di chuyển `automation/modules/` → `apps/automation/src/`
3. Cập nhật import tuyệt đối sang namespace `automation` (hoặc đặt package name `automation_app`)
4. Tách script chạy (entrypoints) vào `apps/automation/src/cli/`
5. AI service: gom model/util vào `apps/ai-service/src/`

## Chi tiết di trú Frontend

1. Chọn code base làm nền (có vẻ `shared/` đầy đủ hơn) → đó là `apps/web/`
2. Trích các component generic → `packages/ui/`
3. Trích hooks, utils chung → `packages/shared-utils/`
4. Loại bỏ code trùng trong `src/` cũ sau khi merge
5. Thiết lập build monorepo (pnpm + workspace protocol hoặc turbo)

### Ví dụ `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

## Phân tầng test

- Unit: cạnh file (`*.test.tsx` / `test_*.py`)
- Integration: `/tests/integration/`
- E2E: `/tests/e2e/` (cypress/playwright)
- Performance: `/tests/performance/`

## Chiến lược triển khai theo Phase

| Phase | Phạm vi                                       | Thành công khi            | Rủi ro chính           | Giảm thiểu                       |
| ----- | --------------------------------------------- | ------------------------- | ---------------------- | -------------------------------- |
| 0     | Chuẩn bị                                      | Thêm plan, không đổi code | Thiếu buy-in           | Review nhanh                     |
| 1     | Tạo khung `/apps` & `/packages` & tool config | Build không vỡ            | Sai đường dẫn import   | Dùng alias song song             |
| 2     | Di trú frontend chính                         | App chạy dev OK           | Component thiếu export | Viết export barrel               |
| 3     | Tách shared services JS                       | Test integration pass     | Vòng lặp dependency    | Kiểm tra graph bằng `madge`      |
| 4     | Di trú automation Python                      | Script chạy lại OK        | Import lỗi             | Thêm shim `__init__` + path stub |
| 5     | Di trú AI service                             | Healthcheck OK            | Docker build fail      | Build local trước                |
| 6     | Gom test & chuẩn hoá đặt tên                  | CI pass                   | Thiếu test mapping     | Tạo danh sách test cũ            |
| 7     | Dọn tài liệu & scripts                        | README cập nhật           | Nhầm link cũ           | Symlink tạm (nếu cần)            |

## Rủi ro & Biện pháp

- Gãy import JS: duy trì alias cũ tạm thời qua `tsconfig.paths` / bundler alias
- Gãy script Python: tạo layer tương thích: file thin wrapper ở vị trí cũ import từ vị trí mới (deprecation note)
- Git history khó theo dõi: dùng `git mv` để bảo tồn lịch sử
- PR quá lớn: Mỗi phase 1 PR + checklist
- Đồng thời phát triển tính năng: freeze 1–2 ngày lúc Phase 2 & 4

## Công cụ hỗ trợ đề xuất

- `madge` / `depcruise` kiểm dependency vòng
- `eslint --max-warnings=0` enforced sau khi ổn
- `pre-commit` hook: lint + sort imports (JS + Python `ruff`)
- `just` hoặc `make` trong root để thống nhất lệnh

## Việc cần tạo thêm (scaffold)

- `pnpm-workspace.yaml`
- Root `package.json` (nếu chưa) với scripts orchestration
- `turbo.json` (tùy chọn tăng tốc)
- `pyproject.toml` cho các app Python
- `.editorconfig`, `CODEOWNERS`
- Template `.env.example`

## Kế hoạch Rollback

- Mỗi phase tag git: `restructure-phase-X-start` / `restructure-phase-X-end`
- Nếu lỗi production: revert tag gần nhất, giữ branch refactor để xử lý tiếp

## Checklist Thực Thi Nhanh

- [ ] Tạo thư mục khung rỗng `apps/`, `packages/`, `infrastructure/`, `scripts/`, `docs/`
- [ ] Thêm workspace config
- [ ] Di trú frontend → chạy dev
- [ ] Trích xuất packages + cập nhật import
- [ ] Di trú automation Python
- [ ] Di trú AI service

# Monorepo Restructure Plan

## Mục tiêu

Chuẩn hoá cấu trúc dự án phân tách rõ: ứng dụng (apps), thư viện tái sử dụng (packages), hạ tầng (infrastructure), tài liệu (docs), script (scripts) và kiểm thử phân tầng. Giảm trùng lặp frontend, gom backend/automation/AI về không gian đặt tên thống nhất, chuẩn hoá môi trường và build.

## Nguyên tắc thiết kế

- Tất cả mã chạy trực tiếp (runnable) nằm trong `apps/`
- Logic chia sẻ nằm trong `packages/`
- Triển khai & DevOps nằm trong `infrastructure/`
- Shell & tiện ích tự động hoá phát triển nằm trong `scripts/`
- Tài liệu gộp về `docs/`
- Output build/log không commit: dùng `.gitignore` chuẩn (`/apps/*/dist`, `/logs`, `/coverage`)
- Mỗi package có: `package.json` (JS) hoặc `pyproject.toml/setup.cfg` (Python) + `README.md` + `.env.example`
- Testing: unit cạnh nguồn, integration & e2e tập trung trong `tests/`

## Cấu trúc mục tiêu đề xuất

```text
/README.md
/RESTRUCTURE_PLAN.md
/package.json (root workspace config nếu dùng pnpm/turbo)
/pnpm-workspace.yaml (hoặc turbo.json) [tùy chọn]
/.editorconfig
/.gitignore
/.env.example (chỉ biến chung)

/apps/
  web/                  # Ứng dụng React chính (gộp từ src + shared app chính)
    src/
    public/
    package.json
  backend-api/          # (Nếu giữ server.js Node) hoặc chuyển hẳn sang Python FastAPI/flask
    src/
    package.json
  automation/           # Gom toàn bộ thư mục automation (Python)
    src/                # Di chuyển modules/ -> src/, scripts chuẩn hoá
    tests/
    pyproject.toml or setup.cfg
  ai-service/           # Tách riêng AI service (ai_service.py + Dockerfile.ai)
    src/
    models/
    pyproject.toml
  sandbox/              # (Tuỳ chọn) chứa demo / new-react-router-app code thử nghiệm
    src/
    package.json

/packages/
  ui/                   # Component UI chia sẻ (trích từ shared/src/components)
  google-sheets-sdk/    # Từ shared-services/google-sheets + adapter
  notification-services/# emailService, telegramService, realtimeService
  shared-utils/         # utils, hooks, types chung
  domain-modules/       # (tuỳ chọn) domain logic tách khỏi app

/infrastructure/
  docker/               # Dockerfile, Dockerfile.frontend, nginx.prod.conf
  compose/              # docker-compose.yml, *.prod.yml
  k8s/                  # (mở rộng sau)
  env-templates/        # Các file .env.example chuyên biệt
  deployment/           # production_deploy.sh, quick_deploy.sh

/scripts/
  dev/                  # start_dev_servers.sh, run_projects.sh
  build/
  deploy/
  ops/                  # monitor, sla, system_check

/tests/
  integration/
  e2e/
  performance/

/docs/
  architecture/
  guides/
  roadmap/
  reports/

/tools/                 # Lint, codegen, custom CLIs (tương lai)

/.output/               # (tuỳ chọn) gom build artifact nếu không để trong app
/logs/                  # central logs nếu cần
```

## Ánh xạ (Old → New)

| Hiện tại                             | Mới đề xuất                                               | Ghi chú                            |
| ------------------------------------ | --------------------------------------------------------- | ---------------------------------- |
| `src/` (App.jsx, components/google)  | `apps/web/src/`                                           | Gộp vào web chính                  |
| `shared/` (React TS app)             | `apps/web/` + tách `packages/ui`, `packages/shared-utils` | Chọn làm base app                  |
| `new-react-router-app/`              | `apps/sandbox/`                                           | Giữ playground hoặc bỏ             |
| `shared-services/google-sheets`      | `packages/google-sheets-sdk/`                             | Chuẩn hoá exports                  |
| `shared-services/service/*.js`       | `packages/notification-services/`                         | Module hoá                         |
| `shared-services/shared/*`           | `infrastructure/` + `docs/`                               | Phân loại infra vs docs            |
| `automation/automation.py` & scripts | `apps/automation/src/`                                    | Chuẩn hoá entrypoints              |
| `automation/modules/`                | `apps/automation/src/modules/`                            | Giữ namespace modules              |
| `automation/tests/`                  | `apps/automation/tests/`                                  | Có thể merge root tests sau        |
| `ai_service.py`                      | `apps/ai-service/src/ai_service.py`                       | Tạo package Python                 |
| `Dockerfile.ai`                      | `apps/ai-service/Dockerfile`                              | Đổi tên nhất quán                  |
| `server.js` (trong shared)           | `apps/backend-api/src/server.js`                          | Nếu tiếp tục dùng Node backend     |
| `integration_test.js` (root)         | `tests/integration/integration.test.js`                   | Chuẩn tên *.test.*                 |
| `advanced_integration_test.js`       | `tests/integration/advanced.integration.test.js`          | Đổi pattern                        |
| `complete_system_test.js`            | `tests/e2e/system.e2e.test.js`                            | Phân tầng e2e                      |
| `end_to_end_test.js`                 | `tests/e2e/end-to-end.e2e.test.js`                        | Thống nhất hậu tố                  |
| `test_google_sheets.js`              | `tests/integration/google-sheets.integration.test.js`     | Rõ domain                          |
| Root `*.sh`                          | `scripts/{dev,deploy,ops}/`                               | Đổi tên snake-case                 |
| Tài liệu root \*.md                  | `docs/`                                                   | Link symbolic trong README nếu cần |
| `backup_markdown/`                   | `docs/reports/legacy/`                                    | Hoặc lưu ngoài repo                |
| `logs/`                              | `logs/`                                                   | Thêm ignore & rotation             |
| Rải rác `.env*`                      | `.env.example` + `infrastructure/env-templates/`          | Không commit biến thật             |

## Chi tiết di trú Python (Automation & AI)

1. Tạo `apps/automation/pyproject.toml`
2. Di chuyển `automation/modules/` → `apps/automation/src/`
3. Cập nhật import tuyệt đối sang namespace `automation` (hoặc đặt package name `automation_app`)
4. Tách script chạy (entrypoints) vào `apps/automation/src/cli/`
5. AI service: gom model/util vào `apps/ai-service/src/`

## Chi tiết di trú Frontend

1. Chọn code base làm nền (có vẻ `shared/` đầy đủ hơn) → đó là `apps/web/`
2. Trích các component generic → `packages/ui/`
3. Trích hooks, utils chung → `packages/shared-utils/`
4. Loại bỏ code trùng trong `src/` cũ sau khi merge
5. Thiết lập build monorepo (pnpm + workspace protocol hoặc turbo)

### Ví dụ `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

## Phân tầng test

- Unit: cạnh file (`*.test.tsx` / `test_*.py`)
- Integration: `/tests/integration/`
- E2E: `/tests/e2e/` (cypress/playwright)
- Performance: `/tests/performance/`

## Chiến lược triển khai theo Phase

| Phase | Phạm vi                                       | Thành công khi            | Rủi ro chính           | Giảm thiểu                       |
| ----- | --------------------------------------------- | ------------------------- | ---------------------- | -------------------------------- |
| 0     | Chuẩn bị                                      | Thêm plan, không đổi code | Thiếu buy-in           | Review nhanh                     |
| 1     | Tạo khung `/apps` & `/packages` & tool config | Build không vỡ            | Sai đường dẫn import   | Dùng alias song song             |
| 2     | Di trú frontend chính                         | App chạy dev OK           | Component thiếu export | Viết export barrel               |
| 3     | Tách shared services JS                       | Test integration pass     | Vòng lặp dependency    | Kiểm tra graph bằng `madge`      |
| 4     | Di trú automation Python                      | Script chạy lại OK        | Import lỗi             | Thêm shim `__init__` + path stub |
| 5     | Di trú AI service                             | Healthcheck OK            | Docker build fail      | Build local trước                |
| 6     | Gom test & chuẩn hoá đặt tên                  | CI pass                   | Thiếu test mapping     | Tạo danh sách test cũ            |
| 7     | Dọn tài liệu & scripts                        | README cập nhật           | Nhầm link cũ           | Symlink tạm (nếu cần)            |

## Rủi ro & Biện pháp

- Gãy import JS: duy trì alias cũ tạm thời qua `tsconfig.paths` / bundler alias
- Gãy script Python: tạo layer tương thích: file thin wrapper ở vị trí cũ import từ vị trí mới (deprecation note)
- Git history khó theo dõi: dùng `git mv` để bảo tồn lịch sử
- PR quá lớn: Mỗi phase 1 PR + checklist
- Đồng thời phát triển tính năng: freeze 1–2 ngày lúc Phase 2 & 4

## Công cụ hỗ trợ đề xuất

- `madge` / `depcruise` kiểm dependency vòng
- `eslint --max-warnings=0` enforced sau khi ổn
- `pre-commit` hook: lint + sort imports (JS + Python `ruff`)
- `just` hoặc `make` trong root để thống nhất lệnh

## Việc cần tạo thêm (scaffold)

- `pnpm-workspace.yaml`
- Root `package.json` (nếu chưa) với scripts orchestration
- `turbo.json` (tùy chọn tăng tốc)
- `pyproject.toml` cho các app Python
- `.editorconfig`, `CODEOWNERS`
- Template `.env.example`

## Kế hoạch Rollback

- Mỗi phase tag git: `restructure-phase-X-start` / `restructure-phase-X-end`
- Nếu lỗi production: revert tag gần nhất, giữ branch refactor để xử lý tiếp

## Checklist Thực Thi Nhanh

- [ ] Tạo thư mục khung rỗng `apps/`, `packages/`, `infrastructure/`, `scripts/`, `docs/`
- [ ] Thêm workspace config
- [ ] Di trú frontend → chạy dev
- [ ] Trích xuất packages + cập nhật import
- [ ] Di trú automation Python
- [ ] Di trú AI service
- [ ] Chuẩn hoá test & scripts
- [ ] Gom tài liệu & cập nhật README

## Ghi chú

Có thể bỏ `sandbox/` nếu muốn tối giản. Nếu backend Node chỉ phục vụ dev proxy → cân nhắc bỏ và chuyển toàn API sang Python (FastAPI) hoặc ngược lại thống nhất Node.

---

Generated plan – sẵn sàng tiến hành Phase 1.
