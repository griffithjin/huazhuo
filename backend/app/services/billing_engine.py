"""
计费引擎 - 实时扣费、超额预警、自动停用
"""
import json
import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy import select, update, func, and_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import ApiKey, ModelRouterKey, UsageRecord, Transaction, ModelConfig, User
from app.services.model_router_client import get_model_router_client


class BillingEngine:
    """
    计费引擎
    - 实时扣费（乐观锁）
    - 超额预警
    - 自动停用
    - 异步同步 ModelRouter 余额
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.low_balance_threshold = Decimal(str(settings.LOW_BALANCE_THRESHOLD))
        self.mr_client = get_model_router_client()

    async def calculate_cost(self, model_code: str, input_tokens: int,
                              output_tokens: int, request_type: str,
                              duration_sec: Optional[Decimal] = None,
                              image_count: int = 0) -> Decimal:
        """计算单次调用费用"""
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
            input_price = Decimal(str(pricing.get("input_per_1m", 0)))
            output_price = Decimal(str(pricing.get("output_per_1m", 0)))
            cost = (Decimal(input_tokens) / Decimal("1000000")) * input_price + \
                   (Decimal(output_tokens) / Decimal("1000000")) * output_price
        elif billing_mode == "duration" and duration_sec:
            per_second = Decimal(str(pricing.get("per_second_720p", 0)))
            cost = duration_sec * per_second
        elif billing_mode == "count" and image_count:
            per_image = Decimal(str(pricing.get("per_image", 0)))
            cost = Decimal(image_count) * per_image

        return cost.quantize(Decimal("0.000001"))

    async def deduct_balance(self, api_key_id: int, amount: Decimal) -> Tuple[bool, Decimal]:
        """实时扣费（乐观锁）"""
        result = await self.db.execute(
            update(ApiKey).where(
                ApiKey.id == api_key_id,
                ApiKey.balance >= amount,
                ApiKey.status == "active"
            ).values(
                balance=ApiKey.balance - amount,
                total_consumed=ApiKey.total_consumed + amount,
                request_count=ApiKey.request_count + 1
            ).returning(ApiKey.balance)
        )
        new_balance = result.scalar_one_or_none()
        if new_balance is not None:
            return True, new_balance
        return False, Decimal("0")

    async def pre_deduct(self, api_key_id: int, estimated_cost: Decimal) -> Tuple[bool, Decimal]:
        """预扣费（用于流式请求前预扣）"""
        return await self.deduct_balance(api_key_id, estimated_cost)

    async def refund_unused(self, api_key_id: int, pre_deducted: Decimal,
                             actual_cost: Decimal) -> Decimal:
        """流式请求结束后，退还预扣与实际消费的差额"""
        refund_amount = pre_deducted - actual_cost
        if refund_amount > Decimal("0"):
            result = await self.db.execute(
                update(ApiKey).where(ApiKey.id == api_key_id).values(
                    balance=ApiKey.balance + refund_amount,
                    total_consumed=ApiKey.total_consumed - refund_amount
                ).returning(ApiKey.balance)
            )
            return result.scalar_one_or_none() or Decimal("0")
        return Decimal("0")

    async def check_balance_warning(self, api_key_id: int) -> Dict[str, Any]:
        """检查余额预警状态"""
        result = await self.db.execute(
            select(ApiKey).where(ApiKey.id == api_key_id)
        )
        api_key = result.scalar_one_or_none()
        if not api_key:
            return {"need_warning": False, "balance": Decimal("0"), "threshold": self.low_balance_threshold, "auto_disabled": False}

        need_warning = api_key.balance <= self.low_balance_threshold
        auto_disabled = False

        if api_key.balance <= Decimal("0") and api_key.status == "active":
            api_key.status = "suspended"
            auto_disabled = True
            await self._sync_disable_mr_key(api_key)

        return {
            "need_warning": need_warning,
            "balance": api_key.balance,
            "threshold": self.low_balance_threshold,
            "auto_disabled": auto_disabled
        }

    async def _sync_disable_mr_key(self, api_key: ApiKey) -> bool:
        """同步停用 ModelRouter Key"""
        if not api_key.model_router_key:
            return False
        mr_key = api_key.model_router_key
        if mr_key.mr_client_id and mr_key.mr_key_id:
            try:
                return await self.mr_client.update_key_status(
                    client_id=mr_key.mr_client_id,
                    key_id=mr_key.mr_key_id,
                    status="disabled"
                )
            except Exception as e:
                print(f"[BillingEngine] Failed to disable MR key: {e}")
        return False

    async def record_usage(self, api_key_id: int, user_id: int,
                           request_id: str, model_name: str, model_id: str,
                           request_type: str, input_tokens: int,
                           output_tokens: int, cost_amount: Decimal,
                           latency_ms: int, status: str = "success",
                           error_code: Optional[str] = None,
                           request_detail: Optional[Dict] = None,
                           response_detail: Optional[Dict] = None) -> UsageRecord:
        """记录用量明细"""
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
            error_code=error_code,
            request_detail=request_detail,
            response_detail=response_detail
        )
        self.db.add(usage)
        await self.db.flush()
        return usage

    async def create_transaction(self, user_id: int, api_key_id: Optional[int],
                                  trans_type: str, amount: Decimal,
                                  balance_before: Decimal, balance_after: Decimal,
                                  order_id: Optional[int] = None,
                                  source_id: Optional[str] = None,
                                  source_type: Optional[str] = None,
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
            source_id=source_id,
            source_type=source_type,
            description=description
        )
        self.db.add(tx)
        await self.db.flush()
        return tx

    async def recharge(self, api_key_id: int, user_id: int,
                        amount: Decimal, order_id: Optional[int] = None,
                        description: str = "") -> Tuple[bool, Decimal]:
        """充值（余额增加）"""
        result = await self.db.execute(
            select(ApiKey).where(ApiKey.id == api_key_id)
        )
        api_key = result.scalar_one_or_none()
        if not api_key:
            return False, Decimal("0")

        balance_before = api_key.balance
        balance_after = balance_before + amount
        api_key.balance = balance_after
        api_key.total_recharged = api_key.total_recharged + amount

        if api_key.status == "suspended" and balance_after > Decimal("0"):
            api_key.status = "active"

        await self.db.flush()
        await self.create_transaction(
            user_id=user_id,
            api_key_id=api_key_id,
            trans_type="recharge",
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            order_id=order_id,
            description=description
        )
        return True, balance_after

    async def sync_mr_balance(self, api_key_id: int) -> Optional[Decimal]:
        """同步 ModelRouter 余额到本地"""
        result = await self.db.execute(
            select(ApiKey).where(ApiKey.id == api_key_id)
            .options(selectinload(ApiKey.model_router_key))
        )
        api_key = result.scalar_one_or_none()
        if not api_key or not api_key.model_router_key:
            return None
        mr_key = api_key.model_router_key
        if not mr_key.mr_client_id or not mr_key.mr_key_id:
            return None
        try:
            mr_balance = await self.mr_client.get_key_balance(
                client_id=mr_key.mr_client_id,
                key_id=mr_key.mr_key_id
            )
            if mr_balance is not None:
                mr_key.mr_balance = mr_balance
                mr_key.mr_balance_synced_at = datetime.now()
                await self.db.flush()
                return mr_balance
        except Exception as e:
            print(f"[BillingEngine] sync_mr_balance error: {e}")
        return None

    async def get_daily_usage(self, api_key_id: int, date: Optional[datetime] = None) -> Dict[str, Any]:
        """获取某API Key的日用量统计"""
        if date is None:
            date = datetime.now()
        start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        result = await self.db.execute(
            select(
                func.count(UsageRecord.id).label("request_count"),
                func.coalesce(func.sum(UsageRecord.input_tokens), 0).label("input_tokens"),
                func.coalesce(func.sum(UsageRecord.output_tokens), 0).label("output_tokens"),
                func.coalesce(func.sum(UsageRecord.total_tokens), 0).label("total_tokens"),
                func.coalesce(func.sum(UsageRecord.cost_amount), Decimal("0")).label("total_cost")
            ).where(
                UsageRecord.api_key_id == api_key_id,
                UsageRecord.created_at >= start,
                UsageRecord.created_at < end,
                UsageRecord.status == "success"
            )
        )
        row = result.one()
        return {
            "date": start.strftime("%Y-%m-%d"),
            "request_count": row.request_count or 0,
            "input_tokens": int(row.input_tokens or 0),
            "output_tokens": int(row.output_tokens or 0),
            "total_tokens": int(row.total_tokens or 0),
            "total_cost": Decimal(str(row.total_cost or 0))
        }

    async def get_usage_trend(self, api_key_id: int, days: int = 7) -> List[Dict[str, Any]]:
        """获取最近 N 天用量趋势"""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        trends = []
        for i in range(days - 1, -1, -1):
            date = today - timedelta(days=i)
            daily = await self.get_daily_usage(api_key_id, date)
            trends.append(daily)
        return trends

    async def get_realtime_stats(self) -> Dict[str, Any]:
        """获取实时统计数据（管理后台仪表盘）"""
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        requests_result = await self.db.execute(
            select(func.count(UsageRecord.id)).where(
                UsageRecord.created_at >= today_start,
                UsageRecord.status == "success"
            )
        )
        today_requests = requests_result.scalar() or 0
        tokens_result = await self.db.execute(
            select(func.coalesce(func.sum(UsageRecord.total_tokens), 0)).where(
                UsageRecord.created_at >= today_start,
                UsageRecord.status == "success"
            )
        )
        today_tokens = int(tokens_result.scalar() or 0)
        cost_result = await self.db.execute(
            select(func.coalesce(func.sum(UsageRecord.cost_amount), Decimal("0"))).where(
                UsageRecord.created_at >= today_start,
                UsageRecord.status == "success"
            )
        )
        today_cost = Decimal(str(cost_result.scalar() or 0))
        active_keys_result = await self.db.execute(
            select(func.count(ApiKey.id)).where(
                ApiKey.status == "active",
                ApiKey.deleted_at.is_(None)
            )
        )
        active_keys = active_keys_result.scalar() or 0
        warning_keys_result = await self.db.execute(
            select(func.count(ApiKey.id)).where(
                ApiKey.status == "active",
                ApiKey.balance <= self.low_balance_threshold,
                ApiKey.deleted_at.is_(None)
            )
        )
        warning_keys = warning_keys_result.scalar() or 0
        recent_result = await self.db.execute(
            select(UsageRecord).order_by(UsageRecord.created_at.desc()).limit(10)
        )
        recent_records = recent_result.scalars().all()
        return {
            "today_requests": today_requests,
            "today_tokens": today_tokens,
            "today_cost": float(today_cost),
            "active_api_keys": active_keys,
            "warning_api_keys": warning_keys,
            "recent_calls": [
                {
                    "request_id": r.request_id,
                    "model_name": r.model_name,
                    "total_tokens": r.total_tokens,
                    "cost": float(r.cost_amount),
                    "latency_ms": r.latency_ms,
                    "status": r.status,
                    "created_at": r.created_at.isoformat()
                }
                for r in recent_records
            ]
        }

    async def batch_sync_mr_balances(self) -> int:
        """批量同步所有活跃API Key的 ModelRouter 余额"""
        result = await self.db.execute(
            select(ApiKey).where(
                ApiKey.status == "active",
                ApiKey.deleted_at.is_(None)
            ).options(selectinload(ApiKey.model_router_key))
        )
        api_keys = result.scalars().all()
        synced_count = 0
        for api_key in api_keys:
            if api_key.model_router_key:
                try:
                    await self.sync_mr_balance(api_key.id)
                    synced_count += 1
                except Exception as e:
                    print(f"[BillingEngine] Batch sync failed for key {api_key.id}: {e}")
        return synced_count

    async def auto_suspend_expired_keys(self) -> int:
        """自动停用已过期（到期时间已到）的 API Key"""
        now = datetime.now()
        result = await self.db.execute(
            update(ApiKey).where(
                ApiKey.expires_at.isnot(None),
                ApiKey.expires_at < now,
                ApiKey.status == "active"
            ).values(
                status="expired"
            ).returning(ApiKey.id)
        )
        expired_ids = result.scalars().all()
        for key_id in expired_ids:
            result = await self.db.execute(
                select(ApiKey).where(ApiKey.id == key_id)
                .options(selectinload(ApiKey.model_router_key))
            )
            api_key = result.scalar_one_or_none()
            if api_key:
                await self._sync_disable_mr_key(api_key)
        await self.db.flush()
        return len(expired_ids)
