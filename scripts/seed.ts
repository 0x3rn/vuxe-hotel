import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

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

async function seedDatabase() {
  console.log("Seeding luxury rooms into Firestore...");
  try {
    for (const room of luxuryRooms) {
      const roomRef = doc(collection(db, "rooms"), room.id);
      await setDoc(roomRef, room);
      console.log(`Added room: ${room.name}`);
    }
    console.log("Seeding complete! ✨");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
