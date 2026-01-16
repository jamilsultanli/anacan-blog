import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, username?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: { username?: string; fullName?: string; bio?: string; avatarUrl?: string }) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let pollingTimeout: NodeJS.Timeout | null = null;

    // Initialize auth state - check for existing session
    const initAuth = async () => {
      try {
        // Get current user from session
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error: any) {
        // Silently handle auth errors - 401 is expected when not logged in
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Initialize immediately
    initAuth();

    // Set up auth state change listener with polling
    // Delay polling to avoid duplicate requests with initAuth
    // Appwrite SDK doesn't have built-in onAuthStateChange, so we poll
    pollingTimeout = setTimeout(() => {
      if (!mounted) return;
      
      try {
        const result = authService.onAuthStateChange((user) => {
          if (mounted) {
            setUser(user);
            // Only set loading to false after first check
            if (loading) {
              setLoading(false);
            }
          }
        });
        subscription = result.data.subscription;
      } catch (error) {
        // Silently handle setup errors
        if (mounted) {
          setLoading(false);
        }
      }
    }, 2000); // Wait 2 seconds before starting polling to avoid duplicate requests

    return () => {
      mounted = false;
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
      }
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  const signUp = async (email: string, password: string, fullName?: string, username?: string) => {
    setLoading(true);
    try {
      const { user: newUser, error } = await authService.signUp({ email, password, fullName, username });
      if (!error && newUser) {
        setUser(newUser);
      }
      setLoading(false);
      return { error };
    } catch (error: any) {
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: signedInUser, error } = await authService.signIn({ email, password });
      if (!error && signedInUser) {
        setUser(signedInUser);
      }
      setLoading(false);
      return { error };
    } catch (error: any) {
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signOut();
      if (!error) {
        setUser(null);
      }
      setLoading(false);
      return { error };
    } catch (error: any) {
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Sign out failed') };
    }
  };

  const updateProfile = async (updates: { username?: string; fullName?: string; bio?: string; avatarUrl?: string }) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const { user: updatedUser, error } = await authService.updateProfile(user.id, updates);
      if (!error && updatedUser) {
        setUser(updatedUser);
      }
      return { error };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error('Update profile failed') };
    }
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return await authService.updatePassword(newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
