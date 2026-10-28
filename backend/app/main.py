"""FastAPI 应用入口。

CScope 后端（当前负责 Attention 实验的模型计算）：
- /api/v1/health     健康检查（供前端降级探测）
- /api/v1/attention  获取指定层/头的注意力权重（真实计算）

运行：
    uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(title="CScope API", version="0.2.0")

# 允许前端本地开发跨域（Vite 5173）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root():
    return {"service": "CScope API", "docs": "/docs"}
