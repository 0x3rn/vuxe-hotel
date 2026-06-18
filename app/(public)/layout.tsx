import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-serif font-bold text-primary tracking-wider">
            LUXE
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
            <a href="/" className="hover:text-primary transition-colors">HOME</a>
            <a href="/rooms" className="hover:text-primary transition-colors">SUITES</a>
            <a href="#amenities" className="hover:text-primary transition-colors">AMENITIES</a>
          </nav>
          <a href="/rooms" className="bg-primary text-primary-foreground px-6 py-2 rounded uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition-colors">
            Book Now
          </a>
        </div>
      </header>
      <main className="flex-1 pt-20">
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
                <li><a href="/rooms" className="hover:text-primary transition-colors">Our Suites</a></li>
                <li><a href="#dining" className="hover:text-primary transition-colors">Dining</a></li>
                <li><a href="#spa" className="hover:text-primary transition-colors">Spa & Wellness</a></li>
                <li><a href="#offers" className="hover:text-primary transition-colors">Special Offers</a></li>
                <li><a href="#gallery" className="hover:text-primary transition-colors">Gallery</a></li>
              </ul>
            </div>

            {/* Column 3 (Legal & Policies) */}
            <div>
              <h3 className="text-white font-medium uppercase tracking-wider text-sm mb-6">Legal</h3>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cancellation Policy</a></li>
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
                  className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:border-primary text-sm"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors"><Facebook size={20} /></a>
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
