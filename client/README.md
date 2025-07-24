# Template BHVR - Login + Dashboard

Este é um template de login e dashboard construído com a stack BHVR (Bun + Hono + Vite + React) e shadcn UI.

## ✨ Funcionalidades

- 🔐 **Sistema de Autenticação Mocado**
- 📊 **Dashboard com Métricas**
- 🎨 **Interface Moderna com shadcn UI**
- 📱 **Design Responsivo**
- 🔄 **Estado Global com Context API**
- 🚀 **Hot Reload com Vite**

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Hono (Web Framework)
- **Runtime**: Bun
- **UI**: shadcn UI + Tailwind CSS
- **Icons**: Lucide React

## 🚀 Como Executar

### Pré-requisitos
- Bun instalado no sistema

### Instalação
```bash
# No diretório raiz do projeto
bun install

# Executar em modo desenvolvimento
bun run dev
```

Isso iniciará:
- Frontend em http://localhost:5173
- Backend em http://localhost:3000

## 🔐 Credenciais de Teste

O sistema aceita **qualquer email e senha válidos**. Exemplos:

- **Email**: `admin@bhvr.dev` | **Senha**: `123456`
- **Email**: `usuario@teste.com` | **Senha**: `minhasenha`

## 📁 Estrutura do Projeto

```
client/
├── src/
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes shadcn UI
│   │   ├── LoginForm.tsx    # Formulário de login
│   │   └── Dashboard.tsx    # Dashboard principal
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   ├── pages/               # Páginas da aplicação
│   │   └── LoginPage.tsx    # Página de login
│   ├── types/               # Tipos TypeScript
│   │   └── auth.ts          # Tipos de autenticação
│   └── App.tsx              # Componente principal
```

## 🎨 Componentes UI Incluídos

- **Button** - Botões com variações
- **Card** - Cards informativos
- **Input** - Campos de entrada
- **Label** - Rótulos para formulários

## 🔄 Fluxo de Autenticação

1. **Login**: Usuário insere credenciais
2. **Validação**: Backend valida e retorna token mockado
3. **Estado**: Context armazena usuário e token
4. **Redirecionamento**: Usuário é direcionado ao dashboard
5. **Logout**: Limpa estado e retorna ao login

## 📊 Dashboard Features

- **Métricas**: Estatísticas de usuários, vendas, etc.
- **Atividade Recente**: Lista de ações dos usuários
- **Status do Sistema**: Monitoramento de CPU, memória
- **Header**: Informações do usuário e logout

## 🛡️ Segurança

⚠️ **IMPORTANTE**: Este é um template para desenvolvimento com autenticação **MOCADA**. Para produção:

- Implementar JWT real
- Adicionar validação de senha
- Configurar HTTPS
- Implementar rate limiting
- Adicionar validação de dados

## 🔧 Personalização

### Cores e Tema
As cores podem ser personalizadas no arquivo `src/index.css` usando as variáveis CSS do shadcn UI.

### Adicionar Novos Componentes
```bash
npx shadcn@latest add [component-name]
```

### Mock Data
Os dados de exemplo estão em:
- `src/components/Dashboard.tsx` - Métricas e atividades
- `server/src/index.ts` - Usuários mockados

## 📚 Recursos Úteis

- [Documentação BHVR](https://bhvr.dev)
- [shadcn UI](https://ui.shadcn.com/)
- [Hono Framework](https://hono.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contribuição

Este template serve como base para projetos. Sinta-se livre para:

- Adicionar novas funcionalidades
- Melhorar o design
- Implementar autenticação real
- Adicionar mais páginas

---

Desenvolvido com ❤️ usando a stack BHVR
