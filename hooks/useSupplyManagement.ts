import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { 
  SUPPLY_API, 
  SUPPLY_API_CONFIG, 
  MOCK_PRODUCT_SHARING_SUPPLIES, 
  MOCK_SUPPLY_STATS,
  SUPPLY_REFRESH_INTERVALS 
} from '../constants/supplyConstants';
import type { 
  ProductSharingSupply, 
  SupplyStats,
  SupplyResponse, 
  SupplyConfirmationRequest,
  SupplyConfirmationResponse,
  SupplyFilters,
  SupplyConnectionStatus,
  SupplyApiError
} from '../types/supply';

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ktc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to get the correct endpoint based on user role and station
const getSupplyEndpoint = (user: any, selectedStation: any): string => {
  // If user is a station manager, use their station name for the URL path
  if (user?.role === 'ROLE_STATION_MANAGER') {
    const userStationName = user?.station?.stationName;
    if (userStationName) {
      const endpoint = `/supply/station/${userStationName}`;
      console.log('Station manager endpoint using station name:', endpoint);
      console.log('Parsed station name:', userStationName);
      return endpoint;
    }
  }
  // For admins and super admins, use station-specific endpoint if a station is selected
  else if (selectedStation?.id) {
    return `/supply/station/${encodeURIComponent(selectedStation.id)}`;
  }
  // Default to all supplies endpoint
  return SUPPLY_API.ENDPOINTS.PRODUCT_SHARING_SUPPLIES;
};

export function useSupplyManagement() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  // State management
  const [supplies, setSupplies] = useState<ProductSharingSupply[]>([]);
  const [statistics, setStatistics] = useState<SupplyStats>({
    totalPendingSupplies: 0,
    totalConfirmedToday: 0,
    totalQuantityExpected: 0,
    totalQuantityReceived: 0,
    totalValueExpected: 0,
    totalValueReceived: 0,
    totalShortage: 0,
    totalOverage: 0,
    totalExpectedProfit: 0,
    averageReceiptTime: 0
  });
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SupplyConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: SUPPLY_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<SupplyFilters>({
    status: 'ALL',
    product: 'ALL',
    priority: 'ALL',
    search: ''
  });
  
  // Error state
  const [lastError, setLastError] = useState<SupplyApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SUPPLY_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${SUPPLY_API.BASE_URL}${SUPPLY_API.ENDPOINTS.HEALTH_CHECK}`,
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
          endpoint: SUPPLY_API.BASE_URL,
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
        endpoint: SUPPLY_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= SUPPLY_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SUPPLY_API_CONFIG.TIMEOUT);
        
        const fullUrl = `${SUPPLY_API.BASE_URL}${endpoint}`;
        console.log(`Making API call to: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
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
        
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        console.warn(`API call attempt ${attempt} failed:`, error);
        
        if (attempt < SUPPLY_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, SUPPLY_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch product sharing supplies for the station
  const fetchSupplies = useCallback(async () => {
    if (!selectedStation) return;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = getSupplyEndpoint(user, selectedStation);
        
        console.log('Full API URL will be:', `${SUPPLY_API.BASE_URL}${endpoint}`);
        const response: SupplyResponse = await apiCall<SupplyResponse>(endpoint);
        console.log('the endpoint is:', response);
        setSupplies(response.content || []);
        setStatistics(response.stats);
        
        toast.success('Supply data updated', {
          description: `Found ${response.content?.length || 0} product sharing supplies`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for product sharing supplies');
        let mockSupplies = MOCK_PRODUCT_SHARING_SUPPLIES;
        
        // Filter by station based on user role
        if (user?.role === 'ROLE_STATION_MANAGER') {
          const userStationName = user?.station?.stationName;
          if (userStationName) {
            console.log('Filtering supplies for station manager by station name:', userStationName);
            // Station managers see only their station's data
            mockSupplies = mockSupplies.filter(supply => 
              supply.stationName === userStationName
            );
          }
        } else if (selectedStation?.id) {
          // Admins and super admins see selected station's data
          mockSupplies = mockSupplies.filter(supply => 
            supply.stationId === selectedStation.id
          );
        }
        
        // Apply filters to mock data
        if (filters.status && filters.status !== 'ALL') {
          mockSupplies = mockSupplies.filter(supply => 
            supply.mstatus === filters.status
          );
        }
        if (filters.product && filters.product !== 'ALL') {
          mockSupplies = mockSupplies.filter(supply => 
            supply.product === filters.product
          );
        }
        if (filters.priority && filters.priority !== 'ALL') {
          mockSupplies = mockSupplies.filter(supply => 
            supply.priority === filters.priority
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockSupplies = mockSupplies.filter(supply => 
            supply.product.toLowerCase().includes(searchLower) ||
            supply.fromStationName.toLowerCase().includes(searchLower) ||
            supply.productSharingRequestId.toLowerCase().includes(searchLower) ||
            supply.createdBy.toLowerCase().includes(searchLower)
          );
        }
        
        setSupplies(mockSupplies);
        
        // Set mock statistics for selected station
        const stationStats = MOCK_SUPPLY_STATS[selectedStation.id as keyof typeof MOCK_SUPPLY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
      }
    } catch (error) {
      const apiError: SupplyApiError = {
        code: 'FETCH_SUPPLIES_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch supply data', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      const mockSupplies = MOCK_PRODUCT_SHARING_SUPPLIES.filter(supply => 
        supply.stationId === selectedStation?.id
      );
      setSupplies(mockSupplies);
      
      if (selectedStation) {
        const stationStats = MOCK_SUPPLY_STATS[selectedStation.id as keyof typeof MOCK_SUPPLY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters, selectedStation]);

  // Confirm supply receipt
  const confirmSupplyReceipt = useCallback(async (
    supplyId: string,
    confirmationData: Omit<SupplyConfirmationRequest, 'id' | 'confirmedBy' | 'confirmedAt'>
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const request: SupplyConfirmationRequest = {
        id: supplyId,
        confirmedBy: user?.name || 'Current User',
        confirmedAt: new Date().toISOString(),
        ...confirmationData
      };
      console.log('Confirming supply receipt with data:', request);
      const isConnected = await checkConnection();
      
      if (isConnected) {
        // Build endpoint with the supply ID in the path
        const endpoint = SUPPLY_API.ENDPOINTS.CONFIRM_SUPPLY_RECEIPT.replace(':id', supplyId);
        
        // Send the confirmation data including the ID in the body
        const requestBody = {
          id: supplyId,
          confirmedBy: request.confirmedBy,
          confirmedAt: request.confirmedAt,
          qtyR: request.qtyR,
          overage: request.overage,
          shortage: request.shortage,
          notes: request.notes,
          product: request.product,
          station: request.station
        };
        
        console.log('Sending to endpoint:', endpoint, 'with body:', requestBody);
        
        const response: SupplyConfirmationResponse = await apiCall<SupplyConfirmationResponse>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify(requestBody)
          }
        );
        
        toast.success('Supply receipt confirmed successfully!', {
          description: response.message
        });
        
        // Update local state with confirmed supply
        setSupplies(prev => prev.map(supply => 
          supply.id === supplyId ? response.updatedSupply : supply
        ));
        
        // Refresh data to ensure consistency
        await fetchSupplies();
        
        return true;
      } else {
        // Mock confirmation for offline mode
        const supplyToUpdate = supplies.find(s => s.id === supplyId);
        if (supplyToUpdate) {
          const variance = confirmationData.qtyR - supplyToUpdate.qty;
          const updatedSupply: ProductSharingSupply = {
            ...supplyToUpdate,
            qtyR: confirmationData.qtyR,
            overage: variance > 0 ? variance : confirmationData.overage,
            shortage: variance < 0 ? Math.abs(variance) : confirmationData.shortage,
            status: 'RECEIVED',
            confirmedBy: user?.name || 'Current User',
            confirmedAt: new Date().toISOString(),
            receivedAt: new Date().toISOString()
          };
          
          // Update local state
          setSupplies(prev => prev.map(supply => 
            supply.id === supplyId ? updatedSupply : supply
          ));
          
          // Update statistics
          setStatistics(prev => ({
            ...prev,
            totalConfirmedToday: prev.totalConfirmedToday + 1,
            totalQuantityReceived: prev.totalQuantityReceived + confirmationData.qtyR,
            totalPendingSupplies: prev.totalPendingSupplies - 1,
            totalShortage: confirmationData.shortage ? prev.totalShortage + confirmationData.shortage : prev.totalShortage,
            totalOverage: confirmationData.overage ? prev.totalOverage + confirmationData.overage : prev.totalOverage
          }));
          
          toast.success('Supply receipt confirmed successfully! (Mock Mode)', {
            description: `${supplyToUpdate.product} supply from ${supplyToUpdate.fromStationName} has been processed`
          });
          
          return true;
        } else {
          toast.error('Supply not found', {
            description: 'Could not find the supply to confirm'
          });
          return false;
        }
      }
    } catch (error) {
      const apiError: SupplyApiError = {
        code: 'CONFIRM_SUPPLY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        supplyId
      };
      setLastError(apiError);
      
      toast.error('Failed to confirm supply receipt', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, supplies, fetchSupplies]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchSupplies();
      toast.success('Supply data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh supply data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchSupplies]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SupplyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get supply by ID
  const getSupplyById = useCallback((id: string): ProductSharingSupply | undefined => {
    return supplies.find(supply => supply.id === id);
  }, [supplies]);

  // Calculate variance for a supply
  const calculateVariance = useCallback((expectedQuantity: number, actualQuantity: number) => {
    const difference = actualQuantity - expectedQuantity;
    const percentage = (difference / expectedQuantity) * 100;
    
    if (difference === 0) {
      return { 
        type: 'EXACT', 
        message: 'Exact match - no shortage or overage', 
        color: 'text-green-600',
        amount: 0,
        percentage: 0
      };
    } else if (difference > 0) {
      return { 
        type: 'OVERAGE', 
        message: `Overage: +${difference.toLocaleString()}L`, 
        color: 'text-blue-600',
        amount: difference,
        percentage: Math.abs(percentage)
      };
    } else {
      return { 
        type: 'SHORTAGE', 
        message: `Shortage: ${difference.toLocaleString()}L`, 
        color: 'text-red-600',
        amount: Math.abs(difference),
        percentage: Math.abs(percentage)
      };
    }
  }, []);

  // Format currency in Ghana Cedis
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('GH₵', '₵');
  }, []);

  // Initialize data on component mount and station change
  useEffect(() => {
    if (selectedStation) {
      fetchSupplies();
    }
  }, [selectedStation, fetchSupplies]);

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedStation) {
        fetchSupplies();
      }
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, fetchSupplies, selectedStation]);

  // Set up auto-refresh for supplies
  useEffect(() => {
    if (!connectionStatus.connected || !selectedStation) return;
    
    const interval = setInterval(() => {
      fetchSupplies();
    }, SUPPLY_REFRESH_INTERVALS.SUPPLY_DATA);
    
    return () => clearInterval(interval);
  }, [connectionStatus.connected, selectedStation, fetchSupplies]);

  return {
    // Data
    supplies,
    statistics,
    
    // State
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    
    // Actions
    confirmSupplyReceipt,
    refreshData,
    updateFilters,
    checkConnection,
    getSupplyById,
    
    // Utilities
    calculateVariance,
    formatCurrency,
    
    // Computed values
    pendingSupplies: supplies.filter(s => s && (s as any).mstatus === 'PENDING'),
    confirmedSupplies: supplies.filter(s => s && (s as any).mstatus === 'CONFIRMED'),
    receivedSupplies: supplies.filter(s => s && (s as any).mstatus === 'RECEIVED'),
    emergencySupplies: supplies.filter(s => s && s.priority === 'EMERGENCY'),
    hasData: supplies.length > 0
  };
}