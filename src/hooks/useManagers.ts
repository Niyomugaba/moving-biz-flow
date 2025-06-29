
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useManagers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: managers = [], isLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const authenticateManager = async (username: string, pin: string) => {
    console.log('Authenticating manager:', username);
    
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('username', username)
      .eq('pin', pin)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Manager authentication error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Invalid username or PIN');
    }

    return data;
  };

  return {
    managers,
    isLoading,
    authenticateManager
  };
};
