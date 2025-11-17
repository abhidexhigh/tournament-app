"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "../contexts/UserContext";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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
    <nav className="bg-dark-secondary border-b border-gold-dark/20 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-3xl">⚔️</span>
            <span className="text-2xl font-bold text-gold-gradient">
              Force of Rune
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-300 ${
                pathname === "/" ? "text-gold" : "text-gray-300 hover:text-gold"
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
                      : "text-gray-300 hover:text-gold"
                  }`}
                >
                  {user.type === "game_owner" ? "Admin Dashboard" : "Dashboard"}
                </Link>

                {/* Profile Dropdown */}
                <div
                  className="relative border-l border-gold-dark/30 pl-6"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-3 bg-gradient-to-br from-dark-card to-dark-secondary px-2 py-1 rounded-xl border border-gold-dark/30 hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 group"
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={user.avatar}
                        alt="User Avatar"
                        width={28}
                        height={28}
                      />
                      <div className="text-left">
                        <p className="text-gold font-semibold text-xs leading-tight">
                          {user.username}
                        </p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-gold text-[10px]">💎</span>
                          <span className="text-gold-light font-bold text-xs">
                            {user.diamonds || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gold transition-transform duration-300 ${
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
                    <div className="absolute right-0 mt-2 w-72 bg-dark-card rounded-xl shadow-2xl border border-gold-dark/30 overflow-hidden z-50 animate-fadeIn">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-br from-gold/20 via-gold/10 to-transparent px-4 py-2 border-b border-gold-dark/30">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar}
                            alt="User Avatar"
                            width={56}
                            height={56}
                          />
                          <div>
                            <p className="text-white font-bold text-lg">
                              {user.username}
                            </p>
                            <p className="text-gray-400 text-xs capitalize">
                              {user.type}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Balance Section */}
                      <div className="p-4 bg-dark-secondary/50 border-b border-gold-dark/20">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">
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
                              {user.diamonds || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">💵</span>
                              <span className="text-gold-light text-sm font-bold">
                                USD Balance
                              </span>
                            </div>
                            <span className="text-gold-light font-bold">
                              ${Number(user.usd_balance || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">🎫</span>
                              <span className="text-gray-300 text-sm font-bold">
                                Total Tickets
                              </span>
                            </div>
                            <span className="text-purple-400 font-bold">
                              {(user.tickets?.ticket_010 || 0) +
                                (user.tickets?.ticket_100 || 0) +
                                (user.tickets?.ticket_1000 || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gold/10 transition-colors duration-200 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                            👤
                          </span>
                          <div>
                            <p className="text-gold font-medium text-sm">
                              My Profile
                            </p>
                            <p className="text-gray-400 text-xs">
                              View and edit your profile
                            </p>
                          </div>
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors duration-200 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                            🚪
                          </span>
                          <div className="text-left">
                            <p className="text-red-400 font-medium text-sm">
                              Logout
                            </p>
                            <p className="text-gray-400 text-xs">
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
                  className="bg-gold-gradient text-dark-primary px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300"
                >
                  Select Role
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gold-gradient text-dark-primary px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gold focus:outline-none"
          >
            <svg
              className="w-6 h-6"
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
      <div className="flex items-center justify-between -mt-3">
        <img
          src="/images/nav-border-left.webp"
          alt="Navbar Background"
          className="w-[30%] h-3"
          width={1000}
          height={100}
        />
        <img
          src="/images/nav-border-right.webp"
          alt="Navbar Background"
          className="w-[30%] h-3"
          width={1000}
          height={100}
        />
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-card border-t border-gold-dark/20">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-300 hover:text-gold py-2 transition-colors duration-300"
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
                  className="block text-gray-300 hover:text-gold py-2 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.type === "game_owner" ? "Admin Dashboard" : "Dashboard"}
                </Link>

                <div className="pt-3 border-t border-gold-dark/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{user.avatar}</span>
                      <span className="text-white font-medium">
                        {user.username}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-dark-primary px-3 py-1.5 rounded-lg border border-gold-dark/30">
                      <span className="text-gold text-lg">💎</span>
                      <span className="text-gold font-bold">
                        {user.diamonds}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="block w-full text-center text-gray-300 hover:text-gold py-2 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center bg-dark-primary text-gold border border-gold-dark/50 px-4 py-2 rounded-lg hover:bg-gold hover:text-dark-primary transition-all duration-300 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : status === "authenticated" && session?.user ? (
              <Link
                href="/select-role"
                className="block w-full text-center bg-gold-gradient text-dark-primary px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Select Role
              </Link>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center bg-gold-gradient text-dark-primary px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
