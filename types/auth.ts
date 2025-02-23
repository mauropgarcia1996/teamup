import type { User } from "@supabase/supabase-js";
import type { Database } from "@/database.types";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}
