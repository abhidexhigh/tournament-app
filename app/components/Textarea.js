"use client";

export default function Textarea({
  label,
  name,
  value,
  onChange,
  onBlur,
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
          className="mb-2 block text-sm font-medium text-gray-300"
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
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`bg-dark-card w-full border ${
          error ? "border-red-500" : "border-gold-dark/30"
        } focus:border-gold focus:ring-gold/20 resize-none rounded-lg px-4 py-3 text-white placeholder-gray-500 transition-all duration-300 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
