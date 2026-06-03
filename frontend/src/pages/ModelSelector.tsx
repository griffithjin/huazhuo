import React, { useState } from 'react';
import { Card, Row, Col, Tag, Badge, Button, Tabs, List, Space, Alert, Typography, Divider, Tooltip, Steps, Select, message } from 'antd';
import {
  CheckCircleOutlined, RocketOutlined, MessageOutlined, DatabaseOutlined,
  PictureOutlined, VideoCameraOutlined, AudioOutlined, RobotOutlined,
  CopyOutlined, CheckOutlined, ApiOutlined, CodeOutlined
} from '@ant-design/icons';
import { ALL_MODEL_CATEGORIES, ALL_MODELS } from '../data/modelPricing';
import type { ModelConfig } from '../data/modelPricing';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ModelSelector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('text');
  const [selectedModel, setSelectedModel] = useState<string>('qwen-plus');
  const [copied, setCopied] = useState(false);

  const categoryColors: Record<string, string> = {
    text: '#1890ff',
    embedding: '#722ed1',
    image: '#eb2f96',
    video: '#f5222d',
    audio: '#52c41a',
    agent: '#fa8c16',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    text: <MessageOutlined />,
    embedding: <DatabaseOutlined />,
    image: <PictureOutlined />,
    video: <VideoCameraOutlined />,
    audio: <AudioOutlined />,
    agent: <RobotOutlined />,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderModelCard = (model: ModelConfig) => {
    const isSelected = selectedModel === model.id;
    const color = categoryColors[model.category] || '#1890ff';

    return (
      <Card
        hoverable
        size="small"
        onClick={() => setSelectedModel(model.id)}
        style={{
          border: isSelected ? `2px solid ${color}` : '1px solid #f0f0f0',
          background: isSelected ? `${color}08` : '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text strong style={{ fontSize: 16 }}>{model.name}</Text>
              {model.isRecommended && <Badge dot color="green"><Tag color="success">推荐</Tag></Badge>}
              {model.isNew && <Tag color="blue">NEW</Tag>}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>{model.provider}</Text>
          </div>
          {isSelected && <CheckCircleOutlined style={{ color, fontSize: 20 }} />}
        </div>

        <Paragraph style={{ fontSize: 12, margin: '8px 0', minHeight: 36 }} ellipsis={{ rows: 2 }}>
          {model.description}
        </Paragraph>

        <Space size="small" wrap>
          {model.features.map((f, i) => (
            <Tag key={i} style={{ fontSize: 11 }}>{f}</Tag>
          ))}
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>上下文: <Tag>{model.contextLength}</Tag></span>
          <span>
            ¥{(model.officialPricePer1KInput * 1000).toFixed(3)} / ¥{(model.officialPricePer1KOutput * 1000).toFixed(3)} <Text type="secondary">每百万Token</Text>
          </span>
        </div>
      </Card>
    );
  };

  const currentModel = ALL_MODELS.find(m => m.id === selectedModel);

  // 代码示例
  const codeExamples = {
    curl: `curl https://api.tokenhub.寰卓.tech/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }'`,
    python: `import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.tokenhub.寰卓.tech/v1"
)

response = client.chat.completions.create(
    model="${selectedModel}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`,
    javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.tokenhub.寰卓.tech/v1'
});

async function main() {
  const response = await client.chat.completions.create({
    model: '${selectedModel}',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' }
    ]
  });
  console.log(response.choices[0].message.content);
}

main();`,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* 页面标题 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>模型选择与应用部署</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          选择适合您应用场景的AI模型，获取接入代码示例
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧：模型选择 */}
        <Col xs={24} lg={14}>
          <Card title="选择模型" style={{ borderRadius: 16 }}>
            <Tabs
              activeKey={selectedCategory}
              onChange={setSelectedCategory}
              type="card"
              size="small"
            >
              {ALL_MODEL_CATEGORIES.map(cat => (
                <TabPane
                  tab={
                    <Space>
                      {null}
                      {cat.label}
                      <Tag color={categoryColors[cat.key]}>{cat.models.length}</Tag>
                    </Space>
                  }
                  key={cat.key}
                >
                  <Row gutter={[16, 16]}>
                    {cat.models.map(model => (
                      <Col xs={24} sm={12} key={model.id}>
                        {renderModelCard(model)}
                      </Col>
                    ))}
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          </Card>

          {/* 应用建议 */}
          <Card title="应用场景推荐" style={{ marginTop: 24, borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="智能客服" extra={<Tag color="blue">qwen-plus</Tag>}>
                  <Text type="secondary">多轮对话、中文理解强、性价比高</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="代码助手" extra={<Tag color="purple">deepseek-v4</Tag>}>
                  <Text type="secondary">代码生成、自动补全、技术问答</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="长文档分析" extra={<Tag color="red">qwen3.7-max</Tag>}>
                  <Text type="secondary">1M上下文、论文/合同/报告分析</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="RAG知识库" extra={<Tag color="green">text-embedding</Tag>}>
                  <Text type="secondary">语义检索、向量数据库、企业知识</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 右侧：接入代码 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CodeOutlined />
                <span>接入代码示例</span>
              </Space>
            }
            extra={
              currentModel && (
                <Tag color={categoryColors[currentModel.category]}>
                  {currentModel.name}
                </Tag>
              )
            }
            style={{ borderRadius: 16, position: 'sticky', top: 24 }}
          >
            {currentModel && (
              <>
                <Alert
                  message={`已选择: ${currentModel.name}`}
                  description={
                    <>
                      <div>输入: ¥{(currentModel.officialPricePer1KInput * 1000).toFixed(3)}/百万Token</div>
                      <div>输出: ¥{(currentModel.officialPricePer1KOutput * 1000).toFixed(3)}/百万Token</div>
                    </>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Tabs defaultActiveKey="curl" type="card" size="small">
                  <TabPane tab="cURL" key="curl">
                    <div style={{ position: 'relative' }}>
                      <pre style={{
                        background: '#f6f8fa',
                        padding: 16,
                        borderRadius: 8,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 300,
                      }}>
                        <code>{codeExamples.curl}</code>
                      </pre>
                      <Button
                        icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                        size="small"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => handleCopy(codeExamples.curl)}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="Python" key="python">
                    <div style={{ position: 'relative' }}>
                      <pre style={{
                        background: '#f6f8fa',
                        padding: 16,
                        borderRadius: 8,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 300,
                      }}>
                        <code>{codeExamples.python}</code>
                      </pre>
                      <Button
                        icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                        size="small"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => handleCopy(codeExamples.python)}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="JavaScript" key="javascript">
                    <div style={{ position: 'relative' }}>
                      <pre style={{
                        background: '#f6f8fa',
                        padding: 16,
                        borderRadius: 8,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 300,
                      }}>
                        <code>{codeExamples.javascript}</code>
                      </pre>
                      <Button
                        icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                        size="small"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => handleCopy(codeExamples.javascript)}
                      />
                    </div>
                  </TabPane>
                </Tabs>

                <Divider />

                <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, border: '1px solid #ffd591' }}>
                  <Text strong style={{ color: '#d46b08' }}>快速接入步骤:</Text>
                  <ol style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13 }}>
                    <li>注册账户并获取 API Key</li>
                    <li>充值额度或领取免费额度</li>
                    <li>选择模型并复制上方代码</li>
                    <li>替换 YOUR_API_KEY 即可调用</li>
                  </ol>
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: 12 }}
                    icon={<RocketOutlined />}
                    onClick={() => window.location.href = '/#/login'}
                  >
                    立即获取 API Key
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModelSelector;
