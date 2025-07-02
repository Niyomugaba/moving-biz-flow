
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: 'owner' | 'admin' | 'manager' | 'employee';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and role
          try {
            const [profileResponse, roleResponse] = await Promise.all([
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle(),
              supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle()
            ]);

            if (profileResponse.data) {
              setProfile(profileResponse.data);
            } else {
              // Create a basic profile from user metadata if none exists
              const basicProfile: Profile = {
                id: session.user.id,
                email: session.user.email || null,
                full_name: session.user.user_metadata?.full_name || session.user.email || 'User',
                created_at: session.user.created_at,
                updated_at: new Date().toISOString()
              };
              setProfile(basicProfile);
            }
            
            if (roleResponse.data) {
              setUserRole({ role: roleResponse.data.role as 'owner' | 'admin' | 'manager' | 'employee' });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          setProfile(null);
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasRole = (role: 'owner' | 'admin' | 'manager' | 'employee') => {
    return userRole?.role === role;
  };

  const canAccess = (requiredRoles: Array<'owner' | 'admin' | 'manager' | 'employee'>) => {
    if (!userRole) return false;
    return requiredRoles.includes(userRole.role);
  };

  return {
    user,
    session,
    profile,
    userRole,
    isLoading,
    signOut,
    hasRole,
    canAccess,
    isAuthenticated: !!session
  };
};
