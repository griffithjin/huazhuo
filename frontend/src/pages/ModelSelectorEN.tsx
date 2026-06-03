import React, { useState } from 'react';
import { Card, Row, Col, Tag, Badge, Button, Tabs, Space, Alert, Typography, Divider, message, Tooltip } from 'antd';
import {
  CheckCircleOutlined, RocketOutlined, MessageOutlined, DatabaseOutlined,
  PictureOutlined, VideoCameraOutlined, AudioOutlined, RobotOutlined,
  CopyOutlined, CheckOutlined, CodeOutlined, GlobalOutlined, SafetyOutlined
} from '@ant-design/icons';
import { ALL_MODELS } from '../data/modelPricing';
import type { ModelConfig } from '../data/modelPricing';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// English category labels for overseas users
const ALL_MODEL_CATEGORIES_EN = [
  { key: 'text', label: 'Text Generation', models: ALL_MODELS.filter(m => m.category === 'text') },
  { key: 'embedding', label: 'Embeddings', models: ALL_MODELS.filter(m => m.category === 'embedding') },
  { key: 'image', label: 'Image Generation', models: ALL_MODELS.filter(m => m.category === 'image') },
  { key: 'video', label: 'Video Generation', models: ALL_MODELS.filter(m => m.category === 'video') },
  { key: 'audio', label: 'Audio', models: ALL_MODELS.filter(m => m.category === 'audio') },
  { key: 'agent', label: 'AI Agents', models: ALL_MODELS.filter(m => m.category === 'agent') },
];

const ModelSelectorEN: React.FC = () => {
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderModelCard = (model: ModelConfig) => {
    const isSelected = selectedModel === model.id;
    const color = categoryColors[model.category] || '#1890ff';
    const isGeoRestricted = model.geoRestriction === 'non-cn';

    return (
      <Card
        hoverable
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
              {model.isRecommended && <Badge dot color="green"><Tag color="success">Recommended</Tag></Badge>}
              {model.isNew && <Tag color="blue">NEW</Tag>}
              {isGeoRestricted && (
                <Tooltip title="Available for overseas users only. China-based users restricted.">
                  <Tag color="red">Overseas Only</Tag>
                </Tooltip>
              )}
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
          <span>Context: <Tag>{model.contextLength}</Tag></span>
          <span>
            ${((model.officialPricePer1KInput * 1000) / 7.2).toFixed(4)} / ${((model.officialPricePer1KOutput * 1000) / 7.2).toFixed(4)} <Text type="secondary">per 1M Tokens</Text>
          </span>
        </div>
      </Card>
    );
  };

  const currentModel = ALL_MODELS.find(m => m.id === selectedModel);

  const codeExamples = {
    curl: `curl https://api.modeltop.ai/v1/chat/completions \\
  -H "Authorization: Bearer ***" \\
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
    base_url="https://api.modeltop.ai/v1"
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
  baseURL: 'https://api.modeltop.ai/v1'
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
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Model Selection & Integration</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Choose the best AI model for your use case and get integration code instantly
        </Paragraph>
        <Tag color="blue" icon={<GlobalOutlined />}>Base URL: https://modeltop.ai/docs/</Tag>
      </div>

      <Alert
        message="Regional Compliance Notice"
        description={
          <>
            <p><SafetyOutlined /> <strong>Overseas users</strong> have access to ALL models including China-originated and overseas-exclusive models (e.g., Seedance 2.0).</p>
            <p><SafetyOutlined /> <strong>China-based users</strong> cannot access overseas-exclusive content per compliance requirements. IP/region detection applies.</p>
          </>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 24, borderRadius: 12 }}
      />

      <Alert
        message="🎬 Seedance 2.0 — Overseas Exclusive"
        description="Professional AI video generation available exclusively for overseas users. Multiple styles, character consistency, 4K output. China-based users restricted."
        type="info"
        showIcon
        style={{ marginBottom: 24, borderRadius: 12 }}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Select Model" style={{ borderRadius: 16 }}>
            <Tabs
              activeKey={selectedCategory}
              onChange={setSelectedCategory}
              type="card"
            >
              {ALL_MODEL_CATEGORIES_EN.map((cat: any) => (
                <TabPane
                  tab={
                    <Space>
                      {cat.label}
                      <Tag color={categoryColors[cat.key]}>{cat.models.length}</Tag>
                    </Space>
                  }
                  key={cat.key}
                >
                  <Row gutter={[16, 16]}>
                    {cat.models.map((model: any) => (
                      <Col xs={24} sm={12} key={model.id}>
                        {renderModelCard(model)}
                      </Col>
                    ))}
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          </Card>

          <Card title="Use Case Recommendations" style={{ marginTop: 24, borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Smart Customer Service" extra={<Tag color="blue">qwen-plus</Tag>}>
                  <Text type="secondary">Multi-turn dialogue, strong Chinese understanding, great value</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Code Assistant" extra={<Tag color="purple">deepseek-v4</Tag>}>
                  <Text type="secondary">Code generation, auto-completion, technical Q&A</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Long Document Analysis" extra={<Tag color="red">qwen3.7-max</Tag>}>
                  <Text type="secondary">1M context window for papers, contracts, reports</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="RAG Knowledge Base" extra={<Tag color="green">text-embedding</Tag>}>
                  <Text type="secondary">Semantic search, vector database, enterprise knowledge</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="AI Video Creation" extra={<Tag color="red">seedance-2.0</Tag>}>
                  <Text type="secondary">Overseas exclusive. Professional video generation with multiple styles.</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="AI Image Generation" extra={<Tag color="magenta">qwen-image-2.0</Tag>}>
                  <Text type="secondary">High-quality text-to-image generation</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CodeOutlined />
                <span>Integration Code</span>
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
                  message={`Selected: ${currentModel.name}`}
                  description={
                    <>
                      <div>Input: ${((currentModel.officialPricePer1KInput * 1000) / 7.2).toFixed(4)}/1M Tokens</div>
                      <div>Output: ${((currentModel.officialPricePer1KOutput * 1000) / 7.2).toFixed(4)}/1M Tokens</div>
                      {currentModel.geoRestriction === 'non-cn' && (
                        <div style={{ color: '#f5222d', marginTop: 4 }}>
                          <SafetyOutlined /> Overseas users only
                        </div>
                      )}
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
                  <Text strong style={{ color: '#d46b08' }}>Quick Start Guide:</Text>
                  <ol style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13 }}>
                    <li>Register and get your API Key</li>
                    <li>Top up credits or claim free credits</li>
                    <li>Select a model and copy the code above</li>
                    <li>Replace YOUR_API_KEY and start calling</li>
                  </ol>
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: 12 }}
                    icon={<RocketOutlined />}
                    onClick={() => window.location.href = '/#/en/login'}
                  >
                    Get API Key Now
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

export default ModelSelectorEN;
