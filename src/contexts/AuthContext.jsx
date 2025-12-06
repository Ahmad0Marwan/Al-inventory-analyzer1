
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    
    if (session?.user) {
        setUser(session.user);
    } else {
        setUser(null);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const register = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong",
      });
      return { error: true };
    }

    if (data?.user) {
        // Notification disabled as requested
        // toast({
        //     title: "Registration Successful",
        //     description: "Welcome to AI Inventory Analyzer!",
        // });
        return { error: false };
    }
    
    return { error: false };
  }, [toast]);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Something went wrong",
      });
      return { error: true };
    }

    // Notification disabled as requested
    // toast({
    //     title: "Login Successful",
    //     description: "Welcome back!",
    // });

    return { error: false };
  }, [toast]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "Something went wrong",
      });
      return { error: true };
    }

    // Notification disabled as requested
    // toast({
    //   title: "Logged Out",
    //   description: "You have been successfully logged out",
    // });
    return { error: false };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    register,
    login,
    logout,
  }), [user, session, loading, register, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
