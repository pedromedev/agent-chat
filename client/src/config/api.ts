// Configuração da API
export const API_CONFIG = {
  // URL base da API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? 'http://localhost:3000' : 'https://e8ad6cddb694.ngrok-free.app'),
  
  // Timeout das requisições
  TIMEOUT: 30000, // 30 segundos
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Função para obter a URL completa da API
export const getApiUrl = (endpoint: string) => {
  // Em desenvolvimento, usar proxy do Vite
  if (import.meta.env.DEV) {
    return `/api${endpoint}`;
  }
  
  // Em produção, usar a URL completa
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 