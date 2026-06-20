"use client";

import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, CheckCircle, XCircle } from 'lucide-react';

type ModalConfig = {
  isOpen: boolean;
  type: 'error' | 'success';
  title: string;
  message: string;
};

export default function TransportPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Verification
  const [email, setEmail] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [bookingData, setBookingData] = useState<any>(null);

  // Step 2: Request Details
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');

  // Modal State
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedRef = bookingRef.trim().toUpperCase();
      
      const q = query(
        collection(db, "bookings"),
        where("bookingRef", "==", trimmedRef),
        where("status", "==", "Confirmed")
      );
      
      const snapshot = await getDocs(q);
      
      let matchedBooking = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.email.trim().toLowerCase() === trimmedEmail) {
          matchedBooking = { id: doc.id, ...data };
        }
      });

      if (matchedBooking) {
        setBookingData(matchedBooking);
        setStep(2);
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Booking Not Found',
          message: 'We could not find a confirmed booking matching that email and reference number. Please check your details and try again.'
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Verification Failed',
        message: 'An error occurred during verification. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation || !date || !time) return;

    setLoading(true);
    try {
      const response = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.id,
          bookingRef: bookingData.bookingRef,
          guestName: bookingData.guestName,
          email: bookingData.email,
          pickupLocation,
          dropoffLocation,
          date,
          time,
          passengers,
          specialRequests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Request Received',
        message: 'Your transport request has been submitted successfully. An email confirmation has been sent to you. Our concierge will be in touch shortly.'
      });
      setStep(3); // Although we have a modal, we might want to clear the form
    } catch (error: any) {
      console.error("Transport request error:", error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setBookingRef('');
    setBookingData(null);
    setPickupLocation('');
    setDropoffLocation('');
    setDate('');
    setTime('');
    setPassengers('1');
    setSpecialRequests('');
    closeModal();
  };

  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24 relative">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-4">Private Chauffeur Service</h1>
          <p className="text-zinc-500 text-lg">
            Exclusive transport arrangements for our confirmed guests.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl border border-zinc-100">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif text-zinc-900 mb-6">Verify Your Booking</h2>
              <p className="text-zinc-500 mb-8">
                Please enter your email address and the Booking Reference number you received in your confirmation email.
              </p>
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Booking Reference</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. LX-XXXXXX"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Booking'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && bookingData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-serif text-zinc-900 mb-2">Request Transport</h2>
              <p className="text-zinc-500 mb-8">
                Welcome back, {bookingData.guestName}. Please provide your transport details below.
              </p>
              <form onSubmit={handleRequestTransport} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Pickup Location</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Airport, Station, or Address"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-base bg-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Drop-off Location</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Luxe Hotel or Address"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-base bg-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Date</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-base bg-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Time</label>
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-base bg-transparent" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Passengers</label>
                  <select 
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Special Requests (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Extra luggage, child seat, etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-stone-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif text-zinc-900 mb-4">Request Complete</h2>
              <p className="text-zinc-500 mb-8">
                Your luxury transport arrangement is being processed. You can make another request or return home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={resetForm} className="text-sm font-medium border border-zinc-200 px-6 py-3 rounded hover:bg-zinc-50 transition-colors uppercase tracking-wider">
                  New Request
                </button>
                <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors">
                  Return Home
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Premium Modal Overlay */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 h-[100dvh] z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-900/40"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }} 
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white max-w-md w-full rounded-xl shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-4 right-4">
                <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  {modal.type === 'error' ? (
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-serif text-zinc-900 mb-3">{modal.title}</h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  {modal.message}
                </p>
                
                <button 
                  onClick={closeModal}
                  className={`w-full py-3 rounded uppercase text-sm tracking-widest font-semibold transition-colors ${
                    modal.type === 'error' 
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {modal.type === 'error' ? 'Understood' : 'Continue'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

