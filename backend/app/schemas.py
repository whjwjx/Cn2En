"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ItemBase(BaseModel):
    zh_text: str
    en_standard: Optional[str] = None
    en_optimized: Optional[str] = None
    learned: bool = False
    learn_count: int = 0
    segments: Optional[list] = None
    difficulty: Optional[str] = None
    error_count: int = 0


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    zh_text: Optional[str] = None
    en_standard: Optional[str] = None
    en_optimized: Optional[str] = None
    learned: Optional[bool] = None
    learn_count: Optional[int] = None
    last_learned: Optional[datetime] = None
    segments: Optional[list] = None
    difficulty: Optional[str] = None
    error_count: Optional[int] = None


class ItemResponse(ItemBase):
    id: int
    last_learned: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettingsBase(BaseModel):
    key: str
    value: str | bool | int | float | list | dict


class SettingsUpdateRequest(BaseModel):
    value: str | bool | int | float | list | dict


class SettingsResponse(SettingsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class WrongNoteResponse(BaseModel):
    id: int
    item_id: int
    added_at: datetime
    wrong_count: int

    class Config:
        from_attributes = True


class DailyStatBase(BaseModel):
    date: str
    practiced: int = 0
    correct: int = 0


class DailyStatResponse(DailyStatBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class ImportRequest(BaseModel):
    text: str


class ImportResponse(BaseModel):
    imported_count: int
    items: List[ItemResponse]
