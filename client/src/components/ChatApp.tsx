import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MessageSquare, LogOut, Send, Paperclip } from 'lucide-react';
import type { ChatAgent, ChatMessage, CreateChatRequest } from 'shared/dist';

interface ChatAppProps {}

export function ChatApp({}: ChatAppProps) {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState<ChatAgent[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatWebhook, setNewChatWebhook] = useState('');

  // Carregar chats ao iniciar
  useEffect(() => {
    loadChats();
  }, []);

  // Carregar mensagens quando um chat for selecionado
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat');
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        // Scroll para a última mensagem após um pequeno delay
        setTimeout(() => {
          const messagesContainer = document.querySelector('.messages-container');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const createChat = async () => {
    if (!newChatName || !newChatWebhook) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChatName,
          webhookUrl: newChatWebhook,
        } as CreateChatRequest),
      });

      const data = await response.json();
      if (data.success) {
        setChats([...chats, data.chat]);
        setSelectedChat(data.chat);
        setNewChatName('');
        setNewChatWebhook('');
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao criar chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Recarregar todas as mensagens para garantir que temos a resposta do agente
        await loadMessages(selectedChat.id);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Chat BHVR</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Bem-vindo, {user?.name}</p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Agentes</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Novo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Agente</DialogTitle>
                  <DialogDescription>
                    Adicione um novo agente com seu webhook do n8n
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Agente</Label>
                    <Input
                      id="name"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      placeholder="Ex: Assistente de Vendas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook">URL do Webhook</Label>
                    <Input
                      id="webhook"
                      value={newChatWebhook}
                      onChange={(e) => setNewChatWebhook(e.target.value)}
                      placeholder="https://seu-n8n.com/webhook/..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={createChat}
                    disabled={!newChatName || !newChatWebhook || isLoading}
                  >
                    {isLoading ? 'Criando...' : 'Criar Agente'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.webhookUrl}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-medium text-gray-900">{selectedChat.name}</h2>
              <p className="text-sm text-gray-500">Webhook: {selectedChat.webhookUrl}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um agente
              </h3>
              <p className="text-gray-500">
                Escolha um agente na sidebar para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 