import React, { useState, useEffect } from 'react';
import { Modal, Button, Steps, Typography, Card, Progress, Tag, Space, Avatar } from 'antd';
import { RocketOutlined, ApiOutlined, CreditCardOutlined, ExperimentOutlined, TrophyOutlined, TeamOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface OnboardingProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingProps> = ({ visible, onClose, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const steps = [
    {
      title: 'Welcome to 寰卓',
      icon: <RocketOutlined />,
      description: 'Your Gateway to China\'s Best AI Models',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Avatar size={80} icon={<GlobalOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 20 }} />
          <Title level={3}>Hyper Smart AI Limitless</Title>
          <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            寰卓 是中国版 OpenRouter，让你一键接入全球顶级AI模型。
            <br />
            海外用户更可享受中国顶级大模型（Qwen/DeepSeek/GLM）！
          </Paragraph>
          <div style={{ marginTop: 20 }}>
            <Tag color="blue">🤖 100+ AI Models</Tag>
            <Tag color="green">⚡ 毫秒级响应</Tag>
            <Tag color="orange">💰 82折定价</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Choose Your First Model',
      icon: <ApiOutlined />,
      description: 'Explore and select AI models',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Title level={4}>推荐模型</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small" style={{ borderLeft: '3px solid #1890ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Qwen-Plus</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>阿里通义千问，中文最强</Paragraph>
                </div>
                <Tag color="green">推荐</Tag>
              </div>
            </Card>
            <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>DeepSeek-V3</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>深度求索，代码神器</Paragraph>
                </div>
                <Tag color="green">热门</Tag>
              </div>
            </Card>
            <Card size="small" style={{ borderLeft: '3px solid #fa8c16' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>GLM-4</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>智谱AI，全能选手</Paragraph>
                </div>
                <Tag color="orange">国产</Tag>
              </div>
            </Card>
          </Space>
        </div>
      )
    },
    {
      title: 'Get Your API Key',
      icon: <ApiOutlined />,
      description: 'Generate API Key for integration',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Card style={{ maxWidth: 500, margin: '0 auto', background: '#f6ffed' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Your API Key is Ready</Title>
            <Paragraph>
              <Text code style={{ fontSize: 16, padding: '8px 16px' }}>
                sk-寰卓-xxxxxxxxxxxx
              </Text>
            </Paragraph>
            <Paragraph type="secondary">
              复制此Key，在代码中替换即可开始调用
            </Paragraph>
            <div style={{ marginTop: 16, textAlign: 'left', fontSize: 12, background: '#fff', padding: 12, borderRadius: 4 }}>
              <Text strong>Python 示例：</Text><br/>
              <Text type="secondary">import openai</Text><br/>
              <Text type="secondary">client = openai.OpenAI(api_key="sk-寰卓-xxx", base_url="https://api.huazhuo.tech/v1")</Text><br/>
              <Text type="secondary">response = client.chat.completions.create(model="qwen-plus", messages=[...])</Text>
            </div>
          </Card>
        </div>
      )
    },
    {
      title: 'Recharge & Save',
      icon: <CreditCardOutlined />,
      description: 'Flexible pricing with 82% discount',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Title level={4}>选择套餐</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>🎁 体验卡</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>¥19.9 / 100万 tokens</Paragraph>
                </div>
                <Tag color="blue">入门</Tag>
              </div>
            </Card>
            <Card size="small" style={{ border: '2px solid #1890ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>⭐ 创作月卡</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>¥59.9 / 500万 tokens</Paragraph>
                </div>
                <div>
                  <Tag color="green">🔥 热销</Tag>
                  <Tag color="red">省¥20</Tag>
                </div>
              </div>
            </Card>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>🚀 专业月卡</Text>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>¥199 / 2000万 tokens</Paragraph>
                </div>
                <Tag color="orange">超值</Tag>
              </div>
            </Card>
          </Space>
          <Paragraph style={{ marginTop: 16, textAlign: 'center' }} type="secondary">
            💡 所有套餐享百炼官方 <Text strong>82折</Text> 优惠！
          </Paragraph>
        </div>
      )
    },
    {
      title: 'Try Online Demo',
      icon: <ExperimentOutlined />,
      description: 'Test models without code',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Card style={{ maxWidth: 500, margin: '0 auto' }}>
            <ExperimentOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>在线体验</Title>
            <Paragraph>
              无需编写代码，直接在网页上测试各种AI模型
            </Paragraph>
            <div style={{ marginTop: 16, padding: 16, background: '#f0f2f5', borderRadius: 8, textAlign: 'left' }}>
              <Text strong>💬 聊天模式：</Text> 与AI对话，测试理解能力<br/>
              <Text strong>📝 文本补全：</Text> 输入提示词，生成内容<br/>
              <Text strong>🎨 图像生成：</Text> 文字描述，生成图片<br/>
              <Text strong>🎬 视频生成：</Text> 创意描述，生成视频
            </div>
          </Card>
        </div>
      )
    },
    {
      title: 'Invite & Earn',
      icon: <TeamOutlined />,
      description: 'Share and earn rewards',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Card style={{ maxWidth: 500, margin: '0 auto', background: '#fff2e8' }}>
            <TeamOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
            <Title level={4}>邀请好友，双方获利</Title>
            <Paragraph>
              分享你的专属邀请码，好友注册后双方各得 <Text strong>¥10</Text> 额度
            </Paragraph>
            <div style={{ marginTop: 16, fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
              你的邀请码：HUANZHUO-2026
            </div>
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              🎯 邀请越多，平台折扣越低，节省成本返利给用户！
            </Paragraph>
          </Card>
        </div>
      )
    },
    {
      title: 'Track Usage',
      icon: <TrophyOutlined />,
      description: 'Monitor your API usage',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Title level={4}>用户仪表盘</Title>
          <Card style={{ maxWidth: 500, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <Progress type="circle" percent={75} size={80} />
                <Paragraph style={{ marginTop: 8 }}>额度使用</Paragraph>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Progress type="circle" percent={45} size={80} status="success" />
                <Paragraph style={{ marginTop: 8 }}>API调用</Paragraph>
              </div>
            </div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>今日调用次数</Text>
                <Text strong>1,234 次</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>今日消耗额度</Text>
                <Text strong>¥45.67</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>剩余额度</Text>
                <Text strong type="success">¥154.33</Text>
              </div>
            </Space>
          </Card>
        </div>
      )
    },
    {
      title: 'You\'re Ready!',
      icon: <CheckCircleOutlined />,
      description: 'Start building with AI',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 20 }} />
          <Title level={3}>🎉 恭喜完成引导！</Title>
          <Paragraph style={{ fontSize: 16 }}>
            你已完成所有步骤，现在可以：
          </Paragraph>
          <Space direction="vertical" style={{ marginTop: 16, textAlign: 'left' }}>
            <div>✅ 使用 API Key 调用全球顶级模型</div>
            <div>✅ 在线体验各种 AI 功能</div>
            <div>✅ 查看实时用量和额度</div>
            <div>✅ 邀请好友赚取奖励</div>
          </Space>
          <Paragraph type="secondary" style={{ marginTop: 20 }}>
            任何问题请联系客服：support@huazhuo.tech
          </Paragraph>
        </div>
      )
    }
  ];

  const next = () => {
    setCompleted([...completed, current]);
    if (current === steps.length - 1) {
      onComplete();
      onClose();
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <Modal
      title={null}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      bodyStyle={{ padding: '24px 40px' }}
    >
      <Steps
        current={current}
        size="small"
        direction="horizontal"
        style={{ marginBottom: 24 }}
      >
        {steps.map((step, index) => (
          <Steps.Step
            key={index}
            title={step.title}
            icon={step.icon}
          />
        ))}
      </Steps>

      <div style={{ minHeight: 300 }}>
        {steps[current].content}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button onClick={prev} disabled={current === 0}>
          Previous
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary">Step {current + 1} of {steps.length}</Text>
          <Button type="primary" onClick={next}>
            {current === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingFlow;
