import { Hono } from "hono";
import { cors } from "hono/cors";
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  AuthError, 
  User,
  ChatAgent,
  ChatMessage,
  CreateChatRequest,
  SendMessageRequest,
  SendMessageResponse,
  ChatListResponse,
  ChatMessagesResponse,
  ChatAttachment
} from "shared/dist";

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@bhvr.dev',
    name: 'Administrador BHVR',
    avatar: 'https://github.com/shadcn.png'
  },
  {
    id: '2',
    email: 'user@bhvr.dev',
    name: 'Usuário BHVR',
    avatar: 'https://github.com/stevedylandev.png'
  }
];

// Chat storage in memory
const chats: Map<string, ChatAgent> = new Map();
const messages: Map<string, ChatMessage[]> = new Map();

// Generate unique ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Função otimizada para converter ArrayBuffer para base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  
  // Processar em chunks para evitar stack overflow
  const chunkSize = 8192; // 8KB chunks
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  
  return btoa(binary);
}

export const app = new Hono()
  .use(cors({
    origin: ['http://localhost:5173', 'https://e8ad6cddb694.ngrok-free.app', 'https://localhost:8000/*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
  // Configurar limite de tamanho da requisição
  .use('*', async (c, next) => {
    // Aumentar limite para 100MB
    c.req.raw.headers.set('content-length', '104857600'); // 100MB em bytes
    await next();
  })
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .get("/hello", async (c) => {
    const data: ApiResponse = {
      message: "Hello BHVR!",
      success: true,
    };

    return c.json(data, { status: 200 });
  })
  // Endpoint de login
  .post("/auth/login", async (c) => {
  try {
    const body = await c.req.json() as LoginRequest;
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock authentication - aceita qualquer email/senha válidos
    if (!body.email || !body.password) {
      const error: AuthError = {
        success: false,
        message: "Email e senha são obrigatórios"
      };
      return c.json(error, { status: 400 });
    }

    // Find user or create a mock one
    let user = mockUsers.find(u => u.email === body.email);
    if (!user) {
      const emailName = body.email.split('@')[0];
      user = {
        id: Date.now().toString(),
        email: body.email,
        name: emailName || 'Usuário',
        avatar: 'https://github.com/shadcn.png'
      };
    }

    const response: LoginResponse = {
      success: true,
      user,
      token: `mock-jwt-token-${user.id}`
    };

    return c.json(response, { status: 200 });
  } catch (error) {
    const errorResponse: AuthError = {
      success: false,
      message: "Erro interno do servidor"
    };
    return c.json(errorResponse, { status: 500 });
  }
})

// Endpoint para verificar token
  .get("/auth/me", async (c) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: AuthError = {
        success: false,
        message: "Token não fornecido"
      };
      return c.json(error, { status: 401 });
    }

    // Mock token validation
    const token = authHeader.substring(7);
    if (token.startsWith('mock-jwt-token-')) {
      const userId = token.split('-').pop();
      if (userId) {
        const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
        return c.json({ success: true, user }, { status: 200 });
      }
    }

    const error: AuthError = {
      success: false,
      message: "Token inválido"
    };
    return c.json(error, { status: 401 });
  })
  // Chat endpoints
  // Criar novo chat
  .post("/chat", async (c) => {
  try {
    const body = await c.req.json() as CreateChatRequest;
    
    if (!body.name || !body.webhookUrl) {
      return c.json({ 
        success: false, 
        error: "Nome e URL do webhook são obrigatórios" 
      }, { status: 400 });
    }

    const chatId = generateId();
    const chat: ChatAgent = {
      id: chatId,
      name: body.name,
      webhookUrl: body.webhookUrl,
      createdAt: new Date().toISOString()
    };

    chats.set(chatId, chat);
    messages.set(chatId, []);

    return c.json({ success: true, chat }, { status: 201 });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
  })
  // Listar chats
  .get("/chat", async (c) => {
  try {
    const chatList = Array.from(chats.values());
    const response: ChatListResponse = {
      success: true,
      chats: chatList
    };
    return c.json(response, { status: 200 });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
  })
  // Obter mensagens de um chat
  .get("/chat/:chatId/messages", async (c) => {
  try {
    const chatId = c.req.param('chatId');
    const chatMessages = messages.get(chatId) || [];
    
    const response: ChatMessagesResponse = {
      success: true,
      messages: chatMessages
    };
    return c.json(response, { status: 200 });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
  })
  // Enviar mensagem para um chat
  .post("/chat/:chatId/messages", async (c) => {
  try {
    console.log('=== INÍCIO DO PROCESSAMENTO DE MENSAGEM ===');
    const chatId = c.req.param('chatId');
    console.log('Chat ID:', chatId);
    
    const chat = chats.get(chatId);
    if (!chat) {
      console.log('Chat não encontrado:', chatId);
      return c.json({ 
        success: false, 
        error: "Chat não encontrado" 
      }, { status: 404 });
    }
    console.log('Chat encontrado:', chat.name);

    // Verificar se é multipart/form-data ou JSON
    const contentType = c.req.header('Content-Type') || '';
    console.log('Content-Type recebido:', contentType);
    let messageContent = '';
    let attachments: ChatAttachment[] = [];

    try {
      if (contentType.includes('multipart/form-data')) {
        console.log('Processando multipart/form-data');
        // Processar upload de arquivos
        const formData = await c.req.formData();
        messageContent = formData.get('content') as string || '';
        console.log('Conteúdo da mensagem:', messageContent);
        
        // Processar anexos e converter para base64
        const files = formData.getAll('attachments') as File[];
        console.log('Número de arquivos recebidos:', files.length);
        
        attachments = await Promise.all(files.map(async (file, index) => {
          console.log(`Processando arquivo ${index + 1}:`, file.name, file.size, file.type);
          console.log(`Tamanho do arquivo: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          console.log(`Progresso: ${index + 1}/${files.length} arquivos`);
          try {
            // Verificar tamanho do arquivo (máximo 100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
              throw new Error(`Arquivo muito grande: ${file.name} (${file.size} bytes). Máximo permitido: ${maxSize} bytes`);
            }
            
            // Para arquivos muito grandes (> 50MB), não converter para base64
            const veryLargeSize = 50 * 1024 * 1024; // 50MB
            let base64 = '';
            
            if (file.size > veryLargeSize) {
              console.log('Arquivo muito grande, pulando conversão para base64');
              console.log(`⚠️ Arquivo ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) é muito grande para conversão completa`);
              base64 = ''; // Não converter para base64
            } else {
              // Converter arquivo para base64
              console.log('Iniciando conversão para base64...');
              const arrayBuffer = await file.arrayBuffer();
              console.log('ArrayBuffer criado, convertendo para base64...');
              base64 = arrayBufferToBase64(arrayBuffer);
              console.log('Base64 criado com sucesso');
            }
            
            return {
              id: generateId(),
              name: file.name,
              url: `uploads/${chatId}/${file.name}`, // URL simulada para exibição
              type: file.type,
              size: file.size,
              base64: base64 // Adicionar base64 para envio ao n8n
            };
          } catch (error) {
            console.error('Erro ao processar arquivo:', file.name, error);
            throw error;
          }
        }));
      } else {
        console.log('Processando JSON normal');
        // Processar JSON normal
        const body = await c.req.json() as SendMessageRequest;
        messageContent = body.content || '';
        // Converter File[] para ChatAttachment[] se necessário
        if (body.attachments) {
          attachments = await Promise.all(body.attachments.map(async (file) => {
            // Verificar tamanho do arquivo (máximo 100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
              throw new Error(`Arquivo muito grande: ${file.name} (${file.size} bytes). Máximo permitido: ${maxSize} bytes`);
            }
            
            // Para arquivos muito grandes (> 50MB), não converter para base64
            const veryLargeSize = 50 * 1024 * 1024; // 50MB
            let base64 = '';
            
            if (file.size > veryLargeSize) {
              console.log('Arquivo muito grande, pulando conversão para base64');
              base64 = ''; // Não converter para base64
            } else {
              // Converter arquivo para base64
              const arrayBuffer = await file.arrayBuffer();
              base64 = arrayBufferToBase64(arrayBuffer);
            }
            
            return {
              id: generateId(),
              name: file.name,
              url: `uploads/${chatId}/${file.name}`,
              type: file.type,
              size: file.size,
              base64: base64 // Adicionar base64 para envio ao n8n
            };
          }));
        }
      }
    } catch (processError) {
      console.error('Erro ao processar dados da requisição:', processError);
      return c.json({ 
        success: false, 
        error: `Erro ao processar dados: ${processError instanceof Error ? processError.message : 'Erro desconhecido'}` 
      }, { status: 400 });
    }
    
    if (!messageContent && attachments.length === 0) {
      return c.json({ 
        success: false, 
        error: "Conteúdo da mensagem ou anexos são obrigatórios" 
      }, { status: 400 });
    }

    // Criar mensagem do usuário
    const userMessage: ChatMessage = {
      id: generateId(),
      chatId,
      content: messageContent || (attachments.length > 0 ? `Enviou ${attachments.length} documento(s)` : ''),
      sender: 'user',
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    // Adicionar mensagem do usuário
    const chatMessages = messages.get(chatId) || [];
    chatMessages.push(userMessage);
    messages.set(chatId, chatMessages);

    // Atualizar último acesso do chat
    chat.lastMessageAt = new Date().toISOString();
    chats.set(chatId, chat);

    // Enviar mensagem para o webhook do agente
    try {
      // Criar payload para webhook com base64 dos anexos
      const webhookPayload = {
        chatId,
        message: messageContent,
        timestamp: userMessage.timestamp,
        messageId: userMessage.id,
        attachments: attachments.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          base64: (attachment as any).base64 || ''
        }))
      };

      // Se temos anexos, não esperamos resposta do webhook
      if (attachments.length > 0) {
        // Enviar webhook de forma assíncrona sem esperar resposta
        fetch(chat.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        }).catch(error => {
          console.error('Erro ao enviar webhook com anexos:', error);
        });

        // Retornar apenas a mensagem do usuário quando há anexos
        const response: SendMessageResponse = {
          success: true,
          message: userMessage
        };
        return c.json(response, { status: 200 });
      } else {
        // Para mensagens sem anexos, tentar obter resposta do webhook
        const webhookResponse = await fetch(chat.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
          // Aumentar timeout para 30 segundos
          signal: AbortSignal.timeout(30000)
        });

        if (webhookResponse.ok) {
          // Verificar o tamanho da resposta antes de processar
          const contentLength = webhookResponse.headers.get('content-length');
          const maxSize = 10 * 1024 * 1024; // 10MB
          
          if (contentLength && parseInt(contentLength) > maxSize) {
            console.log('Resposta do webhook muito grande, ignorando');
            const response: SendMessageResponse = {
              success: true,
              message: userMessage
            };
            return c.json(response, { status: 200 });
          }

          try {
            const agentResponse = await webhookResponse.json() as any;
            console.log('Resposta do agente recebida');
            
            // Verificar se a resposta é muito grande
            const responseText = JSON.stringify(agentResponse);
            if (responseText.length > 50000) { // 50KB
              console.log('Resposta do agente muito grande, truncando');
              agentResponse.response = agentResponse.response?.substring(0, 1000) + '... (resposta truncada)';
            }
            
            // Criar mensagem do agente
            const agentMessage: ChatMessage = {
              id: generateId(),
              chatId,
              content: agentResponse.response || agentResponse.message || agentResponse.output || "Resposta do agente",
              sender: 'agent',
              timestamp: new Date().toISOString()
            };

            // Adicionar mensagem do agente
            chatMessages.push(agentMessage);
            messages.set(chatId, chatMessages);

            const response: SendMessageResponse = {
              success: true,
              message: agentMessage
            };
            return c.json(response, { status: 200 });
          } catch (jsonError) {
            console.error('Erro ao processar JSON da resposta:', jsonError);
            // Se não conseguir processar o JSON, retornar apenas a mensagem do usuário
            const response: SendMessageResponse = {
              success: true,
              message: userMessage
            };
            return c.json(response, { status: 200 });
          }
        } else {
          console.log('Webhook falhou, status:', webhookResponse.status);
          // Se o webhook falhar, ainda retornamos a mensagem do usuário
          const response: SendMessageResponse = {
            success: true,
            message: userMessage
          };
          return c.json(response, { status: 200 });
        }
      }
    } catch (webhookError) {
      console.error('Erro no webhook:', webhookError);
      
      // Verificar diferentes tipos de erro
      if (webhookError instanceof Error) {
        if (webhookError.name === 'AbortError') {
          console.log('Webhook timeout - não foi possível obter resposta em 30 segundos');
        } else if (webhookError.name === 'TypeError') {
          console.log('Erro de rede no webhook - verifique a URL');
        } else {
          console.log('Erro desconhecido no webhook:', webhookError.message);
        }
      }
      
      // Se houver erro no webhook, ainda retornamos a mensagem do usuário
      const response: SendMessageResponse = {
        success: true,
        message: userMessage
      };
      return c.json(response, { status: 200 });
    }
  } catch (error) {
    console.error('=== ERRO GERAL NO PROCESSAMENTO ===', error);
    return c.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
  })
  // Webhook para receber mensagens dos agentes
  .post("/webhook/:chatId", async (c) => {
  try {
    const chatId = c.req.param('chatId');
    const body = await c.req.json();
    
    const chat = chats.get(chatId);
    if (!chat) {
      return c.json({ 
        success: false, 
        error: "Chat não encontrado" 
      }, { status: 404 });
    }

    // Criar mensagem do agente
    const agentMessage: ChatMessage = {
      id: generateId(),
      chatId,
      content: body.message || body.content || "Mensagem do agente",
      sender: 'agent',
      timestamp: new Date().toISOString(),
      attachments: body.attachments
    };

    // Adicionar mensagem do agente
    const chatMessages = messages.get(chatId) || [];
    chatMessages.push(agentMessage);
    messages.set(chatId, chatMessages);

    // Atualizar último acesso do chat
    chat.lastMessageAt = new Date().toISOString();
    chats.set(chatId, chat);

    return c.json({ success: true, message: agentMessage }, { status: 200 });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
});

export default app;

// Start server if this file is run directly
if (import.meta.main) {
  const port = parseInt(process.argv[2] || '3000');
  console.log(`🚀 Server running on http://localhost:${port}`);
  
  Bun.serve({
    port,
    fetch: app.fetch,
  });
}