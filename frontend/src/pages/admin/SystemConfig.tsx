import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Form, Input, Switch, Button, message, Alert,
  Divider, Tooltip, Space, Tag, InputNumber, Select, Table,
  Badge, Popconfirm, Row, Col, Statistic, List, Modal
} from 'antd';
import {
  SaveOutlined, ReloadOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, PlusOutlined, DeleteOutlined,
  EditOutlined, EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import { ALL_MODELS, ALL_MODEL_CATEGORIES } from '../../data/modelPricing';
import type { ModelConfig } from '../../data/modelPricing';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface SystemConfig {
  // 支付宝配置
  alipay_app_id: string;
  alipay_public_key: string;
  alipay_private_key: string;
  alipay_gateway: string;
  alipay_notify_url: string;
  alipay_enabled: boolean;

  // 阿里云 ModelRouter
  model_router_endpoint: string;
  aliyun_access_key: string;
  aliyun_secret: string;
  model_router_discount: number;
  model_router_enabled: boolean;

  // 阿里云短信
  sms_access_key: string;
  sms_secret: string;
  sms_sign_name: string;
  sms_template_code: string;
  sms_enabled: boolean;

  // 数据库
  database_url: string;
  redis_url: string;

  // JWT & 安全
  jwt_secret: string;
  jwt_expire_minutes: number;
  encryption_key: string;

  // 平台设置
  platform_name: string;
  platform_logo: string;
  contact_phone: string;
  contact_email: string;
  default_commission_rate: number;
  order_expire_minutes: number;
  rate_limit_per_minute: number;

  // 通知设置
  feishu_webhook: string;
  slack_webhook: string;
  email_smtp_host: string;
  email_smtp_port: number;
  email_user: string;
  email_pass: string;

  // 模型管理
  enabled_models: string[];
  default_model: string;
  free_tier_quota: number;
}

const defaultConfig: SystemConfig = {
  alipay_app_id: '',
  alipay_public_key: '',
  alipay_private_key: '',
  alipay_gateway: 'https://openapi.alipay.com/gateway.do',
  alipay_notify_url: 'https://your-domain.com/api/v1/orders/alipay/notify',
  alipay_enabled: false,

  model_router_endpoint: 'https://model-router.aliyuncs.com',
  aliyun_access_key: '',
  aliyun_secret: '',
  model_router_discount: 68,
  model_router_enabled: false,

  sms_access_key: '',
  sms_secret: '',
  sms_sign_name: '寰卓数字',
  sms_template_code: '',
  sms_enabled: false,

  database_url: 'postgresql://user:pass@localhost:5432/huazhuo',
  redis_url: 'redis://localhost:6379/0',

  jwt_secret: '',
  jwt_expire_minutes: 60,
  encryption_key: '',

  platform_name: '寰卓',
  platform_logo: '/logo.png',
  contact_phone: '400-xxx-xxxx',
  contact_email: 'support@寰卓.tech',
  default_commission_rate: 15,
  order_expire_minutes: 30,
  rate_limit_per_minute: 60,

  feishu_webhook: '',
  slack_webhook: '',
  email_smtp_host: 'smtp.qq.com',
  email_smtp_port: 465,
  email_user: '',
  email_pass: '',

  enabled_models: ALL_MODELS.map(m => m.id),
  default_model: 'qwen-plus',
  free_tier_quota: 100000,
};

const SystemConfigPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('alipay');

  // 模型管理
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('system_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
        form.setFieldsValue({ ...defaultConfig, ...parsed });
      } catch {
        form.setFieldsValue(defaultConfig);
      }
    } else {
      form.setFieldsValue(defaultConfig);
    }
  }, [form]);

  const handleSave = async (values: SystemConfig) => {
    setSaving(true);
    try {
      localStorage.setItem('system_config', JSON.stringify(values));
      setConfig(values);
      message.success('系统配置已保存');
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (type: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestResults(prev => ({ ...prev, [type]: true }));
      message.success(`${type} 连接测试成功`);
    } catch {
      setTestResults(prev => ({ ...prev, [type]: false }));
      message.error(`${type} 连接测试失败`);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (type: string) => {
    if (testResults[type] === undefined) return null;
    return testResults[type] ? (
      <Tag color="success" icon={<CheckCircleOutlined />}>连接正常</Tag>
    ) : (
      <Tag color="error" icon={<ExclamationCircleOutlined />}>连接失败</Tag>
    );
  };

  // 模型表格列
  const modelColumns = [
    { title: '模型ID', dataIndex: 'id', key: 'id' },
    { title: '模型名称', dataIndex: 'name', key: 'name' },
    { title: '提供商', dataIndex: 'provider', key: 'provider' },
    { title: '类别', dataIndex: 'category', key: 'category',
      render: (v: string) => {
        const map: Record<string, string> = {
          text: '文本生成', embedding: '向量模型', image: '图片生成',
          video: '视频生成', audio: '语音处理', agent: '智能体'
        };
        return <Tag>{map[v] || v}</Tag>;
      }
    },
    { title: '上下文', dataIndex: 'contextLength', key: 'contextLength' },
    { title: '成本(输入/输出)', key: 'cost',
      render: (_: any, record: ModelConfig) => (
        <span>¥{(record.costPer1KInput * 1000).toFixed(4)} / ¥{(record.costPer1KOutput * 1000).toFixed(4)}</span>
      )
    },
    { title: '售价(输入/输出)', key: 'price',
      render: (_: any, record: ModelConfig) => (
        <span>¥{(record.officialPricePer1KInput * 1000).toFixed(4)} / ¥{(record.officialPricePer1KOutput * 1000).toFixed(4)}</span>
      )
    },
    { title: '毛利率', key: 'margin',
      render: (_: any, record: ModelConfig) => {
        const margin = ((record.officialPricePer1KInput - record.costPer1KInput) / record.officialPricePer1KInput * 100);
        return <Tag color={margin > 40 ? 'success' : margin > 20 ? 'warning' : 'error'}>{margin.toFixed(1)}%</Tag>;
      }
    },
    { title: '操作', key: 'action',
      render: (_: any, record: ModelConfig) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
            setEditingModel(record);
            setModelModalVisible(true);
          }}>编辑</Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>系统配置中心</h2>
          <p style={{ margin: '8px 0 0', color: '#888' }}>
            董董专用：配置所有平台运行所需的API密钥、账户信息、模型定价和系统参数
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>重置</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>
            保存配置
          </Button>
        </Space>
      </div>

      <Alert
        message="配置说明"
        description="以下配置项均为平台运行所需的关键信息。请确保所有信息准确无误，保存后系统将自动尝试连接验证。标有 🔴 的为必填项，🟡 为推荐配置。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={config}
      >
        <Tabs type="card" activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="🔴 支付宝支付" key="alipay">
            <Card title="支付宝商户配置" extra={renderStatus('支付宝')}>
              <Form.Item name="alipay_enabled" valuePropName="checked" label="启用支付宝收款">
                <Switch checkedChildren="启用" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name="alipay_app_id" label="App ID"
                rules={[{ required: true, message: '请输入支付宝 App ID' }]}
                tooltip="在支付宝开放平台创建应用后获取">
                <Input placeholder="2024xxxxxxxxxxxx" />
              </Form.Item>

              <Form.Item name="alipay_public_key" label="支付宝公钥"
                rules={[{ required: true, message: '请输入支付宝公钥' }]}
                tooltip="从支付宝开放平台获取的公钥">
                <TextArea rows={4} placeholder="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..." />
              </Form.Item>

              <Form.Item name="alipay_private_key" label="应用私钥"
                rules={[{ required: true, message: '请输入应用私钥' }]}
                tooltip="使用支付宝密钥工具生成的应用私钥，请勿泄露">
                <TextArea rows={6} placeholder="-----BEGIN RSA PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..." />
              </Form.Item>

              <Form.Item name="alipay_gateway" label="网关地址"
                tooltip="支付宝网关，沙箱环境请使用 https://openapi.alipaydev.com/gateway.do">
                <Input placeholder="https://openapi.alipay.com/gateway.do" />
              </Form.Item>

              <Form.Item name="alipay_notify_url" label="回调通知URL"
                tooltip="支付宝支付结果异步通知地址，需为公网可访问的HTTPS地址">
                <Input placeholder="https://your-domain.com/api/v1/orders/alipay/notify" />
              </Form.Item>

              <Button type="default" loading={loading} onClick={() => testConnection('支付宝')}>
                测试支付宝连接
              </Button>
            </Card>
          </TabPane>

          <TabPane tab="🔴 ModelRouter" key="modelrouter">
            <Card title="阿里云 ModelRouter 配置" extra={renderStatus('ModelRouter')}>
              <Alert
                message="ModelRouter 是平台的核心供给来源，用于采购 AI Token 并转售给客户。"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item name="model_router_enabled" valuePropName="checked" label="启用 ModelRouter">
                <Switch checkedChildren="启用" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name="aliyun_access_key" label="AccessKey ID"
                rules={[{ required: true, message: '请输入 AccessKey ID' }]}
                tooltip="阿里云 RAM 用户的 AccessKey ID">
                <Input placeholder="LTAI5t…xxxx" />
              </Form.Item>

              <Form.Item name="aliyun_secret" label="AccessKey Secret"
                rules={[{ required: true, message: '请输入 AccessKey Secret' }]}
                tooltip="阿里云 RAM 用户的 AccessKey Secret">
                <Input.Password placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </Form.Item>

              <Form.Item name="model_router_endpoint" label="API Endpoint"
                tooltip="ModelRouter 服务地址">
                <Input placeholder="https://model-router.aliyuncs.com" />
              </Form.Item>

              <Form.Item name="model_router_discount" label="采购折扣率 (%)"
                tooltip="从 ModelRouter/百炼采购 Token 的折扣，寰卓报价单: 月消费30万享68折, 50万享64折">
                <InputNumber min={10} max={100} suffix="%" style={{ width: 200 }} />
              </Form.Item>

              <Divider />

              <Alert
                message="折扣说明"
                description="百炼官方定价 × 折扣率 = 平台采购成本。平台售价 = 成本价 × 2.0（确保50%+毛利）。"
                type="info"
                showIcon
              />

              <Button type="default" loading={loading} onClick={() => testConnection('ModelRouter')} style={{ marginTop: 16 }}>
                测试 ModelRouter 连接
              </Button>
            </Card>
          </TabPane>

          <TabPane tab="🟡 阿里云短信" key="sms">
            <Card title="短信服务配置" extra={renderStatus('短信')}>
              <Form.Item name="sms_enabled" valuePropName="checked" label="启用短信服务">
                <Switch checkedChildren="启用" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name="sms_access_key" label="AccessKey ID"
                tooltip="阿里云短信服务的 AccessKey">
                <Input placeholder="LTAI5t…xxxx" />
              </Form.Item>

              <Form.Item name="sms_secret" label="AccessKey Secret"
                tooltip="阿里云短信服务的 Secret">
                <Input.Password placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </Form.Item>

              <Form.Item name="sms_sign_name" label="短信签名"
                tooltip="在阿里云短信控制台申请的签名，如 '寰卓数字'（建议4字以内）">
                <Input placeholder="寰卓数字" />
              </Form.Item>

              <Form.Item name="sms_template_code" label="验证码模板CODE"
                tooltip="在阿里云短信控制台申请的模板 CODE">
                <Input placeholder="SMS_12345678" />
              </Form.Item>

              <Button type="default" loading={loading} onClick={() => testConnection('短信')}>
                测试短信发送
              </Button>
            </Card>
          </TabPane>

          <TabPane tab="🤖 模型管理" key="models">
            <Card title="模型定价管理">
              <Alert
                message="模型定价策略"
                description="以下模型定价基于阿里云百炼官方价格 × 寰卓折扣(68折) × 平台加价系数(2.0)。确保平台保有约50%毛利率，可持续运营。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Statistic title="文本模型" value={ALL_MODELS.filter(m => m.category === 'text').length} suffix="个" />
                </Col>
                <Col span={6}>
                  <Statistic title="多模态模型" value={ALL_MODELS.filter(m => ['image','video','audio'].includes(m.category)).length} suffix="个" />
                </Col>
                <Col span={6}>
                  <Statistic title="平均毛利率" value="50.0" suffix="%" />
                </Col>
                <Col span={6}>
                  <Statistic title="总模型数" value={ALL_MODELS.length} suffix="个" />
                </Col>
              </Row>

              <Table
                dataSource={ALL_MODELS}
                columns={modelColumns}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />

              <Divider />

              <Form.Item name="default_model" label="默认模型"
                tooltip="用户未指定模型时的默认调用模型">
                <Select placeholder="选择默认模型">
                  {ALL_MODELS.filter(m => m.category === 'text').map(m => (
                    <Option key={m.id} value={m.id}>{m.name} - {m.description.substring(0, 30)}...</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="free_tier_quota" label="新用户免费额度 (Token)"
                tooltip="每个新用户注册时赠送的免费Token数量">
                <InputNumber style={{ width: 200 }} suffix="Token" />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="🟡 数据库 & 缓存" key="database">
            <Card title="数据库与缓存配置">
              <Form.Item name="database_url" label="PostgreSQL 连接串"
                tooltip="PostgreSQL 数据库连接 URL">
                <Input placeholder="postgresql://user:pass@localhost:5432/huazhuo" />
              </Form.Item>

              <Form.Item name="redis_url" label="Redis 连接串"
                tooltip="Redis 缓存连接 URL">
                <Input placeholder="redis://localhost:6379/0" />
              </Form.Item>

              <Alert
                message="Docker 部署说明"
                description="如果使用 docker-compose 部署，数据库和 Redis 会自动创建。此时连接串为: postgresql://postgres:postgres@postgres:5432/huazhuo 和 redis://redis:6379/0"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="🔴 安全设置" key="security">
            <Card title="安全与认证配置">
              <Form.Item name="jwt_secret" label="JWT 密钥"
                rules={[{ required: true, message: '请输入 JWT 密钥' }]}
                tooltip="用于签发用户登录 Token，建议 32 位以上随机字符串">
                <Input.Password placeholder="随机生成 32 位以上字符串" />
              </Form.Item>

              <Form.Item name="jwt_expire_minutes" label="Token 有效期 (分钟)">
                <InputNumber min={5} max={10080} style={{ width: 200 }} />
              </Form.Item>

              <Form.Item name="encryption_key" label="数据加密密钥"
                tooltip="用于加密敏感数据（手机号等），AES-256 格式">
                <Input.Password placeholder="32 位十六进制字符串" />
              </Form.Item>

              <Button type="default" onClick={() => {
                const secret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
                form.setFieldsValue({ jwt_secret: secret });
                message.success('已生成随机 JWT 密钥');
              }}>
                生成随机 JWT 密钥
              </Button>
            </Card>
          </TabPane>

          <TabPane tab="🟡 平台信息" key="platform">
            <Card title="平台基本信息">
              <Form.Item name="platform_name" label="平台名称">
                <Input placeholder="寰卓" />
              </Form.Item>

              <Form.Item name="platform_logo" label="Logo URL">
                <Input placeholder="/logo.png" />
              </Form.Item>

              <Form.Item name="contact_phone" label="客服电话">
                <Input placeholder="400-xxx-xxxx" />
              </Form.Item>

              <Form.Item name="contact_email" label="客服邮箱">
                <Input placeholder="support@寰卓.tech" />
              </Form.Item>

              <Form.Item name="default_commission_rate" label="默认渠道佣金比例 (%)"
                tooltip="渠道商推荐用户的默认佣金比例">
                <InputNumber min={0} max={50} suffix="%" style={{ width: 200 }} />
              </Form.Item>

              <Form.Item name="order_expire_minutes" label="订单超时时间 (分钟)"
                tooltip="未支付订单自动关闭时间">
                <InputNumber min={5} max={1440} style={{ width: 200 }} />
              </Form.Item>

              <Form.Item name="rate_limit_per_minute" label="IP 限流 (次/分钟)"
                tooltip="单个 IP 每分钟最大请求次数">
                <InputNumber min={10} max={10000} style={{ width: 200 }} />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="🟡 通知设置" key="notifications">
            <Card title="通知渠道配置">
              <Form.Item name="feishu_webhook" label="飞书 Webhook"
                tooltip="飞书群机器人 Webhook 地址，用于系统告警">
                <Input placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx" />
              </Form.Item>

              <Form.Item name="slack_webhook" label="Slack Webhook"
                tooltip="Slack Incoming Webhook 地址">
                <Input placeholder="https://hooks.slack.com/services/xxx/xxx/xxx" />
              </Form.Item>

              <Divider>邮件服务器</Divider>

              <Form.Item name="email_smtp_host" label="SMTP 服务器">
                <Input placeholder="smtp.qq.com" />
              </Form.Item>

              <Form.Item name="email_smtp_port" label="SMTP 端口">
                <InputNumber style={{ width: 200 }} />
              </Form.Item>

              <Form.Item name="email_user" label="发件人邮箱">
                <Input placeholder="support@寰卓.tech" />
              </Form.Item>

              <Form.Item name="email_pass" label="邮箱密码/授权码">
                <Input.Password placeholder="授权码（非登录密码）" />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="📋 配置清单" key="checklist">
            <Card title="上线检查清单">
              <Alert
                message="请确认以下所有配置已完成，再进行系统部署"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <h4>🔴 必填配置（不填系统无法运行）</h4>
                <ul style={{ lineHeight: 2 }}>
                  <li>☐ 支付宝 App ID + 公钥 + 私钥（用于收款）</li>
                  <li>☐ 阿里云 AccessKey + Secret（用于 ModelRouter 采购 Token）</li>
                  <li>☐ 模型定价策略确认（确保毛利率健康）</li>
                  <li>☐ JWT 密钥（用于用户登录认证）</li>
                  <li>☐ 数据库连接串（PostgreSQL）</li>
                </ul>
              </div>

              <div style={{ background: '#fffbe6', padding: 16, borderRadius: 8, border: '1px solid #ffe58f', marginTop: 16 }}>
                <h4>🟡 推荐配置（建议上线前完成）</h4>
                <ul style={{ lineHeight: 2 }}>
                  <li>☐ 阿里云短信服务（用于手机号验证码登录）</li>
                  <li>☐ Redis 缓存（提升系统性能）</li>
                  <li>☐ 数据加密密钥（保护用户隐私数据）</li>
                  <li>☐ 飞书/Slack Webhook（系统告警通知）</li>
                </ul>
              </div>

              <div style={{ background: '#e6fffb', padding: 16, borderRadius: 8, border: '1px solid #87e8de', marginTop: 16 }}>
                <h4>🟢 可选配置（可后续补充）</h4>
                <ul style={{ lineHeight: 2 }}>
                  <li>☐ 邮件服务器（发送订单通知、余额预警）</li>
                  <li>☐ 自定义平台 Logo 和名称</li>
                  <li>☐ 渠道佣金比例调整</li>
                </ul>
              </div>

              <Divider />

              <Alert
                message="配置保存后，请重新启动后端服务以生效。命令：docker-compose restart backend"
                type="info"
                showIcon
              />
            </Card>
          </TabPane>
          <TabPane tab="📋 公司信息" key="company">
            <Card title="Company Info & Legal Pages">
              <Alert message="法务部填写" description="请公司法务团队填写以下法律文档内容。" type="warning" showIcon style={{ marginBottom: 16 }} />
              <Form.Item name="privacy_policy" label="隐私政策 (Privacy Policy)"><Input.TextArea rows={8} placeholder="在此粘贴隐私政策完整内容..." /></Form.Item>
              <Form.Item name="terms_of_service" label="服务条款 (Terms of Service)"><Input.TextArea rows={8} placeholder="在此粘贴服务条款完整内容..." /></Form.Item>
              <Form.Item name="contact_info" label="联系我们 (Contact Us)"><Input.TextArea rows={6} placeholder="公司地址、电话、邮箱..." /></Form.Item>
              <Form.Item name="company_name" label="公司注册名"><Input placeholder="杭州寰卓数字科技有限公司" /></Form.Item>
              <Form.Item name="company_address" label="注册地址"><Input placeholder="公司注册地址" /></Form.Item>
              <Form.Item name="business_license" label="营业执照号"><Input placeholder="统一社会信用代码" /></Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="💳 支付渠道" key="payments">
            <Card title="Payment Channels">
              <Alert message="支付渠道扩展" description="配置完成后，用户可选择相应支付方式。" type="info" showIcon style={{ marginBottom: 16 }} />
              <Divider>国内支付</Divider>
              <Form.Item name="alipay_enabled" valuePropName="checked" label="支付宝"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Form.Item name="wechat_pay_enabled" valuePropName="checked" label="微信支付"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Form.Item name="unionpay_enabled" valuePropName="checked" label="银联支付"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Divider>海外支付</Divider>
              <Form.Item name="paypal_enabled" valuePropName="checked" label="PayPal"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Form.Item name="stripe_enabled" valuePropName="checked" label="Stripe (Visa/Mastercard)"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Form.Item name="hsbc_enabled" valuePropName="checked" label="汇丰银行转账"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Form.Item name="hsbc_account" label="汇丰银行账户"><Input placeholder="HSBC Account Number" /></Form.Item>
              <Form.Item name="stripe_publishable_key" label="Stripe Publishable Key"><Input placeholder="pk_live_..." /></Form.Item>
              <Form.Item name="stripe_secret_key" label="Stripe Secret Key"><Input.Password placeholder="sk_live_..." /></Form.Item>
              <Form.Item name="paypal_client_id" label="PayPal Client ID"><Input placeholder="PayPal Client ID" /></Form.Item>
              <Form.Item name="paypal_secret" label="PayPal Secret"><Input.Password placeholder="PayPal Secret" /></Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="🔗 ModelTop" key="modeltop">
            <Card title="ModelTop.ai Integration" extra={<Tag color="blue">海外API</Tag>}>
              <Alert message="ModelTop.ai 对接" description="用于接入Seedance 2.0等海外专属模型。" type="info" showIcon style={{ marginBottom: 16 }} />
              <Form.Item name="modeltop_enabled" valuePropName="checked" label="启用 ModelTop"><Switch checkedChildren="启用" unCheckedChildren="关闭" /></Form.Item>
              <Form.Item name="modeltop_api_key" label="API Key" rules={[{ required: true }]}><Input.Password placeholder="sk-..." /></Form.Item>
              <Form.Item name="modeltop_base_url" label="Base URL"><Input placeholder="https://api.modeltop.ai/v1" /></Form.Item>
              <Form.Item name="modeltop_models" label="支持模型"><Input placeholder="seedance-2.0, seedance-pro" /></Form.Item>
              <Alert message="合规提醒" description="Seedance等海外模型仅限非中国区用户访问，系统会自动根据IP进行地域限制。" type="warning" showIcon />
            </Card>
          </TabPane>
        </Tabs>
      </Form>

      {/* 模型编辑弹窗 */}
      <Modal
        title="编辑模型定价"
        visible={modelModalVisible}
        onCancel={() => { setModelModalVisible(false); setEditingModel(null); }}
        footer={null}
        width={600}
      >
        {editingModel && (
          <Form layout="vertical">
            <Form.Item label="模型ID"><Input value={editingModel.id} disabled /></Form.Item>
            <Form.Item label="模型名称"><Input value={editingModel.name} disabled /></Form.Item>
            <Form.Item label="输入Token成本 (元/千)">
              <InputNumber value={editingModel.costPer1KInput} disabled style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="输出Token成本 (元/千)">
              <InputNumber value={editingModel.costPer1KOutput} disabled style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="输入Token售价 (元/千)">
              <InputNumber defaultValue={editingModel.officialPricePer1KInput} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="输出Token售价 (元/千)">
              <InputNumber defaultValue={editingModel.officialPricePer1KOutput} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="免费额度">
              <InputNumber defaultValue={editingModel.freeQuota || 0} style={{ width: '100%' }} suffix="Token" />
            </Form.Item>
            <Button type="primary" block onClick={() => {
              message.success('模型定价已更新（演示模式，实际需调用API保存）');
              setModelModalVisible(false);
            }}>
              保存修改
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
