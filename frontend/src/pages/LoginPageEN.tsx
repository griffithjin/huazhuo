import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Tabs, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TabPane } = Tabs;

const LoginPageEN: React.FC = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('email');

  const onFinish = (values: any) => {
    console.log('Login:', values);
    message.success('Login successful');
    localStorage.setItem('access_token', 'mock_token');
    navigate('/en/user');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 420, borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            <GlobalOutlined style={{ marginRight: 8 }} />
            寰卓 AI
          </Title>
          <p style={{ color: '#8c8c8c' }}>Access China's Best AI Models from Anywhere</p>
        </div>

        <Tabs
          activeKey={loginType}
          onChange={setLoginType}
          centered
          style={{ marginBottom: 16 }}
        >
          <TabPane tab="Email Login" key="email">
            <Form onFinish={onFinish}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email address"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="code"
                rules={[{ required: true, message: 'Please enter verification code' }]}
              >
                <Input
                  prefix={<LockOutlined />}
                  placeholder="Verification code"
                  size="large"
                  suffix={
                    <Button type="link" onClick={() => message.info('Verification code sent: 123456')}>
                      Send Code
                    </Button>
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Login / Register
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Password" key="password">
            <Form onFinish={onFinish}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email address"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Login
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        <Divider>
          <span style={{ color: '#8c8c8c', fontSize: 12 }}>Or continue with</span>
        </Divider>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button style={{ width: 120 }}>Google</Button>
          <Button style={{ width: 120 }}>GitHub</Button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, color: '#8c8c8c', fontSize: 12 }}>
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          <p>China-based users: Some overseas-exclusive content may be restricted per local regulations.</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPageEN;
