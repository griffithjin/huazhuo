import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Progress, Popconfirm, message, Badge, Drawer, Descriptions, Tooltip, Row, Col, Statistic } from 'antd';
import { CopyOutlined, EyeOutlined, ReloadOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, KeyOutlined, DollarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const UserApiKeys: React.FC = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const keys = [
    { id: 1, name: 'AI创作月卡-默认Key', prefix: 'tk-abc123', fullKey: 'tk-abc123xxxxxxxxxxxx', balance: 58.35, status: 'active', package: 'AI创作月卡', expiresAt: '2026-07-02', totalUsage: 125.65, todayUsage: 2.15, calls: 3450, models: ['qwen3.7', 'wanx-video'], createdAt: '2026-06-01' },
    { id: 2, name: 'AI体验卡-默认Key', prefix: 'tk-exp789', fullKey: 'tk-exp789xxxxxxxxxxxx', balance: 0.50, status: 'active', package: 'AI体验卡', expiresAt: '2026-06-28', totalUsage: 19.40, todayUsage: 0.80, calls: 890, models: ['qwen3.7', 'wanx-image'], createdAt: '2026-05-28' },
    { id: 3, name: '已过期Key', prefix: 'tk-old111', fullKey: 'tk-old111xxxxxxxxxxxx', balance: 0, status: 'expired', package: 'AI体验卡', expiresAt: '2026-05-01', totalUsage: 19.90, todayUsage: 0, calls: 0, models: [], createdAt: '2026-04-01' },
  ];

  const statusMap: Record<string, { text: string; color: string; badge: string }> = {
    active: { text: '正常', color: 'green', badge: 'success' },
    revoked: { text: '已停用', color: 'red', badge: 'error' },
    expired: { text: '已过期', color: 'orange', badge: 'warning' },
  };

  const columns = [
    { title: '名称', dataIndex: 'name', render: (v: string, record: any) => (
      <div>
        <div>{v}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.prefix}****</div>
      </div>
    )},
    { title: '余额', dataIndex: 'balance', render: (v: number) => `¥${v.toFixed(2)}`, width: 100 },
    { title: '套餐', dataIndex: 'package', },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Badge status={statusMap[v]?.badge as any} text={statusMap[v]?.text} /> },
    { title: '有效期', dataIndex: 'expiresAt', },
    { title: '今日用量', dataIndex: 'todayUsage', render: (v: number) => `¥${v.toFixed(2)}`, },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="复制Key">
            <Button size="small" icon={<CopyOutlined />} onClick={() => { message.success('Key已复制'); }} />
          </Tooltip>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedKey(record); setDrawerVisible(true); }}>详情</Button>
          <Button size="small" type="primary" onClick={() => navigate('/packages')}>续费</Button>
        </Space>
      )
    }
  ];

  const handleCreate = (values: any) => {
    console.log(values);
    message.success('API Key创建成功');
    setModalVisible(false);
    form.resetFields();
  };

  const totalActive = keys.filter(k => k.status === 'active').length;
  const totalBalance = keys.reduce((sum, k) => sum + k.balance, 0);
  const totalUsage = keys.reduce((sum, k) => sum + k.todayUsage, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>我的API Keys</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>创建Key</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic title="活跃Key" value={totalActive} suffix="个" valueStyle={{ color: '#52c41a' }} prefix={<KeyOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic title="总余额" value={totalBalance.toFixed(2)} prefix={<DollarOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic title="今日用量" value={totalUsage.toFixed(2)} prefix={<ThunderboltOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={keys}
        columns={columns}
        rowKey="id"
        scroll={{ x: 700 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
      />

      <Drawer
        title="API Key 详情"
        placement="right"
        width={480}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedKey && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Key名称">{selectedKey.name}</Descriptions.Item>
              <Descriptions.Item label="Key前缀">{selectedKey.prefix}</Descriptions.Item>
              <Descriptions.Item label="完整Key">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code>{selectedKey.fullKey}</code>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => message.success('已复制')}>复制</Button>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="关联套餐">{selectedKey.package}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={statusMap[selectedKey.status]?.badge as any} text={statusMap[selectedKey.status]?.text} />
              </Descriptions.Item>
              <Descriptions.Item label="当前余额">¥{selectedKey.balance.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="累计用量">¥{selectedKey.totalUsage.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="今日用量">¥{selectedKey.todayUsage.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="调用次数">{selectedKey.calls} 次</Descriptions.Item>
              <Descriptions.Item label="支持模型">{selectedKey.models.join(', ') || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedKey.createdAt}</Descriptions.Item>
              <Descriptions.Item label="过期时间">{selectedKey.expiresAt}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={() => navigate('/packages')}>立即续费</Button>
              <Button icon={<ReloadOutlined />}>重置Key</Button>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="创建API Key"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Key名称" rules={[{ required: true }]}>
            <Input placeholder="如：项目A专用Key" />
          </Form.Item>
          <Form.Item name="packageId" label="关联套餐" rules={[{ required: true }]}>
            <Select placeholder="选择套餐" options={[
              { value: 1, label: 'AI体验卡' },
              { value: 2, label: 'AI创作月卡' },
              { value: 3, label: 'AI专业月卡' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserApiKeys;