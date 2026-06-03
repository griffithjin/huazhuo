"""
Pydantic Schema定义
用于请求参数校验和响应序列化
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any, Literal
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator


# ==================== 通用响应 ====================

class BaseResponse(BaseModel):
    code: int = 0
    message: str = "success"
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class PaginationData(BaseModel):
    page: int = 1
    page_size: int = 20
    total: int = 0
    total_pages: int = 0
    has_next: bool = False
    has_prev: bool = False


class ListResponseData(BaseModel):
    list: List[Any]
    pagination: PaginationData


def success_response(data: Any = None, message: str = "success") -> dict:
    return {
        "code": 0,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }


def error_response(code: int, message: str, data: Any = None) -> dict:
    return {
        "code": code,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }


# ==================== 认证接口 ====================

class SMSCodeRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1[3-9]\d{9}$")
    scene: Literal["login", "register", "bind", "reset_password"] = "login"


class PhoneLoginRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1[3-9]\d{9}$")
    code: str = Field(..., min_length=4, max_length=6)
    invite_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"


class UserInfoResponse(BaseModel):
    id: int
    uuid: UUID
    nickname: str
    phone_masked: str
    role: str
    channel_name: Optional[str] = None
    created_at: datetime


class LoginResponseData(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user: UserInfoResponse


# ==================== 用户接口 ====================

class UpdateUserRequest(BaseModel):
    nickname: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)


# ==================== 套餐接口 ====================

class PackageModelConfig(BaseModel):
    model_id: str
    model_name: str
    icon: Optional[str] = None
    capability: str
    limit_display: str
    description: Optional[str] = None


class PackageConfigResponse(BaseModel):
    duration_days: Optional[int]
    models: List[PackageModelConfig]
    features: List[str]


class PackageListItem(BaseModel):
    id: int
    uuid: UUID
    name: str
    code: str
    description: Optional[str]
    price: Decimal
    original_price: Optional[Decimal]
    tag: Optional[str] = None
    config: PackageConfigResponse
    is_recommended: bool = False

    model_config = ConfigDict(from_attributes=True)


class PackageDetailResponse(PackageListItem):
    cost_price: Optional[Decimal] = None
    status: str
    is_public: bool
    sort_order: int


# ==================== 订单接口 ====================

class CreateOrderRequest(BaseModel):
    package_uuid: UUID
    quantity: int = Field(default=1, ge=1, le=100)
    pay_method: Literal["alipay"] = "alipay"
    coupon_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    package_name: str
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    api_key_id: Optional[int] = None


class OrderDetailResponse(BaseModel):
    uuid: UUID
    order_no: str
    status: str
    pay_status: str
    total_amount: Decimal
    pay_amount: Decimal
    pay_method: Optional[str]
    paid_at: Optional[datetime]
    items: List[OrderItemResponse]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentData(BaseModel):
    type: str
    params: Optional[Dict[str, Any]] = None
    pay_url: Optional[str] = None


class CreateOrderResponse(BaseModel):
    order: OrderDetailResponse
    payment: PaymentData


# ==================== API Key 接口 ====================

class ApiKeyListItem(BaseModel):
    id: int
    uuid: UUID
    name: str
    prefix: str
    balance: Decimal
    status: str
    package_name: Optional[str] = None
    expires_at: Optional[datetime]
    usage_summary: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiKeyDetailResponse(ApiKeyListItem):
    package_config: Optional[Dict[str, Any]] = None
    usage_trend: Optional[Dict[str, Any]] = None


class UsageLogItem(BaseModel):
    request_id: str
    model_name: str
    request_type: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost: Decimal
    latency_ms: Optional[int]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== AI 调用接口 (兼容 OpenAI) ====================

class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = Field(default=0.7, ge=0, le=2)
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None


class ChatCompletionChoice(BaseModel):
    index: int
    message: Optional[ChatMessage] = None
    delta: Optional[ChatMessage] = None
    finish_reason: Optional[str] = None


class ChatCompletionUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[ChatCompletionChoice]
    usage: ChatCompletionUsage


class BalanceResponse(BaseModel):
    balance: Decimal
    currency: str = "CNY"
    total_used: Decimal


# ==================== 渠道接口 ====================

class ChannelLoginRequest(BaseModel):
    code: str
    password: str


class ChannelDashboardResponse(BaseModel):
    channel: Dict[str, Any]
    today: Dict[str, Any]
    month: Dict[str, Any]
    user_rank: List[Dict[str, Any]]


# ==================== 管理后台接口 ====================

class AdminLoginRequest(BaseModel):
    username: str
    password: str


class DashboardStatsResponse(BaseModel):
    overview: Dict[str, Any]
    trend: Dict[str, Any]
    top_models: List[Dict[str, Any]]
    recent_orders: List[Dict[str, Any]]


class CreatePackageRequest(BaseModel):
    name: str = Field(..., max_length=200)
    code: str = Field(..., max_length=50, pattern=r"^[A-Z][A-Z0-9_]*$")
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    cost_price: Decimal = Field(..., gt=0)
    original_price: Optional[Decimal] = None
    duration_days: Optional[int] = Field(None, ge=1)
    config_json: Dict[str, Any]
    is_public: bool = True
    sort_order: int = 0

    @field_validator('cost_price')
    @classmethod
    def cost_less_than_price(cls, v: Decimal, info) -> Decimal:
        if 'price' in info.data and v >= info.data['price']:
            raise ValueError('成本价必须小于售价')
        return v


class UpdatePackageRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    cost_price: Optional[Decimal] = Field(None, gt=0)
    original_price: Optional[Decimal] = None
    duration_days: Optional[int] = Field(None, ge=1)
    config_json: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None
    sort_order: Optional[int] = None
    status: Optional[Literal["active", "inactive", "archived"]] = None


class AdminUserListItem(BaseModel):
    id: int
    nickname: str
    phone_masked: str
    role: str
    channel_name: Optional[str]
    status: str
    total_consumption: Optional[Decimal] = None
    current_balance: Optional[Decimal] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdjustBalanceRequest(BaseModel):
    adjust_type: Literal["increase", "decrease", "reset"]
    amount: Optional[Decimal] = None
    reason: str = Field(..., min_length=1, max_length=500)
    notify_user: bool = True


class CreateChannelRequest(BaseModel):
    name: str = Field(..., max_length=200)
    code: str = Field(..., max_length=50)
    contact_name: Optional[str] = Field(None, max_length=100)
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    parent_id: Optional[int] = None
    allocated_quota: Decimal = Field(default=Decimal("0"), ge=0)
    commission_rate: Decimal = Field(default=Decimal("0.10"), ge=0, le=1)


class UpdateChannelQuotaRequest(BaseModel):
    adjust_type: Literal["increase", "decrease", "reset"]
    amount: Decimal
    reason: str


class RefundRequest(BaseModel):
    refund_type: Literal["full", "partial"] = "full"
    amount: Optional[Decimal] = None
    reason: str = Field(..., min_length=1, max_length=500)
    notify_user: bool = True


class ModelConfigRequest(BaseModel):
    name: str = Field(..., max_length=200)
    code: str = Field(..., max_length=100)
    provider: str = Field(..., max_length=50)
    mr_model_id: Optional[str] = Field(None, max_length=100)
    pricing_json: Dict[str, Any]
    capabilities: List[str] = []
    status: Literal["active", "inactive", "deprecated"] = "active"


class SystemConfigUpdateRequest(BaseModel):
    config_value: str
    description: Optional[str] = None


# ==================== 分页请求 ====================

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class OrderListFilter(PaginationParams):
    status: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    user_id: Optional[int] = None
    channel_id: Optional[int] = None


class UserListFilter(PaginationParams):
    keyword: Optional[str] = None
    status: Optional[str] = None
    role: Optional[str] = None
    channel_id: Optional[int] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None


class ApiKeyListFilter(PaginationParams):
    keyword: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[int] = None
    package_id: Optional[int] = None


class UsageListFilter(PaginationParams):
    user_id: Optional[int] = None
    api_key_id: Optional[int] = None
    model_name: Optional[str] = None
    request_type: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
