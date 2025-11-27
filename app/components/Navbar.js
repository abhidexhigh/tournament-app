"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "../contexts/UserContext";
import Image from "next/image";
import AuthModal from "./AuthModal";
import TopupModal from "./TopupModal";
import { getTicketCount } from "../lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

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

                {/* Diamond Balance - Clickable */}
                <button
                  onClick={() => setIsTopupModalOpen(true)}
                  className="from-gold/20 to-gold/5 border-gold/40 hover:border-gold hover:bg-gold/30 hover:shadow-gold/30 group flex items-center space-x-2 rounded-lg border bg-gradient-to-br px-3 py-1.5 transition-all duration-300 hover:shadow-lg"
                >
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                    💎
                  </span>
                  <span className="text-gold text-sm font-bold">
                    {(user.diamonds || 0).toLocaleString()}
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
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">💎</span>
                              <span className="text-gold text-sm font-bold">
                                Diamonds
                              </span>
                            </div>
                            <span className="text-gold font-bold">
                              {(user.diamonds || 0).toLocaleString()}
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
      <div className="-mt-3 flex items-center justify-between">
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="bg-dark-card border-gold-dark/20 border-t md:hidden">
          <div className="space-y-3 px-4 pt-2 pb-4">
            <Link
              href="/"
              className="hover:text-gold block py-2 text-gray-300 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
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
                  className="hover:text-gold block py-2 text-gray-300 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.type === "game_owner" ? "Admin Dashboard" : "Dashboard"}
                </Link>

                <div className="border-gold-dark/30 space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Image
                        src={user.avatar}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="font-medium text-white">
                        {user.username}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsTopupModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="from-gold/20 to-gold/5 border-gold/40 hover:border-gold flex items-center space-x-2 rounded-lg border bg-gradient-to-br px-3 py-1.5 transition-all active:scale-95"
                    >
                      <span className="text-gold text-lg">💎</span>
                      <span className="text-gold font-bold">
                        {(user.diamonds || 0).toLocaleString()}
                      </span>
                      <span className="text-gold/70 text-xs">+</span>
                    </button>
                  </div>

                  <Link
                    href="/profile"
                    className="hover:text-gold block w-full py-2 text-center text-gray-300 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-dark-primary text-gold border-gold-dark/50 hover:bg-gold hover:text-dark-primary w-full rounded-lg border px-4 py-2 text-center font-medium transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : status === "authenticated" && session?.user ? (
              <Link
                href="/select-role"
                className="bg-gold-gradient text-dark-primary hover:shadow-gold/50 block w-full rounded-lg px-6 py-2 text-center font-bold transition-all duration-300 hover:shadow-lg"
                onClick={() => setIsMenuOpen(false)}
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
                  className="text-gold border-gold-dark/50 hover:bg-gold/10 hover:border-gold block w-full rounded-lg border px-6 py-2 text-center font-semibold transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-gold-gradient text-dark-primary hover:shadow-gold/50 block w-full rounded-lg px-6 py-2 text-center font-bold transition-all duration-300 hover:shadow-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
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
