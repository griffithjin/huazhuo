import React from 'react';
import { Card, Button, Descriptions, Tag, QRCode, message } from 'antd';
import { useParams } from 'react-router-dom';

const PaymentPage: React.FC = () => {
  const { orderUuid } = useParams();

  const handlePay = () => {
    message.success('支付成功！');
    window.location.href = '/pay/result?status=success';
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 24 }}>
      <Card title="订单支付">
        <Descriptions column={1}>
          <Descriptions.Item label="订单号">ORD202606010001</Descriptions.Item>
          <Descriptions.Item label="套餐">AI创作月卡</Descriptions.Item>
          <Descriptions.Item label="金额">
            <Tag color="red" style={{ fontSize: 18 }}>¥59.90</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">支付宝</Descriptions.Item>
        </Descriptions>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <div style={{ marginBottom: 16 }}>扫码支付</div>
          <QRCode value="https://www.alipay.com" size={200} />
        </div>

        <Button type="primary" block size="large" onClick={handlePay}>
          模拟支付成功
        </Button>
      </Card>
    </div>
  );
};

export default PaymentPage;