import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Badge, Space } from 'antd';
import { RobotOutlined, VideoCameraOutlined, PictureOutlined, ApiOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const packages = [
  {
    id: 1,
    name: 'AI体验卡',
    price: 19.9,
    tag: '新人首选',
    features: ['5亿Token', '10分钟视频', '20张图片'],
    models: ['通义千问3.7', '万相视频', '万相图像'],
    color: '#52c41a',
  },
  {
    id: 2,
    name: 'AI创作月卡',
    price: 59.9,
    originalPrice: 99.9,
    tag: '热销',
    features: ['30亿Token', '60分钟视频', '200张图片'],
    models: ['通义千问3.7', '万相视频', '万相图像'],
    color: '#1677ff',
    recommended: true,
  },
  {
    id: 3,
    name: 'AI专业月卡',
    price: 199,
    tag: '专业之选',
    features: ['150亿Token', '300分钟视频', '800张图片'],
    models: ['通义千问3.7-Max', '万相视频', '万相图像'],
    color: '#722ed1',
  },
];

const HomePage: React.FC = () => {
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
        <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>
          🚀 中国版 OpenRouter
        </Title>
        <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 32 }}>
          无需技术背景，购买套餐即可获得AI API Key<br />
          支持文本生成、视频创作、图像绘制
        </Text>
        <Space>
          <Button type="primary" size="large" onClick={() => navigate('/packages')}>
            立即选购套餐
          </Button>
          <Button size="large" ghost onClick={() => navigate('/login')}>
            免费体验
          </Button>
        </Space>
      </div>

      {/* 能力展示 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          强大的AI能力
        </Title>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <RobotOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
              <Title level={4}>文本生成</Title>
              <Text>通义千问3.7 / Max</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <VideoCameraOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>视频生成</Title>
              <Text>万相视频 720P/1080P</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <PictureOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
              <Title level={4}>图像生成</Title>
              <Text>万相绘图 高质量</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ textAlign: 'center' }}>
              <ApiOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
              <Title level={4}>API接入</Title>
              <Text>OpenAI兼容格式</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 套餐展示 */}
      <div style={{ padding: '48px 20px', background: '#f6ffed', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          选择适合您的套餐
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
                    onClick={() => navigate('/login')}
                  >
                    立即购买
                  </Button>
                ]}
              >
                {pkg.recommended && (
                  <Badge.Ribbon text="推荐" color={pkg.color}>
                    <div style={{ height: 20 }} />
                  </Badge.Ribbon>
                )}
                <div style={{ textAlign: 'center', paddingTop: pkg.recommended ? 16 : 0 }}>
                  <Title level={3}>{pkg.name}</Title>
                  <div style={{ margin: '16px 0' }}>
                    <Text style={{ fontSize: 36, fontWeight: 'bold', color: pkg.color }}>
                      ¥{pkg.price}
                    </Text>
                    {pkg.originalPrice && (
                      <Text delete style={{ marginLeft: 8, fontSize: 16 }}>
                        ¥{pkg.originalPrice}
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

      {/* 使用流程 */}
      <div style={{ padding: '48px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          简单四步，即刻使用
        </Title>
        <Row gutter={32} justify="center">
          {[
            { step: '1', title: '选择套餐', desc: '浏览并选择适合的AI套餐' },
            { step: '2', title: '支付宝支付', desc: '安全快捷的支付体验' },
            { step: '3', title: '获得API Key', desc: '系统自动生成专属Key' },
            { step: '4', title: '开始使用', desc: '接入第三方工具或在线体验' },
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

      {/* Footer */}
      <div style={{ padding: '32px 20px', textAlign: 'center', background: '#001529', color: 'rgba(255,255,255,0.65)' }}>
        <p>© 2026 寰卓. All rights reserved.</p>
        <p>隐私政策 | 服务条款 | 联系我们</p>
      </div>
    </div>
  );
};

export default HomePage;
