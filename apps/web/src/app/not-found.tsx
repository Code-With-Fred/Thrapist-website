import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-100 mb-4">404</div>
        <h1 className="text-3xl font-bold text-text-primary mb-3">Page Not Found</h1>
        <p className="text-text-secondary mb-8">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/therapists" className="btn-outline">Find a Therapist</Link>
        </div>
      </div>
    </div>
  );
}
