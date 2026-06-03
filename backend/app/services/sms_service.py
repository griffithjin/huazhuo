"""
阿里云短信服务集成
基于 aliyun-python-sdk-dysmsapi 实现短信发送
"""
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from aliyunsdkcore.client import AcsClient
from aliyunsdkcore.request import CommonRequest
from aliyunsdkdysmsapi.request.v20170525 import SendSmsRequest

from app.config import settings


class SMSService:
    """阿里云短信服务"""
    
    def __init__(self):
        self.client = AcsClient(
            settings.SMS_ACCESS_KEY,
            settings.SMS_SECRET,
            "cn-hangzhou"
        )
        self.sign_name = settings.SMS_SIGN_NAME
    
    def send_code(self, phone: str, code: str, template_code: str,
                  timeout_seconds: int = 300) -> bool:
        """
        发送验证码短信
        
        Args:
            phone: 接收手机号
            code: 验证码内容
            template_code: 短信模板CODE
            timeout_seconds: 验证码过期时间（用于模板变量）
        """
        try:
            request = SendSmsRequest()
            request.set_accept_format("json")
            request.set_phone_numbers(phone)
            request.set_sign_name(self.sign_name)
            request.set_template_code(template_code)
            
            # 模板变量
            template_param = {
                "code": code,
                "timeout": str(timeout_seconds // 60)
            }
            request.set_template_param(json.dumps(template_param))
            
            # 业务ID（用于追踪）
            out_id = f"tk_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
            request.set_out_id(out_id)
            
            response = self.client.do_action_with_exception(request)
            result = json.loads(response)
            
            if result.get("Code") == "OK":
                print(f"[SMS] Sent to {phone}, BizId={result.get('BizId')}, OutId={out_id}")
                return True
            else:
                print(f"[SMS] Failed to {phone}: {result.get('Code')} - {result.get('Message')}")
                return False
                
        except Exception as e:
            print(f"[SMS] Exception sending to {phone}: {e}")
            return False
    
    def send_login_code(self, phone: str, code: str) -> bool:
        """发送登录验证码"""
        return self.send_code(
            phone=phone,
            code=code,
            template_code=settings.SMS_TEMPLATE_CODE_LOGIN,
            timeout_seconds=300
        )
    
    def send_custom(self, phone: str, template_code: str,
                    template_params: Dict[str, str]) -> bool:
        """
        发送自定义模板短信
        """
        try:
            request = SendSmsRequest()
            request.set_accept_format("json")
            request.set_phone_numbers(phone)
            request.set_sign_name(self.sign_name)
            request.set_template_code(template_code)
            request.set_template_param(json.dumps(template_params))
            
            out_id = f"tk_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
            request.set_out_id(out_id)
            
            response = self.client.do_action_with_exception(request)
            result = json.loads(response)
            
            return result.get("Code") == "OK"
            
        except Exception as e:
            print(f"[SMS] Custom send failed: {e}")
            return False
    
    def query_send_detail(self, phone: str, biz_id: str,
                          send_date: str) -> Optional[Dict[str, Any]]:
        """
        查询短信发送详情
        
        Args:
            phone: 手机号
            biz_id: 发送流水号
            send_date: 发送日期 yyyyMMdd
        """
        try:
            request = CommonRequest()
            request.set_accept_format("json")
            request.set_domain("dysmsapi.aliyuncs.com")
            request.set_method("POST")
            request.set_protocol_type("https")
            request.set_version("2017-05-25")
            request.set_action_name("QuerySendDetails")
            
            request.add_query_param("PhoneNumber", phone)
            request.add_query_param("BizId", biz_id)
            request.add_query_param("SendDate", send_date)
            request.add_query_param("PageSize", "1")
            request.add_query_param("CurrentPage", "1")
            
            response = self.client.do_action_with_exception(request)
            result = json.loads(response)
            
            if result.get("Code") == "OK":
                details = result.get("SmsSendDetailDTOs", {}).get("SmsSendDetailDTO", [])
                return details[0] if details else None
            return None
            
        except Exception as e:
            print(f"[SMS] Query detail failed: {e}")
            return None


# 全局单例
_sms_service: Optional[SMSService] = None


def get_sms_service() -> SMSService:
    global _sms_service
    if _sms_service is None:
        _sms_service = SMSService()
    return _sms_service
