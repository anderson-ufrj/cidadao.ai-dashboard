import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cidadão.AI - Agent Orchestration Dashboard',
  description: 'Real-time monitoring and performance analysis for Brazilian government transparency multi-agent system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
