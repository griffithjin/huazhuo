"""
套餐接口路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import Package
from app.schemas import PackageListItem, PackageDetailResponse
from app.utils.response import success_response

router = APIRouter()


@router.get("/")
async def list_packages(
    type: str = "all",
    sort: str = "price_asc",
    db: AsyncSession = Depends(get_db)
):
    """获取套餐列表"""
    query = select(Package).where(Package.status == "active", Package.is_public == True)
    
    if sort == "price_asc":
        query = query.order_by(Package.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Package.price.desc())
    
    result = await db.execute(query)
    packages = result.scalars().all()
    
    # 构建响应（简化版）
    data = []
    for p in packages:
        config = p.config_json or {}
        models = config.get("models", [])
        
        data.append({
            "id": p.id,
            "uuid": str(p.uuid),
            "name": p.name,
            "code": p.code,
            "description": p.description,
            "price": float(p.price),
            "original_price": float(p.original_price) if p.original_price else None,
            "tag": "热销" if p.sort_order == 0 else None,
            "config": {
                "duration_days": p.duration_days,
                "models": [
                    {
                        "model_id": m.get("model_id", ""),
                        "model_name": m.get("model_name", ""),
                        "capability": m.get("capability", "chat"),
                        "limit_display": m.get("limit_display", ""),
                        "description": m.get("description", "")
                    }
                    for m in models
                ],
                "features": config.get("features", [])
            },
            "is_recommended": p.sort_order == 0
        })
    
    return success_response(data={"list": data})


@router.get("/{package_uuid}")
async def get_package(package_uuid: str, db: AsyncSession = Depends(get_db)):
    """获取套餐详情"""
    from uuid import UUID
    try:
        uid = UUID(package_uuid)
    except ValueError:
        return success_response(data=None)
    
    result = await db.execute(select(Package).where(Package.uuid == uid))
    package = result.scalar_one_or_none()
    
    if not package:
        return success_response(data=None)
    
    return success_response(data={
        "id": package.id,
        "uuid": str(package.uuid),
        "name": package.name,
        "code": package.code,
        "description": package.description,
        "price": float(package.price),
        "original_price": float(package.original_price) if package.original_price else None,
        "config": package.config_json,
        "duration_days": package.duration_days,
        "status": package.status,
        "is_public": package.is_public
    })
