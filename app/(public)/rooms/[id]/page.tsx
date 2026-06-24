"use client";

import React, { useEffect, useState, Suspense } from 'react';
import toast from 'react-hot-toast';
import { useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { differenceInDays } from 'date-fns';

type Room = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  inventory?: number;
  amenities: string[];
  imageUrl: string;
  isAvailable: boolean;
};

function RoomDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableInventory, setAvailableInventory] = useState<number | null>(null);
  const [applicableOffer, setApplicableOffer] = useState<any>(null);

  // Booking Form State
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const docRef = doc(db, "rooms", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const roomData = { id: docSnap.id, ...docSnap.data() } as Room;
          setRoom(roomData);

          // Fetch Offers
          const q = query(collection(db, "offers"), where("isActive", "==", true));
          const offersSnap = await getDocs(q);
          const offers: any[] = [];
          offersSnap.forEach(d => offers.push({ id: d.id, ...d.data() }));
          
          const offer = offers.find(o => o.applicableRoomIds?.includes('all') || o.applicableRoomIds?.includes(roomData.id));
          if (offer) setApplicableOffer(offer);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setLoading(false);
      }
    };

    const cleanupExpiredBookings = async () => {
      try {
        await fetch(`/api/cron/auto-cancel?roomId=${id}`);
      } catch (error) {
        console.error("Error running auto-cancel cleanup:", error);
      }
    };

    if (id) {
      fetchRoom();
      cleanupExpiredBookings();
    }
  }, [id]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!room || !checkIn || !checkOut || room.inventory === undefined) {
        setAvailableInventory(room?.inventory ?? null);
        return;
      }
      
      const reqCheckIn = new Date(checkIn).getTime();
      const reqCheckOut = new Date(checkOut).getTime();
      
      if (reqCheckOut <= reqCheckIn) return;

      try {
        const bookingsQuery = query(collection(db, "bookings"), where("roomId", "==", id), where("status", "in", ["Pending", "Approved"]));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        let overlaps = 0;
        bookingsSnapshot.forEach((doc) => {
          const b = doc.data();
          const bCheckIn = new Date(b.checkInDate).getTime();
          const bCheckOut = new Date(b.checkOutDate).getTime();
          
          if (bCheckIn < reqCheckOut && bCheckOut > reqCheckIn) {
            overlaps++;
          }
        });

        setAvailableInventory(Math.max(0, room.inventory - overlaps));
      } catch (error) {
        console.error("Error checking availability:", error);
      }
    };

    checkAvailability();
  }, [room, checkIn, checkOut, id]);

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, differenceInDays(end, start));
  };

  const calculateTotals = () => {
    const nights = getNights();
    if (nights <= 0 || !room) return { rawTotal: 0, discount: 0, finalTotal: 0, offerApplied: false };
    
    const rawTotal = nights * room.pricePerNight;
    let discount = 0;
    let offerApplied = false;

    if (applicableOffer && nights >= applicableOffer.minNights) {
      discount = (rawTotal * applicableOffer.discountPercentage) / 100;
      offerApplied = true;
    }

    return { rawTotal, discount, finalTotal: rawTotal - discount, offerApplied };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }
    if (!guestName.trim()) {
      toast.error("Please provide your full name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please provide your email address.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please provide your phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a friendly 6-character alphanumeric reference
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let ref = 'LX-';
      for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { rawTotal, discount, finalTotal, offerApplied } = calculateTotals();

      const bookingData = {
        roomId: room.id,
        roomName: room.name,
        guestName,
        email: email.toLowerCase().trim(),
        phone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        rawTotal,
        discountApplied: discount,
        offerAppliedId: offerApplied ? applicableOffer.id : null,
        totalPrice: finalTotal,
        status: 'Pending',
        createdAt: serverTimestamp(),
        bookingRef: ref
      };
      
      await addDoc(collection(db, "bookings"), bookingData);
      setBookingRef(ref);
      
      // Trigger Firebase Email Extension by writing to the 'mail' collection
      await addDoc(collection(db, "mail"), {
        to: email,
        message: {
          subject: "Your Luxe Hotel Reservation Request",
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
              <p>Dear ${guestName},</p>
              <p>Thank you for requesting to stay with us. We have successfully received your reservation request for the <strong>${room.name}</strong>.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Booking Reference:</strong> ${ref}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
                <p style="margin: 5px 0;"><strong>Estimated Total:</strong> $${finalTotal.toLocaleString()}</p>
              </div>
              <p>Our concierge team is reviewing your request and will contact you shortly to confirm your booking.</p>
              <br/>
              <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
            </div>
          `
        }
      });

      // Admin Alert Email
      await addDoc(collection(db, "mail"), {
        to: "somtoadmin@gmail.com",
        message: {
          subject: `ATTENTION REQUIRED: New Booking Request Received - ${ref}`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="color: #b91c1c; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Booking Alert</h2>
              <p>A new booking request has just been submitted and requires review.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Guest Name:</strong> ${guestName}</p>
                <p style="margin: 5px 0;"><strong>Room:</strong> ${room.name}</p>
                <p style="margin: 5px 0;"><strong>Reference:</strong> ${ref}</p>
              </div>
              <p>Please log in to the <a href="https://vuxe-hotel.vercel.app/admin/bookings" style="color: #1d4ed8; text-decoration: underline;">Admin Dashboard</a> to review and confirm this reservation.</p>
            </div>
          `
        }
      });

      setBookingSuccess(true);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-50 text-2xl font-serif">
        Room not found.
      </div>
    );
  }

  const { finalTotal } = calculateTotals();
  const isBookable = room.isAvailable && (availableInventory === null || availableInventory > 0);

  return (
    <div className="bg-stone-50 min-h-screen w-full">
      {/* Hero */}
      <div className="h-[60vh] relative">
        <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide text-center px-4">
            {room.name}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Details */}
          <div className="lg:w-2/3 space-y-12">
            <section>
              <h2 className="text-3xl font-serif text-zinc-900 mb-6">About this suite</h2>
              <p className="text-zinc-500 leading-relaxed text-lg">
                {room.description}
              </p>
              <div className="mt-8 flex gap-6 text-sm uppercase tracking-widest text-zinc-400">
                <span>Capacity: {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
                <span>Price: ${room.pricePerNight} / Night</span>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-zinc-900 mb-6">Premium Amenities</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {room.amenities.map((amenity, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Booking Widget */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-lg shadow-xl border border-zinc-100 sticky top-32">
              <h3 className="text-2xl font-serif text-zinc-900 mb-2">Reserve Your Stay</h3>
              <p className="text-zinc-500 text-sm mb-4">From ${room.pricePerNight} per night</p>

              {applicableOffer && (
                <div className="mb-6 bg-zinc-950 text-amber-500 p-4 rounded border border-amber-500/20 text-center text-sm shadow-inner">
                  <span className="font-bold tracking-widest uppercase mb-1 block">Special Offer</span>
                  <span className="text-zinc-300">{applicableOffer.description}</span>
                  {applicableOffer.endDate && (
                    <span className="block mt-2 text-xs text-amber-500/70 tracking-widest uppercase">Ends: {applicableOffer.endDate}</span>
                  )}
                </div>
              )}

              {!isBookable && checkIn && checkOut && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm font-medium mb-6 border border-red-100">
                  Fully booked for these dates
                </div>
              )}
              {!isBookable && (!checkIn || !checkOut) && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm font-medium mb-6 border border-red-100">
                  Currently fully booked
                </div>
              )}
              {isBookable && availableInventory !== null && availableInventory <= 3 && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm font-medium mb-6 border border-red-100">
                  Limited Availability: Only {availableInventory} {availableInventory === 1 ? 'room' : 'rooms'} remaining
                </div>
              )}

              {bookingSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="text-2xl font-serif text-zinc-900 mb-2">Booking Requested</h4>
                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-lg my-6">
                    <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Your Booking Reference</p>
                    <p className="text-xl font-mono text-zinc-900 font-semibold">{bookingRef}</p>
                  </div>
                  <p className="text-zinc-500 text-sm">
                    Thank you! We have received your request and will contact you shortly to confirm your reservation. Please save your booking reference.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Check In</label>
                      <input 
                        type="date" 
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Check Out</label>
                      <input 
                        type="date" 
                        required
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Guests</label>
                    <select 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent"
                    >
                      {[...Array(room.capacity)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <hr className="border-zinc-100" />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Full Name *</label>
                      <input 
                        type="text" 
                        value={guestName} 
                        onChange={e => setGuestName(e.target.value)} 
                        required 
                        className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                        placeholder="john@example.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Phone Number *</label>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        required 
                        className="w-full border-b border-zinc-200 pb-2 focus:outline-none focus:border-primary text-sm bg-transparent" 
                        placeholder="+1 (555) 000-0000" 
                      />
                    </div>
                  </div>

                  {(() => {
                    const { rawTotal, discount, finalTotal, offerApplied } = calculateTotals();
                    if (rawTotal > 0) {
                      return (
                        <div className="bg-stone-50 p-4 rounded text-sm flex flex-col gap-2 text-zinc-900 border border-stone-100">
                          {offerApplied ? (
                            <>
                              <div className="flex justify-between items-center text-zinc-500">
                                <span>{room.name}: ${room.pricePerNight} x {getNights()} nights</span>
                                <span>${rawTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-emerald-600 font-medium">
                                <span>Offer: {applicableOffer.title}</span>
                                <span>- ${discount.toLocaleString()}</span>
                              </div>
                              <hr className="border-stone-200 my-1" />
                              <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total Price:</span>
                                <span>${finalTotal.toLocaleString()}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span>Total for {getNights()} nights:</span>
                              <span className="font-medium text-lg">${rawTotal.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button 
                    type="submit" 
                    disabled={!isBookable || isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-4 rounded uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : (isBookable ? 'Confirm Reservation' : 'Fully Booked')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-stone-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <RoomDetailContent />
    </Suspense>
  );
}
