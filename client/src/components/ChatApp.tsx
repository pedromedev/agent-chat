import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MessageSquare, LogOut, Send, Paperclip, X, File, FileText, FileImage, FileVideo, FileAudio } from 'lucide-react';
import type { ChatAgent, ChatMessage, CreateChatRequest } from 'shared/dist';
import PVTLogo from '../assets/PVT-p.svg';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDocumentMode, setIsDocumentMode] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    // Permitir apenas um arquivo por vez
    if (files.length > 0) {
      setSelectedFiles([files[0]]); // Apenas o primeiro arquivo
      setIsDocumentMode(true);
      setNewMessage(''); // Limpar texto quando anexar documentos
    }
    
    // Limpar o input para permitir anexar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles([]); // Remover todos os arquivos
    setIsDocumentMode(false);
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (type.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedChat) return;

    try {
      setIsLoading(true);
      setWebhookError(null); // Limpar erro anterior
      
      console.log('Enviando mensagem com arquivos:', selectedFiles.length);
      selectedFiles.forEach((file, index) => {
        console.log(`Arquivo ${index + 1}:`, file.name, file.size, file.type);
      });
      
      const formData = new FormData();
      formData.append('content', newMessage);
      selectedFiles.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      console.log('Fazendo requisição para:', `/api/chat/${selectedChat.id}/messages`);
      const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        body: formData,
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Dados da resposta:', data);
      
      if (data.success) {
        // Recarregar todas as mensagens para garantir que temos a resposta do agente
        await loadMessages(selectedChat.id);
        setNewMessage('');
        setSelectedFiles([]);
        setIsDocumentMode(false);
        
        // Limpar o input de arquivo após enviar
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Mostrar feedback se foram enviados arquivos
        if (selectedFiles.length > 0) {
          console.log(`✅ Arquivo enviado com sucesso`);
        }
      } else {
        console.error('Erro na resposta:', data.error);
        setWebhookError(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setWebhookError('Erro ao enviar mensagem. Tente novamente.');
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
            <img src={PVTLogo} alt="PVT Logo" className="h-6" />
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
          <p className="text-sm text-gray-500 mt-1">Bem-vindo Sobral!</p>
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
              {webhookError && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-700">
                    ⚠️ {webhookError}
                  </p>
                </div>
              )}
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
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content.length > 2000 
                        ? message.content.substring(0, 2000) + '... (mensagem truncada)'
                        : message.content
                      }
                    </p>
                    
                    {/* Anexos */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`flex items-center space-x-2 p-2 rounded ${
                              message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getFileIcon({ type: attachment.type } as File)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs opacity-75">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(attachment.url, '_blank')}
                              className={`text-xs ${
                                message.sender === 'user'
                                  ? 'text-blue-100 hover:text-white'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Abrir
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
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
              {/* File Attachments Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Documento anexado
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFiles([]);
                        setIsDocumentMode(false);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isDocumentMode ? "Modo documento ativo - apenas um arquivo permitido" : "Digite sua mensagem..."}
                  disabled={isLoading || isDocumentMode}
                  className={isDocumentMode ? "bg-gray-100 text-gray-500" : ""}
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
                />
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || isLoading}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </Button>
              </div>
              
              {isDocumentMode && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    📎 Modo documento ativo
                  </p>
                </div>
              )}
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