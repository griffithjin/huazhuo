import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    // TODO: 调用登录API
    console.log('登录:', values);
    message.success('登录成功');
    localStorage.setItem('access_token', 'mock_token');
    navigate('/user');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3}>寰卓</Title>
          <p style={{ color: '#8c8c8c' }}>手机号验证码登录</p>
        </div>
        
        <Form onFinish={onFinish}>
          <Form.Item 
            name="phone" 
            rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="手机号" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item 
            name="code" 
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input 
              prefix={<LockOutlined />} 
              placeholder="验证码" 
              size="large"
              suffix={
                <Button type="link" onClick={() => message.info('验证码已发送：123456')}>
                  获取验证码
                </Button>
              }
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
