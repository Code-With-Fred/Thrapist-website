import Link from 'next/link';
import { Brain, Twitter, Instagram, Linkedin, Facebook, Shield, Lock } from 'lucide-react';

const footerLinks = {
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/join-as-therapist', label: 'For Therapists' },
    { href: '/contact', label: 'Contact' },
  ],
  Therapy: [
    { href: '/therapists', label: 'Find a Therapist' },
    { href: '/therapy/individual', label: 'Individual Therapy' },
    { href: '/therapy/couples', label: 'Couples Therapy' },
    { href: '/assessment', label: 'Get Matched' },
  ],
  Support: [
    { href: '/faqs', label: 'FAQs' },
    { href: '/contact', label: 'Help Center' },
    { href: '/emergency', label: 'Crisis Support' },
    { href: '/gift-card', label: 'Gift Cards' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/hipaa', label: 'HIPAA Notice' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">HealMate</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Connecting people with licensed therapists for better mental health. Your journey to wellness starts here.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-slate-800 mt-12 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h4 className="font-semibold text-white mb-1">Stay updated</h4>
              <p className="text-slate-400 text-sm">Get mental health tips and platform updates.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary" />
              <button className="px-4 py-2 bg-primary rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} HealMate. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Shield className="w-4 h-4 text-success" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Lock className="w-4 h-4 text-success" />
              <span>256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
