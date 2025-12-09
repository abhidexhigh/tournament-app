"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "../contexts/UserContext";
import { ToastProvider } from "./Toast";

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <UserProvider>
        <ToastProvider>{children}</ToastProvider>
      </UserProvider>
    </SessionProvider>
  );
}
