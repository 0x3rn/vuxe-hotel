"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Amenity = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function HomePage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const router = useRouter();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      alert("Please select both Check In and Check Out dates.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Check Out date must be after Check In date.");
      return;
    }
    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests);
    router.push(`/rooms?${params.toString()}`);
  };

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const q = query(collection(db, "amenities"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const amenitiesData: Amenity[] = [];
        querySnapshot.forEach((doc) => {
          amenitiesData.push({ id: doc.id, ...doc.data() } as Amenity);
        });
        setAmenities(amenitiesData);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };

    fetchAmenities();
  }, []);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center bg-stone-50 pt-24 pb-16 lg:py-0">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="relative z-10 text-center text-white space-y-6 max-w-4xl px-6 flex-1 flex flex-col justify-center mt-12 lg:mt-0"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold drop-shadow-lg tracking-wide">
            A Symphony of Luxury
          </h1>
          <p className="text-lg md:text-2xl font-light drop-shadow-md text-zinc-200">
            Discover a world of elegance and unparalleled service in the heart of paradise.
          </p>
        </motion.div>

        {/* Booking Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative lg:absolute lg:-bottom-24 z-20 w-[95%] max-w-5xl bg-white shadow-xl lg:shadow-2xl p-6 md:p-8 rounded-lg text-foreground flex flex-col md:flex-row gap-6 items-end border border-zinc-200 mt-12 lg:mt-0"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Check In</label>
            <input 
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full h-12 border-b border-border focus:outline-none focus:border-primary bg-transparent text-sm" 
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Check Out</label>
            <input 
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              className="w-full h-12 border-b border-border focus:outline-none focus:border-primary bg-transparent text-sm" 
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Guests</label>
            <select 
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full h-12 border-b border-border focus:outline-none focus:border-primary bg-transparent text-sm"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6+ Guests</option>
            </select>
          </div>
          <button 
            onClick={handleCheckAvailability}
            className="bg-primary text-primary-foreground px-8 h-14 md:h-12 rounded uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors w-full md:w-auto mt-4 md:mt-0 shadow-md"
          >
            Check Availability
          </button>
        </motion.div>
      </section>

      {/* spacer for floating widget */}
      <div className="hidden lg:block h-32 bg-white"></div>

      {/* About Us */}
      <section className="py-16 md:py-24 lg:py-32 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="container mx-auto px-6 text-center max-w-4xl"
        >
          <h2 className="text-sm uppercase tracking-widest text-primary mb-6 font-medium">Welcome to Luxe</h2>
          <h3 className="text-3xl md:text-5xl font-serif mb-8 text-balance text-zinc-900 leading-tight">Where Every Moment Becomes a Cherished Memory</h3>
          <p className="text-zinc-500 leading-relaxed text-lg">
            From the moment you arrive, you will be enveloped in an atmosphere of sophistication and grace. 
            Our five-star resort offers bespoke experiences, world-class dining, and breathtaking suites 
            designed to cater to your every desire. Indulge in the extraordinary.
          </p>
        </motion.div>
      </section>

      {/* Featured Suites */}
      <section className="py-16 md:py-24 lg:py-32 bg-[#FAFAFA]">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-widest text-primary mb-4 font-medium">Accommodations</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-zinc-900">Our Signature Suites</h3>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {/* Suite 1 */}
            <motion.div variants={fadeInUp} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="h-72 overflow-hidden relative shrink-0">
                <Image src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80" alt="Presidential Penthouse" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-8 text-center border border-t-0 border-zinc-100 flex flex-col flex-1">
                <h4 className="text-2xl font-serif text-zinc-900 mb-2">The Presidential Penthouse</h4>
                <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">120 sq.m | Up to 4 Guests</p>
                <p className="text-zinc-500 text-sm mb-6 flex-1">An opulent sanctuary suspended in the sky. Featuring panoramic city and ocean views, a private infinity plunge pool, and a dedicated 24-hour butler.</p>
                <p className="text-primary font-medium mb-6">From $2,500 / night</p>
                <Link href="/rooms/presidential-penthouse" className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors w-full md:w-auto h-12 md:h-auto flex items-center justify-center">
                  Discover More
                </Link>
              </div>
            </motion.div>

            {/* Suite 2 */}
            <motion.div variants={fadeInUp} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="h-72 overflow-hidden relative shrink-0">
                <Image src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" alt="Ocean View Villa" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-8 text-center border border-t-0 border-zinc-100 flex flex-col flex-1">
                <h4 className="text-2xl font-serif text-zinc-900 mb-2">Ocean View Villa</h4>
                <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">90 sq.m | Up to 2 Guests</p>
                <p className="text-zinc-500 text-sm mb-6 flex-1">Awaken to the gentle sound of waves and breathtaking azure horizons. This expansive suite offers a private wraparound balcony and deep soaking tub.</p>
                <p className="text-primary font-medium mb-6">From $1,200 / night</p>
                <Link href="/rooms/ocean-view-villa" className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors w-full md:w-auto h-12 md:h-auto flex items-center justify-center">
                  Discover More
                </Link>
              </div>
            </motion.div>

            {/* Suite 3 */}
            <motion.div variants={fadeInUp} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="h-72 overflow-hidden relative shrink-0">
                <Image src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80" alt="Royal Suite" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-8 text-center border border-t-0 border-zinc-100 flex flex-col flex-1">
                <h4 className="text-2xl font-serif text-zinc-900 mb-2">The Royal Suite</h4>
                <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">150 sq.m | Up to 6 Guests</p>
                <p className="text-zinc-500 text-sm mb-6 flex-1">A secluded haven designed for ultimate privacy and exclusivity. Nestled in lush tropical gardens with a private courtyard and heated pool.</p>
                <p className="text-primary font-medium mb-6">From $1,800 / night</p>
                <Link href="/rooms/royal-suite" className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors w-full md:w-auto h-12 md:h-auto flex items-center justify-center">
                  Discover More
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bespoke Experiences */}
      <section className="py-16 md:py-24 lg:py-32 bg-stone-50 border-y border-zinc-100">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-widest text-primary mb-4 font-medium">Bespoke Experiences</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-zinc-900 mb-8">The Pinnacle of Elegance</h3>
          </motion.div>

          <div className="space-y-24">
            {amenities.map((amenity, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={amenity.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-1/2"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl relative">
                      <Image src={amenity.imageUrl} alt={amenity.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 50vw" />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className={`w-full lg:w-1/2 space-y-6 text-center lg:text-left ${!isEven ? 'lg:pl-12' : ''}`}
                  >
                    <h4 className="text-3xl md:text-4xl font-serif text-zinc-900">{amenity.title}</h4>
                    <p className="text-zinc-500 leading-relaxed text-base md:text-lg">
                      {amenity.description}
                    </p>
                    {amenity.title.toLowerCase().includes('chauffeur') && (
                      <div className="pt-2">
                        <Link href="/transport" className="border border-zinc-300 text-zinc-700 px-8 py-3 rounded uppercase text-sm tracking-widest font-semibold hover:bg-zinc-900 hover:text-white transition-colors inline-block">
                          Book Transport
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
            {amenities.length === 0 && (
              <div className="flex justify-center items-center h-32">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </section>


    </div>
  );
}
