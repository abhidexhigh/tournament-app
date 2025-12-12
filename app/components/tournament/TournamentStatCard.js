export default function TournamentStatCard({
  icon,
  label,
  value,
  subtitle,
  highlighted = false,
  children,
}) {
  if (highlighted) {
    return (
      <div className="border-gold-dark/40 from-gold-dark/15 to-gold-dark/5 flex w-full items-center justify-center rounded-lg border bg-gradient-to-br p-3 md:w-auto md:min-w-[130px] lg:w-[140px]">
        <div className="text-center">
          <p className="text-gold-dark mb-0.5 text-[11px] font-semibold tracking-wider uppercase">
            {label}
          </p>
          {children || (
            <>
              <p className="text-gold text-lg font-bold sm:text-xl 2xl:text-2xl">
                {value}
              </p>
              {subtitle && (
                <p className="text-gold/60 text-[10px] sm:text-xs">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-gold-dark/20 bg-dark-card/50 md:bg-dark-card/50 lg:border-gold-dark/20 flex w-full items-start gap-2.5 rounded-lg border p-2.5 md:w-auto md:min-w-[130px] md:rounded-lg md:border lg:w-[150px] lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent">
      <div className="bg-gold-dark/20 text-gold-dark flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base sm:h-9 sm:w-9 sm:text-lg">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide text-gray-100 uppercase sm:text-xs sm:capitalize">
          {label}
        </p>
        {children || (
          <>
            <p className="text-base font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-gray-100">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
