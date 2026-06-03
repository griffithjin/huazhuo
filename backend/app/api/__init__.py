"""
API路由包初始化
"""
from fastapi import APIRouter

# 导入各模块路由
from . import auth, users, packages, orders, api_keys, ai_proxy, channels, admin

__all__ = ["auth", "users", "packages", "orders", "api_keys", "ai_proxy", "channels", "admin"]
