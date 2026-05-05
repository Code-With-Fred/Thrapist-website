import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HIPAA Notice of Privacy Practices',
  description: 'HealMate\'s HIPAA Notice of Privacy Practices — how we protect your health information.',
};

export default function HipaaPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            HIPAA Compliant
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Notice of Privacy Practices</h1>
          <p className="text-text-secondary">Effective Date: January 1, 2025</p>
          <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <p className="text-sm text-primary font-medium">
              THIS NOTICE DESCRIBES HOW MEDICAL AND MENTAL HEALTH INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED,
              AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Who This Notice Applies To</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              This Notice of Privacy Practices applies to HealMate and the licensed mental health professionals who provide
              services through the HealMate platform. Licensed therapists on HealMate are independently responsible for
              their own HIPAA compliance, and this Notice describes our platform-level practices.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Our Responsibilities</h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">We are required by law to:</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              {[
                'Maintain the privacy and security of your protected health information (PHI)',
                'Provide you with this Notice of our legal duties and privacy practices',
                'Follow the terms of this Notice',
                'Notify you if there is a breach of your unsecured PHI',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">How We May Use and Disclose Your PHI</h2>
            <div className="space-y-4 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary">Treatment</p>
                <p>We may share your PHI with your treating therapist and other healthcare providers involved in your care. For example, we may share your assessment results with your matched therapist.</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">Payment</p>
                <p>We may use and disclose your PHI to process payments for therapy services, including billing your insurance or processing credit card payments.</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">Healthcare Operations</p>
                <p>We may use your PHI for quality assessment, training, and improving our matching algorithms. All such uses are based on anonymized or de-identified data where possible.</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">Required by Law</p>
                <p>We may disclose your PHI when required by federal, state, or local law, including mandatory reporting requirements (such as imminent danger to self or others, child abuse, or elder abuse).</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">With Your Authorization</p>
                <p>Other uses and disclosures require your written authorization. You may revoke any authorization at any time in writing, except where we have already relied on that authorization.</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Your Rights Regarding Your PHI</h2>
            <div className="space-y-4 text-sm text-text-secondary">
              {[
                {
                  right: 'Right to Access',
                  desc: 'You have the right to request access to your PHI maintained by HealMate. You may request a copy in a standard electronic format.',
                },
                {
                  right: 'Right to Amendment',
                  desc: 'If you believe PHI we have about you is incorrect or incomplete, you may request that we amend it.',
                },
                {
                  right: 'Right to an Accounting of Disclosures',
                  desc: 'You may request a list of disclosures we have made of your PHI in the past 6 years, except for disclosures for treatment, payment, and healthcare operations.',
                },
                {
                  right: 'Right to Restrict',
                  desc: 'You may request that we restrict how we use or disclose your PHI. We are not required to agree to your request, except in limited circumstances.',
                },
                {
                  right: 'Right to Confidential Communications',
                  desc: 'You may request that we communicate with you about PHI in a specific way or at a specific location.',
                },
                {
                  right: 'Right to a Paper Copy of This Notice',
                  desc: 'You have the right to receive a paper copy of this Notice upon request, even if you agreed to receive it electronically.',
                },
              ].map(item => (
                <div key={item.right}>
                  <p className="font-medium text-text-primary">{item.right}</p>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">How to Exercise Your Rights</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              To exercise any of your rights described in this Notice, please submit a written request to our Privacy Officer:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-text-secondary space-y-1">
              <p><strong className="text-text-primary">Privacy Officer, HealMate Inc.</strong></p>
              <p>Email: privacy@healmate.app</p>
              <p>Subject line: "HIPAA Privacy Rights Request"</p>
            </div>
            <p className="text-text-secondary text-sm mt-4">
              We will respond to your request within 30 days. We may charge a reasonable, cost-based fee for copies of records.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Complaints</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              If you believe your privacy rights have been violated, you may file a complaint with HealMate or with the
              U.S. Department of Health and Human Services Office for Civil Rights. You will not be retaliated against
              for filing a complaint.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-text-secondary">
              <p><strong className="text-text-primary">HHS Office for Civil Rights:</strong></p>
              <p>200 Independence Avenue, S.W.</p>
              <p>Washington, D.C. 20201</p>
              <p>Toll Free: 1-877-696-6775</p>
              <p>Website: hhs.gov/ocr/privacy/hipaa/complaints</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Changes to This Notice</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              We reserve the right to change this Notice at any time. We will post the revised Notice on our website with
              an updated effective date. The revised Notice will apply to all PHI we maintain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
