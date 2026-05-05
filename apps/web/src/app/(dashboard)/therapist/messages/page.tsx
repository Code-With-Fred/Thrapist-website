'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { formatDateTime } from '@/lib/utils';

interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function TherapistMessagesPage() {
  const { user, accessToken } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);

    socket.on('new_message', (message: Message & { conversationId: string }) => {
      if (activeConv?.id === message.conversationId) {
        setMessages(prev => [...prev, message]);
        socket.emit('mark_read', { conversationId: message.conversationId });
      }
      fetchConversations();
    });

    socket.on('typing_start', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => new Set(prev).add(userId));
    });

    socket.on('typing_stop', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
    });

    return () => {
      socket.off('new_message');
      socket.off('typing_start');
      socket.off('typing_stop');
    };
  }, [accessToken, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    try {
      const { data } = await api.get(`/conversations/${conv.id}/messages`);
      setMessages(data.data || []);
      if (accessToken) {
        const socket = getSocket(accessToken);
        socket.emit('join_conversation', { conversationId: conv.id });
        socket.emit('mark_read', { conversationId: conv.id });
      }
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
    } catch { /* ignore */ }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    try {
      await api.post(`/conversations/${activeConv.id}/messages`, { content });
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!activeConv || !accessToken) return;
    const socket = getSocket(accessToken);
    socket.emit('typing_start', { conversationId: activeConv.id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConv.id });
    }, 2000);
  };

  const filtered = conversations.filter(c => c.clientName.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-gray-200 bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No conversations yet
            </div>
          ) : (
            filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${activeConv?.id === conv.id ? 'bg-primary-50' : ''}`}
              >
                <Avatar alt={conv.clientName} src={conv.clientAvatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-text-primary text-sm truncate">{conv.clientName}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-text-secondary truncate mt-0.5">{conv.lastMessage}</p>
                  )}
                  {conv.lastMessageAt && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(conv.lastMessageAt)}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <Avatar alt={activeConv.clientName} src={activeConv.clientAvatar} size="md" />
            <div>
              <p className="font-semibold text-text-primary">{activeConv.clientName}</p>
              <p className="text-xs text-text-secondary">Client</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-text-primary rounded-bl-sm'}`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>{formatDateTime(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="btn-primary px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {sending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-text-secondary font-medium">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-1">Choose a client to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
