import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  STATION_MANAGEMENT_API, 
  STATION_MANAGEMENT_API_CONFIG,
  MOCK_STATIONS,
  MOCK_STATION_STATS,
  STATION_REFRESH_INTERVALS,
  formatCurrency,
  validateStationForm,
  generateStationCode,
  generateUsername,

} from '../constants/stationManagementConstants';
import type { 
  Station,
  StationFormData,
  StationStats,
  StationsResponse,
  StationResponse,
  StationUserCredentials,
  StationUserResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  StationFilters,
  StationValidationErrors,
  StationManagementConnectionStatus,
  StationManagementApiError
} from '../types/stationManagement';

export function useStationManagement() {
  const { user } = useAuth();
  
  // State management
  const [stations, setStations] = useState<Station[]>([]);
  const [statistics, setStatistics] = useState<StationStats>({
    totalStations: 0,
    activeStations: 0,
    inactiveStations: 0,
    maintenanceStations: 0,
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    totalMonthlyTarget: 0,
    averageCommissionRate: 0,
    stationsWithManagers: 0,
    stationsNeedingAttention: 0,
    usersNeedingPasswordReset: 0
  });
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<StationManagementConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: STATION_MANAGEMENT_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<StationFilters>({
    status: 'ALL',
    userStatus: 'ALL',
    region: 'ALL',
    hasManager: 'ALL',
    needsPasswordReset: 'ALL',
    search: ''
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<StationValidationErrors>({});
  
  // Error state
  const [lastError, setLastError] = useState<StationManagementApiError | null>(null);

  // Refs to prevent infinite loops
  const isMountedRef = useRef(true);
  const lastFetchRef = useRef<string>('');

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), STATION_MANAGEMENT_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${STATION_MANAGEMENT_API.BASE_URL}${STATION_MANAGEMENT_API.ENDPOINTS.HEALTH_CHECK}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token || ''}`
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        setConnectionStatus({
          connected: true,
          lastChecked: new Date().toISOString(),
          endpoint: STATION_MANAGEMENT_API.BASE_URL,
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
        endpoint: STATION_MANAGEMENT_API.BASE_URL
      });
      return false;
    }
  }, [user?.token]);

  // Generic API call with retry logic
  const apiCall = useCallback(async function<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= STATION_MANAGEMENT_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), STATION_MANAGEMENT_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${STATION_MANAGEMENT_API.BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token || ''}`,
            ...options.headers
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
        }
        
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        // If no content or content-length is 0, return default success response
        if (contentLength === '0' || !contentType?.includes('application/json')) {
          return { success: true, message: 'Operation completed successfully' } as T;
        }
        
        const responseText = await response.text();
        if (!responseText.trim()) {
          return { success: true, message: 'Operation completed successfully' } as T;
        }
        
        try {
          return JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('Failed to parse JSON response:', responseText);
          return { success: true, message: 'Operation completed successfully' } as T;
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`API call attempt ${attempt} failed:`, error);
        
        if (attempt < STATION_MANAGEMENT_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, STATION_MANAGEMENT_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch all stations with users - Stabilized version to prevent infinite loops
  const fetchStations = useCallback(async (forceFetch = false) => {
    if (!isMountedRef.current) return;
    
    // Create a hash of current filters to prevent unnecessary refetches
    const filtersHash = JSON.stringify(filters);
    if (!forceFetch && lastFetchRef.current === filtersHash) {
      return;
    }
    
    setIsLoading(true);
    lastFetchRef.current = filtersHash;
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add filters
        if (filters.status && filters.status !== 'ALL') {
          params.append('status', filters.status);
        }
        if (filters.userStatus && filters.userStatus !== 'ALL') {
          params.append('userStatus', filters.userStatus);
        }
        if (filters.region && filters.region !== 'ALL') {
          params.append('region', filters.region);
        }
        if (filters.hasManager && filters.hasManager !== 'ALL') {
          params.append('hasManager', filters.hasManager);
        }
        if (filters.needsPasswordReset && filters.needsPasswordReset !== 'ALL') {
          params.append('needsPasswordReset', filters.needsPasswordReset);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        const endpoint = `${STATION_MANAGEMENT_API.ENDPOINTS.STATIONS}?${params.toString()}`;
        const response: StationsResponse = await apiCall<StationsResponse>(endpoint);
        
        if (isMountedRef.current) {
          setStations(response.content || []);
          setStatistics(response.stats);

          console.log('Stations fetched successfully:', response.content);
        }
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for station management');
        let mockStations = [...MOCK_STATIONS];
        
        // Apply filters to mock data with null safety
        if (filters.status && filters.status !== 'ALL') {
          mockStations = mockStations.filter(station => 
            station.operational.status === filters.status
          );
        }
        if (filters.userStatus && filters.userStatus !== 'ALL') {
          mockStations = mockStations.filter(station => 
            station.user && station.user.status === filters.userStatus
          );
        }
        if (filters.region && filters.region !== 'ALL') {
          mockStations = mockStations.filter(station => 
            station.location.region === filters.region
          );
        }
        if (filters.hasManager && filters.hasManager !== 'ALL') {
          mockStations = mockStations.filter(station => 
            filters.hasManager === 'YES' ? !!station.contact.manager : !station.contact.manager
          );
        }
        if (filters.needsPasswordReset && filters.needsPasswordReset !== 'ALL') {
          mockStations = mockStations.filter(station => 
            station.user && (filters.needsPasswordReset === 'YES' ? station.user.mustChangePassword : !station.user.mustChangePassword)
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockStations = mockStations.filter(station => 
            station.name.toLowerCase().includes(searchLower) ||
            station.code.toLowerCase().includes(searchLower) ||
            station.location.city.toLowerCase().includes(searchLower) ||
            station.location.region.toLowerCase().includes(searchLower) ||
            (station.user && station.user.username.toLowerCase().includes(searchLower))
          );
        }
        
        if (isMountedRef.current) {
          setStations(mockStations);
          setStatistics(MOCK_STATION_STATS);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        const apiError: StationManagementApiError = {
          code: 'FETCH_STATIONS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
        setLastError(apiError);
        
        toast.error('Failed to fetch stations data', {
          description: 'Using cached data. Please check your connection.'
        });
        
        // Fallback to mock data
        setStations(MOCK_STATIONS);
        setStatistics(MOCK_STATION_STATS);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [checkConnection, apiCall, filters]);

  // Assign existing user as manager to station
  const assignManager = useCallback(async (stationId: string, userId: string, userDetails: {
    manager: string;
    managerEmail: string;
    managerPhone: string;
    managerUserId: string
  }): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATION_MANAGEMENT_API.ENDPOINTS.ASSIGN_MANAGER?.replace(':id', stationId) || 
          `/api/stations/${stationId}/assign-manager`;
        console.log('the endpoint:', endpoint);
        console.log('the user details:', userDetails);
        const response: StationResponse = await apiCall<StationResponse>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify({
              managerDetails: userDetails,
              assignedBy: user?.name || 'Current User'
            })
          }
        );
        
        toast.success('Manager assigned successfully!', {
          description: response.message
        });
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock manager assignment
        const stationToUpdate = stations.find(s => s.id === stationId);
        if (stationToUpdate) {
          const updatedStations = stations.map(station => 
            station.id === stationId ? {
              ...station,
              contact: {
                ...station.contact,
                manager: {
                  name: userDetails.manager,
                  email: userDetails.managerEmail,
                  phone: userDetails.managerPhone,
                  userId: userId,
                  assignedAt: new Date().toISOString(),
                  assignedBy: user?.name || 'Current User'
                }
              },
              lastModifiedBy: user?.name || 'Current User',
              lastModifiedAt: new Date().toISOString()
            } : station
          );
          
          setStations(updatedStations);
          
          // Update statistics
          setStatistics(prev => ({
            ...prev,
            stationsWithManagers: prev.stationsWithManagers + 1
          }));
          
          toast.success('Manager assigned successfully! (Mock Mode)', {
            description: `${userDetails.manager} assigned to ${stationToUpdate.name}`
          });
          
          return true;
        } else {
          toast.error('Station not found');
          return false;
        }
      }
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'ASSIGN_MANAGER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stationId
      };
      setLastError(apiError);
      
      toast.error('Failed to assign manager', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, stations, fetchStations]);

  // Create new station
  const createStation = useCallback(async (formData: StationFormData): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const errors = validateStationForm(formData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Validation failed', {
          description: 'Please fix the validation errors before submitting.'
        });
        return false;
      }
      
      setValidationErrors({});
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const response: StationUserResponse = await apiCall<StationUserResponse>(
          STATION_MANAGEMENT_API.ENDPOINTS.CREATE_STATION,
          {
            method: 'POST',
            body: JSON.stringify({
              ...formData,
              createdBy: user?.name || 'Current User'
            })
          }
        );
        
        toast.success('Station created successfully!', {
          description: response.message
        });
        
        // Show security notes if available
        if (response.securityNotes && response.securityNotes.length > 0) {
          toast.info('Security Notice', {
            description: response.securityNotes.join(', ')
          });
        }
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock station creation - Create station without user account (as backend is doing)
        const newStation: Station = {
          id: `station-${Date.now()}`,
          name: formData.name,
          code: formData.code,
          location: {
            address: formData.address,
            city: formData.city,
            region: formData.region
          },
          contact: {
            phone: formData.phone,
            email: formData.email
          },
          operational: {
            status: 'ACTIVE',
            operatingHours: formData.operatingHours,
            fuelTypes: formData.fuelTypes as any,
            tankCapacity: formData.tankCapacity,
            pumpCount: formData.pumpCount
          },
          financial: {
            monthlyTarget: formData.monthlyTarget,
            commissionRate: 2.5,
            securityDeposit: 25000
          },
          user: null, // No user account created initially
          createdBy: user?.name || 'Current User',
          createdAt: new Date().toISOString(),
          notes: formData.notes
        };
        
        // Add to mock data
        setStations(prev => [...prev, newStation]);
        
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          totalStations: prev.totalStations + 1,
          activeStations: prev.activeStations + 1,
          totalMonthlyTarget: prev.totalMonthlyTarget + formData.monthlyTarget
        }));
        
        toast.success('Station created successfully! (Mock Mode)', {
          description: `${formData.name} has been added to the system. Assign a manager separately.`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'CREATE_STATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to create station', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, fetchStations]);

  // Update existing station
  const updateStation = useCallback(async (stationId: string, formData: StationFormData): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const errors = validateStationForm(formData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Validation failed', {
          description: 'Please fix the validation errors before submitting.'
        });
        return false;
      }
      
      setValidationErrors({});
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATION_MANAGEMENT_API.ENDPOINTS.UPDATE_STATION.replace(':id', stationId);
        const response: StationResponse = await apiCall<StationResponse>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify({
              ...formData,
              lastModifiedBy: user?.name || 'Current User'
            })
          }
        );
        
        toast.success('Station updated successfully!', {
          description: response.message
        });
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock station update
        const updatedStations = stations.map(station => 
          station.id === stationId ? {
            ...station,
            name: formData.name,
            code: formData.code,
            location: {
              address: formData.address,
              city: formData.city,
              region: formData.region
            },
            contact: {
              phone: formData.phone,
              email: formData.email,
              manager: station.contact.manager
            },
            operational: {
              ...station.operational,
              operatingHours: formData.operatingHours,
              fuelTypes: formData.fuelTypes as any,
              tankCapacity: formData.tankCapacity,
              pumpCount: formData.pumpCount
            },
            financial: {
              ...station.financial,
              monthlyTarget: formData.monthlyTarget
            },
            lastModifiedBy: user?.name || 'Current User',
            lastModifiedAt: new Date().toISOString(),
            notes: formData.notes
          } : station
        );
        
        setStations(updatedStations);
        
        toast.success('Station updated successfully! (Mock Mode)', {
          description: `${formData.name} has been updated`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'UPDATE_STATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stationId
      };
      setLastError(apiError);
      
      toast.error('Failed to update station', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, stations, fetchStations]);

  // Delete station
  const deleteStation = useCallback(async (stationId: string): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATION_MANAGEMENT_API.ENDPOINTS.DELETE_STATION.replace(':id', stationId);
        const response: StationResponse = await apiCall<StationResponse>(
          endpoint,
          {
            method: 'DELETE'
          }
        );
        
        toast.success('Station deleted successfully!', {
          description: response.message
        });
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock station deletion
        const stationToDelete = stations.find(s => s.id === stationId);
        if (stationToDelete) {
          const updatedStations = stations.filter(station => station.id !== stationId);
          setStations(updatedStations);
          
          // Update statistics - handle null user case
          setStatistics(prev => ({
            ...prev,
            totalStations: prev.totalStations - 1,
            activeStations: stationToDelete.operational.status === 'ACTIVE' ? prev.activeStations - 1 : prev.activeStations,
            totalUsers: stationToDelete.user ? prev.totalUsers - 1 : prev.totalUsers,
            activeUsers: stationToDelete.user && stationToDelete.user.status === 'ACTIVE' ? prev.activeUsers - 1 : prev.activeUsers,
            totalMonthlyTarget: prev.totalMonthlyTarget - stationToDelete.financial.monthlyTarget,
            stationsWithManagers: stationToDelete.contact.manager ? prev.stationsWithManagers - 1 : prev.stationsWithManagers
          }));
          
          toast.success('Station deleted successfully! (Mock Mode)', {
            description: `${stationToDelete.name} has been removed from the system`
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'DELETE_STATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stationId
      };
      setLastError(apiError);
      
      toast.error('Failed to delete station', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, stations, fetchStations]);

  // Reset station user password
  const resetPassword = useCallback(async (
    stationId: string, 
    resetData: { newPassword: string; confirmPassword: string; mustChangePassword: boolean }
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      if (resetData.newPassword !== resetData.confirmPassword) {
        toast.error('Password mismatch', {
          description: 'New password and confirmation do not match'
        });
        return false;
      }
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATION_MANAGEMENT_API.ENDPOINTS.RESET_PASSWORD.replace(':id', stationId);
        const response: PasswordResetResponse = await apiCall<PasswordResetResponse>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify({
              ...resetData,
              stationId,
              requestedBy: user?.name || 'Current User'
            })
          }
        );
        
        toast.success('Password reset successfully!', {
          description: response.message
        });
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock password reset - handle null user case
        const stationToUpdate = stations.find(s => s.id === stationId);
        if (stationToUpdate && stationToUpdate.user) {
          const updatedStations = stations.map(station => 
            station.id === stationId && station.user ? {
              ...station,
              user: {
                ...station.user,
                passwordChanged: true,
                mustChangePassword: resetData.mustChangePassword,
                lastModifiedAt: new Date().toISOString()
              },
              lastModifiedBy: user?.name || 'Current User',
              lastModifiedAt: new Date().toISOString()
            } : station
          );
          
          setStations(updatedStations);
          
          toast.success('Password reset successfully! (Mock Mode)', {
            description: `Password updated for ${stationToUpdate.name}`
          });
          
          return true;
        } else {
          toast.error('Station has no associated user account');
          return false;
        }
      }
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'RESET_PASSWORD_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stationId
      };
      setLastError(apiError);
      
      toast.error('Failed to reset password', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, stations, fetchStations]);

  // Update station status
  const updateStationStatus = useCallback(async (
    stationId: string, 
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED'
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = status === 'ACTIVE' 
          ? STATION_MANAGEMENT_API.ENDPOINTS.ACTIVATE_STATION.replace(':id', stationId)
          : STATION_MANAGEMENT_API.ENDPOINTS.DEACTIVATE_STATION.replace(':id', stationId);
        
        const response: StationResponse = await apiCall<StationResponse>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify({ status })
          }
        );
        
        toast.success('Station status updated successfully!', {
          description: response.message
        });
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock status update - handle null user case
        const stationToUpdate = stations.find(s => s.id === stationId);
        if (stationToUpdate) {
          const updatedStations = stations.map(station => 
            station.id === stationId ? {
              ...station,
              operational: {
                ...station.operational,
                status
              },
              user: station.user ? {
                ...station.user,
                status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
              } : station.user,
              lastModifiedBy: user?.name || 'Current User',
              lastModifiedAt: new Date().toISOString()
            } : station
          );
          
          setStations(updatedStations);
          
          toast.success('Station status updated successfully! (Mock Mode)', {
            description: `${stationToUpdate.name} is now ${status.toLowerCase()}`
          });
          
          return true;
        }
      }
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'UPDATE_STATUS_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stationId
      };
      setLastError(apiError);
      
      toast.error('Failed to update station status', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, stations, fetchStations]);

  // Unassign manager from station
  const unassignManager = useCallback(async (stationId: string): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATION_MANAGEMENT_API.ENDPOINTS.UNASSIGN_MANAGER?.replace(':id', stationId) || 
          STATION_MANAGEMENT_API.ENDPOINTS.ASSIGN_MANAGER?.replace(':id', stationId);
        
        const response: StationResponse = await apiCall<StationResponse>(
          endpoint,
          {
            method: 'POST'
          }
        );
        
        toast.success('Manager unassigned successfully!', {
          description: response.message
        });
        
        // Refresh stations list
        await fetchStations(true);
        
        return true;
      } else {
        // Mock manager unassignment
        const stationToUpdate = stations.find(s => s.id === stationId);
        if (stationToUpdate && stationToUpdate.contact.manager) {
          const updatedStations = stations.map(station => 
            station.id === stationId ? {
              ...station,
              contact: {
                ...station.contact,
                manager: undefined
              },
              lastModifiedBy: user?.name || 'Current User',
              lastModifiedAt: new Date().toISOString()
            } : station
          );
          
          setStations(updatedStations);
          
          // Update statistics
          setStatistics(prev => ({
            ...prev,
            stationsWithManagers: prev.stationsWithManagers - 1
          }));
          
          toast.success('Manager unassigned successfully! (Mock Mode)', {
            description: `Manager removed from ${stationToUpdate.name}`
          });
          
          return true;
        } else {
          toast.error('No manager assigned to this station');
          return false;
        }
      }
    } catch (error) {
      const apiError: StationManagementApiError = {
        code: 'UNASSIGN_MANAGER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stationId
      };
      setLastError(apiError);
      
      toast.error('Failed to unassign manager', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, stations, fetchStations]);

  // Initialize component and prevent infinite loops
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch stations when user changes or when manually triggered
  useEffect(() => {
    if (user && canManageStations) {
      fetchStations(true);
    }
  }, [user]); // Only depend on user, not on fetchStations to prevent loops

  // Update filters handler (does not trigger refetch automatically)
  const updateFilters = useCallback((newFilters: Partial<StationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // The refetch will happen due to the filters dependency in fetchStations
    // But we debounce it to prevent excessive API calls
    setTimeout(() => {
      if (isMountedRef.current) {
        fetchStations(true);
      }
    }, 300);
  }, [fetchStations]);

  // Refresh data handler
  const refreshData = useCallback(() => {
    fetchStations(true);
  }, [fetchStations]);

  // Generate new station code helper
  const generateNewStationCode = useCallback((cityName: string): string => {
    return generateStationCode(cityName, stations.length);
  }, [stations.length]);

  // Access control
  const canManageStations = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN';
  const hasData = stations.length > 0;

  return {
    // Data
    stations,
    statistics,
    
    // States
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    validationErrors,
    
    // Actions
    createStation,
    updateStation,
    deleteStation,
    updateStationStatus,
    assignManager,
    unassignManager,
    resetPassword,
    refreshData,
    updateFilters,
    generateNewStationCode,
    
    // Helpers
    canManageStations,
    hasData
  };
}