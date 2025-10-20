import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Cidadão.AI - Dashboard de Agentes',
  description: 'Monitor em tempo real do sistema multi-agente de transparência pública',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        {/* Camada de fundo fixo com a imagem */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: 'url(/operarios.png)',
          }}
        />

        {/* Overlay semi-transparente */}
        <div className="fixed inset-0 bg-slate-900/90 dark:bg-slate-900/95 z-[5] pointer-events-none" />

        {/* Conteúdo principal */}
        <div className="relative z-20 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
