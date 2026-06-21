"use client";

import { useState, useEffect } from 'react';
import { Mail, Trash2, Clock, Search, AlertCircle, RefreshCw } from 'lucide-react';

type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  status: string;
};

export default function InquiriesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message || 'An error occurred while fetching messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err: any) {
      console.error("Error deleting message:", err);
      alert('Failed to delete message: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const searchLower = searchTerm.toLowerCase();
    return (
      msg.firstName.toLowerCase().includes(searchLower) ||
      msg.lastName.toLowerCase().includes(searchLower) ||
      msg.email.toLowerCase().includes(searchLower) ||
      msg.subject.toLowerCase().includes(searchLower) ||
      msg.message.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    // Handle Firestore timestamp format from API
    const date = new Date(timestamp._seconds ? timestamp._seconds * 1000 : timestamp.seconds * 1000);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 tracking-wide">Guest Inquiries</h1>
          <p className="text-zinc-500 mt-1">Manage contact form submissions and guest questions.</p>
        </div>
        <button 
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors shadow-sm text-sm font-medium"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Mail size={16} />
            <span>{filteredMessages.length} Messages</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-500">
              <RefreshCw size={32} className="animate-spin text-primary mb-4" />
              <p>Loading inquiries...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 flex flex-col items-center">
              <AlertCircle size={32} className="mb-2" />
              <p>{error}</p>
              <button 
                onClick={fetchMessages}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50">
              <Mail size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-zinc-700 mb-1">No messages found</h3>
              <p className="text-sm">
                {searchTerm ? "No inquiries match your search." : "Your inbox is empty."}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-primary hover:underline text-sm font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="p-6 hover:bg-zinc-50 transition-colors group">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-zinc-900">{msg.subject}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                            <span className="font-medium text-zinc-700">{msg.firstName} {msg.lastName}</span>
                            <span>•</span>
                            <a href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: Luxe Hotel Inquiry: ${msg.subject}`)}`} className="hover:text-primary transition-colors">{msg.email}</a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 whitespace-nowrap bg-zinc-100 px-3 py-1.5 rounded-full">
                          <Clock size={14} />
                          {formatDate(msg.createdAt)}
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-zinc-100 shadow-sm">
                        <p className="text-zinc-600 text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col items-center md:items-end justify-end gap-2 md:w-32 pt-2 md:pt-0">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={isDeleting === msg.id}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {isDeleting === msg.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span className="md:hidden lg:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
