"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "../contexts/UserContext";
import { useTranslations } from "../contexts/LocaleContext";
import Image from "next/image";
import AuthModal from "./AuthModal";
import TopupModal from "./TopupModal";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTicketCount } from "../lib/utils";
import {
  SINGLE_CURRENCY_MODE,
  getPrimaryCurrency,
  getUserBalance,
} from "../lib/currencyConfig";
import { getUserBalanceDisplay } from "../lib/currencyHelper";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user, loading } = useUser();
  const t = useTranslations("nav");
  const tWallet = useTranslations("wallet");
  const tMenu = useTranslations("userMenu");

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Mount state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-dark-secondary border-gold-dark/20 bg-opacity-90 sticky top-0 z-50 border-b backdrop-blur-lg">
      <div className="max-w-main mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <span className="text-3xl">⚔️</span>
            <span className="text-gold-gradient text-2xl font-bold">
              Force of Rune
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-300 ${
                pathname === "/" ? "text-gold" : "hover:text-gold text-gray-300"
              }`}
            >
              {t("tournaments")}
            </Link>

            {user && user.type ? (
              <>
                <Link
                  href={
                    user.type === "host"
                      ? "/host/dashboard"
                      : user.type === "game_owner"
                        ? "/admin/dashboard"
                        : "/player/dashboard"
                  }
                  className={`text-sm font-medium transition-colors duration-300 ${
                    pathname.includes("dashboard")
                      ? "text-gold"
                      : "hover:text-gold text-gray-300"
                  }`}
                >
                  {user.type === "game_owner"
                    ? t("adminDashboard")
                    : t("dashboard")}
                </Link>

                {/* Currency Balance - Clickable (hide for admin) */}
                {user.type !== "game_owner" && (
                  <button
                    onClick={() => setIsTopupModalOpen(true)}
                    className="from-gold/20 to-gold/5 border-gold/40 hover:border-gold hover:bg-gold/30 hover:shadow-gold/30 group flex items-center space-x-2 rounded-lg border bg-gradient-to-br px-3 py-1.5 transition-all duration-300 hover:shadow-lg"
                  >
                    <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                      {getPrimaryCurrency().emoji}
                    </span>
                    <span className="text-gold text-sm font-bold">
                      {getUserBalanceDisplay(user).formatted}
                    </span>
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="from-dark-card to-dark-secondary border-gold-dark/30 hover:border-gold/50 hover:shadow-gold/20 group flex items-center space-x-2 rounded-xl border bg-gradient-to-br px-2 py-1 transition-all duration-300 hover:shadow-lg"
                  >
                    {user.avatar &&
                    (user.avatar.startsWith("http") ||
                      user.avatar.startsWith("/")) ? (
                      <Image
                        src={user.avatar}
                        alt="User Avatar"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="bg-gold/10 flex h-7 w-7 items-center justify-center rounded-full text-lg">
                        {user.avatar || "👤"}
                      </div>
                    )}
                    <p className="text-gold text-sm font-semibold">
                      {user.username}
                    </p>
                    <svg
                      className={`text-gold h-4 w-4 transition-transform duration-300 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="bg-dark-card border-gold-dark/30 animate-fadeIn absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border shadow-2xl">
                      {/* User Info Header */}
                      <div className="from-gold/20 via-gold/10 border-gold-dark/30 border-b bg-gradient-to-br to-transparent px-4 py-2">
                        <div className="flex items-center space-x-3">
                          {user.avatar &&
                          (user.avatar.startsWith("http") ||
                            user.avatar.startsWith("/")) ? (
                            <Image
                              src={user.avatar}
                              alt="User Avatar"
                              width={56}
                              height={56}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="bg-gold/10 flex h-14 w-14 items-center justify-center rounded-full text-3xl">
                              {user.avatar || "👤"}
                            </div>
                          )}
                          <div>
                            <p className="text-lg font-bold text-white">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {user.type}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Balance Section (hide for admin) */}
                      {user.type !== "game_owner" && (
                        <div className="border-gold-dark/20 border-b p-4">
                          <button
                            type="button"
                            onClick={() => setIsTopupModalOpen(true)}
                            className="group border-gold/30 from-gold/10 hover:border-gold/50 hover:from-gold/15 hover:shadow-gold/10 focus-visible:ring-gold/50 flex w-full cursor-pointer items-center justify-between rounded-lg border bg-gradient-to-r via-amber-900/10 to-transparent px-4 py-3 transition-all duration-200 hover:via-amber-900/15 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-gold/20 text-gold flex h-10 w-10 items-center justify-center rounded-lg">
                                <span className="text-xl">
                                  {getPrimaryCurrency().emoji}
                                </span>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                  {tWallet("walletBalance")}
                                </p>
                                <p className="text-gold text-lg font-bold">
                                  {getUserBalanceDisplay(user).formatted}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gold/20 text-gold group-hover:bg-gold/30 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </div>
                          </button>
                          {!SINGLE_CURRENCY_MODE && (
                            <div className="bg-dark-secondary/30 mt-2 flex items-center justify-between rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🎫</span>
                                <span className="text-sm font-semibold text-gray-300">
                                  {tWallet("totalTickets")}
                                </span>
                              </div>
                              <span className="font-bold text-purple-400">
                                {getTicketCount(user.tickets)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="hover:bg-gold/10 group flex hidden items-center space-x-3 px-4 py-3 transition-colors duration-200"
                        >
                          <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                            👤
                          </span>
                          <div>
                            <p className="text-gold text-sm font-medium">
                              {tMenu("myProfile")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tMenu("viewEditProfile")}
                            </p>
                          </div>
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="group flex w-full items-center space-x-3 px-4 py-3 transition-colors duration-200 hover:bg-red-500/10"
                        >
                          <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                            🚪
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-medium text-red-400">
                              {t("logout")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tMenu("signOutAccount")}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Switcher - Last item */}
                <div className="border-gold-dark/30 border-l pl-4">
                  <LanguageSwitcher variant="icon" />
                </div>
              </>
            ) : status === "authenticated" && session?.user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/select-role"
                  className="bg-gold-gradient text-dark-primary hover:shadow-gold/50 rounded-lg px-6 py-2 font-bold transition-all duration-300 hover:shadow-lg"
                >
                  {t("selectRole")}
                </Link>
                <LanguageSwitcher variant="icon" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-gold border-gold-dark/50 hover:bg-gold/10 hover:border-gold rounded-lg border px-5 py-2 font-semibold transition-all duration-300"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-gold-gradient text-dark-primary hover:shadow-gold/50 rounded-lg px-5 py-2 font-bold transition-all duration-300 hover:shadow-lg"
                >
                  {t("register")}
                </button>
                <LanguageSwitcher variant="icon" />
              </div>
            )}
          </div>

          {/* Mobile: Language Switcher + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher variant="icon" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gold focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="-mt-3 hidden h-3 w-full items-center justify-between md:flex">
        <Image
          src="/images/nav-border-left.webp"
          alt="Navbar Background"
          className="h-3 w-[30%]"
          width={1000}
          height={100}
        />
        <Image
          src="/images/nav-border-right.webp"
          alt="Navbar Background"
          className="h-3 w-[30%]"
          width={1000}
          height={100}
        />
      </div>

      {/* Mobile Navigation - Modern Bottom Sheet Style (Portal) */}
      {mounted &&
        createPortal(
          <div className="md:hidden">
            {/* Backdrop Overlay with blur */}
            <div
              className={`fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md transition-all duration-300 ${
                isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer Panel - Full height with glassmorphism */}
            <div
              className={`fixed top-0 right-0 z-[9999] h-full w-[88%] max-w-[340px] transform transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="relative flex h-full flex-col overflow-hidden border-l border-white/10 bg-[#0d0d12]/95 backdrop-blur-xl">
                {/* Decorative gradient orbs */}
                <div className="bg-gold/10 pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 -left-10 h-32 w-32 rounded-full bg-amber-600/8 blur-2xl" />
                <div className="bg-gold/5 pointer-events-none absolute right-10 bottom-20 h-24 w-24 rounded-full blur-2xl" />

                {/* Header */}
                <div className="relative flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⚔️</span>
                    <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                      Force of Rune
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* User Profile Card - Only when logged in */}
                {user && user.type && (
                  <div className="mx-4 mb-2 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.avatar &&
                        (user.avatar.startsWith("http") ||
                          user.avatar.startsWith("/")) ? (
                          <Image
                            src={user.avatar}
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="ring-gold/30 h-12 w-12 rounded-full ring-2"
                          />
                        ) : (
                          <div className="bg-gold/10 ring-gold/30 flex h-12 w-12 items-center justify-center rounded-full text-2xl ring-2">
                            {user.avatar || "👤"}
                          </div>
                        )}
                        <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0d0d12] bg-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">
                          {user.username}
                        </p>
                        <p className="text-xs font-medium text-gray-500 capitalize">
                          {user.type}
                        </p>
                      </div>
                    </div>

                    {/* Wallet Balance - Inline compact (hide for admin) */}
                    {user.type !== "game_owner" && (
                      <button
                        onClick={() => {
                          setIsTopupModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="border-gold/20 from-gold/10 mt-3 flex w-full items-center justify-between rounded-xl border bg-gradient-to-r via-amber-900/10 to-transparent px-3.5 py-2.5 transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getPrimaryCurrency().emoji}
                          </span>
                          <span className="text-gold text-lg font-bold">
                            {getUserBalanceDisplay(user).formatted}
                          </span>
                        </div>
                        <div className="bg-gold/20 text-gold flex h-7 w-7 items-center justify-center rounded-full">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <nav className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.98] ${
                        pathname === "/"
                          ? "bg-gold/15 text-gold"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
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
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                      {t("tournaments")}
                    </Link>

                    {user && user.type && (
                      <>
                        <Link
                          href={
                            user.type === "host"
                              ? "/host/dashboard"
                              : user.type === "game_owner"
                                ? "/admin/dashboard"
                                : "/player/dashboard"
                          }
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.98] ${
                            pathname.includes("dashboard")
                              ? "bg-gold/15 text-gold"
                              : "text-gray-300 hover:bg-white/5"
                          }`}
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
                              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                            />
                          </svg>
                          {user.type === "game_owner"
                            ? t("adminDashboard")
                            : t("dashboard")}
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.98] ${
                            pathname === "/profile"
                              ? "bg-gold/15 text-gold"
                              : "text-gray-300 hover:bg-white/5"
                          }`}
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
                              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {t("profile")}
                        </Link>
                      </>
                    )}
                  </nav>
                </div>

                {/* Bottom Section */}
                <div className="relative border-t border-white/[0.06] px-4 py-4">
                  {user && user.type ? (
                    /* Logout Button */
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/15 active:scale-[0.98]"
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
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                        />
                      </svg>
                      {t("signOut")}
                    </button>
                  ) : status === "authenticated" && session?.user ? (
                    <Link
                      href="/select-role"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-3.5 text-center font-bold text-black transition-all active:scale-[0.98]"
                    >
                      {t("selectRole")}
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setAuthModalMode("login");
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="border-gold/30 bg-gold/5 text-gold hover:bg-gold/10 rounded-xl border py-3 text-center text-sm font-semibold transition-all active:scale-[0.98]"
                      >
                        {t("login")}
                      </button>
                      <button
                        onClick={() => {
                          setAuthModalMode("register");
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-3 text-center text-sm font-bold text-black transition-all active:scale-[0.98]"
                      >
                        {t("createAccount")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Topup Modal */}
      <TopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        user={user}
      />
    </nav>
  );
}
