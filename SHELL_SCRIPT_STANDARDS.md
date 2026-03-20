# Shell Script Standards

Muc tieu: tranh lech path va trung lap script trong root.

## Quy dinh vi tri

- `scripts/deploy/` - script deploy that su (`deploy-*.sh`, `serve-build.sh`)
- `scripts/start-stop/` - start/stop service orchestration
- `scripts/setup/` - setup env/IDE/HTTPS
- `scripts/utils/` - check/cleanup/organize/report helpers
- Root (`/*.sh`) - chi giu **wrapper** cho lenh hay dung

## Quy dinh root wrappers

- Root script phai rat ngan, chi:
  1. resolve `SCRIPT_DIR`
  2. `exec` den script canonical trong `scripts/`
- Khong hardcode duong dan may local (`/Users/...`)
- Dat ten theo kebab-case uu tien (`deploy-vercel.sh`)
- Neu can tuong thich ten cu (`deployVercel.sh`, `quick_deploy.sh`) thi giu wrapper alias.

## Boilerplate chuan

```bash
#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/<group>/<script>.sh" "$@"
```

## Dieu kien hoat dong toi thieu

- Script canonical phai:
  - tu verify cwd/project root (co `package.json` neu can)
  - check dependency command (`node`, `npm`, `python3`, ...)
  - in huong dan fix khi fail
- Script ghi log/phat sinh report khong duoc ghi de vao source code.

## Danh sach root wrappers nen giu

- `start.sh`
- `deploy.sh`
- `quick-deploy.sh`
- `deploy-vercel.sh`
- `deployVercel.sh` (alias)
- `deployNetlify.sh` (alias)
- `deployGCP.sh` (alias)
- `serve-build.sh`
- `production_deploy.sh` (alias)
- `quick_deploy.sh` (alias)

## Checklist khi tao script moi

1. Dat script canonical vao `scripts/<group>/`
2. Neu can ergonomic command, tao wrapper root 3-5 dong
3. Cap nhat doc lien quan (`DEVELOPMENT_TOOLS_SUMMARY.md` hoac `DOCUMENTATION_INDEX.md`)
4. Test:
   - run tu root
   - run voi path co dau cach (neu co)
   - sai dependency => thong bao de hieu

## CI guard

- CI check: `scripts/utils/check-root-shell-wrappers.sh`
- Local command: `npm run scripts:guard-wrappers`
- Workflow: `.github/workflows/ci-cd.yml` (job `test`)
- Rule fail neu wrapper root:
  - qua 20 dong
  - thieu `SCRIPT_DIR` hoac `exec`
  - chua logic nang (`npm install`, `pip install`, `curl`, `nohup`, `lsof`, `pkill`, `kill -9`)
