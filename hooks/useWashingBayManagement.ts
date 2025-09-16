import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { 
  WASHING_BAY_API, 
  WASHING_BAY_API_CONFIG, 
  MOCK_WASHING_BAY_ENTRIES, 
  MOCK_WASHING_BAY_STATS,
  MOCK_WASHING_BAY_ANALYSIS,
  MOCK_WASHING_BAY_CHART_DATA,
  WASHING_BAY_REFRESH_INTERVALS,
  formatCurrency,
  calculateCommission,
  calculateBankDeposit,
  calculateBalancing
} from '../constants/washingBayConstants';
import type { 
  WashingBayEntry, 
  WashingBayStats,
  WashingBayAnalysis,
  WashingBayChartData,
  WashingBayResponse, 
  CreateWashingBayEntryRequest,
  UpdateWashingBayEntryRequest,
  WashingBayFilters,
  WashingBayConnectionStatus,
  WashingBayApiError
} from '../types/washingBay';

export function useWashingBayManagement() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  // State management
  const [entries, setEntries] = useState<WashingBayEntry[]>([]);
  const [statistics, setStatistics] = useState<WashingBayStats>({
    totalVehicles: 0,
    totalRevenue: 0,
    totalWashingBayCommission: 0,
    totalCompanyCommission: 0,
    totalExpenses: 0,
    totalBankDeposits: 0,
    averageVehiclesPerDay: 0,
    averageRevenuePerVehicle: 0,
    thisMonth: { vehicles: 0, revenue: 0, commission: 0 },
    lastMonth: { vehicles: 0, revenue: 0, commission: 0 },
    serviceBreakdown: {
      exteriorWash: 0,
      interiorWash: 0,
      fullService: 0,
      premiumWash: 0,
      vacuumOnly: 0
    }
  });
  const [analysis, setAnalysis] = useState<WashingBayAnalysis>({
    bankDepositAnalysis: {
      totalIncome: 0,
      lessWagesExpKodson: 0,
      totalExpectedBankDep: 0,
      actualAmountDeposited: 0,
      overage: 0
    },
    incomeAnalysis: {
      totalIncome: 0,
      lessExpenses: 0,
      dailyWages: 0,
      waterCost: 0,
      electricityPrepaidExp: 0,
      netIncomeLoss: 0
    },
    performanceMetrics: {
      utilization: 0,
      customerSatisfaction: 0,
      averageServiceTime: 0,
      repeatCustomerRate: 0
    }
  });
  const [chartData, setChartData] = useState<WashingBayChartData[]>([]);
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<WashingBayConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: WASHING_BAY_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<WashingBayFilters>({
    status: 'all',
    search: ''
  });
  
  // Error state
  const [lastError, setLastError] = useState<WashingBayApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WASHING_BAY_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${WASHING_BAY_API.BASE_URL}${WASHING_BAY_API.ENDPOINTS.HEALTH_CHECK}`,
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
          endpoint: WASHING_BAY_API.BASE_URL,
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
        endpoint: WASHING_BAY_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= WASHING_BAY_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), WASHING_BAY_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${WASHING_BAY_API.BASE_URL}${endpoint}`, {
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
        
        if (attempt < WASHING_BAY_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, WASHING_BAY_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch washing bay data for the station
  const fetchWashingBayData = useCallback(async () => {
    if (!selectedStation) return;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = WASHING_BAY_API.ENDPOINTS.ENTRIES.replace(':stationId', selectedStation.id);
        const response: WashingBayResponse = await apiCall<WashingBayResponse>(endpoint);
        
        setEntries(response.data.entries || []);
        setStatistics(response.data.stats);
        setAnalysis(response.data.analysis);
        setChartData(response.data.chartData || []);
        
        toast.success('Washing bay data updated', {
          description: `Found ${response.data.entries?.length || 0} washing bay entries`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for washing bay entries');
        let mockEntries = MOCK_WASHING_BAY_ENTRIES.filter(entry => 
          entry.stationId === selectedStation.id
        );
        
        // Apply filters to mock data
        if (filters.status && filters.status !== 'all') {
          mockEntries = mockEntries.filter(entry => 
            entry.kodsonStatus.toLowerCase() === filters.status!.toLowerCase()
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockEntries = mockEntries.filter(entry => 
            entry.date.toLowerCase().includes(searchLower) ||
            entry.kodsonStatus.toLowerCase().includes(searchLower) ||
            entry.createdBy.toLowerCase().includes(searchLower)
          );
        }
        
        setEntries(mockEntries);
        
        // Set mock statistics for selected station
        const stationStats = MOCK_WASHING_BAY_STATS[selectedStation.id as keyof typeof MOCK_WASHING_BAY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
        
        // Set mock analysis for selected station
        const stationAnalysis = MOCK_WASHING_BAY_ANALYSIS[selectedStation.id as keyof typeof MOCK_WASHING_BAY_ANALYSIS];
        if (stationAnalysis) {
          setAnalysis(stationAnalysis);
        }
        
        setChartData(MOCK_WASHING_BAY_CHART_DATA);
      }
    } catch (error) {
      const apiError: WashingBayApiError = {
        code: 'FETCH_WASHING_BAY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch washing bay data', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      const mockEntries = MOCK_WASHING_BAY_ENTRIES.filter(entry => 
        entry.stationId === selectedStation?.id
      );
      setEntries(mockEntries);
      
      if (selectedStation) {
        const stationStats = MOCK_WASHING_BAY_STATS[selectedStation.id as keyof typeof MOCK_WASHING_BAY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
        
        const stationAnalysis = MOCK_WASHING_BAY_ANALYSIS[selectedStation.id as keyof typeof MOCK_WASHING_BAY_ANALYSIS];
        if (stationAnalysis) {
          setAnalysis(stationAnalysis);
        }
      }
      
      setChartData(MOCK_WASHING_BAY_CHART_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters, selectedStation]);

  // Create new washing bay entry
  const createWashingBayEntry = useCallback(async (
    entryData: CreateWashingBayEntryRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      // Calculate derived values
      const noOfVehicles = parseInt(entryData.noOfVehicles);
      const pricePerVehicle = parseFloat(entryData.pricePerVehicle);
      const totalSale = noOfVehicles * pricePerVehicle;
      const washingBayCommissionRate = parseFloat(entryData.washingBayCommissionRate);
      const washingBayCommission = calculateCommission(totalSale, washingBayCommissionRate);
      const companyCommission = totalSale - washingBayCommission;
      const expenses = parseFloat(entryData.expenses);
      const bankDeposit = calculateBankDeposit(totalSale, expenses);
      const balancing = calculateBalancing(totalSale, washingBayCommission, expenses, bankDeposit);
      
      if (isConnected) {
        const response: WashingBayEntry = await apiCall<WashingBayEntry>(
          WASHING_BAY_API.ENDPOINTS.CREATE_ENTRY,
          {
            method: 'POST',
            body: JSON.stringify({
              ...entryData,
              stationId: selectedStation?.id,
              createdBy: user?.name || 'Current User',
              totalSale,
              washingBayCommission,
              washingBayCommissionRate,
              companyCommission,
              bankDeposit,
              balancing
            })
          }
        );
        
        setEntries(prev => [...prev, response]);
        
        toast.success('Washing bay entry created successfully!', {
          description: `Entry for ${entryData.date} with ${entryData.noOfVehicles} vehicles has been added.`
        });
        
        // Refresh data to ensure consistency
        await fetchWashingBayData();
        
        return true;
      } else {
        // Mock creation for offline mode
        const newEntry: WashingBayEntry = {
          id: entries.length + 1,
          date: entryData.date,
          noOfVehicles,
          pricePerVehicle,
          totalSale,
          washingBayCommission,
          washingBayCommissionRate,
          companyCommission,
          expenses,
          bankDeposit,
          balancing,
          kodsonStatus: 'Pending',
          stationId: selectedStation?.id || '',
          stationName: selectedStation?.name || '',
          createdBy: user?.name || 'Current User',
          notes: entryData.notes
        };
        
        setEntries(prev => [...prev, newEntry]);
        
        toast.success('Washing bay entry created successfully! (Mock Mode)', {
          description: `Entry for ${entryData.date} has been processed`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: WashingBayApiError = {
        code: 'CREATE_ENTRY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to create washing bay entry', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, selectedStation, checkConnection, apiCall, entries.length, fetchWashingBayData]);

  // Update existing washing bay entry
  const updateWashingBayEntry = useCallback(async (
    entryData: UpdateWashingBayEntryRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      // Calculate derived values
      const noOfVehicles = parseInt(entryData.noOfVehicles);
      const pricePerVehicle = parseFloat(entryData.pricePerVehicle);
      const totalSale = noOfVehicles * pricePerVehicle;
      const washingBayCommissionRate = parseFloat(entryData.washingBayCommissionRate);
      const washingBayCommission = calculateCommission(totalSale, washingBayCommissionRate);
      const companyCommission = totalSale - washingBayCommission;
      const expenses = parseFloat(entryData.expenses);
      const bankDeposit = calculateBankDeposit(totalSale, expenses);
      const balancing = calculateBalancing(totalSale, washingBayCommission, expenses, bankDeposit);
      
      if (isConnected) {
        const endpoint = WASHING_BAY_API.ENDPOINTS.UPDATE_ENTRY.replace(':id', entryData.id.toString());
        const response: WashingBayEntry = await apiCall<WashingBayEntry>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify({
              ...entryData,
              totalSale,
              washingBayCommission,
              washingBayCommissionRate,
              companyCommission,
              bankDeposit,
              balancing
            })
          }
        );
        
        setEntries(prev => prev.map(entry => 
          entry.id === entryData.id ? response : entry
        ));
        
        toast.success('Washing bay entry updated successfully!', {
          description: `Entry for ${entryData.date} has been updated.`
        });
        
        return true;
      } else {
        // Mock update for offline mode
        setEntries(prev => prev.map(entry => 
          entry.id === entryData.id 
            ? {
                ...entry,
                date: entryData.date,
                noOfVehicles,
                pricePerVehicle,
                totalSale,
                washingBayCommission,
                washingBayCommissionRate,
                companyCommission,
                expenses,
                bankDeposit,
                balancing,
                updatedBy: user?.name || 'Current User',
                updatedAt: new Date().toISOString(),
                notes: entryData.notes
              }
            : entry
        ));
        
        toast.success('Washing bay entry updated successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: WashingBayApiError = {
        code: 'UPDATE_ENTRY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        entryId: entryData.id
      };
      setLastError(apiError);
      
      toast.error('Failed to update washing bay entry', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall]);

  // Delete washing bay entry
  const deleteWashingBayEntry = useCallback(async (entryId: number): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = WASHING_BAY_API.ENDPOINTS.DELETE_ENTRY.replace(':id', entryId.toString());
        await apiCall(endpoint, { method: 'DELETE' });
        
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        
        toast.success('Washing bay entry deleted successfully!');
        return true;
      } else {
        // Mock deletion for offline mode
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        toast.success('Washing bay entry deleted successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: WashingBayApiError = {
        code: 'DELETE_ENTRY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        entryId
      };
      setLastError(apiError);
      
      toast.error('Failed to delete washing bay entry', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall]);

  // Export washing bay data
  const exportWashingBayData = useCallback(async (format: 'csv' | 'excel' = 'csv'): Promise<boolean> => {
    if (!selectedStation) return false;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = `${WASHING_BAY_API.ENDPOINTS.EXPORT.replace(':stationId', selectedStation.id)}?format=${format}`;
        const response = await fetch(`${WASHING_BAY_API.BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Export failed');
        }
        
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `washing-bay-report-${selectedStation.name}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Washing bay data exported as ${format.toUpperCase()}`, {
          description: 'The washing bay report has been downloaded.'
        });
        
        return true;
      } else {
        // Mock export for development
        toast.success(`Washing bay data exported as ${format.toUpperCase()} (simulated)`, {
          description: 'In development mode - actual file download simulated.'
        });
        return true;
      }
    } catch (error) {
      toast.error('Failed to export washing bay data', {
        description: 'Please try again later'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStation, checkConnection, user?.token]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchWashingBayData();
      toast.success('Washing bay data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh washing bay data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWashingBayData]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<WashingBayFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get entry by ID
  const getEntryById = useCallback((id: number): WashingBayEntry | undefined => {
    return entries.find(entry => entry.id === id);
  }, [entries]);

  // Initialize data on component mount and station change
  useEffect(() => {
    if (selectedStation) {
      fetchWashingBayData();
    }
  }, [selectedStation, fetchWashingBayData]);

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedStation) {
        fetchWashingBayData();
      }
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, fetchWashingBayData, selectedStation]);

  // Set up auto-refresh for washing bay data
  useEffect(() => {
    if (!connectionStatus.connected || !selectedStation) return;
    
    const interval = setInterval(() => {
      fetchWashingBayData();
    }, WASHING_BAY_REFRESH_INTERVALS.ENTRY_DATA);
    
    return () => clearInterval(interval);
  }, [connectionStatus.connected, selectedStation, fetchWashingBayData]);

  return {
    // Data
    entries,
    statistics,
    analysis,
    chartData,
    
    // State
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    
    // Actions
    createWashingBayEntry,
    updateWashingBayEntry,
    deleteWashingBayEntry,
    exportWashingBayData,
    refreshData,
    updateFilters,
    checkConnection,
    getEntryById,
    
    // Utilities
    formatCurrency,
    calculateCommission,
    calculateBankDeposit,
    calculateBalancing,
    
    // Computed values
    completeEntries: entries.filter(e => e.kodsonStatus === 'Complete'),
    pendingEntries: entries.filter(e => e.kodsonStatus === 'Pending'),
    underReviewEntries: entries.filter(e => e.kodsonStatus === 'Under Review'),
    hasData: entries.length > 0
  };
}