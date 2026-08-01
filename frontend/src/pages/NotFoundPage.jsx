import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-eagle-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-soft-gold/5 blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center animate-fade-in relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="text-[120px] sm:text-[160px] font-heading font-black leading-none text-gradient tracking-tight select-none">
              404
            </div>
          </div>
          <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-eagle-gold/50 to-transparent mb-8" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-frost mb-4 leading-tight">
            Page Not Found
          </h1>
          <p className="text-warm-silver text-base sm:text-lg font-ui leading-relaxed max-w-md mx-auto">
            The page you're looking for doesn't exist, has been moved, or is no longer available.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button as={Link} to="/" icon={Home}>
            Back to Home
          </Button>
          <Button as={Link} to="/" variant="secondary" icon={ArrowLeft} onClick={() => typeof window !== 'undefined' && window.history.length > 1 && window.history.back()}>
            Go Back
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-glass-border max-w-sm mx-auto">
          <p className="text-old-silver text-sm font-ui">
            Need help? Contact us at{' '}
            <Link to="/#contact" className="text-eagle-gold hover:text-soft-gold transition-colors underline-offset-4 hover:underline">
              support@eagleshop.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
