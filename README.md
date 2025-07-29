# Web Chat BHVR

Um web chat moderno que permite comunicação com agentes n8n através de webhooks. Desenvolvido com Bun, Hono, React e TypeScript.

## 🚀 Funcionalidades

- **Interface de Chat Moderna**: Interface limpa e responsiva para conversas
- **Gerenciamento de Agentes**: Adicione e gerencie múltiplos agentes n8n
- **Comunicação via Webhook**: Integração direta com workflows do n8n
- **Armazenamento em Memória**: Sem necessidade de banco de dados
- **Autenticação Simples**: Sistema de login mock para demonstração

## 🛠️ Tecnologias

- **Backend**: Bun + Hono (TypeScript)
- **Frontend**: React + Vite + TypeScript
- **UI**: Tailwind CSS + Radix UI
- **Monorepo**: Workspaces com Bun

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd my-bhvr-app
```

2. Instale as dependências:
```bash
bun install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
bun run dev
```

Isso iniciará:
- Servidor backend na porta 3001
- Cliente frontend na porta 5173
- Compilação TypeScript em modo watch

## 🔧 Configuração

### Configurando um Agente n8n

1. **Crie um workflow no n8n** com um nó Webhook
2. **Configure o webhook** para receber requisições POST
3. **Adicione lógica de processamento** (IA, APIs, etc.)
4. **Configure a resposta** para retornar JSON com:
   ```json
   {
     "response": "Sua resposta aqui",
     "message": "Mensagem alternativa"
   }
   ```

### Adicionando um Agente no Chat

1. Faça login na aplicação (qualquer email/senha válidos)
2. Clique no botão "+" na sidebar
3. Preencha:
   - **Nome do Agente**: Nome descritivo (ex: "Assistente de Vendas")
   - **URL do Webhook**: URL do webhook do seu n8n
4. Clique em "Criar Agente"

## 📡 API Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `GET /auth/me` - Verificar token

### Chat
- `GET /chat` - Listar todos os chats
- `POST /chat` - Criar novo chat
- `GET /chat/:chatId/messages` - Obter mensagens de um chat
- `POST /chat/:chatId/messages` - Enviar mensagem para um chat
- `POST /webhook/:chatId` - Webhook para receber mensagens dos agentes

## 🔄 Fluxo de Comunicação

1. **Usuário envia mensagem** → Chat App
2. **Chat App** → Servidor BHVR
3. **Servidor BHVR** → Webhook n8n (com mensagem do usuário)
4. **n8n processa** → Retorna resposta
5. **Servidor BHVR** → Chat App (com resposta do agente)
6. **Chat App** → Exibe mensagem do agente

## 📁 Estrutura do Projeto

```
my-bhvr-app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos (Auth)
│   │   └── pages/          # Páginas
├── server/                 # Backend Hono
│   └── src/
│       └── index.ts        # Servidor principal
├── shared/                 # Tipos compartilhados
│   └── src/
│       └── types/          # Definições TypeScript
└── package.json           # Configuração do monorepo
```

## 🎯 Exemplo de Uso

### 1. Criar um Agente Simples no n8n

```javascript
// Workflow n8n
// 1. Webhook Node (recebe mensagem)
// 2. Function Node (processa)
// 3. Respond to Webhook Node (retorna resposta)

// Function Node
const message = $input.first().json.message;
const response = `Olá! Recebi sua mensagem: "${message}". Como posso ajudar?`;

return { response };
```

### 2. Testar no Chat

1. Acesse `http://localhost:5173`
2. Faça login com qualquer email/senha
3. Adicione seu agente com a URL do webhook
4. Envie mensagens e veja as respostas do n8n

## 🔒 Segurança

- **Autenticação**: Sistema mock para demonstração
- **Webhooks**: Validação básica de URLs
- **CORS**: Configurado para desenvolvimento local
- **Dados**: Armazenados apenas em memória

## 🚀 Deploy

### Desenvolvimento
```bash
bun run dev
```

### Produção
```bash
bun run build
bun run start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique se o n8n está rodando
2. Confirme se a URL do webhook está correta
3. Verifique os logs do servidor
4. Teste o webhook diretamente no n8n

---

Desenvolvido com ❤️ usando Bun, Hono e React
