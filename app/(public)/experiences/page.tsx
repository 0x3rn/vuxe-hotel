"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Experience = {
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

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const q = query(collection(db, "experiences"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const data: Experience[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Experience);
        });
        setExperiences(data);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <div className="bg-white min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-6xl font-serif text-zinc-900 mb-6">Curated Experiences</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Discover a world of unparalleled luxury where every detail is meticulously curated to elevate your stay beyond the ordinary.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-24 md:space-y-32">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                <div className="w-full lg:w-1/2 aspect-[4/3] bg-stone-100 animate-pulse rounded-lg"></div>
                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="h-8 bg-stone-100 animate-pulse rounded w-1/2"></div>
                  <div className="h-24 bg-stone-100 animate-pulse rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-24 md:space-y-32">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={exp.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-1/2"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl relative">
                      <Image src={exp.imageUrl} alt={exp.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 50vw" />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className={`w-full lg:w-1/2 space-y-6 text-center lg:text-left ${!isEven ? 'lg:pl-12' : ''}`}
                  >
                    <h4 className="text-3xl md:text-4xl font-serif text-zinc-900">{exp.title}</h4>
                    <p className="text-zinc-500 leading-relaxed font-light text-base md:text-lg">
                      {exp.description}
                    </p>
                    {exp.title.toLowerCase().includes('chauffeur') && (
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
