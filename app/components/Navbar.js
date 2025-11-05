"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "../contexts/UserContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

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

                <div className="flex items-center space-x-4 border-l border-gold-dark/30 pl-6">
                  <div className="flex items-center space-x-2 bg-dark-card px-4 py-2 rounded-lg border border-gold-dark/30">
                    <span className="text-gold text-xl">💎</span>
                    <span className="text-gold font-bold">{user.diamonds}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{user.avatar}</span>
                    <span className="text-white font-medium">
                      {user.username}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    className={`text-sm font-medium transition-colors duration-300 ${
                      pathname === "/profile"
                        ? "text-gold"
                        : "text-gray-300 hover:text-gold"
                    }`}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-sm bg-dark-card text-gold border border-gold-dark/50 px-4 py-2 rounded-lg hover:bg-gold hover:text-dark-primary transition-all duration-300 font-medium"
                  >
                    Logout
                  </button>
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
