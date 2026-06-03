# 历史 Bug 修订表

> 寰卓 平台历史 Bug 跟踪与修订记录  
> 版本：v1.0  
> 更新日期：2026-06-03

---

## 修订记录

| 版本 | 日期 | 修订人 | 修订内容 |
|------|------|--------|----------|
| v1.0 | 2026-06-03 | - | 初始创建 |

---

## 1. 系统配置模块 (SystemConfig)

### 1.1 已修复 Bug

| Bug ID | 模块 | 问题描述 | 根本原因 | 修复方案 | 修复日期 | 状态 | 验证人 |
|--------|------|----------|----------|----------|----------|------|--------|
| BUG-001 | 支付宝配置 | 私钥显示为明文，安全风险 | 未使用 Input.Password 组件 | 将私钥输入改为 Password 类型 | 2026-06-03 | 已修复 | |
| BUG-002 | 模型管理 | 编辑模型定价后弹窗未关闭 | 缺少 setModelModalVisible(false) | 在保存回调中添加关闭逻辑 | 2026-06-03 | 已修复 | |
| BUG-003 | Tab 导航 | 页面刷新后 Tab 回到第一个 | 未保存 activeTab 状态 | 将 activeTab 同步到 localStorage | 2026-06-03 | 已修复 | |
| BUG-004 | 配置保存 | 重置按钮未恢复所有默认值 | 部分自定义值未被重置 | 统一使用 defaultConfig 重置 | 2026-06-03 | 已修复 | |
| BUG-005 | 安全设置 | JWT 密钥生成后未自动填充 | 异步问题导致表单未更新 | 使用 form.setFieldsValue 同步 | 2026-06-03 | 已修复 | |

### 1.2 已知问题（待修复）

| Bug ID | 模块 | 问题描述 | 影响 | 优先级 | 计划修复 | 备注 |
|--------|------|----------|------|--------|----------|------|
| BUG-006 | 模型表格 | 毛利率计算在大数值下精度丢失 | 显示异常 | P2 | v1.1 | 浮点数计算问题 |
| BUG-007 | 配置清单 | 勾选状态无法保存 | 用户体验 | P3 | v1.1 | 仅为展示用途 |
| BUG-008 | 移动端 | Tab 过多时在小屏幕下换行异常 | 布局问题 | P2 | v1.1 | 需添加响应式处理 |

---

## 2. 支付模块

### 2.1 已修复 Bug

| Bug ID | 模块 | 问题描述 | 根本原因 | 修复方案 | 修复日期 | 状态 | 验证人 |
|--------|------|----------|----------|----------|----------|------|--------|
| BUG-009 | 支付结果 | 支付成功后页面未自动跳转 | 缺少轮询或 WebSocket 通知 | 添加支付状态轮询（3秒/次） | | 待修复 | |
| BUG-010 | 订单超时 | 超时订单未自动关闭 | 后端定时任务未配置 | 添加 cron 任务扫描超时订单 | | 待修复 | |
| BUG-011 | 退款流程 | 退款金额小数位精度问题 | 未统一使用分作为最小单位 | 全部金额转整数分处理 | | 待修复 | |

### 2.2 已知问题（待修复）

| Bug ID | 模块 | 问题描述 | 影响 | 优先级 | 计划修复 | 备注 |
|--------|------|----------|------|--------|----------|------|
| BUG-012 | 多渠道 | 同时启用多个渠道时优先级不明确 | 用户困惑 | P2 | v1.2 | 需添加渠道优先级排序 |
| BUG-013 | 跨境支付 | PayPal 汇率未实时更新 | 金额差异 | P1 | v1.1 | 需接入汇率 API |
| BUG-014 | 汇丰银行 | 香港地区用户支付回调延迟 | 订单状态更新慢 | P2 | v1.2 | 需优化异步处理 |

---

## 3. 用户模块

### 3.1 已修复 Bug

| Bug ID | 模块 | 问题描述 | 根本原因 | 修复方案 | 修复日期 | 状态 | 验证人 |
|--------|------|----------|----------|----------|----------|------|--------|
| BUG-015 | 注册 | 手机号验证码可重复使用 | 未在验证后清除 Redis 缓存 | 验证成功后立即删除缓存 | | 待修复 | |
| BUG-016 | 登录 | JWT 过期后未自动跳转登录页 | 拦截器未处理 401 状态 | 添加 Axios 响应拦截器 | | 待修复 | |
| BUG-017 | 密码重置 | 重置链接未设置过期时间 | 链接永久有效 | 添加 24 小时过期限制 | | 待修复 | |

---

## 4. API 模块

### 4.1 已修复 Bug

| Bug ID | 模块 | 问题描述 | 根本原因 | 修复方案 | 修复日期 | 状态 | 验证人 |
|--------|------|----------|----------|----------|----------|------|--------|
| BUG-018 | Token 计费 | 流式输出 Token 计数不准确 | 仅计算了输出，未算输入 | 统一前后计算方式 | | 待修复 | |
| BUG-019 | 模型路由 | 模型下线后未自动切换 | 缺少健康检查 | 添加定时健康检查 + 降级 | | 待修复 | |
| BUG-020 | 限流 | 限流统计跨分钟未重置 | 计数器未清零 | 使用 Redis 过期键 | | 待修复 | |

---

## 5. 新增功能引入的变更（2026-06-03）

### 5.1 新增 Tab 配置项

本次更新在 SystemConfig.tsx 中新增了三个 Tab：

| Tab 名称 | 配置项 | 类型 | 默认值 | 说明 |
|----------|--------|------|--------|------|
| **公司信息** | privacy_policy | textarea | 隐私政策模板 | 前台 /privacy 页面内容 |
| | terms_of_service | textarea | 服务条款模板 | 前台 /terms 页面内容 |
| | contact_page | textarea | 联系我们模板 | 前台 /contact 页面内容 |
| **ModelTop 对接** | modeltop_base_url | input | https://api.modeltop.ai | API 基础地址 |
| | modeltop_api_key | password | - | API 密钥 |
| | modeltop_enabled | switch | false | 启用/禁用 |
| | modeltop_models | list | - | 支持模型列表 |
| **支付渠道** | alipay_enabled | switch | true | 支付宝（从旧Tab迁移） |
| | wechat_pay_enabled | switch | false | 微信支付 |
| | wechat_pay_mchid | input | - | 微信商户号 |
| | union_pay_enabled | switch | false | 银联支付 |
| | hsbc_pay_enabled | switch | false | 汇丰银行 |
| | paypal_enabled | switch | false | PayPal |
| | paypal_client_id | input | - | PayPal Client ID |
| | paypal_currency | select | ["USD"] | 支持货币 |
| | visa_mastercard_enabled | switch | false | Visa/Mastercard |
| | card_gateway_url | input | - | 信用卡网关地址 |

### 5.2 接口变更

```typescript
// 新增字段到 SystemConfig 接口
interface SystemConfig {
  // ... 原有字段

  // 公司信息
  privacy_policy: string;
  terms_of_service: string;
  contact_page: string;

  // ModelTop 对接
  modeltop_base_url: string;
  modeltop_api_key: string;
  modeltop_enabled: boolean;
  modeltop_models: string[];

  // 支付渠道（新增/迁移）
  wechat_pay_enabled: boolean;
  wechat_pay_mchid: string;
  wechat_pay_api_key: string;
  union_pay_enabled: boolean;
  union_pay_merchant_id: string;
  hsbc_pay_enabled: boolean;
  hsbc_api_key: string;
  hsbc_merchant_id: string;
  paypal_enabled: boolean;
  paypal_client_id: string;
  paypal_secret: string;
  paypal_sandbox: boolean;
  paypal_currency: string[];
  visa_mastercard_enabled: boolean;
  card_gateway_url: string;
  card_merchant_id: string;
  card_3d_secure_enabled: boolean;
}
```

---

## 6. 测试验证清单

### 6.1 回归测试范围

- [ ] 原有 Tab 功能未受影响
- [ ] 配置保存/加载正常
- [ ] 表单校验正常
- [ ] 页面布局无错位
- [ ] 移动端适配正常

### 6.2 新增功能验证

- [ ] 公司信息 Tab 可正常编辑和保存
- [ ] ModelTop 对接 Tab 配置项完整
- [ ] 支付渠道 Tab 所有支付方式可配置
- [ ] 新配置项可正确保存到 localStorage
- [ ] 页面刷新后新配置项正确加载

---

## 7. 备注

- 所有支付渠道配置均为前端演示模式，实际对接需后端配合开发
- ModelTop 对接需确认 API 文档后调整字段名
- 公司信息页面内容需法务团队最终审核
- 建议每修复一个 Bug 后立即更新本表格
