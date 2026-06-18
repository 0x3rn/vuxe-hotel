"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center bg-stone-50 pt-24 pb-16 lg:py-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80')" }}
        >
          <div className="absolute inset-0 bg-black/50" />
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
            <input type="date" className="w-full h-12 border-b border-border focus:outline-none focus:border-primary bg-transparent text-sm" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Check Out</label>
            <input type="date" className="w-full h-12 border-b border-border focus:outline-none focus:border-primary bg-transparent text-sm" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Guests</label>
            <select className="w-full h-12 border-b border-border focus:outline-none focus:border-primary bg-transparent text-sm">
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
              <option>4+ Guests</option>
            </select>
          </div>
          <button className="bg-primary text-primary-foreground px-8 h-14 md:h-12 rounded uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors w-full md:w-auto mt-4 md:mt-0 shadow-md">
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
                <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80" alt="Presidential Penthouse" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 text-center border border-t-0 border-zinc-100 flex flex-col flex-1">
                <h4 className="text-2xl font-serif text-zinc-900 mb-2">The Presidential Penthouse</h4>
                <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">120 sq.m | Up to 4 Guests</p>
                <p className="text-zinc-500 text-sm mb-6 flex-1">An opulent sanctuary suspended in the sky. Featuring panoramic city and ocean views, a private infinity plunge pool, and a dedicated 24-hour butler.</p>
                <p className="text-primary font-medium mb-6">From $2,500 / night</p>
                <Link href="/rooms" className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors w-full md:w-auto h-12 md:h-auto flex items-center justify-center">
                  Discover More
                </Link>
              </div>
            </motion.div>

            {/* Suite 2 */}
            <motion.div variants={fadeInUp} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="h-72 overflow-hidden relative shrink-0">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" alt="Ocean View Villa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 text-center border border-t-0 border-zinc-100 flex flex-col flex-1">
                <h4 className="text-2xl font-serif text-zinc-900 mb-2">Ocean View Villa</h4>
                <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">90 sq.m | Up to 2 Guests</p>
                <p className="text-zinc-500 text-sm mb-6 flex-1">Awaken to the gentle sound of waves and breathtaking azure horizons. This expansive suite offers a private wraparound balcony and deep soaking tub.</p>
                <p className="text-primary font-medium mb-6">From $1,200 / night</p>
                <Link href="/rooms" className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors w-full md:w-auto h-12 md:h-auto flex items-center justify-center">
                  Discover More
                </Link>
              </div>
            </motion.div>

            {/* Suite 3 */}
            <motion.div variants={fadeInUp} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="h-72 overflow-hidden relative shrink-0">
                <img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80" alt="Royal Suite" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 text-center border border-t-0 border-zinc-100 flex flex-col flex-1">
                <h4 className="text-2xl font-serif text-zinc-900 mb-2">The Royal Suite</h4>
                <p className="text-xs tracking-widest text-zinc-400 uppercase mb-4">150 sq.m | Up to 6 Guests</p>
                <p className="text-zinc-500 text-sm mb-6 flex-1">A secluded haven designed for ultimate privacy and exclusivity. Nestled in lush tropical gardens with a private courtyard and heated pool.</p>
                <p className="text-primary font-medium mb-6">From $1,800 / night</p>
                <Link href="/rooms" className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors w-full md:w-auto h-12 md:h-auto flex items-center justify-center">
                  Discover More
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bespoke Experiences / Amenities */}
      <section className="py-16 md:py-24 lg:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-sm uppercase tracking-widest text-primary mb-4 font-medium">Bespoke Experiences</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-zinc-900">The Pinnacle of Elegance</h3>
          </motion.div>

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
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" alt="Michelin-Star Dining" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
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
                <a href="#dining" className="inline-block border-b border-primary text-primary uppercase text-sm tracking-widest pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-colors">
                  Explore Dining
                </a>
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
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80" alt="Award-Winning Spa" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
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
                <a href="#spa" className="inline-block border-b border-primary text-primary uppercase text-sm tracking-widest pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-colors">
                  View Treatments
                </a>
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
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl lg:shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" alt="Private Chauffeur & Heli-pad" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
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
                <a href="#transport" className="inline-block border-b border-primary text-primary uppercase text-sm tracking-widest pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-colors">
                  Arrange Transport
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
