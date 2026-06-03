import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Tag, Table, Badge, Progress, Alert, Divider, Timeline, List, Space, Tooltip, Modal, Form, Input, Radio } from 'antd';
import {
  WalletOutlined, ShoppingCartOutlined, ApiOutlined,
  BarChartOutlined, GiftOutlined, ReloadOutlined, ArrowUpOutlined,
  CreditCardOutlined, SafetyOutlined
} from '@ant-design/icons';
import { ALL_MODELS, CREDIT_PACKAGES, calculateCredit } from '../../data/modelPricing';

const UserDashboard: React.FC = () => {
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<string>('');

  // Mock data - 实际应从API获取
  const userData = {
    balance: 156.80,           // 当前额度余额
    totalSpent: 423.50,        // 累计消费
    totalTokens: 28456000,       // 累计使用Token
    apiCalls: 12580,             // 累计调用次数
    freeQuotaRemaining: 45000,   // 免费额度剩余
    quotaAlert: true,            // 额度预警
    recentOrders: [
      { id: 'ord_001', amount: 99, credit: 300, status: 'completed', date: '2026-06-01 14:30' },
      { id: 'ord_002', amount: 199, credit: 500, status: 'completed', date: '2026-05-28 09:15' },
      { id: 'ord_003', amount: 9.9, credit: 15, status: 'completed', date: '2026-05-25 18:22' },
    ],
    apiKeys: [
      { id: 'key_1', name: '测试项目', key: 'th-********************************sk1', quota: 5000, used: 2340, status: 'active' },
      { id: 'key_2', name: '生产环境', key: 'th-********************************sk2', quota: 50000, used: 12800, status: 'active' },
    ],
    usageByModel: [
      { model: 'qwen-plus', tokens: 12500000, cost: 18.75 },
      { model: 'qwen-flash', tokens: 8900000, cost: 1.78 },
      { model: 'text-embedding-v4', tokens: 5600000, cost: 5.60 },
      { model: 'qwen3.7-plus', tokens: 1456000, cost: 4.37 },
    ],
  };

  const handleRecharge = () => {
    if (!selectedPkg) {
      // 自定义充值
      window.location.href = '/#/packages';
      return;
    }
    const pkg = CREDIT_PACKAGES.find(p => p.id === selectedPkg);
    if (pkg) {
      const orderUuid = 'ord_' + Math.random().toString(36).substr(2, 9);
      window.location.href = `/#/pay/${orderUuid}?pkg=${pkg.id}&amount=${pkg.payAmount}&credit=${calculateCredit(pkg.payAmount, 0.82)}`;
    }
  };

  const usageColumns = [
    { title: '模型', dataIndex: 'model', key: 'model',
      render: (v: string) => {
        const m = ALL_MODELS.find((x: any) => x.id === v);
        return <Tag color="blue">{m?.name || v}</Tag>;
      }
    },
    { title: 'Token使用量', dataIndex: 'tokens', key: 'tokens',
      render: (v: number) => (v / 10000).toFixed(0) + '万'
    },
    { title: '消耗额度', dataIndex: 'cost', key: 'cost',
      render: (v: number) => <span>¥{v.toFixed(2)}</span>
    },
    { title: '占比', key: 'percent',
      render: (_: any, record: any) => {
        const total = userData.usageByModel.reduce((s: number, x: any) => s + x.tokens, 0);
        const pct = (record.tokens / total * 100).toFixed(1);
        return <Progress percent={parseFloat(pct)} size="small" />;
      }
    },
  ];

  const orderColumns = [
    { title: '订单号', dataIndex: 'id', key: 'id' },
    { title: '支付金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v}` },
    { title: '获得额度', dataIndex: 'credit', key: 'credit', render: (v: number) => <Tag color="success">+¥{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => <Badge status={v === 'completed' ? 'success' : 'processing'} text={v === 'completed' ? '已完成' : '处理中'} />
    },
    { title: '时间', dataIndex: 'date', key: 'date' },
  ];

  const apiKeyColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'API Key', dataIndex: 'key', key: 'key',
      render: (v: string) => (
        <Tooltip title={v}><span style={{ fontFamily: 'monospace' }}>{v.substring(0, 8) + '...' + v.slice(-4)}</span></Tooltip>
      )
    },
    { title: '额度', key: 'quota',
      render: (_: any, record: any) => (
        <Progress
          percent={record.used / record.quota * 100}
          size="small"
          status={record.used / record.quota > 0.8 ? 'exception' : undefined}
          format={() => `${(record.used/1000).toFixed(0)}K / ${(record.quota/1000).toFixed(0)}K`}
        />
      )
    },
    { title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? '正常' : '已禁用'}</Tag>
    },
    { title: '操作', key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small" danger>禁用</Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      {/* 额度预警 */}
      {userData.quotaAlert && userData.balance < 50 && (
        <Alert
          message="额度预警"
          description="您的账户余额低于50元，请及时充值以避免服务中断。"
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => setRechargeVisible(true)}>
              立即充值
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 核心数据卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bodyStyle={{ padding: 24 }}>
            <Statistic
              title={<Space><WalletOutlined /><span>当前额度余额</span></Space>}
              value={userData.balance}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
            <Button type="primary" block style={{ marginTop: 16 }} icon={<CreditCardOutlined />}
              onClick={() => setRechargeVisible(true)}
            >
              立即充值
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bodyStyle={{ padding: 24 }}>
            <Statistic
              title={<Space><GiftOutlined /><span>免费额度剩余</span></Space>}
              value={userData.freeQuotaRemaining}
              suffix="Token"
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
            <Progress percent={Math.round(userData.freeQuotaRemaining / 100000 * 100)} size="small" style={{ marginTop: 12 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bodyStyle={{ padding: 24 }}>
            <Statistic
              title={<Space><BarChartOutlined /><span>累计使用Token</span></Space>}
              value={(userData.totalTokens / 10000).toFixed(0)}
              suffix="万"
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
              累计调用 {userData.apiCalls.toLocaleString()} 次
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bodyStyle={{ padding: 24 }}>
            <Statistic
              title={<Space><ShoppingCartOutlined /><span>累计消费</span></Space>}
              value={userData.totalSpent}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fa8c16', fontSize: 24 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
              已完成 12 笔订单
            </div>
          </Card>
        </Col>
      </Row>

      {/* 数据详情 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={<Space><ApiOutlined /><span>API Key 管理</span></Space>}
            extra={<Button type="primary" size="small">+ 新建 Key</Button>}
          >
            <Alert
              message="每个 API Key 可单独设置额度限制，防止超额使用"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={userData.apiKeys}
              columns={apiKeyColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<Space><BarChartOutlined /><span>模型使用统计</span></Space>}
          >
            <Table
              dataSource={userData.usageByModel}
              columns={usageColumns}
              rowKey="model"
              size="small"
              pagination={false}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>合计</span>
              <span>{(userData.totalTokens / 10000).toFixed(0)}万 Token / ¥{userData.usageByModel.reduce((s, x) => s + x.cost, 0).toFixed(2)}</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近订单 */}
      <Card
        title={<Space><ShoppingCartOutlined /><span>最近订单</span></Space>}
        style={{ marginTop: 24 }}
      >
        <Table
          dataSource={userData.recentOrders}
          columns={orderColumns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Card>

      {/* 充值弹窗 */}
      <Modal
        title="账户充值"
        visible={rechargeVisible}
        onCancel={() => setRechargeVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="充值说明"
          description="充值后额度将立即到账，可用于调用平台所有模型。额度永久有效，无过期时间。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Radio.Group
          value={selectedPkg}
          onChange={e => setSelectedPkg(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {CREDIT_PACKAGES.map((pkg: any) => (
              <Radio.Button
                key={pkg.id}
                value={pkg.id}
                style={{
                  width: '100%',
                  height: 'auto',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 16 }}>{pkg.name}</div>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{pkg.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>¥{pkg.payAmount}</div>
                  <div>
                    <Tag color="success">得¥{calculateCredit(pkg.payAmount, 0.82)}</Tag>
                    
                  </div>
                </div>
              </Radio.Button>
            ))}
          </Space>
        </Radio.Group>

        <Divider />

        <Button type="primary" size="large" block onClick={handleRecharge}>
          确认充值
        </Button>
        <Button style={{ marginTop: 8 }} block onClick={() => window.location.href = '/#/packages'}>
          查看更多套餐
        </Button>
      </Modal>
    </div>
  );
};

export default UserDashboard;
