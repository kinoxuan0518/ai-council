export type Provider = 'openai' | 'anthropic' | 'google';

export type AgentRole =
  | 'strategist'
  | 'critic'
  | 'innovator'
  | 'executor'
  | 'moderator';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  provider: Provider;
  model: string;
  apiKey: string;
  color: string;
  avatar: string;
  enabled: boolean;
}

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: AgentRole;
  agentColor: string;
  agentAvatar: string;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isFinal?: boolean;
}

export interface CouncilSession {
  id: string;
  topic: string;
  messages: Message[];
  status: 'idle' | 'discussing' | 'synthesizing' | 'done';
  createdAt: Date;
}
