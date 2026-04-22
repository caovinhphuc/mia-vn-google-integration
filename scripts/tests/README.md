\_sourced=0
(return 0 2>/dev/null) && \_sourced=1
if [["${BASH_SOURCE[0]-}" == *.md]] || [["${BASH_SOURCE[0]-}" == *.MD]]; then
printf '%s\n' "Lỗi: $(basename "${BASH_SOURCE[0]}") là Markdown, không phải shell script." >&2
printf '%s\n' " → Đừng chạy: bash \"${BASH_SOURCE[0]}\"" >&2
printf '%s\n' " → Mở trong editor / less; chạy test: node scripts/tests/frontend_connection_test.js" >&2
((\_sourced)) && return 1 || exit 1
fi

# 🧪 Test Scripts - React OAS Integration v4.0

> **Test files cho React OAS Integration v4.0**  
> **Ngày cập nhật**: 2025-01-27  
> **Quan trọng:** không chạy `bash scripts/tests/README.md` — file này chỉ để đọc; phần đầu có guard tránh gõ nhầm.

---

## 📁 FILES

### Integration Tests

| File                           | Mục đích                        | Status |
| ------------------------------ | ------------------------------- | ------ |
| `complete_system_test.js`      | Complete system end-to-end test | ✅     |
| `end_to_end_test.js`           | End-to-end testing suite        | ✅     |
| `integration_test.js`          | Integration tests               | ✅     |
| `advanced_integration_test.js` | Advanced integration tests      | ✅     |
| `frontend_connection_test.js`  | Frontend connection tests       | ✅     |

### Specific Tests

| File                    | Mục đích                                        | Status |
| ----------------------- | ----------------------------------------------- | ------ |
| `test_google_sheets.js` | Google Sheets integration tests                 | ✅     |
| `test_google_drive.js`  | Google Drive qua backend `GET /api/drive/files` | ✅     |
| `ws-test.js`            | WebSocket tests                                 | ✅     |

---

## 🚀 CÁCH CHẠY

### Chạy tất cả tests

```bash
# From root directory
node scripts/tests/complete_system_test.js

# Or via NPM
npm run test:complete
```

### Chạy từng test

```bash
# Complete system test
node scripts/tests/complete_system_test.js

# End-to-end test
node scripts/tests/end_to_end_test.js

# Integration test
node scripts/tests/integration_test.js

# Google Drive (cần backend :3001)
npm run test:google-drive
# hoặc: node scripts/tests/test_google_drive.js

# Advanced integration test
node scripts/tests/advanced_integration_test.js

# Frontend connection test
node scripts/tests/frontend_connection_test.js

# Google Sheets test
node scripts/tests/test_google_sheets.js

# WebSocket test
node scripts/tests/ws-test.js
```

---

## ⚙️ REQUIREMENTS

### Dependencies

- Node.js 18+
- npm 8+

### Services Running

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- AI Service: `http://localhost:8000`
- Automation: `http://localhost:8001` (optional)

### Environment

- `.env` file configured
- Google Sheets credentials (for Google Sheets tests)
- API keys (if needed)

---

## 📊 TEST DETAILS

### complete_system_test.js

- Runs all test suites
- Generates comprehensive report
- Overall system score

### end_to_end_test.js

- Simulates user workflows
- Tests complete user journeys
- Validates system integration

### integration_test.js

- Tests service communication
- Validates API endpoints
- Checks service health

### advanced_integration_test.js

- Advanced API tests
- Complex scenarios
- Performance checks

### frontend_connection_test.js

- Frontend connectivity
- CORS configuration
- WebSocket connection
- React components

### test_google_sheets.js

- Google Sheets API connection
- Data read/write
- Authentication

### ws-test.js

- WebSocket connection
- Real-time communication
- Event handling

---

## 📝 NOTES

- All test files are in `scripts/tests/` directory
- Tests can be run from root directory
- Some tests require services to be running
- Check `GUIDE/TESTING.md` for detailed documentation

---

**Last Updated**: 2025-01-27
