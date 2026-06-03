"""
订单接口路由
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from decimal import Decimal
from uuid import UUID

from app.database import get_db
from app.models import Order, Package, User
from app.schemas import CreateOrderRequest, CreateOrderResponse, OrderDetailResponse
from app.services import OrderService, ApiKeyService, ModelRouterService, BillingService, IDGenerator
from app.api.v1.users import get_current_user
from app.utils.response import success_response, error_response
from app.config import settings

router = APIRouter()


@router.post("/")
async def create_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建订单"""
    order_service = OrderService(db)
    
    try:
        order, package = await order_service.create_order(current_user.id, req)
        await db.commit()
    except ValueError as e:
        return error_response(code=400, message=str(e))
    
    # 构建支付参数
    payment_data = {
        "type": req.pay_method,
        "pay_url": None
    }
    
    if req.pay_method == "alipay":
        # TODO: 调用支付宝SDK生成支付参数
        payment_data["params"] = {
            "order_str": f"alipay_sdk=mock_{order.order_no}",
            "out_trade_no": order.order_no,
            "total_amount": str(order.pay_amount)
        }
        payment_data["pay_url"] = f"https://huazhuo.tech/pay/{order.uuid}"
    
    return success_response(data={
        "order": {
            "uuid": str(order.uuid),
            "order_no": order.order_no,
            "status": order.status,
            "pay_status": order.pay_status,
            "total_amount": float(order.total_amount),
            "pay_amount": float(order.pay_amount),
            "pay_method": order.pay_method,
            "expired_at": order.expired_at.isoformat() if order.expired_at else None
        },
        "payment": payment_data
    })


@router.get("/callback/alipay")
async def alipay_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """支付宝支付回调（简化版）"""
    # TODO: 实际验签 + 幂等处理
    params = dict(request.query_params)
    
    order_no = params.get("out_trade_no")
    trade_no = params.get("trade_no", f"ALIPAY_{IDGenerator.generate_request_id()}")
    buyer_id = params.get("buyer_id", "anonymous")
    
    if not order_no:
        return error_response(code=400, message="缺少订单号")
    
    order_service = OrderService(db)
    order = await order_service.mark_order_paid(order_no, trade_no, buyer_id)
    
    if order:
        # 创建API Key并充值
        api_key_service = ApiKeyService(db)
        model_router_service = ModelRouterService(db)
        billing_service = BillingService(db)
        
        # 查询订单项
        from app.models import OrderItem
        result = await db.execute(
            select(OrderItem, Package).join(Package).where(OrderItem.order_id == order.id)
        )
        order_item, package = result.first() or (None, None)
        
        if order_item and package:
            # 创建API Key
            api_key = await api_key_service.create_api_key(
                user_id=order.user_id,
                package=package,
                order_item=order_item
            )
            
            # TODO: 调用ModelRouter创建Key并充值
            # mr_result = await model_router_service.create_key(...)
            # 创建ModelRouterKey映射
            
            # 记录充值交易流水
            await billing_service.create_transaction(
                user_id=order.user_id,
                api_key_id=api_key.id,
                trans_type="recharge",
                amount=order.pay_amount,
                balance_before=Decimal("0"),
                balance_after=order.pay_amount,
                order_id=order.id,
                description=f"购买套餐: {package.name}"
            )
            
            await db.commit()
    
    return success_response(data={
        "order_no": order_no,
        "status": "completed"
    })


@router.get("/{order_uuid}")
async def get_order(
    order_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """查询订单详情"""
    try:
        uid = UUID(order_uuid)
    except ValueError:
        return error_response(code=400, message="无效的订单ID")
    
    result = await db.execute(
        select(Order).where(Order.uuid == uid, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        return error_response(code=404, message="订单不存在")
    
    return success_response(data={
        "uuid": str(order.uuid),
        "order_no": order.order_no,
        "status": order.status,
        "pay_status": order.pay_status,
        "total_amount": float(order.total_amount),
        "pay_amount": float(order.pay_amount),
        "pay_method": order.pay_method,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "items": [],
        "created_at": order.created_at.isoformat()
    })


@router.get("/")
async def list_orders(
    page: int = 1,
    page_size: int = 20,
    status: str = "all",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """查询订单列表"""
    query = select(Order).where(Order.user_id == current_user.id)
    
    if status != "all":
        query = query.where(Order.status == status)
    
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return success_response(data={
        "list": [
            {
                "uuid": str(o.uuid),
                "order_no": o.order_no,
                "status": o.status,
                "pay_status": o.pay_status,
                "total_amount": float(o.total_amount),
                "created_at": o.created_at.isoformat()
            }
            for o in orders
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": len(orders),
            "total_pages": 1
        }
    })
