"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';

export default function StickyBookingBar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  useEffect(() => {
    const handleScroll = () => {
      // Show floating elements after scrolling past 600px (roughly the Hero section height)
      if (window.scrollY > 600) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      alert("Please select both Check In and Check Out dates.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Check Out date must be after Check In date.");
      return;
    }
    setIsDrawerOpen(false);
    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests);
    router.push(`/rooms?${params.toString()}`);
  };

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  // DESKTOP: Sleek horizontal bar
  const renderDesktopForm = () => (
    <div className="hidden md:flex items-center justify-between w-full max-w-4xl mx-auto px-6 py-2.5 mb-6 rounded-full backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-xl pointer-events-auto transition-all">
      <div className="flex items-center gap-4 flex-1 pr-6 border-r border-zinc-200 dark:border-zinc-800">
        <div className="flex-1">
          <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">Check In</label>
          <input 
            type="date" 
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-xs font-medium focus:outline-none text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">Check Out</label>
          <input 
            type="date" 
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-xs font-medium focus:outline-none text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">Guests</label>
          <select 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent text-xs font-medium focus:outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            {[1,2,3,4,5,6].map(num => (
              <option key={num} value={num}>{num} Guest{num !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="pl-6">
        <button 
          onClick={handleCheckAvailability}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full uppercase text-[10px] tracking-widest font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 whitespace-nowrap"
        >
          Check Availability
        </button>
      </div>
    </div>
  );

  // MOBILE: Compact trigger card that opens the bottom drawer
  const renderMobileStaticCard = () => (
    <div 
      onClick={() => setIsDrawerOpen(true)}
      className="md:hidden w-full max-w-sm mx-auto px-6 py-4 mb-6 rounded-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform pointer-events-auto"
    >
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Your Stay</span>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
          {checkIn && checkOut ? `${checkIn} to ${checkOut}` : 'Select Dates'} • {guests} Guest{guests !== '1' ? 's' : ''}
        </span>
      </div>
      <div className="bg-primary text-primary-foreground p-2.5 rounded-full shadow-sm">
        <ArrowRight size={16} />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. STATIC RESPONSIVE BAR (Always visible below Hero) */}
      <div className="w-full z-30 px-4 md:px-0">
        {renderDesktopForm()}
        {renderMobileStaticCard()}
      </div>

      {/* 2. FLOATING DESKTOP BAR (Visible on scroll) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full z-40 hidden md:flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-4xl px-4 md:px-0">
              {renderDesktopForm()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FLOATING MOBILE PILL BUTTON (Visible on scroll) */}
      <AnimatePresence>
        {isScrolled && !isDrawerOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed bottom-6 right-6 z-40 pointer-events-auto"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDrawerOpen(true)}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full uppercase text-xs tracking-widest font-semibold shadow-2xl border border-primary/20"
            >
              Reserve
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MOBILE DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden pointer-events-auto">
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            
            {/* Sheet Content */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full bg-white dark:bg-zinc-950 rounded-t-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setIsDrawerOpen(false);
              }}
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pb-6 sticky top-0 bg-white dark:bg-zinc-950 z-10 pt-2">
                <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
              </div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Your Stay</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Check In</label>
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-base text-zinc-900 dark:text-zinc-100 appearance-none min-w-0 box-border focus:outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Check Out</label>
                  <input 
                    type="date" 
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-base text-zinc-900 dark:text-zinc-100 appearance-none min-w-0 box-border focus:outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Guests</label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-base text-zinc-900 dark:text-zinc-100 appearance-none min-w-0 box-border focus:outline-none focus:border-primary"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Guest{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleCheckAvailability}
                  className="w-full bg-primary text-primary-foreground h-14 rounded-xl uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors mt-4 shadow-lg shadow-primary/20"
                >
                  Check Availability
                </button>
              </div>
              
              {/* Extra padding for safe area at bottom of mobile devices */}
              <div className="h-6" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
