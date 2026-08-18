import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 决议会',
  description: '多模型 AI 协同决策平台',
};

export default function CouncilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
