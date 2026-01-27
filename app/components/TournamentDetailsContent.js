"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "./Button";
import Tabs from "./Tabs";
import { calculatePrizes } from "../lib/prizeCalculator";
import { tournamentsApi, usersApi } from "../lib/api";
import { useUser } from "../contexts/UserContext";
import { getClanById, getUserClans } from "../lib/dataLoader";
import { calculateClanBattlePrizeDistribution } from "../lib/clanPrizeDistribution";
import {
  generateClanBattleLeaderboard,
  generateRegularLeaderboard,
} from "../lib/leaderboardGenerator";
import {
  getDefaultPaymentMethod,
  validateTournamentPayment,
} from "../lib/currencyHelper";
import { SINGLE_CURRENCY_MODE } from "../lib/currencyConfig";

// Import tournament components
import TournamentHeader from "./tournament/TournamentHeader";
import PaymentModal from "./tournament/PaymentModal";
import WinnerDeclarationModal from "./tournament/WinnerDeclarationModal";
import PrizeDistributionTab from "./tournament/PrizeDistributionTab";
import RulesTab from "./tournament/RulesTab";
import TopupModal from "./TopupModal";
import CancelConfirmationModal from "./tournament/CancelConfirmationModal";
import { useToast } from "./Toast";
import { useTranslations } from "../contexts/LocaleContext";

/**
 * Client component for tournament details page
 * Receives server-fetched tournament data as initialTournament
 */
export default function TournamentDetailsContent({ initialTournament, initialHost }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, refreshUser } = useUser();
  const toast = useToast();
  const t = useTranslations("tournament");

  // State - initialize with server data
  const [tournament, setTournament] = useState(initialTournament);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState({ first: "", second: "", third: "" });
  const [errors, setErrors] = useState({});
  const [clan1, setClan1] = useState(null);
  const [clan2, setClan2] = useState(null);
  const [prizeDistribution, setPrizeDistribution] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("diamonds");
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [host, setHost] = useState(initialHost);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Set default payment method based on currency mode and display_type
  useEffect(() => {
    if (tournament) {
      if (SINGLE_CURRENCY_MODE) {
        const defaultMethod = getDefaultPaymentMethod();
        setPaymentMethod(defaultMethod);
      } else if (tournament.display_type === "tournament") {
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

  // Load additional data (participants, clans, etc.)
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!tournament) return;

      try {
        // Load participants
        const participantsList = await Promise.all(
          tournament.participants.map((pId) => usersApi.getById(pId)),
        );
        const validParticipants = participantsList.filter(
          (p) => p !== null && p !== undefined && p.id,
        );
        setParticipants(validParticipants);

        // Load clan information for clan battle tournaments
        if (
          tournament.tournament_type === "clan_battle" &&
          tournament.clan_battle_mode === "clan_selection"
        ) {
          if (tournament.clan1_id) {
            const clan1Data = await getClanById(tournament.clan1_id);
            setClan1(clan1Data);
          }
          if (tournament.clan2_id) {
            const clan2Data = await getClanById(tournament.clan2_id);
            setClan2(clan2Data);
          }
        }

        // Calculate prize distribution for clan battle tournaments
        if (tournament.tournament_type === "clan_battle") {
          const maxPlayers = tournament.maxPlayers || tournament.max_players || 30;
          const prizePoolUsd =
            tournament.prize_pool_usd || tournament.prize_pool || tournament.prizePool || 0;

          if (prizePoolUsd > 0 && maxPlayers > 0) {
            const teamSize =
              tournament.clan_battle_mode === "auto_division"
                ? Math.floor(maxPlayers / 2)
                : maxPlayers / 2;

            const distribution = calculateClanBattlePrizeDistribution(prizePoolUsd, teamSize);
            setPrizeDistribution(distribution);
          }
        }

        // Generate leaderboard for completed tournaments
        if (
          tournament.status === "completed" &&
          tournament.participants?.length > 0 &&
          validParticipants.length > 0
        ) {
          let generatedLeaderboard = [];

          if (tournament.tournament_type === "clan_battle") {
            const winningTeam = tournament.winning_team || "clan1";
            generatedLeaderboard = generateClanBattleLeaderboard(
              tournament,
              validParticipants.map((p) => p.id),
              winningTeam,
            );
          } else {
            generatedLeaderboard = generateRegularLeaderboard(
              tournament,
              validParticipants.map((p) => p.id),
            );
          }

          setLeaderboard(generatedLeaderboard);
        }
      } catch (error) {
        console.error("Failed to load additional data:", error);
      }
    };

    loadAdditionalData();
  }, [tournament]);

  const handleJoinButtonClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!tournament.entry_fee || tournament.entry_fee === 0) {
      handleJoinTournament();
      return;
    }

    setShowPaymentModal(true);
  };

  const handleJoinTournament = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (SINGLE_CURRENCY_MODE) {
      const validation = validateTournamentPayment(user, tournament);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setPaymentMethod(validation.paymentMethod);
    }

    if (!SINGLE_CURRENCY_MODE && paymentMethod === "tickets") {
      const entryFeeUsd = Number(tournament.entry_fee_usd || 0);
      let ticketType = selectedTicketType;

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
          toast.error("No matching ticket type found for this tournament entry fee!");
          return;
        }
      }

      if (ticketType) {
        const ticketCount = user?.tickets?.[ticketType] || 0;
        if (ticketCount === 0) {
          toast.error(
            `You don't have any ${
              ticketType === "ticket_010" ? "$0.10" : ticketType === "ticket_100" ? "$1.00" : "$10.00"
            } tickets!`,
          );
          return;
        }
      }
    }

    if (tournament.tournament_type === "clan_battle") {
      if (tournament.clan_battle_mode === "clan_selection") {
        try {
          const userClans = await getUserClans(user.id);
          if (userClans.length === 0) {
            toast.warning("You must be a member of a clan to join this tournament!");
            return;
          }

          const isEligibleClan = userClans.some(
            (clan) => clan.id === tournament.clan1_id || clan.id === tournament.clan2_id,
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
      let paymentData = {};

      if (SINGLE_CURRENCY_MODE) {
        const effectivePaymentMethod = getDefaultPaymentMethod();
        paymentData = { payment_method: effectivePaymentMethod };
      } else {
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

        paymentData = { payment_method: paymentMethod };
        if (paymentMethod === "tickets" && finalTicketType) {
          paymentData.ticket_type = finalTicketType;
        }
      }

      const updatedTournament = await tournamentsApi.join(tournament.id, user.id, paymentData);
      setTournament(updatedTournament);

      await refreshUser();

      const participantsList = await Promise.all(
        updatedTournament.participants.map((pId) => usersApi.getById(pId)),
      );
      const validParticipants = participantsList.filter((p) => p !== null && p !== undefined && p.id);
      setParticipants(validParticipants);

      setShowPaymentModal(false);
      toast.success("Successfully joined the tournament! 🎉");
    } catch (error) {
      console.error("Failed to join tournament:", error);
      toast.error(
        error.message || "Failed to join tournament. It may be full or you're already registered.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinners = async () => {
    const newErrors = {};

    if (!winners.first) newErrors.first = "1st place winner is required";
    if (!winners.second) newErrors.second = "2nd place winner is required";
    if (!winners.third) newErrors.third = "3rd place winner is required";

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
      const updatedTournament = await tournamentsApi.declareWinners(tournament.id, winners, user.id);
      setTournament(updatedTournament);
      setShowWinnerModal(false);
      toast.success("Winners declared! Prizes have been distributed. 🏆");
    } catch (error) {
      console.error("Failed to declare winners:", error);
      toast.error(error.message || "Failed to declare winners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      const updatedTournament = await tournamentsApi.updateStatus(tournament.id, "ongoing");
      setTournament(updatedTournament);
      toast.success("Tournament started! 🚀");
    } catch (error) {
      console.error("Failed to start tournament:", error);
      toast.error(error.message || "Failed to start tournament");
    }
  };

  const handleCancelTournament = async () => {
    setLoading(true);

    try {
      const result = await tournamentsApi.cancelTournament(tournament.id, user.id);
      setTournament(result.data);
      setShowCancelModal(false);

      await refreshUser();

      toast.success(
        result.refundedCount > 0
          ? `Tournament cancelled! ${result.refundedCount} participant(s) refunded. 💰`
          : "Tournament cancelled successfully!",
      );
    } catch (error) {
      console.error("Failed to cancel tournament:", error);
      toast.error(error.message || "Failed to cancel tournament");
    } finally {
      setLoading(false);
    }
  };

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

  const isTournamentJoinable = () => {
    if (tournament.status !== "upcoming") return false;

    const now = new Date();
    if (tournament.expires_at) {
      const expiresAt = new Date(tournament.expires_at);
      if (!isNaN(expiresAt.getTime())) {
        return now < expiresAt;
      }
    }
    return true;
  };

  const canJoin =
    user &&
    !isParticipant &&
    isTournamentJoinable() &&
    tournament.status !== "cancelled" &&
    tournament.participants.length < (tournament.max_players ?? tournament.maxPlayers);

  const prizes = calculatePrizes(tournament);

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
              {t("watchLiveStream") || "Watch TFT gameplay and tournament highlights"}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-8 lg:px-8">
      <div className="max-w-main mx-auto">
        <Link href="/" className="mb-4 inline-block sm:mb-6">
          <Button variant="ghost" size="sm">
            ← {t("backToTournaments")}
          </Button>
        </Link>

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
          onCancel={() => setShowCancelModal(true)}
        />

        <Tabs tabs={tabs} defaultTab="prize-distribution" variant="divided" />

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

        <TopupModal isOpen={showTopupModal} onClose={() => setShowTopupModal(false)} user={user} />

        <CancelConfirmationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelTournament}
          tournament={tournament}
          loading={loading}
        />
      </div>
    </div>
  );
}
