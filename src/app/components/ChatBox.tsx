'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, onSnapshot, query,
  orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Send, Shield, X, MessageSquare } from 'lucide-react';

// ── Patterns that reveal contact info outside the platform ──────────────────
const BLOCKED_PATTERNS: RegExp[] = [
  /(\+?\d[\d\s\-\.\(\)]{7,}\d)/,                               // phone numbers
  /(https?:\/\/[^\s]+)/i,                                        // http/https links
  /(www\.[a-zA-Z0-9\-]+\.[a-zA-Z]{2,})/i,                      // www.xxx.com
  /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,       // emails
  /(whatsapp|wa\.me|telegram|t\.me|tiktok|instagram|facebook|snapchat)/i,
  /(\d[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{4})/,                  // formatted phone
];

function containsBlocked(text: string): boolean {
  return BLOCKED_PATTERNS.some(p => p.test(text));
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'artist';
  text: string;
  timestamp: any;
}

interface Props {
  orderId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'client' | 'artist';
  orderLabel?: string;
  onClose: () => void;
}

export default function ChatBox({
  orderId, currentUserId, currentUserName, currentUserRole, orderLabel, onClose,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time listener
  useEffect(() => {
    const q = query(
      collection(db, 'chats', orderId, 'messages'),
      orderBy('timestamp', 'asc'),
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
    return unsub;
  }, [orderId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (containsBlocked(trimmed)) {
      setBlocked(true);
      setTimeout(() => setBlocked(false), 4000);
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'chats', orderId, 'messages'), {
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        text: trimmed,
        timestamp: serverTimestamp(),
      });
      setText('');
    } catch { /* silent */ }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isMine = (msg: Message) => msg.senderId === currentUserId;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden"
           style={{ height: '80vh', maxHeight: 600 }}>

        {/* Header */}
        <div className="bg-gray-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm">محادثة الطلب</p>
              {orderLabel && <p className="text-gray-400 font-bold text-xs">{orderLabel}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Shield notice */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <Shield size={13} className="text-blue-500 flex-shrink-0" />
          <p className="text-blue-600 font-bold text-xs">
            التواصل محمي — لا يمكن مشاركة أرقام الهاتف أو الروابط الخارجية
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <MessageSquare size={36} className="text-gray-300" />
              <p className="text-gray-400 font-bold text-sm">لا توجد رسائل بعد</p>
              <p className="text-gray-300 font-bold text-xs">ابدأ المحادثة مع الطرف الآخر</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id}
                 className={`flex ${isMine(msg) ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                isMine(msg)
                  ? 'bg-red-600 text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
              }`}>
                {!isMine(msg) && (
                  <p className={`text-xs font-black mb-1 ${isMine(msg) ? 'text-red-200' : 'text-red-500'}`}>
                    {msg.senderName}
                  </p>
                )}
                <p className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${isMine(msg) ? 'text-red-200' : 'text-gray-400'} text-left`}>
                  {msg.timestamp?.toDate?.()
                    ? new Date(msg.timestamp.toDate()).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Blocked warning */}
        {blocked && (
          <div className="bg-red-50 border-t border-red-100 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <Shield size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 font-bold text-xs">
              🚫 تم منع الرسالة — لا يمكن مشاركة أرقام الهاتف أو الروابط أو معلومات التواصل الخارجي
            </p>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-3 flex-shrink-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="اكتب رسالتك..."
            className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center hover:bg-red-700 disabled:bg-gray-200 transition flex-shrink-0"
          >
            <Send size={16} className={sending || !text.trim() ? 'text-gray-400' : 'text-white'} />
          </button>
        </div>
      </div>
    </div>
  );
}
