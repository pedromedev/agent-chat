import { RagRequest, RagResponse } from "shared";

// client/src/lib/api.ts
function getBaseUrl(): string {
  // Prioridade: localStorage -> VITE_RAG_API_BASE_URL -> VITE_API_BASE_URL -> default
  const ls = typeof window !== 'undefined' ? window.localStorage?.getItem('rag_api_base_url') : null;
  const envUrl = (typeof import.meta !== 'undefined' && (
    (import.meta.env as any)?.VITE_RAG_API_BASE_URL || (import.meta.env as any)?.VITE_API_BASE_URL
  )) as string | undefined;
  return (ls || envUrl || 'http://localhost:8000').replace(/\/$/, '');
}

function getApiPrefix(): string {
  // Permite mudar entre '/api' e '' (ou outro prefixo)
  const ls = typeof window !== 'undefined' ? window.localStorage?.getItem('rag_api_prefix') : null;
  const envPrefix = (typeof import.meta !== 'undefined' && (import.meta.env as any)?.VITE_RAG_API_PREFIX) as string | undefined;
  const prefix = (ls || envPrefix || '/api') as string;
  if (!prefix) return '';
  // Normaliza para começar com / e não terminar com /
  const normalized = `/${prefix.replace(/^\/+/, '').replace(/\/$/, '')}`;
  return normalized === '/' ? '' : normalized;
}

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${getApiPrefix()}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

/* Coleções (CRUD) */
export function listCollections() {
  return http<string[]>('/collections/');
}
export function createCollection(name: string) {
  return http<{ name: string; count: number }>('/collections/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}
export function deleteCollection(name: string) {
  return http<void>(`/collections/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
}

/* Arquivos por coleção */
export type FileEntry = { file_id: string; file_name: string; chunk_count: number };
export function listAllFiles() {
  return http<Array<{ collection: string; files: FileEntry[] }>>('/files/');
}
export function listFilesByCollection(collection: string) {
  return http<{ collection: string; files: FileEntry[] }>(
    `/files/${encodeURIComponent(collection)}`
  );
}
export function uploadFilesToCollection(collection: string, files: File[]) {
  const fd = new FormData();
  for (const f of files) fd.append('files', f, f.name);
  return http<
    Array<{ collection: string; file_id: string; file_name: string; chunks: number }>
  >(`/files/${encodeURIComponent(collection)}`, {
    method: 'POST',
    body: fd,
  });
}
export function deleteLogicalFile(collection: string, fileId: string) {
  return http<{ removed_chunks: number }>(
    `/files/${encodeURIComponent(collection)}/${encodeURIComponent(fileId)}`,
    { method: 'DELETE' }
  );
}


export function sendRagMessage(body: RagRequest) {
  return http<RagResponse>('/agents/rag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ use_vector_store: true, ...body }),
  });
}

// Helpers para configurar em runtime
export function setApiBaseUrl(url: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('rag_api_base_url', url);
  }
}
export function getApiBaseUrl() {
  return getBaseUrl();
}
export function setApiPrefix(prefix: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('rag_api_prefix', prefix);
  }
}
export function getApiPrefixRuntime() {
  return getApiPrefix();
}

/* Sessões */
export function listSessions() {
  return http<{
    sessions: Array<{
      session_id: string;
      agent_type: 'rag';
      created_at: string;
      updated_at: string;
    }>;
  }>('/agents/sessions');
}
export function getSession(sessionId: string) {
  return http<any>(`/agents/sessions/${encodeURIComponent(sessionId)}`);
}
export function deleteSession(sessionId: string) {
  return http<void>(`/agents/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
}