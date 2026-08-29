'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export default function ChatPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('order_id', params.orderId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    }

    initChat();

    const channel = supabase
      .channel(`chat_${params.orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `order_id=eq.${params.orderId}`,
        },
        (payload) => {
          const incomingMessage = payload.new as Message;
          setMessages((prev) => [...prev, incomingMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.orderId, supabase, router]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const textToSend = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('chats').insert({
      order_id: params.orderId,
      sender_id: currentUserId,
      message: textToSend,
    });

    if (error) {
      alert('Gagal mengirim pesan: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 max-w-md mx-auto">
      <header className="bg-slate-800/90 backdrop-blur-md p-4 border-b border-slate-700/60 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-xs uppercase tracking-wider text-white">Live Chat Pesanan</h1>
          <p className="text-[10px] text-blue-400 font-semibold">Terhubung dengan Driver</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-xs font-medium shadow-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                }`}
              >
                <p className="leading-relaxed">{msg.message}</p>
                <span className="text-[9px] opacity-70 block mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-slate-800/90 border-t border-slate-700/60 flex gap-2 sticky bottom-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tulis pesan untuk driver..."
          className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 px-4 rounded-xl text-white transition flex items-center justify-center shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}