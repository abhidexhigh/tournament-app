export default function TournamentStatCard({
  icon,
  label,
  value,
  subtitle,
  highlighted = false,
  children,
}) {
  return (
    <div
      className={`flex items-start gap-2 p-2 sm:p-2.5 w-full lg:w-[156px] lg:border-r border-white/20 ${
        highlighted
          ? "border border-gold/40 hover:border-gold/40 transition-all shadow-md shadow-gold/10 rounded-lg"
          : ""
      }`}
    >
      {!highlighted && (
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gray-500/20 flex items-center justify-center text-base sm:text-lg">
          {icon}
        </div>
      )}
      <div className={`flex-1 min-w-0 ${highlighted ? "text-center" : ""}`}>
        <p
          className={`font-medium text-xs tracking-wider ${
            highlighted ? "text-gold/80 mb-1 font-semibold" : "text-gold-text"
          }`}
        >
          {label}
        </p>
        {children || (
          <>
            <p
              className={`font-semibold ${
                highlighted
                  ? "text-gold font-bold text-base sm:text-lg"
                  : "text-white text-sm sm:text-base"
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className={`text-xs ${
                  highlighted ? "text-gold/90 sm:text-sm" : "text-gray-300"
                }`}
              >
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
