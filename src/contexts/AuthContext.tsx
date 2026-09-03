import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "ADMIN" | "ANALYST";

export interface ExtendedUser extends User {
  role: UserRole;
}

interface AuthContextValue {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enhanceUser = (u: User | null): ExtendedUser | null => {
      if (!u) return null;
      // Mock RBAC: assign ADMIN if email contains "admin"
      const role: UserRole = u.email?.includes("admin") ? "ADMIN" : "ANALYST";
      return { ...u, role };
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(enhanceUser(s?.user ?? null));
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(enhanceUser(s?.user ?? null));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch {
        // safe unsubscribe
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName }, emailRedirectTo: redirectTo },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // safe signOut
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
