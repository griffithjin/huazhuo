"""
认证接口路由
"""
import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import (
    SMSCodeRequest, PhoneLoginRequest, TokenResponse,
    LoginResponseData, UserInfoResponse, BaseResponse
)
from app.services import AuthService, UserService, mask_phone
from app.utils.response import success_response, error_response
from app.config import settings

router = APIRouter()

# 简单的验证码存储（生产环境使用Redis）
_sms_codes = {}


@router.post("/sms/send")
async def send_sms_code(req: SMSCodeRequest, db: AsyncSession = Depends(get_db)):
    """发送手机验证码"""
    # TODO: 接入阿里云短信服务
    # 模拟发送验证码
    import random
    code = str(random.randint(100000, 999999))
    _sms_codes[req.phone] = {
        "code": code,
        "expires_at": datetime.now().timestamp() + 300,  # 5分钟过期
        "scene": req.scene
    }
    
    print(f"[SMS] Send code {code} to {req.phone} for {req.scene}")
    
    return success_response(data={
        "expire_seconds": 300,
        "interval_seconds": 60
    }, message="验证码已发送")


@router.post("/login/phone")
async def login_by_phone(req: PhoneLoginRequest, db: AsyncSession = Depends(get_db)):
    """手机号+验证码登录/注册"""
    # 验证验证码
    stored = _sms_codes.get(req.phone)
    if not stored or stored["code"] != req.code:
        return error_response(code=400, message="验证码错误或已过期")
    
    if datetime.now().timestamp() > stored["expires_at"]:
        return error_response(code=400, message="验证码已过期")
    
    # 清除已使用的验证码
    del _sms_codes[req.phone]
    
    # 查询或创建用户
    phone_hash = hashlib.sha256(req.phone.encode()).hexdigest()
    user_service = UserService(db)
    user = await user_service.get_by_phone_hash(phone_hash)
    
    if not user:
        # 新用户注册
        # TODO: AES加密手机号
        phone_encrypted = req.phone.encode()  # 临时：实际需要AES加密
        user = await user_service.create_user(
            phone_hash=phone_hash,
            phone_encrypted=phone_encrypted,
            nickname=f"用户{req.phone[-4:]}",
            invite_code=req.invite_code
        )
        await db.commit()
    
    # 生成Token
    access_token = AuthService.create_access_token(user.id, user.role)
    refresh_token = AuthService.create_refresh_token(user.id)
    
    # 更新登录时间
    user.last_login_at = datetime.now()
    await db.commit()
    
    return success_response(data=LoginResponseData(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_EXPIRE_MINUTES * 60,
        user=UserInfoResponse(
            id=user.id,
            uuid=user.uuid,
            nickname=user.nickname,
            phone_masked=mask_phone(req.phone),
            role=user.role,
            created_at=user.created_at
        )
    ), message="登录成功")


@router.post("/token/refresh")
async def refresh_token(request: Request):
    """刷新访问Token"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return error_response(code=401, message="缺少刷新Token")
    
    refresh_token = auth_header[7:]
    payload = AuthService.decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        return error_response(code=401, message="无效的刷新Token")
    
    user_id = int(payload["sub"])
    # TODO: 查询用户状态
    
    new_access_token = AuthService.create_access_token(user_id, payload.get("role", "consumer"))
    
    return success_response(data=TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_EXPIRE_MINUTES * 60
    ))


@router.post("/logout")
async def logout(request: Request):
    """退出登录（前端清除Token即可）"""
    # TODO: 将Token加入黑名单（Redis）
    return success_response(message="退出成功")
