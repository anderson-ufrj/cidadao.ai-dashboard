# 🚀 Deploy Rápido - Cidadão Dashboard no Vercel

## Deploy em 2 Minutos

### Opção 1: Deploy com 1 Click (Mais Fácil)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU-USUARIO/cidadao-dashboard&env=NEXT_PUBLIC_API_URL&envDescription=URL%20do%20backend%20Cidadao.AI&envLink=https://github.com/anderson-ufrj/cidadao.ai-backend)

### Opção 2: Deploy via Script (Automatizado)

```bash
# Execute o script de deploy
./deploy-vercel.sh

# O script irá:
# 1. Instalar Vercel CLI se necessário
# 2. Instalar dependências
# 3. Fazer build local para testar
# 4. Configurar variáveis de ambiente
# 5. Fazer deploy no Vercel
```

### Opção 3: Deploy Manual

```bash
# 1. Instale o Vercel CLI
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy
vercel --prod

# 4. Configure as variáveis no dashboard do Vercel
```

## ⚙️ Variáveis de Ambiente Necessárias

No dashboard do Vercel, adicione:

```env
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
NEXT_PUBLIC_ENABLE_REAL_API=true
NEXT_PUBLIC_CACHE_TTL=5000
NEXT_PUBLIC_REFRESH_INTERVAL=5000
```

## 📋 Checklist Pré-Deploy

- [ ] Node.js 18+ instalado
- [ ] Conta no Vercel criada
- [ ] Repositório no GitHub (opcional)
- [ ] Backend do Cidadão.AI rodando

## 🎯 URLs Após Deploy

- **Dashboard**: `https://seu-projeto.vercel.app`
- **API Metrics**: `https://seu-projeto.vercel.app/api/metrics`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

## 🆘 Troubleshooting

### Build falha?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Variáveis não funcionam?
```bash
vercel env pull  # Baixa as variáveis
vercel dev       # Testa localmente
```

### CORS errors?
Verifique o `vercel.json` - headers CORS já configurados.

## 📊 Performance Esperada

- **Build Time**: ~2 min
- **Deploy Time**: ~1 min
- **Bundle Size**: <200KB gzipped
- **Lighthouse Score**: >90

## 🚀 Comandos Úteis

```bash
# Ver logs
vercel logs

# Ver deployments
vercel ls

# Rollback
vercel rollback

# Adicionar domínio customizado
vercel domains add dashboard.cidadao.ai
```

## ✅ Sucesso!

Após o deploy, você terá:
- Dashboard em produção
- SSL/HTTPS automático
- CDN global
- Auto-scaling
- Zero downtime deploys

---

**Tempo Total**: 3 minutos ⏱️
**Dificuldade**: Fácil 🟢

Built with ❤️ for Brazil 🇧🇷