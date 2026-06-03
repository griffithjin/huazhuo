import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Badge, Space, Tag } from 'antd';
import { RobotOutlined, VideoCameraOutlined, PictureOutlined, ApiOutlined, GlobalOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const packages = [
  {
    id: 1,
    name: 'AI Starter',
    price: 2.8,
    tag: 'Best for Beginners',
    features: ['500M Tokens', '10 min Video', '20 Images'],
    models: ['Qwen 3.7', 'Seedance 2.0', 'Wanxiang Image'],
    color: '#52c41a',
  },
  {
    id: 2,
    name: 'AI Creator Monthly',
    price: 8.3,
    originalPrice: 13.9,
    tag: 'Most Popular',
    features: ['3B Tokens', '60 min Video', '200 Images'],
    models: ['Qwen 3.7', 'Seedance 2.0', 'Wanxiang Image'],
    color: '#1677ff',
    recommended: true,
  },
  {
    id: 3,
    name: 'AI Pro Monthly',
    price: 27.6,
    tag: 'Professional Choice',
    features: ['15B Tokens', '300 min Video', '800 Images'],
    models: ['Qwen 3.7-Max', 'Seedance 2.0 Pro', 'Wanxiang Image'],
    color: '#722ed1',
  },
];

const HomePageEN: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fff' }}>
      {/* Hero区域 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '80px 20px', 
        textAlign: 'center',
        color: '#fff'
      }}>
        <div style={{ marginBottom: 16 }}>
          <Tag color="gold" style={{ fontSize: 14, padding: '4px 12px' }}>
            <GlobalOutlined /> 寰卓 AI COMPUTE LIMITED
          </Tag>
        </div>
        <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>
          Access China's Best AI Models from Anywhere
        </Title>
        <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
          Hyper Smart AI Limitless
        </Text>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', display: 'block', marginBottom: 32 }}>
          No technical background needed. Buy a package, get your API Key instantly.<br />
          Powered by <a href="https://modeltop.ai/docs/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700', textDecoration: 'underline' }}>modeltop.ai</a> — China's top AI model aggregator
        </Text>
        <Space>
          <Button type="primary" size="large" onClick={() => navigate('/en/packages')}>
            Explore Packages
          </Button>
          <Button size="large" ghost onClick={() => navigate('/en/login')}>
            Try Free
          </Button>
        </Space>
      </div>

      {/* 海外专属卖点 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto', background: '#f0f5ff' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Why Overseas Users Choose Us
        </Title>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <GlobalOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
              <Title level={4}>Access China's Top AI</Title>
              <Text>Qwen series, DeepSeek, GLM — models you can't easily access outside China</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <ThunderboltOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>One API, All Models</Title>
              <Text>Single API key for 20+ models. Switch instantly. No separate accounts needed.</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
              <SafetyOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
              <Title level={4}>Global Payments</Title>
              <Text>PayPal / Visa / Mastercard / HSBC. USD pricing. No Chinese bank account required.</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 能力展示 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Powerful AI Capabilities
        </Title>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <RobotOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
              <Title level={4}>Text Generation</Title>
              <Text>Qwen 3.7 / Max, DeepSeek-V4, GLM-5.1</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <VideoCameraOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>Video Generation</Title>
              <Text>Seedance 2.0 — Overseas Exclusive<br />Wanxiang 720P/1080P</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <PictureOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
              <Title level={4}>Image Generation</Title>
              <Text>Wanxiang Image 2.0 / Pro<br />High-quality generation</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <ApiOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
              <Title level={4}>API Access</Title>
              <Text>OpenAI-compatible format<br />Drop-in replacement</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 套餐展示 */}
      <div style={{ padding: '48px 20px', background: '#f6ffed', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Choose Your Package
        </Title>
        <Row gutter={[24, 24]} justify="center">
          {packages.map(pkg => (
            <Col xs={24} md={8} key={pkg.id}>
              <Card 
                hoverable 
                style={{ 
                  borderRadius: 12,
                  border: pkg.recommended ? `2px solid ${pkg.color}` : 'none',
                  position: 'relative'
                }}
                actions={[
                  <Button 
                    type={pkg.recommended ? 'primary' : 'default'} 
                    block 
                    size="large"
                    onClick={() => navigate('/en/login')}
                  >
                    Get Started
                  </Button>
                ]}
              >
                {pkg.recommended && (
                  <Badge.Ribbon text="POPULAR" color={pkg.color}>
                    <div style={{ height: 20 }} />
                  </Badge.Ribbon>
                )}
                <div style={{ textAlign: 'center', paddingTop: pkg.recommended ? 16 : 0 }}>
                  <Title level={3}>{pkg.name}</Title>
                  <div style={{ margin: '16px 0' }}>
                    <Text style={{ fontSize: 36, fontWeight: 'bold', color: pkg.color }}>
                      ${pkg.price}
                    </Text>
                    {pkg.originalPrice && (
                      <Text delete style={{ marginLeft: 8, fontSize: 16 }}>
                        ${pkg.originalPrice}
                      </Text>
                    )}
                    <Text style={{ display: 'block', color: '#8c8c8c' }}>
                      / {pkg.tag}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'left', marginTop: 24 }}>
                    {pkg.features.map((f, i) => (
                      <div key={i} style={{ margin: '8px 0' }}>
                        ✅ {f}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Seedance 2.0 海外专属亮点 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto', background: '#fff2f0' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          🎬 Seedance 2.0 — Overseas Exclusive
        </Title>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <Card>
              <Title level={4}>Professional AI Video Generation</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>Multiple artistic styles and visual effects</li>
                <li>Character consistency across scenes</li>
                <li>720P / 1080P / 4K output options</li>
                <li>Commercial usage license included</li>
                <li>Powered by Higgsfield AI via ModelTop</li>
              </ul>
              <Tag color="red">Non-China Users Only</Tag>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                China-based users are restricted from accessing overseas-exclusive content per compliance requirements.
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ textAlign: 'center', background: '#f6f0ff' }}>
              <VideoCameraOutlined style={{ fontSize: 64, color: '#f5222d', marginBottom: 16 }} />
              <Title level={3}>Seedance 2.0</Title>
              <Text style={{ fontSize: 16 }}>The most advanced AI video model for overseas creators</Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" size="large" onClick={() => navigate('/en/models')}>
                  Explore Video Models
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 使用流程 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Get Started in 4 Simple Steps
        </Title>
        <Row gutter={32} justify="center">
          {[
            { step: '1', title: 'Choose Package', desc: 'Browse and select the plan that fits your needs' },
            { step: '2', title: 'Pay Securely', desc: 'PayPal, Visa, Mastercard, or HSBC transfer' },
            { step: '3', title: 'Get API Key', desc: 'Your exclusive API Key is generated automatically' },
            { step: '4', title: 'Start Creating', desc: 'Integrate with your tools or use our playground' },
          ].map(item => (
            <Col xs={12} md={6} key={item.step}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 60, height: 60, borderRadius: '50%', 
                  background: '#1677ff', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 'bold', margin: '0 auto 16px'
                }}>
                  {item.step}
                </div>
                <Title level={4}>{item.title}</Title>
                <Text type="secondary">{item.desc}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* API接入说明 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto', background: '#f6ffed' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Easy API Integration
        </Title>
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <pre style={{ background: '#f6f8fa', padding: 16, borderRadius: 8, overflow: 'auto' }}>
            <code>{`curl https://api.modeltop.ai/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen-plus",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }'`}</code>
          </pre>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">Base URL: </Text>
            <Text code copyable>https://modeltop.ai/docs/</Text>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div style={{ padding: '32px 20px', textAlign: 'center', background: '#001529', color: 'rgba(255,255,255,0.65)' }}>
        <p>© 2026 寰卓 AI COMPUTE LIMITED. All rights reserved.</p>
        <p>寰卓 — Hyper Smart AI Limitless</p>
        <p>Privacy Policy | Terms of Service | Contact Us</p>
      </div>
    </div>
  );
};

export default HomePageEN;
