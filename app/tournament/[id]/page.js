"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "../../components/Button";
import Tabs from "../../components/Tabs";
import { calculatePrizes } from "../../lib/prizeCalculator";
import { tournamentsApi, usersApi } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";
import { getClanById, getUserClans } from "../../lib/dataLoader";
import { calculateClanBattlePrizeDistribution } from "../../lib/clanPrizeDistribution";
import {
  generateClanBattleLeaderboard,
  generateRegularLeaderboard,
} from "../../lib/leaderboardGenerator";
import {
  getDefaultPaymentMethod,
  validateTournamentPayment,
  canJoinTournament,
} from "../../lib/currencyHelper";
import { SINGLE_CURRENCY_MODE } from "../../lib/currencyConfig";

// Import new components
import TournamentHeader from "../../components/tournament/TournamentHeader";
import PaymentModal from "../../components/tournament/PaymentModal";
import WinnerDeclarationModal from "../../components/tournament/WinnerDeclarationModal";
import PrizeDistributionTab from "../../components/tournament/PrizeDistributionTab";
import MatchesTab from "../../components/tournament/MatchesTab";
import ParticipantsTab from "../../components/tournament/ParticipantsTab";
import RulesTab from "../../components/tournament/RulesTab";
import TournamentDetailsSkeleton from "../../components/skeletons/TournamentDetailsSkeleton";
import TopupModal from "../../components/TopupModal";
import { useToast } from "../../components/Toast";
import { useTranslations } from "../../contexts/LocaleContext";

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, refreshUser } = useUser();
  const toast = useToast();
  const t = useTranslations("tournament");
  const tCommon = useTranslations("common");

  // State
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState({ first: "", second: "", third: "" });
  const [errors, setErrors] = useState({});
  const [clan1, setClan1] = useState(null);
  const [clan2, setClan2] = useState(null);
  const [prizeDistribution, setPrizeDistribution] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("diamonds");
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [host, setHost] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Set default payment method based on currency mode and display_type
  useEffect(() => {
    if (tournament) {
      // In single currency mode, always use primary currency (ignore tickets)
      if (SINGLE_CURRENCY_MODE) {
        const defaultMethod = getDefaultPaymentMethod();
        setPaymentMethod(defaultMethod);
      } else if (tournament.display_type === "tournament") {
        // In dual currency mode, respect display_type
        setPaymentMethod("tickets");
      }
    }
  }, [tournament]);

  // Auto-select ticket type based on entry fee
  useEffect(() => {
    if (tournament && paymentMethod === "tickets") {
      const entryFeeUsd = Number(tournament.entry_fee_usd || 0);

      if (Math.abs(entryFeeUsd - 0.1) < 0.01) {
        setSelectedTicketType("ticket_010");
      } else if (Math.abs(entryFeeUsd - 1.0) < 0.01) {
        setSelectedTicketType("ticket_100");
      } else if (Math.abs(entryFeeUsd - 10.0) < 0.01) {
        setSelectedTicketType("ticket_1000");
      } else {
        setSelectedTicketType(null);
      }
    } else if (paymentMethod !== "tickets") {
      setSelectedTicketType(null);
    }
  }, [tournament, paymentMethod]);

  // Load tournament data
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        const tournamentData = await tournamentsApi.getById(params.id);
        setTournament(tournamentData);

        if (tournamentData) {
          // Load host information
          if (!tournamentData.is_automated) {
            const hostId = tournamentData.host_id ?? tournamentData.hostId;
            if (hostId) {
              const hostUser = await usersApi.getById(hostId);
              setHost(hostUser);
            }
          }

          // Load participants
          const participantsList = await Promise.all(
            tournamentData.participants.map((pId) => usersApi.getById(pId)),
          );
          const validParticipants = participantsList.filter(
            (p) => p !== null && p !== undefined && p.id,
          );
          setParticipants(validParticipants);

          // Load clan information for clan battle tournaments
          if (
            tournamentData.tournament_type === "clan_battle" &&
            tournamentData.clan_battle_mode === "clan_selection"
          ) {
            if (tournamentData.clan1_id) {
              const clan1Data = await getClanById(tournamentData.clan1_id);
              setClan1(clan1Data);
            }
            if (tournamentData.clan2_id) {
              const clan2Data = await getClanById(tournamentData.clan2_id);
              setClan2(clan2Data);
            }
          }

          // Calculate prize distribution for clan battle tournaments
          if (tournamentData.tournament_type === "clan_battle") {
            const maxPlayers =
              tournamentData.maxPlayers || tournamentData.max_players || 30;
            // 1 USD = 1 Diamond
            const prizePoolUsd =
              tournamentData.prize_pool_usd ||
              tournamentData.prize_pool ||
              tournamentData.prizePool ||
              0;

            if (prizePoolUsd > 0 && maxPlayers > 0) {
              const teamSize =
                tournamentData.clan_battle_mode === "auto_division"
                  ? Math.floor(maxPlayers / 2)
                  : maxPlayers / 2;

              const distribution = calculateClanBattlePrizeDistribution(
                prizePoolUsd,
                teamSize,
              );
              setPrizeDistribution(distribution);
            } else {
              setPrizeDistribution(null);
            }
          }

          // Generate leaderboard for completed tournaments
          if (
            tournamentData.status === "completed" &&
            tournamentData.participants &&
            tournamentData.participants.length > 0
          ) {
            if (validParticipants.length > 0) {
              let generatedLeaderboard = [];

              if (tournamentData.tournament_type === "clan_battle") {
                const winningTeam = tournamentData.winning_team || "clan1";
                generatedLeaderboard = generateClanBattleLeaderboard(
                  tournamentData,
                  validParticipants.map((p) => p.id),
                  winningTeam,
                );
              } else {
                generatedLeaderboard = generateRegularLeaderboard(
                  tournamentData,
                  validParticipants.map((p) => p.id),
                );
              }

              setLeaderboard(generatedLeaderboard);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load tournament:", error);
        setTournament(null);
      } finally {
        setInitialLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const handleJoinButtonClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    // For free tournaments, join directly without showing payment modal
    if (!tournament.entry_fee || tournament.entry_fee === 0) {
      handleJoinTournament();
      return;
    }

    // For paid tournaments, show payment modal
    setShowPaymentModal(true);
  };

  const handleJoinTournament = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    // In single currency mode, validate payment using currency helper
    if (SINGLE_CURRENCY_MODE) {
      const validation = validateTournamentPayment(user, tournament);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      // Set payment method to primary currency
      setPaymentMethod(validation.paymentMethod);
    }

    // Validate ticket selection for ticket-based entry (only in dual currency mode)
    if (!SINGLE_CURRENCY_MODE && paymentMethod === "tickets") {
      const entryFeeUsd = Number(tournament.entry_fee_usd || 0);
      let ticketType = selectedTicketType;

      // Auto-determine ticket type if not already selected
      if (!ticketType) {
        if (Math.abs(entryFeeUsd - 0.1) < 0.01) {
          ticketType = "ticket_010";
        } else if (Math.abs(entryFeeUsd - 1.0) < 0.01) {
          ticketType = "ticket_100";
        } else if (Math.abs(entryFeeUsd - 10.0) < 0.01) {
          ticketType = "ticket_1000";
        } else if (entryFeeUsd === 0 || !tournament.entry_fee) {
          ticketType = null;
        } else {
          toast.error(
            "No matching ticket type found for this tournament entry fee!",
          );
          return;
        }
      }

      // Check if user has the required ticket
      if (ticketType) {
        const ticketCount = user?.tickets?.[ticketType] || 0;
        if (ticketCount === 0) {
          toast.error(
            `You don't have any ${
              ticketType === "ticket_010"
                ? "$0.10"
                : ticketType === "ticket_100"
                  ? "$1.00"
                  : "$10.00"
            } tickets!`,
          );
          return;
        }
      }
    }

    // Check clan membership for clan battle tournaments
    if (tournament.tournament_type === "clan_battle") {
      if (tournament.clan_battle_mode === "clan_selection") {
        try {
          const userClans = await getUserClans(user.id);
          if (userClans.length === 0) {
            toast.warning(
              "You must be a member of a clan to join this tournament!",
            );
            return;
          }

          const isEligibleClan = userClans.some(
            (clan) =>
              clan.id === tournament.clan1_id ||
              clan.id === tournament.clan2_id,
          );
          if (!isEligibleClan) {
            const clan1Name = clan1 ? clan1.name : "Unknown";
            const clan2Name = clan2 ? clan2.name : "Unknown";
            toast.warning(
              `You can only join this tournament if you're a member of ${clan1Name} or ${clan2Name}!`,
            );
            return;
          }
        } catch (error) {
          console.error("Error checking clan membership:", error);
          toast.error("Error checking clan membership. Please try again.");
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Prepare payment data based on currency mode
      let paymentData = {};

      if (SINGLE_CURRENCY_MODE) {
        // In single currency mode, use primary currency
        const effectivePaymentMethod = getDefaultPaymentMethod();
        paymentData = {
          payment_method: effectivePaymentMethod,
        };
      } else {
        // In dual currency mode, handle tickets and other payment methods
        let finalTicketType = selectedTicketType;
        if (paymentMethod === "tickets" && !finalTicketType) {
          const entryFeeUsd = Number(tournament.entry_fee_usd || 0);
          if (Math.abs(entryFeeUsd - 0.1) < 0.01) {
            finalTicketType = "ticket_010";
          } else if (Math.abs(entryFeeUsd - 1.0) < 0.01) {
            finalTicketType = "ticket_100";
          } else if (Math.abs(entryFeeUsd - 10.0) < 0.01) {
            finalTicketType = "ticket_1000";
          }
        }

        paymentData = {
          payment_method: paymentMethod,
        };

        if (paymentMethod === "tickets" && finalTicketType) {
          paymentData.ticket_type = finalTicketType;
        }
      }

      const updatedTournament = await tournamentsApi.join(
        tournament.id,
        user.id,
        paymentData,
      );
      setTournament(updatedTournament);

      // Refresh user data from API to get updated balance
      await refreshUser();

      const participantsList = await Promise.all(
        updatedTournament.participants.map((pId) => usersApi.getById(pId)),
      );
      const validParticipants = participantsList.filter(
        (p) => p !== null && p !== undefined && p.id,
      );
      setParticipants(validParticipants);

      // Close payment modal
      setShowPaymentModal(false);

      toast.success("Successfully joined the tournament! 🎉");
    } catch (error) {
      console.error("Failed to join tournament:", error);
      toast.error(
        error.message ||
          "Failed to join tournament. It may be full or you're already registered.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinners = async () => {
    // Validate
    const newErrors = {};

    if (!winners.first) newErrors.first = "1st place winner is required";
    if (!winners.second) newErrors.second = "2nd place winner is required";
    if (!winners.third) newErrors.third = "3rd place winner is required";

    // Check for duplicates
    if (winners.first && winners.second && winners.first === winners.second) {
      newErrors.duplicate = "Winners must be different players";
    }
    if (winners.first && winners.third && winners.first === winners.third) {
      newErrors.duplicate = "Winners must be different players";
    }
    if (winners.second && winners.third && winners.second === winners.third) {
      newErrors.duplicate = "Winners must be different players";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const updatedTournament = await tournamentsApi.declareWinners(
        tournament.id,
        winners,
        user.id,
      );
      setTournament(updatedTournament);
      setShowWinnerModal(false);
      toast.success("Winners declared! Prizes have been distributed. 🏆");
    } catch (error) {
      console.error("Failed to declare winners:", error);
      toast.error(
        error.message || "Failed to declare winners. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      const updatedTournament = await tournamentsApi.updateStatus(
        tournament.id,
        "ongoing",
      );
      setTournament(updatedTournament);
      toast.success("Tournament started! 🚀");
    } catch (error) {
      console.error("Failed to start tournament:", error);
      toast.error(error.message || "Failed to start tournament");
    }
  };

  // Show loading state
  if (initialLoading) {
    return <TournamentDetailsSkeleton />;
  }

  // Show not found state
  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎮</div>
          <p className="text-gray-400">{t("notFound")}</p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="secondary">{t("backToTournaments")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isHost = user && (tournament.host_id ?? tournament.hostId) === user.id;
  const isParticipant = user && tournament.participants.includes(user.id);

  // Check if tournament is still joinable
  const isTournamentJoinable = () => {
    const now = new Date();
    if (tournament.expires_at) {
      const expiresAt = new Date(tournament.expires_at);
      if (!isNaN(expiresAt.getTime())) {
        return now < expiresAt;
      }
    }
    return tournament.status === "upcoming";
  };

  const canJoin =
    user &&
    !isParticipant &&
    isTournamentJoinable() &&
    tournament.status !== "cancelled" &&
    tournament.participants.length <
      (tournament.max_players ?? tournament.maxPlayers);

  const prizes = calculatePrizes(tournament);

  // Define tab content
  const tabs = [
    {
      id: "prize-distribution",
      label: t("prizeDistribution"),
      content: (
        <PrizeDistributionTab
          tournament={tournament}
          prizeDistribution={prizeDistribution}
          prizes={prizes}
        />
      ),
    },
    // {
    //   id: "matches",
    //   label: "Matches",
    //   // badge: tournament.status === "completed" ? leaderboard.length : null,
    //   content: <MatchesTab />,
    // },
    // {
    //   id: "participants",
    //   label: "Participants",
    //   content: (
    //     <ParticipantsTab
    //       participants={participants}
    //       tournament={tournament}
    //       clan1={clan1}
    //       clan2={clan2}
    //     />
    //   ),
    // },
    {
      id: "rules",
      label: t("rules"),
      content: <RulesTab rules={tournament.rules} />,
    },
    {
      id: "stream",
      label: t("stream"),
      content: (
        <div className="py-4">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-900">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/csqTQ4TOs_g?si=ua5nRV52572zm9bG"
                title="TFT Tournament Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <p className="text-center text-sm text-gray-400">
              {t("watchLiveStream") ||
                "Watch TFT gameplay and tournament highlights"}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-8 lg:px-8">
      <div className="max-w-main mx-auto">
        {/* Back Button */}
        <Link href="/" className="mb-4 inline-block sm:mb-6">
          <Button variant="ghost" size="sm">
            ← {t("backToTournaments")}
          </Button>
        </Link>

        {/* Tournament Header */}
        <TournamentHeader
          tournament={tournament}
          host={host}
          user={user}
          clan1={clan1}
          clan2={clan2}
          canJoin={canJoin}
          isHost={isHost}
          isParticipant={isParticipant}
          loading={loading}
          onJoin={handleJoinButtonClick}
          onStart={handleStartTournament}
          onDeclareWinners={() => setShowWinnerModal(true)}
        />

        {/* Tabbed Content */}
        <Tabs tabs={tabs} defaultTab="prize-distribution" variant="divided" />

        {/* Winner Declaration Modal */}
        <WinnerDeclarationModal
          show={showWinnerModal}
          winners={winners}
          setWinners={setWinners}
          errors={errors}
          setErrors={setErrors}
          prizes={prizes}
          participants={participants}
          loading={loading}
          onConfirm={handleDeclareWinners}
          onCancel={() => setShowWinnerModal(false)}
        />

        {/* Payment Method Selection Modal */}
        <PaymentModal
          show={showPaymentModal}
          tournament={tournament}
          user={user}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          loading={loading}
          onConfirm={handleJoinTournament}
          onCancel={() => setShowPaymentModal(false)}
          onAddMoney={() => {
            setShowPaymentModal(false);
            setShowTopupModal(true);
          }}
        />

        {/* Topup Modal for adding money */}
        <TopupModal
          isOpen={showTopupModal}
          onClose={() => setShowTopupModal(false)}
          user={user}
        />
      </div>
    </div>
  );
}
