"""
用户接口路由
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas import UpdateUserRequest, UserInfoResponse
from app.services import AuthService
from app.utils.response import success_response, error_response

router = APIRouter()


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    """获取当前登录用户"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")
    
    token = auth_header[7:]
    payload = AuthService.decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token无效或已过期")
    
    user_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    
    return user


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return success_response(data=UserInfoResponse(
        id=current_user.id,
        uuid=current_user.uuid,
        nickname=current_user.nickname,
        phone_masked="138****8000",  # TODO: 实际脱敏
        role=current_user.role,
        created_at=current_user.created_at
    ))


@router.put("/me")
async def update_me(
    req: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新用户信息"""
    if req.nickname:
        current_user.nickname = req.nickname
    if req.avatar_url:
        current_user.avatar_url = req.avatar_url
    
    await db.commit()
    return success_response(message="更新成功")
