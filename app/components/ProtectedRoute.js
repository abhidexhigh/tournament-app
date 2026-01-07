"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "../contexts/UserContext";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  loadingComponent = null,
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, loading: userLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for both session and user to load
    if (status === "loading" || userLoading) return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      // Use session user type as fallback while UserContext loads
      // This prevents redirects during page refresh when UserContext is still loading
      const userType = user?.type || session?.user?.type;
      
      // If we have user data (either from context or session), check authorization
      if (user || session?.user) {
        // Only check role if we have a user type and a required role
        // Don't redirect if type is undefined (still loading)
        if (requiredRole && userType && userType !== requiredRole) {
          // User doesn't have the required role, redirect appropriately
          router.push("/");
          return;
        }

        // If we have a required role but no type yet, wait (don't authorize yet)
        // This will keep showing the loading state
        if (requiredRole && !userType) {
          return;
        }

        setIsAuthorized(true);
      } else {
        // Authenticated but user record not found yet or failed to load
        // This could happen for new OAuth users before they are created in DB
        // Redirect to player dashboard as default
        router.push("/player/dashboard");
      }
    }
  }, [status, user, userLoading, router, requiredRole, session]);

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
