import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/services/supabase-data';
import { signupCompany } from '@/services/signup';
import type { UserContextType, User, UserRole, CompanySignupForm } from '@/types';

// ============================================
// Supabase Auth — UserContext
// ============================================

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profile = await fetchProfile(userId);
      setCurrentUser({
        id: profile.id,
        name: profile.name,
        photo: profile.photo,
        role: profile.role as UserRole,
        companyId: profile.company_id,
        employeeId: profile.employee_id || undefined,
        teamIds: profile.team_ids || undefined,
        establishmentId: profile.establishment_id || undefined,
        establishmentIds: profile.establishment_ids || undefined,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsAuthLoading(false));
      } else {
        setIsAuthLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const signUp = useCallback(async (form: CompanySignupForm) => {
    const result = await signupCompany(form);
    // Auto sign in after signup
    await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    return result;
  }, []);

  const value: UserContextType = {
    currentUser,
    isAuthLoading,
    signIn,
    signOut,
    signUp,
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
