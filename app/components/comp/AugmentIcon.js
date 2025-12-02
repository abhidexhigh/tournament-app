"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";

export default function AugmentIcon({ augmentKey, augmentRef, size = "md" }) {
  if (!augmentRef) {
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
          src={augmentRef.imageUrl}
          alt={augmentRef.name}
          width={40}
          height={40}
          className="rounded shadow-lg"
          unoptimized
        />
        <div>
          <p className="font-bold text-gold-light-text">{augmentRef.name}</p>
          <p className="text-xs capitalize text-gray-500">
            {augmentRef.tier || "Unknown"} Augment
          </p>
        </div>
      </div>
      {augmentRef.desc && (
        <p className="text-xs leading-relaxed text-gray-400">{augmentRef.desc}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg`}
      >
        <Image
          src={augmentRef.imageUrl}
          alt={augmentRef.name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </Tooltip>
  );
}
