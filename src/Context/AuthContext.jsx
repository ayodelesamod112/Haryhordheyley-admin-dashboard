import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        setSession(data.session);
        if (data.session?.user?.id) {
          await loadProfile(data.session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Unable to restore the Supabase session:", error.message);
        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        return;
      }

      // Supabase advises against awaiting another Supabase request inside this
      // callback because it can hold the auth lock. Load the profile after it exits.
      window.setTimeout(() => {
        if (mounted) loadProfile(newSession.user.id);
      }, 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.session) {
      setSession(data.session);
      await loadProfile(data.user.id);
    }

    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const updateEmail = async (newEmail) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    return { error };
  };

  const refreshProfile = () => loadProfile(session?.user?.id);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    updateEmail,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
