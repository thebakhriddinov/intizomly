import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';

const AuthContext = createContext(null);

const checkIsAdmin = (user, profile) => {
  if (profile?.role === 'admin') return true;
  const email = (user?.email || '').toLowerCase();
  const phone = (profile?.phone || user?.user_metadata?.phone || '').replace(/\D/g, '');
  return phone.endsWith('701265759') || email.includes('701265759') || email === 'bakhriddinoff01@gmail.com';
};

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
          const isAdm = checkIsAdmin(session.user, profile);
          if (profile) {
            setCurrentUser({
              ...profile,
              role: isAdm ? 'admin' : (profile.role || 'user'),
              firstName: isAdm ? 'Mustafo' : profile.firstName,
              lastName: isAdm ? 'Bakhriddinov' : profile.lastName,
              phone: isAdm ? (profile.phone || '70 126 5759') : profile.phone,
              isSupabaseUser: true
            });
          } else {
            // Profile trigger fallback
            setCurrentUser({
              id: session.user.id,
              firstName: isAdm ? 'Mustafo' : (session.user.user_metadata?.first_name || 'Foydalanuvchi'),
              lastName: isAdm ? 'Bakhriddinov' : (session.user.user_metadata?.last_name || ''),
              phone: isAdm ? '70 126 5759' : (session.user.user_metadata?.phone || ''),
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
            const isAdm = checkIsAdmin(session.user, profile);
            if (profile) {
              setCurrentUser({
                ...profile,
                role: isAdm ? 'admin' : (profile.role || 'user'),
                firstName: isAdm ? 'Mustafo' : profile.firstName,
                lastName: isAdm ? 'Bakhriddinov' : profile.lastName,
                phone: isAdm ? (profile.phone || '70 126 5759') : profile.phone,
                isSupabaseUser: true
              });
            } else {
              setCurrentUser({
                id: session.user.id,
                firstName: isAdm ? 'Mustafo' : (session.user.user_metadata?.first_name || 'Foydalanuvchi'),
                lastName: isAdm ? 'Bakhriddinov' : (session.user.user_metadata?.last_name || ''),
                phone: isAdm ? '70 126 5759' : (session.user.user_metadata?.phone || ''),
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

  // Login: Support Admin (70 126 5759 / bratan) and Users via Phone/Password
  const login = useCallback(async (identifier, password) => {
    const rawInput = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase kalitlari topilmadi!" };
    }

    const digits = rawInput.replace(/\D/g, '');
    const isAdminCandidate = digits.endsWith('701265759') || rawInput.toLowerCase() === 'bakhriddinoff01@gmail.com';

    try {
      let authData;
      try {
        authData = await supabaseService.signIn({
          phone: rawInput.includes('@') ? undefined : rawInput,
          email: rawInput.includes('@') ? rawInput : undefined,
          password: cleanPass
        });
      } catch (signInErr) {
        // If Admin (70 126 5759 / bratan) is logging in and not yet registered in Supabase Auth, auto-create account!
        if (isAdminCandidate && cleanPass === 'bratan') {
          try {
            authData = await supabaseService.signUp({
              phone: '70 126 5759',
              password: 'bratan',
              firstName: 'Mustafo',
              lastName: 'Bakhriddinov'
            });
            authData = await supabaseService.signIn({
              phone: '70 126 5759',
              password: 'bratan'
            });
          } catch (signUpErr) {
            console.warn('[Auth] Admin auto-create error:', signUpErr);
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      if (authData?.user) {
        let profile = await supabaseService.getProfile(authData.user.id);
        const isAdm = isAdminCandidate || profile?.role === 'admin';

        if (!profile) {
          profile = {
            id: authData.user.id,
            firstName: isAdm ? 'Mustafo' : (authData.user.user_metadata?.first_name || 'Foydalanuvchi'),
            lastName: isAdm ? 'Bakhriddinov' : (authData.user.user_metadata?.last_name || ''),
            phone: isAdm ? '70 126 5759' : (authData.user.user_metadata?.phone || rawInput),
            email: authData.user.email,
            role: isAdm ? 'admin' : 'user',
            avatarGradient: isAdm ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
            createdAt: new Date().toISOString().split('T')[0]
          };
        } else if (isAdm && profile.role !== 'admin') {
          profile.role = 'admin';
          profile.firstName = 'Mustafo';
          profile.lastName = 'Bakhriddinov';
          profile.phone = '70 126 5759';
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
          ? "Telefon raqam yoki parol noto'g'ri kiritildi!"
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

  // Register: New Account with Phone, First Name, Last Name, and Password
  const register = useCallback(async (data) => {
    const { firstName, lastName, phone, email, password } = data;
    const cleanPhone = (phone || '').trim();
    const cleanFirst = (firstName || '').trim();
    const cleanLast = (lastName || '').trim();
    const cleanPass = (password || '').trim();

    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase kalitlari topilmadi!" };
    }

    const digits = cleanPhone.replace(/\D/g, '');
    const isAdm = digits.endsWith('701265759');

    try {
      const authData = await supabaseService.signUp({
        phone: cleanPhone,
        email: email,
        password: cleanPass,
        firstName: isAdm ? 'Mustafo' : cleanFirst,
        lastName: isAdm ? 'Bakhriddinov' : cleanLast
      });

      if (authData?.user) {
        if (authData.user.identities && authData.user.identities.length === 0) {
          return {
            success: false,
            message: "Ushbu telefon raqam bilan avval ro'yxatdan o'tilgan!"
          };
        }

        const newUser = {
          id: authData.user.id,
          firstName: isAdm ? 'Mustafo' : cleanFirst,
          lastName: isAdm ? 'Bakhriddinov' : cleanLast,
          phone: cleanPhone,
          email: authData.user.email,
          role: isAdm ? 'admin' : 'user',
          avatarGradient: isAdm ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #10b981, #3b82f6)',
          createdAt: new Date().toISOString().split('T')[0],
          isSupabaseUser: true
        };

        setCurrentUser(newUser);
        setIsSupabaseActive(true);

        return {
          success: true,
          user: newUser,
          message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!"
        };
      }
      return { success: false, message: "Ro'yxatdan o'tishda xatolik yuz berdi" };
    } catch (supaErr) {
      return {
        success: false,
        message: supaErr.message === 'User already registered'
          ? "Ushbu telefon raqam bilan avval ro'yxatdan o'tilgan!"
          : (supaErr.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
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
