"""
ModelRouter HTTP 对接完整实现
阿里云 ModelRouter API 对接 - 包含签名、创建Key、充值、查询余额
"""
import json
import hmac
import hashlib
import base64
import uuid
import httpx
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Dict, Any, List
from urllib.parse import quote, urlencode

from app.config import settings


class AliyunModelRouterSigner:
    """阿里云 HMAC-SHA256 签名算法"""
    
    @staticmethod
    def percent_encode(s: str) -> str:
        """URL编码（阿里云特殊规则）"""
        res = quote(s, safe='')
        res = res.replace('+', '%20')
        res = res.replace('*', '%2A')
        res = res.replace('%7E', '~')
        return res
    
    @staticmethod
def sign(access_key_secret: str, method: str, params: Dict[str, Any]) -> str:
        """
        生成阿里云API签名
        
        参考: https://help.aliyun.com/document_detail/315526.html
        """
        # 1. 构造规范化查询字符串
        sorted_params = sorted(params.items())
        canonical_query_string = '&'.join(
            f"{AliyunModelRouterSigner.percent_encode(k)}={AliyunModelRouterSigner.percent_encode(str(v))}"
            for k, v in sorted_params if v is not None
        )
        
        # 2. 构造待签名字符串
        string_to_sign = f"{method}&{AliyunModelRouterSigner.percent_encode('/')}&{AliyunModelRouterSigner.percent_encode(canonical_query_string)}"
        
        # 3. 计算签名
        key = f"{access_key_secret}&"
        signature = base64.b64encode(
            hmac.new(key.encode('utf-8'), string_to_sign.encode('utf-8'), hashlib.sha1).digest()
        ).decode('utf-8')
        
        return signature


class ModelRouterClient:
    """ModelRouter HTTP 客户端"""
    
    def __init__(self):
        self.access_key = settings.ALIYUN_ACCESS_KEY
        self.secret = settings.ALIYUN_SECRET
        self.endpoint = settings.MODEL_ROUTER_ENDPOINT.rstrip('/')
        self.discount = settings.MODEL_ROUTER_DISCOUNT  # 折扣率
        self.timeout = 30.0
        
    def _build_signed_headers(self, method: str, path: str,
                               body: Optional[Dict] = None) -> Dict[str, str]:
        """
        构建带签名的请求头（阿里云标准签名）
        """
        # 时间戳
        now = datetime.now(timezone.utc)
        date_str = now.strftime('%a, %d %b %Y %H:%M:%S GMT')
        
        # 基础头
        headers = {
            'Date': date_str,
            'Content-Type': 'application/json; charset=utf-8',
            'x-acs-signature-method': 'HMAC-SHA256',
            'x-acs-signature-version': '1.0',
        }
        
        # 使用 x-acs-accesskey-id 认证
        headers['x-acs-accesskey-id'] = self.access_key
        headers['x-acs-signature-nonce'] = str(uuid.uuid4())
        
        # 构建签名（简化版：实际生产使用阿里云官方SDK签名）
        # 这里实现标准 HMAC-SHA256 签名
        string_to_sign = f"{method}\napplication/json\n\n{date_str}\n{path}"
        signature = base64.b64encode(
            hmac.new(self.secret.encode(), string_to_sign.encode(), hashlib.sha256).digest()
        ).decode()
        
        headers['Authorization'] = f"acs {self.access_key}:{signature}"
        
        return headers
    
    def _build_common_params(self, action: str, version: str = "2024-01-01") -> Dict[str, str]:
        """构建公共参数"""
        return {
            "Format": "JSON",
            "Version": version,
            "AccessKeyId": self.access_key,
            "SignatureMethod": "HMAC-SHA1",
            "Timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "SignatureVersion": "1.0",
            "SignatureNonce": str(uuid.uuid4()),
            "Action": action,
        }
    
    async def create_key(self, client_id: int, name: str,
                         quota: Decimal, models: List[str],
                         rate_limit: Optional[int] = None) -> Dict[str, Any]:
        """
        调用 ModelRouter 创建 API Key
        POST /api/v1/modelRouter/open/clients/{client_id}/keys
        
        Args:
            client_id: 客户ID（阿里云分配的）
            name: Key名称
            quota: 额度
            models: 可用模型列表
            rate_limit: 限速（QPS）
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/keys"
        url = f"{self.endpoint}{path}"
        
        payload = {
            "name": name,
            "quota": float(quota),
            "models": models,
            "rateLimit": rate_limit or 10,
            "status": "active"
        }
        
        headers = self._build_signed_headers("POST", path, payload)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if result.get("success"):
                    data = result.get("data", {})
                    return {
                        "key_id": data.get("id"),
                        "key_secret": data.get("secret"),
                        "client_id": client_id,
                        "balance": quota,
                        "status": "active",
                        "raw": data
                    }
                else:
                    return {
                        "error": result.get("errorMessage", "创建失败"),
                        "code": result.get("errorCode", "UNKNOWN")
                    }
        except httpx.HTTPError as e:
            return {"error": f"HTTP错误: {e}", "code": "HTTP_ERROR"}
        except Exception as e:
            return {"error": f"请求异常: {e}", "code": "REQUEST_ERROR"}
    
    async def create_balance_transaction(self, client_id: int,
                                          transaction_type: str,
                                          amount: Decimal,
                                          remark: str) -> Dict[str, Any]:
        """
        调用 ModelRouter 创建余额交易（充值/扣费）
        POST /api/v1/modelRouter/open/clients/{client_id}/balance/transactions
        
        transaction_type: "recharge" | "deduct"
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/balance/transactions"
        url = f"{self.endpoint}{path}"
        
        # 充值时应用折扣
        actual_amount = float(amount)
        if transaction_type == "recharge":
            actual_amount = float(amount * Decimal(str(self.discount)))
        
        payload = {
            "type": transaction_type,
            "amount": actual_amount,
            "currency": "CNY",
            "balanceType": "amount",
            "enableBalance": True,
            "remark": remark
        }
        
        headers = self._build_signed_headers("POST", path, payload)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if result.get("success"):
                    data = result.get("data", {})
                    return {
                        "request_id": result.get("requestId"),
                        "success": True,
                        "data": {
                            "id": data.get("id"),
                            "client_id": data.get("clientId"),
                            "balance": Decimal(str(data.get("balance", 0))),
                            "balance_type": data.get("balanceType"),
                            "enable_balance": data.get("enableBalance")
                        }
                    }
                else:
                    return {
                        "request_id": result.get("requestId"),
                        "success": False,
                        "error": result.get("errorMessage", "交易失败"),
                        "code": result.get("errorCode")
                    }
        except httpx.HTTPError as e:
            return {"success": False, "error": f"HTTP错误: {e}", "code": "HTTP_ERROR"}
        except Exception as e:
            return {"success": False, "error": f"请求异常: {e}", "code": "REQUEST_ERROR"}
    
    async def get_key_balance(self, client_id: int,
                             key_id: str) -> Optional[Decimal]:
        """
        查询 Key 余额
        GET /api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/balance
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/balance"
        url = f"{self.endpoint}{path}"
        
        headers = self._build_signed_headers("GET", path)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if result.get("success"):
                    data = result.get("data", {})
                    return Decimal(str(data.get("balance", 0)))
                return None
        except Exception as e:
            print(f"[ModelRouter] get_key_balance error: {e}")
            return None
    
    async def get_client_balance(self, client_id: int) -> Optional[Decimal]:
        """
        查询客户总余额
        GET /api/v1/modelRouter/open/clients/{client_id}/balance
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/balance"
        url = f"{self.endpoint}{path}"
        
        headers = self._build_signed_headers("GET", path)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if result.get("success"):
                    data = result.get("data", {})
                    return Decimal(str(data.get("balance", 0)))
                return None
        except Exception as e:
            print(f"[ModelRouter] get_client_balance error: {e}")
            return None
    
    async def get_key_usage(self, client_id: int,
                           key_id: str,
                           start_date: str,
                           end_date: str) -> Dict[str, Any]:
        """
        查询 Key 用量统计
        GET /api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/usage
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/usage"
        url = f"{self.endpoint}{path}"
        
        params = {"startDate": start_date, "endDate": end_date}
        headers = self._build_signed_headers("GET", path)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if result.get("success"):
                    data = result.get("data", {})
                    return {
                        "total_requests": data.get("totalRequests", 0),
                        "total_tokens": data.get("totalTokens", 0),
                        "total_cost": Decimal(str(data.get("totalCost", 0))),
                        "details": data.get("details", [])
                    }
                return {"total_requests": 0, "total_tokens": 0, "total_cost": Decimal("0")}
        except Exception as e:
            print(f"[ModelRouter] get_key_usage error: {e}")
            return {"total_requests": 0, "total_tokens": 0, "total_cost": Decimal("0")}
    
    async def get_key_detail(self, client_id: int,
                              key_id: str) -> Optional[Dict[str, Any]]:
        """
        查询 Key 详情
        GET /api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}"
        url = f"{self.endpoint}{path}"
        
        headers = self._build_signed_headers("GET", path)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if result.get("success"):
                    return result.get("data")
                return None
        except Exception as e:
            print(f"[ModelRouter] get_key_detail error: {e}")
            return None
    
    async def update_key_status(self, client_id: int,
                                 key_id: str,
                                 status: str) -> bool:
        """
        更新 Key 状态（启用/停用）
        PUT /api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/status
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/status"
        url = f"{self.endpoint}{path}"
        
        payload = {"status": status}
        headers = self._build_signed_headers("PUT", path, payload)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.put(url, json=payload, headers=headers)
                return response.status_code == 200
        except Exception as e:
            print(f"[ModelRouter] update_key_status error: {e}")
            return False
    
    async def proxy_chat_completion(self, client_id: int,
                                     key_id: str,
                                     payload: Dict[str, Any]) -> httpx.Response:
        """
        代理转发聊天补全请求到 ModelRouter
        POST /api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/chat/completions
        
        返回原始 Response 以便流式处理
        """
        path = f"/api/v1/modelRouter/open/clients/{client_id}/keys/{key_id}/chat/completions"
        url = f"{self.endpoint}{path}"
        
        headers = self._build_signed_headers("POST", path, payload)
        headers["Content-Type"] = "application/json"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            return response


# 全局单例
_mr_client: Optional[ModelRouterClient] = None


def get_model_router_client() -> ModelRouterClient:
    global _mr_client
    if _mr_client is None:
        _mr_client = ModelRouterClient()
    return _mr_client
