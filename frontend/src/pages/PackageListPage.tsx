import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Badge, Tabs, Alert, Tooltip, Radio, Space, Statistic } from 'antd';
import { CheckCircleOutlined, FireOutlined, CrownOutlined, ThunderboltOutlined, RocketOutlined, ShoppingCartOutlined, InfoCircleOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';
import { CREDIT_PACKAGES, MODEL_TIER_PACKAGES, ALL_MODELS, DEFAULT_DISCOUNT_CONFIG, calculateCredit } from '../data/modelPricing';
import type { PackageConfig } from '../data/modelPricing';

const { TabPane } = Tabs;

const PackageListPage: React.FC = () => {
  const [billingMode, setBillingMode] = useState<'credit' | 'tier'>('credit');
  const [selectedTier, setSelectedTier] = useState<string>('flash-tier');

  const discountRate = DEFAULT_DISCOUNT_CONFIG.currentDiscountRate;
  const supplierRate = DEFAULT_DISCOUNT_CONFIG.supplierDiscountRate;
  const marginRate = ((1 - supplierRate / discountRate) * 100).toFixed(1);

  const handlePurchase = (pkg: PackageConfig) => {
    const credit = calculateCredit(pkg.payAmount, discountRate);
    const orderUuid = 'ord_' + Math.random().toString(36).substr(2, 9);
    window.location.href = `/#/pay/${orderUuid}?pkg=${pkg.id}&amount=${pkg.payAmount}&credit=${credit}`;
  };

  const handleTierPurchase = (tierId: string, pkgId: string, price: number, tokens: number) => {
    const orderUuid = 'ord_' + Math.random().toString(36).substr(2, 9);
    window.location.href = `/#/pay/${orderUuid}?tier=${tierId}&pkg=${pkgId}&amount=${price}&tokens=${tokens}`;
  };

  const renderCreditPackages = () => {
    const analysis = CREDIT_PACKAGES.map(pkg => ({...pkg, credit: calculateCredit(pkg.payAmount, discountRate)}));

    return (
      <Row gutter={[24, 24]}>
        {analysis.map((pkg: any, index: number) => {
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
                    最受欢迎
                  </div>
                )}
                {pkg.isEnterprise && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: '#f5222d', color: '#fff',
                    padding: '4px 16px', borderRadius: '0 0 0 16px',
                    fontSize: 12, fontWeight: 'bold'
                  }}>
                    企业级
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Icon style={{ fontSize: 48, color, marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 22 }}>{pkg.name}</h3>
                  <p style={{ color: '#888', marginTop: 8, fontSize: 13 }}>{pkg.description}</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, color: '#888' }}>¥</span>
                    <span style={{ fontSize: 42, fontWeight: 'bold', color }}>{pkg.payAmount}</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="success">获得 ¥{pkg.credit} 额度</Tag>
                  </div>
                  <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                    折扣率: {(discountRate * 100).toFixed(0)}% = 支付¥{pkg.payAmount}得¥{pkg.credit}
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
                  onClick={() => handlePurchase(pkg as any)}
                >
                  立即购买
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const renderTierPackages = () => {
    const currentTier = MODEL_TIER_PACKAGES.find(t => t.id === selectedTier);
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
          message="模型分级套餐说明"
          description={
            <>
              <p>{currentTier.tierDescription}</p>
              <p>包含模型: {tierModels.map(m => <Tag key={m.id} color={color}>{m.name}</Tag>)}</p>
              <p>其他模型使用将按额度扣减</p>
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
                      <span style={{ fontSize: 16, color: '#888' }}>¥</span>
                      <span style={{ fontSize: 36, fontWeight: 'bold', color }}>{pkg.price}</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={color}>{(pkg.tokenAmount / 10000).toFixed(0)}万 Token</Tag>
                      <Tag>¥{pkg.unitPrice.toFixed(2)}/百万Token (官方价)</Tag>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20, padding: '12px 0', borderTop: '1px dashed #eee', borderBottom: '1px dashed #eee' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic title="输入Token" value={pkg.tokenAmount} suffix="个" valueStyle={{ fontSize: 14 }} />
                      </Col>
                      <Col span={12}>
                        <Statistic title="可用次数" value={(pkg.tokenAmount / 2000).toFixed(0)} suffix="次" valueStyle={{ fontSize: 14 }} />
                      </Col>
                    </Row>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ borderRadius: 8, height: 44, background: color, borderColor: color }}
                    onClick={() => handleTierPurchase(currentTier.id, pkg.id, pkg.price, pkg.tokenAmount)}
                  >
                    立即购买
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
        <h1 style={{ fontSize: 36, marginBottom: 16 }}>选择您的套餐</h1>
        <p style={{ fontSize: 16, color: '#666', maxWidth: 700, margin: '0 auto' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          拼车共享模式：用户越多，折扣越好，大家一起摊薄成本！
          <Tooltip title="平台将规模效应带来的成本节省返利给用户，实现共赢">
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
          </Tooltip>
        </p>
      </div>

      <Alert
        message={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>
              <strong>当前折扣率: {(discountRate * 100).toFixed(0)}折</strong>
              <span style={{ marginLeft: 16, color: '#888' }}>
                充值¥100 = 可用额度¥{(calculateCredit(100, discountRate)).toFixed(2)}
              </span>
            </span>
            <span style={{ color: '#52c41a' }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              平台利润率: {marginRate}%
            </span>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <p style={{ margin: 0 }}>
              模型按 <strong>百炼官方原价</strong> 扣减额度，公开透明。
              随着平台总消费增加，我们将从百炼获得更低折扣，并将节省的成本返利给您！
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color="blue">月消费≥30万 → 折扣再降2%</Tag>
              <Tag color="blue">月消费≥50万 → 折扣再降5%</Tag>
              <Tag color="blue">月消费≥100万 → 折扣再降10%</Tag>
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
          <Radio.Button value="credit">💰 额度充值 (推荐)</Radio.Button>
          <Radio.Button value="tier">🎯 模型分级套餐</Radio.Button>
        </Radio.Group>
      </div>

      {billingMode === 'credit' && (
        <>
          <Alert
            message="额度充值说明"
            description={
              <>
                <p>1. 充值获得平台额度（按官方原价扣减，公开透明）</p>
                <p>2. 调用不同模型按实际消耗扣减额度（详见下方模型价格表）</p>
                <p>3. 额度永久有效，充值越多折扣越大（拼车共享模式）</p>
                <p>4. 新用户注册即送免费额度，无需充值即可体验</p>
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
              {MODEL_TIER_PACKAGES.map(tier => (
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

      <Card title="模型价格参考表 (百炼官方原价)" style={{ marginTop: 48, borderRadius: 16 }}>
        <Alert
          message="价格说明"
          description={
            <>
              <p>以下价格为百炼官方原价，用户消费时按此价格扣减额度。</p>
              <p>平台通过大规模采购获得折扣，并将节省的成本返利给用户。</p>
              <p>当前平台折扣: <strong>{(discountRate * 100).toFixed(0)}折</strong>，即充值¥100 = 可用额度¥{calculateCredit(100, discountRate).toFixed(2)}</p>
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
                    {model.isRecommended && <Tag color="success">推荐</Tag>}
                    {model.isNew && <Tag color="blue">NEW</Tag>}
                    {model.geoRestriction === 'non-cn' && <Tag color="red">海外专属</Tag>}
                  </Space>
                }
                extra={<Tag>{model.contextLength}</Tag>}
              >
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{model.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>输入:</span>
                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    ¥{(model.officialPricePer1KInput * 1000).toFixed(3)}/百万Token
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>输出:</span>
                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{(model.officialPricePer1KOutput * 1000).toFixed(3)}/百万Token
                  </span>
                </div>
                {model.freeQuota && model.freeQuota > 0 && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <Tag color="orange">新用户免费额度: {model.freeQuota >= 10000 ? (model.freeQuota / 10000).toFixed(0) + '万' : model.freeQuota} Token</Tag>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default PackageListPage;
