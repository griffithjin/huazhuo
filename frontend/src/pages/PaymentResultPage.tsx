import React from 'react';
import { Card, Result, Button, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('status') === 'success';

  return (
    <div style={{ maxWidth: 600, margin: '100px auto', padding: 24 }}>
      <Card>
        <Result
          status={success ? 'success' : 'error'}
          icon={success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          title={success ? '支付成功！' : '支付失败'}
          subTitle={
            success
              ? '您的API Key已生成，可以开始使用AI能力了'
              : '支付遇到问题，请重新尝试或联系客服'
          }
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/user')}>
              进入用户中心
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>
              返回首页
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
};

export default PaymentResultPage;