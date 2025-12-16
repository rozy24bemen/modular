import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';
import type { ChatMessage } from '../App';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(true); // Start closed
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 z-50"
        title="Abrir chat"
      >
        <MessageCircle size={28} />
        {messages.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[24px] h-6 rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-purple-400" />
          <h2 className="text-white">Chat</h2>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
        >
          <Minimize2 size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">
            <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay mensajes aún</p>
            <p className="text-xs mt-1">Sé el primero en hablar!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-purple-400 text-sm">{msg.userName}</span>
                <span className="text-slate-600 text-xs">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="bg-slate-700 rounded-lg rounded-tl-none px-3 py-2">
                <p className="text-slate-200 text-sm">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Presiona Enter para enviar
        </p>
      </form>
    </div>
  );
}
