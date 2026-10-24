import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState(isSupabaseConfigured);

  // Initialize session from Supabase on load
  useEffect(() => {
    let subscription = null;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setAuthLoading(false);
        return;
      }

      try {
        const session = await supabaseService.getSession();
        if (session?.user) {
          const profile = await supabaseService.getProfile(session.user.id);
          if (profile) {
            setCurrentUser({
              ...profile,
              isSupabaseUser: true
            });
          } else {
            // Profile trigger fallback
            const isAdm = session.user.email?.toLowerCase() === 'bakhriddinoff01@gmail.com';
            setCurrentUser({
              id: session.user.id,
              firstName: session.user.user_metadata?.first_name || (isAdm ? 'Bakhriddin' : session.user.email.split('@')[0]),
              lastName: session.user.user_metadata?.last_name || (isAdm ? 'Bakhriddinoff' : ''),
              email: session.user.email,
              role: isAdm ? 'admin' : 'user',
              avatarGradient: isAdm ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
              createdAt: new Date().toISOString().split('T')[0],
              isSupabaseUser: true
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('[Auth] Session check failed:', err);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }

      // Listen for auth state changes
      try {
        const { data } = supabaseService.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await supabaseService.getProfile(session.user.id);
            const isAdm = session.user.email?.toLowerCase() === 'bakhriddinoff01@gmail.com';
            if (profile) {
              setCurrentUser({
                ...profile,
                isSupabaseUser: true
              });
            } else {
              setCurrentUser({
                id: session.user.id,
                firstName: session.user.user_metadata?.first_name || (isAdm ? 'Bakhriddin' : session.user.email.split('@')[0]),
                lastName: session.user.user_metadata?.last_name || (isAdm ? 'Bakhriddinoff' : ''),
                email: session.user.email,
                role: isAdm ? 'admin' : 'user',
                avatarGradient: isAdm ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
                createdAt: new Date().toISOString().split('T')[0],
                isSupabaseUser: true
              });
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
          }
        });
        subscription = data?.subscription;
      } catch (e) {
        console.warn('[Auth] Auth state subscription failed:', e);
      }
    }

    initAuth();

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const refreshUsers = useCallback(async () => {
    if (isSupabaseConfigured && currentUser?.role === 'admin') {
      try {
        const dbUsers = await supabaseService.getAllUsers();
        if (dbUsers.length > 0) {
          setUsers(dbUsers);
        }
      } catch (e) {
        console.warn('[Auth] Failed to fetch users from Supabase:', e);
      }
    }
  }, [currentUser]);

  // Login: Support Admin and Users via Supabase
  const login = useCallback(async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase kalitlari topilmadi!" };
    }

    try {
      let authData;
      try {
        authData = await supabaseService.signIn({ email: cleanEmail, password: cleanPass });
      } catch (signInErr) {
        // If the admin user is not registered in Supabase Auth yet, automatically create their admin account!
        if (cleanEmail === 'bakhriddinoff01@gmail.com') {
          try {
            authData = await supabaseService.signUp({
              email: cleanEmail,
              password: cleanPass,
              firstName: 'Bakhriddin',
              lastName: 'Bakhriddinoff'
            });
          } catch (signUpErr) {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      if (authData?.user) {
        let profile = await supabaseService.getProfile(authData.user.id);
        const isAdm = cleanEmail === 'bakhriddinoff01@gmail.com';
        if (!profile) {
          profile = {
            id: authData.user.id,
            firstName: authData.user.user_metadata?.first_name || (isAdm ? 'Bakhriddin' : cleanEmail.split('@')[0]),
            lastName: authData.user.user_metadata?.last_name || (isAdm ? 'Bakhriddinoff' : ''),
            email: authData.user.email,
            role: isAdm ? 'admin' : 'user',
            avatarGradient: isAdm ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
            createdAt: new Date().toISOString().split('T')[0]
          };
        }

        const loggedInUser = {
          ...profile,
          isSupabaseUser: true
        };

        setCurrentUser(loggedInUser);
        setIsSupabaseActive(true);
        return { success: true, user: loggedInUser };
      }

      return { success: false, message: "Kirish amalga oshmadi!" };
    } catch (supaErr) {
      return {
        success: false,
        message: supaErr.message === 'Invalid login credentials'
          ? "Email yoki parol noto'g'ri kiritildi!"
          : (supaErr.message || "Kirishda xatolik yuz berdi")
      };
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        await supabaseService.signOut();
      } catch (e) {
        console.warn('[Auth] Signout warning:', e);
      }
    }
    setCurrentUser(null);
  }, []);

  // Register: New Account
  const register = useCallback(async (data) => {
    const { firstName, lastName, email, password } = data;
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase kalitlari topilmadi!" };
    }

    try {
      const authData = await supabaseService.signUp({ email: cleanEmail, password, firstName, lastName });
      if (authData?.user) {
        if (authData.user.identities && authData.user.identities.length === 0) {
          return {
            success: false,
            message: "Ushbu email bilan avval ro'yxatdan o'tilgan!"
          };
        }

        const isAdm = cleanEmail === 'bakhriddinoff01@gmail.com';
        const newUser = {
          id: authData.user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: cleanEmail,
          role: isAdm ? 'admin' : 'user',
          avatarGradient: isAdm ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
          createdAt: new Date().toISOString().split('T')[0],
          isSupabaseUser: true
        };

        setCurrentUser(newUser);
        setIsSupabaseActive(true);

        const needsConfirm = authData.session === null && !authData.user.confirmed_at;
        return {
          success: true,
          user: newUser,
          needsEmailConfirmation: needsConfirm,
          message: needsConfirm
            ? "Ro'yxatdan o'tdingiz! Iltimos, pochtangizga yuborilgan tasdiqlash xatini tekshiring."
            : "Muvaffaqiyatli ro'yxatdan o'tdingiz!"
        };
      }
      return { success: false, message: "Ro'yxatdan o'tishda xatolik yuz berdi" };
    } catch (supaErr) {
      return {
        success: false,
        message: supaErr.message || "Ro'yxatdan o'tishda xatolik yuz berdi"
      };
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (!currentUser) return { success: false };

    try {
      if (isSupabaseConfigured && currentUser.id) {
        const updated = await supabaseService.updateProfile(currentUser.id, data);
        if (updated) {
          const merged = { ...currentUser, ...updated };
          setCurrentUser(merged);
          return { success: true, user: merged };
        }
      }
    } catch (e) {
      console.error('[Auth] Profile update error:', e);
    }

    const merged = { ...currentUser, ...data };
    setCurrentUser(merged);
    return { success: true, user: merged };
  }, [currentUser]);

  // Upgrade to Premium ($10)
  const upgradeToPremium = useCallback(async () => {
    if (!currentUser) return false;
    try {
      if (isSupabaseConfigured && currentUser.id) {
        await supabaseService.updateUserRole(currentUser.id, 'premium');
      }
      setCurrentUser(prev => ({
        ...prev,
        role: 'premium'
      }));
      return true;
    } catch (err) {
      console.error('[Auth] Upgrade to premium error:', err);
      // Optimistic update if database call has transient network issue
      setCurrentUser(prev => ({ ...prev, role: 'premium' }));
      return true;
    }
  }, [currentUser]);

  // Admin user operations
  const adminToggleUserRole = useCallback(async (userId) => {
    if (isSupabaseConfigured && currentUser?.role === 'admin') {
      try {
        const target = users.find(u => u.id === userId);
        if (target && target.role !== 'admin') {
          const nextRole = target.role === 'premium' ? 'user' : 'premium';
          await supabaseService.updateUserRole(userId, nextRole);
          await refreshUsers();
          return { ...target, role: nextRole };
        }
      } catch (e) {
        console.error('[Auth] Admin role toggle error:', e);
      }
    }
    return null;
  }, [currentUser, users, refreshUsers]);

  const adminDeleteUser = useCallback(async (userId) => {
    if (isSupabaseConfigured && currentUser?.role === 'admin') {
      try {
        await supabaseService.deleteUser(userId);
        await refreshUsers();
        return true;
      } catch (e) {
        console.error('[Auth] Admin delete user error:', e);
      }
    }
    return false;
  }, [currentUser, refreshUsers]);

  const adminAddUser = useCallback(async ({ firstName, lastName, email, password, role }) => {
    if (!isSupabaseConfigured) return { success: false, message: "Supabase ulanmagan" };
    try {
      const authData = await supabaseService.signUp({ email, password, firstName, lastName });
      if (authData?.user && role && role !== 'user') {
        await supabaseService.updateUserRole(authData.user.id, role);
      }
      await refreshUsers();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [refreshUsers]);

  const isAdmin = currentUser?.role === 'admin';
  const isPremium = currentUser?.role === 'premium' || isAdmin;

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      isAdmin,
      isPremium,
      authLoading,
      isSupabaseActive,
      supabaseStatus: getSupabaseConfigStatus(),
      login,
      logout,
      register,
      updateProfile,
      upgradeToPremium,
      adminToggleUserRole,
      adminDeleteUser,
      adminAddUser,
      refreshUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
