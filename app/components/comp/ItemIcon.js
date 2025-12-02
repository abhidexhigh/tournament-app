"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";

export default function ItemIcon({ itemKey, itemRef, size = "sm" }) {
  if (!itemRef) {
    return null;
  }

  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const tooltipContent = (
    <div className="min-w-[200px] max-w-[280px]">
      <div className="mb-2 flex items-center gap-2 border-b border-gold-dark/10 pb-2">
        <Image
          src={itemRef.imageUrl}
          alt={itemRef.name}
          width={36}
          height={36}
          className="rounded shadow-lg"
          unoptimized
        />
        <div>
          <p className="font-bold text-gold-light-text">{itemRef.name}</p>
          {itemRef.shortDesc && (
            <p className="text-xs text-green-400">{itemRef.shortDesc}</p>
          )}
        </div>
      </div>
      {itemRef.desc && (
        <p className="mb-3 text-xs leading-relaxed text-gray-400">
          {itemRef.desc.length > 150
            ? itemRef.desc.substring(0, 150) + "..."
            : itemRef.desc}
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gold-dark/10 pt-2 text-xs">
        {itemRef.health > 0 && (
          <span className="text-green-400">+{itemRef.health} HP</span>
        )}
        {itemRef.attackDamage > 0 && (
          <span className="text-red-400">+{itemRef.attackDamage} AD</span>
        )}
        {itemRef.magicalDamage > 0 && (
          <span className="text-blue-400">+{itemRef.magicalDamage} AP</span>
        )}
        {itemRef.physicalResistance > 0 && (
          <span className="text-gold">+{itemRef.physicalResistance} Armor</span>
        )}
        {itemRef.magicalResistance > 0 && (
          <span className="text-accent-purple">+{itemRef.magicalResistance} MR</span>
        )}
        {itemRef.attackSpeed > 0 && (
          <span className="text-gold-dark">+{itemRef.attackSpeed}% AS</span>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded bg-dark-card shadow-sm ring-1 ring-gold-dark/10 transition-all duration-200 hover:ring-gold-dark/30 hover:shadow-md`}
      >
        <Image
          src={itemRef.imageUrl}
          alt={itemRef.name}
          fill
          className="object-contain p-0.5"
          unoptimized
        />
      </div>
    </Tooltip>
  );
}
