import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-serif text-zinc-900 mb-4">Terms of Service</h1>
        <p className="text-zinc-500 mb-12 uppercase tracking-widest text-sm">Last Updated: June 20, 2026</p>
        
        <div className="text-zinc-600 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf 
              of an entity ("you") and Luxe Hotel ("we", "us", or "our"), concerning your access to and use of the website 
              as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise 
              connected thereto (collectively, the "Site").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">2. Reservations and Payment</h2>
            <p className="mb-4">
              By making a reservation with Luxe Hotel, you agree to the following terms regarding bookings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All reservations are subject to availability and confirmation by the hotel.</li>
              <li>A valid credit card is required at the time of booking to secure your reservation.</li>
              <li>Your card will be charged according to the specific rate rules selected at the time of booking. Unconfirmed or unpaid holds will automatically be released after 24 hours.</li>
              <li>We reserve the right to refuse service, terminate accounts, or cancel reservations at our sole discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">3. Hotel Policies</h2>
            <p className="mb-4">
              Guests are expected to adhere to our hotel policies to ensure a pleasant stay for everyone:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Check-in time is from 3:00 PM local time. Check-out time is until 12:00 PM noon.</li>
              <li>Pets are not allowed on the premises unless explicitly approved by management in advance.</li>
              <li>Smoking is strictly prohibited in all rooms and public indoor areas. A substantial cleaning fee will be charged for violations.</li>
              <li>Guests are liable for any damage to the hotel property caused during their stay.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">4. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, 
              software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") 
              and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">5. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole 
              discretion without notice. We also reserve the right to modify or discontinue all or part of the Site without notice at any time.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
