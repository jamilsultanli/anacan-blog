import { account, databases, DATABASE_ID, COLLECTIONS, ID } from './appwrite';
import { User, UserProfile, UserRole } from '../types';
import type { Models } from 'appwrite';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

class AuthService {
  async signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Create user account (Appwrite uses unique ID)
      const userId = ID.unique();
      const user = await account.create(userId, data.email, data.password, data.fullName || data.username || '');
      
      // Create session immediately after signup
      await account.createEmailPasswordSession(data.email, data.password);
      
      // Create user profile in database
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          userId, // Use same ID as account
          {
            username: data.username || '',
            full_name: data.fullName || '',
            role: 'user',
            email: data.email,
          }
        );
      } catch (profileError: any) {
        // If profile creation fails, try to delete the account or just log
        console.warn('Failed to create user profile:', profileError);
        // Profile might already exist, continue anyway
      }

      const userProfile: User = {
        id: userId,
        email: user.email,
        username: data.username,
        fullName: data.fullName,
        role: 'user',
      };

      return { user: userProfile, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, error: new Error(error.message || 'Sign up failed') };
    }
  }

  async signIn(data: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Create session
      await account.createEmailPasswordSession(data.email, data.password);
      
      // Get current user account (account.get() returns Account object, not Session)
      const accountUser = await account.get();
      
      if (!accountUser || !accountUser.$id) {
        throw new Error('Failed to get user account');
      }
      
      // Get user profile using account ID
      const user = await this.getUserProfile(accountUser.$id);
      
      if (!user) {
        // If profile doesn't exist, create a basic one from account
        try {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            accountUser.$id,
            {
              username: accountUser.name || '',
              full_name: accountUser.name || '',
              role: 'user',
              email: accountUser.email,
            }
          );
          // Retry getting user profile
          const newUser = await this.getUserProfile(accountUser.$id);
          return { user: newUser, error: null };
        } catch (createError: any) {
          console.error('Failed to create user profile on signin:', createError);
          // Return basic user info even if profile creation fails
          return {
            user: {
              id: accountUser.$id,
              email: accountUser.email,
              username: accountUser.name,
              fullName: accountUser.name,
              role: 'user',
            },
            error: null,
          };
        }
      }
      
      return { user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, error: new Error(error.message || 'Sign in failed') };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      await account.deleteSession('current');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: new Error(error.message || 'Sign out failed') };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Check if session exists by trying to get account
      // If no session exists, this will throw an error
      const accountUser = await account.get();
      
      if (!accountUser || !accountUser.$id) {
        return null;
      }
      
      // Get user profile using account ID
      return await this.getUserProfile(accountUser.$id);
    } catch (error: any) {
      // No active session - this is expected when user is not logged in
      // Don't log this as an error, it's normal behavior
      if (error.code !== 401 && error.type !== 'general_unauthorized_scope') {
        console.error('Error getting current user:', error);
      }
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Get user account first to ensure we have a valid session
      const accountUser = await account.get();
      
      // Verify the requested userId matches the current session
      if (accountUser.$id !== userId) {
        console.warn('User ID mismatch. Requested:', userId, 'Current user:', accountUser.$id);
        // Return null if IDs don't match (security measure)
        return null;
      }
      
      // Get user profile from database
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        userId
      );

      return {
        id: profile.$id,
        email: accountUser.email,
        username: profile.username,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        role: profile.role as UserRole,
        createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
      };
    } catch (error: any) {
      // If profile doesn't exist, try to return basic account info
      try {
        const accountUser = await account.get();
        if (accountUser.$id === userId) {
          // Return basic user info from account
          return {
            id: accountUser.$id,
            email: accountUser.email,
            username: accountUser.name,
            fullName: accountUser.name,
            role: 'user',
          };
        }
      } catch (e: any) {
        // Account doesn't exist or session expired
        if (e.code !== 401 && e.type !== 'general_unauthorized_scope') {
          console.error('Error getting account:', e);
        }
      }
      return null;
    }
  }

  async updateProfile(userId: string, updates: UpdateProfileData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const updateData: any = {};
      if (updates.username !== undefined) updateData.username = updates.username;
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        userId,
        updateData
      );

      const user = await this.getUserProfile(userId);
      return { user, error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { user: null, error: new Error(error.message || 'Update profile failed') };
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      await account.createRecovery(email, `${window.location.origin}/reset-password`);
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: new Error(error.message || 'Reset password failed') };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      await account.updatePassword(newPassword);
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: new Error(error.message || 'Update password failed') };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    // Appwrite doesn't have onAuthStateChange, so we'll use a polling approach
    // Poll less frequently to avoid unnecessary requests
    let intervalId: NodeJS.Timeout | null = null;
    let lastUserId: string | null = null;
    let isPolling = true;

    const checkAuthState = async () => {
      if (!isPolling) return;
      
      try {
        const currentUser = await this.getCurrentUser();
        const currentUserId = currentUser?.id || null;
        
        // Only call callback if user state actually changed
        if (currentUserId !== lastUserId) {
          lastUserId = currentUserId;
          callback(currentUser);
        }
      } catch (error) {
        // If error occurs, assume user is logged out
        if (lastUserId !== null) {
          lastUserId = null;
          callback(null);
        }
      }
    };

    // Check immediately
    checkAuthState();

    // Poll every 5 seconds (reduced from 2 seconds to avoid too many requests)
    intervalId = setInterval(checkAuthState, 5000);

    // Return subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            isPolling = false;
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          },
        },
      },
    };
  }
}

export const authService = new AuthService();
