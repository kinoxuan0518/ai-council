import { Provider } from '@/types';

export const PROVIDER_CONFIG: Record<
  Provider,
  {
    name: string;
    nameEn: string;
    baseUrl: string;
    models: { id: string; name: string }[];
    color: string;
    badge: string;
  }
> = {
  kimi: {
    name: 'Kimi',
    nameEn: 'Moonshot AI',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2.5' },
      { id: 'moonshot-v1-128k', name: 'Moonshot 128K' },
      { id: 'moonshot-v1-32k', name: 'Moonshot 32K' },
    ],
    color: '#3b82f6',
    badge: '🌙',
  },
  glm: {
    name: '智谱 GLM',
    nameEn: 'Zhipu AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-z1-plus', name: 'GLM5 (Z1 Plus)' },
      { id: 'glm-z1-flash', name: 'GLM5 Flash' },
      { id: 'glm-4-plus', name: 'GLM-4 Plus' },
    ],
    color: '#8b5cf6',
    badge: '🧠',
  },
  minimax: {
    name: 'MiniMax',
    nameEn: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    models: [
      { id: 'MiniMax-Text-01', name: 'MiniMax m2.7' },
      { id: 'abab6.5s-chat', name: 'ABAB 6.5s' },
    ],
    color: '#10b981',
    badge: '✨',
  },
  qwen: {
    name: '通义千问',
    nameEn: 'Alibaba Qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen3-235b-a22b', name: 'Qwen3.5 235B' },
      { id: 'qwen-plus-latest', name: 'Qwen Plus' },
      { id: 'qwen-turbo-latest', name: 'Qwen Turbo' },
    ],
    color: '#f59e0b',
    badge: '☁️',
  },
  deepseek: {
    name: 'DeepSeek',
    nameEn: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ],
    color: '#06b6d4',
    badge: '🔮',
  },
};

export const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    labelEn: string;
    description: string;
    systemPrompt: string;
    emoji: string;
  }
> = {
  strategist: {
    label: '战略家',
    labelEn: 'Strategist',
    description: '高层战略规划，全局视角',
    systemPrompt: `你是AI决议会中的战略家。你的职责是从战略高度分析议题，洞察长远影响，提供宏观框架与关键方向。保持洞察力与前瞻性。用中文回答，200-400字，条理清晰。`,
    emoji: '🎯',
  },
  critic: {
    label: '批判者',
    labelEn: 'Critic',
    description: '发现风险、漏洞与潜在问题',
    systemPrompt: `你是AI决议会中的批判者。你的职责是挑战既有方案，识别风险与盲点，提出反驳意见，考察边界情况。保持建设性批判。用中文回答，200-400字，有理有据。`,
    emoji: '🔍',
  },
  innovator: {
    label: '创新者',
    labelEn: 'Innovator',
    description: '创意思维，突破性解决方案',
    systemPrompt: `你是AI决议会中的创新者。你的职责是提出非常规、突破性的创意与解决方案，跳出固有思维，探索新可能。保持创造力与想象力。用中文回答，200-400字，思路开阔。`,
    emoji: '💡',
  },
  executor: {
    label: '执行者',
    labelEn: 'Executor',
    description: '具体实施路径与行动计划',
    systemPrompt: `你是AI决议会中的执行者。你的职责是将想法转化为具体可落地的步骤、时间表和资源计划。聚焦可行性与实操细节。用中文回答，200-400字，清单式表达。`,
    emoji: '⚡',
  },
  moderator: {
    label: '主持人',
    labelEn: 'Moderator',
    description: '综合所有观点，输出最终决议',
    systemPrompt: `你是AI决议会的主持人。你的职责是综合所有成员的观点，输出结构化的最终决议方案。请按以下结构输出：

## 📋 最终决议

### 🎯 核心战略
[综合战略家观点]

### ⚠️ 风险与对策
[综合批判者观点与对应解决措施]

### 💡 创新方向
[综合创新者的关键创意]

### ⚡ 执行路线图
[综合执行者的行动计划]

### ✅ 最终建议
[你的综合判断与行动建议]

用中文回答，结构完整，逻辑清晰。`,
    emoji: '⚖️',
  },
};
