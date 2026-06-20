import React from 'react';

export default function CancellationPolicyPage() {
  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-serif text-zinc-900 mb-4">Cancellation Policy</h1>
        <p className="text-zinc-500 mb-12 uppercase tracking-widest text-sm">Last Updated: June 20, 2026</p>
        
        <div className="text-zinc-600 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">1. General Cancellation Guidelines</h2>
            <p>
              At Luxe Hotel, we understand that travel plans can change unexpectedly. We strive to provide a flexible and 
              accommodating cancellation policy for our guests, while ensuring the operational efficiency of our exclusive property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">2. Flexible & Standard Rates</h2>
            <p className="mb-4">
              For reservations booked under our Standard or Flexible rates:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancellations made <strong>72 hours or more</strong> prior to the scheduled check-in date (3:00 PM local time) will be fully refunded without penalty.</li>
              <li>Cancellations made <strong>within 72 hours</strong> of the scheduled check-in date will incur a cancellation fee equivalent to one night's room rate plus applicable taxes.</li>
              <li>No-shows will be charged the full amount of the reservation and the remaining nights will be automatically cancelled.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">3. Non-Refundable & Advanced Purchase Rates</h2>
            <p>
              Reservations booked under Advanced Purchase, Special Promotional, or Non-Refundable rates are, as the name suggests, 
              strictly non-refundable. Full payment is taken at the time of booking, and no modifications, cancellations, or refunds 
              are permitted. We highly recommend purchasing travel insurance to protect your investment in these cases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">4. 24-Hour Hold Policy</h2>
            <p>
              As part of our commitment to seamless service, we offer a complimentary 24-hour hold on pending reservations. 
              If payment details or confirmation is not finalized within this 24-hour window, our automated system will 
              release the room back into our inventory without penalty.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">5. Force Majeure</h2>
            <p>
              In the event of unforeseen circumstances outside of reasonable control (such as extreme weather events, natural disasters, 
              or sudden government travel restrictions), our management team will review cancellation requests on a case-by-case basis 
              to offer flexible rebooking options or future stay credits.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
