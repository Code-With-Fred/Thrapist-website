import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How HealMate uses cookies and similar tracking technologies.',
};

const cookieTypes = [
  {
    type: 'Essential Cookies',
    required: true,
    description: 'These cookies are necessary for the Platform to function and cannot be disabled.',
    examples: [
      { name: 'healmate-auth', purpose: 'Stores authentication state to keep you logged in', duration: 'Session' },
      { name: '__Secure-next-auth.session-token', purpose: 'Session management', duration: '7 days' },
      { name: 'csrf_token', purpose: 'Prevents cross-site request forgery attacks', duration: 'Session' },
    ],
  },
  {
    type: 'Functional Cookies',
    required: false,
    description: 'These cookies enable enhanced functionality and personalization. They may be set by us or third-party providers.',
    examples: [
      { name: 'healmate-preferences', purpose: 'Stores your preferences such as language and timezone', duration: '1 year' },
      { name: 'healmate-onboarding', purpose: 'Tracks onboarding progress so you can resume where you left off', duration: '30 days' },
    ],
  },
  {
    type: 'Analytics Cookies',
    required: false,
    description: 'These cookies help us understand how visitors interact with the Platform, allowing us to improve the user experience. All data is anonymized.',
    examples: [
      { name: '_ga', purpose: 'Google Analytics — tracks page views and user sessions (anonymized)', duration: '2 years' },
      { name: '_ga_*', purpose: 'Google Analytics — session identification', duration: '2 years' },
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Cookie Policy</h1>
          <p className="text-text-secondary">Last updated: January 1, 2025</p>
          <p className="text-text-secondary mt-4">
            This Cookie Policy explains how HealMate uses cookies and similar technologies when you visit our platform.
            It explains what these technologies are, why we use them, and your rights to control their use.
          </p>
        </div>

        {/* What are cookies */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">What Are Cookies?</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Cookies are small data files placed on your device when you visit a website. They are widely used to make websites
            work efficiently and to provide information to site owners. Cookies allow us to remember your preferences, keep you
            logged in, and understand how you use our Platform so we can improve it.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed mt-3">
            Similar technologies include local storage, session storage, and pixels. We refer to all of these collectively as
            "cookies" in this policy.
          </p>
        </div>

        {/* Cookie types */}
        <div className="space-y-6 mb-8">
          {cookieTypes.map(ct => (
            <div key={ct.type} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">{ct.type}</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${ct.required ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                  {ct.required ? 'Always Active' : 'Optional'}
                </span>
              </div>
              <p className="text-text-secondary text-sm mb-4">{ct.description}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-medium text-text-primary">Cookie Name</th>
                      <th className="text-left py-2 pr-4 font-medium text-text-primary">Purpose</th>
                      <th className="text-left py-2 font-medium text-text-primary">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ct.examples.map(ex => (
                      <tr key={ex.name} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4 text-text-secondary font-mono text-xs">{ex.name}</td>
                        <td className="py-2 pr-4 text-text-secondary">{ex.purpose}</td>
                        <td className="py-2 text-text-secondary">{ex.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Third party */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Third-Party Cookies</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Some cookies are placed by third-party services that appear on our pages. We use the following third-party services
            that may set cookies:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span><strong className="text-text-primary">Stripe</strong> — Payment processing. Stripe may set cookies to detect fraudulent activity and ensure secure payments.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span><strong className="text-text-primary">Daily.co</strong> — Video session infrastructure. Daily.co may set cookies to enable video sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span><strong className="text-text-primary">Google</strong> — Google OAuth login and optional analytics. Subject to Google's Privacy Policy.</span>
            </li>
          </ul>
        </div>

        {/* Managing cookies */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            You can control and manage cookies in several ways:
          </p>
          <div className="space-y-3 text-sm text-text-secondary">
            <div>
              <p className="font-medium text-text-primary">Browser Settings</p>
              <p>Most browsers allow you to refuse or delete cookies. Visit your browser's help section for instructions. Note that disabling essential cookies may prevent the Platform from functioning properly.</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Opt-Out of Analytics</p>
              <p>You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Do Not Track</p>
              <p>We respect browser Do Not Track signals. When enabled, we will not load non-essential tracking scripts.</p>
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Updates to This Policy</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in our use of cookies or for legal and
            regulatory reasons. Please re-visit this page periodically to stay informed. If you have questions, contact us at
            privacy@healmate.app.
          </p>
        </div>
      </div>
    </div>
  );
}
