import { useUserContext } from '@/context/UserContext';
import type { User } from '@/types';

/**
 * useUser — returns the auth context with a guaranteed non-null currentUser.
 * Only use this inside components that are rendered behind the auth guard (App.tsx).
 */
export const useUser = (): {
  currentUser: User;
  signOut: () => Promise<void>;
} => {
  const ctx = useUserContext();
  if (!ctx.currentUser) {
    throw new Error('useUser called before authentication');
  }
  return { currentUser: ctx.currentUser, signOut: ctx.signOut };
};
