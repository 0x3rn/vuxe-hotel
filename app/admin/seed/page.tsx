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
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 1,
  },
  {
    id: "ocean-view-villa",
    name: "Ocean View Villa",
    description: "Awaken to the gentle sound of waves and breathtaking azure horizons. This expansive suite offers a private wraparound balcony, a deep soaking tub, and Egyptian cotton linens for a restorative, luxurious escape.",
    pricePerNight: 1200,
    capacity: 2,
    amenities: ["Ocean View Balcony", "Deep Soaking Tub", "Complimentary Spa Access", "King Bed"],
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 5,
  },
  {
    id: "royal-suite",
    name: "The Royal Suite",
    description: "A secluded haven designed for ultimate privacy and exclusivity. Nestled in lush tropical gardens, the villa features a private courtyard, a temperature-controlled pool, and an outdoor rain shower, crafted for discerning guests.",
    pricePerNight: 1800,
    capacity: 6,
    amenities: ["Private Courtyard", "Heated Pool", "Outdoor Rain Shower", "Chef's Kitchen"],
    imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 2,
  },
  {
    id: "executive-club-room",
    name: "Executive Club Room",
    description: "A sophisticated blend of business and leisure. Experience refined comfort with bespoke amenities, access to the exclusive Executive Club Lounge, and impeccable evening turndown service.",
    pricePerNight: 450,
    capacity: 2,
    amenities: ["Club Lounge Access", "Evening Turndown", "High-Speed Wi-Fi", "Espresso Machine"],
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 10,
  },
  {
    id: "honeymoon-suite",
    name: "Romantic Honeymoon Suite",
    description: "Intimate, elegant, and unforgettable. Adorned with delicate floral arrangements and a bottle of chilled vintage champagne upon arrival, this suite features a canopy bed and a dual vanity marble bathroom.",
    pricePerNight: 600,
    capacity: 2,
    amenities: ["Vintage Champagne", "Canopy Bed", "Couples Massage", "Late Checkout"],
    imageUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    inventory: 3,
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

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const handleSeed = async () => {
    // Extra layer of protection for the admin dashboard
    if (!confirm("Are you sure you want to run the seed script? This will overwrite existing data in rooms, experiences, gallery, and social collections.")) {
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
          This will populate your Firestore database with the initial 5-star luxury rooms dummy data, curated experiences, gallery images, and social feed. 
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
