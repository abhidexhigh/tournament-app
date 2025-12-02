"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";

export default function SkillTreeIcon({ skillKey, skillRef, size = "md" }) {
  if (!skillRef) {
    return null;
  }

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const tooltipContent = (
    <div className="min-w-[200px] max-w-[280px]">
      <div className="mb-2 flex items-center gap-2 border-b border-gold-dark/10 pb-2">
        <Image
          src={skillRef.imageUrl}
          alt={skillRef.name}
          width={40}
          height={40}
          className="rounded shadow-lg"
          unoptimized
        />
        <div>
          <p className="font-bold text-gold-light-text">{skillRef.name}</p>
          <p className="text-xs text-gray-500">
            Level {skillRef.level} • {skillRef.variant}
          </p>
        </div>
      </div>
      {skillRef.desc && (
        <p className="mb-3 text-xs leading-relaxed text-gray-400">{skillRef.desc}</p>
      )}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gold-dark/10 pt-2 text-xs text-gray-500">
        <span>Plays: <span className="font-semibold text-gold-light-text">{skillRef.plays?.toLocaleString()}</span></span>
        <span>Wins: <span className="font-semibold text-gold-light-text">{skillRef.wins?.toLocaleString()}</span></span>
        <span className="col-span-2">Avg Place: <span className="font-semibold text-gold-light-text">{skillRef.avgPlacement}</span></span>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg`}
      >
        <Image
          src={skillRef.imageUrl}
          alt={skillRef.name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </Tooltip>
  );
}
