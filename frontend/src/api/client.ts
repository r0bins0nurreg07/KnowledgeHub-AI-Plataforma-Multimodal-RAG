const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const MAX_UPLOAD_SIZE_MB = 20;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.detail ?? "Error inesperado");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}

export function register(username: string, email: string, password: string) {
  return request<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser(token: string) {
  return request<UserResponse>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export function listWorkspaces(token: string) {
  return request<WorkspaceResponse[]>("/workspaces", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createWorkspace(token: string, name: string) {
  return request<WorkspaceResponse>("/workspaces", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

export function updateWorkspace(token: string, id: string, name: string) {
  return request<WorkspaceResponse>(`/workspaces/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

export function deleteWorkspace(token: string, id: string) {
  return request<void>(`/workspaces/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getWorkspace(token: string, id: string) {
  return request<WorkspaceResponse>(`/workspaces/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface DocumentResponse {
  id: string;
  filename: string;
  extension: string;
  mime_type: string;
  file_size: number;
  status: "uploaded" | "processing" | "indexed" | "error";
  workspace_id: string;
  uploaded_by: string;
  created_at: string;
}

export interface DocumentUploadResponse extends DocumentResponse {
  chunks_extracted: number;
}

export function listDocuments(token: string, workspaceId: string) {
  return request<DocumentResponse[]>(`/documents?workspace_id=${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadDocument(token: string, workspaceId: string, file: File) {
  const formData = new FormData();
  formData.append("workspace_id", workspaceId);
  formData.append("file", file);

  const response = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.detail ?? "Error inesperado");
  }

  return response.json() as Promise<DocumentUploadResponse>;
}

export function deleteDocument(token: string, id: string) {
  return request<void>(`/documents/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface ChatResponse {
  id: string;
  title: string;
  workspace_id: string;
  created_at: string;
}

export interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  chat_id: string;
  created_at: string;
}

export function listChats(token: string, workspaceId: string) {
  return request<ChatResponse[]>(`/chat?workspace_id=${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getChatMessages(token: string, chatId: string) {
  return request<MessageResponse[]>(`/chat/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type AskStreamEvent =
  | { type: "meta"; chat_id: string }
  | { type: "token"; text: string }
  | { type: "sources"; sources: string[] };

export async function askQuestionStream(
  token: string,
  workspaceId: string,
  question: string,
  chatId: string | undefined,
  onEvent: (event: AskStreamEvent) => void,
): Promise<void> {
  const response = await fetch(`${API_URL}/chat/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspace_id: workspaceId, question, chat_id: chatId ?? null }),
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.detail ?? "Error inesperado");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as AskStreamEvent);
    }
  }

  if (buffer.trim()) onEvent(JSON.parse(buffer) as AskStreamEvent);
}

const TOKEN_KEY = "access_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
