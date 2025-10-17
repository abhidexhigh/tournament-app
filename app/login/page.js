"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import {
  loginWithCredentials,
  registerUser,
  syncUserWithStorage,
  hasUserRole,
} from "../lib/authHelpers";
import { getCurrentUser } from "../lib/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Sync with localStorage
      const user = syncUserWithStorage(session.user);

      // If user has a role, redirect to dashboard
      if (hasUserRole(user)) {
        router.push(
          user.type === "host" ? "/host/dashboard" : "/player/dashboard"
        );
      } else {
        // If no role, redirect to role selection
        router.push("/select-role");
      }
    }
  }, [session, status, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        // Try to login with credentials
        const user = loginWithCredentials(formData.email, formData.password);
        if (user) {
          // Use NextAuth signIn for session management
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.ok) {
            // Session will be handled by useEffect
          } else {
            setErrors({ email: "Invalid credentials" });
          }
        } else {
          setErrors({ email: "Invalid credentials" });
        }
      } else {
        // Register new user
        const user = registerUser(
          formData.username,
          formData.email,
          formData.password
        );
        if (user) {
          // Sign in after registration
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.ok) {
            // Will redirect to role selection via useEffect
          }
        } else {
          setErrors({ email: "Email already exists" });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/select-role",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErrors({ email: "Google sign-in failed. Please try again." });
      setLoading(false);
    }
  };

  const quickLogin = async (email) => {
    setLoading(true);
    const user = loginWithCredentials(email, "password");
    if (user) {
      const result = await signIn("credentials", {
        email: email,
        password: "password",
        redirect: false,
      });

      if (result?.ok) {
        // Session will be handled by useEffect
      }
    }
    setLoading(false);
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
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Left Side - Form */}
        <div className="flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gold-gradient">
                {isLogin ? "Welcome Back!" : "Join the Arena"}
              </span>
            </h1>
            <p className="text-gray-400">
              {isLogin
                ? "Login to continue your journey"
                : "Create an account and start competing"}
            </p>
          </div>

          <Card className="mb-6">
            {/* Google Sign In Button */}
            <Button
              variant="outline"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mb-6"
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-xl">🔐</span>
                <span>Continue with Google</span>
              </span>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gold-dark/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-card text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  icon="👤"
                  error={errors.username}
                  required
                />
              )}

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                icon="📧"
                error={errors.email}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                icon="🔒"
                error={errors.password}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="mt-6"
              >
                {loading
                  ? "Processing..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gold transition-colors duration-300"
                disabled={loading}
              >
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <span className="text-gold font-bold">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-gold font-bold">Login</span>
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-gold transition-colors duration-300"
            >
              ← Back to Tournaments
            </Link>
          </div>
        </div>

        {/* Right Side - Quick Login & Info */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Quick Login Section */}
          <Card glass className="space-y-4">
            <h3 className="text-xl font-bold text-gold-gradient mb-4">
              🚀 Quick Login (Demo)
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Try the app instantly with pre-configured accounts
            </p>

            <div className="space-y-3">
              <h4 className="text-gold font-semibold text-sm">
                👑 Host Accounts
              </h4>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => quickLogin("progamer@youtube.com")}
                disabled={loading}
              >
                Login as ProGamerYT
              </Button>
              .;
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => quickLogin("gamingking@youtube.com")}
                disabled={loading}
              >
                Login as GamingKing
              </Button>
            </div>

            <div className="space-y-3 pt-4 border-t border-gold-dark/30">
              <h4 className="text-gold font-semibold text-sm">
                🎮 Player Accounts
              </h4>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => quickLogin("shadow@player.com")}
                disabled={loading}
              >
                Login as ShadowNinja
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => quickLogin("thunder@player.com")}
                disabled={loading}
              >
                Login as ThunderStrike
              </Button>
            </div>
          </Card>

          {/* Features */}
          <Card glass>
            <h3 className="text-xl font-bold text-gold-gradient mb-4">
              ✨ Platform Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="text-gold text-xl">⚔️</span>
                <div>
                  <p className="text-white font-medium">
                    Force of Rune Tournaments
                  </p>
                  <p className="text-gray-400 text-sm">
                    Compete in exclusive Force of Rune events
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-gold text-xl">🔐</span>
                <div>
                  <p className="text-white font-medium">Google OAuth</p>
                  <p className="text-gray-400 text-sm">
                    Quick sign-in with your Google account
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-gold text-xl">💎</span>
                <div>
                  <p className="text-white font-medium">Diamond Rewards</p>
                  <p className="text-gray-400 text-sm">
                    Win diamonds and claim your victory
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-gold text-xl">🏆</span>
                <div>
                  <p className="text-white font-medium">Compete & Win</p>
                  <p className="text-gray-400 text-sm">
                    Battle for glory and amazing prizes
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
