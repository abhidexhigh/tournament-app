"use client";

import Card from "../Card";
import { formatPrizeAmount } from "../../lib/clanPrizeDistribution";
import Image from "next/image";
import { formatPrizePool, getPrimaryCurrencyInfo } from "../../lib/currencyFormatter";
import { PRIMARY_CURRENCY, getPrimaryCurrency } from "../../lib/currencyConfig";
export default function PrizeDistributionTab({
  tournament,
  prizeDistribution,
  prizes,
}) {
  const isClanBattle =
    (tournament.tournament_type ?? tournament.tournamentType) === "clan_battle";

  if (isClanBattle) {
    return (
      <ClanBattlePrizeDistribution prizeDistribution={prizeDistribution} />
    );
  }

  return <RegularPrizeDistribution tournament={tournament} prizes={prizes} />;
}

function RegularPrizeDistribution({ tournament, prizes }) {
  const totalPrizePool = prizes.first + prizes.second + prizes.third;
  const currencyInfo = getPrimaryCurrency();

  // 1st place gets 50%
  const firstPlacePrize = Math.round(totalPrizePool * 0.5);

  // 2nd to 10th place share remaining 50% equally (9 positions)
  const remainingPrize = totalPrizePool - firstPlacePrize;
  const perPositionPrize = Math.round(remainingPrize / 9);
  const perPositionPercent = (50 / 9).toFixed(2);

  const runnerUpPositions = Array.from({ length: 9 }, (_, i) => ({
    position: i + 2,
    prize: perPositionPrize,
    percent: perPositionPercent,
  }));
  
  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} 💎`;
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-start gap-2">
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
          alt="Prize Distribution"
          width={32}
          height={32}
          className="w-5"
        />
        <h3 className="text-gold flex items-center gap-2 text-xl leading-6 font-bold">
          Prize Distribution
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Side - 1st Place Winner */}
        <div>
          <h5 className="border-gold-dark/30 mb-3 flex items-center gap-2 border-l-2 pl-4 text-base font-medium text-white">
            🏆 Champion (50%)
          </h5>
          <div className="border-gold/50 flex h-[calc(100%-2rem)] flex-col items-center justify-center rounded-xl border-2 bg-gradient-to-br from-yellow-900/30 to-amber-900/20 p-4 md:p-6">
            <Image
              src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp"
              alt="1st Place"
              width={80}
              height={80}
              className="mb-2 w-12 md:mb-4 md:w-20"
            />
            <p className="mb-1 text-base font-bold text-white md:text-lg">1st Place</p>
            <p className="mb-2 text-xs text-gray-400 md:mb-3 md:text-sm">
              Winner takes 50% of prize pool
            </p>
            <p className="text-gold text-xl font-bold md:text-3xl">
              {formatCurrency(firstPlacePrize)}
            </p>
          </div>
        </div>

        {/* Right Side - 2nd to 10th Place */}
        <div>
          <h5 className="border-gold-dark/30 mb-3 flex items-center gap-2 border-l-2 pl-4 text-base font-medium text-white">
            🥈 Runner-ups (50%)
          </h5>
          <div className="bg-dark-primary/50 border-gold-dark/50 rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-white">2nd - 10th Place</span>
              <span className="text-sm text-gray-400">9 positions</span>
            </div>

            <div className="bg-dark-secondary/50 mb-3 rounded-lg p-4">
              <p className="mb-2 text-sm text-gray-400">
                Each position receives:
              </p>
              <p className="text-gold text-2xl font-bold">
                {formatCurrency(perPositionPrize)}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {perPositionPercent}% of total prize pool each
              </p>
            </div>

            <div className="border-t border-gray-600/50 pt-3">
              <div className="flex flex-wrap gap-2">
                {runnerUpPositions.map((pos) => (
                  <div
                    key={pos.position}
                    className="bg-dark-primary/80 border-gold-dark/30 flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <span className="text-gold font-semibold">
                      {pos.position}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatCurrency(pos.prize)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 border-t border-gray-600/50 pt-3">
              <div className="flex items-end justify-between text-sm">
                <span className="text-gray-400">Total for runner-ups:</span>
                <div className="text-right">
                  <span className="text-gold font-semibold">
                    {formatCurrency(remainingPrize)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="border-gold-dark/30 mt-4 border-t pt-4">
        <div className="flex items-end justify-between">
          <span className="text-gold font-semibold">Total Prize Pool:</span>
          <div className="text-right">
            <span className="text-gold text-xl font-bold">
              {formatCurrency(totalPrizePool)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ClanBattlePrizeDistribution({ prizeDistribution }) {
  const currencyInfo = getPrimaryCurrency();
  
  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `${Number(amount).toLocaleString()} 💎`;
  };
  
  if (!prizeDistribution) {
    return (
      <Card className="px-10">
        <div className="py-8 text-center">
          <div className="mb-4 text-4xl">🏆</div>
          <p className="mb-2 text-lg text-gray-300">
            Prize Distribution Loading
          </p>
          <p className="text-gray-400">
            Prize distribution details will be available once tournament data is
            loaded.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="px-10">
      <div className="mb-4 flex items-center justify-start gap-2">
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
          alt="Prize Distribution"
          width={32}
          height={32}
          className="w-5"
        />
        <h3 className="text-gold flex items-center gap-2 text-xl leading-6 font-bold">
          Prize Distribution
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <TopPerformersSection performers={prizeDistribution.topPerformers} />

        {/* Team Members */}
        <TeamMembersSection
          remainingMembers={prizeDistribution.remainingMembers}
        />
      </div>

      {/* Summary */}
      <div className="border-gold-dark/30 mt-4 border-t pt-4">
        <div className="flex items-end justify-between">
          <span className="text-gold font-semibold">Total Prize Pool:</span>
          <div className="text-right">
            <span className="text-gold text-xl font-bold">
              {formatCurrency(prizeDistribution.totalPrize)}
            </span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          Winning team receives 100% of the prize pool
        </p>
      </div>
    </Card>
  );
}

function TopPerformersSection({ performers }) {
  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `${Number(amount).toLocaleString()} 💎`;
  };
  
  const icons = [
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp",
  ];

  const suffix = ["st", "nd", "rd"];

  return (
    <div>
      <h5 className="border-gold-dark/30 mb-2 flex items-center gap-2 border-l-2 pl-4 text-base font-medium text-white">
        Top Performers (20%)
      </h5>
      <div className="space-y-2">
        {performers.map((performer, index) => (
          <div
            key={index}
            className="bg-dark-primary/50 border-gold-dark/50 flex items-center justify-between rounded-lg border p-3 px-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                <Image
                  src={icons[index]}
                  alt={`${performer.position} Place`}
                  width={24}
                  height={24}
                  className="w-8"
                />
              </span>
              <div>
                <p className="font-medium text-white">
                  {performer.position}
                  {suffix[performer.position - 1]} Place
                </p>
                <p className="text-sm text-gray-400">
                  {performer.percentage}% of total
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gold text-lg font-bold">
                {formatCurrency(performer.prize)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamMembersSection({ remainingMembers }) {
  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `${Number(amount).toLocaleString()} 💎`;
  };
  
  return (
    <div>
      <h5 className="border-gold-dark/30 mb-2 flex items-center gap-2 border-l-2 pl-4 text-base font-medium text-white">
        Team Members (80%)
      </h5>
      <div className="bg-dark-primary/50 border-gold-dark/50 h-[88%] rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-white">
            {remainingMembers.count} Members
          </span>
          <div className="text-right">
            <span className="text-gold text-lg font-bold">
              {formatCurrency(remainingMembers.individualPrize)} each
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Equal distribution of 80% total prize pool
        </p>
        <div className="mt-3 border-t border-gray-600 pt-3">
            <div className="flex items-end justify-between text-sm">
              <span className="text-gray-400">Total for team members:</span>
              <div className="text-right">
                <span className="text-gold font-semibold">
                  {formatCurrency(remainingMembers.totalPrize)}
                </span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
