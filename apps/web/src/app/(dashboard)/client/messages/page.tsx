'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

interface Conversation { id: string; type: string; participant1Id: string; participant2Id: string; lastMessageAt?: string; otherUser?: { firstName: string; lastName: string; avatarUrl?: string; }; }
interface Message { id: string; conversationId: string; senderId: string; content: string; isRead: boolean; createdAt: string; }

export default function ClientMessagesPage() {
  const { user, accessToken } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get('/conversations').then(r => {
      const d = r.data as { data: Conversation[] };
      setConversations(d.data.filter(c => c.type === 'therapy'));
    }).catch(() => toast.error('Failed to load conversations')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    socket.on('new_message', (msg: Message) => {
      if (msg.conversationId === activeConvId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    socket.on('user_typing', () => setIsTyping(true));
    socket.on('user_stopped_typing', () => setIsTyping(false));
    return () => { socket.off('new_message'); socket.off('user_typing'); socket.off('user_stopped_typing'); };
  }, [accessToken, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    try {
      const r = await api.get(`/conversations/${convId}/messages`);
      const d = r.data as { data: Message[] };
      setMessages(d.data);
      if (accessToken) {
        const socket = getSocket(accessToken);
        socket.emit('join_conversation', convId);
        socket.emit('mark_read', convId);
      }
    } catch { toast.error('Failed to load messages'); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvId) return;
    const content = newMessage.trim();
    setNewMessage('');
    if (accessToken) {
      const socket = getSocket(accessToken);
      socket.emit('send_message', { conversationId: activeConvId, content });
    } else {
      try {
        await api.post(`/conversations/${activeConvId}/messages`, { content });
      } catch { toast.error('Failed to send message'); }
    }
  };

  const handleTyping = () => {
    if (!activeConvId || !accessToken) return;
    const socket = getSocket(accessToken);
    socket.emit('typing_start', activeConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit('typing_stop', activeConvId), 1500);
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherName = activeConv?.otherUser ? `${activeConv.otherUser.firstName} ${activeConv.otherUser.lastName}` : 'Therapist';

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col bg-white">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">Messages</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-background rounded-xl animate-pulse" />)}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <MessageCircle className="w-10 h-10 text-border mb-3" />
            <p className="text-text-secondary text-sm">No conversations yet. Book a session to start chatting.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => {
              const name = conv.otherUser ? `${conv.otherUser.firstName} ${conv.otherUser.lastName}` : 'Therapist';
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={cn('w-full flex items-center gap-3 p-4 hover:bg-background transition-colors text-left', activeConvId === conv.id && 'bg-primary-50 border-r-2 border-primary')}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">{name}</p>
                    {conv.lastMessageAt && <p className="text-xs text-text-secondary">{formatDateTime(conv.lastMessageAt)}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {activeConvId ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border bg-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary font-semibold">{otherName[0]}</div>
            <div>
              <p className="font-semibold text-text-primary">{otherName}</p>
              <p className="text-xs text-success">Online</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map(msg => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm', isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-white text-text-primary rounded-bl-sm shadow-sm border border-border')}>
                    <p>{msg.content}</p>
                    <p className={cn('text-xs mt-1', isOwn ? 'text-primary-100' : 'text-text-secondary')}>{formatDateTime(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()} className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-border mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Select a conversation</h3>
            <p className="text-text-secondary">Choose a conversation from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
