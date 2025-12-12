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
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";
import { getUserClans } from "../lib/dataLoader";
import {
  PRIMARY_CURRENCY,
  getPrimaryCurrency,
  getUserBalance,
} from "../lib/currencyConfig";
import { useTranslations } from "../contexts/LocaleContext";

function ProfileContent() {
  const { user, updateUser, refreshUser } = useUser();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
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

            // Show purchased amount
            const currencyInfo = getPrimaryCurrency();
            const successMessage = `Successfully purchased ${currencyInfo.emoji}${data.data.amount.toLocaleString()} ${currencyInfo.displayName}!`;

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
    return <ProfileSkeleton />;
  }

  return (
    <div className="bg-dark-primary relative min-h-screen overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-gold-dark/5 absolute top-0 right-0 h-[600px] w-[600px] rounded-full blur-[120px]"></div>
        <div className="bg-gold-dark/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]"></div>
        <div className="bg-gold/3 absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Navigation Bar */}
        <nav className="mb-6 flex items-center justify-between sm:mb-10">
          <button
            onClick={() =>
              router.push(
                user?.type === "player"
                  ? "/player/dashboard"
                  : "/host/dashboard",
              )
            }
            className="group border-gold-dark/20 bg-dark-gray-card hover:border-gold-dark/40 hover:bg-gold-dark/20 hover:text-gold flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white/70 backdrop-blur-sm transition-all sm:gap-3 sm:px-5 sm:py-2.5"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">{t("backToDashboard")}</span>
            <span className="sm:hidden">{tCommon("back")}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs tracking-widest text-white/30 uppercase sm:inline">
              {t("profileSettings")}
            </span>
            <div className="bg-gold h-1.5 w-1.5 animate-pulse rounded-full"></div>
          </div>
        </nav>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-md sm:mb-8 sm:px-6 sm:py-4 ${
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {message.type === "success" ? "✓" : "!"}
              </span>
              <span className="text-sm">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-white/50 transition-colors hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Hero Profile Section */}
        <div className="border-gold-dark/20 bg-dark-gray-card relative mb-6 overflow-hidden rounded-2xl border p-5 sm:mb-8 sm:rounded-3xl sm:p-8 lg:p-10">
          {/* Decorative elements */}
          <div className="bg-gold-dark/10 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl sm:h-64 sm:w-64"></div>
          <div className="bg-gold/5 absolute bottom-0 left-1/3 h-32 w-32 rounded-full blur-2xl sm:h-48 sm:w-48"></div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Avatar + User Info */}
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="bg-gold-gradient absolute -inset-1 rounded-full opacity-75 blur"></div>
                <div className="border-gold-dark/50 relative h-20 w-20 overflow-hidden rounded-full border-2 sm:h-28 sm:w-28">
                  <Image
                    src={user.avatar}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="border-dark-primary bg-gold text-dark-primary absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:h-9 sm:w-9 sm:text-xs">
                  {user.type === "host" ? "H" : "P"}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-gold-gradient mb-1 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                  {user.username}
                </h1>
                <p className="mb-2 text-sm text-white/40">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="bg-gold-dark/20 text-gold-light rounded-full px-3 py-1 text-xs font-medium">
                    {user.type === "host"
                      ? `🎮 ${t("host")}`
                      : `⚔️ ${t("player")}`}
                  </span>
                  <span className="text-xs text-white/30">
                    {t("memberSince")}{" "}
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Balance + Buy Button */}
            <div className="border-gold-dark/30 bg-dark-primary/50 flex flex-col items-center gap-4 rounded-2xl border p-4 sm:flex-row sm:gap-6 sm:p-5 lg:p-6">
              {/* Balance */}
              <div className="text-center">
                <p className="mb-1 text-[10px] tracking-widest text-white/50 uppercase sm:text-xs">
                  {t("balance")}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{getPrimaryCurrency().emoji}</span>
                  <span className="text-gold text-3xl font-black sm:text-4xl">
                    {PRIMARY_CURRENCY === "USD"
                      ? `$${getUserBalance(user).toLocaleString()}`
                      : getUserBalance(user).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="bg-gold-dark/30 hidden h-14 w-px sm:block"></div>
              <div className="bg-gold-dark/30 h-px w-full sm:hidden"></div>

              {/* Buy Button */}
              <button
                onClick={() => setShowTopupModal(true)}
                className="bg-gold-gradient group/btn text-dark-primary shadow-gold/25 hover:shadow-gold/40 relative w-full overflow-hidden rounded-xl px-6 py-3 font-bold shadow-lg transition-all hover:scale-[1.02] sm:w-auto sm:px-8 sm:py-3.5"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>
                    {t("buyCurrency")} {getPrimaryCurrency().displayName}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Stripe Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 lg:justify-end">
            <svg
              className="text-gold-dark h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-[10px] text-white/40 sm:text-xs">
              {t("securePayments")}
            </span>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Game ID Card */}
          <div className="group border-gold-dark/20 bg-dark-gray-card hover:border-gold-dark/40 relative overflow-hidden rounded-2xl border p-5 transition-all sm:p-6">
            <div className="bg-gold-dark/10 group-hover:bg-gold-dark/20 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl transition-all"></div>
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gold-dark/20 text-gold flex h-10 w-10 items-center justify-center rounded-xl">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {t("gameId")}
                  </h3>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="border-gold-dark/30 bg-gold-dark/10 text-gold-light hover:border-gold-dark/50 hover:bg-gold-dark/20 rounded-lg border px-3 py-1.5 text-xs transition-all"
                  >
                    {tCommon("edit")}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    placeholder="PlayerName#1234"
                    className="border-gold-dark/30 bg-dark-primary focus:border-gold focus:ring-gold/20 w-full rounded-xl text-sm text-white placeholder-white/30"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("gameId")}
                      disabled={isLoading}
                      className="bg-gold-gradient text-dark-primary hover:shadow-gold/30 flex-1 rounded-xl py-2.5 text-xs font-semibold hover:shadow-lg"
                    >
                      {isLoading ? tCommon("saving") : tCommon("save")}
                    </Button>
                    <Button
                      onClick={() => handleCancel("gameId")}
                      variant="outline"
                      className="border-gold-dark/30 hover:bg-gold-dark/10 flex-1 rounded-xl py-2.5 text-xs text-white/70"
                    >
                      {tCommon("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-primary/50 rounded-xl p-4">
                  <p className="font-mono text-sm text-white sm:text-base">
                    {user.gameId || t("notSet")}
                  </p>
                  {!user.gameId && (
                    <p className="mt-1 text-xs text-white/30">
                      {t("clickToAddGameId")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rank Card */}
          <div className="group border-gold-dark/20 bg-dark-gray-card hover:border-gold-dark/40 relative overflow-hidden rounded-2xl border p-5 transition-all sm:p-6">
            <div className="bg-gold-dark/10 group-hover:bg-gold-dark/20 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl transition-all"></div>
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gold-dark/20 text-gold flex h-10 w-10 items-center justify-center rounded-xl">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {t("rank")}
                  </h3>
                </div>
                {!isEditingRank && (
                  <button
                    onClick={() => setIsEditingRank(true)}
                    className="border-gold-dark/30 bg-gold-dark/10 text-gold-light hover:border-gold-dark/50 hover:bg-gold-dark/20 rounded-lg border px-3 py-1.5 text-xs transition-all"
                  >
                    {tCommon("edit")}
                  </button>
                )}
              </div>

              {isEditingRank ? (
                <div className="space-y-3">
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="border-gold-dark/30 bg-dark-primary focus:border-gold focus:ring-gold/20 w-full rounded-xl border px-4 py-3 text-sm text-white focus:outline-none"
                  >
                    <option value="" className="bg-dark-primary">
                      {t("selectRank")}
                    </option>
                    <option value="Silver" className="bg-dark-primary">
                      Silver
                    </option>
                    <option value="Gold" className="bg-dark-primary">
                      Gold
                    </option>
                    <option value="Platinum" className="bg-dark-primary">
                      Platinum
                    </option>
                    <option value="Diamond" className="bg-dark-primary">
                      Diamond
                    </option>
                    <option value="Master" className="bg-dark-primary">
                      Master
                    </option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("rank")}
                      disabled={isLoading}
                      className="bg-gold-gradient text-dark-primary hover:shadow-gold/30 flex-1 rounded-xl py-2.5 text-xs font-semibold hover:shadow-lg"
                    >
                      {isLoading ? tCommon("saving") : tCommon("save")}
                    </Button>
                    <Button
                      onClick={() => handleCancel("rank")}
                      variant="outline"
                      className="border-gold-dark/30 hover:bg-gold-dark/10 flex-1 rounded-xl py-2.5 text-xs text-white/70"
                    >
                      {tCommon("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-primary/50 flex items-center gap-4 rounded-xl p-4">
                  {user.rank ? (
                    <>
                      {getRankEmblem(user.rank) ? (
                        <div className="h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
                          <Image
                            src={getRankEmblem(user.rank)}
                            alt={user.rank}
                            width={64}
                            height={64}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="bg-gold-dark/20 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
                          🥈
                        </div>
                      )}
                      <div>
                        <p className="text-xs tracking-wider text-white/40 uppercase">
                          {t("current")}
                        </p>
                        <p
                          className={`text-xl font-bold sm:text-2xl ${getRankColor(user.rank)}`}
                        >
                          {user.rank}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full py-2 text-center">
                      <p className="text-sm text-white/50">{t("noRankSet")}</p>
                      <p className="text-xs text-white/30">
                        {t("clickToSelect")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Clan Card */}
          {user.type === "player" && (
            <div className="group border-gold-dark/20 bg-dark-gray-card hover:border-gold-dark/40 relative overflow-hidden rounded-2xl border p-5 transition-all sm:p-6">
              <div className="bg-gold-dark/10 group-hover:bg-gold-dark/20 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl transition-all"></div>
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gold-dark/20 text-gold flex h-10 w-10 items-center justify-center rounded-xl">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {t("clan")}
                    </h3>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const clans = await getUserClans(user.id);
                        setUserClans(clans);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="hover:text-gold text-xs text-white/40 transition-colors"
                  >
                    ↻ {tCommon("refresh")}
                  </button>
                </div>

                {userClans.length === 0 ? (
                  <div className="bg-dark-primary/50 rounded-xl p-6 text-center">
                    <div className="mb-2 text-3xl">🏰</div>
                    <p className="text-sm text-white/50">{t("noClanJoined")}</p>
                  </div>
                ) : (
                  <div className="bg-dark-primary/50 rounded-xl p-4">
                    {userClans.slice(0, 1).map((clan) => (
                      <div key={clan.id} className="flex items-center gap-4">
                        <span className="text-3xl">{clan.emblem || "🏰"}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-white">
                            {clan.name}
                          </h4>
                          <p className="text-gold text-xs">[{clan.tag}]</p>
                          <div className="mt-2 flex gap-4 text-xs text-white/40">
                            <span>Lv. {clan.level}</span>
                            <span>
                              {clan.role === "leader"
                                ? `👑 ${t("leader")}`
                                : t("member")}
                            </span>
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
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
