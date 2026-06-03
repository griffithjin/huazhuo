import React from 'react';
import { Card, Table, Typography } from 'antd';

const { Title } = Typography;

const UserUsage: React.FC = () => {
  const data = [
    { id: 1, model: '通义千问3.7', type: 'chat', inputTokens: 500, outputTokens: 1200, cost: 0.0017, time: '2026-06-01 14:30' },
  ];

  const columns = [
    { title: '模型', dataIndex: 'model' },
    { title: '类型', dataIndex: 'type' },
    { title: '输入Token', dataIndex: 'inputTokens' },
    { title: '输出Token', dataIndex: 'outputTokens' },
    { title: '费用', dataIndex: 'cost', render: (v: number) => `¥${v}` },
    { title: '时间', dataIndex: 'time' },
  ];

  return (
    <div>
      <Title level={4}>用量统计</Title>
      <Card title="调用记录">
        <Table dataSource={data} columns={columns} rowKey="id" />
      </Card>
    </div>
  );
};

export default UserUsage;