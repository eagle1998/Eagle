function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  rows,
  error,
  helper,
  disabled,
  className = '',
  children,
  ...props
}) {
  const Tag = rows ? 'textarea' : type === 'select' ? 'select' : 'input';
  const inputClass = `form-input ${error ? 'form-input-error' : ''} ${className}`.trim();

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {Tag === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 3}
          className={inputClass}
          {...props}
        />
      ) : Tag === 'select' ? (
        <select
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={inputClass}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClass}
          {...props}
        />
      )}
      {error ? (
        <p className="form-error-text">{error}</p>
      ) : helper ? (
        <p className="form-helper-text">{helper}</p>
      ) : null}
    </div>
  );
}

export default Input;
