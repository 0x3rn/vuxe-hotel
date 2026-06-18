"use client";

import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const luxuryRooms = [
  {
    id: "presidential-penthouse",
    name: "The Presidential Penthouse",
    description: "An opulent sanctuary suspended in the sky. Featuring panoramic city and ocean views, a private infinity plunge pool, and a dedicated 24-hour butler. Lavishly appointed with Italian marble and bespoke mahogany furnishings, this suite represents the pinnacle of five-star living.",
    pricePerNight: 2500,
    capacity: 4,
    amenities: ["Private Pool", "24/7 Butler", "Panoramic Views", "Helipad Access", "Grand Piano"],
    imageUrl: "https://placehold.co/800x600/222222/D4AF37?text=Presidential+Penthouse",
    isAvailable: true,
  },
  {
    id: "ocean-view-suite",
    name: "Ocean View Grand Suite",
    description: "Awaken to the gentle sound of waves and breathtaking azure horizons. This expansive suite offers a private wraparound balcony, a deep soaking tub, and Egyptian cotton linens for a restorative, luxurious escape.",
    pricePerNight: 850,
    capacity: 2,
    amenities: ["Ocean View Balcony", "Deep Soaking Tub", "Complimentary Spa Access", "King Bed"],
    imageUrl: "https://placehold.co/800x600/222222/D4AF37?text=Ocean+View+Suite",
    isAvailable: true,
  },
  {
    id: "royal-villa",
    name: "The Royal Villa",
    description: "A secluded haven designed for ultimate privacy and exclusivity. Nestled in lush tropical gardens, the villa features a private courtyard, a temperature-controlled pool, and an outdoor rain shower, crafted for discerning guests.",
    pricePerNight: 1800,
    capacity: 6,
    amenities: ["Private Courtyard", "Heated Pool", "Outdoor Rain Shower", "Chef's Kitchen"],
    imageUrl: "https://placehold.co/800x600/222222/D4AF37?text=Royal+Villa",
    isAvailable: true,
  },
  {
    id: "executive-club-room",
    name: "Executive Club Room",
    description: "A sophisticated blend of business and leisure. Experience refined comfort with bespoke amenities, access to the exclusive Executive Club Lounge, and impeccable evening turndown service.",
    pricePerNight: 450,
    capacity: 2,
    amenities: ["Club Lounge Access", "Evening Turndown", "High-Speed Wi-Fi", "Espresso Machine"],
    imageUrl: "https://placehold.co/800x600/222222/D4AF37?text=Executive+Club",
    isAvailable: true,
  },
  {
    id: "honeymoon-suite",
    name: "Romantic Honeymoon Suite",
    description: "Intimate, elegant, and unforgettable. Adorned with delicate floral arrangements and a bottle of chilled vintage champagne upon arrival, this suite features a canopy bed and a dual vanity marble bathroom.",
    pricePerNight: 600,
    capacity: 2,
    amenities: ["Vintage Champagne", "Canopy Bed", "Couples Massage", "Late Checkout"],
    imageUrl: "https://placehold.co/800x600/222222/D4AF37?text=Honeymoon+Suite",
    isAvailable: true,
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
    setLoading(true);
    setLogs([]);
    setSuccess(false);
    
    try {
      addLog("Starting database seed...");
      
      for (const room of luxuryRooms) {
        const roomRef = doc(collection(db, "rooms"), room.id);
        await setDoc(roomRef, room);
        addLog(`Successfully added room: ${room.name}`);
      }
      
      addLog("Database seeding complete! ✨");
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
          This will populate your Firestore database with the initial 5-star luxury rooms dummy data. 
          If the rooms already exist, this will overwrite them with the default data.
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
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-md">
            Success! You can now visit the <a href="/admin/rooms" className="underline font-medium">Rooms Dashboard</a> to manage your new inventory.
          </div>
        )}
      </div>
    </div>
  );
}
