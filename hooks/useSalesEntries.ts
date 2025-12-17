import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { 
  SALES_ENTRIES_API, 
  SALES_ENTRIES_API_CONFIG,
  MOCK_SALES_ENTRIES,
  MOCK_SALES_ENTRIES_KUMASI,
  MOCK_SALES_ENTRIES_STATS,
  DEFAULT_PAGINATION,
  SALES_ENTRIES_REFRESH_INTERVALS,
  formatCurrency,
  formatDate,
  formatDateTime
} from '../constants/salesEntriesConstants';
import type { 
  SalesEntry,
  SalesEntriesStats,
  SalesEntriesResponse,
  SalesEntryResponse,
  EditPermissionRequest,
  EditPermissionResponse,
  SalesEntriesFilters,
  SalesEntriesPagination,
  SalesEntriesConnectionStatus,
  SalesEntriesApiError,
  ExportRequest,
  ExportResponse
} from '../types/salesEntries';

// Helper function to get the correct endpoint based on user role
const getSalesEntriesEndpoint = (user: any, selectedStation: any): string => {
  // If user is a station manager, use their station for the URL path
  if (user?.role === 'ROLE_STATION_MANAGER') {
    const userStationId = user?.station?.stationId || user?.stationId;
    if (userStationId) {
      return SALES_ENTRIES_API.ENDPOINTS.ENTRIES_BY_STATION.replace(':station', user.station.stationName);
    }
  }
  // For admins and super admins, use station-specific endpoint if a station is selected
  else if (selectedStation?.name) {
    return SALES_ENTRIES_API.ENDPOINTS.ENTRIES_BY_STATION.replace(':station', encodeURIComponent(selectedStation.name));
  }
  // Default to all entries endpoint
  return SALES_ENTRIES_API.ENDPOINTS.ENTRIES;
};

export function useSalesEntries() {
  const { user } = useAuth();
  console.log('useSalesEntries - Current user:', user);
  const { selectedStation } = useStation();
  
  // State management
  const [entries, setEntries] = useState<SalesEntry[]>([]);
  const [statistics, setStatistics] = useState<SalesEntriesStats>({
    totalEntries: 0,
    draftEntries: 0,
    submittedEntries: 0,
    validatedEntries: 0,
    approvedEntries: 0,
    rejectedEntries: 0,
    pendingValidation: 0,
    pendingApproval: 0,
    totalSalesValue: 0,
    totalSalesVolume: 0,
    totalCashSales: 0,
    totalCreditSales: 0,
    totalBankLodgements: 0,
    averageVariance: 0
  });
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SalesEntriesConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: SALES_ENTRIES_API.BASE_URL
  });
  
  // Filter and pagination state
  const [filters, setFilters] = useState<SalesEntriesFilters>({
    status: 'ALL',
    product: 'ALL',
    search: ''
  });
  
  const [paginationParams, setPaginationParams] = useState({
    page: DEFAULT_PAGINATION.page,
    pageSize: DEFAULT_PAGINATION.pageSize,
    sortBy: DEFAULT_PAGINATION.sortBy,
    sortOrder: DEFAULT_PAGINATION.sortOrder
  });
  
  const [paginationMeta, setPaginationMeta] = useState({
    totalElements: 0,
    totalPages: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true
  });
  
  // Error state
  const [lastError, setLastError] = useState<SalesEntriesApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SALES_ENTRIES_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${SALES_ENTRIES_API.BASE_URL}${SALES_ENTRIES_API.ENDPOINTS.HEALTH_CHECK}`,
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
          endpoint: SALES_ENTRIES_API.BASE_URL,
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
        endpoint: SALES_ENTRIES_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= SALES_ENTRIES_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SALES_ENTRIES_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${SALES_ENTRIES_API.BASE_URL}${endpoint}`, {
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
        
        if (attempt < SALES_ENTRIES_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, SALES_ENTRIES_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch sales entries
  const fetchEntries = useCallback(async () => {
    if (!selectedStation) return;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        // Build query parameters for filtering (not for station selection)
        const params = new URLSearchParams();
        
        // Add filters
        if (filters.status && filters.status !== 'ALL') {
          params.append('status', filters.status);
        }
        if (filters.product && filters.product !== 'ALL') {
          params.append('product', filters.product);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        if (filters.dateFrom) {
          params.append('dateFrom', filters.dateFrom);
        }
        if (filters.dateTo) {
          params.append('dateTo', filters.dateTo);
        }
        
        // Add pagination (convert 1-based UI pagination to 0-based backend pagination)
        params.append('page', (paginationParams.page - 1).toString());
        params.append('pageSize', paginationParams.pageSize.toString());
        params.append('sortBy', paginationParams.sortBy);
        params.append('sortOrder', paginationParams.sortOrder);
        
        const endpoint = getSalesEntriesEndpoint(user, selectedStation);
        const fullEndpoint = `${endpoint}?${params.toString()}`;
        console.log('Fetching sales entries from:', fullEndpoint);
        const response: SalesEntriesResponse = await apiCall<SalesEntriesResponse>(fullEndpoint);
        console.log('Fetched sales entries:', response);
        setEntries(response.content || []);
        
        // Update pagination metadata from backend response (separate from params to prevent loop)
        setPaginationMeta({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          numberOfElements: response.numberOfElements,
          first: response.first,
          last: response.last,
          empty: response.empty
        });
        //setStatistics(response.stats);
        
        toast.success('Sales entries updated', {
          description: `Found ${response.content?.length || 0} entries`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for sales entries');
        let mockEntries: SalesEntry[] = [];
        
        // Role-based mock data
        if (selectedStation.id === 'accra-central') {
          mockEntries = [...MOCK_SALES_ENTRIES];
        } else if (selectedStation.id === 'kumasi-highway') {
          mockEntries = [...MOCK_SALES_ENTRIES_KUMASI];
        } else {
          // Generate basic mock data for other stations
          mockEntries = MOCK_SALES_ENTRIES.slice(0, 2).map(entry => ({
            ...entry,
            id: `SE-${selectedStation.id}-001`,
            stationId: selectedStation.id,
            stationName: selectedStation.name
          }));
        }
        
        // Apply filters to mock data
        let filteredEntries = mockEntries;
        
        if (filters.status && filters.status !== 'ALL') {
          filteredEntries = filteredEntries.filter(entry => 
            entry.status === filters.status
          );
        }
        if (filters.product && filters.product !== 'ALL') {
          filteredEntries = filteredEntries.filter(entry => 
            entry.product === filters.product
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredEntries = filteredEntries.filter(entry => 
            entry.product.toLowerCase().includes(searchLower) ||
            entry.enteredBy.toLowerCase().includes(searchLower) ||
            entry.date.includes(searchLower)
          );
        }
        
        setEntries(filteredEntries);
        
        // Set mock statistics
        const stationStats = MOCK_SALES_ENTRIES_STATS[selectedStation.id as keyof typeof MOCK_SALES_ENTRIES_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
      }
    } catch (error) {
      const apiError: SalesEntriesApiError = {
        code: 'FETCH_ENTRIES_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch sales entries', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      const mockEntries = selectedStation.id === 'kumasi-highway' ? 
        MOCK_SALES_ENTRIES_KUMASI : MOCK_SALES_ENTRIES;
      setEntries(mockEntries.filter(entry => entry.stationId === selectedStation?.id));
      
      if (selectedStation) {
        const stationStats = MOCK_SALES_ENTRIES_STATS[selectedStation.id as keyof typeof MOCK_SALES_ENTRIES_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters, paginationParams, selectedStation, user?.role]);

  // Request edit permission
  const requestEditPermission = useCallback(async (
    entryId: string,
    reason: string
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const request: Omit<EditPermissionRequest, 'status' | 'requestedAt'> = {
        entryId,
        requestedBy: user?.name || 'Current User',
        reason
      };
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = SALES_ENTRIES_API.ENDPOINTS.REQUEST_EDIT.replace(':id', entryId);
        const response: EditPermissionResponse = await apiCall<EditPermissionResponse>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify(request)
          }
        );
        
        toast.success('Edit request submitted successfully!', {
          description: response.message
        });
        
        // Refresh entries to show updated edit request status
        await fetchEntries();
        
        return true;
      } else {
        // Mock edit request
        const entryToUpdate = entries.find(e => e.id === entryId);
        if (entryToUpdate) {
          const updatedEntries = entries.map(entry => 
            entry.id === entryId ? {
              ...entry,
              editRequested: true,
              editRequestedBy: user?.name || 'Current User',
              editRequestedAt: new Date().toISOString(),
              editRequestReason: reason
            } : entry
          );
          
          setEntries(updatedEntries);
          
          toast.success('Edit request submitted successfully! (Mock Mode)', {
            description: `Edit request for ${entryToUpdate.product} entry has been submitted`
          });
          
          return true;
        }
      }
    } catch (error) {
      const apiError: SalesEntriesApiError = {
        code: 'REQUEST_EDIT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        entryId
      };
      setLastError(apiError);
      
      toast.error('Failed to submit edit request', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall, entries, fetchEntries]);

  // Export entries
  const exportEntries = useCallback(async (
    format: 'CSV' | 'EXCEL' | 'PDF',
    includeDetails: boolean = true
  ): Promise<boolean> => {
    if (isExporting) return false;
    setIsExporting(true);
    
    try {
      const exportRequest: ExportRequest = {
        format,
        filters,
        dateRange: {
          from: filters.dateFrom || '',
          to: filters.dateTo || ''
        },
        includeDetails
      };
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const response: ExportResponse = await apiCall<ExportResponse>(
          SALES_ENTRIES_API.ENDPOINTS.EXPORT,
          {
            method: 'POST',
            body: JSON.stringify(exportRequest)
          }
        );
        
        // Trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Export completed successfully!', {
          description: `Downloaded ${response.fileName}`
        });
        
        return true;
      } else {
        // Mock export
        const fileName = `sales-entries-${selectedStation?.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
        
        toast.success('Export completed successfully! (Mock Mode)', {
          description: `Would download ${fileName}`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: SalesEntriesApiError = {
        code: 'EXPORT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to export entries', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, filters, checkConnection, apiCall, selectedStation?.name]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchEntries();
      toast.success('Sales entries data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh sales entries data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchEntries]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SalesEntriesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPaginationParams(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination: Partial<SalesEntriesPagination>) => {
    // Only update pagination parameters, not metadata
    const { totalElements, totalPages, numberOfElements, first, last, empty, ...params } = newPagination;
    if (Object.keys(params).length > 0) {
      setPaginationParams(prev => ({ ...prev, ...params }));
    }
  }, []);

  // Get entry by ID
  const getEntryById = useCallback((id: string): SalesEntry | undefined => {
    return entries.find(entry => entry.id === id);
  }, [entries]);

  // Calculate financial metrics
  const calculateFinancialMetrics = useCallback(() => {
    const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
    const totalCash = entries.reduce((sum, entry) => sum + entry.cashSales, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.creditSales, 0);
    const totalVariance = entries.reduce((sum, entry) => 
      sum + Math.abs(entry.cashToBank - entry.bankLodgement), 0);
    
    return {
      totalValue,
      totalCash,
      totalCredit,
      totalVariance,
      averageVariance: entries.length > 0 ? totalVariance / entries.length : 0
    };
  }, [entries]);

  // Initialize data on component mount and station change
  useEffect(() => {
    if (selectedStation) {
      fetchEntries();
    }
  }, [selectedStation, fetchEntries]);

  // Re-fetch when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedStation) {
        fetchEntries();
      }
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, paginationParams, fetchEntries, selectedStation]);

  // Set up auto-refresh
  useEffect(() => {
    if (!connectionStatus.connected || !selectedStation) return;
    
    const interval = setInterval(() => {
      fetchEntries();
    }, SALES_ENTRIES_REFRESH_INTERVALS.ENTRIES);
    
    return () => clearInterval(interval);
  }, [connectionStatus.connected, selectedStation, fetchEntries]);

  return {
    // Data
    entries,
    statistics,
    
    // State
    isLoading,
    isSubmitting,
    isExporting,
    connectionStatus,
    lastError,
    filters,
    pagination: { ...paginationParams, ...paginationMeta },
    
    // Actions
    requestEditPermission,
    exportEntries,
    refreshData,
    updateFilters,
    updatePagination,
    checkConnection,
    getEntryById,
    
    // Utilities
    formatCurrency,
    formatDate,
    formatDateTime,
    calculateFinancialMetrics,
    
    // Computed values
    filteredEntries: entries,
    draftEntries: entries.filter(e => e.status === 'DRAFT'),
    submittedEntries: entries.filter(e => e.status === 'SUBMITTED'),
    approvedEntries: entries.filter(e => e.status === 'APPROVED'),
    rejectedEntries: entries.filter(e => e.status === 'REJECTED'),
    hasData: entries.length > 0,
    canEdit: user?.role === 'ROLE_STATION_MANAGER',
    canValidate: user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN',
    canApprove: user?.role === 'ROLE_SUPER_ADMIN'
  };
}