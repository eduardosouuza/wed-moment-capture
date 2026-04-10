# 📸 EventCapture - SaaS de Cabine de Fotos

> Plataforma completa para eventos com captura de fotos/vídeos, galeria em tempo real e temas personalizáveis.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 **Funcionalidades**

### **Para Clientes (Criadores de Eventos)**
- ✅ Criar e gerenciar eventos personalizados
- ✅ Escolher entre 6 temas de cores
- ✅ QR Code automático para cada evento
- ✅ Copiar link do evento com um clique
- ✅ Dashboard com estatísticas em tempo real
- ✅ Editar eventos existentes
- ✅ Indicadores de limite de uso e plano

### **Para Convidados (Usuários Finais)**
- ✅ Acesso via link público (`/e/:slug`)
- ✅ Captura de fotos sequenciais (3 fotos com countdown)
- ✅ Gravação de vídeos (15 segundos)
- ✅ Galeria em tempo real (auto-refresh 5s)
- ✅ Download de fotos/vídeos
- ✅ Interface responsiva (Mobile/Desktop)
- ✅ Temas dinâmicos por evento

### **Para Administradores**
- ✅ Painel admin completo (`/admin`)
- ✅ Visualizar todos os eventos de todos os usuários
- ✅ Gerenciar eventos (ativar/desativar/excluir)
- ✅ Métricas globais do sistema

---

## 🛠️ **Tech Stack**

| Categoria | Tecnologia |
|-----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Build Tool** | Vite |
| **Deployment** | Vercel |
| **QR Code** | qrcode.react |
| **Icons** | Lucide React |

---

## 📦 **Instalação**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### **Passo 1: Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/eventcapture.git
cd eventcapture
```

### **Passo 2: Instale as Dependências**
```bash
npm install
```

### **Passo 3: Configure Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

> ⚠️ **Nunca commite o arquivo `.env` no Git!**

### **Passo 4: Configure o Banco de Dados**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o script `supabase-setup-clean.sql`
4. Execute o script `add-theme-color.sql`

### **Passo 5: Inicie o Servidor de Desenvolvimento**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🗂️ **Estrutura do Projeto**

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   ├── CameraWithLayout.tsx
│   ├── Gallery.tsx
│   ├── PhotoboothMain.tsx
│   └── ThemeSelector.tsx
├── hooks/              # Custom Hooks
│   ├── useAuth.tsx     # Autenticação
│   └── useEvent.tsx    # CRUD de eventos
├── lib/                # Bibliotecas/Utils
│   ├── supabase.ts     # Cliente Supabase
│   ├── themes.ts       # Sistema de temas
│   └── utils.ts        # Funções auxiliares
├── pages/              # Páginas/Rotas
│   ├── Dashboard.tsx   # Dashboard do cliente
│   ├── Admin Dashboard.tsx  # Painel admin
│   ├── EventPage.tsx   # Página pública do evento
│   ├── NewEvent.tsx    # Criar evento
│   ├── EditEvent.tsx   # Editar evento
│   ├── Login.tsx       # Login
│   ├── Register.tsx    # Cadastro
│   └── Index.tsx       # Landing page
├── types/              # TypeScript types
│   └── database.ts     # Types do Supabase
└── App.tsx             # Rotas principais
```

---

## 🎨 **Sistema de Temas**

### **Paletas Disponíveis**

| Tema | Emoji | Cor Principal |
|------|-------|---------------|
| Roxo Elegante | 🟣 | `#8B5CF6` |
| Azul Oceano | 🔵 | `#3B82F6` |
| Rosa Romântico | 💗 | `#EC4899` |
| Verde Natural | 🟢 | `#10B981` |
| Laranja Vibrante | 🟠 | `#F97316` |
| Vermelho Paixão | 🔴 | `#EF4444` |

### **Como Funciona**

1. Cliente escolhe uma cor ao criar o evento
2. Cor é salva no campo `theme_color` no banco
3. Ao acessar `/e/:slug`, a função `applyTheme()` aplica CSS variables
4. Toda a interface muda dinamicamente

---

## 🔐 **Autenticação e Autorização**

### **Tipos de Usuário**
- **Público:** Acesso às páginas de eventos (`/e/:slug`)
- **Cliente:** Usuários autenticados (criar/gerenciar eventos)
- **Admin:** Role especial (`is_admin = true` no perfil)

### **Rotas Protegidas**
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### **Row Level Security (RLS)**
- Usuários só veem/editam seus próprios eventos
- Admins veem todos os eventos
- Políticas configuradas no Supabase

---

## 📱 **API / Banco de Dados**

### **Tabelas Principais**

#### **profiles**
```sql
- id (uuid, PK)
- email (text)
- full_name (text)
- plan (text): 'free', 'basic', 'premium'
- is_admin (boolean)
```

#### **events**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- name (text)
- slug (text, UNIQUE)
- event_type (text)
- event_date (date)
- theme_color (text)
- is_active (boolean)
- max_photos (int)
- max_videos (int)
```

#### **media**
```sql
- id (uuid, PK)
- event_id (uuid, FK → events)
- media_type (text): 'photo', 'video'
- file_path (text)
- uploaded_at (timestamp)
```

---

## 🚀 **Deploy**

### **Vercel (Recomendado)**

1. **Push para GitHub**
2. **Conecte ao Vercel:**
   - Importe o repositório
   - Configure as variáveis de ambiente:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
3. **Deploy automático!**

### **Build Local**
```bash
npm run build
```

Arquivos gerados em `dist/`

---

## 🧪 **Testes**

```bash
# Executar testes (quando implementados)
npm test
```

> ⚠️ Testes ainda não implementados (roadmap futuro)

---

## 📊 **Limites por Plano**

| Recurso | Free | Basic | Premium |
|---------|------|-------|---------|
| **Eventos** | 1 | 5 | Ilimitado |
| **Fotos/Evento** | 50 | 200 | Ilimitado |
| **Storage** | 100MB | 1GB | 10GB |
| **Temas** | Todos | Todos | Todos |
| **Suporte** | Email | Email | Prioritário |

---

## 🐛 **Troubleshooting**

### **Erro: "Failed to load module"**
```bash
rm -rf node_modules
npm install
```

### **QR Code não aparece**
- Verifique se a biblioteca `qrcode.react` está instalada
- Certifique-se de importar `QRCodeSVG` não `QRCode`

### **Fotos não salvam**
- Verifique permissões do Storage no Supabase
- Confirme que RLS está configurado corretamente

---

## 📝 **Changelog**

### **v1.0.0** (Dezembro 2025)
- ✅ Sistema de autenticação
- ✅ CRUD de eventos
- ✅ Captura de fotos/vídeos
- ✅ Galeria em tempo real
- ✅ 6 temas de cores
- ✅ Dashboard do cliente
- ✅ Painel admin
- ✅ QR Codes automáticos
- ✅ Edição de eventos

---

## 🤝 **Contribuindo**

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 👨‍💻 **Autor**

**Eduardo Souza**
- GitHub: [@eduardosouuza](https://github.com/eduardosouuza)

---

## 🙏 **Agradecimentos**

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Lucide](https://lucide.dev/) - Ícones

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
