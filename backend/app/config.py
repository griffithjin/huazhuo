from typing import List, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    
    # 基础配置
    APP_NAME: str = "寰卓"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: str = "development"
    
    # 服务配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 数据库
    DATABASE_URL: str = "postgresql://tokenhub:tokenhub@localhost:5432/tokenhub"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_POOL_SIZE: int = 50
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # JWT
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 10080  # 7天
    JWT_REFRESH_EXPIRE_DAYS: int = 30
    
    # 加密
    AES_KEY: str = "your-aes-key-32-bytes-long!"
    
    # 阿里云 ModelRouter
    ALIYUN_ACCESS_KEY: str = ""
    ALIYUN_SECRET: str = ""
    MODEL_ROUTER_ENDPOINT: str = "https://api.aliyun.com"
    MODEL_ROUTER_DISCOUNT: float = 0.70  # 折扣率
    
    # 支付宝
    ALIPAY_APP_ID: str = ""
    ALIPAY_APP_PRIVATE_KEY: str = ""  # 应用私钥
    ALIPAY_PUBLIC_KEY: str = ""  # 支付宝公钥
    ALIPAY_SANDBOX: bool = True
    ALIPAY_NOTIFY_URL: str = "https://api.tokenhub.com/v1/orders/callback/alipay"
    ALIPAY_RETURN_URL: str = "https://tokenhub.com/pay/success"
    
    # 阿里云短信
    SMS_ACCESS_KEY: str = ""
    SMS_SECRET: str = ""
    SMS_SIGN_NAME: str = "目前科技"
    SMS_TEMPLATE_CODE_LOGIN: str = "SMS_12345678"
    
    # 业务配置
    ORDER_EXPIRE_MINUTES: int = 30
    LOW_BALANCE_THRESHOLD: float = 5.0
    DEFAULT_COMMISSION_RATE: float = 0.10
    
    # 限流
    RATE_LIMIT_PER_MINUTE: int = 100  # 单IP
    API_KEY_RATE_LIMIT_PER_MINUTE: int = 1000  # 单Key
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
