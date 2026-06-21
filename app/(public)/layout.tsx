"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 md:px-8 md:py-6 flex items-center justify-between">
          <div className="text-2xl font-serif font-bold text-primary tracking-wider z-50 relative">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>LUXE</Link>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide items-center">
            <Link href="/" className="hover:text-primary transition-colors">HOME</Link>
            <Link href="/rooms" className="hover:text-primary transition-colors">ROOMS</Link>
            <Link href="/dining" className="hover:text-primary transition-colors">DINING</Link>
            <Link href="/#gallery" className="hover:text-primary transition-colors">GALLERY</Link>
            <Link href="/#location" className="hover:text-primary transition-colors">LOCATION</Link>
            <Link href="/#contact" className="hover:text-primary transition-colors">CONTACT</Link>
            <Link href="/rooms" className="bg-primary text-primary-foreground px-6 py-3 rounded uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition-colors ml-4">
              Book Your Stay
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-50 relative text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-background flex flex-col items-center justify-center space-y-8 z-40 h-screen">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-foreground hover:text-primary transition-colors">HOME</Link>
            <Link href="/rooms" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-foreground hover:text-primary transition-colors">ROOMS</Link>
            <Link href="/dining" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-foreground hover:text-primary transition-colors">DINING</Link>
            <Link href="/#gallery" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-foreground hover:text-primary transition-colors">GALLERY</Link>
            <Link href="/#location" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-foreground hover:text-primary transition-colors">LOCATION</Link>
            <Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-foreground hover:text-primary transition-colors">CONTACT</Link>
            <Link href="/rooms" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-primary-foreground px-8 py-4 rounded uppercase text-lg tracking-wider font-semibold hover:bg-primary/90 transition-colors mt-8">
              Book Your Stay
            </Link>
          </div>
        )}
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-zinc-950 text-zinc-300 py-16 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 (Brand) */}
            <div>
              <h2 className="text-2xl font-serif text-primary tracking-wider mb-4">LUXE</h2>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Experience the pinnacle of luxury, comfort, and bespoke service in paradise.
              </p>
              <address className="not-italic text-sm text-zinc-400 space-y-2">
                <p>1 Riviera Way, Maldives</p>
                <p>Phone: +1 800 555 0199</p>
                <p>Email: concierge@luxehotel.com</p>
              </address>
            </div>

            {/* Column 2 (Quick Links) */}
            <div>
              <h3 className="text-white font-medium uppercase tracking-wider text-sm mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><Link href="/rooms" className="hover:text-primary transition-colors">Rooms</Link></li>
                <li><Link href="/dining" className="hover:text-primary transition-colors">Dining</Link></li>
                <li><Link href="/#gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
                <li><Link href="/#contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Column 3 (Legal & Policies) */}
            <div>
              <h3 className="text-white font-medium uppercase tracking-wider text-sm mb-6">Legal</h3>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cancellation-policy" className="hover:text-primary transition-colors">Cancellation Policy</Link></li>
              </ul>
            </div>

            {/* Column 4 (Newsletter) */}
            <div>
              <h3 className="text-white font-medium uppercase tracking-wider text-sm mb-6">Newsletter</h3>
              <p className="text-sm text-zinc-400 mb-4">Subscribe to our newsletter for exclusive offers and news.</p>
              <form className="flex flex-col space-y-3 mb-6">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-zinc-900 border border-zinc-800 text-white px-4 py-3 md:py-2 rounded focus:outline-none focus:border-primary text-sm h-12 md:h-auto"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground px-4 py-3 md:py-2 rounded uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition-colors h-12 md:h-auto"
                >
                  Subscribe
                </button>
              </form>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Luxe Hotel. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
