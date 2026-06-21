"use client";

import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Utensils } from 'lucide-react';

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

export default function DiningPage() {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full bg-white text-zinc-900 pb-0">
      
      {/* 1. CINEMATIC HERO */}
      <section className="relative h-[80vh] md:h-[100dvh] w-full flex flex-col items-center justify-center pt-24 md:pt-0">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1920&q=80"
            alt="French Michelin Plate"
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
          className="relative z-10 text-center text-white space-y-8 max-w-4xl px-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wide leading-tight">
            L'Étoile & The Garden Terrace
          </h1>
          <p className="text-lg md:text-xl font-light text-zinc-200 max-w-2xl mx-auto">
            A culinary journey rooted in local soil and inspired by timeless flavors.
          </p>
        </motion.div>
      </section>

      {/* 2. THE CULINARY PHILOSOPHY */}
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
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" 
                alt="Restaurant Interior" 
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
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900">Honoring the Season</h2>
            <div className="space-y-6 text-lg text-zinc-600 leading-relaxed font-light">
              <p>
                Our philosophy is simple: source the finest ingredients at the peak of their season and let their natural brilliance shine. 
              </p>
              <p>
                Through a dedicated farm-to-table approach, we partner closely with local artisan fishermen, ethical foragers, and organic growers. Every dish crafted in our kitchen is a testament to the landscape that surrounds us, transforming raw, pristine elements into unforgettable menu masterpieces.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. OUR DINING SPACES */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-6">Our Spaces</h2>
            <p className="text-zinc-500 font-light max-w-2xl mx-auto">Three distinct atmospheres, united by a singular commitment to culinary excellence.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              {
                title: "L'Étoile",
                description: "Our signature evening restaurant. Intimate candlelit tables, curated multi-course tasting menus, and rare vintage pairings.",
                image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "The Lounge & Bar",
                description: "An elegant evening escape. Handcrafted botanical cocktails, rare single malts, and low-tempo vinyl records.",
                image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "The Garden Terrace",
                description: "Sunlit breakfasts and afternoon high tea. Surrounded by climbing jasmine and historical stone architecture.",
                image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
              }
            ].map((space, i) => (
              <motion.div key={i} variants={fadeInUp} className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={space.image} alt={space.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8 text-center flex flex-col flex-1 border border-t-0 border-stone-100">
                  <h3 className="text-2xl font-serif text-zinc-900 mb-4">{space.title}</h3>
                  <p className="text-zinc-500 text-sm font-light leading-relaxed flex-1">{space.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. SAMPLE MENU */}
      <section className="py-24 md:py-32 container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <h2 className="text-sm uppercase tracking-widest text-zinc-400 font-medium mb-4">L'Étoile Tasting</h2>
          <h3 className="text-4xl font-serif text-zinc-900">Sample Menu</h3>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12"
        >
          {/* Starters */}
          <div className="space-y-10">
            <h4 className="text-xl font-serif border-b border-zinc-200 pb-4 mb-8">Première</h4>
            {[
              { name: "Heritage Beetroot Tartare", desc: "with goat's curd, pickled mustard seeds, and rye crisps", price: "24" },
              { name: "Hand-Dived Scallops", desc: "seared with cauliflower purée, caper brown butter, and sea herbs", price: "32" },
              { name: "Wild Mushroom Consommé", desc: "truffle dumplings, fresh thyme, and gold leaf", price: "28" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex justify-between items-baseline gap-4">
                <div>
                  <h5 className="font-serif text-lg text-zinc-900">{item.name}</h5>
                  <p className="text-sm text-zinc-500 font-light mt-1 italic">{item.desc}</p>
                </div>
                <div className="font-serif text-lg text-zinc-900">${item.price}</div>
              </motion.div>
            ))}
          </div>

          {/* Mains */}
          <div className="space-y-10">
            <h4 className="text-xl font-serif border-b border-zinc-200 pb-4 mb-8">Plat Principal</h4>
            {[
              { name: "Crisp Duck Breast", desc: "with wild honey glaze, endive tart, and dark cherry jus", price: "48" },
              { name: "Line-Caught Halibut", desc: "saffron beurre blanc, braised fennel, and fingerling potatoes", price: "45" },
              { name: "Aged Wagyu Ribeye", desc: "smoked bone marrow, confit garlic, and pomme purée", price: "75" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex justify-between items-baseline gap-4">
                <div>
                  <h5 className="font-serif text-lg text-zinc-900">{item.name}</h5>
                  <p className="text-sm text-zinc-500 font-light mt-1 italic">{item.desc}</p>
                </div>
                <div className="font-serif text-lg text-zinc-900">${item.price}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 bg-zinc-950 text-center px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-white">Join Us at the Table</h2>
          <p className="text-zinc-400 font-light">
            We invite you to experience the passion and artistry of our culinary team. Reservations are highly recommended.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => setIsReservationModalOpen(true)}
              className="border border-primary text-primary px-10 py-4 rounded-full uppercase text-sm tracking-widest font-medium hover:bg-primary hover:text-primary-foreground transition-colors inline-block"
            >
              Book a Table
            </button>
          </div>
        </motion.div>
      </section>

      {/* RESERVATION MODAL */}
      <AnimatePresence>
        {isReservationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReservationModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center"
            >
              <button 
                onClick={() => setIsReservationModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X size={24} />
              </button>
              
              <Utensils className="w-12 h-12 text-primary mx-auto mb-6 stroke-1" />
              <h3 className="text-3xl font-serif text-zinc-900 mb-4">Make a Reservation</h3>
              <p className="text-zinc-600 font-light leading-relaxed mb-8">
                For restaurant bookings, please contact our concierge at <a href="mailto:dining@luxehotel.com" className="text-primary hover:underline">dining@luxehotel.com</a> or call <a href="tel:+18005550199" className="text-primary hover:underline">+1 800 555 0199</a>.
              </p>
              
              <button 
                onClick={() => setIsReservationModalOpen(false)}
                className="bg-zinc-900 text-white w-full py-4 rounded-full uppercase text-sm tracking-widest font-medium hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
