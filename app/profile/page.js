"use client";

import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useUser();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [rank, setRank] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (user) {
      setGameId(user.gameId || "");
      setRank(user.rank || "");
    }
  }, [user, status, router]);

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

  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{user.avatar}</div>
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
                  <p>
                    <span className="text-gold">Diamonds:</span> {user.diamonds}
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
                <h4 className="text-gold font-medium mb-2">Diamond Balance</h4>
                <p className="text-gray-300">
                  {user.diamonds} diamonds available for tournament entry fees
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
      </div>
    </div>
  );
}
