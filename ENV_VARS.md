# Variáveis de Ambiente - EventCapture

Este arquivo documenta todas as variáveis de ambiente necessárias para executar o projeto.

## 📋 **Variáveis Obrigatórias**

### **VITE_SUPABASE_URL**
- **Descrição:** URL do seu projeto Supabase
- **Formato:** `https://[project-ref].supabase.co`
- **Onde conseguir:**
  1. Acesse [Supabase Dashboard](https://app.supabase.com/)
  2. Selecione seu projeto
  3. Vá em **Settings** → **API**
  4. Copie o valor de **Project URL**

### **VITE_SUPABASE_ANON_KEY**
- **Descrição:** Chave pública anônima do Supabase
- **Formato:** String longa (JWT)
- **Onde conseguir:**
  1. Acesse [Supabase Dashboard](https://app.supabase.com/)
  2. Selecione seu projeto
  3. Vá em **Settings** → **API**
  4. Copie o valor de **anon public**

### **VITE_STRIPE_PUBLISHABLE_KEY**
- **Descrição:** Chave pública do Stripe (Publishable Key)
- **Formato:** `pk_test_...` ou `pk_live_...`
- **Uso:** Necessário para o checkout no frontend, embora a maioria da lógica esteja nas Edge Functions.
- **Onde conseguir:** Stripe Dashboard → Developers → API keys.

## 🔧 **Como Configurar**

### **1. Crie o arquivo `.env`**
Na raiz do projeto, crie um arquivo chamado `.env`:

```bash
touch .env
```

### **2. Adicione as variáveis**
Cole o seguinte conteúdo e substitua pelos seus valores:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-muito-longa-aqui
```

### **3. Verifique o `.gitignore`**
Certifique-se de que `.env` está no `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

## ⚠️ **Segurança**

### **Nunca Commite:**
- ❌ `.env` com credenciais reais
- ❌ Chaves privadas (`service_role` key)
- ❌ Senhas ou tokens

### **Sempre Use:**
- ✅ `.env.example` para documentação (sem valores reais)
- ✅ Variáveis de ambiente no CI/CD
- ✅ Secrets no Vercel/Netlify para produção

## 🚀 **Ambientes**

### **Development** (`.env`)
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key...
```

### **Production** (Vercel/Netlify)
Configure as variáveis no painel do hosting:
- Vercel: **Settings** → **Environment Variables**
- Netlify: **Site Settings** → **Build & Deploy** → **Environment**

## 📝 **Exemplo (`.env.example`)**

Crie um arquivo `.env.example` para documentação (pode commitar):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🐛 **Troubleshooting**

### **Erro: "Invalid API key"**
- Verifique se copiou a chave **anon** (não a service_role)
- Confirme que não há espaços extras

### **Erro: "Failed to connect to Supabase"**
- Verifique se a URL está correta
- Teste acessando a URL no navegador

### **Variável não carrega**
- Reinicie o servidor de desenvolvimento (`npm run dev`)
- Variáveis só são lidas no startup do Vite
