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
    <nav className="sticky top-0 z-50">
      {/* Main Navbar Container */}
      <div className="relative bg-gradient-to-b from-[#1a1a24] via-[#14141c] to-[#0f0f15] border-b border-gold/20 shadow-[0_4px_30px_rgba(212,175,55,0.1)]">
        {/* Decorative top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        
        <div className="max-w-main mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/" className="group relative flex items-center space-x-3">
                {/* Logo glow effect */}
                <div className="absolute -inset-2 bg-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gold/20 to-amber-900/20 border border-gold/30 group-hover:border-gold/50 transition-all duration-300">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">⚔️</span>
                </div>
                <div className="relative">
                  <span className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent tracking-wide">
                    Force of Rune
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-gold/50 via-gold/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              </Link>

              {/* Nav Divider */}
              <div className="hidden md:block h-6 w-[1px] bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

              {/* Tournaments Link */}
              <Link
                href="/"
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold tracking-wide transition-all duration-300 ${
                  pathname === "/"
                    ? "bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : "text-gray-300 hover:text-gold hover:bg-white/5 border border-transparent"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
                {t("tournaments")}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-4 md:flex">
              {user && user.type ? (
              <>
                {/* <Link
                  href={
                    user.type === "host"
                      ? "/host/dashboard"
                      : user.type === "game_owner"
                        ? "/admin/dashboard"
                        : "/player/dashboard"
                  }
                  className={`text-base font-medium transition-colors duration-300 ${
                    pathname.includes("dashboard")
                      ? "text-gold"
                      : "hover:text-gold text-gray-300"
                  }`}
                >
                  {user.type === "game_owner"
                    ? t("adminDashboard")
                    : t("dashboard")}
                </Link> */}

                {/* Currency Balance - Clickable (hide for admin) */}
                {user.type !== "game_owner" && (
                  <button
                    onClick={() => setIsTopupModalOpen(true)}
                    className="group relative flex items-center space-x-2 rounded-xl bg-gradient-to-r from-gold/15 via-amber-900/10 to-gold/5 border border-gold/30 hover:border-gold/60 px-4 py-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative text-lg transition-transform duration-200 group-hover:scale-110">
                      {getPrimaryCurrency().emoji}
                    </span>
                    <span className="relative text-gold text-sm font-bold tracking-wide">
                      {getUserBalanceDisplay(user).formatted}
                    </span>
                    <svg className="relative w-4 h-4 text-gold/60 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="group relative flex items-center space-x-2.5 rounded-xl bg-gradient-to-br from-[#1e1e2a] to-[#16161e] border border-gold/20 hover:border-gold/40 px-3 py-1.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  >
                    {/* Active indicator ring */}
                    <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                    
                    <div className="relative">
                      {user.avatar &&
                      (user.avatar.startsWith("http") ||
                        user.avatar.startsWith("/")) ? (
                        <Image
                          src={user.avatar}
                          alt="User Avatar"
                          width={30}
                          height={30}
                          className="rounded-full ring-2 ring-gold/30 group-hover:ring-gold/50 transition-all"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-gold/20 to-amber-900/20 flex h-[30px] w-[30px] items-center justify-center rounded-full text-lg ring-2 ring-gold/30 group-hover:ring-gold/50 transition-all">
                          {user.avatar || "👤"}
                        </div>
                      )}
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#16161e]" />
                    </div>
                    <p className="text-gray-200 group-hover:text-gold text-sm font-semibold transition-colors">
                      {user.username}
                    </p>
                    <svg
                      className={`text-gold/60 group-hover:text-gold h-4 w-4 transition-all duration-300 ${
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
                    <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-b from-[#1a1a24] to-[#12121a] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(212,175,55,0.1)] animate-fadeIn">
                      {/* Decorative top border */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                      
                      {/* User Info Header */}
                      <div className="border-b border-gold/10">
                        <Link 
                          href={
                            user.type === "host"
                              ? "/host/dashboard"
                              : user.type === "game_owner"
                                ? "/admin/dashboard"
                                : "/player/dashboard"
                          }
                          className="group relative block px-5 py-4 transition-all hover:bg-gold/5"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              {user.avatar &&
                              (user.avatar.startsWith("http") ||
                                user.avatar.startsWith("/")) ? (
                                <Image
                                  src={user.avatar}
                                  alt="User Avatar"
                                  width={56}
                                  height={56}
                                  className="rounded-xl ring-2 ring-gold/30 group-hover:ring-gold/50 transition-all"
                                />
                              ) : (
                                <div className="bg-gradient-to-br from-gold/20 to-amber-900/20 flex h-14 w-14 items-center justify-center rounded-xl text-3xl ring-2 ring-gold/30 group-hover:ring-gold/50 transition-all">
                                  {user.avatar || "👤"}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#1a1a24]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold text-white group-hover:text-gold transition-colors truncate">
                                {user.username}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold/80 border border-gold/20">
                                  {user.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 text-gold/60 group-hover:text-gold group-hover:bg-gold/20 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Wallet Balance Section (hide for admin) */}
                      {user.type !== "game_owner" && (
                        <div className="border-b border-gold/10 p-4">
                          <button
                            type="button"
                            onClick={() => setIsTopupModalOpen(true)}
                            className="group relative w-full overflow-hidden rounded-xl border border-gold/20 bg-gradient-to-r from-gold/10 via-amber-900/10 to-gold/5 p-4 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none active:scale-[0.98]"
                          >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-amber-800/20 border border-gold/30">
                                  <span className="text-2xl">
                                    {getPrimaryCurrency().emoji}
                                  </span>
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                                    {tWallet("walletBalance")}
                                  </p>
                                  <p className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                    {getUserBalanceDisplay(user).formatted}
                                  </p>
                                </div>
                              </div>
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300">
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
                            </div>
                          </button>
                          {!SINGLE_CURRENCY_MODE && (
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-2.5">
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
                      <div className="p-3">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="group hidden items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-gold/10"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold/80 group-hover:bg-gold/20 transition-colors">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-200 group-hover:text-gold transition-colors">
                              {tMenu("myProfile")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tMenu("viewEditProfile")}
                            </p>
                          </div>
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-red-400">
                              {t("logout")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tMenu("signOutAccount")}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Switcher - Last item */}
                <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
                <LanguageSwitcher variant="icon" />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="relative group text-gray-300 hover:text-gold border border-gold/30 hover:border-gold/60 rounded-xl px-5 py-2 font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">{t("login")}</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                  }}
                  className="relative group bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black rounded-xl px-5 py-2 font-bold transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative">{t("register")}</span>
                </button>
                <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
                <LanguageSwitcher variant="icon" />
              </div>
            )}
          </div>

          {/* Mobile: Language Switcher + Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSwitcher variant="icon" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent text-gold hover:border-gold/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300"
            >
              <svg
                className="h-5 w-5"
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
      
      {/* Decorative bottom border */}
      <div className="relative h-[3px] bg-gradient-to-r from-transparent via-gold/40 to-transparent">
        {/* <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gold/60 rotate-45" /> */}
      </div>
      
      {/* Optional: Bottom ornament images */}
      {/* <div className="-mt-2 hidden h-3 w-full items-center justify-between md:flex pointer-events-none">
        <Image
          src="/images/nav-border-left.webp"
          alt="Navbar Background"
          className="h-3 w-[30%] opacity-60"
          width={1000}
          height={100}
        />
        <Image
          src="/images/nav-border-right.webp"
          alt="Navbar Background"
          className="h-3 w-[30%] opacity-60"
          width={1000}
          height={100}
        />
      </div> */}
    </div>

      {/* Mobile Navigation - Modern Bottom Sheet Style (Portal) */}
      {mounted &&
        createPortal(
          <div className="md:hidden">
            {/* Backdrop Overlay - using solid background instead of backdrop-blur for iOS performance */}
            <div
              className={`fixed inset-0 z-[9998] bg-black/90 transition-all duration-300 ${
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
              <div className="relative flex h-full flex-col overflow-hidden border-l border-gold/20 bg-gradient-to-b from-[#1a1a24] via-[#14141c] to-[#0f0f15]">
                {/* Decorative gradient orbs */}
                <div className="bg-gold/15 pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 -left-10 h-32 w-32 rounded-full bg-amber-600/10 blur-2xl" />
                <div className="bg-gold/10 pointer-events-none absolute right-10 bottom-20 h-24 w-24 rounded-full blur-2xl" />

                {/* Header */}
                <div className="relative border-b border-gold/10">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gold/20 to-amber-900/20 border border-gold/30">
                        <span className="text-xl">⚔️</span>
                      </div>
                      <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                        Force of Rune
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Close menu"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/20 bg-gold/5 text-gold/60 transition-all hover:bg-gold/10 hover:text-gold hover:border-gold/40 active:scale-95"
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
                </div>

                {/* User Profile Card - Only when logged in */}
                {user && user.type && (
                  <div className="mx-4 mt-4 mb-2 rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/5 via-transparent to-transparent overflow-hidden">
                    <Link
                      href={
                        user.type === "host"
                          ? "/host/dashboard"
                          : user.type === "game_owner"
                            ? "/admin/dashboard"
                            : "/player/dashboard"
                      }
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-3 p-4 transition-all active:bg-gold/5"
                    >
                      <div className="relative">
                        {user.avatar &&
                        (user.avatar.startsWith("http") ||
                          user.avatar.startsWith("/")) ? (
                          <Image
                            src={user.avatar}
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl ring-2 ring-gold/30 transition-all group-active:ring-gold/50"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-gold/20 to-amber-900/20 ring-gold/30 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ring-2 transition-all group-active:ring-gold/50">
                            {user.avatar || "👤"}
                          </div>
                        )}
                        <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1a1a24] bg-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white group-active:text-gold transition-colors">
                          {user.username}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold/80 border border-gold/20">
                          {user.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 text-gold/60 group-active:text-gold transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>

                    {/* Wallet Balance - Inline compact (hide for admin) */}
                    {user.type !== "game_owner" && (
                      <button
                        onClick={() => {
                          setIsTopupModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-between rounded-xl border border-gold/20 bg-gradient-to-r from-gold/10 via-amber-900/10 to-transparent px-4 py-3 transition-all active:scale-[0.98] hover:border-gold/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-amber-900/20 border border-gold/30">
                            <span className="text-xl">
                              {getPrimaryCurrency().emoji}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Balance</p>
                            <span className="text-gold text-lg font-bold">
                              {getUserBalanceDisplay(user).formatted}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gold/20 text-gold flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
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
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-4 mb-2">Navigation</p>
                  <nav className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all active:scale-[0.98] ${
                        pathname === "/"
                          ? "bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                          : "text-gray-300 hover:bg-gold/5 border border-transparent"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname === "/" ? "bg-gold/20" : "bg-white/5"}`}>
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
                            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
                          />
                        </svg>
                      </div>
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
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all active:scale-[0.98] ${
                            pathname.includes("dashboard")
                              ? "bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                              : "text-gray-300 hover:bg-gold/5 border border-transparent"
                          }`}
                        >
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname.includes("dashboard") ? "bg-gold/20" : "bg-white/5"}`}>
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
                          </div>
                          {user.type === "game_owner"
                            ? t("adminDashboard")
                            : t("dashboard")}
                        </Link>
                      </>
                    )}
                  </nav>
                </div>

                {/* Bottom Section */}
                <div className="relative border-t border-gold/10 px-4 py-4">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                  {user && user.type ? (
                    /* Logout Button */
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-red-600/5 py-3.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/15 hover:border-red-500/30 active:scale-[0.98]"
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
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setAuthModalMode("login");
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="relative overflow-hidden border border-gold/30 bg-gradient-to-r from-gold/10 to-transparent text-gold hover:border-gold/50 rounded-xl py-3.5 text-center text-sm font-semibold transition-all active:scale-[0.98]"
                      >
                        {t("login")}
                      </button>
                      <button
                        onClick={() => {
                          setAuthModalMode("register");
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-3.5 text-center text-sm font-bold text-black transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-500" />
                        <span className="relative">{t("createAccount")}</span>
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
