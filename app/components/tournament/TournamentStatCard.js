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
      className={`flex w-full items-start gap-2 border-white/20 p-2 sm:p-2.5 lg:w-[156px] lg:border-r ${
        highlighted
          ? "border-gold/40 hover:border-gold/40 shadow-gold/10 rounded-lg border shadow-md transition-all"
          : ""
      }`}
    >
      {!highlighted && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-500/20 text-base sm:h-8 sm:w-8 sm:text-lg 2xl:h-10 2xl:w-10 2xl:text-xl">
          {icon}
        </div>
      )}
      <div className={`min-w-0 flex-1 ${highlighted ? "text-center" : ""}`}>
        <p
          className={`text-xs font-medium tracking-wider 2xl:text-sm ${
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
                  ? "text-gold text-base font-bold sm:text-lg 2xl:text-xl"
                  : "text-sm text-white sm:text-base 2xl:text-lg"
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className={`text-xs 2xl:text-sm ${
                  highlighted
                    ? "text-gold/90 sm:text-sm 2xl:text-base"
                    : "text-gray-300"
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
