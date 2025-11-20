"use client";

import Card from "../Card";
import { formatPrizeAmount } from "../../lib/clanPrizeDistribution";

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
  const prizeData = [
    {
      place: "1st",
      icon: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp",
      percent: tournament.prize_split_first ?? tournament.prizeSplit?.first,
      amount: prizes.first,
    },
    {
      place: "2nd",
      icon: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp",
      percent: tournament.prize_split_second ?? tournament.prizeSplit?.second,
      amount: prizes.second,
    },
    {
      place: "3rd",
      icon: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp",
      percent: tournament.prize_split_third ?? tournament.prizeSplit?.third,
      amount: prizes.third,
    },
  ];

  return (
    <Card>
      <div className="flex items-center mb-4 justify-start gap-2">
        <img
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
          alt="Prize Distribution"
          width={32}
          height={32}
          className="w-5"
        />
        <h3 className="text-gold font-bold text-xl flex items-center gap-2 leading-6">
          Prize Distribution
        </h3>
      </div>
      <div className="space-y-3">
        {prizeData.map((prize) => (
          <PrizeRow
            key={prize.place}
            icon={prize.icon}
            place={prize.place}
            percent={prize.percent}
            amount={prize.amount}
          />
        ))}
      </div>
    </Card>
  );
}

function PrizeRow({ icon, place, percent, amount }) {
  return (
    <div className="flex items-center justify-between bg-dark-primary/50 rounded-lg p-3 border border-gold-dark/50 px-6">
      <div className="flex items-center space-x-3">
        <img
          src={icon}
          alt={`${place} Place`}
          width={24}
          height={24}
          className="w-8"
        />
        <div>
          <p className="text-white font-bold">{place} Place</p>
          <p className="text-gray-400 text-sm">{percent}% of prize pool</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-gold font-bold text-xl">
          ${Math.floor(amount / 100).toLocaleString()} USD
        </p>
        <p className="text-gold text-sm">({amount.toLocaleString()} 💎)</p>
      </div>
    </div>
  );
}

function ClanBattlePrizeDistribution({ prizeDistribution }) {
  if (!prizeDistribution) {
    return (
      <Card className="px-10">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-300 text-lg mb-2">
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
      <div className="flex items-center mb-4 justify-start gap-2">
        <img
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
          alt="Prize Distribution"
          width={32}
          height={32}
          className="w-5"
        />
        <h3 className="text-gold font-bold text-xl flex items-center gap-2 leading-6">
          Prize Distribution
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <TopPerformersSection performers={prizeDistribution.topPerformers} />

        {/* Team Members */}
        <TeamMembersSection
          remainingMembers={prizeDistribution.remainingMembers}
        />
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gold-dark/30">
        <div className="flex justify-between items-end">
          <span className="text-gold font-semibold">Total Prize Pool:</span>
          <div className="text-right">
            <span className="text-gold font-bold text-xl">
              {formatPrizeAmount(prizeDistribution.totalPrize)}
            </span>
            <div className="text-gold/80 text-sm">
              ({(prizeDistribution.totalPrize * 100).toLocaleString()} 💎)
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Winning team receives 100% of the prize pool
        </p>
      </div>
    </Card>
  );
}

function TopPerformersSection({ performers }) {
  const icons = [
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp",
  ];

  const suffix = ["st", "nd", "rd"];

  return (
    <div>
      <h5 className="text-white text-base font-medium mb-2 pl-4 border-l-2 border-gold-dark/30 flex items-center gap-2">
        Top Performers (20%)
      </h5>
      <div className="space-y-2">
        {performers.map((performer, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-dark-primary/50 rounded-lg p-3 border border-gold-dark/50 px-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                <img
                  src={icons[index]}
                  alt={`${performer.position} Place`}
                  width={24}
                  height={24}
                  className="w-8"
                />
              </span>
              <div>
                <p className="text-white font-medium">
                  {performer.position}
                  {suffix[performer.position - 1]} Place
                </p>
                <p className="text-gray-400 text-sm">
                  {performer.percentage}% of total
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gold font-bold text-lg">
                {formatPrizeAmount(performer.prize)}
              </p>
              <p className="text-gold/80 text-sm">
                ({(performer.prize * 100).toLocaleString()} 💎)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamMembersSection({ remainingMembers }) {
  return (
    <div>
      <h5 className="text-white text-base font-medium mb-2 pl-4 border-l-2 border-gold-dark/30 flex items-center gap-2">
        Team Members (80%)
      </h5>
      <div className="bg-dark-primary/50 rounded-lg p-4 border border-gold-dark/50 h-[88%]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">
            {remainingMembers.count} Members
          </span>
          <div className="text-right">
            <span className="text-gold font-bold text-lg">
              {formatPrizeAmount(remainingMembers.individualPrize)} each
            </span>
            <div className="text-gold/80 text-sm">
              ({(remainingMembers.individualPrize * 100).toLocaleString()} 💎)
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          Equal distribution of 80% total prize pool
        </p>
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex justify-between text-sm items-end">
            <span className="text-gray-400">Total for team members:</span>
            <div className="text-right">
              <span className="text-gold font-semibold">
                {formatPrizeAmount(remainingMembers.totalPrize)}
              </span>
              <div className="text-gold/80 text-xs">
                ({(remainingMembers.totalPrize * 100).toLocaleString()} 💎)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
