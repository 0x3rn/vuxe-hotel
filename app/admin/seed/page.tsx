"use client";

import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const luxuryRooms = [
  {
    id: "presidential-penthouse",
    name: "The Presidential Penthouse",
    description: "An opulent sanctuary suspended in the sky. Featuring panoramic city and ocean views, a private infinity plunge pool, and a dedicated 24-hour butler.",
    pricePerNight: 2500,
    capacity: 4,
    amenities: ["Private Pool", "24/7 Butler", "Panoramic Views", "Helipad Access", "Grand Piano"],
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 1,
    roomNumbers: ["The Presidential Penthouse - 01"]
  },
  {
    id: "ocean-view-villa",
    name: "Ocean View Villa",
    description: "Awaken to the gentle sound of waves and breathtaking azure horizons. This expansive suite offers a private wraparound balcony.",
    pricePerNight: 1200,
    capacity: 2,
    amenities: ["Ocean View Balcony", "Deep Soaking Tub", "Complimentary Spa Access", "King Bed"],
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 5,
    roomNumbers: ["Ocean View Villa - 01", "Ocean View Villa - 02", "Ocean View Villa - 03", "Ocean View Villa - 04", "Ocean View Villa - 05"]
  },
  {
    id: "royal-suite",
    name: "The Royal Suite",
    description: "A secluded haven designed for ultimate privacy and exclusivity. Nestled in lush tropical gardens.",
    pricePerNight: 1800,
    capacity: 6,
    amenities: ["Private Courtyard", "Heated Pool", "Outdoor Rain Shower", "Chef's Kitchen"],
    imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 2,
    roomNumbers: ["The Royal Suite - 01", "The Royal Suite - 02"]
  },
  {
    id: "executive-club-room",
    name: "Executive Club Room",
    description: "A sophisticated blend of business and leisure. Experience refined comfort with bespoke amenities.",
    pricePerNight: 450,
    capacity: 2,
    amenities: ["Club Lounge Access", "Evening Turndown", "High-Speed Wi-Fi", "Espresso Machine"],
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 10,
    roomNumbers: ["Executive Club Room - 01", "Executive Club Room - 02", "Executive Club Room - 03", "Executive Club Room - 04", "Executive Club Room - 05", "Executive Club Room - 06", "Executive Club Room - 07", "Executive Club Room - 08", "Executive Club Room - 09", "Executive Club Room - 10"]
  },
  {
    id: "honeymoon-suite",
    name: "Romantic Honeymoon Suite",
    description: "Intimate, elegant, and unforgettable. Adorned with delicate floral arrangements and a bottle of chilled vintage champagne.",
    pricePerNight: 600,
    capacity: 2,
    amenities: ["Vintage Champagne", "Canopy Bed", "Couples Massage", "Late Checkout"],
    imageUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 3,
    roomNumbers: ["Romantic Honeymoon Suite - 01", "Romantic Honeymoon Suite - 02", "Romantic Honeymoon Suite - 03"]
  }
];

const curatedExperiences = [
  {
    id: "spa-wellness",
    title: "Holistic Spa & Wellness",
    description: "Restore balance to your mind, body, and spirit in our holistic wellness sanctuary. Experience personalized treatments drawing upon ancient traditions.",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    order: 1
  },
  {
    id: "chauffeur",
    title: "Private Chauffeur",
    description: "Arrive in style and absolute privacy. From our fleet of luxury vehicles and dedicated chauffeurs, your seamless journey to paradise begins here.",
    imageUrl: "https://images.unsplash.com/photo-1631262562473-b3bc7f92b7eb?auto=format&fit=crop&w=800&q=80",
    order: 2
  },
  {
    id: "wine-tastings",
    title: "Private Wine Tastings",
    description: "Explore a curated selection of rare vintages with our expert sommeliers in an intimate, elegant cellar setting.",
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
    order: 3
  },
  {
    id: "local-tours",
    title: "Curated Local Tours",
    description: "Discover hidden gems and cultural landmarks through bespoke, guided experiences designed exclusively for our guests.",
    imageUrl: "https://images.unsplash.com/photo-1533106497176-45ae14e1738d?auto=format&fit=crop&w=800&q=80",
    order: 4
  }
];

const galleryImages = [
  "https://images.unsplash.com/photo-1582719478250-c89d14c77345?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c0d129df?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7bef31a?auto=format&fit=crop&w=600&q=80"
].map((url, i) => ({ id: `gal-${i+1}`, imageUrl: url, order: i + 1 }));

const socialImages = [
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512224053980-4006151a6628?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=400&q=80"
].map((url, i) => ({ id: `soc-${i+1}`, imageUrl: url, order: i + 1 }));

const specialOffers = [
  {
    id: "summer-escape",
    title: "Summer Escape",
    description: "Save 20% on stays of 3 nights or more. Experience the ultimate summer getaway with complimentary breakfast and late checkout.",
    discountPercentage: 20,
    minNights: 3,
    applicableRoomIds: ["all"],
    isActive: true,
    showInTopBar: true,
    mediaUrl: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=800&q=80",
    order: 1,
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
  },
  {
    id: "honeymoon-special",
    title: "Honeymoon Special",
    description: "Book our Romantic Honeymoon Suite for 2 nights and receive 15% off, plus a complimentary couples massage.",
    discountPercentage: 15,
    minNights: 2,
    applicableRoomIds: ["honeymoon-suite"],
    isActive: true,
    showInTopBar: false,
    mediaUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
    order: 2,
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
  }
];

const siteSettings = {
  id: "global",
  hotelName: "Luxe Hotel",
  contactEmail: "info@luxehotel.com",
  contactPhone: "+1 (555) 123-4567",
  currency: "USD",
  standardCheckIn: "15:00",
  standardCheckOut: "11:00",
  address: "123 Ocean Drive, Paradise City, PC 90210"
};

const dummyBookings = [
  {
    // Pending
    id: "booking-1",
    bookingRef: "LUX-PEND1",
    guestName: "Alice Pending",
    email: "alice.p@example.com",
    phone: "+1 555-1001",
    roomId: "ocean-view-villa",
    roomName: "Ocean View Villa",
    checkInDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
    guests: 2,
    totalPrice: 6000,
    status: "Pending",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  },
  {
    // Confirmed (Future)
    id: "booking-2",
    bookingRef: "LUX-CONF1",
    guestName: "Bob Confirmed",
    email: "bob.c@example.com",
    roomId: "presidential-penthouse",
    roomName: "The Presidential Penthouse",
    checkInDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString().split('T')[0],
    assignedRoomNumber: "The Presidential Penthouse - 01",
    guests: 2,
    totalPrice: 7500,
    status: "Confirmed",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
  },
  {
    // Not Yet Checked-In (Arriving Today)
    id: "booking-3",
    bookingRef: "LUX-ARR1",
    guestName: "Charlie Arriving",
    email: "charlie.a@example.com",
    roomId: "ocean-view-villa",
    roomName: "Ocean View Villa",
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    assignedRoomNumber: "Ocean View Villa - 03",
    guests: 2,
    totalPrice: 3600,
    status: "Confirmed",
    checkedIn: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
  },
  {
    // Checked-In
    id: "booking-4",
    bookingRef: "LUX-IN1",
    guestName: "Diana InHouse",
    email: "diana.i@example.com",
    roomId: "royal-suite",
    roomName: "The Royal Suite",
    checkInDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    assignedRoomNumber: "The Royal Suite - 01",
    guests: 4,
    totalPrice: 5400,
    status: "Confirmed",
    checkedIn: true,
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    checkedOut: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
  },
  {
    // Checked-Out (< 48 hours ago)
    id: "booking-5",
    bookingRef: "LUX-OUT1",
    guestName: "Evan CheckedOut",
    email: "evan.o@example.com",
    roomId: "executive-club-room",
    roomName: "Executive Club Room",
    checkInDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    assignedRoomNumber: "Executive Club Room - 05",
    guests: 1,
    totalPrice: 1800,
    status: "Completed",
    checkedIn: true,
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    checkedOut: true,
    checkOutTime: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString(), // 24 hours ago
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString()
  },
  {
    // History (> 48 hours ago)
    id: "booking-6",
    bookingRef: "LUX-HIST1",
    guestName: "Fiona History",
    email: "fiona.h@example.com",
    roomId: "executive-club-room",
    roomName: "Executive Club Room",
    checkInDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
    assignedRoomNumber: "Executive Club Room - 01",
    guests: 2,
    totalPrice: 2250,
    status: "Completed",
    checkedIn: true,
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    checkedOut: true,
    checkOutTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
  },
  {
    // Cancelled
    id: "booking-7",
    bookingRef: "LUX-CANC1",
    guestName: "George Cancelled",
    email: "george.c@example.com",
    roomId: "honeymoon-suite",
    roomName: "Romantic Honeymoon Suite",
    checkInDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString().split('T')[0],
    guests: 2,
    totalPrice: 3000,
    status: "Guest Cancelled",
    cancelledTime: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString()
  }
];

const dummyTransport = [
  {
    id: "trans-1",
    bookingRef: "LUX-A1B2",
    guestName: "James Carter",
    email: "james.carter@example.com",
    phone: "+1 555-0101",
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    time: "14:00",
    pickupLocation: "International Airport",
    dropoffLocation: "Luxe Hotel",
    passengers: 2,
    luggage: "3 Large Suitcases",
    specialRequests: "Champagne on ice",
    status: "Completed",
    driverName: "Michael Chang",
    vehicleUsed: "Rolls Royce Phantom",
    cost: 350,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
  },
  {
    id: "trans-2",
    bookingRef: "LUX-E5F6",
    guestName: "Liam Johnson",
    email: "liam.j@example.com",
    phone: "+1 555-0303",
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    time: "09:30",
    pickupLocation: "Central Train Station",
    dropoffLocation: "Luxe Hotel",
    passengers: 4,
    luggage: "4 Bags",
    specialRequests: "Child seat needed",
    status: "Pending",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  }
];

const dummyMessages = [
  {
    id: "msg-1",
    name: "Oliver Smith",
    email: "oliver.smith@example.com",
    subject: "Private Event Inquiry",
    message: "I am interested in hosting a private corporate retreat at the hotel. Can you provide information on event spaces and group booking rates?",
    status: "Unread",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  },
  {
    id: "msg-2",
    name: "Isabella Brown",
    email: "isabella.b@example.com",
    subject: "Dietary Requirements for Dining",
    message: "We have a reservation at your signature restaurant next week. Do you accommodate strict vegan and gluten-free diets?",
    status: "Replied",
    replyText: "Dear Isabella, absolutely! Our Michelin-starred chefs are well-versed in catering to all dietary requirements. We have noted this on your reservation.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString()
  }
];
export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const handleSeed = async () => {
    // Extra layer of protection for the admin dashboard
    if (!confirm("Are you sure you want to run the full seed script? This will overwrite existing data in rooms, experiences, gallery, offers, settings, social, AND replace dummy bookings, transport, and messages.")) {
      return;
    }

    setLoading(true);
    setLogs([]);
    setSuccess(false);
    
    try {
      addLog("Starting database seed...");
      
      // Rooms
      for (const room of luxuryRooms) {
        const roomRef = doc(collection(db, "rooms"), room.id);
        await setDoc(roomRef, room);
        addLog(`Successfully added room: ${room.name}`);
      }

      // Experiences
      for (const exp of curatedExperiences) {
        const expRef = doc(collection(db, "experiences"), exp.id);
        await setDoc(expRef, exp);
        addLog(`Successfully added experience: ${exp.title}`);
      }

      // Gallery
      for (const img of galleryImages) {
        const galRef = doc(collection(db, "gallery"), img.id);
        await setDoc(galRef, img);
        addLog(`Successfully added gallery image: ${img.id}`);
      }

      // Social
      for (const img of socialImages) {
        const socRef = doc(collection(db, "social"), img.id);
        await setDoc(socRef, img);
        addLog(`Successfully added social image: ${img.id}`);
      }

      // Offers
      for (const offer of specialOffers) {
        const offerRef = doc(collection(db, "offers"), offer.id);
        await setDoc(offerRef, offer);
        addLog(`Successfully added offer: ${offer.title}`);
      }

      // Settings
      const settingsRef = doc(collection(db, "settings"), siteSettings.id);
      await setDoc(settingsRef, siteSettings);
      addLog(`Successfully added global settings`);

      // Bookings
      for (const booking of dummyBookings) {
        const bookingRef = doc(collection(db, "bookings"), booking.id);
        await setDoc(bookingRef, booking);
        addLog(`Successfully added booking: ${booking.bookingRef}`);
      }

      // Transport Requests
      for (const trans of dummyTransport) {
        const transRef = doc(collection(db, "transport_requests"), trans.id);
        await setDoc(transRef, trans);
        addLog(`Successfully added transport request for: ${trans.guestName}`);
      }

      // Messages
      for (const msg of dummyMessages) {
        const msgRef = doc(collection(db, "messages"), msg.id);
        await setDoc(msgRef, msg);
        addLog(`Successfully added message from: ${msg.name}`);
      }
      
      addLog("Database seeding complete!");
      setSuccess(true);
    } catch (error: any) {
      addLog(`Error: ${error.message || "Unknown error occurred"}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Database Management</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-medium mb-4">Seed Initial Data</h2>
        <p className="text-gray-500 mb-6">
          This will populate your Firestore database with the initial 5-star luxury rooms dummy data, curated experiences, gallery images, special offers, site settings, social feed, and full transactional dummy data (bookings, transport requests, and messages).
          If the items already exist, this will overwrite them with the default data.
          <br/><br/>
          <strong>Security Note:</strong> This page is protected by the Admin Authentication shell. Unauthenticated users cannot view or trigger this script.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="bg-primary text-primary-foreground px-6 py-3 rounded uppercase text-sm tracking-wider font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Seeding Database..." : "Run Seed Script"}
        </button>

        {logs.length > 0 && (
          <div className="mt-8 p-4 bg-gray-900 rounded-md text-green-400 font-mono text-sm h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {success && (
              <div className="mt-4 text-white font-bold text-base">✅ Seeding completed successfully!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
