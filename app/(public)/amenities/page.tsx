"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function AmenitiesPage() {
  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-zinc-900 mb-4">Bespoke Experiences</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Discover a world of unparalleled luxury where every detail is meticulously curated to elevate your stay beyond the ordinary.
          </p>
        </div>

          <div className="space-y-24 md:space-y-32">
            {/* Row 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl relative">
                  <Image src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" alt="Michelin-Star Dining" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 space-y-6 text-center lg:text-left"
              >
                <h4 className="text-3xl md:text-4xl font-serif text-zinc-900">Michelin-Star Dining</h4>
                <p className="text-zinc-500 leading-relaxed text-base md:text-lg">
                  Embark on a culinary journey orchestrated by our world-renowned executive chefs. Savor exquisite dishes crafted from locally sourced, seasonal ingredients, perfectly paired with selections from our award-winning wine cellar.
                </p>
              </motion.div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl relative">
                  <Image src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80" alt="Award-Winning Spa" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 space-y-6 text-center lg:text-left lg:pl-12"
              >
                <h4 className="text-3xl md:text-4xl font-serif text-zinc-900">Award-Winning Spa & Wellness</h4>
                <p className="text-zinc-500 leading-relaxed text-base md:text-lg">
                  Restore balance to your mind, body, and spirit in our holistic wellness sanctuary. Experience personalized treatments drawing upon ancient traditions, utilizing pure, organic botanical extracts to rejuvenate your senses.
                </p>
              </motion.div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl relative">
                  <Image src="https://images.unsplash.com/photo-1631262562473-b3bc7f92b7eb?auto=format&fit=crop&w=800&q=80" alt="Private Chauffeur & Heli-pad" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 space-y-6 text-center lg:text-left"
              >
                <h4 className="text-3xl md:text-4xl font-serif text-zinc-900">Private Chauffeur & Heli-pad</h4>
                <p className="text-zinc-500 leading-relaxed text-base md:text-lg">
                  Arrive in style and absolute privacy. From our fleet of luxury vehicles and dedicated chauffeurs to our exclusive helipad, your seamless journey to paradise begins the moment you touch down.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
    </div>
  );
}
