"""
统一响应工具
"""
from datetime import datetime
from typing import Any, Optional


def success_response(data: Any = None, message: str = "success") -> dict:
    """成功响应"""
    return {
        "code": 0,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }


def error_response(code: int, message: str, data: Any = None) -> dict:
    """错误响应"""
    return {
        "code": code,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }


def paginated_response(
    items: list,
    page: int,
    page_size: int,
    total: int,
    message: str = "success"
) -> dict:
    """分页响应"""
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    
    return {
        "code": 0,
        "message": message,
        "data": {
            "list": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        },
        "timestamp": datetime.now().isoformat()
    }
