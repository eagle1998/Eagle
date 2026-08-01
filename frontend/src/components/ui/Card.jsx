const variantClass = {
  glass: 'glass-card',
  product: 'product-card',
  feedback: 'feedback-card',
};

export default function Card({
  variant = 'glass',
  className = '',
  children,
  style,
  onClick,
  as: Tag = 'div',
  hoverable,
  ...props
}) {
  const classes = `${variantClass[variant] || variantClass.glass} ${className}`.trim();
  return (
    <Tag
      className={classes}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </Tag>
  );
}
