"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "../contexts/UserContext";

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}
