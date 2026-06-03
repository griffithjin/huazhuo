"""
FastAPI主应用入口
"""
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.utils.response import success_response, error_response

# 导入API路由
from app.api.v1 import auth, users, packages, orders, api_keys, ai_proxy, channels, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时创建表（开发环境）
    if settings.DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} started")
    yield
    
    # 关闭时清理
    await engine.dispose()
    print("👋 Application stopped")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="寰卓 - AI API套餐化平台",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else ["https://tokenhub.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 请求中间件
@app.middleware("http")
async def add_request_middleware(request: Request, call_next):
    """
    全局请求中间件
    - 添加请求ID
    - 记录请求日志
    - 计算响应时间
    - 统一异常处理
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # 将request_id存入request.state
    request.state.request_id = request_id
    
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        # 记录响应时间
        duration = time.time() - start_time
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        
        return response
    except Exception as exc:
        # 全局异常捕获
        duration = time.time() - start_time
        print(f"[{request_id}] Error in {request.method} {request.url.path}: {exc}")
        
        return JSONResponse(
            status_code=500,
            content=error_response(
                code=500,
                message="服务器内部错误",
                data={"request_id": request_id}
            ),
            headers={"X-Request-ID": request_id}
        )


# 注册API路由
api_v1_prefix = "/v1"

app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["认证"])
app.include_router(users.router, prefix=f"{api_v1_prefix}/users", tags=["用户"])
app.include_router(packages.router, prefix=f"{api_v1_prefix}/packages", tags=["套餐"])
app.include_router(orders.router, prefix=f"{api_v1_prefix}/orders", tags=["订单"])
app.include_router(api_keys.router, prefix=f"{api_v1_prefix}/api-keys", tags=["API Keys"])
app.include_router(ai_proxy.router, prefix="/v1", tags=["AI调用"])
app.include_router(channels.router, prefix=f"{api_v1_prefix}/channel", tags=["渠道"])
app.include_router(admin.router, prefix=f"{api_v1_prefix}/admin", tags=["管理后台"])


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return success_response(data={
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": time.time()
    })


@app.get("/")
async def root():
    """API根路径"""
    return success_response(data={
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else None
    })
