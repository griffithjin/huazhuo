
import React from 'react';
import { Card, Statistic, Row, Col, Table, Button, Tag, Progress } from 'antd';
import { UserAddOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';

const ChannelDashboard: React.FC = () => {
  const stats = [
    { title: '剩余额度', value: 35000, prefix: '¥', color: '#1677ff' },
    { title: '今日新增用户', value: 12, color: '#52c41a' },
    { title: '今日订单', value: 8, color: '#faad14' },
    { title: '今日消耗', value: 120.5, prefix: '¥', color: '#f5222d' },
  ];

  const users = [
    { id: 1, phone: '138****1234', registerDate: '2026-06-01', consumption: 299, status: 'active' },
    { id: 2, phone: '139****5678', registerDate: '2026-06-01', consumption: 59.9, status: 'active' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>上海代理商A - 渠道仪表盘</h2>
        <Button type="primary" icon={<UserAddOutlined />}>创建用户</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <Col span={6} key={s.title}>
            <Card>
              <Statistic title={s.title} value={s.value} prefix={s.prefix} valueStyle={{ color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="额度使用情况">
            <Progress percent={30} status="active" format={() => '¥15,000 / ¥50,000'} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="本月业绩">
            <div>销售额: ¥8,900 | 平台成本: ¥2,300 | 利润: ¥6,600</div>
          </Card>
        </Col>
      </Row>

      <Card title="我的用户" extra={<Button>查看全部</Button>}>
        <Table
          dataSource={users}
          columns={[
            { title: '手机号', dataIndex: 'phone' },
            { title: '注册时间', dataIndex: 'registerDate' },
            { title: '累计消费', dataIndex: 'consumption', render: (v: number) => `¥${v}` },
            { title: '状态', dataIndex: 'status', render: () => <Tag color="green">正常</Tag> },
            { title: '操作', render: () => <Button size="small">详情</Button> },
          ]}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default ChannelDashboard;
