"use client";

export default function Badge({ children, variant = "default", size = "md" }) {
  const variants = {
    default: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    primary: "bg-gold/20 text-gold border-gold/30",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
