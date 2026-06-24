"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Trash2, Clock, Search, Send, Inbox, Archive, CheckCircle2, User, Phone, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: { seconds: number; nanoseconds: number } | null | string;
  status: string; // 'unread', 'replied', 'archived'
};

export default function InquiriesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeFolder, setActiveFolder] = useState<'unread' | 'replied' | 'archived'>('unread');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      // Normalize status in case old ones are missing
      const msgs = data.messages.map((m: any) => ({
        ...m,
        status: m.status || 'unread'
      }));
      setMessages(msgs);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleReplySubmit = async (msg: ContactMessage) => {
    if (!replyText.trim()) return;

    try {
      setIsSendingReply(true);
      const toastId = toast.loading('Sending reply...');
      
      const response = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: msg.id,
          toEmail: msg.email,
          guestName: msg.firstName,
          originalSubject: msg.subject,
          replyBody: replyText,
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      setMessages(messages.map(m => m.id === msg.id ? { ...m, status: 'replied' } : m));
      setReplyText('');
      toast.success('Reply sent successfully!', { id: toastId });
    } catch (err: any) {
      console.error("Error sending reply:", err);
      toast.error('Failed to send reply: ' + err.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');

      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
      
      // If we archive the selected message, clear selection
      if (newStatus === 'archived' && activeFolder !== 'archived') {
        setSelectedMessageId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message forever?')) return;
    try {
      const response = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      setMessages(messages.filter(msg => msg.id !== id));
      if (selectedMessageId === id) setSelectedMessageId(null);
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return 'Unknown Date';
    if (typeof dateObj === 'string') return new Date(dateObj).toLocaleDateString();
    return new Date(dateObj.seconds * 1000).toLocaleDateString();
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      if (m.status !== activeFolder) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          m.firstName.toLowerCase().includes(term) ||
          m.lastName.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.subject.toLowerCase().includes(term)
        );
      }
      return true;
    }).sort((a, b) => {
      // Sort newest first
      const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt?.seconds || 0);
      const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt?.seconds || 0);
      return timeB - timeA;
    });
  }, [messages, activeFolder, searchTerm]);

  const selectedMessage = useMemo(() => {
    return messages.find(m => m.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-serif text-primary">Inbox</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex">
        
        {/* LEFT PANE: Folder & List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/30">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-gray-200 space-y-4 shrink-0">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => { setActiveFolder('unread'); setSelectedMessageId(null); }} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${activeFolder === 'unread' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                <Inbox size={14} /> Unread
              </button>
              <button onClick={() => { setActiveFolder('replied'); setSelectedMessageId(null); }} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${activeFolder === 'replied' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                <CheckCircle2 size={14} /> Replied
              </button>
              <button onClick={() => { setActiveFolder('archived'); setSelectedMessageId(null); }} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${activeFolder === 'archived' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                <Archive size={14} /> Archive
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                <Mail size={32} className="mb-2 text-gray-300" />
                No {activeFolder} messages.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${selectedMessageId === msg.id ? 'bg-blue-50/50 hover:bg-blue-50/50 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium text-sm truncate pr-2 ${selectedMessageId === msg.id ? 'text-primary' : 'text-gray-900'}`}>
                        {msg.firstName} {msg.lastName}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate mb-1">{msg.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Conversation View */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {selectedMessage.firstName[0]}{selectedMessage.lastName[0]}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">{selectedMessage.firstName} {selectedMessage.lastName}</h2>
                    <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMessage.status !== 'archived' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      title="Archive"
                    >
                      <Archive size={18} />
                    </button>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'unread')}
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      title="Move to Inbox"
                    >
                      <Inbox size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Inline Reply Area */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Send size={16} /> Reply to Guest
                  </h4>
                  {selectedMessage.status === 'replied' ? (
                    <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 text-sm flex items-center gap-2">
                      <CheckCircle2 size={18} /> You have already replied to this inquiry.
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Draft reply to ${selectedMessage.firstName}...`}
                        className="w-full p-4 text-sm focus:outline-none resize-none min-h-[150px]"
                      />
                      <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => handleReplySubmit(selectedMessage)}
                          disabled={!replyText.trim() || isSendingReply}
                          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSendingReply ? 'Sending...' : 'Send Reply'} <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <Mail size={48} className="mb-4 text-gray-300" />
              <p>Select a message to read</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
