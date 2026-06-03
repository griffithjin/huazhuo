import React from 'react';
import { Card, Descriptions, Button, Tag, List } from 'antd';

const UserOrders: React.FC = () => {
  const orders = [
    { id: 1, orderNo: 'ORD202606010001', package: 'AI创作月卡', amount: 59.9, status: '已完成', createdAt: '2026-06-01 14:32' },
  ];

  return (
    <div>
      <h2>订单记录</h2>
      <List>
        {orders.map(order => (
          <List.Item key={order.id}>
            <Card style={{ width: '100%' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
                <Descriptions.Item label="套餐">{order.package}</Descriptions.Item>
                <Descriptions.Item label="金额">¥{order.amount}</Descriptions.Item>
                <Descriptions.Item label="状态"><Tag color="green">{order.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="创建时间">{order.createdAt}</Descriptions.Item>
              </Descriptions>
            </Card>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default UserOrders;