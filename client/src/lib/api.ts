import { getApiUrl, API_CONFIG } from '../config/api';

// Utilitário para gerenciar URLs da API
export const api = {
  // Método para fazer requisições
  async fetch(endpoint: string, options: RequestInit = {}) {
    const url = getApiUrl(endpoint);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Métodos específicos
  async get(endpoint: string) {
    return this.fetch(endpoint);
  },
  
  async post(endpoint: string, data: any) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async postFormData(endpoint: string, formData: FormData) {
    const url = getApiUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
}; 