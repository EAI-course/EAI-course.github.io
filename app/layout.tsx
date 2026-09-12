import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '具身智能引论｜2026 秋季',
  description: '从感知、世界模型与决策，到视觉—语言—动作模型和真实机器人系统。',
  icons: {icon:'/favicon.svg'},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
