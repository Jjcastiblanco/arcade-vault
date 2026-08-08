"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { clearSession, getSession, setSession, type Session } from "@/lib/session";

type SessionContextValue = {
  user: Session;
  signIn: (session: Session) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const signIn = (session: Session) => {
    setSession(session);
    setUser(session);
  };

  const signOut = () => {
    clearSession();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
