"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "../contexts/UserContext";
import { LocaleProvider } from "../contexts/LocaleContext";
import { ToastProvider } from "./Toast";

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <LocaleProvider>
        <UserProvider>
          <ToastProvider>{children}</ToastProvider>
        </UserProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
