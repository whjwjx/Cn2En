from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.models import Item, Settings, WrongNote, DailyStat
from app.schemas import ItemResponse, SettingsResponse, WrongNoteResponse, DailyStatResponse

router = APIRouter(prefix="/api/database", tags=["database"])


def serialize_datetime(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


@router.get("/export")
async def export_database(db: AsyncSession = Depends(get_db)):
    items_result = await db.execute(select(Item))
    items = items_result.scalars().all()
    
    settings_result = await db.execute(select(Settings))
    settings = settings_result.scalars().all()
    
    wrong_notes_result = await db.execute(select(WrongNote))
    wrong_notes = wrong_notes_result.scalars().all()
    
    daily_stats_result = await db.execute(select(DailyStat))
    daily_stats = daily_stats_result.scalars().all()
    
    return {
        "version": "1.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "items": [
            {
                "zh_text": item.zh_text,
                "en_standard": item.en_standard,
                "en_optimized": item.en_optimized,
                "learned": item.learned,
                "learn_count": item.learn_count,
                "last_learned": serialize_datetime(item.last_learned),
                "segments": item.segments,
                "difficulty": item.difficulty,
                "error_count": item.error_count,
            }
            for item in items
        ],
        "settings": [
            {
                "key": s.key,
                "value": s.value,
            }
            for s in settings
        ],
        "wrong_notes": [
            {
                "item_id": wn.item_id,
                "wrong_count": wn.wrong_count,
            }
            for wn in wrong_notes
        ],
        "daily_stats": [
            {
                "date": ds.date,
                "practiced": ds.practiced,
                "correct": ds.correct,
            }
            for ds in daily_stats
        ],
    }


class ImportDataRequest:
    pass


@router.post("/import")
async def import_database(data: dict, db: AsyncSession = Depends(get_db)):
    if "items" not in data:
        raise HTTPException(status_code=400, detail="Invalid import data: missing 'items'")
    
    items_data = data.get("items", [])
    settings_data = data.get("settings", [])
    wrong_notes_data = data.get("wrong_notes", [])
    daily_stats_data = data.get("daily_stats", [])
    
    imported = {"items": 0, "settings": 0, "wrong_notes": 0, "daily_stats": 0}
    
    await db.execute(delete(Item))
    await db.execute(delete(Settings))
    await db.execute(delete(WrongNote))
    await db.execute(delete(DailyStat))
    await db.commit()
    
    for item_data in items_data:
        item = Item(**item_data)
        db.add(item)
        imported["items"] += 1
    
    for setting_data in settings_data:
        setting = Settings(**setting_data)
        db.add(setting)
        imported["settings"] += 1
    
    for wn_data in wrong_notes_data:
        wn = WrongNote(**wn_data)
        db.add(wn)
        imported["wrong_notes"] += 1
    
    for ds_data in daily_stats_data:
        ds = DailyStat(**ds_data)
        db.add(ds)
        imported["daily_stats"] += 1
    
    await db.commit()
    
    return {
        "message": "Import successful",
        "imported": imported,
    }
