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
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          {label}
          {required && <span className="text-gold ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="text-gold absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xl">
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
          className={`bg-dark-card w-full border ${
            error ? "border-red-500" : "border-gold-dark/30"
          } rounded-lg px-4 py-3 ${
            icon ? "pl-12" : ""
          } focus:border-gold focus:ring-gold/20 appearance-none text-white transition-all duration-300 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
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
        <div className="text-gold pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          ▼
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
