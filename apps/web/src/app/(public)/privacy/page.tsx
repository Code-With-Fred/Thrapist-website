import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How HealMate collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, complete our therapist matching assessment, book a session, or contact us for support.

**Account Information:** Name, email address, password, profile photo, date of birth, and role (client or therapist).

**Profile Information:** For clients — concerns, therapy preferences, and insurance information. For therapists — credentials, licenses, specialties, education, years of experience, and session rates.

**Payment Information:** Credit/debit card details processed securely by Stripe. We do not store full card numbers.

**Communications:** Messages sent through our platform, session notes, and support tickets.

**Usage Data:** Pages visited, features used, session duration, and device/browser information collected automatically.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

- Provide, maintain, and improve our services
- Match clients with appropriate therapists based on needs and preferences
- Process payments and send transaction receipts
- Send appointment reminders and platform notifications
- Respond to comments and questions
- Monitor and analyze usage patterns to improve the platform
- Detect and prevent fraudulent or abusive activity
- Comply with legal obligations`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell your personal information. We share information only in the following circumstances:

**With Therapists:** When you book a session, we share your name, contact information, and relevant profile details with your chosen therapist.

**With Service Providers:** We work with trusted third-party vendors (Stripe for payments, Daily.co for video sessions, Resend for email, Cloudinary for file storage) who process data on our behalf under strict confidentiality agreements.

**For Legal Reasons:** We may disclose information when required by law, court order, or to protect the rights, property, or safety of HealMate, our users, or others.

**Business Transfers:** If HealMate is acquired or merges with another company, your information may be transferred as part of that transaction.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your information:

- All data transmitted over HTTPS/TLS encryption
- Passwords hashed using bcrypt with a cost factor of 12
- JWT tokens with short expiry (15 minutes for access tokens)
- Database access restricted to authorized personnel only
- Regular security audits and penetration testing
- Video sessions conducted via encrypted Daily.co infrastructure

Despite these measures, no security system is impenetrable. We encourage you to use a strong, unique password and to contact us immediately if you suspect unauthorized access to your account.`,
  },
  {
    title: '5. Health Information',
    content: `HealMate is committed to protecting your health and mental health information. Therapists on our platform are bound by their professional ethical obligations and applicable laws regarding client confidentiality (including HIPAA where applicable).

Session content between you and your therapist is confidential. HealMate staff do not have access to session content. We only access aggregated, anonymized data for platform improvement purposes.`,
  },
  {
    title: '6. Cookies and Tracking',
    content: `We use cookies and similar tracking technologies to:

- Keep you logged in between sessions
- Remember your preferences
- Analyze platform usage through anonymous analytics

You can control cookies through your browser settings. Disabling cookies may limit some platform functionality. We do not use third-party advertising cookies.`,
  },
  {
    title: '7. Your Rights',
    content: `Depending on your location, you may have the following rights regarding your personal data:

- **Access:** Request a copy of the personal data we hold about you
- **Correction:** Request correction of inaccurate or incomplete data
- **Deletion:** Request deletion of your personal data (subject to legal retention requirements)
- **Portability:** Request your data in a machine-readable format
- **Objection:** Object to certain types of processing
- **Restriction:** Request restriction of processing in certain circumstances

To exercise any of these rights, contact us at privacy@healmate.app. We will respond within 30 days.`,
  },
  {
    title: '8. Data Retention',
    content: `We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal data within 90 days, except where retention is required by law (such as financial records, which may be retained for up to 7 years).

Anonymized, aggregated data may be retained indefinitely for analytics purposes.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `HealMate is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without parental consent, we will take steps to delete that information.

For minors seeking therapy, a parent or guardian must create the account and provide consent.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of HealMate after changes become effective constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

**Email:** privacy@healmate.app
**Address:** HealMate Inc., [Address]

For GDPR-related inquiries, our Data Protection Officer can be reached at dpo@healmate.app.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-text-secondary">Last updated: January 1, 2025</p>
          <p className="text-text-secondary mt-4">
            HealMate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our mental health therapy marketplace.
          </p>
        </div>

        <div className="space-y-8">
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
