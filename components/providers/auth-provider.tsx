import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { AuthContextType, AuthState, UserProfile } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Get the user profile
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setState({
            user: session.user,
            profile,
            loading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setState({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setState({
          user: session.user,
          profile,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!state.user) return;

    const { data, error } = await supabase
      .from("users")
      .update(profile)
      .eq("id", state.user.id)
      .select()
      .single();

    if (error) throw error;

    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile!, ...data },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
