export default function Section({ title, titleLeft, children, className = '', id }) {
  const headingAlignment = titleLeft ? 'text-left' : 'text-center';
  return (
    <section id={id} className={`section-padding ${className}`.trim()}>
      <div className="container-x">
        {title && (
          <div className={headingAlignment}>
            <h2 className={`section-title ${headingAlignment}`.trim()}>{title}</h2>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
