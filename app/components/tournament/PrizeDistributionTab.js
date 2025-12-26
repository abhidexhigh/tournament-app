"use client";

import Card from "../Card";
import Image from "next/image";
import { PRIMARY_CURRENCY } from "../../lib/currencyConfig";
import { useTranslations } from "../../contexts/LocaleContext";
import { calculateActualPrizePool } from "../../lib/prizeCalculator";

export default function PrizeDistributionTab({
  tournament,
  prizeDistribution,
  prizes,
}) {
  const isClanBattle =
    (tournament.tournament_type ?? tournament.tournamentType) === "clan_battle";
  const clanPrizeMode = tournament.clan_prize_mode;

  // For clan battles with winner_clan mode, show equal distribution
  if (isClanBattle && clanPrizeMode === "winner_clan") {
    return <WinnerClanPrizeDistribution tournament={tournament} />;
  }

  // For clan battles with individual mode or no mode set, use old clan distribution
  if (isClanBattle && clanPrizeMode !== "individual") {
    return (
      <ClanBattlePrizeDistribution prizeDistribution={prizeDistribution} />
    );
  }

  // For regular tournaments and clan battles with individual mode
  return <RegularPrizeDistribution tournament={tournament} prizes={prizes} />;
}

function RegularPrizeDistribution({ tournament, prizes }) {
  const t = useTranslations("prizes");

  // Get actual values from database
  const prizePoolUsd =
    tournament.prize_pool_usd || calculateActualPrizePool(tournament);
  const firstPercent = tournament.prize_split_first || 10;
  const secondPercent = tournament.prize_split_second || 7;
  const thirdPercent = tournament.prize_split_third || 5;
  const additionalPositions = tournament.additional_prize_positions || 0;

  // Calculate prizes from database percentages
  const firstPrize = Math.floor((prizePoolUsd * firstPercent) / 100);
  const secondPrize = Math.floor((prizePoolUsd * secondPercent) / 100);
  const thirdPrize = Math.floor((prizePoolUsd * thirdPercent) / 100);

  // Calculate runner-up prizes
  const topThreePercent = firstPercent + secondPercent + thirdPercent;
  const remainingPercent = 100 - topThreePercent;
  const perRunnerUpPercent =
    additionalPositions > 0 ? remainingPercent / additionalPositions : 0;
  const perRunnerUpPrize =
    additionalPositions > 0
      ? Math.floor((prizePoolUsd * perRunnerUpPercent) / 100)
      : 0;

  // Generate runner-up positions (4th to 4th + additionalPositions - 1)
  const runnerUpPositions =
    additionalPositions > 0
      ? Array.from({ length: additionalPositions }, (_, i) => ({
          position: i + 4,
          prize: perRunnerUpPrize,
          percent: perRunnerUpPercent.toFixed(1),
        }))
      : [];

  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} 💎`;
  };

  const icons = [
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp",
  ];

  const placeLabels = [t("firstPlace"), t("secondPlace"), t("thirdPlace")];
  const placePercentages = [firstPercent, secondPercent, thirdPercent];
  const placePrizes = [firstPrize, secondPrize, thirdPrize];

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="border-gold-dark/20 border-b px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="border-gold-dark/30 bg-gold-dark/10 flex h-10 w-10 items-center justify-center rounded-full border">
            <Image
              src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
              alt={t("prizeDistribution")}
              width={24}
              height={24}
              className="w-5"
              style={{ height: "auto" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("prizeDistribution")}
            </h3>
            <p className="text-xs text-gray-400">
              Total pool: {formatCurrency(prizePoolUsd)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Left/Right Layout */}
      <div className="p-5 sm:p-6">
        <div
          className={`grid grid-cols-1 gap-6 ${additionalPositions > 0 ? "lg:grid-cols-2" : ""}`}
        >
          {/* Left Side - Top 3 Positions */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h4 className="text-gold-dark text-sm font-semibold">
                Top 3 Positions
              </h4>
              <span className="border-gold-dark/30 ml-auto rounded-full border px-2 py-0.5 text-xs text-gray-400">
                {topThreePercent}% of pool
              </span>
            </div>

            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="border-gold-dark/20 bg-dark-primary/30 flex items-center gap-4 rounded-xl border p-3 sm:p-4"
                >
                  <div className="flex-shrink-0">
                    <Image
                      src={icons[index]}
                      alt={placeLabels[index]}
                      width={48}
                      height={48}
                      className="w-10 sm:w-12"
                      style={{ height: "auto" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                      {placeLabels[index]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {placePercentages[index]}% of prize pool
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-gold text-lg font-bold sm:text-xl">
                      {formatCurrency(placePrizes[index])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Runner-ups */}
          {additionalPositions > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🏅</span>
                <h4 className="text-gold-dark text-sm font-semibold">
                  Runner-ups
                </h4>
                <span className="border-gold-dark/30 ml-auto rounded-full border px-2 py-0.5 text-xs text-gray-400">
                  {remainingPercent}% of pool
                </span>
              </div>

              <div className="border-gold-dark/20 bg-dark-primary/30 flex h-[calc(100%-44px)] flex-col rounded-xl border p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      Positions 4 - {3 + additionalPositions}
                    </p>
                    <p className="text-xs text-gray-400">
                      {additionalPositions} additional prize positions
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-400">Each receives</p>
                    <p className="text-gold text-lg font-bold">
                      {formatCurrency(perRunnerUpPrize)}
                    </p>
                  </div>
                </div>

                <div className="border-gold-dark/10 flex-1 border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {runnerUpPositions.map((pos) => (
                      <div
                        key={pos.position}
                        className="border-gold-dark/20 bg-dark-secondary/50 flex items-center gap-2 rounded-lg border px-3 py-2"
                      >
                        <span className="text-gold text-sm font-semibold">
                          #{pos.position}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatCurrency(pos.prize)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-gold-dark/10 mt-auto border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total for runner-ups</span>
                    <span className="text-gold font-semibold">
                      {formatCurrency(perRunnerUpPrize * additionalPositions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function WinnerClanPrizeDistribution({ tournament }) {
  const t = useTranslations("prizes");

  const prizePoolUsd =
    tournament.prize_pool_usd || calculateActualPrizePool(tournament);
  const maxPlayersPerClan =
    tournament.max_players_per_clan || tournament.max_players / 2;
  const prizePerMember = Math.floor(prizePoolUsd / maxPlayersPerClan);

  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `${Number(amount).toLocaleString()} 💎`;
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="border-gold-dark/20 border-b px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="border-gold-dark/30 bg-gold-dark/10 flex h-10 w-10 items-center justify-center rounded-full border">
            <Image
              src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
              alt={t("prizeDistribution")}
              width={24}
              height={24}
              className="w-5"
              style={{ height: "auto" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("prizeDistribution")}
            </h3>
            <p className="text-xs text-gray-400">
              Clan Battle - Winner Takes All
            </p>
          </div>
        </div>
      </div>

      {/* Winner Takes All Section */}
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h4 className="text-gold-dark text-sm font-semibold">
            Winner Takes All
          </h4>
          <span className="border-gold-dark/30 ml-auto rounded-full border px-2 py-0.5 text-xs text-gray-400">
            100% to winning clan
          </span>
        </div>

        <div className="border-gold-dark/20 bg-dark-primary/30 rounded-xl border p-4 sm:p-5">
          <p className="mb-4 text-sm text-gray-400">
            The entire prize pool is split equally among all members of the
            winning clan.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="border-gold-dark/20 bg-dark-secondary/50 rounded-lg border p-3 sm:p-4">
              <p className="mb-1 text-xs text-gray-400">Total Prize Pool</p>
              <p className="text-gold text-lg font-bold sm:text-xl">
                {formatCurrency(prizePoolUsd)}
              </p>
            </div>
            <div className="border-gold-dark/20 bg-dark-secondary/50 rounded-lg border p-3 sm:p-4">
              <p className="mb-1 text-xs text-gray-400">Team Size</p>
              <p className="text-lg font-bold text-white sm:text-xl">
                {maxPlayersPerClan} players
              </p>
            </div>
          </div>

          <div className="border-gold-dark/30 bg-gold-dark/5 mt-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Each winner receives:
              </span>
              <span className="text-gold text-xl font-bold sm:text-2xl">
                {formatCurrency(prizePerMember)}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {formatCurrency(prizePoolUsd)} ÷ {maxPlayersPerClan} players
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ClanBattlePrizeDistribution({ prizeDistribution }) {
  const t = useTranslations("prizes");

  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `${Number(amount).toLocaleString()} 💎`;
  };

  if (!prizeDistribution) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="py-12 text-center">
          <div className="mb-4 text-4xl">🏆</div>
          <p className="mb-2 text-lg text-gray-300">{t("loading")}</p>
          <p className="text-sm text-gray-400">{t("loadingDescription")}</p>
        </div>
      </Card>
    );
  }

  const icons = [
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp",
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp",
  ];

  const placeLabels = [t("firstPlace"), t("secondPlace"), t("thirdPlace")];

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="border-gold-dark/20 border-b px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="border-gold-dark/30 bg-gold-dark/10 flex h-10 w-10 items-center justify-center rounded-full border">
            <Image
              src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/dollar_bag_jehifs.webp"
              alt={t("prizeDistribution")}
              width={24}
              height={24}
              className="w-5"
              style={{ height: "auto" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("prizeDistribution")}
            </h3>
            <p className="text-xs text-gray-400">
              Total pool: {formatCurrency(prizeDistribution.totalPrize)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Performers */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h4 className="text-gold-dark text-sm font-semibold">
                {t("topPerformers")}
              </h4>
              <span className="border-gold-dark/30 ml-auto rounded-full border px-2 py-0.5 text-xs text-gray-400">
                20% of pool
              </span>
            </div>

            <div className="space-y-3">
              {prizeDistribution.topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="border-gold-dark/20 bg-dark-primary/30 flex items-center gap-3 rounded-xl border p-3"
                >
                  <Image
                    src={icons[index]}
                    alt={placeLabels[index]}
                    width={40}
                    height={40}
                    className="w-8 flex-shrink-0"
                    style={{ height: "auto" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">
                      {placeLabels[index]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {performer.percentage}% {t("ofTotal")}
                    </p>
                  </div>
                  <p className="text-gold flex-shrink-0 text-lg font-bold">
                    {formatCurrency(performer.prize)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">👥</span>
              <h4 className="text-gold-dark text-sm font-semibold">
                {t("teamMembers")}
              </h4>
              <span className="border-gold-dark/30 ml-auto rounded-full border px-2 py-0.5 text-xs text-gray-400">
                80% of pool
              </span>
            </div>

            <div className="border-gold-dark/20 bg-dark-primary/30 h-[calc(100%-44px)] rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">
                    {prizeDistribution.remainingMembers.count} {t("members")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("equalDistribution80")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold text-lg font-bold">
                    {formatCurrency(
                      prizeDistribution.remainingMembers.individualPrize,
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{t("each")}</p>
                </div>
              </div>

              <div className="border-gold-dark/10 mt-auto border-t pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {t("totalForTeamMembers")}
                  </span>
                  <span className="text-gold font-semibold">
                    {formatCurrency(
                      prizeDistribution.remainingMembers.totalPrize,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
