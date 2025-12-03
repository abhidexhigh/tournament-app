"use client";

import Image from "next/image";
import TraitIcon from "./TraitIcon";
import ForceIcon from "./ForceIcon";
import AugmentIcon from "./AugmentIcon";
import SkillTreeIcon from "./SkillTreeIcon";
import ChampionCard from "./ChampionCard";
import { PRIMARY_CURRENCY } from "../../lib/currencyConfig";

export default function CompDisplay({
  playerData,
  refs,
  position,
  showPosition = true,
  isHighlighted = false,
}) {
  if (!playerData || !refs) return null;

  const {
    traits = [],
    champions = [],
    augments = [],
    forces = [],
    skillTree = [],
    username,
    prizeAmount,
    score,
  } = playerData;

  // Get refs maps for quick lookup
  const championsMap = {};
  refs.champions?.forEach((c) => {
    championsMap[c.key] = c;
  });

  const traitsMap = {};
  refs.traits?.forEach((t) => {
    traitsMap[t.key] = t;
  });

  const itemsMap = {};
  refs.items?.forEach((i) => {
    itemsMap[i.key] = i;
  });

  const forcesMap = {};
  refs.forces?.forEach((f) => {
    forcesMap[f.key] = f;
  });

  const augmentsMap = {};
  refs.augments?.forEach((a) => {
    augmentsMap[a.key] = a;
  });

  const skillTreeMap = {};
  refs.skillTree?.forEach((s) => {
    skillTreeMap[s.key] = s;
  });

  // Sort traits by tier (higher tiers first)
  const sortedTraits = [...traits].sort((a, b) => {
    const getTierValue = (t) => {
      const ref = traitsMap[t.name];
      if (!ref?.tiers) return 0;
      for (let i = ref.tiers.length - 1; i >= 0; i--) {
        if (t.numUnits >= ref.tiers[i].min) return i;
      }
      return 0;
    };
    return getTierValue(b) - getTierValue(a);
  });

  // Sort champions by coreRank
  const sortedChampions = [...champions].sort(
    (a, b) => a.coreRank - b.coreRank,
  );

  // Get position badge
  const getPositionBadge = () => {
    if (position === 1)
      return (
        <div className="relative">
          <Image
            src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp"
            alt="1st place"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
        </div>
      );
    if (position === 2)
      return (
        <div className="relative">
          <Image
            src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp"
            alt="2nd place"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
        </div>
      );
    if (position === 3)
      return (
        <div className="relative">
          <Image
            src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp"
            alt="3rd place"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
        </div>
      );
    return (
      <div className="bg-dark-secondary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-gray-600">
        {position}
      </div>
    );
  };

  // Get accent glow based on position
  const getPositionAccent = () => {
    if (position === 1) return "shadow-[0_0_20px_rgba(255,215,0,0.15)]";
    if (position === 2) return "shadow-[0_0_15px_rgba(192,192,192,0.1)]";
    if (position === 3) return "shadow-[0_0_15px_rgba(205,127,50,0.1)]";
    return "";
  };

  return (
    <div
      className={`group border-gold-dark/10 hover:border-gold-dark/30 relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-xl ${getPositionAccent()} ${
        isHighlighted
          ? "from-accent-blue/15 via-dark-gray-card to-dark-gray-card ring-accent-blue/40 bg-gradient-to-br ring-2"
          : "bg-dark-gray-card hover:border-gold-dark/30"
      }`}
    >
      {/* Subtle top gradient for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

      {/* Top Row: Header */}
      <div className="border-gold-dark/10 relative flex flex-wrap items-center gap-3 border-b px-3 py-2.5">
        {/* Left Section: Position + Username + Score */}
        {showPosition && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">{getPositionBadge()}</div>
            <div>
              <p className="text-gold-light-text text-sm font-bold">
                {username}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span className="font-medium">
                  Score{" "}
                  <span className="text-gold-light-text">
                    {score?.toLocaleString()}
                  </span>
                </span>
                {prizeAmount > 0 && (
                  <span className="bg-gold/10 text-gold rounded-full px-1.5 py-0.5 font-semibold">
                    +{PRIMARY_CURRENCY === "USD" ? "$" : ""}{prizeAmount.toLocaleString()}{PRIMARY_CURRENCY === "DIAMOND" ? " 💎" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="via-gold-dark/30 h-8 w-px bg-gradient-to-b from-transparent to-transparent" />

        {/* Traits */}
        <div className="flex items-center gap-1">
          {sortedTraits.slice(0, 5).map((trait, idx) => (
            <TraitIcon
              key={`${trait.name}-${idx}`}
              traitData={trait}
              traitRef={traitsMap[trait.name]}
              size="sm"
            />
          ))}
        </div>

        {/* Divider */}
        <div className="via-gold-dark/30 h-8 w-px bg-gradient-to-b from-transparent to-transparent" />

        {/* Forces */}
        <div className="flex items-center gap-1">
          {forces.map((force, idx) => (
            <ForceIcon
              key={`${force.key}-${idx}`}
              forceData={force}
              forceRef={forcesMap[force.key]}
              size="sm"
            />
          ))}
        </div>

        {/* Right Section: Augments + SkillTree */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Augments */}
          {augments.length > 0 && (
            <>
              <div className="flex items-center gap-1">
                {augments.map((augKey, idx) => (
                  <AugmentIcon
                    key={`${augKey}-${idx}`}
                    augmentKey={augKey}
                    augmentRef={augmentsMap[augKey]}
                    size="sm"
                  />
                ))}
              </div>

              {/* Separator between augments and skill tree */}
              {skillTree.length > 0 && (
                <div className="via-gold-dark/30 h-8 w-px bg-gradient-to-b from-transparent to-transparent" />
              )}
            </>
          )}

          {/* SkillTree */}
          {skillTree.length > 0 && (
            <div className="flex items-center gap-1">
              {skillTree.map((skillKey, idx) => (
                <SkillTreeIcon
                  key={`${skillKey}-${idx}`}
                  skillKey={skillKey}
                  skillRef={skillTreeMap[skillKey]}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Champions with subtle gradient background */}
      <div className="from-dark-secondary/20 relative bg-gradient-to-b to-transparent">
        <div className="custom-scrollbar flex items-start gap-1.5 overflow-x-auto px-3 py-3">
          {sortedChampions.map((champion, idx) => (
            <ChampionCard
              key={`${champion.key}-${idx}`}
              championData={champion}
              championRef={championsMap[champion.key]}
              itemRefs={itemsMap}
              coreRank={champion.coreRank}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
