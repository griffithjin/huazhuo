"""n核心服务层（整合版）n"""
"""
import uuid
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy import select, update, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from jose import jwt, JWTError

from app.config import settings
from app.models import (
    User, Channel, Package, ApiKey, ModelRouterKey, Order,
    OrderItem, Transaction, UsageRecord, ModelConfig, AdminUser
)
from app.schemas import (
    CreateOrderRequest, CreatePackageRequest, AdjustBalanceRequest,
    CreateChannelRequest, RefundRequest
)

# ========== 子模块导入（新功能） ==========
from app.services.billing_engine import BillingEngine
from app.services.model_router_client import get_model_router_client, ModelRouterClient
from app.services.alipay_service import get_alipay_service, AlipayService
from app.services.sms_service import get_sms_service, SMSService

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



# ==================== 认证服务 ====================

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(user_id: int, role: str, expires_delta: Optional[timedelta] = None) -> str:
        if expires_delta is None:
            expires_delta = timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
        
        to_encode = {
            "sub": str(user_id),
            "role": role,
            "type": "access",
            "exp": datetime.utcnow() + expires_delta,
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def create_refresh_token(user_id: int) -> str:
        to_encode = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS),
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None


# ==================== 用户服务 ====================

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_phone_hash(self, phone_hash: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.phone_hash == phone_hash, User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()
    
    async def create_user(self, phone_hash: str, phone_encrypted: bytes, 
                         nickname: str = "用户", invite_code: Optional[str] = None) -> User:
        # 检查邀请码（渠道编码）
        channel_id = None
        if invite_code:
            channel_result = await self.db.execute(
                select(Channel).where(Channel.code == invite_code)
            )
            channel = channel_result.scalar_one_or_none()
            if channel:
                channel_id = channel.id
        
        user = User(
            phone_hash=phone_hash,
            phone_encrypted=phone_encrypted,
            nickname=nickname,
            channel_id=channel_id
        )
        self.db.add(user)
        await self.db.flush()
        return user


# ==================== 订单与支付服务 ====================

class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_order(self, user_id: int, req: CreateOrderRequest) -> Tuple[Order, Package]:
        # 查询套餐
        package_result = await self.db.execute(
            select(Package).where(Package.uuid == str(req.package_uuid), Package.status == "active")
        )
        package = package_result.scalar_one_or_none()
        if not package:
            raise ValueError("套餐不存在或已下架")
        
        # 生成订单号
        order_no = f"ORD{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(6).upper()}"
        
        # 计算金额
        total_amount = package.price * req.quantity
        pay_amount = total_amount  # 暂时不支持优惠券
        
        order = Order(
            order_no=order_no,
            user_id=user_id,
            total_amount=total_amount,
            pay_amount=pay_amount,
            pay_method=req.pay_method,
            expired_at=datetime.now() + timedelta(minutes=settings.ORDER_EXPIRE_MINUTES)
        )
        self.db.add(order)
        await self.db.flush()
        
        # 创建订单明细
        order_item = OrderItem(
            order_id=order.id,
            package_id=package.id,
            quantity=req.quantity,
            unit_price=package.price,
            total_amount=pay_amount
        )
        self.db.add(order_item)
        
        return order, package
    
    async def get_order_by_no(self, order_no: str) -> Optional[Order]:
        result = await self.db.execute(
            select(Order).where(Order.order_no == order_no)
        )
        return result.scalar_one_or_none()
    
    async def mark_order_paid(self, order_no: str, alipay_trade_no: str, 
                             alipay_buyer_id: str) -> Optional[Order]:
        order = await self.get_order_by_no(order_no)
        if not order or order.pay_status == "paid":
            return order
        
        order.pay_status = "paid"
        order.status = "completed"
        order.paid_at = datetime.now()
        order.alipay_trade_no = alipay_trade_no
        order.alipay_buyer_id = alipay_buyer_id
        
        await self.db.flush()
        return order


# ==================== API Key 服务 ====================

class ApiKeyService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def generate_key_pair(self) -> Tuple[str, str]:
        """生成API Key前缀和Secret"""
        prefix = f"tk-{secrets.token_urlsafe(8)[:12]}"
        secret = secrets.token_urlsafe(32)
        return prefix, secret
    
    async def create_api_key(self, user_id: int, package: Package, 
                            order_item: OrderItem) -> ApiKey:
        prefix, secret = self.generate_key_pair()
        
        api_key = ApiKey(
            user_id=user_id,
            package_id=package.id,
            key_name=f"{package.name} - 默认Key",
            key_prefix=prefix,
            key_secret_hash=AuthService.hash_password(secret),
            # key_secret_encrypted 需要AES加密存储原始secret（用于转发给ModelRouter）
            balance=package.price,  # 初始余额为套餐售价
            total_recharged=package.price,
            token_limit=package.config_json.get("total_tokens") if package.config_json else None,
            expires_at=datetime.now() + timedelta(days=package.duration_days) if package.duration_days else None,
            source="purchase"
        )
        self.db.add(api_key)
        await self.db.flush()
        
        # 更新订单项
        order_item.api_key_id = api_key.id
        order_item.activated_at = datetime.now()
        order_item.expires_at = api_key.expires_at
        
        return api_key
    
    async def get_by_prefix(self, prefix: str) -> Optional[ApiKey]:
        result = await self.db.execute(
            select(ApiKey).where(
                ApiKey.key_prefix == prefix,
                ApiKey.status == "active",
                ApiKey.deleted_at.is_(None)
            ).options(selectinload(ApiKey.model_router_key))
        )
        return result.scalar_one_or_none()
    
    async def deduct_balance(self, api_key_id: int, amount: Decimal) -> bool:
        """扣减余额，使用乐观锁防止并发超扣"""
        result = await self.db.execute(
            update(ApiKey).where(
                ApiKey.id == api_key_id,
                ApiKey.balance >= amount,
                ApiKey.status == "active"
            ).values(
                balance=ApiKey.balance - amount,
                total_consumed=ApiKey.total_consumed + amount
            ).returning(ApiKey.balance)
        )
        new_balance = result.scalar_one_or_none()
        return new_balance is not None


# ==================== ModelRouter 服务 ====================

class ModelRouterService:
    """阿里云ModelRouter对接服务 - 代理到独立模块"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = get_model_router_client()
    
    async def create_key(self, client_id: int, name: str, quota: Decimal,
                         models: List[str]) -> Dict[str, Any]:
        """调用ModelRouter创建API Key"""
        return await self.client.create_key(client_id, name, quota, models)
    
    async def create_balance_transaction(self, client_id: int, 
                                         transaction_type: str, 
                                         amount: Decimal,
                                         remark: str) -> Dict[str, Any]:
        """调用ModelRouter创建余额交易（充值）"""
        return await self.client.create_balance_transaction(
            client_id, transaction_type, amount, remark
        )
    
    async def get_key_usage(self, client_id: int, key_id: str,
                           start_date: str, end_date: str) -> Dict[str, Any]:
        """查询Key用量"""
        return await self.client.get_key_usage(client_id, key_id, start_date, end_date)
    
    async def get_key_balance(self, client_id: int, key_id: str) -> Optional[Decimal]:
        """查询Key余额"""
        return await self.client.get_key_balance(client_id, key_id)
    
    async def get_key_detail(self, client_id: int, key_id: str) -> Optional[Dict[str, Any]]:
        """查询Key详情"""
        return await self.client.get_key_detail(client_id, key_id)
    
    async def update_key_status(self, client_id: int, key_id: str, status: str) -> bool:
        """更新Key状态"""
        return await self.client.update_key_status(client_id, key_id, status)
    
    async def proxy_chat_completion(self, client_id: int, key_id: str, payload: Dict[str, Any]):
        """代理转发聊天补全请求"""
        return await self.client.proxy_chat_completion(client_id, key_id, payload)


# ==================== 计费服务 ====================

class BillingService:
    """实时计费引擎"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def calculate_cost(self, model_code: str, input_tokens: int, 
                           output_tokens: int, request_type: str,
                           duration_sec: Optional[Decimal] = None,
                           image_count: int = 0) -> Decimal:
        """
        计算单次调用费用
        """
        # 查询模型定价
        result = await self.db.execute(
            select(ModelConfig).where(ModelConfig.code == model_code)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"模型不存在: {model_code}")
        
        pricing = model.pricing_json or {}
        billing_mode = pricing.get("billing_mode", "token")
        
        cost = Decimal("0")
        
        if billing_mode == "token":
            input_price = Decimal(str(pricing.get("input_per_1m", 0)))  # 元/百万Token
            output_price = Decimal(str(pricing.get("output_per_1m", 0)))
            cost = (Decimal(input_tokens) / Decimal("1000000")) * input_price + \
                   (Decimal(output_tokens) / Decimal("1000000")) * output_price
        
        elif billing_mode == "duration" and duration_sec:
            # 视频按秒计费，默认720P
            per_second = Decimal(str(pricing.get("per_second_720p", 0)))
            cost = duration_sec * per_second
        
        elif billing_mode == "count" and image_count:
            per_image = Decimal(str(pricing.get("per_image", 0)))
            cost = Decimal(image_count) * per_image
        
        return cost.quantize(Decimal("0.000001"))
    
    async def record_usage(self, api_key_id: int, user_id: int,
                          request_id: str, model_name: str, model_id: str,
                          request_type: str, input_tokens: int, 
                          output_tokens: int, cost_amount: Decimal,
                          latency_ms: int, status: str = "success",
                          error_code: Optional[str] = None) -> UsageRecord:
        """记录用量"""
        usage = UsageRecord(
            user_id=user_id,
            api_key_id=api_key_id,
            request_id=request_id,
            model_name=model_name,
            model_id=model_id,
            request_type=request_type,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_amount=cost_amount,
            latency_ms=latency_ms,
            status=status,
            error_code=error_code
        )
        self.db.add(usage)
        await self.db.flush()
        return usage
    
    async def create_transaction(self, user_id: int, api_key_id: Optional[int],
                                 trans_type: str, amount: Decimal,
                                 balance_before: Decimal, balance_after: Decimal,
                                 order_id: Optional[int] = None,
                                 description: str = "") -> Transaction:
        """创建交易流水"""
        tx = Transaction(
            user_id=user_id,
            api_key_id=api_key_id,
            type=trans_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            order_id=order_id,
            description=description
        )
        self.db.add(tx)
        await self.db.flush()
        return tx


# ==================== 渠道服务 ====================

class ChannelService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_code(self, code: str) -> Optional[Channel]:
        result = await self.db.execute(
            select(Channel).where(Channel.code == code, Channel.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()
    
    async def create_channel(self, req: CreateChannelRequest) -> Channel:
        channel = Channel(
            name=req.name,
            code=req.code,
            contact_name=req.contact_name,
            contact_email=req.contact_email,
            parent_id=req.parent_id,
            allocated_quota=req.allocated_quota,
            commission_rate=req.commission_rate
        )
        # 手机号加密存储
        if req.contact_phone:
            # 这里需要加密
            pass
        
        self.db.add(channel)
        await self.db.flush()
        return channel
    
    async def adjust_quota(self, channel_id: int, amount: Decimal, 
                          reason: str) -> Channel:
        channel = await self.db.get(Channel, channel_id)
        if not channel:
            raise ValueError("渠道不存在")
        
        channel.allocated_quota += amount
        await self.db.flush()
        return channel


# ==================== 工具函数 ====================

class IDGenerator:
    @staticmethod
    def generate_order_no() -> str:
        return f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(3).upper()}"
    
    @staticmethod
    def generate_request_id() -> str:
        return f"req_{datetime.now().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}"


def mask_phone(phone: str) -> str:
    """手机号脱敏"""
    if len(phone) == 11:
        return phone[:3] + "****" + phone[-4:]
    return phone[:2] + "****" + phone[-2:] if len(phone) > 4 else "****"


def sign_channel_request(channel_secret: str, method: str, path: str, 
                         timestamp: str, body: str = "") -> str:
    """渠道接口HMAC签名"""
    message = f"{method}\n{path}\n{timestamp}\n{body}"
    return hmac.new(
        channel_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
