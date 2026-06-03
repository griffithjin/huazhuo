"""
管理后台接口路由
包含：仪表盘、用户管理、订单管理、套餐管理、渠道管理、Key管理、用量监控、财务、系统配置
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from decimal import Decimal
from typing import Optional

from app.database import get_db
from app.models import (
    User, Channel, Package, ApiKey, Order, Transaction, 
    ModelConfig, AdminUser, SystemConfig, UsageRecord
)
from app.schemas import (
    AdminLoginRequest, DashboardStatsResponse, CreatePackageRequest,
    UpdatePackageRequest, AdjustBalanceRequest, CreateChannelRequest,
    UpdateChannelQuotaRequest, RefundRequest, ModelConfigRequest,
    SystemConfigUpdateRequest, UserListFilter, OrderListFilter,
    ApiKeyListFilter, UsageListFilter
)
from app.services import AuthService, BillingService, mask_phone
from app.utils.response import success_response, error_response

router = APIRouter()


async def get_current_admin(request: Request, db: AsyncSession = Depends(get_db)) -> AdminUser:
    """获取当前管理员"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")
    
    token = auth_header[7:]
    payload = AuthService.decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token无效")
    
    # TODO: 查询管理员表验证
    return AdminUser(id=1, username="admin", role="super_admin")


from fastapi import HTTPException


# ==================== 认证 ====================
@router.post("/auth/login")
async def admin_login(req: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    """管理员登录"""
    result = await db.execute(
        select(AdminUser).where(
            AdminUser.username == req.username,
            AdminUser.status == "active"
        )
    )
    admin = result.scalar_one_or_none()
    
    if not admin or not AuthService.verify_password(req.password, admin.password_hash):
        return error_response(code=401, message="用户名或密码错误")
    
    token = AuthService.create_access_token(admin.id, f"admin:{admin.role}")
    
    return success_response(data={
        "access_token": token,
        "expires_in": 28800,
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "role": admin.role,
            "real_name": admin.real_name
        }
    })


# ==================== 仪表盘 ====================
@router.get("/dashboard")
async def admin_dashboard(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """管理仪表盘"""
    from datetime import datetime, timedelta
    today = datetime.now().date()
    
    # 统计数据
    total_users = await db.execute(select(func.count(User.id)).where(User.deleted_at.is_(None)))
    total_users = total_users.scalar()
    
    return success_response(data={
        "overview": {
            "total_users": total_users or 0,
            "total_orders_today": 0,
            "total_revenue_today": 0.0,
            "total_consumption_today": 0.0,
            "active_api_keys": 0
        },
        "trend": {
            "dates": [],
            "revenue": [],
            "consumption": []
        },
        "top_models": [],
        "recent_orders": []
    })


# ==================== 模型管理 ====================
@router.get("/models")
async def list_models_admin(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """模型列表"""
    result = await db.execute(select(ModelConfig).order_by(ModelConfig.created_at.desc()))
    models = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": m.id,
                "name": m.name,
                "code": m.code,
                "provider": m.provider,
                "pricing_json": m.pricing_json,
                "capabilities": m.capabilities,
                "status": m.status,
                "created_at": m.created_at.isoformat()
            }
            for m in models
        ]
    })


@router.post("/models")
async def create_model(
    req: ModelConfigRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """创建模型配置"""
    model = ModelConfig(
        name=req.name,
        code=req.code,
        provider=req.provider,
        mr_model_id=req.mr_model_id,
        pricing_json=req.pricing_json,
        capabilities=req.capabilities,
        status=req.status
    )
    db.add(model)
    await db.commit()
    
    return success_response(message="创建成功")


# ==================== 套餐管理 ====================
@router.get("/packages")
async def list_packages_admin(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """套餐列表"""
    result = await db.execute(select(Package).order_by(Package.sort_order))
    packages = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": p.id,
                "uuid": str(p.uuid),
                "name": p.name,
                "code": p.code,
                "price": float(p.price),
                "cost_price": float(p.cost_price),
                "status": p.status,
                "is_public": p.is_public,
                "sort_order": p.sort_order,
                "created_at": p.created_at.isoformat()
            }
            for p in packages
        ]
    })


@router.post("/packages")
async def create_package(
    req: CreatePackageRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """创建套餐"""
    package = Package(
        name=req.name,
        code=req.code,
        description=req.description,
        price=req.price,
        cost_price=req.cost_price,
        original_price=req.original_price,
        config_json=req.config_json,
        is_public=req.is_public,
        sort_order=req.sort_order,
        duration_days=req.duration_days
    )
    db.add(package)
    await db.commit()
    
    return success_response(message="创建成功")


@router.put("/packages/{package_id}")
async def update_package(
    package_id: int,
    req: UpdatePackageRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """更新套餐"""
    package = await db.get(Package, package_id)
    if not package:
        return error_response(code=404, message="套餐不存在")
    
    if req.name: package.name = req.name
    if req.description is not None: package.description = req.description
    if req.price: package.price = req.price
    if req.cost_price: package.cost_price = req.cost_price
    if req.status: package.status = req.status
    if req.is_public is not None: package.is_public = req.is_public
    
    await db.commit()
    return success_response(message="更新成功")


# ==================== 用户管理 ====================
@router.get("/users")
async def list_users_admin(
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """用户列表"""
    query = select(User).where(User.deleted_at.is_(None))
    
    if status:
        query = query.where(User.status == status)
    
    query = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": u.id,
                "nickname": u.nickname,
                "phone_masked": "138****8000",  # TODO: 实际脱敏
                "role": u.role,
                "status": u.status,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": len(users)
        }
    })


@router.put("/users/{user_id}/balance")
async def adjust_user_balance(
    user_id: int,
    req: AdjustBalanceRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """调整用户余额"""
    user = await db.get(User, user_id)
    if not user:
        return error_response(code=404, message="用户不存在")
    
    # TODO: 查找用户的默认API Key并调整余额
    
    return success_response(message="余额调整成功")


# ==================== 渠道管理 ====================
@router.get("/channels")
async def list_channels_admin(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """渠道列表"""
    result = await db.execute(select(Channel).where(Channel.deleted_at.is_(None)))
    channels = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": c.id,
                "name": c.name,
                "code": c.code,
                "allocated_quota": float(c.allocated_quota),
                "used_quota": float(c.used_quota),
                "status": c.status
            }
            for c in channels
        ]
    })


@router.post("/channels")
async def create_channel_admin(
    req: CreateChannelRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """创建渠道"""
    from app.services import ChannelService
    channel_service = ChannelService(db)
    channel = await channel_service.create_channel(req)
    await db.commit()
    
    return success_response(message="创建成功")


@router.put("/channels/{channel_id}/quota")
async def adjust_channel_quota(
    channel_id: int,
    req: UpdateChannelQuotaRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """调整渠道额度"""
    from app.services import ChannelService
    channel_service = ChannelService(db)
    
    try:
        channel = await channel_service.adjust_quota(channel_id, req.amount, req.reason)
        await db.commit()
        return success_response(message="额度调整成功")
    except ValueError as e:
        return error_response(code=400, message=str(e))


# ==================== API Key管理 ====================
@router.get("/api-keys")
async def list_api_keys_admin(
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """API Key列表"""
    query = select(ApiKey).where(ApiKey.deleted_at.is_(None))
    
    if status:
        query = query.where(ApiKey.status == status)
    
    query = query.order_by(ApiKey.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    keys = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": k.id,
                "name": k.key_name,
                "prefix": k.key_prefix,
                "balance": float(k.balance),
                "status": k.status,
                "created_at": k.created_at.isoformat()
            }
            for k in keys
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": len(keys)
        }
    })


@router.put("/api-keys/{key_id}/status")
async def update_key_status_admin(
    key_id: int,
    req: dict,  # { "status": str }
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """更新Key状态"""
    key = await db.get(ApiKey, key_id)
    if not key:
        return error_response(code=404, message="Key不存在")
    
    key.status = req.get("status", key.status)
    await db.commit()
    
    return success_response(message="状态更新成功")


# ==================== 订单管理 ====================
@router.get("/orders")
async def list_orders_admin(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """订单列表"""
    query = select(Order).where(Order.deleted_at.is_(None))
    
    if status:
        query = query.where(Order.status == status)
    
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "uuid": str(o.uuid),
                "order_no": o.order_no,
                "total_amount": float(o.total_amount),
                "pay_status": o.pay_status,
                "status": o.status,
                "created_at": o.created_at.isoformat()
            }
            for o in orders
        ]
    })


@router.post("/orders/{order_id}/refund")
async def refund_order_admin(
    order_id: int,
    req: RefundRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """发起退款"""
    order = await db.get(Order, order_id)
    if not order:
        return error_response(code=404, message="订单不存在")
    
    if order.status != "completed":
        return error_response(code=400, message="订单状态不支持退款")
    
    # TODO: 调用支付宝退款
    
    return success_response(message="退款申请已提交")


# ==================== 用量监控 ====================
@router.get("/usage/realtime")
async def realtime_usage(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """实时用量数据"""
    return success_response(data={
        "qps": 0,
        "today_requests": 0,
        "today_tokens": 0,
        "online_users": 0,
        "recent_calls": []
    })


@router.get("/usage/daily")
async def daily_usage(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """日用量统计"""
    return success_response(data={
        "dates": [],
        "requests": [],
        "tokens": [],
        "costs": []
    })


# ==================== 系统配置 ====================
@router.get("/configs")
async def list_configs(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """系统配置列表"""
    result = await db.execute(select(SystemConfig))
    configs = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "id": c.id,
                "config_key": c.config_key,
                "config_value": c.config_value,
                "config_type": c.config_type,
                "description": c.description,
                "is_editable": c.is_editable
            }
            for c in configs
        ]
    })


@router.put("/configs/{config_key}")
async def update_config(
    config_key: str,
    req: SystemConfigUpdateRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """更新系统配置"""
    result = await db.execute(
        select(SystemConfig).where(SystemConfig.config_key == config_key)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        return error_response(code=404, message="配置项不存在")
    
    if not config.is_editable:
        return error_response(code=403, message="该配置项不可编辑")
    
    config.config_value = req.config_value
    if req.description:
        config.description = req.description
    
    await db.commit()
    return success_response(message="配置更新成功")
