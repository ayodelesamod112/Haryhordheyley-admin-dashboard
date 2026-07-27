// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabase/supabaseClient";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [session, setSession] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadProfile = async (userId) => {
//     if (!userId) {
//       setProfile(null);
//       return;
//     }
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", userId)
//       .single();
//     if (!error) setProfile(data);
//   };

//   useEffect(() => {
//     // Restore persisted session on first load
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       loadProfile(session?.user?.id);
//       setLoading(false);
//     });

//     // Keep session in sync across tabs / token refreshes
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
//       setSession(newSession);
//       loadProfile(newSession?.user?.id);
//     });

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const signUp = async ({ email, password, fullName }) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: { data: { full_name: fullName } },
//     });
//     return { data, error };
//   };

//   const signIn = async ({ email, password }) => {
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//     return { data, error };
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   const sendPasswordReset = async (email) => {
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${window.location.origin}/reset-password`,
//     });
//     return { error };
//   };

//   const updatePassword = async (newPassword) => {
//     const { error } = await supabase.auth.updateUser({ password: newPassword });
//     return { error };
//   };

//   const refreshProfile = () => loadProfile(session?.user?.id);

//   const value = {
//     session,
//     user: session?.user ?? null,
//     profile,
//     loading,
//     isAuthenticated: !!session,
//     signUp,
//     signIn,
//     signOut,
//     sendPasswordReset,
//     updatePassword,
//     refreshProfile,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // eslint-disable-next-line react-refresh/only-export-components
// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
//   return ctx;
// };



// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabase/supabaseClient";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [session, setSession] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadProfile = async (userId) => {
//     if (!userId) {
//       setProfile(null);
//       return null;
//     }
//     const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
//     if (!error) setProfile(data);
//     return data;
//   };

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       loadProfile(session?.user?.id);
//       setLoading(false);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
//       setSession(newSession);
//       loadProfile(newSession?.user?.id);
//     });

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const signUp = async ({ email, password, fullName }) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: { data: { full_name: fullName } },
//     });
//     return { data, error };
//   };

//   // Lets the admin know whenever a customer logs in
//   const notifyAdminsOfCustomerLogin = async (customerName) => {
//     const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
//     if (!admins || admins.length === 0) return;

//     const rows = admins.map((admin) => ({
//       recipient_id: admin.id,
//       title: "Customer login",
//       message: `${customerName || "A customer"} just logged in to the website.`,
//     }));
//     await supabase.from("notifications").insert(rows);
//   };

//   const signIn = async ({ email, password }) => {
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//     if (!error && data?.user) {
//       const loggedInProfile = await loadProfile(data.user.id);
//       if (loggedInProfile?.role === "customer") {
//         notifyAdminsOfCustomerLogin(loggedInProfile.full_name);
//       }
//     }

//     return { data, error };
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   const sendPasswordReset = async (email) => {
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${window.location.origin}/reset-password`,
//     });
//     return { error };
//   };

//   const updatePassword = async (newPassword) => {
//     const { error } = await supabase.auth.updateUser({ password: newPassword });
//     return { error };
//   };

//   const refreshProfile = () => loadProfile(session?.user?.id);

//   const value = {
//     session,
//     user: session?.user ?? null,
//     profile,
//     loading,
//     isAuthenticated: !!session,
//     signUp,
//     signIn,
//     signOut,
//     sendPasswordReset,
//     updatePassword,
//     refreshProfile,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // eslint-disable-next-line react-refresh/only-export-components
// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
//   return ctx;
// };


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
    if (!error) setProfile(data);
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadProfile(session?.user?.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user?.id);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { data, error };
  };

  // Lets the admin know whenever a customer logs in
  const notifyAdminsOfCustomerLogin = async (customerName) => {
    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (!admins || admins.length === 0) return;

    const rows = admins.map((admin) => ({
      recipient_id: admin.id,
      title: "Customer login",
      message: `${customerName || "A customer"} just logged in to the website.`,
    }));
    await supabase.from("notifications").insert(rows);
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.session) {
      // Set session immediately — don't wait for the async onAuthStateChange
      // event, otherwise there's a brief window where the profile says
      // "admin" but isAuthenticated still says false, causing the router
      // to bounce between /login and / repeatedly.
      setSession(data.session);
      const loggedInProfile = await loadProfile(data.user.id);
      if (loggedInProfile?.role === "customer") {
        notifyAdminsOfCustomerLogin(loggedInProfile.full_name);
      }
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