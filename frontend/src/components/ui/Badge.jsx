const variantClass = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  packed: 'badge-packed',
  dispatched: 'badge-dispatched',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
  rejected: 'badge-rejected',
  alcohol: 'badge-alcohol',
  volume: 'badge-volume',
  origin: 'badge-origin',
};

export default function Badge({ variant = 'info', children, className = '', ...props }) {
  return (
    <span
      className={`badge ${variantClass[variant] || variantClass.info} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
