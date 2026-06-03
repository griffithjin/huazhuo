"""
数据库模型定义
对应数据库设计文档
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    BigInteger, String, Boolean, DateTime, Integer, 
    Numeric, Text, JSON, ForeignKey, CheckConstraint,
    UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, INET
from app.database import Base


def generate_uuid() -> uuid.UUID:
    return uuid.uuid4()


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    phone_encrypted: Mapped[bytes] = mapped_column(Text, nullable=False)
    phone_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255))
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    nickname: Mapped[str] = mapped_column(String(100), default="用户")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    role: Mapped[str] = mapped_column(String(20), default="consumer")
    status: Mapped[str] = mapped_column(String(20), default="active")
    
    channel_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("channels.id", ondelete="SET NULL"))
    
    password_hash: Mapped[Optional[str]] = mapped_column(String(255))
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    login_ip: Mapped[Optional[str]] = mapped_column(INET)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # 关系
    channel: Mapped[Optional["Channel"]] = relationship("Channel", back_populates="users")
    api_keys: Mapped[List["ApiKey"]] = relationship("ApiKey", back_populates="user", lazy="selectin")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user", lazy="selectin")


class Channel(Base):
    """渠道表"""
    __tablename__ = "channels"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    contact_name: Mapped[Optional[str]] = mapped_column(String(100))
    contact_phone_encrypted: Mapped[Optional[bytes]] = mapped_column(Text)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255))
    
    parent_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("channels.id", ondelete="SET NULL"))
    level: Mapped[int] = mapped_column(Integer, default=1)
    
    allocated_quota: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    used_quota: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    available_quota: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    
    commission_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), default=Decimal("0.10"))
    
    status: Mapped[str] = mapped_column(String(20), default="pending")
    audit_remark: Mapped[Optional[str]] = mapped_column(Text)
    
    login_password_hash: Mapped[Optional[str]] = mapped_column(String(255))
    api_secret: Mapped[Optional[str]] = mapped_column(String(255))
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    users: Mapped[List["User"]] = relationship("User", back_populates="channel", lazy="selectin")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="channel", lazy="selectin")


class Package(Base):
    """套餐表"""
    __tablename__ = "packages"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    cost_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    original_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 4))
    
    config_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    duration_days: Mapped[Optional[int]] = mapped_column(Integer)
    
    status: Mapped[str] = mapped_column(String(20), default="active")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    api_keys: Mapped[List["ApiKey"]] = relationship("ApiKey", back_populates="package", lazy="selectin")


class ApiKey(Base):
    """API Key表"""
    __tablename__ = "api_keys"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    package_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("packages.id", ondelete="SET NULL"))
    
    key_name: Mapped[str] = mapped_column(String(100), default="默认Key")
    key_prefix: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    key_secret_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    key_secret_encrypted: Mapped[Optional[bytes]] = mapped_column(Text)
    
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal("0"))
    total_recharged: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal("0"))
    total_consumed: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal("0"))
    
    token_limit: Mapped[Optional[int]] = mapped_column(BigInteger)
    token_used: Mapped[int] = mapped_column(BigInteger, default=0)
    request_limit: Mapped[Optional[int]] = mapped_column(BigInteger)
    request_count: Mapped[int] = mapped_column(BigInteger, default=0)
    
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), default="active")
    source: Mapped[str] = mapped_column(String(50), default="purchase")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    user: Mapped["User"] = relationship("User", back_populates="api_keys")
    package: Mapped[Optional["Package"]] = relationship("Package", back_populates="api_keys")
    model_router_key: Mapped[Optional["ModelRouterKey"]] = relationship("ModelRouterKey", back_populates="api_key", uselist=False, lazy="selectin")


class ModelRouterKey(Base):
    """ModelRouter Key映射表"""
    __tablename__ = "model_router_keys"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    
    api_key_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    mr_key_id: Mapped[str] = mapped_column(String(100), nullable=False)
    mr_key_secret: Mapped[Optional[str]] = mapped_column(String(255))
    mr_client_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    
    mr_balance: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal("0"))
    mr_balance_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    mr_status: Mapped[str] = mapped_column(String(20), default="active")
    mr_config_json: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    api_key: Mapped["ApiKey"] = relationship("ApiKey", back_populates="model_router_key")


class Order(Base):
    """订单表"""
    __tablename__ = "orders"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    order_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    channel_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("channels.id"))
    
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    pay_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    
    pay_method: Mapped[Optional[str]] = mapped_column(String(20))
    pay_status: Mapped[str] = mapped_column(String(20), default="pending")
    
    alipay_trade_no: Mapped[Optional[str]] = mapped_column(String(128))
    alipay_buyer_id: Mapped[Optional[str]] = mapped_column(String(128))
    
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expired_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    status: Mapped[str] = mapped_column(String(20), default="pending")
    
    refund_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    refund_reason: Mapped[Optional[str]] = mapped_column(Text)
    refunded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    source: Mapped[str] = mapped_column(String(50), default="web")
    device_info: Mapped[Optional[dict]] = mapped_column(JSONB)
    remark: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    user: Mapped["User"] = relationship("User", back_populates="orders")
    channel: Mapped[Optional["Channel"]] = relationship("Channel", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", lazy="selectin")


class OrderItem(Base):
    """订单明细表"""
    __tablename__ = "order_items"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    package_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("packages.id"), nullable=False)
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    
    api_key_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("api_keys.id"))
    activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    order: Mapped["Order"] = relationship("Order", back_populates="items")


class Transaction(Base):
    """交易流水表"""
    __tablename__ = "transactions"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    api_key_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("api_keys.id"))
    
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    
    balance_before: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    balance_after: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    
    order_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("orders.id"))
    source_id: Mapped[Optional[str]] = mapped_column(String(100))
    source_type: Mapped[Optional[str]] = mapped_column(String(50))
    
    description: Mapped[Optional[str]] = mapped_column(Text)
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UsageRecord(Base):
    """用量记录表"""
    __tablename__ = "usage_records"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[uuid.UUID] = mapped_column(PGUUID, default=generate_uuid, unique=True, nullable=False)
    
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    api_key_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("api_keys.id"), nullable=False)
    
    request_id: Mapped[str] = mapped_column(String(100), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_id: Mapped[Optional[str]] = mapped_column(String(100))
    
    request_type: Mapped[str] = mapped_column(String(50), nullable=False)
    input_tokens: Mapped[int] = mapped_column(BigInteger, default=0)
    output_tokens: Mapped[int] = mapped_column(BigInteger, default=0)
    total_tokens: Mapped[int] = mapped_column(BigInteger, default=0)
    
    duration_sec: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), default=Decimal("0"))
    image_count: Mapped[int] = mapped_column(Integer, default=0)
    
    cost_amount: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal("0"))
    cost_per_1k: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 6))
    
    request_detail: Mapped[Optional[dict]] = mapped_column(JSONB)
    response_detail: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    status: Mapped[str] = mapped_column(String(20), default="success")
    error_code: Mapped[Optional[str]] = mapped_column(String(50))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ModelConfig(Base):
    """模型配置表"""
    __tablename__ = "model_configs"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    
    mr_model_id: Mapped[Optional[str]] = mapped_column(String(100))
    pricing_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    capabilities: Mapped[Optional[List[str]]] = mapped_column(JSONB, default=list)
    
    status: Mapped[str] = mapped_column(String(20), default="active")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AdminUser(Base):
    """管理员表"""
    __tablename__ = "admin_users"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    role: Mapped[str] = mapped_column(String(30), default="operator")
    
    real_name: Mapped[Optional[str]] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    
    status: Mapped[str] = mapped_column(String(20), default="active")
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_login_ip: Mapped[Optional[str]] = mapped_column(INET)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SystemConfig(Base):
    """系统配置表"""
    __tablename__ = "system_configs"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    config_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    config_value: Mapped[Optional[str]] = mapped_column(Text)
    config_type: Mapped[str] = mapped_column(String(20), default="string")
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_editable: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
