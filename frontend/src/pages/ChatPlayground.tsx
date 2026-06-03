
import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Avatar, List, Typography, Select } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatPlayground: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '你好！我是AI助手，有什么可以帮你的吗？', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('qwen3.7');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // TODO: call real API
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `这是${model}模型的回复示例。实际部署后将连接真实API。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>🤖 AI 在线体验</Title>
        <Select
          value={model}
          onChange={setModel}
          style={{ width: 200 }}
          options={[
            { value: 'qwen3.7', label: '通义千问 3.7' },
            { value: 'qwen3.7-max', label: '通义千问 3.7 Max' },
            { value: 'qwen-flash', label: '通义千问 Flash' },
          ]}
        />
      </div>

      <Card style={{ height: 500, overflowY: 'auto', marginBottom: 16 }}>
        <List
          dataSource={messages}
          renderItem={msg => (
            <List.Item style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                  style={{ background: msg.role === 'user' ? '#1677ff' : '#52c41a' }} />
                <div style={{ 
                  maxWidth: 600, 
                  padding: '8px 16px', 
                  borderRadius: 12,
                  background: msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                  color: msg.role === 'user' ? '#fff' : '#000'
                }}>
                  {msg.content}
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </Card>

      <div style={{ display: 'flex', gap: 12 }}>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入消息..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSend}
          style={{ alignSelf: 'flex-end' }}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatPlayground;
