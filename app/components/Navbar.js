"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "../contexts/UserContext";
import Image from "next/image";
import AuthModal from "./AuthModal";
import TopupModal from "./TopupModal";
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
              Tournaments
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
                  {user.type === "game_owner" ? "Admin Dashboard" : "Dashboard"}
                </Link>

                {/* Currency Balance - Clickable */}
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

                {/* Profile Dropdown */}
                <div
                  className="border-gold-dark/30 relative border-l pl-4"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="from-dark-card to-dark-secondary border-gold-dark/30 hover:border-gold/50 hover:shadow-gold/20 group flex items-center space-x-2 rounded-xl border bg-gradient-to-br px-2 py-1 transition-all duration-300 hover:shadow-lg"
                  >
                    <Image
                      src={user.avatar}
                      alt="User Avatar"
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
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
                          <Image
                            src={user.avatar}
                            alt="User Avatar"
                            width={56}
                            height={56}
                          />
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

                      {/* Wallet Balance Section */}
                      <div className="bg-dark-secondary/50 border-gold-dark/20 border-b p-4">
                        <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          💰 Wallet Balance
                        </p>
                        <div className="space-y-2">
                          {SINGLE_CURRENCY_MODE ? (
                            /* Single Currency Mode - Show only primary currency */
                            <>
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl">
                                    {getPrimaryCurrency().emoji}
                                  </span>
                                  <span className="text-gold text-sm font-bold">
                                    {getPrimaryCurrency().displayName}
                                  </span>
                                </div>
                                <span className="text-gold font-bold">
                                  {getUserBalanceDisplay(user).formatted}
                                </span>
                              </div>
                              {/* Still show tickets if not in single currency mode for tickets */}
                              {!SINGLE_CURRENCY_MODE && (
                                <div className="flex items-center justify-between px-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xl">🎫</span>
                                    <span className="text-sm font-bold text-gray-300">
                                      Total Tickets
                                    </span>
                                  </div>
                                  <span className="font-bold text-purple-400">
                                    {getTicketCount(user.tickets)}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            /* Dual Currency Mode - Show all balances */
                            <>
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl">
                                    {getPrimaryCurrency().emoji}
                                  </span>
                                  <span className="text-gold text-sm font-bold">
                                    {getPrimaryCurrency().displayName}
                                  </span>
                                </div>
                                <span className="text-gold font-bold">
                                  {getUserBalanceDisplay(user).formatted}
                                </span>
                              </div>
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl">🎫</span>
                                  <span className="text-sm font-bold text-gray-300">
                                    Total Tickets
                                  </span>
                                </div>
                                <span className="font-bold text-purple-400">
                                  {getTicketCount(user.tickets)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="hover:bg-gold/10 group flex items-center space-x-3 px-4 py-3 transition-colors duration-200"
                        >
                          <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                            👤
                          </span>
                          <div>
                            <p className="text-gold text-sm font-medium">
                              My Profile
                            </p>
                            <p className="text-xs text-gray-400">
                              View and edit your profile
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
                              Logout
                            </p>
                            <p className="text-xs text-gray-400">
                              Sign out of your account
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : status === "authenticated" && session?.user ? (
              <>
                <Link
                  href="/select-role"
                  className="bg-gold-gradient text-dark-primary hover:shadow-gold/50 rounded-lg px-6 py-2 font-bold transition-all duration-300 hover:shadow-lg"
                >
                  Select Role
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-gold border-gold-dark/50 hover:bg-gold/10 hover:border-gold rounded-lg border px-5 py-2 font-semibold transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-gold-gradient text-dark-primary hover:shadow-gold/50 rounded-lg px-5 py-2 font-bold transition-all duration-300 hover:shadow-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gold focus:outline-none md:hidden"
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

      {/* Mobile Navigation - Slide-in Drawer (Portal) */}
      {mounted &&
        createPortal(
          <div className="md:hidden">
            {/* Backdrop Overlay */}
            <div
              className={`fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
                isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <div
              className={`fixed top-0 right-0 z-[9999] h-full w-[85%] max-w-sm transform shadow-2xl transition-transform duration-300 ease-out ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ backgroundColor: "#0a0a0f" }}
            >
              <div
                className="border-gold/20 flex h-full flex-col border-l"
                style={{
                  background:
                    "linear-gradient(to bottom, #1a1a24 0%, #101015 50%, #0a0a0f 100%)",
                }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚔️</span>
                    <span className="text-gold-gradient text-lg font-bold">
                      Force of Rune
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-400 transition-colors hover:text-white"
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
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-5 py-2">
                  <nav className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block rounded-lg px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                        pathname === "/"
                          ? "bg-gold/10 text-gold"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      Tournaments
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
                          className={`block rounded-lg px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                            pathname.includes("dashboard")
                              ? "bg-gold/10 text-gold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {user.type === "game_owner"
                            ? "Admin Dashboard"
                            : "Dashboard"}
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className={`block rounded-lg px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                            pathname === "/profile"
                              ? "bg-gold/10 text-gold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          Profile
                        </Link>
                      </>
                    )}
                  </nav>
                </div>

                {/* Bottom Section - Profile & Actions */}
                <div className="mt-auto border-t border-white/10 px-5 py-5">
                  {user && user.type ? (
                    <div className="space-y-4">
                      {/* User Info + Balance */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image
                            src={user.avatar}
                            alt="Avatar"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {user.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsTopupModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="border-gold/30 hover:border-gold/50 flex items-center gap-2 rounded-lg border bg-black/20 px-3 py-2 transition-all active:scale-[0.97]"
                        >
                          <span className="text-sm">
                            {getPrimaryCurrency().emoji}
                          </span>
                          <span className="text-gold text-sm font-bold">
                            {getUserBalanceDisplay(user).formatted}
                          </span>
                        </button>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full rounded-lg py-3 text-center text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.98]"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : status === "authenticated" && session?.user ? (
                    <Link
                      href="/select-role"
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-gold-gradient text-dark-primary block w-full rounded-lg py-3.5 text-center font-bold transition-all active:scale-[0.98]"
                    >
                      Select Role
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setAuthModalMode("login");
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="text-gold border-gold/30 hover:bg-gold/10 w-full rounded-lg border py-3 text-center font-semibold transition-all active:scale-[0.98]"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setAuthModalMode("register");
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="bg-gold-gradient text-dark-primary w-full rounded-lg py-3 text-center font-bold transition-all active:scale-[0.98]"
                      >
                        Create Account
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
