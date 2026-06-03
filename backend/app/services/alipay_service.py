"""
支付宝SDK集成服务
基于 python-alipay-sdk 实现支付、回调验签、退款
"""
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any

from alipay import AliPay, DCAliPay

from app.config import settings


class AlipayService:
    """支付宝支付服务"""
    
    def __init__(self):
        self.alipay = AliPay(
            appid=settings.ALIPAY_APP_ID,
            app_notify_url=settings.ALIPAY_NOTIFY_URL,
            app_private_key_string=settings.ALIPAY_APP_PRIVATE_KEY,
            alipay_public_key_string=settings.ALIPAY_PUBLIC_KEY,
            sign_type="RSA2",
            debug=settings.ALIPAY_SANDBOX,
            verbose=False
        )
        self.gateway = "https://openapi.alipay.com/gateway.do"
        if settings.ALIPAY_SANDBOX:
            self.gateway = "https://openapi.alipaydev.com/gateway.do"
    
    def generate_order_str(self, order_no: str, amount: Decimal,
                           subject: str = "寰卓套餐购买",
                           body: str = "",
                           timeout_express: str = "30m",
                           product_code: str = "QUICK_MSECURITY_PAY") -> str:
        """
        生成App支付订单字符串（用于移动端唤起支付宝SDK）
        """
        order_string = self.alipay.api_alipay_trade_app_pay(
            out_trade_no=order_no,
            total_amount=str(amount.quantize(Decimal("0.01"))),
            subject=subject,
            body=body,
            timeout_express=timeout_express,
            notify_url=settings.ALIPAY_NOTIFY_URL,
            product_code=product_code
        )
        return order_string
    
    def generate_page_pay_url(self, order_no: str, amount: Decimal,
                              subject: str = "寰卓套餐购买",
                              body: str = "",
                              timeout_express: str = "30m") -> str:
        """
        生成PC网页支付跳转URL
        """
        order_string = self.alipay.api_alipay_trade_page_pay(
            out_trade_no=order_no,
            total_amount=str(amount.quantize(Decimal("0.01"))),
            subject=subject,
            body=body,
            return_url=settings.ALIPAY_RETURN_URL,
            notify_url=settings.ALIPAY_NOTIFY_URL,
            timeout_express=timeout_express
        )
        return f"{self.gateway}?{order_string}"
    
    def generate_wap_pay_url(self, order_no: str, amount: Decimal,
                             subject: str = "寰卓套餐购买",
                             body: str = "",
                             timeout_express: str = "30m") -> str:
        """
        生成手机H5支付跳转URL
        """
        order_string = self.alipay.api_alipay_trade_wap_pay(
            out_trade_no=order_no,
            total_amount=str(amount.quantize(Decimal("0.01"))),
            subject=subject,
            body=body,
            return_url=settings.ALIPAY_RETURN_URL,
            notify_url=settings.ALIPAY_NOTIFY_URL,
            timeout_express=timeout_express
        )
        return f"{self.gateway}?{order_string}"
    
    def verify_callback(self, params: Dict[str, str]) -> bool:
        """
        验签支付宝回调参数
        params: request.query_params() 或 request.form()
        """
        # 移除 sign_type，支付宝SDK内部会处理
        sign = params.pop("sign", None)
        if not sign:
            return False
        
        # 使用SDK验签
        try:
            return self.alipay.verify(params, sign)
        except Exception as e:
            print(f"[Alipay] verify_callback error: {e}")
            return False
    
    def verify_notify(self, data: Dict[str, Any]) -> bool:
        """
        验签支付宝异步通知（POST form data）
        """
        sign = data.pop("sign", None)
        if not sign:
            return False
        
        try:
            return self.alipay.verify(data, sign)
        except Exception as e:
            print(f"[Alipay] verify_notify error: {e}")
            return False
    
    def query_trade(self, order_no: str, alipay_trade_no: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        查询支付宝交易状态
        """
        try:
            result = self.alipay.api_alipay_trade_query(
                out_trade_no=order_no,
                trade_no=alipay_trade_no
            )
            
            if result.get("code") == "10000":
                return {
                    "trade_status": result.get("trade_status"),
                    "buyer_id": result.get("buyer_user_id"),
                    "total_amount": Decimal(result.get("total_amount", "0")),
                    "receipt_amount": Decimal(result.get("receipt_amount", "0")),
                    "buyer_pay_amount": Decimal(result.get("buyer_pay_amount", "0")),
                    "send_pay_date": result.get("send_pay_date"),
                    "trade_no": result.get("trade_no"),
                    "out_trade_no": result.get("out_trade_no")
                }
            return None
        except Exception as e:
            print(f"[Alipay] query_trade error: {e}")
            return None
    
    def refund(self, order_no: str, refund_amount: Decimal,
               alipay_trade_no: Optional[str] = None,
               reason: str = "用户申请退款") -> Optional[Dict[str, Any]]:
        """
        发起退款
        """
        refund_no = f"REF{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"
        try:
            result = self.alipay.api_alipay_trade_refund(
                out_trade_no=order_no,
                trade_no=alipay_trade_no,
                refund_amount=str(refund_amount.quantize(Decimal("0.01"))),
                refund_reason=reason,
                out_request_no=refund_no
            )
            
            if result.get("code") == "10000":
                return {
                    "refund_no": refund_no,
                    "trade_no": result.get("trade_no"),
                    "refund_fee": Decimal(result.get("refund_fee", "0")),
                    "fund_change": result.get("fund_change"),
                    "gmt_refund_pay": result.get("gmt_refund_pay")
                }
            return None
        except Exception as e:
            print(f"[Alipay] refund error: {e}")
            return None
    
    def close_trade(self, order_no: str,
                    alipay_trade_no: Optional[str] = None) -> bool:
        """
        关闭未支付交易
        """
        try:
            result = self.alipay.api_alipay_trade_close(
                out_trade_no=order_no,
                trade_no=alipay_trade_no
            )
            return result.get("code") == "10000"
        except Exception as e:
            print(f"[Alipay] close_trade error: {e}")
            return False


# 全局单例
_alipay_service: Optional[AlipayService] = None


def get_alipay_service() -> AlipayService:
    global _alipay_service
    if _alipay_service is None:
        _alipay_service = AlipayService()
    return _alipay_service
