from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models import WrongNote
from app.schemas import WrongNoteResponse

router = APIRouter(prefix="/api/wrong-notes", tags=["wrong_notes"])


@router.get("/", response_model=List[WrongNoteResponse])
async def get_wrong_notes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WrongNote))
    return result.scalars().all()


@router.get("/check/{item_id}")
async def check_wrong_note(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WrongNote).where(WrongNote.item_id == item_id))
    wrong_note = result.scalar_one_or_none()
    return {"is_wrong": wrong_note is not None}


@router.post("/{item_id}", response_model=WrongNoteResponse, status_code=201)
async def add_wrong_note(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WrongNote).where(WrongNote.item_id == item_id))
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.wrong_count += 1
        await db.commit()
        await db.refresh(existing)
        return existing
    
    wrong_note = WrongNote(item_id=item_id)
    db.add(wrong_note)
    await db.commit()
    await db.refresh(wrong_note)
    return wrong_note


@router.delete("/{item_id}", status_code=204)
async def remove_wrong_note(item_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(WrongNote).where(WrongNote.item_id == item_id))
    await db.commit()


@router.delete("/all", status_code=204)
async def clear_wrong_notes(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(WrongNote))
    await db.commit()
