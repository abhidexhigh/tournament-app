"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";

// Get tier based on numUnits and trait definition
const getTierFromUnits = (trait, numUnits) => {
  if (!trait?.tiers) return "base";
  
  for (let i = trait.tiers.length - 1; i >= 0; i--) {
    const tier = trait.tiers[i];
    if (numUnits >= tier.min) {
      return tier.tier;
    }
  }
  return "base";
};

// Get tier image URL
const getTierImageUrl = (trait, tier) => {
  if (!trait?.tiers) return trait?.imageUrl;
  const tierData = trait.tiers.find((t) => t.tier === tier);
  return tierData?.imageUrl || trait?.imageUrl;
};

// Get subtle glow effect based on tier
const getTierGlow = (tier) => {
  switch (tier) {
    case "prismatic":
      return "drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]";
    case "gold":
      return "drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]";
    case "silver":
      return "drop-shadow-[0_0_4px_rgba(156,163,175,0.3)]";
    case "bronze":
      return "drop-shadow-[0_0_4px_rgba(217,119,6,0.3)]";
    default:
      return "";
  }
};

export default function TraitIcon({ traitData, traitRef, size = "md" }) {
  if (!traitRef) return null;

  const tier = getTierFromUnits(traitRef, traitData.numUnits);
  const imageUrl = getTierImageUrl(traitRef, tier);

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const imgSizes = {
    sm: 32,
    md: 42,
    lg: 50,
  };

  const tooltipContent = (
    <div className="min-w-[200px] max-w-[280px]">
      <div className="mb-2 flex items-center gap-2 border-b border-gold-dark/10 pb-2">
        <Image
          src={imageUrl}
          alt={traitRef.name}
          width={36}
          height={36}
          className="rounded shadow-lg"
          unoptimized
        />
        <div>
          <p className="font-bold text-gold-light-text">{traitRef.name}</p>
          <p className="text-xs capitalize text-gray-500">{tier} Tier</p>
        </div>
      </div>
      <p className="mb-2 text-xs leading-relaxed text-gray-400">{traitRef.desc}</p>
      <div className="mb-2 flex items-center gap-1 text-xs">
        <span className="text-gray-500">Active:</span>
        <span className="font-bold text-gold-light-text">{traitData.numUnits}</span>
        <span className="text-gray-500">units</span>
      </div>
      {traitRef.tiers && (
        <div className="flex flex-wrap gap-1 border-t border-gold-dark/10 pt-2">
          {traitRef.tiers.map((t) => (
            <span
              key={t.tier}
              className={`rounded px-2 py-1 text-xs ${
                tier === t.tier
                  ? "bg-gold/20 font-bold text-gold"
                  : "bg-dark-secondary text-gray-600"
              }`}
            >
              {t.min}
              {t.max !== t.min ? `+` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={`${sizeClasses[size]} ${getTierGlow(tier)} relative flex items-center justify-center transition-transform duration-200 hover:scale-110`}
        style={{
          clipPath:
            "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        }}
      >
        <Image
          src={imageUrl}
          alt={traitRef.name}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className="object-contain"
          unoptimized
        />
      </div>
    </Tooltip>
  );
}
