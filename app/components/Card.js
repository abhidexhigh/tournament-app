"use client";

export default function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  padding = "p-6",
}) {
  const baseStyles =
    "bg-dark-card border border-gold-dark/30 rounded-2xl transition-all duration-300";
  const hoverStyles = hover
    ? "hover:border-gold hover:shadow-lg hover:shadow-gold/30 cursor-pointer"
    : "";
  const glassStyles = glass ? "glass-effect" : "";

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${glassStyles} ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
