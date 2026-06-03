import React, { useState } from 'react';
import { Table, Button, Tag, Space, Drawer, Descriptions, Modal, Form, Input, Select, Popconfirm, message, Card, Statistic, Row, Col, Tooltip, Badge } from 'antd';
import { EyeOutlined, CopyOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, ReloadOutlined, KeyOutlined, DollarOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons';

const AdminApiKeys: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const keys = [
    { id: 1001, name: 'AI创作月卡-默认Key', prefix: 'tk-abc123', fullKey: 'tk-abc123xxxxxxxxxxxx', balance: 58.35, status: 'active', user: '用户6688', userId: 10001, package: 'AI创作月卡', createdAt: '2026-06-01', expiresAt: '2026-07-02', totalUsage: 125.65, todayUsage: 2.15, calls: 3450, models: ['qwen3.7', 'wanx-video'] },
    { id: 1002, name: 'AI专业月卡-默认Key', prefix: 'tk-pro456', fullKey: 'tk-pro456xxxxxxxxxxxx', balance: 199.50, status: 'active', user: '创作者小王', userId: 10002, package: 'AI专业月卡', createdAt: '2026-06-01', expiresAt: '2026-07-02', totalUsage: 0.50, todayUsage: 0.50, calls: 120, models: ['qwen3.7-max'] },
    { id: 1003, name: 'AI体验卡-默认Key', prefix: 'tk-exp789', fullKey: 'tk-exp789xxxxxxxxxxxx', balance: 0.50, status: 'active', user: '开发者张三', userId: 10003, package: 'AI体验卡', createdAt: '2026-05-28', expiresAt: '2026-06-28', totalUsage: 19.40, todayUsage: 0.80, calls: 890, models: ['qwen3.7', 'wanx-image'] },
    { id: 1004, name: '已停用Key', prefix: 'tk-rev000', fullKey: 'tk-rev000xxxxxxxxxxxx', balance: 0, status: 'revoked', user: '测试账号', userId: 10006, package: 'AI体验卡', createdAt: '2026-05-15', expiresAt: '2026-06-15', totalUsage: 19.90, todayUsage: 0, calls: 0, models: [] },
  ];

  const filteredKeys = keys.filter(k => {
    const matchSearch = !searchText || k.name.includes(searchText) || k.prefix.includes(searchText) || k.user.includes(searchText);
    const matchStatus = statusFilter === 'all' || k.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusMap: Record<string, { text: string; color: string; badge: string }> = {
    active: { text: '正常', color: 'green', badge: 'success' },
    revoked: { text: '已停用', color: 'red', badge: 'error' },
    expired: { text: '已过期', color: 'orange', badge: 'warning' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70, },
    { title: '名称', dataIndex: 'name', render: (v: string, record: any) => (
      <div>
        <div>{v}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.prefix}****</div>
      </div>
    )},
    { title: '余额', dataIndex: 'balance', render: (v: number) => `¥${v.toFixed(2)}`, width: 100 },
    { title: '用户', dataIndex: 'user', render: (v: string, record: any) => (
      <div>
        <div>{v}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>ID: {record.userId}</div>
      </div>
    )},
    { title: '套餐', dataIndex: 'package', },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Badge status={statusMap[v]?.badge as any} text={statusMap[v]?.text} /> },
    { title: '今日用量', dataIndex: 'todayUsage', render: (v: number) => `¥${v.toFixed(2)}`, },
    { title: '有效期', dataIndex: 'expiresAt', render: (v: string) => v, },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedKey(record); setDrawerVisible(true); }}>详情</Button>
          <Tooltip title="复制Key">
            <Button size="small" icon={<CopyOutlined />} onClick={() => { message.success('Key已复制到剪贴板'); }} />
          </Tooltip>
          {record.status === 'active' ? (
            <Popconfirm title="确认停用该Key？" onConfirm={() => message.success('已停用')}>
              <Button size="small" danger icon={<StopOutlined />}>停用</Button>
            </Popconfirm>
          ) : (
            <Button size="small" icon={<CheckCircleOutlined />} type="primary">启用</Button>
          )}
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

  const totalActive = filteredKeys.filter(k => k.status === 'active').length;
  const totalBalance = filteredKeys.reduce((sum, k) => sum + k.balance, 0);
  const totalUsage = filteredKeys.reduce((sum, k) => sum + k.totalUsage, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>API Key 管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>创建Key</Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="活跃Key" value={totalActive} suffix="个" valueStyle={{ color: '#52c41a' }} prefix={<KeyOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="总余额" value={totalBalance.toFixed(2)} prefix={<DollarOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="累计用量" value={totalUsage.toFixed(2)} prefix={<ThunderboltOutlined />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>

        <Space wrap style={{ marginBottom: 8 }}>
          <Input 
            placeholder="搜索Key/用户" 
            prefix={<SearchOutlined />} 
            style={{ width: 220 }} 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Select 
            placeholder="状态" 
            style={{ width: 120 }} 
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: '全部' },
              { value: 'active', label: '正常' },
              { value: 'revoked', label: '已停用' },
              { value: 'expired', label: '已过期' }
            ]} 
          />
        </Space>
      </div>

      <Table 
        dataSource={filteredKeys} 
        columns={columns} 
        rowKey="id" 
        scroll={{ x: 900 }}
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
              <Descriptions.Item label="Key ID">{selectedKey.id}</Descriptions.Item>
              <Descriptions.Item label="名称">{selectedKey.name}</Descriptions.Item>
              <Descriptions.Item label="Key前缀">{selectedKey.prefix}</Descriptions.Item>
              <Descriptions.Item label="完整Key">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code>{selectedKey.fullKey}</code>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => message.success('已复制')}>复制</Button>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="所属用户">{selectedKey.user} (ID: {selectedKey.userId})</Descriptions.Item>
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
              {selectedKey.status === 'active' ? (
                <Popconfirm title="确认停用该Key？" onConfirm={() => message.success('已停用')}>
                  <Button danger icon={<StopOutlined />}>停用Key</Button>
                </Popconfirm>
              ) : (
                <Button type="primary" icon={<CheckCircleOutlined />}>启用Key</Button>
              )}
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
          <Form.Item name="userId" label="所属用户" rules={[{ required: true }]}>
            <Select placeholder="选择用户" options={[
              { value: 10001, label: '用户6688' },
              { value: 10002, label: '创作者小王' },
              { value: 10003, label: '开发者张三' },
            ]} />
          </Form.Item>
          <Form.Item name="packageId" label="关联套餐" rules={[{ required: true }]}>
            <Select placeholder="选择套餐" options={[
              { value: 1, label: 'AI体验卡' },
              { value: 2, label: 'AI创作月卡' },
              { value: 3, label: 'AI专业月卡' },
            ]} />
          </Form.Item>
          <Form.Item name="initialBalance" label="初始余额" initialValue={0}>
            <Input prefix="¥" type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="expiresAt" label="有效期至">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminApiKeys;