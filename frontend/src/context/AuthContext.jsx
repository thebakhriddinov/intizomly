import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [authLoading, setAuthLoading] = useState(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState(isSupabaseConfigured);

  // Initialize session from Supabase if configured
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
            const fullUser = {
              ...profile,
              isSupabaseUser: true
            };
            setCurrentUser(fullUser);
          }
        }
      } catch (err) {
        console.error('[Auth] Session check failed:', err);
      } finally {
        setAuthLoading(false);
      }

      // Listen for auth state changes (login, logout, token refresh)
      try {
        const { data } = supabaseService.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await supabaseService.getProfile(session.user.id);
            if (profile) {
              setCurrentUser({
                ...profile,
                isSupabaseUser: true
              });
            }
          } else if (event === 'SIGNED_OUT') {
            const fallbackUser = storage.getCurrentUser() || storage.getUsers()[0];
            setCurrentUser(fallbackUser);
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
          return;
        }
      } catch (e) {
        console.warn('[Auth] Failed to fetch users from Supabase:', e);
      }
    }
    setUsers([...storage.getUsers()]);
    setCurrentUser({ ...storage.getCurrentUser() });
  }, [currentUser]);

  // Login (Supports both Supabase Cloud and Local Demo Accounts)
  const login = useCallback(async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Try Supabase Auth first if configured
    if (isSupabaseConfigured) {
      try {
        const authData = await supabaseService.signIn({ email: cleanEmail, password: cleanPass });
        if (authData?.user) {
          let profile = await supabaseService.getProfile(authData.user.id);
          // If profile trigger is slightly delayed, fallback to auth meta
          if (!profile) {
            profile = {
              id: authData.user.id,
              firstName: authData.user.user_metadata?.first_name || cleanEmail.split('@')[0],
              lastName: authData.user.user_metadata?.last_name || '',
              email: authData.user.email,
              role: cleanEmail === 'bakhriddinoff01@gmail.com' ? 'admin' : 'user',
              avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
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
      } catch (supaErr) {
        // If Supabase returns error (e.g., Invalid login credentials), also check if it's a demo account
        const demoUser = storage.getUsers().find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
        if (demoUser) {
          const res = storage.login(email, password);
          if (res.success) {
            setCurrentUser({ ...res.user, isSupabaseUser: false });
            return res;
          }
        }
        return {
          success: false,
          message: supaErr.message === 'Invalid login credentials'
            ? "Email yoki parol noto'g'ri kiritildi!"
            : (supaErr.message || "Kirishda xatolik yuz berdi")
        };
      }
    }

    // 2. Fallback to LocalStorage for Demo accounts or offline mode
    const res = storage.login(email, password);
    if (res.success) {
      setCurrentUser({ ...res.user, isSupabaseUser: false });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  // Quick switch for demo accounts (Admin, PRO, Oddiy)
  const loginById = useCallback((userId) => {
    const res = storage.loginById(userId);
    if (res.success) {
      setCurrentUser({ ...res.user, isSupabaseUser: false });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && currentUser?.isSupabaseUser) {
      try {
        await supabaseService.signOut();
      } catch (e) {
        console.warn('[Auth] Signout warning:', e);
      }
    }
    const defaultUser = storage.logout();
    setCurrentUser({ ...defaultUser, isSupabaseUser: false });
    setUsers([...storage.getUsers()]);
  }, [currentUser]);

  const register = useCallback(async (data) => {
    const { firstName, lastName, email, password } = data;

    // 1. Try Supabase Auth first if configured
    if (isSupabaseConfigured) {
      try {
        const authData = await supabaseService.signUp({ email, password, firstName, lastName });
        if (authData?.user) {
          // Check if email confirmation is required by Supabase project settings
          if (authData.user.identities && authData.user.identities.length === 0) {
            return {
              success: false,
              message: "Ushbu email bilan avval ro'yxatdan o'tilgan!"
            };
          }

          const newUser = {
            id: authData.user.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            role: email.trim().toLowerCase() === 'bakhriddinoff01@gmail.com' ? 'admin' : 'user',
            avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
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
      } catch (supaErr) {
        return {
          success: false,
          message: supaErr.message || "Ro'yxatdan o'tishda xatolik yuz berdi"
        };
      }
    }

    // 2. Fallback to LocalStorage
    const res = storage.register(data);
    if (res.success) {
      setCurrentUser({ ...res.user, isSupabaseUser: false });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (isSupabaseConfigured && currentUser?.isSupabaseUser) {
      try {
        const updated = await supabaseService.updateProfile(currentUser.id, data);
        if (updated) {
          const merged = { ...currentUser, ...updated };
          setCurrentUser(merged);
          return { success: true, user: merged };
        }
      } catch (e) {
        console.error('[Auth] Profile update error:', e);
      }
    }

    const res = storage.updateProfile(data);
    if (res.success) {
      setCurrentUser({ ...res.user, isSupabaseUser: !!currentUser?.isSupabaseUser });
      setUsers([...storage.getUsers()]);
    }
    return res;
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

    const updated = storage.adminToggleUserRole(userId);
    refreshUsers();
    return updated;
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

    const ok = storage.adminDeleteUser(userId);
    if (ok) refreshUsers();
    return ok;
  }, [currentUser, refreshUsers]);

  const adminAddUser = useCallback(async (userData) => {
    const res = storage.adminAddUser(userData);
    if (res.success) refreshUsers();
    return res;
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
      loginById,
      logout,
      register,
      updateProfile,
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
