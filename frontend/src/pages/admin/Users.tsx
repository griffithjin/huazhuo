import React, { useState } from 'react';
import { Table, Button, Tag, Space, Input, Select, Drawer, Descriptions, Avatar, Badge, Pagination, Popconfirm, message } from 'antd';
import { SearchOutlined, UserOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';

const AdminUsers: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const users = [
    { id: 10001, nickname: '用户6688', phone: '138****6688', email: 'user6688@example.com', role: 'consumer', status: 'active', createdAt: '2026-06-01', balance: 58.35, orders: 12, avatar: '' },
    { id: 10002, nickname: '创作者小王', phone: '139****1234', email: 'creator@example.com', role: 'consumer', status: 'active', createdAt: '2026-06-01', balance: 199.50, orders: 5, avatar: '' },
    { id: 10003, nickname: '开发者张三', phone: '137****5678', email: 'dev@example.com', role: 'channel', status: 'active', createdAt: '2026-05-28', balance: 2000, orders: 48, avatar: '' },
    { id: 10004, nickname: '设计师李四', phone: '136****9012', email: 'design@example.com', role: 'consumer', status: 'inactive', createdAt: '2026-05-25', balance: 0, orders: 0, avatar: '' },
    { id: 10005, nickname: '运营王五', phone: '135****3456', email: 'ops@example.com', role: 'channel', status: 'active', createdAt: '2026-05-20', balance: 500, orders: 23, avatar: '' },
    { id: 10006, nickname: '测试账号', phone: '133****7890', email: 'test@example.com', role: 'consumer', status: 'inactive', createdAt: '2026-05-15', balance: 19.9, orders: 1, avatar: '' },
  ];

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchText || u.nickname.includes(searchText) || u.phone.includes(searchText) || u.id.toString().includes(searchText);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const roleMap: Record<string, { text: string; color: string }> = {
    consumer: { text: '消费者', color: 'blue' },
    channel: { text: '渠道商', color: 'purple' },
    admin: { text: '管理员', color: 'red' },
  };

  const statusMap: Record<string, { text: string; color: string }> = {
    active: { text: '正常', color: 'green' },
    inactive: { text: '禁用', color: 'red' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80, },
    { 
      title: '用户信息', 
      render: (record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.nickname}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.phone}</div>
          </div>
        </Space>
      )
    },
    { title: '角色', dataIndex: 'role', render: (v: string) => <Tag color={roleMap[v]?.color}>{roleMap[v]?.text || v}</Tag> },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Badge status={v === 'active' ? 'success' : 'error'} text={statusMap[v]?.text || v} /> },
    { title: '余额', dataIndex: 'balance', render: (v: number) => `¥${v.toFixed(2)}`, },
    { title: '订单数', dataIndex: 'orders', },
    { title: '注册时间', dataIndex: 'createdAt', },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedUser(record); setDrawerVisible(true); }}>详情</Button>
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          {record.status === 'active' ? (
            <Popconfirm title="确认禁用该用户？" onConfirm={() => message.success('已禁用')}>
              <Button size="small" icon={<StopOutlined />} danger>禁用</Button>
            </Popconfirm>
          ) : (
            <Button size="small" icon={<CheckCircleOutlined />} type="primary">启用</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Space wrap>
          <Input 
            placeholder="搜索用户(ID/昵称/手机)" 
            prefix={<SearchOutlined />} 
            style={{ width: 240 }} 
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
              { value: 'inactive', label: '禁用' }
            ]} 
          />
        </Space>
      </div>

      <Table 
        dataSource={filteredUsers} 
        columns={columns} 
        rowKey="id" 
        scroll={{ x: 800 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
      />

      <Drawer
        title="用户详情"
        placement="right"
        width={480}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedUser && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff', marginBottom: 12 }} />
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>{selectedUser.nickname}</div>
              <Tag color={roleMap[selectedUser.role]?.color}>{roleMap[selectedUser.role]?.text}</Tag>
            </div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="用户ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="手机号">{selectedUser.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={selectedUser.status === 'active' ? 'success' : 'error'} text={statusMap[selectedUser.status]?.text} />
              </Descriptions.Item>
              <Descriptions.Item label="账户余额">¥{selectedUser.balance.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="历史订单">{selectedUser.orders} 笔</Descriptions.Item>
              <Descriptions.Item label="注册时间">{selectedUser.createdAt}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default AdminUsers;