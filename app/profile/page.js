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
    <div className="min-h-screen bg-dark-primary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold-gradient mb-2">
            User Profile
          </h1>
          <p className="text-gray-300">
            Manage your account settings and game information
          </p>
        </div>

        {/* Payment Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center w-full">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.username}
                </h2>
                <Badge
                  variant={user.type === "host" ? "gold" : "blue"}
                  className="mb-4"
                >
                  {user.type === "host" ? "Host" : "Player"}
                </Badge>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    <span className="text-gold">Email:</span> {user.email}
                  </p>
                  <div className="bg-dark-card border border-purple-500/30 rounded-lg p-3 my-2">
                    <p className="text-purple-400 font-medium mb-2 text-xs">
                      🎫 Tickets:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">$0.10:</span>
                        <span className="ml-1 font-semibold text-white">
                          {user.tickets?.ticket_010 || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">$1.00:</span>
                        <span className="ml-1 font-semibold text-white">
                          {user.tickets?.ticket_100 || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">$10.00:</span>
                        <span className="ml-1 font-semibold text-white">
                          {user.tickets?.ticket_1000 || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p>
                    <span className="text-gold">USD Balance:</span>{" "}
                    <span className="text-green-400 font-semibold">
                      ${Number(user.usd_balance || 0).toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className="text-gold">Diamonds:</span>{" "}
                    <span className="font-semibold">{user.diamonds} 💎</span>
                  </p>
                  <p>
                    <span className="text-gold">Rank:</span>{" "}
                    <span className={getRankColor(user.rank)}>
                      {user.rank || "Not set"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gold">Member since:</span>{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Top Up Button */}
                <div className="mt-6">
                  <Button
                    onClick={() => setShowTopupModal(true)}
                    className="w-full"
                    variant="primary"
                  >
                    💰 Top Up Wallet
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Game ID Settings */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Game ID Settings
                </h3>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit Game ID
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game ID
                  </label>
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        type="text"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        placeholder="Enter your game ID (e.g., PlayerName#1234)"
                        className="w-full"
                      />
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleSave("gameId")}
                          disabled={isLoading}
                          className="flex-1"
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
                    <div className="bg-dark-card border border-gold-dark/30 rounded-lg p-4">
                      <p className="text-white text-lg">
                        {user.gameId || "No game ID set"}
                      </p>
                      {!user.gameId && (
                        <p className="text-gray-400 text-sm mt-1">
                          Click &quot;Edit Game ID&quot; to add your game ID
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Display */}
                {message.text && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === "success"
                        ? "bg-green-900/20 border border-green-500/30 text-green-300"
                        : "bg-red-900/20 border border-red-500/30 text-red-300"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Help Text */}
                <div className="bg-dark-card border border-gold-dark/20 rounded-lg p-4">
                  <h4 className="text-gold font-medium mb-2">About Game ID</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>
                      • Your game ID is used to identify you in tournaments
                    </li>
                    <li>• Format: Username#Numbers (e.g., PlayerName#1234)</li>
                    <li>
                      • This ID will be visible to other players in tournaments
                    </li>
                    <li>• You can change your game ID at any time</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Rank Settings */}
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Rank Settings</h3>
                {!isEditingRank && (
                  <Button
                    onClick={() => setIsEditingRank(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit Rank
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Rank
                  </label>
                  {isEditingRank ? (
                    <div className="space-y-4">
                      <select
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full bg-dark-card border border-gold-dark/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
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
                          className="flex-1"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
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
                    <div className="bg-dark-card border border-gold-dark/30 rounded-lg p-4">
                      <p className={`text-lg ${getRankColor(user.rank)}`}>
                        {user.rank || "No rank set"}
                      </p>
                      {!user.rank && (
                        <p className="text-gray-400 text-sm mt-1">
                          Click &quot;Edit Rank&quot; to set your rank
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Rank Help Text */}
                <div className="bg-dark-card border border-gold-dark/20 rounded-lg p-4">
                  <h4 className="text-gold font-medium mb-2">About Ranks</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>
                      • Your rank determines which tournaments you can join
                    </li>
                    <li>
                      • Higher ranks can join tournaments with lower minimum
                      rank requirements
                    </li>
                    <li>
                      • Rank order: Silver → Gold → Platinum → Diamond → Master
                    </li>
                    <li>
                      • You can update your rank as you improve in the game
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Clan Memberships */}
        {user.type === "player" && (
          <div className="mt-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  🏰 Clan Memberships
                </h3>
                <Button
                  onClick={async () => {
                    try {
                      const clans = await getUserClans(user.id);
                      setUserClans(clans);
                    } catch (error) {
                      console.error("Error refreshing clan data:", error);
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  🔄 Refresh
                </Button>
              </div>

              {userClans.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏰</div>
                  <p className="text-gray-300 text-lg mb-2">
                    No Clan Memberships
                  </p>
                  <p className="text-gray-400">
                    You are not currently a member of any clans. Join clans to
                    participate in clan battle tournaments!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userClans.map((clan, index) => (
                    <div
                      key={clan.id}
                      className="bg-dark-card border border-gold-dark/30 rounded-lg p-4 hover:border-gold/50 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{clan.emblem}</span>
                        <div>
                          <h4 className="text-white font-bold text-lg">
                            {clan.name}
                          </h4>
                          <p className="text-gray-400 text-sm">[{clan.tag}]</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-gray-300 text-sm">
                          {clan.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gold">Level {clan.level}</span>
                          <span className="text-gray-400">
                            {clan.wins}W-{clan.losses}L
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant={clan.role === "leader" ? "gold" : "blue"}
                          size="sm"
                        >
                          {clan.role === "leader" ? "👑 Leader" : "👤 Member"}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          Joined {new Date(clan.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-dark-card border border-gold-dark/20 rounded-lg p-4">
                <h4 className="text-gold font-medium mb-2">
                  About Clan Memberships
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>
                    • You can be a member of multiple clans simultaneously
                  </li>
                  <li>• Each clan has different roles: Leader or Member</li>
                  <li>
                    • Clan memberships allow you to join clan battle tournaments
                  </li>
                  <li>• Leaders have special privileges in their clans</li>
                  <li>
                    • Your primary clan is shown first (usually where
                    you&apos;re a leader)
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-gold font-medium mb-2">Account Type</h4>
                <p className="text-gray-300">
                  {user.type === "host"
                    ? "You can create and manage tournaments"
                    : "You can join tournaments and compete for prizes"}
                </p>
              </div>
              <div>
                <h4 className="text-gold font-medium mb-2">Wallet & Tickets</h4>
                <p className="text-gray-300">
                  <span className="text-purple-400 font-semibold">
                    {(user.tickets?.ticket_010 || 0) +
                      (user.tickets?.ticket_100 || 0) +
                      (user.tickets?.ticket_1000 || 0)}{" "}
                    🎫 Tickets
                  </span>
                  <br />
                  <span className="text-green-400 font-semibold">
                    ${Number(user.usd_balance || 0).toFixed(2)} USD
                  </span>
                  {" & "}
                  <span className="font-semibold">
                    {user.diamonds} 💎 Diamonds
                  </span>
                  <br />
                  <span className="text-sm">
                    Use tickets or wallet for tournament entries
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-gold font-medium mb-2">Last Updated</h4>
                <p className="text-gray-300">
                  {new Date(user.updated_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-gold font-medium mb-2">Account Status</h4>
                <p className="text-green-300">Active</p>
              </div>
            </div>
          </Card>
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
