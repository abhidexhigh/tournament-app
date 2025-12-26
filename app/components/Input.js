"use client";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = "",
  icon,
  className = "",
}) {
  // Prevent scroll from changing number input values
  const handleWheel = (e) => {
    if (type === "number") {
      e.target.blur();
    }
  };

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
          <div className="text-gold absolute top-1/2 left-3 -translate-y-1/2 text-xl">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onWheel={handleWheel}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`bg-dark-gray-card w-full border ${
            error ? "border-red-500" : "border-gold-dark/30"
          } rounded-lg px-4 py-3 ${
            icon ? "pl-12" : ""
          } focus:border-gold focus:ring-gold/20 text-white placeholder-gray-500 transition-all duration-300 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
