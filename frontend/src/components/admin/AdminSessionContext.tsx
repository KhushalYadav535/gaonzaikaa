import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminUsers } from '../../mock/data';

interface AdminSessionContextType {
  isLoggedIn: boolean;
  adminName: string;
  adminRole: string;
  login: (username: string) => void;
  logout: () => void;
  setRole: (role: string) => void;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export const AdminSessionProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('super_admin');

  useEffect(() => {
    const stored = localStorage.getItem('adminSession');
    if (stored) {
      const { isLoggedIn, adminName, adminRole } = JSON.parse(stored);
      setIsLoggedIn(isLoggedIn);
      setAdminName(adminName);
      setAdminRole(adminRole || 'super_admin');
    }
  }, []);

  const login = (username: string) => {
    setIsLoggedIn(true);
    setAdminName(username);
    const user = adminUsers.find(u => u.name.toLowerCase() === username.toLowerCase());
    setAdminRole(user?.role || 'super_admin');
    localStorage.setItem('adminSession', JSON.stringify({ isLoggedIn: true, adminName: username, adminRole: user?.role || 'super_admin' }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAdminName('');
    setAdminRole('super_admin');
    localStorage.removeItem('adminSession');
  };

  const setRole = (role: string) => {
    setAdminRole(role);
    localStorage.setItem('adminSession', JSON.stringify({ isLoggedIn, adminName, adminRole: role }));
  };

  return (
    <AdminSessionContext.Provider value={{ isLoggedIn, adminName, adminRole, login, logout, setRole }}>
      {children}
    </AdminSessionContext.Provider>
  );
};

export const useAdminSession = () => {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error('useAdminSession must be used within AdminSessionProvider');
  return ctx;
}; 