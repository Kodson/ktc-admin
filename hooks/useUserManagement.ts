import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  USER_MANAGEMENT_API, 
  USER_MANAGEMENT_API_CONFIG,
  MOCK_USERS,
  MOCK_USER_STATS,
  USER_REFRESH_INTERVALS,
  validateUserForm,
  generateSecurePassword,
  validatePasswordStrength,
  formatPhoneNumber
} from '../constants/userManagementConstants';
import type { 
  User,
  UserFormData,
  UserStats,
  UsersResponse,
  UserResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  UserStatusUpdateRequest,
  UserAssignmentRequest,
  UserFilters,
  UserValidationErrors,
  UserManagementConnectionStatus,
  UserManagementApiError
} from '../types/userManagement';

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ktc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export function useUserManagement() {
  const { user: currentUser } = useAuth();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    suspendedUsers: 0,
    lockedUsers: 0,
    stationManagers: 0,
    admins: 0,
    superAdmins: 0,
    unassignedUsers: 0,
    usersNeedingPasswordReset: 0
  });
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<UserManagementConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: USER_MANAGEMENT_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<UserFilters>({
    status: 'ALL',
    role: 'ALL',
    assignmentStatus: 'ALL',
    needsPasswordReset: 'ALL',
    search: ''
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<UserValidationErrors>({});
  
  // Error state
  const [lastError, setLastError] = useState<UserManagementApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), USER_MANAGEMENT_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${USER_MANAGEMENT_API.BASE_URL}${USER_MANAGEMENT_API.ENDPOINTS.HEALTH_CHECK}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        setConnectionStatus({
          connected: true,
          lastChecked: new Date().toISOString(),
          endpoint: USER_MANAGEMENT_API.BASE_URL,
          responseTime,
          lastSyncTime: new Date().toISOString()
        });
        setLastError(null);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Backend connection failed:', error);
      setConnectionStatus({
        connected: false,
        lastChecked: new Date().toISOString(),
        endpoint: USER_MANAGEMENT_API.BASE_URL
      });
      return false;
    }
  }, [currentUser?.token]);

  // Generic API call with retry logic
  const apiCall = useCallback(async function<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= USER_MANAGEMENT_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), USER_MANAGEMENT_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${USER_MANAGEMENT_API.BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token || ''}`,
            ...options.headers
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        console.warn(`API call attempt ${attempt} failed:`, error);
        
        if (attempt < USER_MANAGEMENT_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, USER_MANAGEMENT_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [currentUser?.token]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add filters
        if (filters.status && filters.status !== 'ALL') {
          params.append('status', filters.status);
        }
        if (filters.role && filters.role !== 'ALL') {
          params.append('role', filters.role);
        }
        if (filters.assignmentStatus && filters.assignmentStatus !== 'ALL') {
          params.append('assignmentStatus', filters.assignmentStatus);
        }
        if (filters.needsPasswordReset && filters.needsPasswordReset !== 'ALL') {
          params.append('needsPasswordReset', filters.needsPasswordReset);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        const endpoint = `${USER_MANAGEMENT_API.ENDPOINTS.USERS}?${params.toString()}`;
        const response: UsersResponse = await apiCall<UsersResponse>(endpoint);
        console.log('Fetched users:', response.data);
        setUsers(response.data || []);
        setStatistics(response.stats);
        
        toast.success('Users data updated', {
          description: `Found ${response.data?.length || 0} users`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for user management');
        let mockUsers = [...MOCK_USERS];
        
        // Apply filters to mock data
        if (filters.status && filters.status !== 'ALL') {
          mockUsers = mockUsers.filter(user => 
            user.status === filters.status
          );
        }
        if (filters.role && filters.role !== 'ALL') {
          mockUsers = mockUsers.filter(user => 
            user.role === filters.role
          );
        }
        if (filters.assignmentStatus && filters.assignmentStatus !== 'ALL') {
          mockUsers = mockUsers.filter(user => 
            filters.assignmentStatus === 'ASSIGNED' ? user.assignedStations.length > 0 : user.assignedStations.length === 0
          );
        }
        if (filters.needsPasswordReset && filters.needsPasswordReset !== 'ALL') {
          mockUsers = mockUsers.filter(user => 
            filters.needsPasswordReset === 'YES' ? user.mustChangePassword : !user.mustChangePassword
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockUsers = mockUsers.filter(user => 
            user.username.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.fullName.toLowerCase().includes(searchLower) ||
            user.phone.includes(filters.search!)
          );
        }
        
        setUsers(mockUsers);
        setStatistics(MOCK_USER_STATS);
      }
    } catch (error) {
      const apiError: UserManagementApiError = {
        code: 'FETCH_USERS_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch users data', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      setUsers(MOCK_USERS);
      setStatistics(MOCK_USER_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters]);

  // Create new user
  const createUser = useCallback(async (formData: UserFormData): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.username || !formData.email || !formData.password || !formData.phone) {
        toast.error('Validation failed', {
          description: 'Please fill in all required fields.'
        });
        return false;
      }
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        setValidationErrors({
          password: passwordValidation.feedback
        });
        toast.error('Password validation failed', {
          description: 'Please create a stronger password.'
        });
        return false;
      }
      
      setValidationErrors({});
      
      const isConnected = await checkConnection();
      console.log('Creating user with data:', formData);
      if (isConnected) {
        
        // Send data in the exact format specified
        const response: UserResponse = await apiCall<UserResponse>(
          USER_MANAGEMENT_API.ENDPOINTS.CREATE_USER,
          {
            method: 'POST',
            body: JSON.stringify(formData)
          }
        );
        
        toast.success('User created successfully!', {
          description: response.message
        });
        
        // Refresh users list
        await fetchUsers();
        
        return true;
      } else {
        // Mock user creation - parse name from username for display
        const nameParts = formData.username.split(' ');
        const firstName = nameParts[0] || formData.username;
        const lastName = nameParts.slice(1).join(' ') || 'User';
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          role: formData.role as 'station_manager' | 'admin' | 'super_admin',
          status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
          firstName: firstName,
          lastName: lastName,
          fullName: `${firstName} ${lastName}`,
          passwordChanged: true,
          mustChangePassword: false,
          accountLocked: !formData.isNonLocked,
          loginAttempts: 0,
          assignedStations: [],
          createdBy: currentUser?.name || 'Current User',
          createdAt: new Date().toISOString()
        };
        
        // Add to mock data
        setUsers(prev => [...prev, newUser]);
        
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          activeUsers: formData.isActive ? prev.activeUsers + 1 : prev.activeUsers,
          inactiveUsers: !formData.isActive ? prev.inactiveUsers + 1 : prev.inactiveUsers,
          [formData.role === 'station_manager' ? 'stationManagers' : 
           formData.role === 'admin' ? 'admins' : 'superAdmins']: 
           prev[formData.role === 'station_manager' ? 'stationManagers' : 
              formData.role === 'admin' ? 'admins' : 'superAdmins'] + 1,
          unassignedUsers: prev.unassignedUsers + 1,
          lockedUsers: !formData.isNonLocked ? prev.lockedUsers + 1 : prev.lockedUsers
        }));
        
        toast.success('User created successfully! (Mock Mode)', {
          description: `${formData.username} has been added to the system`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: UserManagementApiError = {
        code: 'CREATE_USER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to create user', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, currentUser?.name, checkConnection, apiCall, fetchUsers]);

  // Update user status
  const updateUserStatus = useCallback(async (
    userId: string, 
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    reason?: string
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = USER_MANAGEMENT_API.ENDPOINTS.UPDATE_USER.replace(':id', userId);
        const response: UserResponse = await apiCall<UserResponse>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify({
              status,
              reason,
              updatedBy: currentUser?.name || 'Current User'
            })
          }
        );
        
        toast.success('User status updated successfully!', {
          description: response.message
        });
        
        // Refresh users list
        await fetchUsers();
        
        return true;
      } else {
        // Mock status update
        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate) {
          const updatedUsers = users.map(user => 
            user.id === userId ? {
              ...user,
              status,
              lastModifiedBy: currentUser?.name || 'Current User',
              lastModifiedAt: new Date().toISOString()
            } : user
          );
          
          setUsers(updatedUsers);
          
          toast.success('User status updated successfully! (Mock Mode)', {
            description: `${userToUpdate.fullName} is now ${status.toLowerCase()}`
          });
          
          return true;
        }
      }
    } catch (error) {
      const apiError: UserManagementApiError = {
        code: 'UPDATE_STATUS_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        userId
      };
      setLastError(apiError);
      
      toast.error('Failed to update user status', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, currentUser?.name, checkConnection, apiCall, users, fetchUsers]);

  // Reset user password
  const resetPassword = useCallback(async (
    userId: string, 
    resetData: Omit<PasswordResetRequest, 'userId' | 'requestedBy'>
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      // Validate new password
      const passwordValidation = validatePasswordStrength(resetData.newPassword);
      if (!passwordValidation.isValid) {
        toast.error('Password validation failed', {
          description: passwordValidation.feedback.join(', ')
        });
        return false;
      }
      
      if (resetData.newPassword !== resetData.confirmPassword) {
        toast.error('Password mismatch', {
          description: 'New password and confirmation do not match'
        });
        return false;
      }
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = USER_MANAGEMENT_API.ENDPOINTS.RESET_PASSWORD.replace(':id', userId);
        const response: PasswordResetResponse = await apiCall<PasswordResetResponse>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify({
              ...resetData,
              userId,
              requestedBy: currentUser?.name || 'Current User'
            })
          }
        );
        
        toast.success('Password reset successfully!', {
          description: response.message
        });
        
        // Refresh users list
        await fetchUsers();
        
        return true;
      } else {
        // Mock password reset
        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate) {
          const updatedUsers = users.map(user => 
            user.id === userId ? {
              ...user,
              passwordChanged: true,
              mustChangePassword: resetData.mustChangePassword,
              lastModifiedBy: currentUser?.name || 'Current User',
              lastModifiedAt: new Date().toISOString()
            } : user
          );
          
          setUsers(updatedUsers);
          
          toast.success('Password reset successfully! (Mock Mode)', {
            description: `Password updated for ${userToUpdate.fullName}`
          });
          
          return true;
        }
      }
    } catch (error) {
      const apiError: UserManagementApiError = {
        code: 'RESET_PASSWORD_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        userId
      };
      setLastError(apiError);
      
      toast.error('Failed to reset password', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, currentUser?.name, checkConnection, apiCall, users, fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = USER_MANAGEMENT_API.ENDPOINTS.DELETE_USER.replace(':id', userId);
        await apiCall(endpoint, { method: 'DELETE' });
        
        toast.success('User deleted successfully!');
        
        // Refresh users list
        await fetchUsers();
        
        return true;
      } else {
        // Mock user deletion
        const userToDelete = users.find(u => u.id === userId);
        if (userToDelete) {
          const updatedUsers = users.filter(user => user.id !== userId);
          setUsers(updatedUsers);
          
          toast.success('User deleted successfully! (Mock Mode)', {
            description: `${userToDelete.fullName} has been removed from the system`
          });
          
          return true;
        }
      }
    } catch (error) {
      const apiError: UserManagementApiError = {
        code: 'DELETE_USER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        userId
      };
      setLastError(apiError);
      
      toast.error('Failed to delete user', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall, users, fetchUsers]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUsers();
      toast.success('User data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get user by ID
  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  // Generate secure password
  const generatePassword = useCallback((): string => {
    return generateSecurePassword();
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, fetchUsers]);

  // Set up auto-refresh
  useEffect(() => {
    if (!connectionStatus.connected) return;
    
    const interval = setInterval(() => {
      fetchUsers();
    }, USER_REFRESH_INTERVALS.USERS_DATA);
    
    return () => clearInterval(interval);
  }, [connectionStatus.connected, fetchUsers]);

  return {
    // Data
    users,
    statistics,
    
    // State
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    validationErrors,
    
    // Actions
    createUser,
    updateUserStatus,
    resetPassword,
    deleteUser,
    refreshData,
    updateFilters,
    checkConnection,
    getUserById,
    generatePassword,
    validatePasswordStrength,
    
    // Utilities
    formatPhoneNumber,
    
    // Computed values
    filteredUsers: users,
    activeUsers: users.filter(u => u.status === 'ACTIVE'),
    inactiveUsers: users.filter(u => u.status === 'INACTIVE'),
    suspendedUsers: users.filter(u => u.status === 'SUSPENDED'),
    lockedUsers: users.filter(u => u.status === 'LOCKED'),
    stationManagers: users.filter(u => u.role === 'station_manager'),
    admins: users.filter(u => u.role === 'admin'),
    superAdmins: users.filter(u => u.role === 'super_admin'),
    //unassignedUsers: users.filter(u => u.assignedStations.length === 0),
    usersNeedingPasswordReset: users.filter(u => u.mustChangePassword),
    hasData: users.length > 0,
    canManageUsers: currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_SUPER_ADMIN'
  };
}