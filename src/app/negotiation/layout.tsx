import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '谈薪物语 · 薪资谈判模拟',
  description: '沉浸式谈薪谈判 Gal Game：扮演 HR 或候选人，与大模型自由对话谈判，结束生成复盘报告',
};

export default function NegotiationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
