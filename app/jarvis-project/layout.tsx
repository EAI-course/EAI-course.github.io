import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '建造你的 JARVIS｜具身智能引论课程项目',
  description: '具身智能引论课程项目愿景、Agent Workflow 参考框架、三阶段安排与评估说明。',
};

export default function JarvisProjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
