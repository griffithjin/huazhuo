"""
API Key接口路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database import get_db
from app.models import ApiKey
from app.api.v1.users import get_current_user
from app.utils.response import success_response, error_response

router = APIRouter()


@router.get("/")
async def list_api_keys(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取我的API Key列表"""
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.user_id == current_user.id,
            ApiKey.deleted_at.is_(None)
        ).order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": k.id,
                "uuid": str(k.uuid),
                "name": k.key_name,
                "prefix": k.key_prefix,
                "balance": float(k.balance),
                "status": k.status,
                "package_name": None,  # TODO: join查询
                "expires_at": k.expires_at.isoformat() if k.expires_at else None,
                "created_at": k.created_at.isoformat()
            }
            for k in keys
        ]
    })


@router.get("/{key_uuid}")
async def get_api_key_detail(
    key_uuid: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取API Key详情"""
    try:
        uid = UUID(key_uuid)
    except ValueError:
        return error_response(code=400, message="无效的Key ID")
    
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.uuid == uid,
            ApiKey.user_id == current_user.id,
            ApiKey.deleted_at.is_(None)
        )
    )
    key = result.scalar_one_or_none()
    
    if not key:
        return error_response(code=404, message="API Key不存在")
    
    return success_response(data={
        "id": key.id,
        "uuid": str(key.uuid),
        "name": key.key_name,
        "prefix": key.key_prefix,
        "balance": float(key.balance),
        "status": key.status,
        "created_at": key.created_at.isoformat()
    })


@router.put("/{key_uuid}")
async def update_api_key(
    key_uuid: str,
    req: dict,  # { "name": str }
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新Key名称"""
    try:
        uid = UUID(key_uuid)
    except ValueError:
        return error_response(code=400, message="无效的Key ID")
    
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.uuid == uid,
            ApiKey.user_id == current_user.id
        )
    )
    key = result.scalar_one_or_none()
    
    if not key:
        return error_response(code=404, message="API Key不存在")
    
    if req.get("name"):
        key.key_name = req["name"]
    
    await db.commit()
    return success_response(message="更新成功")
