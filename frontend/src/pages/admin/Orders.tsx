import React, { useState } from 'react';
import { Table, Button, Tag, Space, Drawer, Descriptions, DatePicker, Input, Select, Popconfirm, message, Badge, Statistic, Row, Col, Card } from 'antd';
import { EyeOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const AdminOrders: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payStatusFilter, setPayStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const orders = [
    { id: 1, orderNo: 'ORD202606020001', user: '用户6688', userId: 10001, phone: '138****6688', package: 'AI创作月卡', packageId: 2, amount: 59.9, status: 'completed', payStatus: 'paid', payMethod: 'alipay', createdAt: '2026-06-02 14:32', paidAt: '2026-06-02 14:33' },
    { id: 2, orderNo: 'ORD202606020002', user: '创作者小王', userId: 10002, phone: '139****1234', package: 'AI专业月卡', packageId: 3, amount: 199, status: 'completed', payStatus: 'paid', payMethod: 'alipay', createdAt: '2026-06-02 13:15', paidAt: '2026-06-02 13:16' },
    { id: 3, orderNo: 'ORD202606020003', user: '开发者张三', userId: 10003, phone: '137****5678', package: 'AI创作月卡', packageId: 2, amount: 59.9, status: 'paid', payStatus: 'paid', payMethod: 'wechat', createdAt: '2026-06-02 12:08', paidAt: '2026-06-02 12:10' },
    { id: 4, orderNo: 'ORD202606020004', user: '设计师李四', userId: 10004, phone: '136****9012', package: 'AI专业月卡', packageId: 3, amount: 199, status: 'pending', payStatus: 'unpaid', payMethod: '', createdAt: '2026-06-02 11:45', paidAt: '' },
    { id: 5, orderNo: 'ORD202606020005', user: '运营王五', userId: 10005, phone: '135****3456', package: 'AI体验卡', packageId: 1, amount: 19.9, status: 'completed', payStatus: 'paid', payMethod: 'alipay', createdAt: '2026-06-02 10:22', paidAt: '2026-06-02 10:23' },
    { id: 6, orderNo: 'ORD202606020006', user: '测试账号', userId: 10006, phone: '133****7890', package: 'AI体验卡', packageId: 1, amount: 19.9, status: 'refunded', payStatus: 'refunded', payMethod: 'alipay', createdAt: '2026-06-02 09:15', paidAt: '2026-06-02 09:16' },
  ];

  const filteredOrders = orders.filter(o => {
    const matchSearch = !searchText || o.orderNo.includes(searchText) || o.user.includes(searchText);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchPay = payStatusFilter === 'all' || o.payStatus === payStatusFilter;
    const matchDate = !dateRange || !dateRange[0] || !dateRange[1] || 
      (dayjs(o.createdAt).isAfter(dateRange[0]) && dayjs(o.createdAt).isBefore(dateRange[1].add(1, 'day')));
    return matchSearch && matchStatus && matchPay && matchDate;
  });

  const statusMap: Record<string, { text: string; color: string }> = {
    completed: { text: '已完成', color: 'green' },
    paid: { text: '已支付', color: 'blue' },
    pending: { text: '待处理', color: 'orange' },
    refunded: { text: '已退款', color: 'red' },
    cancelled: { text: '已取消', color: 'default' },
  };

  const payStatusMap: Record<string, { text: string; color: string }> = {
    paid: { text: '已支付', color: 'success' },
    unpaid: { text: '未支付', color: 'warning' },
    refunded: { text: '已退款', color: 'error' },
  };

  const payMethodMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    '': '-',
  };

  const totalAmount = filteredOrders.reduce((sum, o) => sum + (o.payStatus === 'paid' ? o.amount : 0), 0);
  const totalCount = filteredOrders.length;
  const paidCount = filteredOrders.filter(o => o.payStatus === 'paid').length;

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, fixed: 'left' as const },
    { title: '用户', dataIndex: 'user', render: (_: any, record: any) => (
      <div>
        <div>{record.user}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.phone}</div>
      </div>
    )},
    { title: '套餐', dataIndex: 'package' },
    { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toFixed(2)}`, width: 100 },
    { title: '支付状态', dataIndex: 'payStatus', render: (v: string) => <Badge status={payStatusMap[v]?.color as any} text={payStatusMap[v]?.text} /> },
    { title: '订单状态', dataIndex: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '支付方式', dataIndex: 'payMethod', render: (v: string) => payMethodMap[v] || v, },
    { title: '创建时间', dataIndex: 'createdAt', width: 150, },
    {
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedOrder(record); setDrawerVisible(true); }}>详情</Button>
          {record.payStatus === 'paid' && record.status !== 'refunded' && (
            <Popconfirm title="确认退款？" onConfirm={() => message.success('退款成功')}>
              <Button size="small" danger icon={<CloseCircleOutlined />}>退款</Button>
            </Popconfirm>
          )}
          {record.status === 'pending' && (
            <Button size="small" icon={<CheckCircleOutlined />} type="primary">确认</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 16 }}>订单管理</h2>
        
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="订单总数" value={totalCount} suffix="笔" />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="已支付" value={paidCount} suffix="笔" valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="总金额" value={totalAmount.toFixed(2)} prefix="¥" valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Card size="small">
              <Statistic title="待处理" value={filteredOrders.filter(o => o.status === 'pending').length} suffix="笔" valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
        </Row>

        {/* 过滤器 */}
        <Space wrap style={{ marginBottom: 8 }}>
          <Input 
            placeholder="搜索订单号/用户" 
            prefix={<SearchOutlined />} 
            style={{ width: 220 }} 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <DatePicker.RangePicker 
            size="middle" 
            value={dateRange as any}
            onChange={setDateRange as any}
          />
          <Select 
            placeholder="订单状态" 
            style={{ width: 120 }} 
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'completed', label: '已完成' },
              { value: 'paid', label: '已支付' },
              { value: 'pending', label: '待处理' },
              { value: 'refunded', label: '已退款' },
            ]} 
          />
          <Select 
            placeholder="支付状态" 
            style={{ width: 120 }} 
            value={payStatusFilter}
            onChange={setPayStatusFilter}
            options={[
              { value: 'all', label: '全部支付' },
              { value: 'paid', label: '已支付' },
              { value: 'unpaid', label: '未支付' },
              { value: 'refunded', label: '已退款' },
            ]} 
          />
          <Button icon={<FilterOutlined />}>导出</Button>
        </Space>
      </div>

      <Table 
        dataSource={filteredOrders} 
        columns={columns} 
        rowKey="id" 
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
      />

      <Drawer
        title={`订单详情 ${selectedOrder?.orderNo || ''}`}
        placement="right"
        width={520}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedOrder && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="订单号">{selectedOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="用户">{selectedOrder.user} ({selectedOrder.phone})</Descriptions.Item>
              <Descriptions.Item label="套餐">{selectedOrder.package}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{selectedOrder.amount.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="支付状态">
                <Badge status={payStatusMap[selectedOrder.payStatus]?.color as any} text={payStatusMap[selectedOrder.payStatus]?.text} />
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={statusMap[selectedOrder.status]?.color}>{statusMap[selectedOrder.status]?.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">{payMethodMap[selectedOrder.payMethod] || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedOrder.createdAt}</Descriptions.Item>
              <Descriptions.Item label="支付时间">{selectedOrder.paidAt || '-'}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {selectedOrder.payStatus === 'paid' && selectedOrder.status !== 'refunded' && (
                <Popconfirm title="确认退款？" onConfirm={() => message.success('退款成功')}>
                  <Button danger icon={<CloseCircleOutlined />}>退款</Button>
                </Popconfirm>
              )}
              <Button icon={<ReloadOutlined />}>重新通知</Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default AdminOrders;