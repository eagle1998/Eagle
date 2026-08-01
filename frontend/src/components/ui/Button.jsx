import { Loader2 } from 'lucide-react';

const variantClass = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizeClass = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  children,
  className = '',
  type = 'button',
  as: Tag,
  ...props
}) {
  const classes = `btn ${variantClass[variant] || variantClass.primary} ${sizeClass[size] || sizeClass.md} ${className}`.trim();
  const isDisabled = disabled || loading;
  const iconSize = size === 'sm' ? 14 : 16;
  const IconToShow = loading ? Loader2 : Icon;

  const commonProps = {
    className: classes,
    disabled: Tag ? undefined : isDisabled,
    'aria-disabled': isDisabled || undefined,
    ...props,
  };

  if (Tag) {
    return (
      <Tag {...commonProps}>
        {IconToShow && <IconToShow size={iconSize} className={loading ? 'animate-spin' : ''} />}
        {children}
      </Tag>
    );
  }

  return (
    <button type={type} {...commonProps}>
      {IconToShow && <IconToShow size={iconSize} className={loading ? 'animate-spin' : ''} />}
      {children}
    </button>
  );
}
