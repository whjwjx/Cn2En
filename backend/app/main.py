"""
Cn2En - 中译英智能学习平台
FastAPI 后端服务
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routers import items, settings, wrong_notes, daily_stats, database


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Cn2En API",
    description="中译英智能学习平台后端 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)
app.include_router(settings.router)
app.include_router(wrong_notes.router)
app.include_router(daily_stats.router)
app.include_router(database.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Cn2En API is running"}
