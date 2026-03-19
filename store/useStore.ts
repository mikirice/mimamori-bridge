import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

type UserRole = "watcher" | "senior" | null;

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url: string | null;
  timezone: string;
}

interface FamilyMember {
  id: string;
  user_id: string;
  display_name: string;
  role: UserRole;
  last_checkin?: string | null;
  today_steps?: number | null;
}

interface AppState {
  session: Session | null;
  profile: UserProfile | null;
  familyId: string | null;
  familyMembers: FamilyMember[];
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setFamilyId: (familyId: string | null) => void;
  setFamilyMembers: (members: FamilyMember[]) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  familyId: null,
  familyMembers: [],
  isLoading: true,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setFamilyId: (familyId) => set({ familyId }),
  setFamilyMembers: (members) => set({ familyMembers: members }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      session: null,
      profile: null,
      familyId: null,
      familyMembers: [],
      isLoading: false,
    }),
}));
