import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de compras para Montevideo. Pregúntame sobre precios estimados de insumos, ferias recomendadas o ideas para batch cooking.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Eres un asistente experto en economía doméstica, batch cooking y precios de supermercados en Montevideo, Uruguay (Abril 2026).
        El usuario está intentando reducir su presupuesto diario de comida de 400 UYU a 200 UYU.
        Responde de forma concisa, amigable y directa. Si te preguntan por precios, da estimaciones realistas en pesos uruguayos (UYU) mencionando si conviene comprar en Feria, Tata, Tienda Inglesa, Disco, Macro Mercado, etc.
        
        Pregunta del usuario: ${userMsg.content}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || 'Lo siento, no pude procesar tu consulta en este momento.'
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hubo un error al conectar con el asistente. Por favor, verifica tu API Key de Gemini.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-editorial-bg border-2 border-editorial-line rounded-none flex flex-col h-[600px] overflow-hidden">
      <div className="p-5 border-b-2 border-editorial-line bg-transparent flex items-center gap-4">
        <div className="w-10 h-10 border border-editorial-line rounded-none flex items-center justify-center text-editorial-ink">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif italic text-xl text-editorial-ink leading-tight">Asistente AI</h2>
          <p className="text-[10px] uppercase tracking-wider text-editorial-muted">Estimaciones MVD</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-transparent">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 border border-editorial-line rounded-none flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-editorial-ink text-editorial-bg" : "bg-transparent text-editorial-ink"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 text-sm leading-relaxed font-sans",
              msg.role === 'user' 
                ? "bg-editorial-ink text-editorial-bg rounded-none" 
                : "bg-transparent border border-editorial-line text-editorial-ink rounded-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 border border-editorial-line rounded-none flex items-center justify-center shrink-0 bg-transparent text-editorial-ink">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-transparent border border-editorial-line rounded-none flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-editorial-ink" />
              <span className="text-xs uppercase tracking-wider text-editorial-muted">Buscando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t-2 border-editorial-line bg-transparent">
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ej. ¿A cuánto está el kilo de papa en la feria?"
            className="w-full pl-4 pr-12 py-3.5 bg-transparent border border-editorial-line rounded-none focus:outline-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink transition-all text-sm font-sans"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-editorial-ink text-editorial-bg rounded-none flex items-center justify-center hover:bg-editorial-line disabled:opacity-50 disabled:hover:bg-editorial-ink transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
