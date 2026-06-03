"""
AI代理路由 - 兼容OpenAI API格式
核心功能：请求鉴权、计费、转发到ModelRouter
"""
import json
import time
from decimal import Decimal
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import ChatCompletionRequest, ChatCompletionResponse, BalanceResponse
from app.services import ApiKeyService, BillingService, ModelRouterService, AuthService, IDGenerator
from app.utils.response import success_response, error_response
from app.models import ApiKey, ModelConfig

router = APIRouter()


async def get_api_key_from_header(request: Request, db: AsyncSession) -> ApiKey:
    """从请求头获取并验证API Key"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer tk-"):
        raise HTTPException(status_code=401, detail="无效的API Key格式")
    
    # 提取Key前缀
    key_prefix = auth_header[7:19]  # "Bearer tk-xxx..."
    
    # 查询数据库
    api_key_service = ApiKeyService(db)
    api_key = await api_key_service.get_by_prefix(key_prefix)
    
    if not api_key:
        raise HTTPException(status_code=401, detail="API Key不存在")
    
    if api_key.status != "active":
        raise HTTPException(status_code=403, detail="API Key已停用或过期")
    
    return api_key


@router.post("/chat/completions")
async def chat_completions(
    req: ChatCompletionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    聊天补全接口（兼容OpenAI）
    核心流程：鉴权 → 计费预估 → 转发ModelRouter → 异步计费
    """
    # 1. 鉴权
    try:
        api_key = await get_api_key_from_header(request, db)
    except HTTPException as e:
        return error_response(code=e.status_code, message=e.detail)
    
    # 2. 余额预检（文本调用简单预检）
    if api_key.balance <= 0:
        return error_response(code=600, message="余额不足，请及时充值", data={
            "balance": float(api_key.balance),
            "required": 0.01
        })
    
    # 3. 查询模型配置
    result = await db.execute(
        select(ModelConfig).where(ModelConfig.code == req.model)
    )
    model_config = result.scalar_one_or_none()
    if not model_config or model_config.status != "active":
        return error_response(code=404, message=f"模型不存在或未启用: {req.model}")
    
    request_id = IDGenerator.generate_request_id()
    
    # 4. 转发请求到ModelRouter
    # TODO: 实际HTTP转发到阿里云ModelRouter
    # 这里模拟响应
    
    if req.stream:
        # SSE流式响应
        async def generate_stream() -> AsyncGenerator[str, None]:
            # 模拟流式输出
            content_parts = ["你好", "！", "有", "什么", "我", "可以", "帮助", "你", "的", "吗", "？"]
            total_output_tokens = 0
            
            # 发送角色
            yield f"data: {json.dumps({'id': request_id, 'object': 'chat.completion.chunk', 'choices': [{'delta': {'role': 'assistant'}}]})}\n\n"
            
            for part in content_parts:
                total_output_tokens += 1
                yield f"data: {json.dumps({'id': request_id, 'object': 'chat.completion.chunk', 'choices': [{'delta': {'content': part}}]})}\n\n"
            
            # 发送结束标记
            yield f"data: {json.dumps({'id': request_id, 'object': 'chat.completion.chunk', 'choices': [{'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
            yield "data: [DONE]\n\n"
            
            # 异步计费（实际应在流结束后）
            # TODO: 实际计费
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={"X-Request-ID": request_id}
        )
    
    else:
        # 非流式响应
        # 模拟响应内容
        output_text = "你好！有什么我可以帮助你的吗？"
        input_tokens = sum(len(m.content) for m in req.messages) // 4  # 粗略估算
        output_tokens = len(output_text) // 4
        
        # 计费
        billing_service = BillingService(db)
        try:
            cost = await billing_service.calculate_cost(
                model_code=req.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                request_type="chat"
            )
        except Exception as e:
            cost = Decimal("0.001")
        
        # 扣费
        api_key_service = ApiKeyService(db)
        success = await api_key_service.deduct_balance(api_key.id, cost)
        if not success:
            return error_response(code=600, message="余额不足")
        
        # 记录用量
        await billing_service.record_usage(
            api_key_id=api_key.id,
            user_id=api_key.user_id,
            request_id=request_id,
            model_name=model_config.name,
            model_id=req.model,
            request_type="chat",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_amount=cost,
            latency_ms=850
        )
        
        # 记录交易流水
        await billing_service.create_transaction(
            user_id=api_key.user_id,
            api_key_id=api_key.id,
            trans_type="consumption",
            amount=-cost,
            balance_before=api_key.balance + cost,
            balance_after=api_key.balance,
            description=f"模型调用: {model_config.name}"
        )
        
        await db.commit()
        
        return success_response(data={
            "id": request_id,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": req.model,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": output_text
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": input_tokens,
                "completion_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens
            }
        })


@router.get("/models")
async def list_models(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """获取可用模型列表"""
    try:
        api_key = await get_api_key_from_header(request, db)
    except HTTPException:
        return error_response(code=401, message="鉴权失败")
    
    # 查询启用的模型
    from sqlalchemy import select
    result = await db.execute(
        select(ModelConfig).where(ModelConfig.status == "active")
    )
    models = result.scalars().all()
    
    return success_response(data={
        "object": "list",
        "data": [
            {
                "id": m.code,
                "object": "model",
                "created": int(m.created_at.timestamp()) if m.created_at else 0,
                "owned_by": m.provider
            }
            for m in models
        ]
    })


@router.get("/balance")
async def get_balance(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """查询API Key余额"""
    try:
        api_key = await get_api_key_from_header(request, db)
    except HTTPException as e:
        return error_response(code=e.status_code, message=e.detail)
    
    return success_response(data=BalanceResponse(
        balance=api_key.balance,
        currency="CNY",
        total_used=api_key.total_consumed
    ))


# 为了上面的select导入
from sqlalchemy import select
