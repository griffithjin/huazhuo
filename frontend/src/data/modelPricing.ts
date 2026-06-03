// 寰卓 商业化定价系统 v2.0 - 拼车共享 + 15%利润保底
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  category: 'text' | 'embedding' | 'image' | 'video' | 'audio' | 'agent';
  description: string;
  features: string[];
  contextLength: string;
  // 百炼官方原价 (前端展示)
  officialPricePer1KInput: number;
  officialPricePer1KOutput: number;
  // 平台采购成本 (内部)
  costPer1KInput: number;
  costPer1KOutput: number;
  region: string;
  geoRestriction?: string;
  freeQuota?: number;
  isRecommended?: boolean;
  isNew?: boolean;
}

export interface PlatformDiscountConfig {
  currentDiscountRate: number;
  supplierDiscountRate: number;
  minMarginRate: number;
}

export const DEFAULT_DISCOUNT_CONFIG: PlatformDiscountConfig = {
  currentDiscountRate: 0.82,      // 平台82折 (15%利润)
  supplierDiscountRate: 0.68,    // 百炼68折
  minMarginRate: 0.15,
};

export function calculateCredit(payAmount: number, discountRate: number): number {
  return Math.round((payAmount / discountRate) * 100) / 100;
}

export interface PackageConfig {
  id: string;
  name: string;
  description: string;
  payAmount: number;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export const CREDIT_PACKAGES: PackageConfig[] = [
  { id: 'starter', name: '体验包', description: '个人开发者试用，探索AI能力', payAmount: 9.9, features: ['全部模型可用', '标准技术支持', '7天有效期'] },
  { id: 'lite', name: '轻量包', description: '适合个人项目、学习实验', payAmount: 49, features: ['全部模型可用', '标准技术支持', '30天有效期', '用量统计'], isPopular: true },
  { id: 'standard', name: '标准包', description: '适合小型团队、初创项目', payAmount: 179, features: ['全部模型可用', '优先技术支持', '90天有效期', '用量统计', '额度告警'] },
  { id: 'pro', name: '专业包', description: '适合中型企业、商业应用', payAmount: 699, features: ['全部模型可用', '优先技术支持', '365天有效期', '用量统计', '额度告警', '专属客服'], isPopular: true },
  { id: 'enterprise', name: '企业包', description: '适合大规模部署、高并发场景', payAmount: 3199, features: ['全部模型可用', '7×24技术支持', '365天有效期', '用量统计', '额度告警', '专属客服', 'SLA保障'], isEnterprise: true },
];

export const TEXT_MODELS: ModelConfig[] = [
  { id: 'qwen-flash', name: 'qwen-flash', provider: '阿里云百炼', category: 'text', description: '极速响应的轻量级模型', features: ['极速响应', '高性价比', '支持长文本'], contextLength: '1M', officialPricePer1KInput: 0.00015, officialPricePer1KOutput: 0.0015, costPer1KInput: 0.000102, costPer1KOutput: 0.00102, region: 'cn', freeQuota: 500000, isRecommended: true },
  { id: 'qwen3.5-flash', name: 'qwen3.5-flash', provider: '阿里云百炼', category: 'text', description: '增强版Flash，推理能力更强', features: ['思维链支持', '多轮对话', '代码生成'], contextLength: '1M', officialPricePer1KInput: 0.0002, officialPricePer1KOutput: 0.002, costPer1KInput: 0.000136, costPer1KOutput: 0.00136, region: 'cn', freeQuota: 300000, isNew: true },
  { id: 'qwen-plus', name: 'qwen-plus', provider: '阿里云百炼', category: 'text', description: '标准版大模型，适合商业应用', features: ['商业级性能', '中文优化', '多轮对话', '工具调用'], contextLength: '1M', officialPricePer1KInput: 0.0008, officialPricePer1KOutput: 0.002, costPer1KInput: 0.000544, costPer1KOutput: 0.00136, region: 'cn', freeQuota: 100000, isRecommended: true },
  { id: 'qwen3.7-plus', name: 'qwen3.7-plus', provider: '阿里云百炼', category: 'text', description: '最新Plus模型，256K长文本', features: ['256K长文本', '思维链', '深度推理'], contextLength: '256K', officialPricePer1KInput: 0.002, officialPricePer1KOutput: 0.008, costPer1KInput: 0.00136, costPer1KOutput: 0.00544, region: 'cn', freeQuota: 50000, isNew: true },
  { id: 'qwen3.6-plus', name: 'qwen3.6-plus', provider: '阿里云百炼', category: 'text', description: '旗舰级模型，复杂推理', features: ['旗舰性能', '复杂推理', '代码专家'], contextLength: '256K', officialPricePer1KInput: 0.002, officialPricePer1KOutput: 0.012, costPer1KInput: 0.00136, costPer1KOutput: 0.00816, region: 'cn', freeQuota: 20000 },
  { id: 'qwen3.7-max', name: 'qwen3.7-max', provider: '阿里云百炼', category: 'text', description: '最强模型，1M超长上下文', features: ['1M上下文', '顶级推理', '超长文档'], contextLength: '1M', officialPricePer1KInput: 0.012, officialPricePer1KOutput: 0.036, costPer1KInput: 0.00816, costPer1KOutput: 0.02448, region: 'cn', freeQuota: 10000 },
  { id: 'glm-5.1', name: '智谱GLM-5.1', provider: '智谱AI(阿里直供)', category: 'text', description: '智谱最新旗舰模型，中文能力卓越', features: ['中文优化', '长文本', '多模态'], contextLength: '200K', officialPricePer1KInput: 0.006, officialPricePer1KOutput: 0.012, costPer1KInput: 0.00528, costPer1KOutput: 0.01056, region: 'cn', freeQuota: 20000 },
  { id: 'deepseek-v4-flash', name: 'DeepSeek-V4-Flash', provider: 'DeepSeek(阿里直供)', category: 'text', description: 'DeepSeek轻量版，代码能力突出', features: ['代码生成', '极速响应', '中文支持'], contextLength: '128K', officialPricePer1KInput: 0.0015, officialPricePer1KOutput: 0.006, costPer1KInput: 0.00132, costPer1KOutput: 0.00528, region: 'cn', freeQuota: 50000 },
  { id: 'kimi-k2.6', name: 'Kimi-K2.6', provider: '月之暗面(阿里直供)', category: 'text', description: 'Kimi最新模型，长文本处理领先', features: ['超长文本', '文件解析', '联网搜索'], contextLength: '256K', officialPricePer1KInput: 0.003, officialPricePer1KOutput: 0.01, costPer1KInput: 0.00264, costPer1KOutput: 0.0088, region: 'cn', freeQuota: 30000 },
];

export const EMBEDDING_MODELS: ModelConfig[] = [
  { id: 'text-embedding-v4', name: 'text-embedding-v4', provider: '阿里云百炼', category: 'embedding', description: '通用文本向量模型', features: ['1536维向量', '通用语义', '高效检索'], contextLength: '8K', officialPricePer1KInput: 0.0005, officialPricePer1KOutput: 0, costPer1KInput: 0.00034, costPer1KOutput: 0, region: 'cn', freeQuota: 200000, isRecommended: true },
];

export const IMAGE_MODELS: ModelConfig[] = [
  { id: 'qwen-image-2.0', name: '通义万相-2.0', provider: '阿里云百炼', category: 'image', description: '标准版文生图模型', features: ['文生图', '海报设计', '中文理解'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 20 },
  { id: 'qwen-image-2.0-pro', name: '通义万相-2.0-Pro', provider: '阿里云百炼', category: 'image', description: '专业版文生图模型', features: ['高质量', '精细控制', '商用级'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 10 },
];

export const VIDEO_MODELS: ModelConfig[] = [
  { id: 'wan2.7-t2v-720p', name: '万相-文生视频-720P', provider: '阿里云百炼', category: 'video', description: '720P文生视频模型', features: ['文生视频', '720P', '5秒片段'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 5 },
  { id: 'wan2.7-t2v-1080p', name: '万相-文生视频-1080P', provider: '阿里云百炼', category: 'video', description: '1080P高清文生视频', features: ['文生视频', '1080P', '高清'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 3 },
  { id: 'seedance-2.0', name: 'Seedance 2.0', provider: '寰卓海外模型', category: 'video', description: '高质量AI视频生成，多种风格和特效', features: ['高质量视频', '多种风格', '特效预设', '角色一致性'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'us', geoRestriction: 'non-cn', freeQuota: 3 },
  { id: 'seedance-pro', name: 'Seedance Pro', provider: '寰卓海外模型', category: 'video', description: '专业级AI视频生成，商业级质量', features: ['专业级质量', '长视频', '商业授权', '4K输出'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'us', geoRestriction: 'non-cn', freeQuota: 1 },
];

export const AUDIO_MODELS: ModelConfig[] = [
  { id: 'cosyvoice-v3.5-flash', name: '百聆语音合成-Flash', provider: '阿里云百炼', category: 'audio', description: '极速语音合成', features: ['极速', '多音色', '中文优化'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 50000 },
  { id: 'cosyvoice-v3.5-plus', name: '百聆语音合成-Plus', provider: '阿里云百炼', category: 'audio', description: '高品质语音合成', features: ['高品质', '情感丰富', '多角色'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 20000 },
  { id: 'fun-asr', name: 'Fun-ASR语音识别', provider: '阿里云百炼', category: 'audio', description: '高准确率语音识别', features: ['高准确', '方言支持', '实时转写'], contextLength: '-', officialPricePer1KInput: 0, officialPricePer1KOutput: 0, costPer1KInput: 0, costPer1KOutput: 0, region: 'cn', freeQuota: 600 },
];

export const AGENT_MODELS: ModelConfig[] = [
  { id: 'wuying-jarvis', name: '无影贾维斯', provider: '阿里云', category: 'agent', description: '企业级AI智能体', features: ['任务编排', '多工具调用', '企业级'], contextLength: '1M', officialPricePer1KInput: 0.01, officialPricePer1KOutput: 0.03, costPer1KInput: 0.0068, costPer1KOutput: 0.0204, region: 'cn', freeQuota: 5000 },
];

export const ALL_MODELS: ModelConfig[] = [
  ...TEXT_MODELS, ...EMBEDDING_MODELS, ...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS, ...AGENT_MODELS,
];

export const MODELS_BY_CATEGORY = {
  text: TEXT_MODELS, embedding: EMBEDDING_MODELS, image: IMAGE_MODELS,
  video: VIDEO_MODELS, audio: AUDIO_MODELS, agent: AGENT_MODELS,
};

export const ALL_MODEL_CATEGORIES = [
  { key: 'text', label: '文本生成', models: TEXT_MODELS },
  { key: 'embedding', label: '向量模型', models: EMBEDDING_MODELS },
  { key: 'image', label: '图片生成', models: IMAGE_MODELS },
  { key: 'video', label: '视频生成', models: VIDEO_MODELS },
  { key: 'audio', label: '语音处理', models: AUDIO_MODELS },
  { key: 'agent', label: '智能体', models: AGENT_MODELS },
];

export function getAvailableModels(userGeo: string): ModelConfig[] {
  return ALL_MODELS.filter(m => {
    if (!m.geoRestriction || m.geoRestriction === 'none') return true;
    if (m.geoRestriction === 'cn-only') return userGeo === 'cn';
    if (m.geoRestriction === 'non-cn') return userGeo === 'non-cn';
    return true;
  });
}

export interface ModelTierPackage {
  id: string; tier: string; tierName: string; tierDescription: string; models: string[];
  packages: { id: string; name: string; tokenAmount: number; price: number; unitPrice: number }[];
}

export const MODEL_TIER_PACKAGES: ModelTierPackage[] = [
  { id: 'flash-tier', tier: 'flash', tierName: 'Flash 轻量', tierDescription: '极速响应、超高性价比', models: ['qwen-flash', 'qwen3.5-flash'],
    packages: [
      { id: 'flash-100m', name: '体验包', tokenAmount: 1000000, price: 1.9, unitPrice: 1.9 },
      { id: 'flash-500m', name: '轻量包', tokenAmount: 5000000, price: 7.9, unitPrice: 1.58 },
      { id: 'flash-2b', name: '标准包', tokenAmount: 20000000, price: 29.9, unitPrice: 1.50 },
      { id: 'flash-10b', name: '专业包', tokenAmount: 100000000, price: 129.9, unitPrice: 1.30 },
      { id: 'flash-50b', name: '企业包', tokenAmount: 500000000, price: 499.9, unitPrice: 1.00 },
    ] },
  { id: 'plus-tier', tier: 'plus', tierName: 'Plus 标准', tierDescription: '均衡性能与成本', models: ['qwen-plus', 'qwen3.7-plus'],
    packages: [
      { id: 'plus-50m', name: '体验包', tokenAmount: 500000, price: 1.9, unitPrice: 3.8 },
      { id: 'plus-200m', name: '轻量包', tokenAmount: 2000000, price: 5.9, unitPrice: 2.95 },
      { id: 'plus-1b', name: '标准包', tokenAmount: 10000000, price: 24.9, unitPrice: 2.49 },
      { id: 'plus-5b', name: '专业包', tokenAmount: 50000000, price: 99.9, unitPrice: 2.00 },
      { id: 'plus-20b', name: '企业包', tokenAmount: 200000000, price: 349.9, unitPrice: 1.75 },
    ] },
  { id: 'max-tier', tier: 'max', tierName: 'Max 旗舰', tierDescription: '最强推理能力', models: ['qwen3.6-plus', 'qwen3.7-max'],
    packages: [
      { id: 'max-10m', name: '体验包', tokenAmount: 100000, price: 2.9, unitPrice: 29.0 },
      { id: 'max-50m', name: '轻量包', tokenAmount: 500000, price: 9.9, unitPrice: 19.8 },
      { id: 'max-200m', name: '标准包', tokenAmount: 2000000, price: 34.9, unitPrice: 17.45 },
      { id: 'max-1b', name: '专业包', tokenAmount: 10000000, price: 149.9, unitPrice: 14.99 },
      { id: 'max-5b', name: '企业包', tokenAmount: 50000000, price: 599.9, unitPrice: 12.00 },
    ] },
];
