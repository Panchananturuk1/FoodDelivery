import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Alert } from 'react-native';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session:', session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔵 AuthContext: Auth state change event:', event);
        console.log('🔵 AuthContext: New session:', session);
        console.log('🔵 AuthContext: Session user:', session?.user?.email || 'null');
        console.log('🔵 AuthContext: Setting user to:', session?.user ?? null);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('🔵 AuthContext: User state updated, loading set to false');
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('AuthContext: Starting signup process with email confirmation...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          // Set redirect URL for email confirmation (optional)
          emailRedirectTo: undefined,
        },
      });
      
      console.log('AuthContext: Signup response:', { data, error });
      
      if (error) {
        // Handle rate limiting specifically
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          throw new Error('Too many signup attempts. Please wait a few minutes before trying again.');
        }
        throw error;
      }

      // Check if user was created but needs email confirmation
      if (data.user && !data.session) {
        console.log('AuthContext: User created, email confirmation required');
        return { 
          data, 
          error: null,
          requiresConfirmation: true,
          message: 'Account created successfully! Please check your email and click the confirmation link to activate your account.'
        };
      }

      // If user was created and session exists (auto-confirmed)
      console.log('AuthContext: Signup successful with immediate access');
      return { 
        data, 
        error: null,
        requiresConfirmation: false,
        message: 'Account created and activated successfully!'
      };
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('AuthContext: Attempting sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.log('AuthContext: Sign in error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link to activate your account before signing in.');
        }
        
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
        }
        
        throw error;
      }
      
      console.log('AuthContext: Sign in successful');
      return { data, error: null };
    } catch (error) {
      console.error('AuthContext: SignIn error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('🔴 AuthContext: signOut called');
    console.log('🔴 AuthContext: Current user before signOut:', user?.email || 'null');
    
    try {
      // Call Supabase to sign out so auth state change fires reliably
      console.log('🔴 AuthContext: Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      console.log('🔴 AuthContext: Supabase signOut response:', { error });
      
      if (error) {
        console.error('🔴 AuthContext: Supabase signOut error:', error.message);
      } else {
        console.log('🔴 AuthContext: Supabase signOut successful');
      }

      // Proactively clear any persisted session storage (web)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          console.log('🔴 AuthContext: Clearing localStorage...');
          window.localStorage.removeItem('supabase.auth.token');
          console.log('🔴 AuthContext: localStorage cleared');
        } catch (_) {
          console.log('🔴 AuthContext: Failed to clear localStorage');
        }
      }

      // Clear user state
      console.log('🔴 AuthContext: Setting user to null...');
      setUser(null);
      console.log('🔴 AuthContext: User set to null');
      
      if (error) {
        console.log('🔴 AuthContext: Returning error response');
        return { success: false, error };
      }
      console.log('🔴 AuthContext: Returning success response');
      return { success: true, error: null };
    } catch (e) {
      console.error('🔴 AuthContext: Exception in signOut:', e);
      // On unexpected error, still clear local user state so UI redirects
      setUser(null);
      return { success: false, error: e };
    }
  };

  const resetPassword = async (email) => {
    try {
      // Use the current URL origin for redirect with hash fragment for password reset
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      // Redirect to a concrete route so Supabase can append tokens in the URL fragment
      // Using a hash here prevents Supabase from adding access_token/refresh_token correctly
      const redirectUrl = `${baseUrl}/password-reset`;
      console.log('🔗 AuthContext: Reset password redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl, // This will redirect to our app with hash parameters
      });
      if (error) throw error;
      console.log('🔗 AuthContext: Reset password email sent successfully');
      return { data, error: null };
    } catch (error) {
      console.error('🔗 AuthContext: Reset password error:', error);
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword, accessToken, refreshToken, code, type) => {
    try {
      console.log('AuthContext: Starting password update...', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        hasCode: !!code,
        type: type || null,
      });
      
      let updateData = null;
      
      if (type === 'recovery') {
        // Recovery flow: Supabase sets a session from the URL; just update password
        console.log('AuthContext: Using recovery flow (updateUser only)');
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          console.error('AuthContext: Password update error (recovery):', error);
          throw error;
        }
        updateData = data;
        console.log('AuthContext: Password updated successfully via recovery flow');
      } else if (accessToken && refreshToken) {
        // Token-based password reset flow (legacy)
        console.log('AuthContext: Using token-based password reset');
        
        // Set the session with the tokens from the reset link
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('AuthContext: Session error:', sessionError);
          throw sessionError;
        }

        console.log('AuthContext: Session set successfully');

        // Update the password
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.error('AuthContext: Password update error:', error);
          throw error;
        }

        updateData = data;
        console.log('AuthContext: Password updated successfully with tokens');
      } else if (code) {
        // Only handle test codes to avoid PKCE mismatch issues on non-recovery codes
        console.log('AuthContext: Code present without recovery type');
        if (code.startsWith('test_')) {
          console.log('AuthContext: Using test code, simulating successful password update');
          updateData = { user: { id: 'test-user' } };
          console.log('AuthContext: Test password update completed');
        } else {
          console.warn('AuthContext: Non-recovery code provided; attempting update with existing session');
          const { data, error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) {
            console.error('AuthContext: Password update error (non-recovery code):', error);
            throw error;
          }
          updateData = data;
          console.log('AuthContext: Password updated successfully with existing session');
        }
      } else {
        throw new Error('No valid authentication parameters provided');
      }

      // Sign out the user after password update to force fresh login
      // Skip signOut for test codes during development
      if (!code || !code.startsWith('test_')) {
        console.log('AuthContext: Signing out user after password update');
        await supabase.auth.signOut();
      } else {
        console.log('AuthContext: Skipping signOut for test code');
      }
      
      return { data: updateData, error: null };
    } catch (error) {
      console.error('AuthContext: Update password error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};