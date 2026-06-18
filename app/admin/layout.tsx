"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we are on the login page, don't show the sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not logged in, AuthContext will handle the redirect, just return null here
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col">
        <div className="p-6 text-2xl font-serif text-primary border-b border-secondary-foreground/20">
          Luxe Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Dashboard
          </Link>
          <Link href="/admin/rooms" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/rooms' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Rooms
          </Link>
          <Link href="/admin/bookings" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Bookings
          </Link>
          <Link href="/admin/amenities" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/amenities' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Amenities
          </Link>
          <Link href="/admin/seed" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/seed' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Database Seed
          </Link>
          <div className="pt-4 mt-4 border-t border-secondary-foreground/10">
            <Link href="/" className="block px-4 py-2 rounded transition-colors hover:bg-secondary-foreground/10 text-zinc-300">
              View Main Site
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-secondary-foreground/20">
          <div className="text-xs text-secondary-foreground/50 mb-4 px-2 break-words">
            {user.email}
          </div>
          <button 
            onClick={logout}
            className="w-full bg-red-900/50 hover:bg-red-900 text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
