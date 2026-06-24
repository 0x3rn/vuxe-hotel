"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900 font-sans w-full">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 flex items-center justify-between bg-secondary p-4 text-primary z-40 h-16 shadow-sm w-full">
        <div className="text-xl font-serif">Luxe Admin</div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-primary focus:outline-none">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-secondary text-secondary-foreground flex flex-col transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:self-start md:translate-x-0 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 text-2xl font-serif text-primary border-b border-secondary-foreground/20 flex justify-between items-center h-16 md:h-auto">
          <span>Luxe Admin</span>
          <button className="md:hidden text-secondary-foreground/70 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Dashboard
          </Link>
          <Link href="/admin/guests" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/guests' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Guests
          </Link>
          <Link href="/admin/bookings" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Bookings
          </Link>
          <Link href="/admin/rooms" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/rooms' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Rooms
          </Link>
          <Link href="/admin/transport" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/transport' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Transport
          </Link>
          <Link href="/admin/messages" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Inquiries
          </Link>
          <Link href="/admin/experiences" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/experiences' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Experiences
          </Link>
          <Link href="/admin/offers" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/offers' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Special Offers
          </Link>
          <Link href="/admin/analytics" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Analytics
          </Link>
          <Link href="/admin/gallery" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/gallery' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Gallery
          </Link>
          <Link href="/admin/social" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/social' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Social Feed
          </Link>
          <Link href="/admin/settings" className={`block px-4 py-2 rounded transition-colors ${pathname === '/admin/settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary-foreground/10'}`}>
            Site Settings
          </Link>
          <div className="pt-4 mt-2 mb-2 border-t border-secondary-foreground/10"></div>
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
      <main className="flex-1 p-4 md:p-8 w-full">
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
