import React from 'react';
import { Card, Button, Typography, Descriptions, Tag, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PackageDetailPage: React.FC = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const pkg = {
    name: 'AI创作月卡',
    code: 'CREATOR_MONTHLY',
    price: 59.9,
    originalPrice: 99.9,
    description: '适合内容创作者，包含文本+视频+图像全能套餐',
    durationDays: 30,
    features: ['联网搜索', '代码解释器', '文件解析'],
    models: [
      { id: 'qwen3.7', name: '通义千问3.7', limit: '30亿Token', capability: 'chat' },
      { id: 'wanx2.1-video', name: '万相视频生成', limit: '60分钟', capability: 'video' },
      { id: 'wanx2.1-image', name: '万相图像生成', limit: '200张', capability: 'image' },
    ]
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>{pkg.name}</Title>
          <Tag color="red">热销</Tag>
          
          <div style={{ margin: '24px 0' }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1677ff' }}>¥{pkg.price}</Text>
            <Text delete style={{ marginLeft: 16, fontSize: 20 }}>¥{pkg.originalPrice}</Text>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>有效期：{pkg.durationDays}天</Text>
          </div>
        </div>

        <Descriptions title="套餐内容" bordered column={1}>
          {pkg.models.map(m => (
            <Descriptions.Item key={m.id} label={m.name}>
              {m.limit}
            </Descriptions.Item>
          ))}
          <Descriptions.Item label="功能特性">
            <Space>
              {pkg.features.map(f => <Tag key={f}>{f}</Tag>)}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            立即购买
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PackageDetailPage;