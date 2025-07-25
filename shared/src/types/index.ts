export type ApiResponse = {
  message: string;
  success: true;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  user: User;
  token: string;
}

export interface AuthError {
  success: false;
  message: string;
}

// Tipos para o sistema de chat
export interface ChatAgent {
  id: string;
  name: string;
  webhookUrl: string;
  createdAt: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  base64?: string; // Conteúdo do arquivo em base64 para envio ao n8n
}

export interface CreateChatRequest {
  name: string;
  webhookUrl: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  attachments?: File[];
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export interface ChatListResponse {
  success: boolean;
  chats: ChatAgent[];
}

export interface ChatMessagesResponse {
  success: boolean;
  messages: ChatMessage[];
}
