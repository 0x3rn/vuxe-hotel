"use client";

import React, { useState } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

  const [success, setSuccess] = useState(false);

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
        alert("We could not find a confirmed booking matching that email and reference number. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation || !date || !time) return;

    setLoading(true);
    try {
      const transportData = {
        bookingId: bookingData.id,
        bookingRef: bookingData.bookingRef,
        guestName: bookingData.guestName,
        email: bookingData.email,
        pickupLocation,
        dropoffLocation,
        date,
        time,
        passengers: parseInt(passengers),
        specialRequests,
        status: 'Pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "transport_requests"), transportData);

      // Send confirmation email
      await addDoc(collection(db, "mail"), {
        to: bookingData.email,
        message: {
          subject: "Transport Request Received - Luxe Hotel",
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
              <p>Dear ${bookingData.guestName},</p>
              <p>We have successfully received your transport request. Our concierge team is currently reviewing it and will assign a chauffeur shortly.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                <p style="margin: 5px 0;"><strong>Pickup:</strong> ${pickupLocation}</p>
                <p style="margin: 5px 0;"><strong>Drop-off:</strong> ${dropoffLocation}</p>
              </div>
              <br/>
              <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
            </div>
          `
        }
      });

      setSuccess(true);
      setStep(3);
    } catch (error) {
      console.error("Transport request error:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
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
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
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
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Date</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Time</label>
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
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
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-serif text-zinc-900 mb-4">Request Received</h2>
              <p className="text-zinc-500 mb-8">
                Your transport request has been submitted successfully. An email confirmation has been sent to you. Our concierge will be in touch shortly to finalize the details.
              </p>
              <Link href="/" className="text-primary hover:underline font-medium">
                Return to Homepage
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
