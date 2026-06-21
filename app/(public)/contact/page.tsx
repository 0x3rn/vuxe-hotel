"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
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

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again.');
      }

      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white text-zinc-900 pb-0">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[40vh] md:h-[50vh] w-full flex flex-col items-center justify-center pt-24 md:pt-0">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1551882547-ff40c0d129df?auto=format&fit=crop&w=1920&q=80"
            alt="Luxe Hotel Lobby"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="relative z-10 text-center text-white px-6 mt-16 md:mt-0"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-wide mb-4 drop-shadow-md">
            Get in Touch
          </h1>
          <p className="text-lg font-light text-zinc-200 tracking-wide max-w-xl mx-auto drop-shadow">
            We are here to assist you with reservations, special requests, and bespoke experiences.
          </p>
        </motion.div>
      </section>

      {/* 2. CONTACT CONTENT */}
      <section className="py-24 container mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 items-start gap-12 lg:gap-24"
        >
          {/* Left Column: Details */}
          <motion.div variants={fadeInUp} className="space-y-12">
            <div>
              <h2 className="text-3xl font-serif text-zinc-900 mb-6">Contact Information</h2>
              <p className="text-zinc-600 font-light leading-relaxed mb-8">
                Whether you're planning your next escape or have questions about an existing reservation, our dedicated team is at your service round the clock.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Phone size={20} />
                  <h3 className="font-serif text-xl text-zinc-900">Reservations</h3>
                </div>
                <ul className="space-y-2 text-zinc-600 font-light text-sm">
                  <li>+1 800 555 0199</li>
                  <li>reservations@luxehotel.com</li>
                  <li className="flex items-center gap-2 pt-1 text-zinc-500"><Clock size={14} /> 24/7 Support</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Mail size={20} />
                  <h3 className="font-serif text-xl text-zinc-900">Concierge</h3>
                </div>
                <ul className="space-y-2 text-zinc-600 font-light text-sm">
                  <li>+1 800 555 0200</li>
                  <li>concierge@luxehotel.com</li>
                  <li className="flex items-center gap-2 pt-1 text-zinc-500"><Clock size={14} /> 8AM - 10PM Daily</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-100">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif text-xl text-zinc-900 mb-2">Location</h3>
                  <p className="text-zinc-600 font-light text-sm leading-relaxed mb-4">
                    1 Riviera Way<br />
                    Malé, Maldives 20000
                  </p>
                  <a href="#" className="inline-block border-b border-primary text-primary hover:text-zinc-900 hover:border-zinc-900 transition-colors pb-1 text-sm uppercase tracking-widest font-semibold">
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div variants={fadeInUp} className="bg-stone-50 p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden">
            <h2 className="text-2xl font-serif text-zinc-900 mb-8">Send an Inquiry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    required 
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 px-4 py-3 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    required 
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 px-4 py-3 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  disabled={isSubmitting || isSuccess}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 px-4 py-3 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold">Subject</label>
                <select 
                  id="subject" 
                  name="subject" 
                  disabled={isSubmitting || isSuccess}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 px-4 py-3 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Room Reservation">Room Reservation</option>
                  <option value="Dining Reservation">Dining Reservation</option>
                  <option value="Special Event">Special Event / Wedding</option>
                  <option value="Concierge Request">Concierge Request</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  required 
                  disabled={isSubmitting || isSuccess}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 px-4 py-3 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none disabled:opacity-50"
                ></textarea>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded uppercase text-sm tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : isSuccess ? 'Message Sent' : 'Send Message'}
                {!isSubmitting && !isSuccess && <Send size={16} />}
              </button>
            </form>

            {/* Success Overlay */}
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-stone-50/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle className="text-primary w-16 h-16 mb-4 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-serif text-zinc-900 mb-2">Thank You</h3>
                <p className="text-zinc-600 font-light">
                  Your inquiry has been received. Our concierge team will reach out to you shortly.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
