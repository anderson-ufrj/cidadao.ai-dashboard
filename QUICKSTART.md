# 🚀 Quick Start - 1 Minuto

## Download & Run

```bash
# 1. Extrair
tar -xzf cidadao-dashboard.tar.gz
cd cidadao-dashboard

# 2. Setup
chmod +x setup.sh
./setup.sh

# 3. Dev
npm run dev
```

**Pronto!** Dashboard rodando em [http://localhost:3000](http://localhost:3000)

---

## 📂 Estrutura

```
cidadao-dashboard/
├── src/
│   ├── app/              # Pages & API routes
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks (SWR)
│   ├── lib/              # Utils & constants
│   └── types/            # TypeScript types
├── README.md             # Documentação completa
├── ARCHITECTURE.md       # Arquitetura técnica
├── INTEGRATION.md        # Guia de integração
└── setup.sh              # Script de setup
```

---

## 🔧 Comandos Essenciais

```bash
npm run dev         # Dev server (localhost:3000)
npm run build       # Production build
npm start           # Servir build de produção
npm run type-check  # Verificar tipos TypeScript
```

---

## 🎯 Integração com API Real

**Modo Demo (padrão):** Usa dados sintéticos  
**Modo Produção:** Conecta ao Cidadão.AI

Para integrar com API real:
1. Configure `.env.local`:
```bash
CIDADAO_API_BASE=https://seu-backend.railway.app
CIDADAO_API_KEY=sua_chave_aqui
```

2. Edite `src/app/api/metrics/route.ts` (linhas 30-50)
3. Descomente código de fetch real
4. Rebuild: `npm run build`

**Detalhes:** Ver `INTEGRATION.md`

---

## 📊 Features

- ✅ Monitoramento de 16 agents brasileiros
- ✅ Grafo de orquestração interativo (Cytoscape)
- ✅ Métricas de performance (response time, success rate)
- ✅ Reflection quality tracking (threshold 0.8)
- ✅ Auto-refresh a cada 5s (SWR)
- ✅ Type-safe (TypeScript strict)
- ✅ Responsive design (Tailwind)

---

## 🐛 Problemas Comuns

**Node version?** Precisa Node.js 18+  
**Cytoscape não renderiza?** `npm install --force`  
**API não responde?** Checar CORS no backend  
**Slow build?** Desabilitar Turbopack: `next dev --no-turbo`  

---

## 📚 Docs

- `README.md` → Documentação completa
- `ARCHITECTURE.md` → Arquitetura técnica detalhada
- `INTEGRATION.md` → Como conectar à API real

---

## 🚢 Deploy

**Vercel (recomendado):**
```bash
npm i -g vercel
vercel --prod
```

**Docker:**
```bash
docker build -t cidadao-dashboard .
docker run -p 3000:3000 cidadao-dashboard
```

**Railway:**
```bash
railway login
railway init
railway up
```

---

## 💡 Next Steps

1. Rode localmente primeiro: `npm run dev`
2. Explore o código em `src/components/dashboard/`
3. Customize cores/agents em `src/lib/constants.ts`
4. Integre com API real (veja `INTEGRATION.md`)
5. Deploy pra produção

---

**Dúvidas?** Leia os docs completos no `README.md`

**Bug?** Verifique `package.json` versions

**Feature?** Fork & PR welcome! 🎉
