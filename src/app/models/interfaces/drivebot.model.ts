// DriveBot AI Chat Models

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  messages: ChatMessage[];
  historySessions?: number;
  language?: 'ro' | 'en';
}

export interface SSEChunk {
  event: 'chunk' | 'done' | 'error';
  data: string;
}

export interface ChatError {
  message: string;
  code?: string;
}
