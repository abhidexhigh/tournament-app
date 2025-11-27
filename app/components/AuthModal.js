"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";
import {
  loginWithCredentials,
  registerUser,
  syncUserWithStorage,
  hasUserRole,
} from "../lib/authHelpers";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form based on initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
      setFormData({ username: "", email: "", password: "" });
      setErrors({});
      setShowQuickLogin(false);
    }
  }, [isOpen, initialMode]);

  // Handle session changes - Only redirect when modal is open (during login process)
  useEffect(() => {
    // Only handle redirects if the modal is open (user just logged in)
    if (!isOpen) return;

    if (status === "authenticated" && session?.user) {
      // Check if user is game owner (from session)
      if (session.user.type === "game_owner") {
        router.push("/admin/dashboard");
        onClose();
        return;
      }

      // Sync with localStorage
      const user = syncUserWithStorage(session.user);

      // If user has a role, redirect to dashboard
      if (hasUserRole(user)) {
        router.push(
          user.type === "host" ? "/host/dashboard" : "/player/dashboard",
        );
        onClose();
      } else {
        // If no role, redirect to role selection
        router.push("/select-role");
        onClose();
      }
    }
  }, [session, status, router, onClose, isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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
            username: formData.email,
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
          formData.password,
        );
        if (user) {
          // Sign in after registration
          const result = await signIn("credentials", {
            username: formData.email,
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

  const quickLogin = async (identifier, isUsername = false) => {
    setLoading(true);
    try {
      if (isUsername) {
        // For admin login (uses username)
        const result = await signIn("credentials", {
          username: identifier,
          password: "password",
          redirect: false,
        });
        if (result?.ok) {
          // Session will be handled by useEffect
        }
      } else {
        // For regular users (uses email)
        const user = loginWithCredentials(identifier, "password");
        if (user) {
          const result = await signIn("credentials", {
            username: identifier,
            password: "password",
            redirect: false,
          });
          if (result?.ok) {
            // Session will be handled by useEffect
          }
        }
      }
    } catch (error) {
      console.error("Quick login error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="animate-fadeIn fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - Centered */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="animate-slideUp relative w-full max-w-md">
          <Card
            className="shadow-gold/20 relative shadow-2xl"
            padding="p-6 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="hover:text-gold bg-dark-gray-card/50 hover:bg-dark-gray-card absolute top-4 right-4 z-10 rounded-full p-1.5 text-gray-400 transition-colors duration-300"
              aria-label="Close modal"
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

            {/* Secret Quick Login Trigger - Triple click the title */}
            <div className="mb-8 text-center">
              <h2
                className="text-gold-gradient cursor-pointer text-2xl font-bold transition-opacity select-none hover:opacity-80 sm:text-3xl"
                onClick={(e) => {
                  if (e.detail === 3) {
                    setShowQuickLogin(!showQuickLogin);
                  }
                }}
                title="Triple-click for quick access"
              >
                {isLogin ? "Welcome Back!" : "Join the Arena"}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {isLogin
                  ? "Login to continue your journey"
                  : "Create an account and start competing"}
              </p>
            </div>

            {/* Quick Login Panel (Hidden by default) */}
            {showQuickLogin && (
              <div className="animate-slideDown mb-6 rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-4 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-gold flex items-center gap-2 text-sm font-bold">
                    <span>🚀</span>
                    <span>Quick Login (Demo)</span>
                  </h3>
                  <button
                    onClick={() => setShowQuickLogin(false)}
                    className="hover:bg-dark-gray-card/50 rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:text-white"
                  >
                    Hide
                  </button>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => quickLogin("admin", true)}
                    disabled={loading}
                    className="border-0 !bg-gradient-to-r !from-purple-600 !to-blue-600 text-xs !text-white hover:!from-purple-700 hover:!to-blue-700"
                  >
                    👨‍💼 Admin
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => quickLogin("progamer@youtube.com")}
                      disabled={loading}
                      className="text-xs"
                    >
                      👑 Host 1
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => quickLogin("gamingking@youtube.com")}
                      disabled={loading}
                      className="text-xs"
                    >
                      👑 Host 2
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => quickLogin("shadow@player.com")}
                      disabled={loading}
                      className="text-xs"
                    >
                      🎮 Player 1
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => quickLogin("thunder@player.com")}
                      disabled={loading}
                      className="text-xs"
                    >
                      🎮 Player 2
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <Button
              variant="outline"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="!border-gold-dark/50 hover:!border-gold mb-6"
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-xl">🔐</span>
                <span>Continue with Google</span>
              </span>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="border-gold-dark/30 w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-dark-gray-card px-3 text-gray-400">
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
            <div className="border-gold-dark/20 mt-6 border-t pt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setFormData({ username: "", email: "", password: "" });
                }}
                className="hover:text-gold group text-sm text-gray-400 transition-colors duration-300"
                disabled={loading}
              >
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <span className="text-gold font-bold group-hover:underline">
                      Sign up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-gold font-bold group-hover:underline">
                      Login
                    </span>
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
