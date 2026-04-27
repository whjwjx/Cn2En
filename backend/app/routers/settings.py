from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models import Settings as SettingsModel
from app.schemas import SettingsResponse, SettingsUpdateRequest

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/", response_model=List[SettingsResponse])
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SettingsModel))
    return result.scalars().all()


@router.get("/{key}", response_model=SettingsResponse)
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SettingsModel).where(SettingsModel.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.put("/{key}", response_model=SettingsResponse)
async def update_setting(key: str, body: SettingsUpdateRequest, db: AsyncSession = Depends(get_db)):
    value = body.value
    result = await db.execute(select(SettingsModel).where(SettingsModel.key == key))
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.value = value
    else:
        setting = SettingsModel(key=key, value=value)
        db.add(setting)
    
    await db.commit()
    await db.refresh(setting)
    return setting


@router.delete("/{key}", status_code=204)
async def delete_setting(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SettingsModel).where(SettingsModel.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    await db.delete(setting)
    await db.commit()


@router.delete("/all", status_code=204)
async def delete_all_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SettingsModel))
    settings = result.scalars().all()
    for setting in settings:
        await db.delete(setting)
    await db.commit()
