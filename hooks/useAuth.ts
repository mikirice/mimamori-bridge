import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

export function useAuth() {
  const { session, profile, setSession, setProfile, setFamilyId, setIsLoading } =
    useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setFamilyId(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      setProfile(data);
      await fetchFamily(userId);
    }
    setIsLoading(false);
  }

  async function fetchFamily(userId: string) {
    const { data } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (data) {
      setFamilyId(data.family_id);
    }
  }

  async function signUp(email: string, password: string, displayName: string, role: "watcher" | "senior") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        display_name: displayName,
        role,
      });
      if (profileError) throw profileError;
    }

    return data;
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    useStore.getState().reset();
  }

  return { session, profile, signUp, signIn, signOut };
}
