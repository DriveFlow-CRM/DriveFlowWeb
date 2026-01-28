import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import { ChatMessage, ChatRequest } from '../../models/interfaces/drivebot.model';

@Injectable({
  providedIn: 'root'
})
export class DriveBotService {
  private readonly apiUrl: string;
  private currentAbortController: AbortController | null = null;

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Stream chat messages from the AI backend via SSE
   * @param messages Conversation history
   * @param onChunk Callback for each text chunk received
   * @param onDone Callback when streaming completes
   * @param onError Callback when an error occurs
   * @param options Optional settings for history and language
   */
  async streamChat(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
    options?: { historySessions?: number; language?: 'ro' | 'en' }
  ): Promise<void> {
    // Cancel any existing stream
    this.cancelStream();

    const token = this.authService.getToken();
    if (!token) {
      onError('Nu sunteți autentificat. Vă rugăm să vă reconectați.');
      return;
    }

    this.currentAbortController = new AbortController();

    const request: ChatRequest = {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      historySessions: options?.historySessions ?? 5,
      language: options?.language ?? 'ro'
    };

    try {
      const response = await fetch(`${this.apiUrl}ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
        signal: this.currentAbortController.signal
      });

      if (!response.ok) {
        let errorMessage = `Eroare HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        onError(errorMessage);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('Nu s-a putut citi răspunsul de la server.');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (separated by \n\n)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const lines = eventBlock.split('\n');
          let eventType = '';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6);
            }
          }

          switch (eventType) {
            case 'chunk':
              // Unescape newlines
              const text = eventData.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
              onChunk(text);
              break;
            case 'done':
              onDone();
              return;
            case 'error':
              try {
                const errorObj = JSON.parse(eventData);
                onError(errorObj.message || 'Eroare necunoscută');
              } catch {
                onError(eventData || 'Eroare necunoscută');
              }
              return;
          }
        }
      }

      // If we exit the loop without a done event, call onDone anyway
      onDone();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled - this is expected, don't report as error
        return;
      }
      onError((error as Error).message || 'Eroare de conexiune');
    } finally {
      this.currentAbortController = null;
    }
  }

  /**
   * Cancel the current streaming request
   */
  cancelStream(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  /**
   * Check if currently streaming
   */
  isStreaming(): boolean {
    return this.currentAbortController !== null;
  }
}
