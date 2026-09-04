import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

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
const DEMO_SESSION_KEY = "fraudshield-demo-session";

const demoUser = {
  id: "demo-analyst",
  aud: "authenticated",
  role: "authenticated",
  email: "demo@fraudshield.ai",
  app_metadata: {},
  user_metadata: { display_name: "Demo Analyst" },
  created_at: new Date(0).toISOString(),
} as unknown as ExtendedUser;

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
    if (!isSupabaseConfigured) {
      setUser(typeof window !== "undefined" && localStorage.getItem(DEMO_SESSION_KEY) === "true" ? demoUser : null);
      setLoading(false);
      return;
    }

    const enhanceUser = async (u: User | null): Promise<ExtendedUser | null> => {
      if (!u) return null;
      const { data } = await supabase.from("profiles").select("role").eq("user_id", u.id).maybeSingle();
      const role: UserRole = data?.role === "ADMIN" ? "ADMIN" : "ANALYST";
      return { ...u, role };
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(await enhanceUser(s?.user ?? null));
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(async ({ data: { session: s } }) => {
        setSession(s);
        setUser(await enhanceUser(s?.user ?? null));
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
    if (!isSupabaseConfigured) {
      if (email === "demo@fraudshield.ai" && password === "demo1234") {
        localStorage.setItem(DEMO_SESSION_KEY, "true");
        setUser(demoUser);
        return { error: null };
      }
      return { error: new Error("Use the demo credentials shown on the sign-in form.") };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      if (!email || password.length < 6) return { error: new Error("Enter a valid email and a password with at least 6 characters.") };
      localStorage.setItem(DEMO_SESSION_KEY, "true");
      setUser({ ...demoUser, email, user_metadata: { display_name: displayName } });
      return { error: null };
    }

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
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setUser(null);
      return;
    }

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
