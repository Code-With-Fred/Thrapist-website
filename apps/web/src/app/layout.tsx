import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'HealMate - Find Your Perfect Therapist', template: '%s | HealMate' },
  description: 'Connect with licensed therapists online. Find the right mental health professional for you with AI-powered matching.',
  keywords: ['therapy', 'therapist', 'mental health', 'counseling', 'online therapy'],
  openGraph: {
    type: 'website',
    siteName: 'HealMate',
    title: 'HealMate - Find Your Perfect Therapist',
    description: 'Connect with licensed therapists online.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0F172A', color: '#fff', borderRadius: '12px' } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
