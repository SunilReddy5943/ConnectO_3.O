import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AvailabilityStatus = 'AVAILABLE' | 'BUSY';
type BusyReason = 'VACATION' | 'BUSY' | 'PERSONAL' | 'OTHER';

interface WorkerAvailability {
  status: AvailabilityStatus;
  busyReason?: BusyReason;
  busyUntil?: Date;
  autoEnableAt?: Date;
}

interface User {
  id: string;
  phone: string;
  name: string;
  roles: ('WORKER' | 'CUSTOMER' | 'ADMIN')[];
  primaryRole: 'WORKER' | 'CUSTOMER' | 'ADMIN';
  activeRole: 'WORKER' | 'CUSTOMER' | 'ADMIN';
  profile_photo_url?: string;
  is_active: boolean;
  referralCode?: string;
  availability?: WorkerAvailability;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  primaryRole: 'WORKER' | 'CUSTOMER' | 'ADMIN' | null;
  activeRole: 'WORKER' | 'CUSTOMER' | 'ADMIN' | null;
  hasRole: (role: 'WORKER' | 'CUSTOMER' | 'ADMIN') => boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  switchRole: (role: 'WORKER' | 'CUSTOMER') => Promise<void>;
  toggleRole: () => Promise<void>;
  setPrimaryRole: (role: 'WORKER' | 'CUSTOMER') => Promise<void>;
  isWorkerAvailable: boolean;
  setWorkerAvailability: (status: AvailabilityStatus, reason?: BusyReason, busyUntil?: Date) => Promise<void>;
  toggleWorkerAvailability: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('connecto_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Ensure roles array exists
        if (!parsedUser.roles || !Array.isArray(parsedUser.roles)) {
          parsedUser.roles = [];
        }
        
        // Check if activeRole exists, otherwise use primaryRole
        const storedActiveRole = await AsyncStorage.getItem('connecto_active_role');
        if (storedActiveRole && parsedUser.roles.includes(storedActiveRole)) {
          parsedUser.activeRole = storedActiveRole;
        } else if (parsedUser.primaryRole && parsedUser.roles.includes(parsedUser.primaryRole)) {
          parsedUser.activeRole = parsedUser.primaryRole;
        } else if (parsedUser.roles.length > 0) {
          // Fallback to first role if nothing else is set
          parsedUser.activeRole = parsedUser.roles[0];
          parsedUser.primaryRole = parsedUser.roles[0];
        }
        
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      // Ensure primaryRole is set and activeRole matches primaryRole on login
      const userWithPrimaryRole = {
        ...userData,
        primaryRole: userData.primaryRole || userData.roles[0],
        activeRole: userData.primaryRole || userData.roles[0],
      };
      
      await AsyncStorage.setItem('connecto_user', JSON.stringify(userWithPrimaryRole));
      await AsyncStorage.setItem('connecto_primary_role', userWithPrimaryRole.primaryRole);
      await AsyncStorage.setItem('connecto_active_role', userWithPrimaryRole.activeRole);
      setUser(userWithPrimaryRole);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('connecto_user');
      await AsyncStorage.removeItem('connecto_primary_role');
      await AsyncStorage.removeItem('connecto_active_role');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('connecto_user', JSON.stringify(updatedUser));
    }
  };

  const hasRole = (role: 'WORKER' | 'CUSTOMER' | 'ADMIN'): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const switchRole = async (role: 'WORKER' | 'CUSTOMER') => {
    if (user && user.roles && user.roles.includes(role)) {
      // Only update activeRole, NOT primaryRole
      const updatedUser = { ...user, activeRole: role };
      setUser(updatedUser);
      await AsyncStorage.setItem('connecto_user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('connecto_active_role', role);
    }
  };

  const toggleRole = async () => {
    if (!user || !user.roles) return;
    
    // If user has both roles, toggle between them (only changes activeRole)
    if (user.roles.includes('CUSTOMER') && user.roles.includes('WORKER')) {
      const newRole = user.activeRole === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER';
      await switchRole(newRole);
    }
  };

  const setPrimaryRole = async (role: 'WORKER' | 'CUSTOMER') => {
    if (user && user.roles && user.roles.includes(role)) {
      const updatedUser = { ...user, primaryRole: role, activeRole: role };
      setUser(updatedUser);
      await AsyncStorage.setItem('connecto_user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('connecto_primary_role', role);
      await AsyncStorage.setItem('connecto_active_role', role);
    }
  };

  const isWorkerAvailable = user?.roles?.includes('WORKER') 
    ? (user?.availability?.status === 'AVAILABLE' || !user?.availability)
    : true;

  const setWorkerAvailability = async (
    status: AvailabilityStatus,
    reason?: BusyReason,
    busyUntil?: Date
  ) => {
    if (!user || !user.roles || !user.roles.includes('WORKER')) return;

    const availability: WorkerAvailability = {
      status,
      busyReason: status === 'BUSY' ? reason : undefined,
      busyUntil: status === 'BUSY' ? busyUntil : undefined,
      autoEnableAt: busyUntil,
    };

    const updatedUser = { ...user, availability };
    setUser(updatedUser);
    await AsyncStorage.setItem('connecto_user', JSON.stringify(updatedUser));
    await AsyncStorage.setItem('worker_availability', JSON.stringify(availability));
  };

  const toggleWorkerAvailability = async () => {
    if (!user || !user.roles || !user.roles.includes('WORKER')) return;

    const currentStatus = user.availability?.status || 'AVAILABLE';
    const newStatus: AvailabilityStatus = currentStatus === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    
    await setWorkerAvailability(newStatus);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        primaryRole: user?.primaryRole ?? null,
        activeRole: user?.activeRole ?? null,
        hasRole,
        login,
        logout,
        updateUser,
        switchRole,
        toggleRole,
        setPrimaryRole,
        isWorkerAvailable,
        setWorkerAvailability,
        toggleWorkerAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
