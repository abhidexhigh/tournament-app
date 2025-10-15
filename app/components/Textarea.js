"use client";

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = "",
  rows = 4,
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
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full bg-dark-card border ${
          error ? "border-red-500" : "border-gold-dark/30"
        } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
