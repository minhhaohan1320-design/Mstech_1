import React, { useState } from 'react';
import { SensorData } from '../types';
import Markdown from 'react-markdown';
import { ChibiMarine } from './ChibiMarine';
import { Send, Loader2 } from 'lucide-react';

interface AIChatProps {
  data: SensorData | null;
}

export const AIChat: React.FC<AIChatProps> = ({ data }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMsg,
          sensorData: data
        })
      });
      
      const resData = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: resData.result }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Lỗi kết nối tới não bộ AI." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Mất kết nối với trung tâm máy chủ." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[700px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 shrink-0">
            <ChibiMarine chapter="whiteScar" bgColor="bg-white" borderColor="border-gray-200" />
          </div>
          <div>
            <h2 className="font-bold">M.S.AI</h2>
            <p className="text-xs text-emerald-100">Trợ lý Nông nghiệp Thông minh</p>
          </div>
        </div>
        <button onClick={clearChat} className="text-xs font-semibold px-3 py-1 bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors">
          Xóa
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            Hãy đặt câu hỏi về tình trạng đất của bạn cho M.S.AI!
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
              <div className="prose prose-sm max-w-none text-current">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhắn tin cho M.S.AI..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
