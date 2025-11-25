"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useUser } from "../contexts/UserContext";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";
import TopupModal from "../components/TopupModal";
import { getTicketName } from "../lib/ticketConfig";
import { getUserClans } from "../lib/dataLoader";

function ProfileContent() {
  const { user, updateUser, refreshUser } = useUser();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameId, setGameId] = useState("");
  const [rank, setRank] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userClans, setUserClans] = useState([]);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processedSessions, setProcessedSessions] = useState(new Set());

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (user) {
      setGameId(user.gameId || "");
      setRank(user.rank || "");

      // Load user's clan memberships
      const loadClanData = async () => {
        try {
          const clans = await getUserClans(user.id);
          setUserClans(clans);
        } catch (error) {
          console.error("Error loading clan data:", error);
          setUserClans([]);
        }
      };

      loadClanData();
    }
  }, [user, status, router]);

  // Handle Stripe payment redirects
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    // Handle cancelled payment
    if (paymentStatus === "cancelled" && !processedSessions.has("cancelled")) {
      setProcessedSessions((prev) => new Set(prev).add("cancelled"));
      setMessage({
        type: "error",
        text: "Payment was cancelled. No charges were made.",
      });
      router.replace("/profile");
      return;
    }

    // Handle successful payment
    if (
      paymentStatus === "success" &&
      sessionId &&
      user &&
      !processedSessions.has(sessionId) &&
      !paymentProcessing
    ) {
      // Mark this session as being processed
      setProcessedSessions((prev) => new Set(prev).add(sessionId));
      setPaymentProcessing(true);

      // Clear URL immediately to prevent re-processing
      router.replace("/profile");

      // Process the payment
      const processPayment = async () => {
        try {
          const response = await fetch("/api/stripe/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();

          if (data.success) {
            // Update user context with new balance
            updateUser(data.data.user);

            let successMessage;
            if (data.data.currency === "tickets") {
              const ticketName = getTicketName(data.data.ticket_type);
              successMessage = `Successfully added ${data.data.amount}x ${ticketName} tickets! 🎫`;
            } else {
              const currency =
                data.data.currency === "usd" ? "USD" : "Diamonds";
              const symbol = data.data.currency === "usd" ? "$" : "💎";
              successMessage = `Successfully added ${symbol}${data.data.amount} ${currency} to your wallet!`;
            }

            setMessage({
              type: "success",
              text: successMessage,
            });
            // Refresh user data
            await refreshUser();
          } else {
            setMessage({
              type: "error",
              text: data.error || "Failed to process payment",
            });
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          setMessage({
            type: "error",
            text: "Failed to verify payment. Please contact support.",
          });
        } finally {
          setPaymentProcessing(false);
        }
      };

      processPayment();
    }
  }, [
    searchParams,
    user,
    processedSessions,
    paymentProcessing,
    updateUser,
    refreshUser,
    router,
  ]);

  const handleSave = async (field) => {
    if (!user) return;

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updateData =
        field === "gameId" ? { gameId: gameId.trim() } : { rank: rank };

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.data);
        if (field === "gameId") {
          setIsEditing(false);
          setMessage({
            type: "success",
            text: "Game ID updated successfully!",
          });
        } else {
          setIsEditingRank(false);
          setMessage({ type: "success", text: "Rank updated successfully!" });
        }
      } else {
        setMessage({
          type: "error",
          text: data.error || `Failed to update ${field}`,
        });
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setMessage({
        type: "error",
        text: `Failed to update ${field}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (field) => {
    if (field === "gameId") {
      setGameId(user?.gameId || "");
      setIsEditing(false);
    } else {
      setRank(user?.rank || "");
      setIsEditingRank(false);
    }
    setMessage({ type: "", text: "" });
  };

  const getRankColor = (rank) => {
    const colors = {
      Silver: "text-gray-400",
      Gold: "text-yellow-400",
      Platinum: "text-blue-400",
      Diamond: "text-purple-400",
      Master: "text-red-400",
    };
    return colors[rank] || "text-gray-300";
  };

  const getRankEmblem = (rank) => {
    const emblems = {
      Gold: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289695/Gold_Emblem_odau8h.webp",
      Platinum:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Platinum_Emblem_with_effect_ixwafm.webp",
      Diamond:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Diomond_Emblem_with_effect_g6lssd.webp",
      Master:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747291235/Master_Emblem_with_effect_rd2xt6.webp",
    };
    return emblems[rank] || null;
  };

  if (status === "loading" || !user || paymentProcessing) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-300">
            {paymentProcessing ? "Processing payment..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-main mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(
                    user?.type === "player"
                      ? "/player/dashboard"
                      : "/host/dashboard"
                  )
                }
                className="text-gold hover:text-gold-light transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-gold-gradient">
                Settings
              </h1>
            </div>
            <button
              onClick={() =>
                router.push(
                  user?.type === "player"
                    ? "/player/dashboard"
                    : "/host/dashboard"
                )
              }
              className="px-6 py-2 bg-dark-primary/40 hover:bg-dark-card text-gold-light border border-gold-dark/30 rounded-lg transition-all"
            >
              Dashboard
            </button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gold-dark/30 to-transparent mt-4"></div>
        </div>

        {/* Payment Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg backdrop-blur-md ${
              message.type === "success"
                ? "bg-green-900/20 border border-green-500/30 text-green-300"
                : "bg-red-900/20 border border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage({ type: "", text: "" })}
                className="text-gray-400 hover:text-white ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Section - Profile Information */}
          <div className="lg:col-span-3">
            <div className="bg-dark-primary/40 backdrop-blur-md border border-gold-dark/20 rounded-xl p-6 py-4 shadow-xl">
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-x-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gold-dark/30">
                    <Image
                      src={user.avatar}
                      alt="User Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start justify-start">
                    <h2 className="text-xl font-bold text-white">
                      {user.username}
                    </h2>
                    <p className="text-gray-400 text-xs mb-0.5">{user.email}</p>
                    <div className="inline-block px-3 py-0.5 bg-gold-dark/20 border border-gold-dark/40 rounded-full mb-3">
                      <span className="text-gold-light text-xs font-medium">
                        {user.type === "host" ? "Host" : "Player"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Tickets Display */}
                <div className="bg-dark-primary/40 border border-gold-dark/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">🎫</span>
                    <span className="text-gold-light text-xs font-medium uppercase tracking-wider">
                      Tickets
                    </span>
                    <span className="text-2xl font-black text-white">
                      {(user.tickets?.ticket_010 || 0) +
                        (user.tickets?.ticket_100 || 0) +
                        (user.tickets?.ticket_1000 || 0)}
                    </span>
                  </div>
                </div>

                {/* Diamonds */}
                <div className="flex items-center justify-between bg-dark-primary/40 border border-gold-dark/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-lg">💎</span>
                    <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">
                      Diamonds
                    </span>
                  </div>
                  <span className="text-white text-xl font-black">
                    {user.diamonds}
                  </span>
                </div>

                {/* USD Balance */}
                <div className="flex items-center justify-between bg-dark-primary/40 border border-gold-dark/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-lg">$</span>
                    <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">
                      USD Balance
                    </span>
                  </div>
                  <span className="text-white text-xl font-black">
                    ${Number(user.usd_balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-dark/30 to-transparent my-4"></div>
                <p className="text-gray-500 text-xs">
                  Member Since :{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section - Game ID & Rank Settings */}
          <div className="lg:col-span-5 space-y-6">
            {/* Game ID Settings */}
            <div className="bg-dark-primary/40 backdrop-blur-md border border-gold-dark/20 rounded-xl p-6 py-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Game ID Settings
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-primary/60 hover:bg-dark-primary border border-gold-dark/40 text-gold-light text-xs rounded-lg transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Game ID
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-2">
                  Game ID
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder="Enter your game ID (e.g., PlayerName#1234)"
                      className="w-full bg-dark-primary/60 border-gold-dark/30"
                    />
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleSave("gameId")}
                        disabled={isLoading}
                        className="flex-1 bg-gold-dark hover:bg-gold text-dark-primary font-semibold"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={() => handleCancel("gameId")}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-dark-primary/40 border border-gold-dark/30 rounded-lg p-4">
                    <p className="text-white text-sm font-medium">
                      {user.gameId || "No game ID set"}
                    </p>
                    {!user.gameId && (
                      <p className="text-gray-500 text-xs mt-1">
                        Click &quot;Edit Game ID&quot; to add your game ID
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rank Settings & Clan Memberships - Combined */}
            <div className="bg-dark-primary/40 backdrop-blur-md border border-gold-dark/20 rounded-xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rank Settings Column */}
                <div className="border-r border-gold-dark/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      Rank Settings
                    </h3>
                    {!isEditingRank && (
                      <button
                        onClick={() => setIsEditingRank(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-dark-primary/60 hover:bg-dark-primary border border-gold-dark/40 text-gold-light text-xs rounded-lg transition-all"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-2">
                      Current Rank
                    </label>
                    {isEditingRank ? (
                      <div className="space-y-3">
                        <select
                          value={rank}
                          onChange={(e) => setRank(e.target.value)}
                          className="w-full bg-dark-primary/60 border border-gold-dark/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                          <option value="">Select your rank</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                          <option value="Diamond">Diamond</option>
                          <option value="Master">Master</option>
                        </select>
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleSave("rank")}
                            disabled={isLoading}
                            className="flex-1 bg-gold-dark hover:bg-gold text-dark-primary font-semibold"
                          >
                            {isLoading ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            onClick={() => handleCancel("rank")}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-dark-primary/40 rounded-lg p-4">
                        {user.rank ? (
                          <div className="flex items-center gap-4">
                            {getRankEmblem(user.rank) ? (
                              <div className="w-16 h-16 flex-shrink-0">
                                <Image
                                  src={getRankEmblem(user.rank)}
                                  alt={`${user.rank} Emblem`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-500/20 rounded-full border-2 border-gray-400">
                                <span className="text-2xl">🥈</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                Your Rank
                              </p>
                              <p
                                className={`text-xl font-black ${getRankColor(
                                  user.rank
                                )}`}
                              >
                                {user.rank}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <p className="text-gray-400 text-sm">No rank set</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Click Edit to set
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clan Memberships Column */}
                {user.type === "player" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">
                        Clan Membership
                      </h3>
                      <button
                        onClick={async () => {
                          try {
                            const clans = await getUserClans(user.id);
                            setUserClans(clans);
                          } catch (error) {
                            console.error("Error refreshing clan data:", error);
                          }
                        }}
                        className="text-gold-light hover:text-gold text-xs transition-colors"
                      >
                        🔄 Refresh
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-2">
                        Your Clan
                      </label>
                      {userClans.length === 0 ? (
                        <div className="bg-dark-primary/40 rounded-lg p-4 text-center">
                          <div className="text-3xl mb-2">🏰</div>
                          <p className="text-gray-400 text-xs">No clan</p>
                        </div>
                      ) : (
                        <div className="bg-dark-primary/40 rounded-lg p-4">
                          {userClans.slice(0, 1).map((clan) => (
                            <div key={clan.id}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <span className="text-3xl">
                                    {clan.emblem || "🏰"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-bold text-base">
                                    {clan.name}
                                  </h4>
                                  <p className="text-gold-light text-xs">
                                    [{clan.tag}]
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold-dark/20">
                                <div>
                                  <p className="text-gray-500 text-xs mb-0.5">
                                    Level
                                  </p>
                                  <p className="text-gold-light font-bold text-sm">
                                    {clan.level}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-0.5">
                                    Role
                                  </p>
                                  <p className="text-white text-xs font-medium">
                                    {clan.role === "leader"
                                      ? "👑 Leader"
                                      : "👤 Member"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Section - Top Up Wallet */}
          <div className="lg:col-span-4">
            <div className="bg-dark-primary/40 backdrop-blur-md border border-gold-dark/20 rounded-xl p-6 py-4 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-2">
                Top Up Wallet
              </h3>
              <p className="text-gray-400 text-xs mb-6">
                Choose to add USD or Diamonds to your wallet
              </p>

              {/* Tickets Display */}
              <div className="bg-dark-primary/40 border border-gold-dark/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎫</span>
                    <span className="text-gray-300 text-sm uppercase tracking-wider">
                      Tickets
                    </span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {(user.tickets?.ticket_010 || 0) +
                      (user.tickets?.ticket_100 || 0) +
                      (user.tickets?.ticket_1000 || 0)}
                  </span>
                </div>
              </div>

              {/* Buy Tickets Button */}
              <button
                onClick={() => setShowTopupModal(true)}
                className="w-full bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-dark-primary text-sm font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg mb-6"
              >
                Buy Tickets
              </button>

              {/* Ticket Selection Section */}
              <div className="bg-dark-primary/40 border border-gold-dark/20 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">
                    $1 Tickets
                  </span>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 flex items-center justify-center bg-dark-card hover:bg-gold-dark/20 border border-gold-dark/40 rounded text-gold-light text-lg font-bold transition-colors">
                      −
                    </button>
                    <span className="text-xl font-black text-white w-12 text-center">
                      10
                    </span>
                    <button className="w-8 h-8 flex items-center justify-center bg-dark-card hover:bg-gold-dark/20 border border-gold-dark/40 rounded text-gold-light text-lg font-bold transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>10 x $1.00</span>
                    <span>Save $1.00 (10% off)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Value : $10.00
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">$9.00</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">
                      USD
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowTopupModal(true)}
                  className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold hover:via-gold-light hover:to-gold text-dark-primary text-sm font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg border-2 border-gold-light/20"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Topup Modal */}
        <TopupModal
          isOpen={showTopupModal}
          onClose={() => setShowTopupModal(false)}
          user={user}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
