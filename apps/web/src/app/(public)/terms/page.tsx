import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the HealMate therapy marketplace.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using HealMate ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use the Platform.

These terms apply to all users of the Platform, including clients seeking therapy and licensed therapists providing services.`,
  },
  {
    title: '2. Platform Description',
    content: `HealMate is an online marketplace that connects individuals seeking mental health support ("Clients") with licensed mental health professionals ("Therapists"). HealMate is not a healthcare provider and does not provide mental health services directly.

HealMate facilitates the relationship between Clients and Therapists but is not a party to the therapeutic relationship itself.`,
  },
  {
    title: '3. User Accounts',
    content: `To use certain features of the Platform, you must create an account. You agree to:

- Provide accurate, current, and complete information during registration
- Maintain and promptly update your account information
- Keep your password confidential and not share it with others
- Notify us immediately of any unauthorized use of your account
- Be responsible for all activity that occurs under your account

You must be at least 18 years old to create an account. Accounts for minors must be created and managed by a parent or legal guardian.`,
  },
  {
    title: '4. Therapist Verification',
    content: `All therapists on HealMate are required to submit proof of licensure and credentials, which our team reviews before approval. However, HealMate does not independently verify the accuracy of all information provided by therapists and does not guarantee therapist qualifications beyond the review process.

Clients are encouraged to independently verify therapist credentials through relevant state licensing boards.`,
  },
  {
    title: '5. Booking and Cancellation',
    content: `**Booking:** Sessions are booked through the Platform and confirmed upon payment.

**Cancellations by Client:** Cancellations made more than 24 hours before the session will receive a full refund to the wallet or original payment method. Cancellations within 24 hours may be subject to a cancellation fee as determined by the therapist's policy.

**Cancellations by Therapist:** If a therapist cancels a session, the client will receive a full refund.

**No-shows:** Clients who do not attend a session without cancelling may forfeit the session fee.`,
  },
  {
    title: '6. Payments and Fees',
    content: `**Session Fees:** Session fees are set by individual therapists and are displayed on their profiles. Fees are charged at the time of booking.

**Platform Fee:** HealMate charges a 15% platform fee on all transactions. Therapists receive 85% of the session fee after the platform fee is deducted.

**Wallet:** Users may maintain a wallet balance on the Platform, which can be used to pay for sessions. Wallet funds are non-refundable except in cases where a session is cancelled by the therapist.

**Gift Cards:** Gift cards are non-refundable and cannot be exchanged for cash.

**Payment Processing:** Payments are processed by Stripe. By using the Platform, you agree to Stripe's Terms of Service.`,
  },
  {
    title: '7. Code of Conduct',
    content: `All users must:

- Treat other users, therapists, and HealMate staff with respect
- Not harass, threaten, or intimidate others
- Not use the Platform for any illegal purpose
- Not upload harmful, offensive, or inappropriate content
- Not attempt to circumvent the Platform to arrange direct payments outside HealMate
- Not impersonate any person or entity

Therapists must additionally:

- Maintain their professional licensure and adhere to applicable ethical standards
- Not engage in dual relationships with clients that could compromise the therapeutic relationship
- Maintain appropriate session notes and records as required by applicable law`,
  },
  {
    title: '8. Dating/Connection Feature',
    content: `HealMate offers an optional connection feature for platform users. By opting into this feature, you:

- Consent to your profile being shown to other opted-in users
- Understand this feature is for professional networking and peer support, not romantic solicitation
- Agree not to use this feature to solicit clients or to engage in inappropriate behavior
- Understand that HealMate is not a dating service and accepts no responsibility for interactions outside the Platform

HealMate reserves the right to suspend or remove any user from the connection feature for violations of these terms.`,
  },
  {
    title: '9. Emergency Situations',
    content: `HealMate is NOT an emergency service. If you are in crisis or believe you may harm yourself or others, please contact:

- **Emergency Services:** Call 911 (US) or your local emergency number
- **988 Suicide and Crisis Lifeline:** Call or text 988
- **Crisis Text Line:** Text HOME to 741741

Do not rely on HealMate for emergency mental health support.`,
  },
  {
    title: '10. Intellectual Property',
    content: `The Platform and its content (excluding user-generated content) are owned by HealMate and protected by copyright, trademark, and other intellectual property laws.

You grant HealMate a non-exclusive, royalty-free license to use, display, and distribute any content you submit to the Platform for the purpose of operating and improving the service.`,
  },
  {
    title: '11. Disclaimers',
    content: `THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. HEALMATE DOES NOT WARRANT THAT:

- The Platform will be uninterrupted or error-free
- Therapist services will meet your specific needs
- The therapeutic outcomes will be as expected

HealMate is not responsible for the quality, accuracy, or outcomes of therapy sessions conducted through the Platform.`,
  },
  {
    title: '12. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, HEALMATE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.

HealMate's total liability for any claim arising from use of the Platform shall not exceed the amount you paid to HealMate in the three months preceding the claim.`,
  },
  {
    title: '13. Termination',
    content: `HealMate may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time through your account settings.

Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination will survive.`,
  },
  {
    title: '14. Governing Law',
    content: `These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.`,
  },
  {
    title: '15. Changes to Terms',
    content: `We may update these Terms from time to time. We will provide notice of material changes via email or a prominent notice on the Platform. Continued use after changes take effect constitutes acceptance of the updated Terms.`,
  },
  {
    title: '16. Contact',
    content: `For questions about these Terms, contact us at legal@healmate.app.`,
  },
];

export default function TermsPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Terms of Service</h1>
          <p className="text-text-secondary">Last updated: January 1, 2025</p>
          <p className="text-text-secondary mt-4">
            Please read these Terms of Service carefully before using HealMate. These terms govern your use of our platform
            and form a binding agreement between you and HealMate Inc.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.title} className="card p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">{section.title}</h2>
              <div className="text-text-secondary text-sm leading-relaxed space-y-3">
                {section.content.split('\n\n').map((para, i) => (
                  <p key={i} dangerouslySetInnerHTML={{
                    __html: para
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n- /g, '<br />• ')
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
