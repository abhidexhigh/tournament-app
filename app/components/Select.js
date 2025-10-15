"use client";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = "",
  icon,
  placeholder = "Select an option",
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-gold ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gold text-xl z-10">
            {icon}
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full bg-dark-card border ${
            error ? "border-red-500" : "border-gold-dark/30"
          } rounded-lg px-4 py-3 ${
            icon ? "pl-12" : ""
          } text-white appearance-none focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
          ▼
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
