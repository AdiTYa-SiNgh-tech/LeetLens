import { ref, computed } from "vue";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

const currentUser = ref<User | null>(null);
const currentSession = ref<Session | null>(null);
const authLoading = ref(true);
const authInitialized = ref(false);
const passwordRecoveryMode = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value);
  const userEmail = computed(() => currentUser.value?.email || "");
  const userId = computed(() => currentUser.value?.id || "");

  async function initAuth(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      authLoading.value = false;
      authInitialized.value = true;
      return;
    }

    try {
      authLoading.value = true;
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error retrieving Supabase session:", error);
      }
      currentSession.value = session;
      currentUser.value = session?.user || null;

      supabase.auth.onAuthStateChange((event, session) => {
        currentSession.value = session;
        currentUser.value = session?.user || null;

        if (event === "PASSWORD_RECOVERY") {
          passwordRecoveryMode.value = true;
        } else if (event === "SIGNED_OUT") {
          passwordRecoveryMode.value = false;
        }
      });
    } catch (err) {
      console.error("Unexpected error initializing auth:", err);
    } finally {
      authLoading.value = false;
      authInitialized.value = true;
    }
  }

  async function signUp(
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; user: User | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: {
          message: "Supabase credentials are not configured.",
          name: "ConfigError",
          status: 500,
        } as AuthError,
        user: null,
      };
    }

    const redirectUrl = window.location.origin + window.location.pathname;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error && data.session) {
      currentSession.value = data.session;
      currentUser.value = data.user;
    }

    return { error, user: data.user };
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: {
          message: "Supabase credentials are not configured.",
          name: "ConfigError",
          status: 500,
        } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!error && data.session) {
      currentSession.value = data.session;
      currentUser.value = data.user;
    }

    return { error };
  }

  async function signOut(): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      currentUser.value = null;
      currentSession.value = null;
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    currentUser.value = null;
    currentSession.value = null;
    return { error };
  }

  async function resetPasswordForEmail(
    email: string
  ): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: {
          message: "Supabase credentials are not configured.",
          name: "ConfigError",
          status: 500,
        } as AuthError,
      };
    }

    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    return { error };
  }

  async function updatePassword(
    newPassword: string
  ): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: {
          message: "Supabase credentials are not configured.",
          name: "ConfigError",
          status: 500,
        } as AuthError,
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (!error) {
      passwordRecoveryMode.value = false;
    }

    return { error };
  }

  return {
    currentUser,
    currentSession,
    authLoading,
    authInitialized,
    isAuthenticated,
    userEmail,
    userId,
    passwordRecoveryMode,
    isConfigured: isSupabaseConfigured(),
    initAuth,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  };
}
