"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Define the Room type
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

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

function RoomsList() {
  const searchParams = useSearchParams();
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomsAndAvailability = async () => {
      setLoading(true);
      try {
        // 1. Fetch all rooms
        const roomsSnapshot = await getDocs(collection(db, "rooms"));
        let roomsData: Room[] = [];
        roomsSnapshot.forEach((doc) => {
          roomsData.push({ id: doc.id, ...doc.data() } as Room);
        });

        // 2. Filter by capacity if guests param exists
        if (guestsParam) {
          const requiredCapacity = parseInt(guestsParam, 10);
          roomsData = roomsData.filter(r => r.capacity >= requiredCapacity);
        }

        // 3. Check overlapping bookings if dates exist
        if (checkInParam && checkOutParam) {
          const reqCheckIn = new Date(checkInParam).getTime();
          const reqCheckOut = new Date(checkOutParam).getTime();

          // Fetch all active bookings
          const bookingsQuery = query(collection(db, "bookings"), where("status", "in", ["Pending", "Approved"]));
          const bookingsSnapshot = await getDocs(bookingsQuery);
          
          const overlappingCounts: Record<string, number> = {};
          
          bookingsSnapshot.forEach((doc) => {
            const b = doc.data();
            const bCheckIn = new Date(b.checkInDate).getTime();
            const bCheckOut = new Date(b.checkOutDate).getTime();
            
            // Check if dates overlap
            // Overlap condition: start1 < end2 AND end1 > start2
            if (bCheckIn < reqCheckOut && bCheckOut > reqCheckIn) {
              overlappingCounts[b.roomId] = (overlappingCounts[b.roomId] || 0) + 1;
            }
          });

          // Subtract overlapping bookings from inventory
          roomsData = roomsData.map(room => {
            if (room.inventory !== undefined) {
              const overlaps = overlappingCounts[room.id] || 0;
              const remaining = room.inventory - overlaps;
              return { ...room, inventory: remaining > 0 ? remaining : 0, isAvailable: remaining > 0 && room.isAvailable };
            }
            return room;
          });
        }

        roomsData.sort((a, b) => a.name.localeCompare(b.name));
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomsAndAvailability();
  }, [checkInParam, checkOutParam, guestsParam]);

  const hasFilters = checkInParam || checkOutParam || guestsParam;

  return (
    <>
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif text-zinc-900 mb-4">Our Suites & Villas</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto text-lg mb-6">
          Experience unparalleled luxury and comfort in our meticulously designed accommodations. 
          Each space is crafted to provide a sanctuary of elegance and serenity.
        </p>
        
        {hasFilters && (
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white px-6 py-3 rounded-full shadow-sm border border-zinc-100 text-sm text-zinc-600">
            <span>
              Showing availability for <strong>{guestsParam || 'Any'} {guestsParam === '1' ? 'guest' : 'guests'}</strong>
              {checkInParam && checkOutParam && (
                <span> from <strong>{checkInParam}</strong> to <strong>{checkOutParam}</strong></span>
              )}
            </span>
            <Link href="/rooms" className="text-primary hover:underline font-medium ml-2">Clear Filters</Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {rooms.map((room) => {
            const isBookable = room.isAvailable && (room.inventory === undefined || room.inventory > 0);
            
            // Build the dynamic URL for Book Now
            const bookUrlParams = new URLSearchParams();
            if (checkInParam) bookUrlParams.set('checkIn', checkInParam);
            if (checkOutParam) bookUrlParams.set('checkOut', checkOutParam);
            if (guestsParam) bookUrlParams.set('guests', guestsParam);
            const bookUrl = `/rooms/${room.id}${bookUrlParams.toString() ? `?${bookUrlParams.toString()}` : ''}`;

            return (
              <motion.div 
                key={room.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="h-72 overflow-hidden relative">
                  <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {!isBookable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <span className="text-white tracking-widest uppercase font-semibold">Fully Booked</span>
                    </div>
                  )}
                  {isBookable && room.inventory !== undefined && room.inventory <= 3 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-600 px-3 py-1 rounded shadow-sm text-xs font-bold tracking-wider z-10">
                      Only {room.inventory} Left
                    </div>
                  )}
                </div>
                <div className="p-8 border border-t-0 border-zinc-100 flex flex-col flex-1">
                  <h4 className="text-2xl font-serif text-zinc-900 mb-2">{room.name}</h4>
                  <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">Up to {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</p>
                  <p className="text-zinc-500 text-sm mb-6 line-clamp-3 flex-1">{room.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">+{room.amenities.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-6 mt-auto">
                    <div>
                      <span className="text-primary font-medium text-lg">${room.pricePerNight}</span>
                      <span className="text-zinc-400 text-sm"> / night</span>
                    </div>
                    <Link 
                      href={bookUrl}
                      className={`border px-6 py-2 rounded uppercase text-xs tracking-widest transition-colors ${
                        isBookable 
                          ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'
                          : 'border-zinc-200 text-zinc-300 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      {isBookable ? 'Book Now' : 'Unavailable'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function RoomsPage() {
  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
          <RoomsList />
        </Suspense>
      </div>
    </div>
  );
}
