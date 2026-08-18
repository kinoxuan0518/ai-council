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
      { id: 'kimi-k3', name: 'Kimi K3' },
      { id: 'kimi-k2.6', name: 'Kimi K2.6' },
    ],
    color: '#3b82f6',
    badge: '🌙',
  },
  glm: {
    name: '智谱 GLM',
    nameEn: 'Zhipu AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-5.2', name: 'GLM-5.2' },
      { id: 'glm-5', name: 'GLM-5' },
      { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash（免费）' },
    ],
    color: '#8b5cf6',
    badge: '🧠',
  },
  minimax: {
    name: 'MiniMax',
    nameEn: 'MiniMax',
    baseUrl: 'https://api.minimaxi.com/v1',
    models: [
      { id: 'minimax-m2.7', name: 'MiniMax M2.7' },
      { id: 'MiniMax-M2', name: 'MiniMax M2' },
    ],
    color: '#10b981',
    badge: '✨',
  },
  qwen: {
    name: '通义千问',
    nameEn: 'Alibaba Qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-max-latest', name: 'Qwen Max' },
      { id: 'qwen-plus-latest', name: 'Qwen Plus' },
      { id: 'qwen-flash', name: 'Qwen Flash' },
    ],
    color: '#f59e0b',
    badge: '☁️',
  },
  deepseek: {
    name: 'DeepSeek',
    nameEn: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ],
    color: '#06b6d4',
    badge: '🔮',
  },
};
