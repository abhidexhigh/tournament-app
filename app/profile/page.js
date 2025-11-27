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
import { getUserClans } from "../lib/dataLoader";
import { getTicketCount } from "../lib/utils";

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

            // Show diamonds purchased
            const successMessage = `Successfully purchased ${data.data.amount.toLocaleString()} 💎 Diamonds!`;

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
      <div className="bg-dark-primary flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-gold mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-300">
            {paymentProcessing ? "Processing payment..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-8">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-main relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(
                    user?.type === "player"
                      ? "/player/dashboard"
                      : "/host/dashboard",
                  )
                }
                className="text-gold hover:text-gold-light transition-colors"
              >
                <svg
                  className="h-6 w-6"
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
              <h1 className="text-gold-gradient text-3xl font-bold md:text-4xl">
                Settings
              </h1>
            </div>
            <button
              onClick={() =>
                router.push(
                  user?.type === "player"
                    ? "/player/dashboard"
                    : "/host/dashboard",
                )
              }
              className="bg-dark-primary/40 hover:bg-dark-card text-gold-light border-gold-dark/30 rounded-lg border px-6 py-2 transition-all"
            >
              Dashboard
            </button>
          </div>
          <div className="via-gold-dark/30 mt-4 h-px bg-gradient-to-r from-transparent to-transparent"></div>
        </div>

        {/* Payment Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 rounded-lg p-4 backdrop-blur-md ${
              message.type === "success"
                ? "border border-green-500/30 bg-green-900/20 text-green-300"
                : "border border-red-500/30 bg-red-900/20 text-red-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage({ type: "", text: "" })}
                className="ml-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Section - Profile Information */}
          <div className="lg:col-span-3">
            <div className="bg-dark-primary/40 border-gold-dark/20 rounded-xl border p-6 py-4 shadow-xl backdrop-blur-md">
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-x-4">
                  <div className="border-gold-dark/30 mb-4 h-24 w-24 overflow-hidden rounded-full border-2">
                    <Image
                      src={user.avatar}
                      alt="User Avatar"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start justify-start">
                    <h2 className="text-xl font-bold text-white">
                      {user.username}
                    </h2>
                    <p className="mb-0.5 text-xs text-gray-400">{user.email}</p>
                    <div className="bg-gold-dark/20 border-gold-dark/40 mb-3 inline-block rounded-full border px-3 py-0.5">
                      <span className="text-gold-light text-xs font-medium">
                        {user.type === "host" ? "Host" : "Player"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Diamonds */}
                <div className="bg-dark-primary/40 border-gold-dark/20 mb-3 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-blue-400">💎</span>
                    <span className="text-xs font-medium tracking-wider text-gray-300 uppercase">
                      Diamonds
                    </span>
                  </div>
                  <span className="text-xl font-black text-white">
                    {(user.diamonds || 0).toLocaleString()}
                  </span>
                </div>

                {/* Tickets Display (View Only) */}
                <div className="bg-dark-primary/40 border-gold-dark/20 mb-3 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-light text-lg">🎫</span>
                    <span className="text-xs font-medium tracking-wider text-gray-300 uppercase">
                      Tickets
                    </span>
                  </div>
                  <span className="text-xl font-black text-white">
                    {getTicketCount(user.tickets)}
                  </span>
                </div>

                <div className="via-gold-dark/30 my-4 h-[1px] bg-gradient-to-r from-transparent to-transparent"></div>
                <p className="text-xs text-gray-500">
                  Member Since :{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section - Game ID & Rank Settings */}
          <div className="space-y-6 lg:col-span-5">
            {/* Game ID Settings */}
            <div className="bg-dark-primary/40 border-gold-dark/20 rounded-xl border p-6 py-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Game ID Settings
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-dark-primary/60 hover:bg-dark-primary border-gold-dark/40 text-gold-light flex items-center gap-2 rounded-lg border px-4 py-2 text-xs transition-all"
                  >
                    <svg
                      className="h-4 w-4"
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
                <label className="mb-2 block text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Game ID
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder="Enter your game ID (e.g., PlayerName#1234)"
                      className="bg-dark-primary/60 border-gold-dark/30 w-full"
                    />
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleSave("gameId")}
                        disabled={isLoading}
                        className="bg-gold-dark hover:bg-gold text-dark-primary flex-1 font-semibold"
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
                  <div className="bg-dark-primary/40 border-gold-dark/30 rounded-lg border p-4">
                    <p className="text-sm font-medium text-white">
                      {user.gameId || "No game ID set"}
                    </p>
                    {!user.gameId && (
                      <p className="mt-1 text-xs text-gray-500">
                        Click &quot;Edit Game ID&quot; to add your game ID
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rank Settings & Clan Memberships - Combined */}
            <div className="bg-dark-primary/40 border-gold-dark/20 rounded-xl border p-6 shadow-xl backdrop-blur-md">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Rank Settings Column */}
                <div className="border-gold-dark/20 border-r">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      Rank Settings
                    </h3>
                    {!isEditingRank && (
                      <button
                        onClick={() => setIsEditingRank(true)}
                        className="bg-dark-primary/60 hover:bg-dark-primary border-gold-dark/40 text-gold-light flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-all"
                      >
                        <svg
                          className="h-3 w-3"
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
                    <label className="mb-2 block text-xs font-medium tracking-wider text-gray-400 uppercase">
                      Current Rank
                    </label>
                    {isEditingRank ? (
                      <div className="space-y-3">
                        <select
                          value={rank}
                          onChange={(e) => setRank(e.target.value)}
                          className="bg-dark-primary/60 border-gold-dark/30 focus:ring-gold w-full rounded-lg border px-4 py-3 text-white focus:border-transparent focus:ring-2 focus:outline-none"
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
                            className="bg-gold-dark hover:bg-gold text-dark-primary flex-1 font-semibold"
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
                              <div className="h-16 w-16 flex-shrink-0">
                                <Image
                                  src={getRankEmblem(user.rank)}
                                  alt={`${user.rank} Emblem`}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-500/20">
                                <span className="text-2xl">🥈</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                                Your Rank
                              </p>
                              <p
                                className={`text-xl font-black ${getRankColor(
                                  user.rank,
                                )}`}
                              >
                                {user.rank}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-3 text-center">
                            <p className="text-sm text-gray-400">No rank set</p>
                            <p className="mt-1 text-xs text-gray-500">
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
                    <div className="mb-4 flex items-center justify-between">
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
                      <label className="mb-2 block text-xs font-medium tracking-wider text-gray-400 uppercase">
                        Your Clan
                      </label>
                      {userClans.length === 0 ? (
                        <div className="bg-dark-primary/40 rounded-lg p-4 text-center">
                          <div className="mb-2 text-3xl">🏰</div>
                          <p className="text-xs text-gray-400">No clan</p>
                        </div>
                      ) : (
                        <div className="bg-dark-primary/40 rounded-lg p-4">
                          {userClans.slice(0, 1).map((clan) => (
                            <div key={clan.id}>
                              <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center">
                                  <span className="text-3xl">
                                    {clan.emblem || "🏰"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-base font-bold text-white">
                                    {clan.name}
                                  </h4>
                                  <p className="text-gold-light text-xs">
                                    [{clan.tag}]
                                  </p>
                                </div>
                              </div>

                              <div className="border-gold-dark/20 grid grid-cols-2 gap-2 border-t pt-2">
                                <div>
                                  <p className="mb-0.5 text-xs text-gray-500">
                                    Level
                                  </p>
                                  <p className="text-gold-light text-sm font-bold">
                                    {clan.level}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-0.5 text-xs text-gray-500">
                                    Role
                                  </p>
                                  <p className="text-xs font-medium text-white">
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
            <div className="bg-dark-primary/40 border-gold-dark/20 rounded-xl border p-6 py-4 shadow-xl backdrop-blur-md">
              <h3 className="mb-2 text-lg font-bold text-white">
                💎 Buy Diamonds
              </h3>
              <p className="mb-6 text-xs text-gray-400">
                Purchase diamonds for tournaments and rewards
              </p>

              {/* Current Diamond Balance */}
              <div className="from-gold/10 to-gold/5 border-gold/30 mb-6 rounded-lg border bg-gradient-to-br p-5">
                <div className="text-center">
                  <p className="mb-2 text-xs tracking-wider text-gray-400 uppercase">
                    Current Balance
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gold text-4xl font-black">
                      {(user.diamonds || 0).toLocaleString()}
                    </span>
                    <span className="text-2xl">💎</span>
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => setShowTopupModal(true)}
                className="from-gold-dark to-gold hover:from-gold hover:to-gold-light text-dark-primary mb-4 w-full transform rounded-lg bg-gradient-to-r px-6 py-4 text-base font-bold shadow-lg transition-all hover:scale-[1.02]"
              >
                💎 Buy Diamonds
              </button>

              {/* Info */}
              <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-center text-xs text-blue-300">
                  💡 1 Diamond = $1 USD | Secure payment via Stripe
                </p>
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
        <div className="bg-dark-primary flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-gold mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
