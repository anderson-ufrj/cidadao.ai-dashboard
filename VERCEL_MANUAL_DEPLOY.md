# 🚀 Deploy Manual no Vercel - Solução Alternativa

Se o deploy automático continuar falhando, siga estes passos:

## Opção 1: Deploy via Vercel CLI (Recomendado)

```bash
# 1. Instale o Vercel CLI globalmente
npm i -g vercel

# 2. Entre na pasta do projeto
cd add-ons/cidadao-dashboard

# 3. Faça login no Vercel
vercel login

# 4. Execute o deploy
vercel

# 5. Responda as perguntas:
# - Set up and deploy? Yes
# - Which scope? (escolha sua conta)
# - Link to existing project? No
# - Project name? cidadao-dashboard
# - In which directory is your code? ./
# - Override settings? No

# 6. Para deploy em produção
vercel --prod
```

## Opção 2: Deploy Manual via Interface Web

1. **Delete o projeto atual** (se existir):
   - Vá para https://vercel.com/dashboard
   - Clique no projeto
   - Settings → Delete Project

2. **Crie um novo projeto**:
   - Clique em "New Project"
   - Import Git Repository
   - Escolha: `anderson-ufrj/cidadao.ai-dashboard`

3. **Configure manualmente**:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Adicione as variáveis de ambiente**:
   ```
   NEXT_PUBLIC_API_URL = https://cidadao-api-production.up.railway.app
   NEXT_PUBLIC_ENABLE_REAL_API = true
   NEXT_PUBLIC_USE_MOCK_DATA = false
   ```

5. **Deploy**:
   - Clique em "Deploy"
   - Aguarde ~2-3 minutos

## Opção 3: Deploy com Zero Config

Se nada funcionar, remova o `vercel.json` completamente:

```bash
# Remove vercel.json
rm vercel.json

# Commit
git add .
git commit -m "Remove vercel.json for zero-config deploy"
git push

# O Vercel detectará automaticamente Next.js
```

## Opção 4: Fork e Deploy Limpo

1. **Fork o repositório** no GitHub
2. **Clone o fork**:
   ```bash
   git clone https://github.com/SEU-USUARIO/cidadao.ai-dashboard
   cd cidadao.ai-dashboard
   ```

3. **Deploy via Vercel CLI**:
   ```bash
   vercel --prod
   ```

## 📝 Variáveis de Ambiente Essenciais

No Vercel Dashboard → Settings → Environment Variables:

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://cidadao-api-production.up.railway.app` |
| `NEXT_PUBLIC_ENABLE_REAL_API` | `true` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` |

## 🔍 Debug - Se Ainda Falhar

1. **Verifique os logs detalhados**:
   - Vercel Dashboard → Functions → Logs
   - Procure por erros específicos

2. **Teste localmente**:
   ```bash
   npm install
   npm run build
   npm start
   ```

3. **Verifique versão do Node**:
   ```bash
   node --version  # Deve ser 18.x ou superior
   ```

4. **Limpe cache e reinstale**:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   npm run build
   ```

## 🆘 Suporte

- **Vercel Support**: https://vercel.com/help
- **Status Page**: https://vercel-status.com
- **GitHub Issues**: https://github.com/anderson-ufrj/cidadao.ai-dashboard/issues

## ✅ Teste de Sucesso

Após deploy bem-sucedido, você verá:
- URL: `https://cidadao-dashboard.vercel.app`
- Status: Ready
- SSL: Ativo
- Performance: Otimizada

---

**Nota**: O erro "An unexpected error happened" geralmente é temporário e relacionado à infraestrutura do Vercel, não ao código.