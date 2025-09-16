import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { 
  UTILITY_API, 
  UTILITY_API_CONFIG, 
  MOCK_UTILITY_BILLS, 
  MOCK_UTILITY_STATS,
  MONTHLY_UTILITY_DATA,
  UTILITY_PIE_DATA,
  UTILITY_BUDGET_DATA,
  UTILITY_REFRESH_INTERVALS,
  formatCurrency
} from '../constants/utilityConstants';
import type { 
  UtilityBill, 
  UtilityStats,
  UtilityBudgetItem,
  UtilityChartData,
  UtilityPieData,
  UtilityResponse, 
  CreateUtilityBillRequest,
  UpdateUtilityBillRequest,
  UtilityPaymentRequest,
  UtilityPaymentResponse,
  UtilityFilters,
  UtilityConnectionStatus,
  UtilityApiError
} from '../types/utility';

export function useUtilityManagement() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  // State management
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [statistics, setStatistics] = useState<UtilityStats>({
    thisMonth: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    overdue: { amount: 0, count: 0 },
    paid: { amount: 0, count: 0 },
    budgetStatus: 0,
    totalBudget: 0,
    totalSpent: 0
  });
  const [budgetData, setBudgetData] = useState<UtilityBudgetItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<UtilityChartData[]>([]);
  const [pieData, setPieData] = useState<UtilityPieData[]>([]);
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<UtilityConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: UTILITY_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<UtilityFilters>({
    status: 'all',
    utility: 'all',
    priority: 'all',
    search: ''
  });
  
  // Error state
  const [lastError, setLastError] = useState<UtilityApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UTILITY_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${UTILITY_API.BASE_URL}${UTILITY_API.ENDPOINTS.HEALTH_CHECK}`,
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
          endpoint: UTILITY_API.BASE_URL,
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
        endpoint: UTILITY_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= UTILITY_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UTILITY_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${UTILITY_API.BASE_URL}${endpoint}`, {
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
        
        if (attempt < UTILITY_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, UTILITY_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch utility data for the station
  const fetchUtilityData = useCallback(async () => {
    if (!selectedStation) return;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = UTILITY_API.ENDPOINTS.UTILITIES.replace(':stationId', selectedStation.id);
        const response: UtilityResponse = await apiCall<UtilityResponse>(endpoint);
        
        setBills(response.data.bills || []);
        setStatistics(response.data.stats);
        setBudgetData(response.data.budgetData || []);
        setMonthlyData(response.data.monthlyData || []);
        setPieData(response.data.pieData || []);
        
        toast.success('Utility data updated', {
          description: `Found ${response.data.bills?.length || 0} utility bills`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for utility bills');
        let mockBills = MOCK_UTILITY_BILLS.filter(bill => 
          bill.stationId === selectedStation.id
        );
        
        // Apply filters to mock data
        if (filters.status && filters.status !== 'all') {
          mockBills = mockBills.filter(bill => 
            bill.status.toLowerCase() === filters.status!.toLowerCase()
          );
        }
        if (filters.utility && filters.utility !== 'all') {
          mockBills = mockBills.filter(bill => 
            bill.utility.toLowerCase() === filters.utility!.toLowerCase()
          );
        }
        if (filters.priority && filters.priority !== 'all') {
          mockBills = mockBills.filter(bill => 
            bill.priority.toLowerCase() === filters.priority!.toLowerCase()
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockBills = mockBills.filter(bill => 
            bill.provider.toLowerCase().includes(searchLower) ||
            bill.billNumber.toLowerCase().includes(searchLower) ||
            bill.utility.toLowerCase().includes(searchLower)
          );
        }
        
        setBills(mockBills);
        
        // Set mock statistics for selected station
        const stationStats = MOCK_UTILITY_STATS[selectedStation.id as keyof typeof MOCK_UTILITY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
        
        setBudgetData(UTILITY_BUDGET_DATA);
        setMonthlyData(MONTHLY_UTILITY_DATA);
        setPieData(UTILITY_PIE_DATA);
      }
    } catch (error) {
      const apiError: UtilityApiError = {
        code: 'FETCH_UTILITY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch utility data', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      const mockBills = MOCK_UTILITY_BILLS.filter(bill => 
        bill.stationId === selectedStation?.id
      );
      setBills(mockBills);
      
      if (selectedStation) {
        const stationStats = MOCK_UTILITY_STATS[selectedStation.id as keyof typeof MOCK_UTILITY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
      }
      
      setBudgetData(UTILITY_BUDGET_DATA);
      setMonthlyData(MONTHLY_UTILITY_DATA);
      setPieData(UTILITY_PIE_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters, selectedStation]);

  // Create new utility bill
  const createUtilityBill = useCallback(async (
    billData: CreateUtilityBillRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const response: UtilityBill = await apiCall<UtilityBill>(
          UTILITY_API.ENDPOINTS.CREATE_BILL,
          {
            method: 'POST',
            body: JSON.stringify({
              ...billData,
              stationId: selectedStation?.id,
              createdBy: user?.name || 'Current User'
            })
          }
        );
        
        setBills(prev => [...prev, response]);
        
        toast.success('Utility bill created successfully!', {
          description: `${billData.utility} bill for ${billData.provider} has been added.`
        });
        
        // Refresh data to ensure consistency
        await fetchUtilityData();
        
        return true;
      } else {
        // Mock creation for offline mode
        const newBill: UtilityBill = {
          id: bills.length + 1,
          dueDate: billData.dueDate,
          daysOverdue: 0,
          utility: billData.utility as UtilityBill['utility'],
          provider: billData.provider,
          billNumber: billData.billNumber,
          period: `${billData.periodStart} - ${billData.periodEnd}`,
          consumption: {
            value: billData.consumption ? parseFloat(billData.consumption) : 'N/A',
            unit: billData.unit || '',
            rate: billData.rate ? parseFloat(billData.rate) : 0
          },
          amount: parseFloat(billData.amount),
          status: billData.status as UtilityBill['status'],
          priority: billData.priority as UtilityBill['priority'],
          stationId: selectedStation?.id || '',
          stationName: selectedStation?.name || '',
          createdBy: user?.name || 'Current User'
        };
        
        setBills(prev => [...prev, newBill]);
        
        toast.success('Utility bill created successfully! (Mock Mode)', {
          description: `${billData.utility} bill for ${billData.provider} has been processed`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: UtilityApiError = {
        code: 'CREATE_BILL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to create utility bill', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, selectedStation, checkConnection, apiCall, bills.length, fetchUtilityData]);

  // Update existing utility bill
  const updateUtilityBill = useCallback(async (
    billData: UpdateUtilityBillRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = UTILITY_API.ENDPOINTS.UPDATE_BILL.replace(':id', billData.id.toString());
        const response: UtilityBill = await apiCall<UtilityBill>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify(billData)
          }
        );
        
        setBills(prev => prev.map(bill => 
          bill.id === billData.id ? response : bill
        ));
        
        toast.success('Utility bill updated successfully!', {
          description: `${billData.utility} bill has been updated.`
        });
        
        return true;
      } else {
        // Mock update for offline mode
        setBills(prev => prev.map(bill => 
          bill.id === billData.id 
            ? {
                ...bill,
                utility: billData.utility as UtilityBill['utility'],
                provider: billData.provider,
                billNumber: billData.billNumber,
                dueDate: billData.dueDate,
                period: `${billData.periodStart} - ${billData.periodEnd}`,
                consumption: {
                  value: billData.consumption ? parseFloat(billData.consumption) : 'N/A',
                  unit: billData.unit || '',
                  rate: billData.rate ? parseFloat(billData.rate) : 0
                },
                amount: parseFloat(billData.amount),
                status: billData.status as UtilityBill['status'],
                priority: billData.priority as UtilityBill['priority']
              }
            : bill
        ));
        
        toast.success('Utility bill updated successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: UtilityApiError = {
        code: 'UPDATE_BILL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        billId: billData.id
      };
      setLastError(apiError);
      
      toast.error('Failed to update utility bill', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall]);

  // Delete utility bill
  const deleteUtilityBill = useCallback(async (billId: number): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = UTILITY_API.ENDPOINTS.DELETE_BILL.replace(':id', billId.toString());
        await apiCall(endpoint, { method: 'DELETE' });
        
        setBills(prev => prev.filter(bill => bill.id !== billId));
        
        toast.success('Utility bill deleted successfully!');
        return true;
      } else {
        // Mock deletion for offline mode
        setBills(prev => prev.filter(bill => bill.id !== billId));
        toast.success('Utility bill deleted successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: UtilityApiError = {
        code: 'DELETE_BILL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        billId
      };
      setLastError(apiError);
      
      toast.error('Failed to delete utility bill', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall]);

  // Pay utility bill
  const payUtilityBill = useCallback(async (
    paymentData: UtilityPaymentRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = UTILITY_API.ENDPOINTS.PAY_BILL.replace(':id', paymentData.id.toString());
        const response: UtilityPaymentResponse = await apiCall<UtilityPaymentResponse>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify(paymentData)
          }
        );
        
        setBills(prev => prev.map(bill => 
          bill.id === paymentData.id ? response.updatedBill : bill
        ));
        
        toast.success('Payment processed successfully!', {
          description: response.message
        });
        
        return true;
      } else {
        // Mock payment for offline mode
        setBills(prev => prev.map(bill => 
          bill.id === paymentData.id 
            ? {
                ...bill,
                status: 'Paid' as const,
                paidBy: paymentData.paidBy,
                paidAt: paymentData.paidAt
              }
            : bill
        ));
        
        toast.success('Payment processed successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: UtilityApiError = {
        code: 'PAY_BILL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        billId: paymentData.id
      };
      setLastError(apiError);
      
      toast.error('Failed to process payment', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall]);

  // Export utility data
  const exportUtilityData = useCallback(async (format: 'csv' | 'excel' = 'csv'): Promise<boolean> => {
    if (!selectedStation) return false;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = `${UTILITY_API.ENDPOINTS.EXPORT.replace(':stationId', selectedStation.id)}?format=${format}`;
        const response = await fetch(`${UTILITY_API.BASE_URL}${endpoint}`, {
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
        a.download = `utility-bills-${selectedStation.name}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Utility data exported as ${format.toUpperCase()}`, {
          description: 'The utility report has been downloaded.'
        });
        
        return true;
      } else {
        // Mock export for development
        toast.success(`Utility data exported as ${format.toUpperCase()} (simulated)`, {
          description: 'In development mode - actual file download simulated.'
        });
        return true;
      }
    } catch (error) {
      toast.error('Failed to export utility data', {
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
      await fetchUtilityData();
      toast.success('Utility data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh utility data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUtilityData]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UtilityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get bill by ID
  const getBillById = useCallback((id: number): UtilityBill | undefined => {
    return bills.find(bill => bill.id === id);
  }, [bills]);

  // Initialize data on component mount and station change
  useEffect(() => {
    if (selectedStation) {
      fetchUtilityData();
    }
  }, [selectedStation, fetchUtilityData]);

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedStation) {
        fetchUtilityData();
      }
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, fetchUtilityData, selectedStation]);

  // Set up auto-refresh for utility data
  useEffect(() => {
    if (!connectionStatus.connected || !selectedStation) return;
    
    const interval = setInterval(() => {
      fetchUtilityData();
    }, UTILITY_REFRESH_INTERVALS.UTILITY_DATA);
    
    return () => clearInterval(interval);
  }, [connectionStatus.connected, selectedStation, fetchUtilityData]);

  return {
    // Data
    bills,
    statistics,
    budgetData,
    monthlyData,
    pieData,
    
    // State
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    
    // Actions
    createUtilityBill,
    updateUtilityBill,
    deleteUtilityBill,
    payUtilityBill,
    exportUtilityData,
    refreshData,
    updateFilters,
    checkConnection,
    getBillById,
    
    // Utilities
    formatCurrency,
    
    // Computed values
    pendingBills: bills.filter(b => b.status === 'Pending'),
    paidBills: bills.filter(b => b.status === 'Paid'),
    overdueBills: bills.filter(b => b.status === 'Overdue'),
    processingBills: bills.filter(b => b.status === 'Processing'),
    hasData: bills.length > 0
  };
}