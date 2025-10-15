"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { syncUserWithStorage, hasUserRole } from "../lib/authHelpers";
import { getCurrentUser } from "../lib/auth";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Sync with localStorage
      const user = syncUserWithStorage(session.user);

      // Check if user has selected a role
      if (!hasUserRole(user)) {
        router.push("/select-role");
        return;
      }

      // Check if user has the required role
      if (requiredRole && user.type !== requiredRole) {
        router.push("/");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [session, status, router, requiredRole]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏆</div>
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
