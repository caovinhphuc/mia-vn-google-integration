#!/usr/bin/env python3
"""
google-sheets-project — stub tối thiểu (file cũ bị lỗi format Markdown / merge).
Triển khai đầy đủ: dùng backend Node hoặc one_automation_system.
"""
from fastapi import FastAPI

app = FastAPI(
    title="google-sheets-project (stub)",
    description="Placeholder — không dùng làm dịch vụ chính",
    version="0.0.1",
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "google-sheets-project-stub"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8010)
