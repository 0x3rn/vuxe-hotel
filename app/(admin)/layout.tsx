import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col">
        <div className="p-6 text-2xl font-serif text-primary border-b border-secondary-foreground/20">
          Luxe Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-secondary-foreground/10 transition-colors">
            Dashboard
          </a>
          <a href="/admin/rooms" className="block px-4 py-2 rounded hover:bg-secondary-foreground/10 transition-colors">
            Rooms
          </a>
          <a href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-secondary-foreground/10 transition-colors">
            Bookings
          </a>
        </nav>
        <div className="p-4 border-t border-secondary-foreground/20">
          <button className="w-full bg-red-900/50 hover:bg-red-900 text-white px-4 py-2 rounded transition-colors">
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
