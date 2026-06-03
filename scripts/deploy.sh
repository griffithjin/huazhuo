# 寰卓 部署脚本

#!/bin/bash

set -e

echo "🚀 寰卓 部署脚本"
echo "======================"

# 检查依赖
check_dependencies() {
    echo "📦 检查依赖..."
    
    command -v docker >/dev/null 2>&1 || { echo "❌ Docker 未安装"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose 未安装"; exit 1; }
    
    echo "✅ Docker 和 Docker Compose 已安装"
}

# 创建环境文件
setup_env() {
    echo "🔧 配置环境变量..."
    
    if [ ! -f .env ]; then
        cat > .env <<EOF
# 基础配置
APP_NAME=寰卓
DEBUG=false
JWT_SECRET=$(openssl rand -hex 32)

# 数据库
DATABASE_URL=postgresql://tokenhub:tokenhub@postgres:5432/tokenhub

# Redis
REDIS_URL=redis://redis:6379/0

# 阿里云 ModelRouter
ALIYUN_ACCESS_KEY=your-access-key
ALIYUN_SECRET=your-secret
MODEL_ROUTER_DISCOUNT=0.70

# 支付宝
ALIPAY_APP_ID=your-app-id
ALIPAY_SANDBOX=true

# 阿里云短信
SMS_ACCESS_KEY=your-sms-access-key
SMS_SECRET=your-sms-secret
EOF
        echo "✅ .env 文件已创建，请编辑配置"
    else
        echo "✅ .env 文件已存在"
    fi
}

# 启动服务
start_services() {
    echo "🚀 启动服务..."
    
    docker-compose up -d postgres redis
    
    echo "⏳ 等待数据库启动..."
    sleep 10
    
    docker-compose up -d backend
    docker-compose up -d frontend
    
    echo "✅ 服务已启动"
}

# 查看状态
show_status() {
    echo ""
    echo "📊 服务状态"
    echo "=========="
    docker-compose ps
    
    echo ""
    echo "🔗 访问地址"
    echo "=========="
    echo "API文档: http://localhost:8000/docs"
    echo "前端开发: http://localhost:5173"
    echo ""
}

# 主流程
main() {
    case "${1:-}" in
        setup)
            check_dependencies
            setup_env
            ;;
        start)
            start_services
            show_status
            ;;
        stop)
            docker-compose down
            echo "✅ 服务已停止"
            ;;
        restart)
            docker-compose restart
            show_status
            ;;
        logs)
            docker-compose logs -f ${2:-backend}
            ;;
        migrate)
            docker-compose exec backend alembic upgrade head
            ;;
        *)
            echo "使用方法:"
            echo "  $0 setup    - 初始化环境配置"
            echo "  $0 start    - 启动所有服务"
            echo "  $0 stop     - 停止所有服务"
            echo "  $0 restart  - 重启服务"
            echo "  $0 logs     - 查看日志"
            echo "  $0 migrate  - 数据库迁移"
            ;;
    esac
}

main "$@"
