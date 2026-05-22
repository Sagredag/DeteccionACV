function FormField({ field, value, onChange, error }) {
  const { id, label, type, placeholder, unit, min, max, step, required, hint, options } = field;

  const inputClass = (base) =>
    [base, error && `${base}--error`].filter(Boolean).join(' ');

  const renderControl = () => {
    if (type === 'radio') {
      return (
        <div className="radio-group">
          {options.map((opt) => (
            <label key={String(opt.value)} className="radio-option">
              <input
                type="radio"
                name={id}
                value={String(opt.value)}
                checked={String(value) === String(opt.value)}
                onChange={() => onChange(id, opt.value)}
              />
              <span className="radio-option__label">{opt.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (type === 'select') {
      return (
        <select
          id={id}
          className={inputClass('form-field__select')}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          required={required}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="form-field__input-wrapper">
        <input
          id={id}
          type={type}
          className={inputClass(`form-field__input${unit ? ' form-field__input--with-unit' : ''}`)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          min={min}
          max={max}
          step={step || '1'}
          required={required}
        />
        {unit && <span className="form-field__unit">{unit}</span>}
      </div>
    );
  };

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      {renderControl()}
      {hint && !error && <span className="form-field__hint">{hint}</span>}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

export default FormField;
