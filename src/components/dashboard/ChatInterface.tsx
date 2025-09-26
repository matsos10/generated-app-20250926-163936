import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Wrench, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { chatService, renderToolCall } from '@/lib/chat';
import type { ChatState } from '../../../worker/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
export function ChatInterface() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage]);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({
        ...prev,
        ...response.data,
        sessionId: chatService.getSessionId()
      }));
    }
  }, []);
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true,
      streamingMessage: ''
    }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    await loadCurrentSession();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleClear = async () => {
    await chatService.clearMessages();
    await loadCurrentSession();
  };
  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Support Assistant</h2>
            <p className="text-sm text-muted-foreground">Ready to help with your questions.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClear} title="Clear conversation">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-6">
          {chatState.messages.length === 0 && !chatState.isProcessing && (
            <div className="text-center text-muted-foreground py-8">
              <p>Ask me anything about your account, tickets, or features.</p>
            </div>
          )}
          {chatState.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0 mb-2" />}
              <div className={cn('max-w-[80%] p-3 rounded-2xl',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted rounded-bl-none'
              )}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/20 space-y-2">
                    <div className="flex items-center gap-1 text-xs opacity-70">
                      <Wrench className="w-3 h-3" />
                      <span>Tools used:</span>
                    </div>
                    {msg.toolCalls.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-normal">
                        {renderToolCall(tool)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0 mb-2" />}
            </motion.div>
          ))}
          {chatState.streamingMessage && (
            <div className="flex items-end gap-2 justify-start">
              <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0 mb-2" />
              <div className="max-w-[80%] p-3 rounded-2xl bg-muted rounded-bl-none">
                <p className="whitespace-pre-wrap text-sm">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
              </div>
            </div>
          )}
          {chatState.isProcessing && !chatState.streamingMessage && (
            <div className="flex items-end gap-2 justify-start">
              <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0 mb-2" />
              <div className="bg-muted p-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-current rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant..."
            className="pr-16 resize-none"
            rows={1}
            disabled={chatState.isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            disabled={!input.trim() || chatState.isProcessing}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}