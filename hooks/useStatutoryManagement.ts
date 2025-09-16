import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { 
  STATUTORY_API, 
  STATUTORY_API_CONFIG, 
  MOCK_STATUTORY_DOCUMENTS, 
  STATUTORY_STATS,
  MONTHLY_STATUTORY_EXPIRATIONS,
  STATUTORY_DOCUMENT_DISTRIBUTION,
  STATUTORY_UPCOMING_DEADLINES,
  STATUTORY_REFRESH_INTERVALS,
  formatCurrency,
  calculateDaysRemaining,
  getDocumentStatus
} from '../constants/statutoryConstants';
import type { 
  StatutoryDocument, 
  StatutoryStats,
  StatutoryChartData,
  DocumentDistribution,
  UpcomingDeadline,
  StatutoryResponse, 
  CreateStatutoryDocumentRequest,
  UpdateStatutoryDocumentRequest,
  StatutoryRenewalRequest,
  StatutoryRenewalResponse,
  StatutoryFilters,
  StatutoryConnectionStatus,
  StatutoryApiError
} from '../types/statutory';

export function useStatutoryManagement() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  // State management
  const [documents, setDocuments] = useState<StatutoryDocument[]>([]);
  const [statistics, setStatistics] = useState<StatutoryStats>({
    complianceScore: 0,
    activeDocuments: { count: 0, total: 0 },
    expiringSoon: { count: 0, days: 30 },
    overdueFees: { amount: 0, count: 0 },
    criticalAlerts: { count: 0, unread: 0 },
    totalFeesPaid: 0,
    totalFeesOutstanding: 0
  });
  const [monthlyExpirations, setMonthlyExpirations] = useState<StatutoryChartData[]>([]);
  const [documentDistribution, setDocumentDistribution] = useState<DocumentDistribution[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<StatutoryConnectionStatus>({
    connected: false,
    lastChecked: new Date().toISOString(),
    endpoint: STATUTORY_API.BASE_URL
  });
  
  // Filter state
  const [filters, setFilters] = useState<StatutoryFilters>({
    status: 'all',
    documentType: 'all',
    paymentStatus: 'all',
    search: ''
  });
  
  // Error state
  const [lastError, setLastError] = useState<StatutoryApiError | null>(null);

  // Check backend connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), STATUTORY_API_CONFIG.TIMEOUT);
      
      const response = await fetch(
        `${STATUTORY_API.BASE_URL}${STATUTORY_API.ENDPOINTS.HEALTH_CHECK}`,
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
          endpoint: STATUTORY_API.BASE_URL,
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
        endpoint: STATUTORY_API.BASE_URL
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
    
    for (let attempt = 1; attempt <= STATUTORY_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), STATUTORY_API_CONFIG.TIMEOUT);
        
        const response = await fetch(`${STATUTORY_API.BASE_URL}${endpoint}`, {
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
        
        if (attempt < STATUTORY_API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, STATUTORY_API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError!;
  }, [user?.token]);

  // Fetch statutory data for the station
  const fetchStatutoryData = useCallback(async () => {
    if (!selectedStation) return;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATUTORY_API.ENDPOINTS.DOCUMENTS.replace(':stationId', selectedStation.id);
        const response: StatutoryResponse = await apiCall<StatutoryResponse>(endpoint);
        
        setDocuments(response.data.documents || []);
        setStatistics(response.data.stats);
        setMonthlyExpirations(response.data.monthlyExpirations || []);
        setDocumentDistribution(response.data.documentDistribution || []);
        setUpcomingDeadlines(response.data.upcomingDeadlines || []);
        
        toast.success('Statutory data updated', {
          description: `Found ${response.data.documents?.length || 0} statutory documents`
        });
      } else {
        // Use mock data when backend is unavailable
        console.info('Using mock data for statutory documents');
        let mockDocuments = MOCK_STATUTORY_DOCUMENTS.filter(doc => 
          doc.stationId === selectedStation.id
        );
        
        // Apply filters to mock data
        if (filters.status && filters.status !== 'all') {
          mockDocuments = mockDocuments.filter(doc => 
            doc.status.toLowerCase() === filters.status!.replace(' ', ' ').toLowerCase()
          );
        }
        if (filters.documentType && filters.documentType !== 'all') {
          mockDocuments = mockDocuments.filter(doc => 
            doc.type.toLowerCase() === filters.documentType!.toLowerCase()
          );
        }
        if (filters.paymentStatus && filters.paymentStatus !== 'all') {
          mockDocuments = mockDocuments.filter(doc => 
            doc.paymentStatus.toLowerCase() === filters.paymentStatus!.toLowerCase()
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          mockDocuments = mockDocuments.filter(doc => 
            doc.title.toLowerCase().includes(searchLower) ||
            doc.authority.toLowerCase().includes(searchLower) ||
            doc.reference.toLowerCase().includes(searchLower) ||
            doc.type.toLowerCase().includes(searchLower)
          );
        }
        
        setDocuments(mockDocuments);
        
        // Set mock statistics for selected station
        const stationStats = STATUTORY_STATS[selectedStation.id as keyof typeof STATUTORY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
        
        setMonthlyExpirations(MONTHLY_STATUTORY_EXPIRATIONS);
        setDocumentDistribution(STATUTORY_DOCUMENT_DISTRIBUTION);
        setUpcomingDeadlines(STATUTORY_UPCOMING_DEADLINES);
      }
    } catch (error) {
      const apiError: StatutoryApiError = {
        code: 'FETCH_STATUTORY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to fetch statutory data', {
        description: 'Using cached data. Please check your connection.'
      });
      
      // Fallback to mock data
      const mockDocuments = MOCK_STATUTORY_DOCUMENTS.filter(doc => 
        doc.stationId === selectedStation?.id
      );
      setDocuments(mockDocuments);
      
      if (selectedStation) {
        const stationStats = STATUTORY_STATS[selectedStation.id as keyof typeof STATUTORY_STATS];
        if (stationStats) {
          setStatistics(stationStats);
        }
      }
      
      setMonthlyExpirations(MONTHLY_STATUTORY_EXPIRATIONS);
      setDocumentDistribution(STATUTORY_DOCUMENT_DISTRIBUTION);
      setUpcomingDeadlines(STATUTORY_UPCOMING_DEADLINES);
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, apiCall, filters, selectedStation]);

  // Create new statutory document
  const createStatutoryDocument = useCallback(async (
    docData: CreateStatutoryDocumentRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const response: StatutoryDocument = await apiCall<StatutoryDocument>(
          STATUTORY_API.ENDPOINTS.CREATE_DOCUMENT,
          {
            method: 'POST',
            body: JSON.stringify({
              ...docData,
              stationId: selectedStation?.id,
              createdBy: user?.name || 'Current User'
            })
          }
        );
        
        setDocuments(prev => [...prev, response]);
        
        toast.success('Statutory document created successfully!', {
          description: `${docData.type} has been added to the system.`
        });
        
        // Refresh data to ensure consistency
        await fetchStatutoryData();
        
        return true;
      } else {
        // Mock creation for offline mode
        const daysRemaining = calculateDaysRemaining(docData.expiresDate);
        const newDocument: StatutoryDocument = {
          id: documents.length + 1,
          type: docData.type as StatutoryDocument['type'],
          title: docData.title,
          authority: docData.authority,
          reference: docData.reference,
          registeredDate: docData.registeredDate,
          issuedDate: docData.issuedDate,
          expiresDate: docData.expiresDate,
          daysRemaining,
          fees: parseFloat(docData.fees),
          paymentStatus: docData.paymentStatus as StatutoryDocument['paymentStatus'],
          status: getDocumentStatus(daysRemaining) as StatutoryDocument['status'],
          assignee: docData.assignee,
          stationId: selectedStation?.id || '',
          stationName: selectedStation?.name || '',
          createdBy: user?.name || 'Current User'
        };
        
        setDocuments(prev => [...prev, newDocument]);
        
        toast.success('Statutory document created successfully! (Mock Mode)', {
          description: `${docData.type} has been processed`
        });
        
        return true;
      }
    } catch (error) {
      const apiError: StatutoryApiError = {
        code: 'CREATE_DOCUMENT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setLastError(apiError);
      
      toast.error('Failed to create statutory document', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, selectedStation, checkConnection, apiCall, documents.length, fetchStatutoryData]);

  // Update existing statutory document
  const updateStatutoryDocument = useCallback(async (
    docData: UpdateStatutoryDocumentRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATUTORY_API.ENDPOINTS.UPDATE_DOCUMENT.replace(':id', docData.id.toString());
        const response: StatutoryDocument = await apiCall<StatutoryDocument>(
          endpoint,
          {
            method: 'PUT',
            body: JSON.stringify(docData)
          }
        );
        
        setDocuments(prev => prev.map(doc => 
          doc.id === docData.id ? response : doc
        ));
        
        toast.success('Statutory document updated successfully!', {
          description: `${docData.type} has been updated.`
        });
        
        return true;
      } else {
        // Mock update for offline mode
        const daysRemaining = calculateDaysRemaining(docData.expiresDate);
        setDocuments(prev => prev.map(doc => 
          doc.id === docData.id 
            ? {
                ...doc,
                type: docData.type as StatutoryDocument['type'],
                title: docData.title,
                authority: docData.authority,
                reference: docData.reference,
                registeredDate: docData.registeredDate,
                issuedDate: docData.issuedDate,
                expiresDate: docData.expiresDate,
                daysRemaining,
                fees: parseFloat(docData.fees),
                paymentStatus: docData.paymentStatus as StatutoryDocument['paymentStatus'],
                status: getDocumentStatus(daysRemaining) as StatutoryDocument['status'],
                assignee: docData.assignee,
                updatedBy: user?.name || 'Current User',
                updatedAt: new Date().toISOString()
              }
            : doc
        ));
        
        toast.success('Statutory document updated successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: StatutoryApiError = {
        code: 'UPDATE_DOCUMENT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        documentId: docData.id
      };
      setLastError(apiError);
      
      toast.error('Failed to update statutory document', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.name, checkConnection, apiCall]);

  // Renew statutory document
  const renewStatutoryDocument = useCallback(async (
    renewalData: StatutoryRenewalRequest
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATUTORY_API.ENDPOINTS.RENEW_DOCUMENT.replace(':id', renewalData.id.toString());
        const response: StatutoryRenewalResponse = await apiCall<StatutoryRenewalResponse>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify(renewalData)
          }
        );
        
        setDocuments(prev => prev.map(doc => 
          doc.id === renewalData.id ? response.updatedDocument : doc
        ));
        
        toast.success('Document renewed successfully!', {
          description: response.message
        });
        
        return true;
      } else {
        // Mock renewal for offline mode
        const currentDate = new Date();
        const newExpiryDate = new Date(renewalData.newExpiresDate);
        const daysRemaining = calculateDaysRemaining(renewalData.newExpiresDate);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === renewalData.id 
            ? {
                ...doc,
                issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                expiresDate: newExpiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                daysRemaining,
                status: 'Compliant' as const,
                paymentStatus: 'PAID' as const,
                fees: parseFloat(renewalData.renewalFees),
                updatedBy: renewalData.renewedBy,
                updatedAt: renewalData.renewedAt
              }
            : doc
        ));
        
        toast.success('Document renewed successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: StatutoryApiError = {
        code: 'RENEW_DOCUMENT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        documentId: renewalData.id
      };
      setLastError(apiError);
      
      toast.error('Failed to renew document', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall]);

  // Delete statutory document
  const deleteStatutoryDocument = useCallback(async (documentId: number): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = STATUTORY_API.ENDPOINTS.DELETE_DOCUMENT.replace(':id', documentId.toString());
        await apiCall(endpoint, { method: 'DELETE' });
        
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        toast.success('Statutory document deleted successfully!');
        return true;
      } else {
        // Mock deletion for offline mode
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Statutory document deleted successfully! (Mock Mode)');
        return true;
      }
    } catch (error) {
      const apiError: StatutoryApiError = {
        code: 'DELETE_DOCUMENT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        documentId
      };
      setLastError(apiError);
      
      toast.error('Failed to delete statutory document', {
        description: 'Please try again later'
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkConnection, apiCall]);

  // Export statutory data
  const exportStatutoryData = useCallback(async (format: 'csv' | 'excel' = 'csv'): Promise<boolean> => {
    if (!selectedStation) return false;
    
    setIsLoading(true);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        const endpoint = `${STATUTORY_API.ENDPOINTS.EXPORT.replace(':stationId', selectedStation.id)}?format=${format}`;
        const response = await fetch(`${STATUTORY_API.BASE_URL}${endpoint}`, {
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
        a.download = `statutory-compliance-${selectedStation.name}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Statutory data exported as ${format.toUpperCase()}`, {
          description: 'The compliance report has been downloaded.'
        });
        
        return true;
      } else {
        // Mock export for development
        toast.success(`Statutory data exported as ${format.toUpperCase()} (simulated)`, {
          description: 'In development mode - actual file download simulated.'
        });
        return true;
      }
    } catch (error) {
      toast.error('Failed to export statutory data', {
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
      await fetchStatutoryData();
      toast.success('Statutory data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh statutory data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatutoryData]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<StatutoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get document by ID
  const getDocumentById = useCallback((id: number): StatutoryDocument | undefined => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  // Initialize data on component mount and station change
  useEffect(() => {
    if (selectedStation) {
      fetchStatutoryData();
    }
  }, [selectedStation, fetchStatutoryData]);

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedStation) {
        fetchStatutoryData();
      }
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timer);
  }, [filters, fetchStatutoryData, selectedStation]);

  // Set up auto-refresh for statutory data
  useEffect(() => {
    if (!connectionStatus.connected || !selectedStation) return;
    
    const interval = setInterval(() => {
      fetchStatutoryData();
    }, STATUTORY_REFRESH_INTERVALS.DOCUMENT_DATA);
    
    return () => clearInterval(interval);
  }, [connectionStatus.connected, selectedStation, fetchStatutoryData]);

  return {
    // Data
    documents,
    statistics,
    monthlyExpirations,
    documentDistribution,
    upcomingDeadlines,
    
    // State
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    
    // Actions
    createStatutoryDocument,
    updateStatutoryDocument,
    renewStatutoryDocument,
    deleteStatutoryDocument,
    exportStatutoryData,
    refreshData,
    updateFilters,
    checkConnection,
    getDocumentById,
    
    // Utilities
    formatCurrency,
    calculateDaysRemaining,
    getDocumentStatus,
    
    // Computed values
    compliantDocuments: documents.filter(d => d.status === 'Compliant'),
    expiringSoonDocuments: documents.filter(d => d.status === 'Expiring Soon'),
    expiredDocuments: documents.filter(d => d.status === 'Expired'),
    hasData: documents.length > 0
  };
}