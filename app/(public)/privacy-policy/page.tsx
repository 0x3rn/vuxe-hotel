import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-serif text-zinc-900 mb-4">Privacy Policy</h1>
        <p className="text-zinc-500 mb-12 uppercase tracking-widest text-sm">Last Updated: June 20, 2026</p>
        
        <div className="text-zinc-600 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to Luxe Hotel. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our 
              website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">2. The Data We Collect About You</h2>
            <p className="mb-4">
              Personal data, or personal information, means any information about an individual from which that person can be identified. 
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, and title.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via our payment partners).</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
              <li><strong>Profile Data</strong> includes your preferences, feedback, and survey responses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">3. How We Use Your Personal Data</h2>
            <p className="mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., managing your reservation).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
              used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data 
              to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-zinc-900 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact our Data Privacy Manager in the following ways:
            </p>
            <p className="mt-4">
              Email address: privacy@luxehotel.com<br />
              Postal address: 1 Riviera Way, Maldives
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
