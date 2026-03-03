import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserContextType, User } from '@/types';

// ============================================
// Utilisateurs simulés pour la démo
// ============================================

export const SIMULATED_USERS: User[] = [
  {
    id: 'user-rh',
    name: 'Sophie Laurent',
    photo: '👱🏾‍♀️',
    role: 'rh',
    employeeId: 'emp-8',
  },
  {
    id: 'user-manager',
    name: 'Kenji Tanaka',
    photo: '👨🏻',
    role: 'manager',
    employeeId: 'emp-1',
    teamIds: ['team-1', 'team-2'],
    establishmentId: 'est-1',
  },
  {
    id: 'user-employee',
    name: 'Maxime Bernard',
    photo: '👨🏻‍🦰',
    role: 'employee',
    employeeId: 'emp-6',
  },
];

const STORAGE_KEY = 'currentUserId';

const getInitialUser = (): User => {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const found = SIMULATED_USERS.find((u) => u.id === savedId);
      if (found) return found;
    }
  } catch {
    // ignore localStorage errors
  }
  return SIMULATED_USERS[0]; // RH by default
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(getInitialUser);

  const switchUser = useCallback((userId: string) => {
    const user = SIMULATED_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem(STORAGE_KEY, userId);
      } catch {
        // ignore
      }
    }
  }, []);

  const value: UserContextType = {
    currentUser,
    switchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
