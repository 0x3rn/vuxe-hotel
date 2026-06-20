"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-zinc-900 mb-4">Bespoke Experiences</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Discover a world of unparalleled luxury where every detail is meticulously curated to elevate your stay beyond the ordinary.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-24 md:space-y-32">
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
                      <div className="pt-4">
                        <Link 
                          href="/transport" 
                          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-colors"
                        >
                          Book Transport
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
