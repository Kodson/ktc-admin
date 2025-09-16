import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  DAILY_SALES_API, 
  DAILY_SALES_API_CONFIG,
  GHANA_FUEL_RATES,
  formatCurrency,
  validateEntry
} from '../constants/dailySalesConstants';
import type { 
  DailySalesEntry,
  DailySalesEntryRequest,
  DailySalesEntryResponse,
  PreviousDayData,
  SupplyData,
  DailySalesConnectionStatus,
  DailySalesApiError
} from '../types/dailySales';

export function useDailySalesEntry() {
  const { user } = useAuth();
  
  // Entry form state
  const [entry, setEntry] = useState<Partial<DailySalesEntry>>({
    date: new Date().toISOString().split('T')[0],
    product: 'Super',
    status: 'DRAFT'
  });
  
  // Supporting data
  const [previousDayData, setPreviousDayData] = useState<PreviousDayData | null>(null);
  const [supplyData, setSupplyData] = useState<SupplyData | null>(null);
  const [isFirstEntry, setIsFirstEntry] = useState(false);
  
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<DailySalesConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: DAILY_SALES_API.BASE_URL
  });
  
  // Error state
  const [lastError, setLastError] = useState<DailySalesApiError | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DAILY_SALES_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${DAILY_SALES_API.BASE_URL}${DAILY_SALES_API.ENDPOINTS.HEALTH_CHECK}`,
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
          endpoint: DAILY_SALES_API.BASE_URL,
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
        endpoint: DAILY_SALES_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= DAILY_SALES_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DAILY_SALES_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${DAILY_SALES_API.BASE_URL}${endpoint}`, {
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
        
        // Only log warnings for actual network errors, not expected API responses
        if (attempt === 1) {
          console.warn(`API call to ${endpoint} failed:`, error);
        }
        
        if (attempt < DAILY_SALES_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, DAILY_SALES_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch previous day data
  const fetchPreviousDayData = useCallback(async (date: string, product: string) => {
    if (!user?.station) return;
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = DAILY_SALES_API.ENDPOINTS.PREVIOUS_DAY_DATA
          .replace(':station', user.station.stationName)
          .replace(':product', product);
        
        try {
          const response = await apiCall<PreviousDayData | null>(endpoint);
          
          if (response) {
            setPreviousDayData(response);
            setIsFirstEntry(false);
            
            // Pre-fill opening values with previous day's closing values
            setEntry(prev => {
              const updated = {
                ...prev,
                openSL: response.closingSL,
                openSR: response.closingSR
              };
              
              // Immediately recalculate fields
              return calculateFieldsImmediate(updated);
            });
            return; // Successfully got data, exit early
          }
        } catch (apiError) {
          console.warn('Failed to fetch previous day data from API, falling back to mock data:', apiError);
          // Fall through to mock data handling
        }
        
        // If API call failed or returned null, treat as no previous data
        setPreviousDayData(null);
        setIsFirstEntry(true);
        
        // Clear opening values for first entry
        setEntry(prev => {
          const updated = {
            ...prev,
            openSL: undefined,
            openSR: undefined
          };
          
          return calculateFieldsImmediate(updated);
        });
      }
    } catch (error) {
      console.error('Failed to fetch previous day data:', error);
      setIsFirstEntry(true);
    }
  }, [user?.station, checkConnection, apiCall]);

  // Fetch supply data
  const fetchSupplyData = useCallback(async (date: string, product: string) => {
    if (!user?.station) return;
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = DAILY_SALES_API.ENDPOINTS.SUPPLY_DATA
          .replace(':station', user.station.stationName)
          .replace(':date', date)
          .replace(':product', product);
        console.log('the supply endpoint is ', endpoint);
        try {
          const response = await apiCall<SupplyData | null>(endpoint);
          
          if (response) {
            setSupplyData(response);
            console.log('Fetched supply data:', response);
            // Pre-fill supply and overage/shortage
            setEntry(prev => {
            const overageShortage =
              response.overage !== undefined
                ? response.overage
                : response.shortage !== undefined
                  ? -response.shortage
                  : 0;

            const updated = {
              ...prev,
              supply: response.qty,
              overageShortageL: overageShortage
            };
            return calculateFieldsImmediate(updated);
          });
            return; // Successfully got data, exit early
          }
        } catch (apiError) {
          console.warn('Failed to fetch supply data from API, falling back to mock data:', apiError);
          // Fall through to default data handling
        }
        
        // If API call failed or returned null, set default values
        setSupplyData(null);
        setEntry(prev => {
          const updated = {
            ...prev,
            supply: 0,
            overageShortageL: 0
          };
          
          return calculateFieldsImmediate(updated);
        });
      }
    } catch (error) {
      console.error('Failed to fetch supply data:', error);
      setSupplyData(null);
    }
  }, [user?.station, checkConnection, apiCall]);

  // Calculate automated fields - immediate version for state updates
  const calculateFieldsImmediate = useCallback((entryData: Partial<DailySalesEntry>) => {
    const calculated = { ...entryData };
    
    // 1. Available(availableL) = Open Stock + Supply + Overage/Shortage
    if (calculated.openSL !== undefined && calculated.supply !== undefined && calculated.overageShortageL !== undefined) {
      calculated.availableL = calculated.openSL + calculated.supply + calculated.overageShortageL;
      console.log('Calculating availableL:', {
        openSL: calculated.openSL,
        supply: calculated.supply,
        overageShortageL: calculated.overageShortageL,
        result: calculated.availableL
      });
    }
    
    // 2. Sales Check(checkL) = Available - Closing Stock
    if (calculated.availableL !== undefined && calculated.closingSL !== undefined) {
      calculated.checkL = calculated.availableL - calculated.closingSL;
    }
    
    // 3. Sales(salesL) = Closing Stock Reading - Open Stock Reading - RTT
    if (calculated.closingSR !== undefined && calculated.openSR !== undefined && calculated.returnTT !== undefined) {
      calculated.salesL = calculated.closingSR - calculated.openSR - calculated.returnTT;
    }
    
    // 4. Difference(differenceL) = Sales - Sales Check
    if (calculated.salesL !== undefined && calculated.checkL !== undefined) {
      calculated.differenceL = calculated.salesL - calculated.checkL;
    }
    
    // 5. Value(value) = Rate * Sales
    if (calculated.rate !== undefined && calculated.salesL !== undefined) {
      calculated.value = calculated.rate * calculated.salesL;
    }
    
    // 6. Cash Sales(cashSales) = Value - Credit Sales
    if (calculated.value !== undefined && calculated.creditSales !== undefined) {
      calculated.cashSales = calculated.value - calculated.creditSales;
    }
    
    // 7. Cash Available(cashAvailable) = Cash Sales - Advances - Shortage/Momo
    if (calculated.cashSales !== undefined && calculated.advances !== undefined && calculated.shortageMomo !== undefined) {
      calculated.cashAvailable = calculated.cashSales - calculated.advances - calculated.shortageMomo;
    }
    
    // 8. Cash To Bank(cashToBank) = Cash Available + Shortage/Momo Repayment + Advances Repayment + Received From Debtors
    if (calculated.cashAvailable !== undefined && 
        calculated.repaymentShortageMomo !== undefined && 
        calculated.repaymentAdvances !== undefined && 
        calculated.receivedFromDebtors !== undefined) {
      calculated.cashToBank = calculated.cashAvailable + calculated.repaymentShortageMomo + calculated.repaymentAdvances + calculated.receivedFromDebtors;
    }
    
    return calculated;
  }, []);

  // Calculate automated fields - legacy function for backward compatibility
  const calculateFields = useCallback((entryData: Partial<DailySalesEntry>) => {
    return calculateFieldsImmediate(entryData);
  }, [calculateFieldsImmediate]);

  // Update entry field
  const updateEntry = useCallback((field: keyof DailySalesEntry, value: any) => {
    setEntry(prev => {
      const updated = { ...prev, [field]: value };
      
      // Set default rate if product changes
      if (field === 'product' && value) {
        updated.rate = GHANA_FUEL_RATES[value as keyof typeof GHANA_FUEL_RATES];
      }
      
      // Ensure all numeric fields are properly converted
      if (field === 'openSL' || field === 'supply' || field === 'overageShortageL' || 
          field === 'closingSL' || field === 'openSR' || field === 'closingSR' || 
          field === 'returnTT' || field === 'rate' || field === 'creditSales' || 
          field === 'advances' || field === 'shortageMomo' || field === 'repaymentShortageMomo' || 
          field === 'repaymentAdvances' || field === 'receivedFromDebtors' || field === 'bankLodgement') {
        
        // Convert to number, defaulting to 0 for certain fields
        const numericValue = value === '' || value === null || value === undefined ? 0 : Number(value);
        if (!isNaN(numericValue)) {
          updated[field] = numericValue;
        }
      }
      
      // Recalculate automated fields
      const calculated = calculateFieldsImmediate(updated);
      
      console.log('updateEntry calculation result:', {
        field,
        value,
        openSL: calculated.openSL,
        supply: calculated.supply,
        overageShortageL: calculated.overageShortageL,
        availableL: calculated.availableL
      });
      
      // Validate entry
      const errors = validateEntry(calculated);
      setValidationErrors(errors);
      
      return calculated;
    });
  }, [calculateFieldsImmediate]);

  // Submit entry
  const submitEntry = useCallback(async (): Promise<boolean> => {
    if (!user?.station || isSubmitting) return false;
    
    setIsSubmitting(true);
    
    try {
      // Final validation
      const errors = validateEntry(entry);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Validation failed', {
          description: 'Please fix the validation errors before submitting.'
        });
        return false;
      }
      
      const request: DailySalesEntryRequest = {
        date: entry.date!,
        product: entry.product!,
        openSL: entry.openSL!,
        supply: entry.supply || 0,
        overageShortageL: entry.overageShortageL || 0,
        availableL: entry.availableL!,
        closingSL: entry.closingSL!,
        checkL: entry.checkL!,
        openSR: entry.openSR!,
        closingSR: entry.closingSR!,
        returnTT: entry.returnTT || 0,
        salesL: entry.salesL!,
        differenceL: entry.differenceL!,
        rate: entry.rate!,
        value: entry.value!,
        creditSales: entry.creditSales || 0,
        cashSales: entry.cashSales!,
        advances: entry.advances || 0,
        shortageMomo: entry.shortageMomo || 0,
        cashAvailable: entry.cashAvailable!,
        repaymentShortageMomo: entry.repaymentShortageMomo || 0,
        repaymentAdvances: entry.repaymentAdvances || 0,
        receivedFromDebtors: entry.receivedFromDebtors || 0,
        cashToBank: entry.cashToBank!,
        bankLodgement: entry.bankLodgement!,
        notes: entry.notes,
        station: user.station.stationName,
        enteredBy: user?.name || 'Current User',
        status: 'SUBMITTED'
      };
      console.log('Submitting daily sales entry:', request);
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const response: DailySalesEntryResponse = await apiCall<DailySalesEntryResponse>(
          DAILY_SALES_API.ENDPOINTS.SUBMIT_ENTRY,
          {
            method: 'POST',
            body: JSON.stringify(request)
          }
        );
        
        toast.success('Daily sales entry submitted successfully!', {
          description: response.message
        });
        
        // Reset form
        setEntry({
          date: new Date().toISOString().split('T')[0],
          product: 'Super',
          status: 'DRAFT'
        });
        
        return true;
      } else {
        toast.error('No connection to server', {
          description: 'Please check your internet connection and try again'
        });
        return false;
      }
    } catch (error) {
      const apiError: DailySalesApiError = {
        code: 'SUBMIT_ENTRY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to submit daily sales entry', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.station, isSubmitting, entry, user?.name, checkConnection, apiCall]);

  // Load data when date or product changes
  useEffect(() => {
    if (entry.date && entry.product && user?.station) {
      fetchPreviousDayData(entry.date, entry.product);
      fetchSupplyData(entry.date, entry.product);
    }
  }, [entry.date, entry.product, user?.station, fetchPreviousDayData, fetchSupplyData]);

  // Initialize with default rate when product is set
  useEffect(() => {
    if (entry.product && !entry.rate) {
      setEntry(prev => {
        const updated = {
          ...prev,
          rate: GHANA_FUEL_RATES[entry.product! as keyof typeof GHANA_FUEL_RATES]
        };
        
        return calculateFieldsImmediate(updated);
      });
    }
  }, [entry.product, entry.rate, calculateFieldsImmediate]);

  // Force recalculation when key fields change
  useEffect(() => {
    console.log('Triggering recalculation due to dependency change:', {
      openSL: entry.openSL,
      supply: entry.supply,
      overageShortageL: entry.overageShortageL,
      availableL: entry.availableL
    });
    
    if (entry.openSL !== undefined || entry.supply !== undefined || entry.overageShortageL !== undefined) {
      setEntry(prev => calculateFieldsImmediate(prev));
    }
  }, [entry.openSL, entry.supply, entry.overageShortageL, calculateFieldsImmediate]);

  return {
    // Form state
    entry,
    updateEntry,
    
    // Supporting data
    previousDayData,
    supplyData,
    isFirstEntry,
    
    // State
    isSubmitting,
    connectionStatus,
    lastError,
    validationErrors,
    
    // Actions
    submitEntry,
    checkConnection,
    
    // Utilities
    formatCurrency,
    calculateFields,
    
    // Computed values
    canSubmit: validationErrors.length === 0 && entry.date && entry.product && entry.rate,
    hasRequiredFields: Boolean(entry.openSL !== undefined && entry.closingSL !== undefined && entry.openSR !== undefined && entry.closingSR !== undefined && entry.rate)
  };
}