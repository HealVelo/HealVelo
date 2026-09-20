import React from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error = null,
  min,
  max,
  step,
  placeholder = '',
  required = false,
  suffix = '',
  className = '',
}) {
  const handleKeyDown = (e) => {
    // Cegah pengetikan karakter minus, plus, eksponen e/E pada input bertipe number
    if (type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (type === 'number' && val !== '') {
      let num = parseFloat(val);
      if (min !== undefined && num < min) num = min;
      if (max !== undefined && num > max) num = max;
      e.target.value = isNaN(num) ? '' : num;
    }
    onChange(e);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          required={required}
          className={`w-full border border-slate-300 rounded-xs py-1.5 text-xs text-slate-800 bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none transition-colors ${
            suffix ? 'pl-2.5 pr-11' : 'px-2.5'
          } ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`}
        />
        {suffix && (
          <span className="absolute right-2.5 text-[11px] font-semibold text-slate-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-[11px] text-red-600 mt-1 block">{error}</span>}
    </div>
  );
}

export { FormInput };