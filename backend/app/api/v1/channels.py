"""
渠道接口路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Channel, User, Order
from app.schemas import ChannelLoginRequest, ChannelDashboardResponse
from app.services import ChannelService, AuthService
from app.utils.response import success_response, error_response

router = APIRouter()


@router.post("/auth/login")
async def channel_login(req: ChannelLoginRequest, db: AsyncSession = Depends(get_db)):
    """渠道代理商登录"""
    channel_service = ChannelService(db)
    channel = await channel_service.get_by_code(req.code)
    
    if not channel or channel.status != "active":
        return error_response(code=401, message="渠道编码或密码错误")
    
    # TODO: 验证密码
    
    # 生成Token
    token = AuthService.create_access_token(
        channel.id, 
        "channel",
        expires_delta=None  # 长期有效或自定义
    )
    
    return success_response(data={
        "access_token": token,
        "expires_in": 2592000,  # 30天
        "channel": {
            "id": channel.id,
            "name": channel.name,
            "code": channel.code
        }
    })


@router.get("/dashboard")
async def channel_dashboard(
    request,
    db: AsyncSession = Depends(get_db)
):
    """渠道仪表盘数据"""
    # TODO: 鉴权获取当前渠道
    channel_id = 1  # mock
    
    channel = await db.get(Channel, channel_id)
    if not channel:
        return error_response(code=404, message="渠道不存在")
    
    # 统计数据
    from datetime import datetime, timedelta
    today = datetime.now().date()
    
    # 今日数据
    # TODO: 实际SQL查询
    
    return success_response(data={
        "channel": {
            "name": channel.name,
            "code": channel.code,
            "allocated_quota": float(channel.allocated_quota),
            "used_quota": float(channel.used_quota),
            "available_quota": float(channel.available_quota)
        },
        "today": {
            "new_users": 0,
            "orders_count": 0,
            "orders_amount": 0.0,
            "consumption": 0.0
        },
        "month": {
            "new_users": 0,
            "orders_count": 0,
            "orders_amount": 0.0,
            "consumption": 0.0
        },
        "user_rank": []
    })
