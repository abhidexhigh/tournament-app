"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";

export default function ForceIcon({ forceData, forceRef, size = "md" }) {
  if (!forceRef) return null;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const tooltipContent = (
    <div className="min-w-[150px]">
      <div className="border-gold-dark/10 mb-2 flex items-center gap-2 border-b pb-2">
        <Image
          src={forceRef.imageUrl}
          alt={forceRef.name}
          width={28}
          height={28}
          className="rounded shadow-lg"
          unoptimized
        />
        <p className="text-gold-light-text font-bold">{forceRef.name}</p>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-500">Units:</span>
        <span className="text-gold-light-text font-bold">
          {forceData.numUnits}
        </span>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div className="bg-dark-card ring-gold-dark/10 hover:ring-gold-dark/30 flex items-center gap-1 rounded-full px-2 py-0.5 shadow-sm ring-1 transition-all duration-200 hover:shadow-md">
        <div className={`${sizeClasses[size]} relative`}>
          <Image
            src={forceRef.imageUrl}
            alt={forceRef.name}
            fill
            className="object-contain drop-shadow-md"
            unoptimized
          />
        </div>
        <span className="text-gold-light-text text-xs font-bold">
          {forceData.numUnits}
        </span>
      </div>
    </Tooltip>
  );
}
