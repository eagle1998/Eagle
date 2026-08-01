import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const styles = {
  success: {
    wrapper: 'bg-[rgba(67,233,123,0.08)] border-[rgba(67,233,123,0.25)] text-[color:var(--color-success)]',
    Icon: CheckCircle,
  },
  error: {
    wrapper: 'bg-[rgba(255,107,107,0.08)] border-[rgba(255,107,107,0.25)] text-[color:var(--color-danger)]',
    Icon: AlertCircle,
  },
  info: {
    wrapper: 'bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.25)] text-[color:var(--color-info)]',
    Icon: Info,
  },
  warning: {
    wrapper: 'bg-[rgba(255,191,0,0.08)] border-[rgba(255,191,0,0.25)] text-[color:var(--color-warning)]',
    Icon: AlertCircle,
  },
};

export default function Alert({ type = 'success', message, onDismiss, className = '' }) {
  const cfg = styles[type] || styles.info;
  const { Icon } = cfg;
  return (
    <div
      role="alert"
      className={`animate-fade-in flex items-start gap-3 border px-4 py-3.5 rounded-xl ${cfg.wrapper} ${className}`.trim()}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0 mt-0.5" />
      <span className="flex-1 font-ui text-sm leading-relaxed text-frost/90">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity hover:bg-white/5"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
