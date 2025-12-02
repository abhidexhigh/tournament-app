"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";
import ItemIcon from "./ItemIcon";

// Render star icons based on tier
const renderStars = (tier) => {
  const stars = [];
  for (let i = 0; i < tier; i++) {
    stars.push(
      <span key={i} className="text-gold text-[10px] drop-shadow-md">
        ★
      </span>,
    );
  }
  return stars;
};

export default function ChampionCard({
  championData,
  championRef,
  itemRefs,
  coreRank,
  size = "md",
}) {
  if (!championRef) {
    return (
      <div className="flex h-[120px] w-[90px] flex-col items-center">
        <div className="bg-dark-card flex h-[90px] w-[90px] items-center justify-center rounded-lg text-xs text-gray-600">
          ?
        </div>
        <div className="mt-1.5 flex h-[22px] items-center justify-center gap-1" />
      </div>
    );
  }

  const sizeClasses = {
    sm: {
      wrapper: "w-[90px] h-[120px]",
      img: "h-[90px] w-[90px]",
      itemH: "h-[22px]",
    },
    md: {
      wrapper: "w-[110px] h-[150px]",
      img: "h-[110px] w-[110px]",
      itemH: "h-[28px]",
    },
    lg: {
      wrapper: "w-[130px] h-[175px]",
      img: "h-[130px] w-[130px]",
      itemH: "h-[32px]",
    },
  };

  const currentSize = sizeClasses[size];

  const tooltipContent = (
    <div className="max-w-[320px] min-w-[250px]">
      {/* Champion Header */}
      <div className="border-gold-dark/10 mb-3 flex items-start gap-3 border-b pb-3">
        <Image
          src={championRef.cardImage}
          alt={championRef.name}
          width={60}
          height={60}
          className="rounded-lg shadow-lg"
          unoptimized
        />
        <div>
          <p className="text-gold-light-text text-lg font-bold">
            {championRef.name}
          </p>
          <p className="text-xs text-gray-500">
            {championRef.type} • {championRef.unitType}
          </p>
          <p className="text-xs text-gray-600">{championRef.variant}</p>
          <div className="mt-1 flex gap-0.5">
            {renderStars(championData.tier)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-dark-secondary rounded px-2 py-1.5 text-center">
          <div className="font-bold text-red-400">{championRef.attack}</div>
          <div className="text-gray-600">ATK</div>
        </div>
        <div className="bg-dark-secondary rounded px-2 py-1.5 text-center">
          <div className="font-bold text-green-400">{championRef.hp}</div>
          <div className="text-gray-600">HP</div>
        </div>
        <div className="bg-dark-secondary rounded px-2 py-1.5 text-center">
          <div className="font-bold text-blue-400">
            {championRef.magicPower}
          </div>
          <div className="text-gray-600">AP</div>
        </div>
      </div>

      {/* Traits */}
      <div className="mb-2">
        <p className="mb-1.5 text-xs font-semibold text-gray-500">Traits:</p>
        <div className="flex flex-wrap gap-1">
          {championRef.traits?.map((trait) => (
            <span
              key={trait}
              className="bg-dark-secondary text-gold-light-text rounded-full px-2.5 py-0.5 text-xs"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Items */}
      {championData.items && championData.items.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-500">Items:</p>
          <div className="flex flex-wrap gap-1">
            {championData.items.map((itemKey, idx) => {
              const itemRef = itemRefs?.[itemKey];
              return (
                <div
                  key={idx}
                  className="bg-dark-secondary flex items-center gap-1.5 rounded-full px-2 py-1"
                >
                  {itemRef && (
                    <Image
                      src={itemRef.imageUrl}
                      alt={itemRef.name}
                      width={16}
                      height={16}
                      unoptimized
                    />
                  )}
                  <span className="text-gold-light-text text-xs">
                    {itemRef?.name || itemKey}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Get items to show (max 3)
  const itemsToShow = championData.items?.slice(0, 3) || [];

  return (
    <div className={`${currentSize.wrapper} group relative flex flex-col`}>
      {/* Stars above the card */}
      {championData.tier > 1 && (
        <div className="bg-dark-primary/90 absolute -top-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-0.5 rounded-full px-1.5 py-0.5 shadow-lg">
          {renderStars(championData.tier)}
        </div>
      )}

      {/* Champion Image Card - Square with Tooltip and Hover Effect */}
      <Tooltip content={tooltipContent}>
        <div
          className={`${currentSize.img} bg-dark-card hover:shadow-gold-dark/20 relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <Image
            src={championRef.cardImage}
            alt={championRef.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />

          {/* Subtle overlay gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Force indicator in corner */}
          {championRef.forceImageUrl && (
            <div className="absolute top-1 right-1 h-5 w-5 drop-shadow-lg">
              <Image
                src={championRef.forceImageUrl}
                alt={championRef.variant}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Core Rank Badge */}
          {coreRank && (
            <div className="bg-gold text-dark-primary ring-dark-primary/50 absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-lg ring-2">
              {coreRank}
            </div>
          )}
        </div>
      </Tooltip>

      {/* Items below the card */}
      <div
        className={`${currentSize.itemH} mt-1.5 flex items-center justify-center gap-1`}
      >
        {itemsToShow.length > 0
          ? itemsToShow.map((itemKey, idx) => (
              <ItemIcon
                key={idx}
                itemKey={itemKey}
                itemRef={itemRefs?.[itemKey]}
                size="xs"
              />
            ))
          : null}
      </div>
    </div>
  );
}
