import { Loader2 } from 'lucide-react';

export default function Spinner({ text = 'Loading...', size = 32, className = '' }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 ${className}`.trim()}>
      <Loader2 size={size} className="text-eagle-gold animate-spin" strokeWidth={2} />
      {text && (
        <p className="text-warm-silver text-sm font-ui animate-pulse tracking-wide">{text}</p>
      )}
    </div>
  );
}
