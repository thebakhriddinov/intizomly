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
            // Profile fallback with standard user role
            setCurrentUser({
              id: session.user.id,
              firstName: session.user.user_metadata?.first_name || 'Foydalanuvchi',
              lastName: session.user.user_metadata?.last_name || '',
              phone: session.user.user_metadata?.phone || '',
              email: session.user.email,
              role: 'user',
              avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
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
            if (profile) {
              setCurrentUser({
                ...profile,
                isSupabaseUser: true
              });
            } else {
              setCurrentUser({
                id: session.user.id,
                firstName: session.user.user_metadata?.first_name || 'Foydalanuvchi',
                lastName: session.user.user_metadata?.last_name || '',
                phone: session.user.user_metadata?.phone || '',
                email: session.user.email,
                role: 'user',
                avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
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

  // Login: Both Admin and Regular Users authenticate via Phone/Password with Supabase Auth
  const login = useCallback(async (phone, password) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase kalitlari topilmadi!" };
    }

    try {
      const authData = await supabaseService.signIn({ phone, password });

      if (authData?.user) {
        let profile = await supabaseService.getProfile(authData.user.id);
        if (!profile) {
          profile = {
            id: authData.user.id,
            firstName: authData.user.user_metadata?.first_name || 'Foydalanuvchi',
            lastName: authData.user.user_metadata?.last_name || '',
            phone: authData.user.user_metadata?.phone || phone,
            email: authData.user.email,
            role: 'user',
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

      return { success: false, message: "Kirish amalga oshmadi!" };
    } catch (supaErr) {
      return {
        success: false,
        message: supaErr.message || "Kirishda xatolik yuz berdi"
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

  // Register: New Regular User Account (Always role = 'user')
  const register = useCallback(async ({ firstName, lastName, phone, password }) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase kalitlari topilmadi!" };
    }

    try {
      const authData = await supabaseService.signUp({ firstName, lastName, phone, password });

      if (authData?.user) {
        // Auto-login to establish session immediately
        let userProfile = null;
        try {
          const signInRes = await supabaseService.signIn({ phone, password });
          if (signInRes?.user) {
            userProfile = await supabaseService.getProfile(signInRes.user.id);
          }
        } catch (signInErr) {
          console.warn('[Auth] Auto-sign in notice:', signInErr);
        }

        if (!userProfile) {
          userProfile = {
            id: authData.user.id,
            firstName: (firstName || '').trim(),
            lastName: (lastName || '').trim(),
            phone: (phone || '').trim(),
            email: authData.user.email,
            role: 'user',
            avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
            createdAt: new Date().toISOString().split('T')[0]
          };
        }

        const loggedInUser = {
          ...userProfile,
          isSupabaseUser: true
        };

        setCurrentUser(loggedInUser);
        setIsSupabaseActive(true);

        return {
          success: true,
          user: loggedInUser,
          message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!"
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

  const adminAddUser = useCallback(async ({ firstName, lastName, phone, email, password, role }) => {
    if (!isSupabaseConfigured) return { success: false, message: "Supabase ulanmagan" };
    try {
      const authData = await supabaseService.signUp({ phone, email, password, firstName, lastName });
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
