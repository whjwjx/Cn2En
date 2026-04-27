from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.models import Item
from app.schemas import ItemCreate, ItemUpdate, ItemResponse, ImportRequest, ImportResponse

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("/", response_model=List[ItemResponse])
async def get_items(
    skip: int = 0,
    limit: int = 100,
    learned: Optional[bool] = None,
    difficulty: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Item)
    
    if learned is not None:
        query = query.where(Item.learned == learned)
    if difficulty is not None:
        query = query.where(Item.difficulty == difficulty)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/count")
async def get_items_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(Item.id)))
    return {"count": result.scalar()}


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate, db: AsyncSession = Depends(get_db)):
    db_item = Item(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item_update: ItemUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()


@router.post("/bulk-delete", status_code=204)
async def delete_items(item_ids: List[int], db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Item).where(Item.id.in_(item_ids)))
    await db.commit()


@router.post("/import", response_model=ImportResponse)
async def import_items(import_req: ImportRequest, db: AsyncSession = Depends(get_db)):
    lines = import_req.text.strip().split('\n')
    lines = [line for line in lines if '|' in line]
    
    new_items = []
    for line in lines:
        parts = line.split('|')
        if len(parts) >= 2:
            zh_text = parts[0].strip()
            en_standard = parts[1].strip()
            item = Item(zh_text=zh_text, en_standard=en_standard)
            db.add(item)
            new_items.append(item)
    
    await db.commit()
    for item in new_items:
        await db.refresh(item)
    
    return ImportResponse(imported_count=len(new_items), items=new_items)


@router.post("/init-default", response_model=List[ItemResponse])
async def init_default_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(Item.id)))
    count = result.scalar()
    
    if count > 0:
        raise HTTPException(status_code=400, detail="Database already has items")
    
    default_items = [
        Item(zh_text="我喜欢学习新的编程语言。", en_standard="I enjoy learning new programming languages."),
        Item(zh_text="这本书非常有趣，我一口气读完了。", en_standard="This book is very interesting; I read it in one sitting."),
        Item(zh_text="天气真好，我们去散步吧。", en_standard="The weather is nice. Let's go for a walk."),
        Item(zh_text="他每天早上都喝一杯咖啡。", en_standard="He drinks a cup of coffee every morning."),
        Item(zh_text="这个问题很难，我需要更多时间思考。", en_standard="This question is difficult. I need more time to think."),
        Item(zh_text="我的朋友住在纽约。", en_standard="My friend lives in New York."),
        Item(zh_text="她正在准备明天的演讲。", en_standard="She is preparing for tomorrow's speech."),
        Item(zh_text="我们公司去年实现了业绩翻倍。", en_standard="Our company doubled its revenue last year."),
        Item(zh_text="学习英语需要耐心和坚持。", en_standard="Learning English requires patience and persistence."),
        Item(zh_text="周末你有什么计划？", en_standard="What are your plans for the weekend?"),
    ]
    
    for item in default_items:
        db.add(item)
    
    await db.commit()
    for item in default_items:
        await db.refresh(item)
    
    return default_items
