"""
Database models
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from datetime import datetime, timezone

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    zh_text = Column(String, nullable=False)
    en_standard = Column(String, nullable=True)
    en_optimized = Column(String, nullable=True)
    learned = Column(Boolean, default=False)
    learn_count = Column(Integer, default=0)
    last_learned = Column(DateTime, nullable=True)
    segments = Column(JSON, nullable=True)
    difficulty = Column(String, nullable=True)
    error_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, nullable=False, unique=True)
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class WrongNote(Base):
    __tablename__ = "wrong_notes"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, nullable=False, index=True)
    added_at = Column(DateTime, default=utc_now)
    wrong_count = Column(Integer, default=1)


class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, unique=True)
    practiced = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
