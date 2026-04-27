from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import date

from app.database import get_db
from app.models import DailyStat
from app.schemas import DailyStatResponse

router = APIRouter(prefix="/api/daily-stats", tags=["daily_stats"])


@router.get("/today", response_model=DailyStatResponse)
async def get_today_stats(db: AsyncSession = Depends(get_db)):
    today = date.today().isoformat()
    result = await db.execute(select(DailyStat).where(DailyStat.date == today))
    stat = result.scalar_one_or_none()
    
    if not stat:
        stat = DailyStat(date=today, practiced=0, correct=0)
        db.add(stat)
        await db.commit()
        await db.refresh(stat)
    
    return stat


@router.get("/{date_str}", response_model=DailyStatResponse)
async def get_daily_stats(date_str: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyStat).where(DailyStat.date == date_str))
    stat = result.scalar_one_or_none()
    if not stat:
        raise HTTPException(status_code=404, detail="Stats not found for this date")
    return stat


@router.put("/update", response_model=DailyStatResponse)
async def update_daily_stats(
    is_correct: bool,
    db: AsyncSession = Depends(get_db)
):
    today = date.today().isoformat()
    result = await db.execute(select(DailyStat).where(DailyStat.date == today))
    stat = result.scalar_one_or_none()
    
    if not stat:
        stat = DailyStat(date=today, practiced=0, correct=0)
        db.add(stat)
    
    stat.practiced += 1
    if is_correct:
        stat.correct += 1
    
    await db.commit()
    await db.refresh(stat)
    return stat


@router.get("/", response_model=List[DailyStatResponse])
async def get_all_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyStat).order_by(DailyStat.date.desc()))
    return result.scalars().all()
