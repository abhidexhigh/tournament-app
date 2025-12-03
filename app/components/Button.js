"use client";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) {
  const baseStyles =
    "font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center active:scale-[0.98]";

  const variants = {
    primary:
      "bg-gold-gradient text-dark-primary hover:shadow-lg hover:shadow-gold/50 hover:scale-105",
    secondary:
      "bg-dark-gray-card text-gold border border-gold-dark/50 hover:bg-gold hover:text-dark-primary",
    outline:
      "bg-transparent text-gold border-2 border-gold hover:bg-gold hover:text-dark-primary",
    ghost:
      "bg-transparent text-gray-300 hover:text-gold hover:bg-dark-gray-card",
    danger:
      "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
