import { useEffect } from 'react';

const widthClass = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[28rem]',
  xl: 'w-[36rem]',
};

export default function Drawer({
  isOpen,
  onClose,
  children,
  width = 'md',
  side = 'right',
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const isRight = side !== 'left';
  const translateIn = isRight ? 'translate-x-0' : 'translate-x-0';
  const translateOut = isRight ? 'translate-x-full' : '-translate-x-full';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/65 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 ${isRight ? 'right-0 rounded-l-[var(--radius-drawer)] border-l' : 'left-0 rounded-r-[var(--radius-drawer)] border-r'} h-full ${widthClass[width] || widthClass.md} max-w-[92vw] z-50 transform transition-transform duration-300 ease-out flex flex-col bg-gradient-to-b from-deep-obsidian via-deep-obsidian to-dark-wine border-glass-border shadow-2xl shadow-black/60 ${
          isOpen ? translateIn : translateOut
        }`}
      >
        {children}
      </aside>
    </>
  );
}
