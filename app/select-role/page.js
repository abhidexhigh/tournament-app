"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  syncUserWithStorage,
  updateUserRole,
  hasUserRole,
} from "../lib/authHelpers";
import { getCurrentUser } from "../lib/auth";

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Sync with localStorage
      const user = syncUserWithStorage(session.user);

      // If user already has a role, redirect to dashboard
      if (hasUserRole(user)) {
        router.push(
          user.type === "host" ? "/host/dashboard" : "/player/dashboard"
        );
      }
    }
  }, [session, status, router]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !session?.user) return;

    setLoading(true);

    // Update user role in localStorage
    const user = getCurrentUser();
    if (user) {
      updateUserRole(user.id, selectedRole);

      // Redirect to appropriate dashboard
      setTimeout(() => {
        router.push(
          selectedRole === "host" ? "/host/dashboard" : "/player/dashboard"
        );
      }, 500);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gold-gradient">Choose Your Role</span>
          </h1>
          <p className="text-gray-400">
            Select how you want to use the eSports Arena platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Player Role */}
          <button
            onClick={() => setSelectedRole("player")}
            className="text-left"
          >
            <Card
              hover
              glass
              className={`h-full transition-all duration-300 ${
                selectedRole === "player"
                  ? "border-gold shadow-lg shadow-gold/30 scale-105"
                  : ""
              }`}
            >
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-gold mb-2">Player</h2>
                <p className="text-gray-400">
                  Compete in tournaments and win prizes
                </p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✓</span>
                  <div>
                    <p className="text-white font-medium">Join Tournaments</p>
                    <p className="text-gray-400 text-sm">
                      Participate in various gaming events
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✓</span>
                  <div>
                    <p className="text-white font-medium">Win Prizes</p>
                    <p className="text-gray-400 text-sm">
                      Earn diamonds and rewards
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✓</span>
                  <div>
                    <p className="text-white font-medium">Track Progress</p>
                    <p className="text-gray-400 text-sm">
                      View your tournament history
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gold-dark/30">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Starting Balance
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gold text-xl">💎</span>
                    <span className="text-gold font-bold">1,000</span>
                  </div>
                </div>
              </div>
            </Card>
          </button>

          {/* Host Role */}
          <button onClick={() => setSelectedRole("host")} className="text-left">
            <Card
              hover
              glass
              className={`h-full transition-all duration-300 ${
                selectedRole === "host"
                  ? "border-gold shadow-lg shadow-gold/30 scale-105"
                  : ""
              }`}
            >
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">👑</div>
                <h2 className="text-2xl font-bold text-gold mb-2">Host</h2>
                <p className="text-gray-400">Create and manage tournaments</p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✓</span>
                  <div>
                    <p className="text-white font-medium">Create Tournaments</p>
                    <p className="text-gray-400 text-sm">
                      Host your own gaming events
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✓</span>
                  <div>
                    <p className="text-white font-medium">Manage Players</p>
                    <p className="text-gray-400 text-sm">
                      View participants and track progress
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✓</span>
                  <div>
                    <p className="text-white font-medium">Distribute Prizes</p>
                    <p className="text-gray-400 text-sm">
                      Automatic prize distribution to winners
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gold-dark/30">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Starting Balance
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gold text-xl">💎</span>
                    <span className="text-gold font-bold">5,000</span>
                  </div>
                </div>
              </div>
            </Card>
          </button>
        </div>

        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedRole || loading}
            onClick={handleRoleSelection}
            className="min-w-[200px]"
          >
            {loading ? "Setting up..." : "Continue"}
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            You can change your role later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
