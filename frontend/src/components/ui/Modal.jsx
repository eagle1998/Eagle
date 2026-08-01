import { X } from 'lucide-react';
import { useEffect, Children, isValidElement, cloneElement } from 'react';

const sizeClass = {
  sm: '',
  md: '',
  lg: 'modal-lg',
  xl: 'modal-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  hideClose = false,
  stickyFooter = true,
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

  if (!isOpen) return null;

  let body = children;
  if (stickyFooter) {
    const arr = Children.toArray(children);
    let foundForm = null;
    for (const node of arr) {
      if (isValidElement(node) && node.type === 'form') {
        foundForm = node;
        break;
      }
    }
    if (foundForm) {
      const formChildren = Children.toArray(foundForm.props.children);
      const lastIdx = formChildren.length - 1;
      const last = formChildren[lastIdx];
      if (
        isValidElement(last) &&
        typeof last.props?.className === 'string' &&
        (last.props.className.includes('modal-footer-actions') ||
          (last.props.className.includes('justify-end') && last.props.className.includes('border-t')))
      ) {
        const footerEl = cloneElement(last, { className: `modal-footer-actions ${last.props.className || ''}`.trim() });
        body = cloneElement(foundForm, {
          className: `modal-form ${foundForm.props.className || ''}`.trim(),
          children: (
            <>
              <div className="modal-form-body">{formChildren.slice(0, -1)}</div>
              {footerEl}
            </>
          )
        });
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div
        className={`modal-content ${sizeClass[size] || ''}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className="modal-header-sticky">
            <div className="flex items-start justify-between gap-4">
              {title && (
                <h3 id="modal-title" className="text-xl font-bold font-heading text-gradient leading-tight">
                  {title}
                </h3>
              )}
              {!hideClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-warm-silver hover:text-frost hover:bg-white/5 transition-all duration-200 -mr-2 -mt-1"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="modal-scroll">{body}</div>
      </div>
    </div>
  );
}
