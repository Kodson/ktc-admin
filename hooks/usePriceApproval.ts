import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { 
  PRICE_APPROVAL_API, 
  API_CONFIG, 
  MOCK_PENDING_CHANGES, 
  MOCK_HISTORICAL_CHANGES,
  REFRESH_INTERVALS 
} from '../constants/priceApprovalConstants';
import type { 
  PriceChange, 
  PriceChangeResponse, 
  PriceChangeApprovalRequest,
  PriceChangeApprovalResponse,
  PriceChangeFilters,
  PriceApprovalStats,
  ConnectionStatus,
  ApiError
} from '../types/productSharing';

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ktc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export function usePriceApproval() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  // State management
  const [pendingChanges, setPendingChanges] = useState<PriceChange[]>([]);
  const [historicalChanges, setHistoricalChanges] = useState<PriceChange[]>([]);
  const [statistics, setStatistics] = useState<PriceApprovalStats>({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalAffectedTanks: 0,
    averagePriceChange: 0,
    totalValueImpact: 0
  });
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: PRICE_APPROVAL_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<PriceChangeFilters>({
    status: 'ALL',
    station: 'All Stations',
    fuelType: 'All Types',
    search: ''
  });
  
  // Error state
  const [lastError, setLastError] = useState<ApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${PRICE_APPROVAL_API.BASE_URL}${PRICE_APPROVAL_API.ENDPOINTS.HEALTH_CHECK}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        setConnectionStatus({
          connected: true,
          lastChecked: new Date().toISOString(),
          endpoint: PRICE_APPROVAL_API.BASE_URL,
          responseTime
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
        endpoint: PRICE_APPROVAL_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${PRICE_APPROVAL_API.BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...getAuthHeaders(),
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
        
        if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch pending price changes
  const fetchPendingChanges = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const queryParams = new URLSearchParams();
        
        // Add station filter for station managers
        if (user?.role === 'ROLE_STATION_MANAGER' && user?.id) {
          queryParams.append('managerId', user.id);
        } else if (filters.station && filters.station !== 'All Stations') {
          queryParams.append('station', filters.station);
        }
        
        if (filters.fuelType && filters.fuelType !== 'All Types') {
          queryParams.append('fuelType', filters.fuelType); 
        }
        if (filters.search) {
          queryParams.append('search', filters.search);
        }
        
        const endpoint = `${PRICE_APPROVAL_API.ENDPOINTS.PENDING_CHANGES}?${queryParams}`;
        const response: PriceChangeResponse = await apiCall<PriceChangeResponse>(endpoint);
        const data = Array.isArray(response) ? response : response?.data ?? [];
        console.log("Pending Changes Fetched:", data);
        setPendingChanges(data);
        toast.success('Pending changes updated', {
          description: `Found ${data.length || 0} pending price changes`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for pending changes');
        let mockData = [...MOCK_PENDING_CHANGES];
        
        // Apply station filter for station managers
        if (user?.role === 'ROLE_STATION_MANAGER' && user?.id) {
          // In a real implementation, you'd filter based on station-manager relationship
          // For mock data, we'll use a simplified approach
          console.log('Station manager logged in, filtering mock data for user ID:', user.id);
        } else if (filters.station && filters.station !== 'All Stations') {
          mockData = mockData.filter(change => change.station === filters.station);
        }
        
        if (filters.fuelType && filters.fuelType !== 'All Types') {
          mockData = mockData.filter(change => change.fuelType === filters.fuelType);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockData = mockData.filter(change => 
            change.tankName.toLowerCase().includes(searchLower) ||
            change.station.toLowerCase().includes(searchLower) ||
            change.requestedBy.toLowerCase().includes(searchLower) ||
            change.reason.toLowerCase().includes(searchLower)
          );
        }
        
        setPendingChanges(mockData);
      }
    } catch (error) {
      const apiError: ApiError = {
        code: 'FETCH_PENDING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch pending changes', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      setPendingChanges(MOCK_PENDING_CHANGES);
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters]);

  // Fetch historical price changes
const fetchHistoricalChanges = useCallback(async () => {
  try {
    const isConnected = await checkConnection();

    if (isConnected) {
      console.log("Fetching historical changes from API");
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== "ALL") {
        queryParams.append("status", filters.status);
      }
      
      // Add station filter for station managers
      if (user?.role === 'ROLE_STATION_MANAGER' && user?.id) {
        queryParams.append('managerId', user.id);
      } else if (filters.station && filters.station !== "All Stations") {
        queryParams.append("station", filters.station);
      }
      if (filters.fuelType && filters.fuelType !== "All Types") {
        queryParams.append("fuelType", filters.fuelType);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      queryParams.append("limit", "50");

      const endpoint = `${PRICE_APPROVAL_API.ENDPOINTS.HISTORICAL_CHANGES}?${queryParams}`;
      const response = await apiCall<any>(endpoint);

      // ✅ Handle both array and { data: [...] }
      const data = Array.isArray(response) ? response : response?.data ?? [];
      console.log("Historical Changes Parsed:", data);

      setHistoricalChanges(data);
    } else {
      // Use mock data when backend is unavailable
      let mockData = [...MOCK_HISTORICAL_CHANGES];

      if (filters.status && filters.status !== "ALL") {
        mockData = mockData.filter(change => change.status === filters.status);
      }
      
      // Add station filter for station managers
      if (user?.role === 'ROLE_STATION_MANAGER' && user?.id) {
        // In a real implementation, you'd filter based on station-manager relationship
        // For mock data, we'll use a simplified approach
        console.log('Station manager logged in, filtering mock data for user ID:', user.id);
      } else if (filters.station && filters.station !== "All Stations") {
        mockData = mockData.filter(change => change.station === filters.station);
      }
      
      if (filters.fuelType && filters.fuelType !== "All Types") {
        mockData = mockData.filter(change => change.fuelType === filters.fuelType);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        mockData = mockData.filter(
          change =>
            change.tankName.toLowerCase().includes(searchLower) ||
            change.station.toLowerCase().includes(searchLower) ||
            change.requestedBy.toLowerCase().includes(searchLower) ||
            change.reason.toLowerCase().includes(searchLower)
        );
      }

      setHistoricalChanges(mockData);
    }
  } catch (error) {
    const apiError: ApiError = {
      code: "FETCH_HISTORICAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
    setLastError(apiError);

    toast.error("Failed to fetch historical changes", {
      description: "Using cached data. Please check your connection.",
    });

    setHistoricalChanges(MOCK_HISTORICAL_CHANGES);
  }
}, [checkConnection, apiCall, filters]);


  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const stats: PriceApprovalStats = await apiCall<PriceApprovalStats>(PRICE_APPROVAL_API.ENDPOINTS.STATISTICS);
        setStatistics(stats);
      } else {
        // Calculate stats from mock data
        const today = new Date().toDateString();
        const approvedToday = MOCK_HISTORICAL_CHANGES.filter(change => 
          change.status === 'APPROVED' && 
          change.approvedAt && 
          new Date(change.approvedAt).toDateString() === today
        ).length;
        
        const rejectedToday = MOCK_HISTORICAL_CHANGES.filter(change => 
          change.status === 'REJECTED' && 
          change.rejectedAt && 
          new Date(change.rejectedAt).toDateString() === today
        ).length;
        
        const totalAffectedTanks = MOCK_PENDING_CHANGES.reduce(
          (sum, change) => sum + change.totalAffectedTanks, 0
        );
        
        const avgPriceChange = MOCK_PENDING_CHANGES.length > 0 
          ? MOCK_PENDING_CHANGES.reduce(
              (sum, change) => sum + Math.abs(change.percentageChange), 0
            ) / MOCK_PENDING_CHANGES.length
          : 0;
        
        setStatistics({
          pendingCount: MOCK_PENDING_CHANGES.length,
          approvedToday,
          rejectedToday,
          totalAffectedTanks,
          averagePriceChange: avgPriceChange,
          totalValueImpact: 0 // Would be calculated based on volume and price changes
        });
      }
    } catch (error) {
      console.warn('Failed to fetch statistics:', error);
    }
  }, [checkConnection, apiCall]);

  // Approve or reject price change
  const processApproval = useCallback(async (
    changeId: number | string, 
    action: 'APPROVE' | 'REJECT', 
    reason: string
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const request: PriceChangeApprovalRequest = {
        id: changeId,
        action,
        reason,
        approvedBy: user?.name || 'Current User'
      };
      
      const isConnected = await checkConnection();
      console.log("Processing approval:", request, "Connected:", isConnected);
      if (isConnected) {
        // Construct endpoint with ID in the path
        const endpoint = action === 'APPROVE' 
          ? `${PRICE_APPROVAL_API.ENDPOINTS.APPROVE_CHANGE}/${changeId}`
          : `${PRICE_APPROVAL_API.ENDPOINTS.REJECT_CHANGE}/${changeId}`;
          
        console.log("Calling endpoint:", endpoint);
        const response: PriceChangeApprovalResponse = await apiCall<PriceChangeApprovalResponse>(endpoint, {
          method: 'PUT',
          body: JSON.stringify({
            action,
            reason,
            approvedBy: user?.name || 'Current User'
          })
        });
        
        toast.success(`Price change ${action.toLowerCase()}d!`, {
          description: response.message
        });
        
        // Refresh data after successful approval/rejection
        await Promise.all([
          fetchPendingChanges(),
          fetchHistoricalChanges(),
          fetchStatistics()
        ]);
        
        return true;
      } else {
        // Mock approval/rejection for offline mode
        const changeToUpdate = pendingChanges.find(c => c.id === changeId);
        if (changeToUpdate) {
          const updatedChange: PriceChange = {
            ...changeToUpdate,
            status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            ...(action === 'APPROVE' ? {
              approvedBy: user?.name || 'Current User',
              approvedAt: new Date().toISOString()
            } : {
              rejectedBy: user?.name || 'Current User',
              rejectedAt: new Date().toISOString()
            }),
            approvalReason: reason
          };
          
          // Update local state
          setPendingChanges(prev => prev.filter(c => c.id !== changeId));
          setHistoricalChanges(prev => [updatedChange, ...prev]);
          
          toast.success(`Price change ${action.toLowerCase()}d! (Mock Mode)`, {
            description: `${changeToUpdate.tankName} price change processed locally`
          });
          
          return true;
        } else {
          toast.error('Price change not found', {
            description: 'The requested price change could not be found'
          });
          return false;
        }
      }
    } catch (error) {
      const apiError: ApiError = {
        code: 'APPROVAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error(`Failed to ${action.toLowerCase()} price change`, {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, pendingChanges, fetchPendingChanges, fetchHistoricalChanges, fetchStatistics]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchPendingChanges(),
        fetchHistoricalChanges(),
        fetchStatistics()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPendingChanges, fetchHistoricalChanges, fetchStatistics]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PriceChangeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      await refreshData();
    };
    
    initializeData();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendingChanges();
      fetchHistoricalChanges();
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, fetchPendingChanges, fetchHistoricalChanges]);

  // Set up auto-refresh for pending changes
  useEffect(() => {
    if (!connectionStatus.connected) return;
    
    const interval = setInterval(() => {
      fetchPendingChanges();
      fetchStatistics();
    }, REFRESH_INTERVALS.PENDING_CHANGES);
    
    return () => clearInterval(interval);
 }, [connectionStatus.connected, fetchPendingChanges, fetchStatistics]);

  return {
    // Data
    pendingChanges,
    historicalChanges,
    statistics,
    
    // State
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    
    // Actions
    processApproval,
    refreshData,
    updateFilters,
    checkConnection,
    
    // Computed values
    canApprove: user?.role === 'ROLE_SUPER_ADMIN',
    filteredPendingChanges: pendingChanges,
    filteredHistoricalChanges: historicalChanges
  };
}