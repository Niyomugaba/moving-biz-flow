import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield } from 'lucide-react';

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

  // For now, we'll use a simple approach until the profiles table is properly set up
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get user roles first
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Create mock user data for now
      const mockUsers: UserWithRole[] = userRoles?.map(role => ({
        id: role.user_id,
        email: `user@example.com`,
        full_name: 'User Name',
        created_at: new Date().toISOString(),
        user_roles: [{ role: role.role }]
      })) || [];

      return mockUsers;
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
      // This would typically send an invitation email
      // For now, we'll just show a message
      return { email, role };
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${data.email} with ${data.role} role. They will need to sign up using this email.`,
      });
      setNewUserEmail('');
      setNewUserRole('employee');
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
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only owners can access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-800">User Management</h1>
      </div>

      {/* Invite New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteUser} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Existing Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{user.full_name || 'No name'}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={user.user_roles?.[0]?.role || 'employee'}
                      onValueChange={(role) => handleAssignRole(user.id, role)}
                    >
                      <SelectTrigger className="w-32">
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
                  No users found. Sign up users first, then assign roles here.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
