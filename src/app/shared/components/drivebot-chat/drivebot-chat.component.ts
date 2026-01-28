import { Component, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriveBotService } from '../../../core/services/drivebot.service';
import { ChatMessage } from '../../../models/interfaces/drivebot.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-drivebot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './drivebot-chat.component.html',
  styleUrls: ['./drivebot-chat.component.css']
})
export class DriveBotChatComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  isOpen = false;
  isStreaming = false;
  messages: ChatMessage[] = [];
  inputMessage = '';
  error: string | null = null;
  private shouldScrollToBottom = false;
  private currentResponseRef = '';

  constructor(private driveBotService: DriveBotService) {}

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.driveBotService.cancelStream();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScrollToBottom = true;
      // Focus input after animation
      setTimeout(() => {
        this.messageInput?.nativeElement?.focus();
      }, 300);
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  async sendMessage(): Promise<void> {
    const message = this.inputMessage.trim();
    if (!message || this.isStreaming) return;

    this.error = null;
    this.inputMessage = '';
    this.currentResponseRef = '';

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;

    // Add placeholder for assistant response
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    this.messages.push(assistantMessage);

    this.isStreaming = true;

    // Prepare messages for API (only role and content)
    const apiMessages = this.messages
      .slice(0, -1) // Exclude the empty assistant placeholder
      .map(m => ({ role: m.role, content: m.content }));

    await this.driveBotService.streamChat(
      apiMessages,
      // onChunk
      (text: string) => {
        this.currentResponseRef += text;
        // Update the last message (assistant)
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = this.currentResponseRef;
        }
        this.shouldScrollToBottom = true;
      },
      // onDone
      () => {
        this.isStreaming = false;
        // If response is empty, remove the placeholder
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage.role === 'assistant' && !lastMessage.content) {
          this.messages.pop();
        }
      },
      // onError
      (errorMsg: string) => {
        this.isStreaming = false;
        this.error = errorMsg;
        // Remove empty assistant message on error
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage.role === 'assistant' && !lastMessage.content) {
          this.messages.pop();
        }
      },
      { language: 'ro' }
    );
  }

  stopStreaming(): void {
    this.driveBotService.cancelStream();
    this.isStreaming = false;
  }

  clearChat(): void {
    this.driveBotService.cancelStream();
    this.messages = [];
    this.error = null;
    this.isStreaming = false;
    this.currentResponseRef = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      // Ignore scroll errors
    }
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  }
}
