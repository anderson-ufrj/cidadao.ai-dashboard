# 🚀 Vercel Deployment Guide - Cidadão.AI Dashboard

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Git configurado
- Node.js 18+ instalado localmente

## 🎯 Opção 1: Deploy via Interface Web (Recomendado)

### 1. Prepare o Repositório

```bash
# Navegue até o diretório do projeto
cd add-ons/cidadao-dashboard

# Inicialize git se necessário
git init
git add .
git commit -m "Initial commit: Cidadão.AI Dashboard"

# Crie um repositório no GitHub e faça push
git remote add origin https://github.com/SEU-USUARIO/cidadao-dashboard.git
git push -u origin main
```

### 2. Deploy no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em "Import Git Repository"
3. Conecte sua conta GitHub
4. Selecione o repositório `cidadao-dashboard`
5. Configure as variáveis de ambiente:

```env
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
NEXT_PUBLIC_ENABLE_REAL_API=true
NEXT_PUBLIC_CACHE_TTL=5000
NEXT_PUBLIC_REFRESH_INTERVAL=5000
```

6. Clique em "Deploy"

## 🖥️ Opção 2: Deploy via CLI

### 1. Instale Vercel CLI

```bash
npm i -g vercel
```

### 2. Login no Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# Na pasta do projeto
cd add-ons/cidadao-dashboard

# Deploy para produção
vercel --prod

# Ou use o script automatizado
./deploy-vercel.sh
```

## ⚙️ Configuração de Variáveis de Ambiente

### No Dashboard do Vercel:

1. Vá para Settings → Environment Variables
2. Adicione as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://cidadao-api-production.up.railway.app` | URL do backend |
| `NEXT_PUBLIC_APP_URL` | `https://seu-app.vercel.app` | URL do frontend |
| `NEXT_PUBLIC_ENABLE_REAL_API` | `true` | Usar API real |
| `NEXT_PUBLIC_CACHE_TTL` | `5000` | TTL do cache (ms) |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | `5000` | Intervalo de refresh (ms) |
| `NEXT_PUBLIC_DEBUG_MODE` | `false` | Modo debug |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` | Usar dados mock |

### Variáveis Opcionais:

```env
# Analytics
NEXT_PUBLIC_GA_ID=UA-XXXXXXXX-X
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Database (se necessário)
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://localhost:6379

# Security
NEXT_PUBLIC_ENABLE_CORS=true
NEXT_PUBLIC_ENABLE_RATE_LIMITING=true
```

## 🔄 CI/CD Automático

### GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Configurar Secrets no GitHub:

1. Vá para Settings → Secrets → Actions
2. Adicione:
   - `VERCEL_TOKEN`: Token de autenticação
   - `VERCEL_ORG_ID`: ID da organização
   - `VERCEL_PROJECT_ID`: ID do projeto

## 🌐 Domínio Customizado

### 1. No Dashboard do Vercel:

1. Vá para Settings → Domains
2. Adicione seu domínio: `dashboard.cidadao.ai`
3. Configure DNS:

```
Tipo: CNAME
Nome: dashboard
Valor: cname.vercel-dns.com
```

### 2. SSL/HTTPS:

- SSL é configurado automaticamente pelo Vercel
- Certificado Let's Encrypt gratuito

## 📊 Monitoramento

### Vercel Analytics (Integrado):

```tsx
// Já configurado em src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Logs e Métricas:

1. Acesse: Functions → Logs
2. Monitore:
   - Response times
   - Error rates
   - API usage
   - Build times

## 🔧 Troubleshooting

### Problema: Build falha

```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Variáveis de ambiente não funcionam

```bash
# Verifique no Vercel Dashboard
vercel env pull

# Teste localmente
vercel dev
```

### Problema: CORS errors

Adicione ao `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### Problema: Performance lenta

1. Ative ISR (Incremental Static Regeneration):

```tsx
export const revalidate = 60; // Revalida a cada 60 segundos
```

2. Use Edge Functions:

```tsx
export const runtime = 'edge';
```

## 🚀 Otimizações de Performance

### 1. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority
/>
```

### 2. Font Optimization

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});
```

### 3. Bundle Analysis

```bash
# Instale
npm install --save-dev @next/bundle-analyzer

# Configure em next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // suas configs
});

# Analise
ANALYZE=true npm run build
```

## 📈 Métricas de Sucesso

Após deploy, monitore:

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse Score**: > 90 em todas categorias
- **Bundle Size**: < 200KB gzipped
- **TTI**: < 3s
- **API Response**: < 200ms p95

## 🔐 Segurança

### Headers de Segurança (já configurados):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Rate Limiting:

```tsx
// src/app/api/metrics/route.ts
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500, // Max 500 requests por IP
});
```

## 📱 PWA Configuration (Opcional)

```bash
# Instale
npm install next-pwa

# Configure em next.config.mjs
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // suas configs
});
```

## 🎉 Pronto!

Seu dashboard está no ar!

### URLs Importantes:

- **Production**: `https://cidadao-dashboard.vercel.app`
- **Preview**: `https://cidadao-dashboard-git-develop.vercel.app`
- **Analytics**: `https://vercel.com/your-team/cidadao-dashboard/analytics`

### Próximos Passos:

1. Configure alertas de monitoramento
2. Ative Vercel Analytics
3. Configure backup automático
4. Implemente testes E2E
5. Configure proteção DDoS

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issues**: https://github.com/your-user/cidadao-dashboard/issues

---

**Deployment Time**: ~3 minutos
**Zero Downtime**: ✅
**Auto-scaling**: ✅
**Global CDN**: ✅
**SSL/HTTPS**: ✅

Built with ❤️ for transparent governance in Brazil 🇧🇷