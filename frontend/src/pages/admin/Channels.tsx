import React, { useState } from 'react';
import { Table, Button, Tag, Space, Drawer, Descriptions, Modal, Form, Input, InputNumber, Progress, Popconfirm, message, Card, Statistic, Row, Col, Badge, DatePicker } from 'antd';
import { EyeOutlined, EditOutlined, PlusOutlined, DollarOutlined, BarChartOutlined, TeamOutlined, ReloadOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';

const AdminChannels: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editQuotaVisible, setEditQuotaVisible] = useState(false);
  const [quotaForm] = Form.useForm();
  const [form] = Form.useForm();

  const channels = [
    { id: 1, name: '上海代理商A', code: 'SHA001', contact: '张经理', phone: '138****0001', email: 'sha@example.com', allocated: 50000, used: 15000, remaining: 35000, status: 'active', createdAt: '2026-05-01', subChannels: 3, users: 45, orders: 128, todayUsage: 850 },
    { id: 2, name: '北京代理商B', code: 'BJ002', contact: '李经理', phone: '139****0002', email: 'bj@example.com', allocated: 30000, used: 28000, remaining: 2000, status: 'warning', createdAt: '2026-05-10', subChannels: 2, users: 32, orders: 89, todayUsage: 1200 },
    { id: 3, name: '深圳代理商C', code: 'SZ003', contact: '王经理', phone: '137****0003', email: 'sz@example.com', allocated: 80000, used: 25000, remaining: 55000, status: 'active', createdAt: '2026-05-15', subChannels: 5, users: 78, orders: 210, todayUsage: 650 },
    { id: 4, name: '杭州代理商D', code: 'HZ004', contact: '赵经理', phone: '136****0004', email: 'hz@example.com', allocated: 20000, used: 20000, remaining: 0, status: 'exhausted', createdAt: '2026-05-20', subChannels: 1, users: 15, orders: 56, todayUsage: 0 },
  ];

  const usageData = [
    { date: '05-28', SHA001: 1200, BJ002: 800, SZ003: 1500, HZ004: 600 },
    { date: '05-29', SHA001: 1350, BJ002: 950, SZ003: 1400, HZ004: 550 },
    { date: '05-30', SHA001: 1100, BJ002: 1100, SZ003: 1600, HZ004: 400 },
    { date: '05-31', SHA001: 900, BJ002: 1300, SZ003: 1300, HZ004: 300 },
    { date: '06-01', SHA001: 850, BJ002: 1200, SZ003: 1100, HZ004: 200 },
    { date: '06-02', SHA001: 850, BJ002: 1200, SZ003: 650, HZ004: 0 },
  ];

  const lineConfig = {
    data: usageData.flatMap(d => [
      { date: d.date, value: d.SHA001, channel: '上海代理商A' },
      { date: d.date, value: d.BJ002, channel: '北京代理商B' },
      { date: d.date, value: d.SZ003, channel: '深圳代理商C' },
      { date: d.date, value: d.HZ004, channel: '杭州代理商D' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'channel',
    smooth: true,
    point: { size: 3 },
    height: 280,
    legend: { position: 'bottom' },
  };

  const statusMap: Record<string, { text: string; color: string; badge: string }> = {
    active: { text: '正常', color: 'green', badge: 'success' },
    warning: { text: '额度紧张', color: 'orange', badge: 'warning' },
    exhausted: { text: '额度耗尽', color: 'red', badge: 'error' },
    inactive: { text: '停用', color: 'default', badge: 'default' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, },
    { title: '渠道名称', dataIndex: 'name', render: (v: string, record: any) => (
      <div>
        <div>{v}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.code}</div>
      </div>
    )},
    { title: '联系人', dataIndex: 'contact', render: (v: string, record: any) => (
      <div>
        <div>{v}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.phone}</div>
      </div>
    )},
    { title: '分配额度', dataIndex: 'allocated', render: (v: number) => `¥${v.toLocaleString()}`, },
    { title: '已用额度', dataIndex: 'used', render: (v: number) => `¥${v.toLocaleString()}`, },
    { title: '剩余额度', dataIndex: 'remaining', render: (v: number) => `¥${v.toLocaleString()}`, },
    {
      title: '使用率',
      render: (record: any) => (
        <div>
          <Progress percent={Math.round((record.used / record.allocated) * 100)} size="small" status={record.status === 'exhausted' ? 'exception' : record.status === 'warning' ? 'active' : 'success'} />
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.users} 用户 / {record.orders} 订单</div>
        </div>
      )
    },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Badge status={statusMap[v]?.badge as any} text={statusMap[v]?.text} /> },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedChannel(record); setDrawerVisible(true); }}>详情</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedChannel(record); setEditQuotaVisible(true); }}>调额</Button>
        </Space>
      )
    }
  ];

  const totalAllocated = channels.reduce((sum, c) => sum + c.allocated, 0);
  const totalUsed = channels.reduce((sum, c) => sum + c.used, 0);
  const totalRemaining = channels.reduce((sum, c) => sum + c.remaining, 0);

  const handleCreate = (values: any) => {
    console.log(values);
    message.success('渠道创建成功');
    setModalVisible(false);
    form.resetFields();
  };

  const handleEditQuota = (values: any) => {
    console.log(values);
    message.success('额度调整成功');
    setEditQuotaVisible(false);
    quotaForm.resetFields();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>渠道管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>添加渠道</Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="渠道总数" value={channels.length} suffix="家" valueStyle={{ color: '#1677ff' }} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="总分配额度" value={totalAllocated.toLocaleString()} prefix={<DollarOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="已用额度" value={totalUsed.toLocaleString()} prefix={<BarChartOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="剩余额度" value={totalRemaining.toLocaleString()} prefix={<DollarOutlined />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>

        <Card title="渠道用量趋势" style={{ marginBottom: 16 }}>
          <Line {...lineConfig} />
        </Card>
      </div>

      <Table 
        dataSource={channels} 
        columns={columns} 
        rowKey="id" 
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
      />

      <Drawer
        title="渠道详情"
        placement="right"
        width={520}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedChannel && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="渠道名称">{selectedChannel.name}</Descriptions.Item>
              <Descriptions.Item label="渠道编码">{selectedChannel.code}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedChannel.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedChannel.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedChannel.email}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={statusMap[selectedChannel.status]?.badge as any} text={statusMap[selectedChannel.status]?.text} />
              </Descriptions.Item>
              <Descriptions.Item label="分配额度">¥{selectedChannel.allocated.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="已用额度">¥{selectedChannel.used.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="剩余额度">¥{selectedChannel.remaining.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="使用率">
                <Progress percent={Math.round((selectedChannel.used / selectedChannel.allocated) * 100)} status={selectedChannel.status === 'exhausted' ? 'exception' : 'success'} />
              </Descriptions.Item>
              <Descriptions.Item label="下级渠道">{selectedChannel.subChannels} 家</Descriptions.Item>
              <Descriptions.Item label="关联用户">{selectedChannel.users} 人</Descriptions.Item>
              <Descriptions.Item label="历史订单">{selectedChannel.orders} 笔</Descriptions.Item>
              <Descriptions.Item label="今日用量">¥{selectedChannel.todayUsage}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedChannel.createdAt}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button icon={<EditOutlined />} onClick={() => setEditQuotaVisible(true)}>调整额度</Button>
              <Button icon={<ReloadOutlined />}>重置密码</Button>
              {selectedChannel.status !== 'inactive' ? (
                <Popconfirm title="确认停用该渠道？" onConfirm={() => message.success('已停用')}>
                  <Button danger icon={<StopOutlined />}>停用</Button>
                </Popconfirm>
              ) : (
                <Button type="primary" icon={<CheckCircleOutlined />}>启用</Button>
              )}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="添加渠道"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="渠道名称" rules={[{ required: true }]}>
            <Input placeholder="如：上海代理商A" />
          </Form.Item>
          <Form.Item name="code" label="渠道编码" rules={[{ required: true }]}>
            <Input placeholder="如：SHA001" />
          </Form.Item>
          <Form.Item name="contact" label="联系人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="allocated" label="初始额度" rules={[{ required: true }]}>
            <InputNumber prefix="¥" min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`调整额度 - ${selectedChannel?.name || ''}`}
        open={editQuotaVisible}
        onCancel={() => setEditQuotaVisible(false)}
        onOk={() => quotaForm.submit()}
      >
        <Form form={quotaForm} layout="vertical" onFinish={handleEditQuota}>
          <Form.Item name="allocated" label="新的分配额度" initialValue={selectedChannel?.allocated} rules={[{ required: true }]}>
            <InputNumber prefix="¥" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="调整原因">
            <Input.TextArea rows={3} placeholder="填写调整原因..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminChannels;