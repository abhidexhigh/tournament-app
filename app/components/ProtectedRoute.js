"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "../contexts/UserContext";
import { hasUserRole } from "../lib/authHelpers";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  loadingComponent = null,
}) {
  const router = useRouter();
  const { status } = useSession();
  const { user, loading: userLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "loading" || userLoading) return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && user) {
      // Check if user has selected a role
      if (!hasUserRole(user)) {
        router.push("/select-role");
        return;
      }

      // Check if user has the required role
      if (requiredRole && user.type !== requiredRole) {
        // Special case: if host is required but user is player, redirect to player dashboard or home
        // and vice versa. For now, just redirect to home.
        router.push("/");
        return;
      }

      setIsAuthorized(true);
    } else if (status === "authenticated" && !user) {
      // Authenticated but user record not found yet or failed to load
      // This could happen for new OAuth users before they are created in DB
      router.push("/select-role");
    }
  }, [status, user, userLoading, router, requiredRole]);

  if (status === "loading" || userLoading || (!isAuthorized && status === "authenticated")) {
    // Use custom loading component if provided
    if (loadingComponent) {
      return loadingComponent;
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-pulse text-6xl">🏆</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
