import React, { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [users, setUsers] = useState(() => storage.getUsers());

  const refreshUsers = useCallback(() => {
    setUsers([...storage.getUsers()]);
    setCurrentUser({ ...storage.getCurrentUser() });
  }, []);

  const login = useCallback((email, password) => {
    const res = storage.login(email, password);
    if (res.success) {
      setCurrentUser({ ...res.user });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  const loginById = useCallback((userId) => {
    const res = storage.loginById(userId);
    if (res.success) {
      setCurrentUser({ ...res.user });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    const defaultUser = storage.logout();
    setCurrentUser({ ...defaultUser });
    setUsers([...storage.getUsers()]);
  }, []);

  const register = useCallback((data) => {
    const res = storage.register(data);
    if (res.success) {
      setCurrentUser({ ...res.user });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  const updateProfile = useCallback((data) => {
    const res = storage.updateProfile(data);
    if (res.success) {
      setCurrentUser({ ...res.user });
      setUsers([...storage.getUsers()]);
    }
    return res;
  }, []);

  const adminToggleUserRole = useCallback((userId) => {
    const updated = storage.adminToggleUserRole(userId);
    refreshUsers();
    return updated;
  }, [refreshUsers]);

  const adminDeleteUser = useCallback((userId) => {
    const ok = storage.adminDeleteUser(userId);
    if (ok) refreshUsers();
    return ok;
  }, [refreshUsers]);

  const adminAddUser = useCallback((userData) => {
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
