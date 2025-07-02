import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, Menu } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager' | 'employee'>('employee');

  // Fetch actual users from auth.users via admin API
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      try {
        // Get all user roles first
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
        
        if (rolesError) throw rolesError;

        // Get authenticated users (this will show users who have signed up)
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.log('Could not fetch auth users:', authError);
          // Fallback to showing role assignments only
          return userRoles?.map(role => ({
            id: role.user_id,
            email: 'User email not available',
            full_name: 'User Name',
            created_at: new Date().toISOString(),
            user_roles: [{ role: role.role }]
          })) || [];
        }

        // Combine auth users with their roles
        const usersWithRoles: UserWithRole[] = authUsers.users.map(user => {
          const userRole = userRoles?.find(role => role.user_id === user.id);
          return {
            id: user.id,
            email: user.email || null,
            full_name: user.user_metadata?.full_name || user.email || 'User',
            created_at: user.created_at,
            user_roles: userRole ? [{ role: userRole.role }] : []
          };
        });

        return usersWithRoles;
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: role as any })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as any });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  });

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Send actual invitation via Supabase Auth
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { role: role },
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) throw error;
      return { email, role, data };
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation Sent",
        description: `Invitation email sent to ${data.email} with ${data.role} role.`,
      });
      setNewUserEmail('');
      setNewUserRole('employee');
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation.",
        variant: "destructive",
      });
    }
  });

  const handleAssignRole = (userId: string, role: string) => {
    assignRoleMutation.mutate({ userId, role });
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;
    
    inviteUserMutation.mutate({ email: newUserEmail, role: newUserRole });
  };

  if (!hasRole('owner')) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-sm sm:text-base">Only owners can access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">User Management</h1>
      </div>

      {/* Invite New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-1 lg:col-span-1">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-1">
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <Button 
                  type="submit" 
                  disabled={inviteUserMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {inviteUserMutation.isPending ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Existing Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{user.full_name || 'No name'}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3">
                    <Select
                      value={user.user_roles?.[0]?.role || 'employee'}
                      onValueChange={(role) => handleAssignRole(user.id, role)}
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-1">
                      {user.user_roles?.[0]?.role === 'admin' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Admin" />
                      )}
                      {user.user_roles?.[0]?.role === 'manager' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Manager" />
                      )}
                      {(!user.user_roles?.[0]?.role || user.user_roles?.[0]?.role === 'employee') && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" title="Employee" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm sm:text-base">No users found yet.</p>
                  <p className="text-xs sm:text-sm mt-2">Use the invite feature above to add users.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
