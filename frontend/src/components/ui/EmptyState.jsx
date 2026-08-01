import { ShoppingBag } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title,
  description,
  action,
  onAction,
  actionLabel,
  variant = 'default',
  className = '',
}) {
  const sizes = variant === 'sm' ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4';
  return (
    <div className={`text-center py-12 animate-fade-in ${className}`.trim()}>
      <div className={`${sizes} mx-auto rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-old-silver`}>
        <Icon size={variant === 'sm' ? 20 : 28} strokeWidth={1.75} />
      </div>
      <p className={`font-semibold text-frost mb-2 ${variant === 'sm' ? 'text-base' : 'text-lg'}`.trim()}>
        {title}
      </p>
      {description && (
        <p className="text-warm-silver text-sm max-w-sm mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && actionLabel && onAction && (
        <Button onClick={onAction} size={variant === 'sm' ? 'sm' : 'md'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
