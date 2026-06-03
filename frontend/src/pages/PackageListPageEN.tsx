import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Badge, Tabs, Alert, Tooltip, Radio, Space, Statistic, Divider } from 'antd';
import { CheckCircleOutlined, FireOutlined, CrownOutlined, ThunderboltOutlined, RocketOutlined, ShoppingCartOutlined, InfoCircleOutlined, TeamOutlined, GlobalOutlined, CreditCardOutlined, PayCircleOutlined } from '@ant-design/icons';
import { ALL_MODELS, DEFAULT_DISCOUNT_CONFIG } from '../data/modelPricing';

const { TabPane } = Tabs;

// USD pricing - approximately 1 USD = 7.2 CNY
const EXCHANGE_RATE = 7.2;

const CREDIT_PACKAGES_EN = [
  { id: 'starter', name: 'Starter Pack', description: 'Personal developers, explore AI capabilities', payAmountUSD: 1.4, features: ['All models available', 'Standard support', '7-day validity'] },
  { id: 'lite', name: 'Lite Pack', description: 'Personal projects, learning & experiments', payAmountUSD: 6.8, features: ['All models available', 'Standard support', '30-day validity', 'Usage stats'], isPopular: true },
  { id: 'standard', name: 'Standard Pack', description: 'Small teams, startup projects', payAmountUSD: 24.9, features: ['All models available', 'Priority support', '90-day validity', 'Usage stats', 'Quota alerts'] },
  { id: 'pro', name: 'Pro Pack', description: 'Mid-size enterprises, commercial apps', payAmountUSD: 97.0, features: ['All models available', 'Priority support', '365-day validity', 'Usage stats', 'Quota alerts', 'Dedicated support'], isPopular: true },
  { id: 'enterprise', name: 'Enterprise Pack', description: 'Large-scale deployment, high-concurrency', payAmountUSD: 444.0, features: ['All models available', '7×24 support', '365-day validity', 'Usage stats', 'Quota alerts', 'Dedicated support', 'SLA guarantee'], isEnterprise: true },
];

const MODEL_TIER_PACKAGES_EN = [
  { id: 'flash-tier', tier: 'flash', tierName: 'Flash', tierDescription: 'Ultra-fast response, best value for money', models: ['qwen-flash', 'qwen3.5-flash'],
    packages: [
      { id: 'flash-100m', name: 'Trial', tokenAmount: 1000000, priceUSD: 0.3, unitPrice: 0.30 },
      { id: 'flash-500m', name: 'Lite', tokenAmount: 5000000, priceUSD: 1.1, unitPrice: 0.22 },
      { id: 'flash-2b', name: 'Standard', tokenAmount: 20000000, priceUSD: 4.2, unitPrice: 0.21 },
      { id: 'flash-10b', name: 'Pro', tokenAmount: 100000000, priceUSD: 18.0, unitPrice: 0.18 },
      { id: 'flash-50b', name: 'Enterprise', tokenAmount: 500000000, priceUSD: 69.4, unitPrice: 0.14 },
    ] },
  { id: 'plus-tier', tier: 'plus', tierName: 'Plus', tierDescription: 'Balanced performance and cost', models: ['qwen-plus', 'qwen3.7-plus'],
    packages: [
      { id: 'plus-50m', name: 'Trial', tokenAmount: 500000, priceUSD: 0.3, unitPrice: 0.60 },
      { id: 'plus-200m', name: 'Lite', tokenAmount: 2000000, priceUSD: 0.8, unitPrice: 0.40 },
      { id: 'plus-1b', name: 'Standard', tokenAmount: 10000000, priceUSD: 3.5, unitPrice: 0.35 },
      { id: 'plus-5b', name: 'Pro', tokenAmount: 50000000, priceUSD: 13.9, unitPrice: 0.28 },
      { id: 'plus-20b', name: 'Enterprise', tokenAmount: 200000000, priceUSD: 48.6, unitPrice: 0.24 },
    ] },
  { id: 'max-tier', tier: 'max', tierName: 'Max', tierDescription: 'Best reasoning capabilities', models: ['qwen3.6-plus', 'qwen3.7-max'],
    packages: [
      { id: 'max-10m', name: 'Trial', tokenAmount: 100000, priceUSD: 0.4, unitPrice: 4.00 },
      { id: 'max-50m', name: 'Lite', tokenAmount: 500000, priceUSD: 1.4, unitPrice: 2.80 },
      { id: 'max-200m', name: 'Standard', tokenAmount: 2000000, priceUSD: 4.8, unitPrice: 2.40 },
      { id: 'max-1b', name: 'Pro', tokenAmount: 10000000, priceUSD: 20.8, unitPrice: 2.08 },
      { id: 'max-5b', name: 'Enterprise', tokenAmount: 50000000, priceUSD: 83.3, unitPrice: 1.67 },
    ] },
];

const ALL_MODEL_CATEGORIES_EN = [
  { key: 'text', label: 'Text Generation', models: ALL_MODELS.filter(m => m.category === 'text') },
  { key: 'embedding', label: 'Embeddings', models: ALL_MODELS.filter(m => m.category === 'embedding') },
  { key: 'image', label: 'Image Generation', models: ALL_MODELS.filter(m => m.category === 'image') },
  { key: 'video', label: 'Video Generation', models: ALL_MODELS.filter(m => m.category === 'video') },
  { key: 'audio', label: 'Audio', models: ALL_MODELS.filter(m => m.category === 'audio') },
  { key: 'agent', label: 'AI Agents', models: ALL_MODELS.filter(m => m.category === 'agent') },
];

const PackageListPageEN: React.FC = () => {
  const [billingMode, setBillingMode] = useState<'credit' | 'tier'>('credit');
  const [selectedTier, setSelectedTier] = useState<string>('flash-tier');

  const discountRate = DEFAULT_DISCOUNT_CONFIG.currentDiscountRate;
  const supplierRate = DEFAULT_DISCOUNT_CONFIG.supplierDiscountRate;
  const marginRate = ((1 - supplierRate / discountRate) * 100).toFixed(1);

  const handlePurchase = (pkg: any) => {
    const orderUuid = 'ord_' + Math.random().toString(36).substr(2, 9);
    window.location.href = `/#/en/pay/${orderUuid}?pkg=${pkg.id}&amount=${pkg.payAmountUSD}`;
  };

  const handleTierPurchase = (tierId: string, pkgId: string, price: number, tokens: number) => {
    const orderUuid = 'ord_' + Math.random().toString(36).substr(2, 9);
    window.location.href = `/#/en/pay/${orderUuid}?tier=${tierId}&pkg=${pkgId}&amount=${price}&tokens=${tokens}`;
  };

  const renderCreditPackages = () => {
    return (
      <Row gutter={[24, 24]}>
        {CREDIT_PACKAGES_EN.map((pkg: any, index: number) => {
          const icons = [ThunderboltOutlined, FireOutlined, RocketOutlined, CrownOutlined, RocketOutlined];
          const colors = ['#52c41a', '#1890ff', '#722ed1', '#fa8c16', '#f5222d'];
          const Icon = icons[index] || ShoppingCartOutlined;
          const color = colors[index] || '#1890ff';

          return (
            <Col xs={24} sm={12} lg={8} key={pkg.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  border: pkg.isPopular ? `2px solid ${color}` : '1px solid #f0f0f0',
                  boxShadow: pkg.isPopular ? `0 8px 24px ${color}20` : '0 2px 8px rgba(0,0,0,0.06)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {pkg.isPopular && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: color, color: '#fff',
                    padding: '4px 16px', borderRadius: '0 0 0 16px',
                    fontSize: 12, fontWeight: 'bold'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                {pkg.isEnterprise && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: '#f5222d', color: '#fff',
                    padding: '4px 16px', borderRadius: '0 0 0 16px',
                    fontSize: 12, fontWeight: 'bold'
                  }}>
                    ENTERPRISE
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Icon style={{ fontSize: 48, color, marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 22 }}>{pkg.name}</h3>
                  <p style={{ color: '#888', marginTop: 8, fontSize: 13 }}>{pkg.description}</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, color: '#888' }}>$</span>
                    <span style={{ fontSize: 42, fontWeight: 'bold', color }}>{pkg.payAmountUSD}</span>
                  </div>
                  <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                    USD Pricing — No Chinese bank account required
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  {pkg.features.map((feat: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ borderRadius: 8, height: 44, background: color, borderColor: color }}
                  onClick={() => handlePurchase(pkg)}
                >
                  Buy Now
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const renderTierPackages = () => {
    const currentTier = MODEL_TIER_PACKAGES_EN.find(t => t.id === selectedTier);
    if (!currentTier) return null;

    const tierColors: Record<string, string> = {
      'flash-tier': '#52c41a',
      'plus-tier': '#1890ff',
      'max-tier': '#f5222d',
    };
    const color = tierColors[selectedTier] || '#1890ff';
    const tierModels = ALL_MODELS.filter(m => currentTier.models.includes(m.id));

    return (
      <>
        <Alert
          message="Model Tier Package Guide"
          description={
            <>
              <p>{currentTier.tierDescription}</p>
              <p>Included models: {tierModels.map(m => <Tag key={m.id} color={color}>{m.name}</Tag>)}</p>
              <p>Other models will deduct credits at standard rates</p>
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Row gutter={[24, 24]}>
          {currentTier.packages.map((pkg, index) => {
            const icons = [ThunderboltOutlined, FireOutlined, RocketOutlined, CrownOutlined, RocketOutlined];
            const Icon = icons[index] || ShoppingCartOutlined;

            return (
              <Col xs={24} sm={12} lg={8} key={pkg.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: index === 2 ? `2px solid ${color}` : '1px solid #f0f0f0',
                    boxShadow: index === 2 ? `0 8px 24px ${color}20` : '0 2px 8px rgba(0,0,0,0.06)',
                    height: '100%'
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Icon style={{ fontSize: 40, color, marginBottom: 12 }} />
                    <h3 style={{ margin: 0, fontSize: 20 }}>{pkg.name}</h3>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, color: '#888' }}>$</span>
                      <span style={{ fontSize: 36, fontWeight: 'bold', color }}>{pkg.priceUSD}</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={color}>{(pkg.tokenAmount / 10000).toFixed(0)}K+ Tokens</Tag>
                      <Tag>${pkg.unitPrice.toFixed(2)}/1M Tokens</Tag>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20, padding: '12px 0', borderTop: '1px dashed #eee', borderBottom: '1px dashed #eee' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic title="Input Tokens" value={pkg.tokenAmount} suffix="" valueStyle={{ fontSize: 14 }} />
                      </Col>
                      <Col span={12}>
                        <Statistic title="Est. Calls" value={(pkg.tokenAmount / 2000).toFixed(0)} suffix="" valueStyle={{ fontSize: 14 }} />
                      </Col>
                    </Row>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ borderRadius: 8, height: 44, background: color, borderColor: color }}
                    onClick={() => handleTierPurchase(currentTier.id, pkg.id, pkg.priceUSD, pkg.tokenAmount)}
                  >
                    Buy Now
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, marginBottom: 16 }}>Choose Your Plan</h1>
        <p style={{ fontSize: 16, color: '#666', maxWidth: 700, margin: '0 auto' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Group-buying model: More users, better discounts. We share the cost savings with you!
          <Tooltip title="Platform passes scale-efficiency savings back to users">
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
          </Tooltip>
        </p>
      </div>

      {/* 支付方式展示 */}
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span><CreditCardOutlined /> PayPal / Visa / Mastercard / HSBC</span>
            <span style={{ color: '#888' }}>USD Pricing — No Chinese bank account required</span>
          </div>
        }
        description="Secure global payment methods for overseas users. All transactions are encrypted and protected."
        type="success"
        showIcon
        style={{ marginBottom: 24, borderRadius: 12 }}
      />

      <Alert
        message={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>
              <strong>Current Discount Rate: {(discountRate * 100).toFixed(0)}% of official price</strong>
              <span style={{ marginLeft: 16, color: '#888' }}>
                Deposit $100 = Available credits ${(100 / discountRate).toFixed(2)}
              </span>
            </span>
            <span style={{ color: '#52c41a' }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              Platform Margin: {marginRate}%
            </span>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <p style={{ margin: 0 }}>
              Models are billed at official list prices. Platform passes bulk-purchase savings back to you.
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color="blue">Monthly spend ≥ $4,200 → extra 2% off</Tag>
              <Tag color="blue">Monthly spend ≥ $6,900 → extra 5% off</Tag>
              <Tag color="blue">Monthly spend ≥ $13,900 → extra 10% off</Tag>
            </div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 32, borderRadius: 12 }}
      />

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Radio.Group
          value={billingMode}
          onChange={e => setBillingMode(e.target.value)}
          size="large"
          style={{ borderRadius: 8 }}
        >
          <Radio.Button value="credit">💰 Credit Top-up (Recommended)</Radio.Button>
          <Radio.Button value="tier">🎯 Model Tier Packages</Radio.Button>
        </Radio.Group>
      </div>

      {billingMode === 'credit' && (
        <>
          <Alert
            message="Credit Top-up Guide"
            description={
              <>
                <p>1. Top up to get platform credits (billed at official rates, fully transparent)</p>
                <p>2. Different models consume credits based on actual usage</p>
                <p>3. Credits never expire. More top-up = bigger discounts (group-buying model)</p>
                <p>4. New users get free credits upon registration — try before you buy!</p>
              </>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          {renderCreditPackages()}
        </>
      )}

      {billingMode === 'tier' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Space size="large">
              {MODEL_TIER_PACKAGES_EN.map(tier => (
                <Badge key={tier.id} dot={tier.tier === 'flash'} color={tier.tier === 'flash' ? '#52c41a' : tier.tier === 'plus' ? '#1890ff' : '#f5222d'}>
                  <Button
                    type={selectedTier === tier.id ? 'primary' : 'default'}
                    size="large"
                    onClick={() => setSelectedTier(tier.id)}
                    style={{
                      borderRadius: 8, minWidth: 140,
                      background: selectedTier === tier.id
                        ? (tier.tier === 'flash' ? '#52c41a' : tier.tier === 'plus' ? '#1890ff' : '#f5222d')
                        : undefined,
                      borderColor: selectedTier === tier.id
                        ? (tier.tier === 'flash' ? '#52c41a' : tier.tier === 'plus' ? '#1890ff' : '#f5222d')
                        : undefined,
                    }}
                  >
                    {tier.tierName}
                  </Button>
                </Badge>
              ))}
            </Space>
          </div>
          {renderTierPackages()}
        </>
      )}

      <Divider />

      {/* 价格参考表 */}
      <Card title="Model Price Reference (Official List Price)" style={{ marginTop: 48, borderRadius: 16 }}>
        <Alert
          message="Pricing Notes"
          description={
            <>
              <p>Prices shown are official list prices. Credits are deducted at these rates.</p>
              <p>Platform buys in bulk at discounts and passes savings to users.</p>
              <p>Current platform discount: <strong>{(discountRate * 100).toFixed(0)}%</strong>, i.e., deposit $100 = ${(100 / discountRate).toFixed(2)} available credits</p>
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Row gutter={[16, 16]}>
          {ALL_MODELS.filter(m => m.category === 'text').map(model => (
            <Col xs={24} sm={12} lg={8} key={model.id}>
              <Card
                size="small"
                title={
                  <Space>
                    <span>{model.name}</span>
                    {model.isRecommended && <Tag color="success">Recommended</Tag>}
                    {model.isNew && <Tag color="blue">NEW</Tag>}
                    {model.geoRestriction === 'non-cn' && <Tag color="red">Overseas Only</Tag>}
                  </Space>
                }
                extra={<Tag>{model.contextLength}</Tag>}
              >
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{model.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Input:</span>
                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    ${((model.officialPricePer1KInput * 1000) / EXCHANGE_RATE).toFixed(4)}/1M Tokens
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Output:</span>
                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    ${((model.officialPricePer1KOutput * 1000) / EXCHANGE_RATE).toFixed(4)}/1M Tokens
                  </span>
                </div>
                {model.freeQuota && model.freeQuota > 0 && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <Tag color="orange">Free quota: {model.freeQuota >= 10000 ? (model.freeQuota / 10000).toFixed(0) + 'K' : model.freeQuota} Tokens</Tag>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 合规提示 */}
      <Alert
        message="Compliance Notice"
        description="China-based users (identified by IP/region) cannot access overseas-exclusive content such as Seedance 2.0 and Seedance Pro. Overseas users have full access to all models including China-originated ones."
        type="warning"
        showIcon
        style={{ marginTop: 24, borderRadius: 12 }}
      />
    </div>
  );
};

export default PackageListPageEN;
