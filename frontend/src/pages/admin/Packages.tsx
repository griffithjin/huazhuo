import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

const AdminPackages: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const packages = [
    { id: 1, name: 'AI体验卡', code: 'EXPERIENCE', price: 19.9, cost: 12, status: 'active', isPublic: true },
    { id: 2, name: 'AI创作月卡', code: 'CREATOR_MONTHLY', price: 59.9, cost: 35, status: 'active', isPublic: true },
    { id: 3, name: 'AI专业月卡', code: 'PRO_MONTHLY', price: 199, cost: 120, status: 'active', isPublic: true },
  ];

  const columns = [
    { title: '套餐名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '售价', dataIndex: 'price', render: (v: number) => `¥${v}` },
    { title: '成本', dataIndex: 'cost', render: (v: number) => `¥${v}` },
    { title: '状态', dataIndex: 'status', render: () => <Tag color="green">上架</Tag> },
    { title: '公开', dataIndex: 'isPublic', render: () => <Tag>是</Tag> },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">查看</Button>
          <Button icon={<EditOutlined />} size="small">编辑</Button>
        </Space>
      )
    }
  ];

  const handleCreate = (values: any) => {
    console.log(values);
    message.success('创建成功');
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>套餐管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          创建套餐
        </Button>
      </div>

      <Table dataSource={packages} columns={columns} rowKey="id" />

      <Modal
        title="创建套餐"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="套餐名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="套餐编码" rules={[{ required: true }]}>
            <Input placeholder="如: CREATOR_MONTHLY" />
          </Form.Item>
          <Form.Item name="description" label="套餐描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="售价" rules={[{ required: true }]}>
            <InputNumber prefix="¥" min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cost_price" label="成本价" rules={[{ required: true }]}>
            <InputNumber prefix="¥" min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration_days" label="有效期(天)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select options={[
              { value: 'active', label: '上架' },
              { value: 'inactive', label: '下架' }
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPackages;