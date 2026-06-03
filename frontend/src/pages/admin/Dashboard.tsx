import React from 'react';
import { Card, Statistic, Row, Col, Table, List, DatePicker, Button, Badge } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, KeyOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/plots';
import dayjs from 'dayjs';

const AdminDashboard: React.FC = () => {
  // 模拟数据
  const statCards = [
    { title: '总用户数', value: 10234, prefix: <UserOutlined />, color: '#1677ff', change: '+12%', up: true },
    { title: '今日订单', value: 156, prefix: <ShoppingOutlined />, color: '#52c41a', change: '+8%', up: true },
    { title: '今日收入', value: 8900, prefix: <DollarOutlined />, suffix: '元', color: '#faad14', change: '-3%', up: false },
    { title: '活跃Key', value: 3200, prefix: <KeyOutlined />, color: '#722ed1', change: '+5%', up: true },
  ];

  const incomeData = [
    { date: '05-28', value: 6500, type: '收入' },
    { date: '05-29', value: 7200, type: '收入' },
    { date: '05-30', value: 8100, type: '收入' },
    { date: '05-31', value: 7600, type: '收入' },
    { date: '06-01', value: 8900, type: '收入' },
    { date: '06-02', value: 9200, type: '收入' },
  ];

  const modelUsageData = [
    { model: '通义千问3.7', value: 45 },
    { model: '通义千问3.7-Max', value: 25 },
    { model: '万相视频', value: 15 },
    { model: '万相图像', value: 10 },
    { model: '其他', value: 5 },
  ];

  const hourlyData = [
    { hour: '00:00', calls: 120 },
    { hour: '04:00', calls: 80 },
    { hour: '08:00', calls: 450 },
    { hour: '12:00', calls: 680 },
    { hour: '16:00', calls: 720 },
    { hour: '20:00', calls: 890 },
    { hour: '23:59', calls: 340 },
  ];

  const recentOrders = [
    { id: 1, order_no: 'ORD202606020001', user: '用户6688', amount: 59.9, status: 'completed', time: '2026-06-02 14:32' },
    { id: 2, order_no: 'ORD202606020002', user: '创作者小王', amount: 199, status: 'completed', time: '2026-06-02 13:15' },
    { id: 3, order_no: 'ORD202606020003', user: '开发者张三', amount: 59.9, status: 'paid', time: '2026-06-02 12:08' },
    { id: 4, order_no: 'ORD202606020004', user: '设计师李四', amount: 199, status: 'pending', time: '2026-06-02 11:45' },
    { id: 5, order_no: 'ORD202606020005', user: '运营王五', amount: 19.9, status: 'completed', time: '2026-06-02 10:22' },
  ];

  const lineConfig = {
    data: incomeData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    point: { size: 4, shape: 'diamond' },
    label: { style: { fill: '#aaa' } },
    color: '#1677ff',
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#1677ff25 1:#1677ff',
      },
    },
    height: 280,
  };

  const pieConfig = {
    data: modelUsageData,
    angleField: 'value',
    colorField: 'model',
    radius: 0.8,
    innerRadius: 0.5,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    height: 280,
    legend: { position: 'bottom' },
  };

  const columnConfig = {
    data: hourlyData,
    xField: 'hour',
    yField: 'calls',
    color: '#52c41a',
    label: { position: 'top' },
    height: 280,
  };

  const statusMap: Record<string, { text: string; color: string }> = {
    completed: { text: '已完成', color: 'green' },
    paid: { text: '已支付', color: 'blue' },
    pending: { text: '待支付', color: 'orange' },
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map(card => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card hoverable>
              <Statistic
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: card.color }}>{card.prefix}</span>
                    {card.title}
                  </div>
                }
                value={card.value}
                suffix={card.suffix}
                valueStyle={{ color: card.color, fontSize: 28, fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <span style={{ color: card.up ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {card.up ? <RiseOutlined /> : <FallOutlined />}
                  {card.change}
                </span>
                <span style={{ color: '#8c8c8c', marginLeft: 8 }}>较昨日</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="收入趋势" 
            extra={<DatePicker.RangePicker size="small" defaultValue={[dayjs().subtract(7, 'day'), dayjs()]} />}
          >
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="模型调用分布">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="时段调用量">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近订单" extra={<Button type="link" size="small">查看全部</Button>}>
            <Table
              dataSource={recentOrders}
              columns={[
                { title: '订单号', dataIndex: 'order_no', ellipsis: true },
                { title: '用户', dataIndex: 'user' },
                { title: '金额', dataIndex: 'amount', render: v => `¥${v}` },
                { title: '状态', dataIndex: 'status', render: v => (
                  <Badge color={statusMap[v]?.color || 'default'} text={statusMap[v]?.text || v} />
                )},
                { title: '时间', dataIndex: 'time', width: 150 },
              ]}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="系统状态监控">
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Badge status="success" text={<span style={{ fontSize: 16 }}>API服务 正常</span>} />
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>响应时间 45ms</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Badge status="success" text={<span style={{ fontSize: 16 }}>支付服务 正常</span>} />
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>成功率 99.9%</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Badge status="processing" text={<span style={{ fontSize: 16 }}>消息队列 运行中</span>} />
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>积压 12 条</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Badge status="success" text={<span style={{ fontSize: 16 }}>数据库 正常</span>} />
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>连接数 45/200</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
