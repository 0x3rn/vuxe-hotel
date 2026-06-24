"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Utensils, MapPin, Sparkles, Heart, Star, X, Tag } from 'lucide-react';
import StickyBookingBar from '@/components/StickyBookingBar';
import MediaDisplay from '@/components/MediaDisplay';
import { doc, getDoc } from 'firebase/firestore';

type Room = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
};

type Experience = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

type Offer = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  mediaUrl?: string;
  discountCode?: string;
  order: number;
  isActive: boolean;
};

type GalleryImage = {
  id: string;
  imageUrl: string;
  order: number;
};

type SocialImage = {
  id: string;
  imageUrl: string;
  order: number;
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
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
  // Dynamic Data States
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  const [social, setSocial] = useState<SocialImage[]>([]);
  const [loadingSocial, setLoadingSocial] = useState(true);

  const [settings, setSettings] = useState({
    heroMediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
    heroHeadline: 'A Symphony of Luxury and Hospitality',
    heroSubheadline: 'Discover a world of elegance and unparalled service in the hearth of paradise.',
  });

  // Lightbox State
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; src: string }>({ isOpen: false, src: '' });

  // Handle escape key for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox({ isOpen: false, src: '' });
    };
    if (lightbox.isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const q = query(collection(db, "rooms"), limit(3));
        const snapshot = await getDocs(q);
        const rooms: Room[] = [];
        snapshot.forEach(doc => rooms.push({ id: doc.id, ...doc.data() } as Room));
        setFeaturedRooms(rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoadingRooms(false);
      }
    };

    const fetchExperiences = async () => {
      try {
        const q = query(collection(db, "experiences"), orderBy("order", "asc"), limit(4));
        const snapshot = await getDocs(q);
        const exps: Experience[] = [];
        snapshot.forEach(doc => exps.push({ id: doc.id, ...doc.data() } as Experience));
        setExperiences(exps);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoadingExperiences(false);
      }
    };

    const fetchOffers = async () => {
      try {
        // Fetch only active offers
        const q = query(collection(db, "offers"));
        const snapshot = await getDocs(q);
        const activeOffers: Offer[] = [];
        snapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() } as Offer;
          if (data.isActive) activeOffers.push(data);
        });
        activeOffers.sort((a, b) => a.order - b.order);
        setOffers(activeOffers.slice(0, 3)); // Only show top 3 on homepage
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoadingOffers(false);
      }
    };

    const fetchGallery = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("order", "asc"), limit(8));
        const snapshot = await getDocs(q);
        const imgs: GalleryImage[] = [];
        snapshot.forEach(doc => imgs.push({ id: doc.id, ...doc.data() } as GalleryImage));
        setGallery(imgs);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoadingGallery(false);
      }
    };

    const fetchSocial = async () => {
      try {
        const q = query(collection(db, "social"), orderBy("order", "asc"), limit(4));
        const snapshot = await getDocs(q);
        const imgs: SocialImage[] = [];
        snapshot.forEach(doc => imgs.push({ id: doc.id, ...doc.data() } as SocialImage));
        setSocial(imgs);
      } catch (error) {
        console.error("Error fetching social:", error);
      } finally {
        setLoadingSocial(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchRooms();
    fetchExperiences();
    fetchOffers();
    fetchGallery();
    fetchSocial();
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white text-zinc-900 pb-0">
      
      {/* 2. FULLSCREEN HERO */}
      <section className="relative h-[100dvh] w-full flex flex-col items-center justify-center pt-24 md:pt-0">
        <div className="absolute inset-0 z-0">
          <MediaDisplay src={settings.heroMediaUrl} alt="Hero Background" fill />
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="relative z-10 text-center text-white space-y-8 max-w-4xl px-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wide leading-tight drop-shadow-lg">
            {settings.heroHeadline}
          </h1>
          <p className="text-lg md:text-xl font-light text-zinc-200 max-w-2xl mx-auto drop-shadow">
            {settings.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/rooms" className="border border-white text-white px-8 py-4 rounded-full uppercase text-sm tracking-widest font-medium hover:bg-white hover:text-black transition-colors w-full sm:w-auto shadow-xl">
              Explore Rooms
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 3. INTRODUCTION / STORY SECTION */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/2"
          >
            <div className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" 
                alt="Welcome to Luxe" 
                fill 
                className="object-cover"
              />
            </div>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900">Welcome to Luxe</h2>
            <p className="text-lg text-zinc-600 leading-relaxed font-light">
              More than a hotel, Luxe is a carefully curated retreat created for travelers who appreciate beauty, comfort, and meaningful experiences. Every room, texture, and detail has been designed to make you feel at home while surrounded by quiet luxury.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. THE LUXE DIFFERENCE */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {[
              { icon: <Heart className="w-8 h-8 text-primary mb-6 stroke-1" />, title: "Personalized Service", text: "Every stay tailored to your preferences." },
              { icon: <Sparkles className="w-8 h-8 text-primary mb-6 stroke-1" />, title: "Thoughtful Design", text: "Inspired interiors crafted for comfort." },
              { icon: <Utensils className="w-8 h-8 text-primary mb-6 stroke-1" />, title: "Exceptional Dining", text: "Locally inspired cuisine made with care." },
              { icon: <MapPin className="w-8 h-8 text-primary mb-6 stroke-1" />, title: "Prime Location", text: "Moments away from the city's finest attractions." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center text-center">
                {item.icon}
                <h3 className="text-xl font-serif mb-3">{item.title}</h3>
                <p className="text-zinc-500 font-light text-sm tracking-wide leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. SIGNATURE ROOMS */}
      <section className="py-24 md:py-32 container mx-auto px-6" id="rooms">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-6">Rooms & Suites</h2>
          <p className="text-zinc-500 font-light">Intimate spaces designed for the modern traveler.</p>
        </motion.div>

        {loadingRooms ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-lg h-[500px]"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10"
          >
            {featuredRooms.map(room => (
              <motion.div key={room.id} variants={fadeInUp} className="group relative flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg mb-6 shadow-sm">
                  <Image 
                    src={room.imageUrl} 
                    alt={room.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <h3 className="text-2xl font-serif mb-2">{room.name}</h3>
                <p className="text-zinc-500 text-sm font-light mb-4 line-clamp-2">{room.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-primary font-medium">${room.pricePerNight} <span className="text-zinc-400 font-light text-sm">/ night</span></span>
                  <Link href={`/rooms/${room.id}`} className="text-sm uppercase tracking-widest font-medium hover:text-primary transition-colors">
                    Explore
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 5.5 SPECIAL OFFERS SECTION */}
      {(!loadingOffers && offers.length > 0) && (
        <section className="py-24 bg-zinc-900 text-white border-y border-zinc-800" id="offers">
          <div className="container mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-wide">Exclusive Offers</h2>
              <p className="text-zinc-400 font-light text-lg">Elevate your experience with our curated seasonal privileges.</p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {offers.map((offer) => (
                <motion.div key={offer.id} variants={fadeInUp} className="bg-zinc-800/50 rounded-xl overflow-hidden flex flex-col group border border-zinc-800 hover:border-zinc-600 transition-colors">
                  <div className="relative h-64 overflow-hidden">
                    <MediaDisplay src={offer.mediaUrl || offer.imageUrl || ''} alt={offer.title} fill />
                  </div>
                  <div className="p-8 flex-1 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-serif mb-4 text-amber-500/90">{offer.title}</h3>
                    <p className="text-zinc-300 font-light text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">{offer.description}</p>
                    <Link href="/rooms" className="inline-block border-b border-zinc-500 pb-1 text-zinc-300 uppercase text-xs tracking-[0.2em] font-medium hover:text-white hover:border-white transition-colors mt-auto">
                      Discover More
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* 6. LIFESTYLE SHOWCASE SECTION */}
      <section className="relative h-[70vh] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1920&q=80"
            alt="Lifestyle Showcase"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30 z-10" />
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-20 text-center text-white px-6 max-w-3xl"
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-6 tracking-wide leading-tight drop-shadow-md">
            Quiet Luxury, Thoughtfully Experienced
          </h2>
          <p className="text-lg md:text-xl font-light text-zinc-100 drop-shadow">
            Unwind in an environment where serenity meets impeccable taste.
          </p>
        </motion.div>
      </section>

      {/* 7. DINING EXPERIENCE */}
      <section className="py-24 md:py-32 container mx-auto px-6" id="experience">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/2"
          >
            <div className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" 
                alt="Culinary Experience" 
                fill 
                className="object-cover"
              />
            </div>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900">A Culinary Experience</h2>
            <p className="text-lg text-zinc-600 leading-relaxed font-light">
              From artisan breakfasts to intimate dinners, our restaurant celebrates local ingredients and timeless flavors.
            </p>
            <Link href="/dining" className="inline-block border border-zinc-900 text-zinc-900 px-8 py-4 rounded-full uppercase text-sm tracking-widest font-medium hover:bg-zinc-900 hover:text-white transition-colors">
              Discover Dining
            </Link>
          </motion.div>
        </div>
      </section>



      {/* 8. GUEST EXPERIENCE SECTION (Dynamic) */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-6">Curated Experiences</h2>
          </motion.div>
          
          {loadingExperiences ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-stone-200 rounded-lg h-[400px]"></div>
              ))}
            </div>
          ) : experiences.length > 0 ? (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              {experiences.map((exp) => (
                <motion.div key={exp.id} variants={fadeInUp} className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={exp.imageUrl} alt={exp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-8 text-center flex flex-col flex-1 border border-t-0 border-stone-100">
                    <h3 className="text-2xl font-serif text-zinc-900 mb-4">{exp.title}</h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed mb-6 flex-1">{exp.description}</p>
                    {exp.title.toLowerCase().includes('chauffeur') && (
                      <div className="pt-2">
                        <Link href="/transport" className="text-primary uppercase text-xs tracking-widest font-semibold hover:text-zinc-900 transition-colors">
                          Book Transport
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-zinc-500 py-12">Experiences coming soon.</div>
          )}
        </div>
      </section>

      {/* 9. TESTIMONIAL SECTION */}
      <section className="py-32 container mx-auto px-6 text-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto space-y-10"
        >
          <h2 className="text-sm uppercase tracking-widest text-zinc-400 font-medium">Loved by Our Guests</h2>
          <blockquote className="text-3xl md:text-4xl font-serif leading-relaxed text-zinc-900">
            "One of the most beautiful boutique hotels we've stayed in. Every detail felt intentional."
          </blockquote>
          <div className="flex justify-center gap-2 text-primary">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-current" />)}
          </div>
        </motion.div>
      </section>

      {/* 10. IMAGE GALLERY (True Masonry) */}
      <section className="py-24 bg-stone-50" id="gallery">
        <div className="container mx-auto px-6">
          {loadingGallery ? (
            <div className="flex md:block md:columns-2 lg:columns-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none gap-4 pb-6 md:pb-0 scroll-smooth px-6 md:px-0 -mx-6 md:mx-0 py-8 md:py-0 items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                const staggerClass = i % 2 === 0 ? '-translate-y-6 md:translate-y-0' : 'translate-y-6 md:translate-y-0';
                return (
                  <div key={i} className={`animate-pulse bg-stone-200 rounded-lg shrink-0 w-[280px] md:w-full snap-center md:snap-none break-inside-avoid mb-4 ${i % 3 === 0 ? 'md:aspect-[3/4]' : i % 2 === 0 ? 'md:aspect-[4/3]' : 'md:aspect-square'} aspect-[3/4] ${staggerClass}`}></div>
                );
              })}
            </div>
          ) : gallery.length > 0 ? (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex md:block md:columns-2 lg:columns-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none gap-4 pb-6 md:pb-0 scroll-smooth px-6 md:px-0 -mx-6 md:mx-0 py-8 md:py-0 items-center"
            >
              {gallery.map((img, i) => {
                const aspectRatioClass = i % 3 === 0 ? 'md:aspect-[3/4]' : i % 2 === 0 ? 'md:aspect-[4/3]' : 'md:aspect-square';
                const staggerClass = i % 2 !== 0 ? '-translate-y-6 md:translate-y-0' : 'translate-y-6 md:translate-y-0';
                return (
                  <motion.div 
                    key={img.id} 
                    variants={fadeIn} 
                    onClick={() => setLightbox({ isOpen: true, src: img.imageUrl })}
                    className={`shrink-0 w-[280px] md:w-full snap-center md:snap-none break-inside-avoid relative rounded-xl overflow-hidden group mb-4 cursor-pointer shadow-lg md:shadow-none aspect-[3/4] ${aspectRatioClass} ${staggerClass}`}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <MediaDisplay src={img.imageUrl} alt="Gallery Image" fill />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700 pointer-events-none" />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* 11. LOCATION & NEIGHBORHOOD */}
      <section className="py-24 md:py-32 container mx-auto px-6" id="location">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900">Perfectly Positioned</h2>
            <p className="text-lg text-zinc-600 leading-relaxed font-light">
              Nestled in the city's most vibrant district, Luxe places you steps away from renowned restaurants, cultural landmarks, and hidden local gems.
            </p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/2"
          >
            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" 
                alt="Map Location" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 12. INSTAGRAM / SOCIAL PROOF SECTION (Asymmetrical Collage) */}
      <section className="py-24 md:py-32 border-t border-stone-200 overflow-hidden bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="w-full lg:w-1/3 text-center lg:text-left"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-4">Life at Luxe</h2>
              <p className="text-zinc-500 font-light tracking-wide uppercase text-sm mb-8">@LuxeHotel</p>
              <p className="text-lg text-zinc-600 font-light leading-relaxed">
                Follow our journey and discover the quiet moments, exquisite details, and unforgettable experiences that define a stay at Luxe.
              </p>
            </motion.div>
            
            <div className="w-full lg:w-2/3 relative h-[350px] sm:h-[600px] flex items-center justify-center mt-6 lg:mt-0">
              {loadingSocial ? (
                <div className="animate-pulse bg-stone-200 w-full max-w-lg h-[400px] rounded-xl"></div>
              ) : social.length > 0 ? (
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="relative w-full max-w-2xl h-full flex items-center justify-center"
                >
                  {social.map((post, i) => {
                    let transformClass = '';
                    let zIndexClass = '';
                    
                    if (i === 0) {
                      transformClass = '-translate-x-1/2 -translate-y-8 -rotate-6';
                      zIndexClass = 'z-10';
                    } else if (i === 1) {
                      transformClass = 'translate-x-1/2 -translate-y-16 rotate-3';
                      zIndexClass = 'z-20';
                    } else if (i === 2) {
                      transformClass = '-translate-x-12 translate-y-24 rotate-2';
                      zIndexClass = 'z-30';
                    } else if (i === 3) {
                      transformClass = 'translate-x-24 translate-y-12 -rotate-3';
                      zIndexClass = 'z-40';
                    } else {
                      transformClass = 'hidden';
                    }

                    if (i > 3) return null;

                    return (
                      <motion.div 
                        key={post.id} 
                        variants={fadeIn} 
                        className={`absolute w-40 sm:w-56 aspect-[4/5] ${transformClass} ${zIndexClass}`}
                      >
                        <div 
                          onClick={() => setLightbox({ isOpen: true, src: post.imageUrl })}
                          className="w-full h-full relative rounded-xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer group hover:scale-105 hover:!z-50"
                        >
                          <div className="absolute inset-0 pointer-events-none">
                            <MediaDisplay src={post.imageUrl} alt="Social Feed" fill />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                            <Heart className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 drop-shadow-md" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 13. FINAL CTA */}
      <section className="relative py-32 md:py-48 flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80"
            alt="Reserve Your Stay"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-20 max-w-3xl space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
            Your Escape Awaits. Experience a stay defined by comfort, character, and exceptional hospitality.
          </h2>
          <div className="pt-8">
            <Link href="/rooms" className="bg-primary text-primary-foreground px-10 py-5 rounded-full uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors inline-block shadow-xl">
              Reserve Your Stay
            </Link>
          </div>
        </motion.div>
      </section>

      <StickyBookingBar />

      {/* 14. GLOBAL LIGHTBOX */}
      <AnimatePresence>
        {lightbox.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox({ isOpen: false, src: '' })}
              className="absolute inset-0"
            />
            <button 
              onClick={() => setLightbox({ isOpen: false, src: '' })}
              className="absolute top-6 right-6 z-50 text-white/70 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full"
            >
              <X size={24} />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[85%] h-[70vh] md:max-w-4xl md:h-[85vh] rounded-2xl overflow-hidden shadow-2xl pointer-events-none bg-zinc-900 flex items-center justify-center"
            >
              <div className="w-full h-full relative pointer-events-auto">
                <MediaDisplay src={lightbox.src} alt="Fullscreen View" fill />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
