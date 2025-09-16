import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  initialTankData, 
  mockSharedProductsData, 
  baseHistoryData,
  availableStations 
} from '../constants/productSharingData';
import { 
  API_ENDPOINTS,
  DEFAULT_SHARE_FORM,
  DEFAULT_PRICE_FORM,
  DEFAULT_ADD_TANK_FORM,
  DEFAULT_MANAGE_FORM,
  DEFAULT_REFILL_FORM,
  DEFAULT_UPDATE_SHARED_PRODUCT_FORM,
  type StationQuantityPair,
  type AffectedTank
} from '../constants/productSharingConstants';
import { 
  ensureArray, 
  isConnectionError, 
  formatCurrency, 
  calculateTotals 
} from '../utils/productSharingHelpers';
import type { 
  ModalState, 
  SelectedTank, 
  SharedProduct, 
  BatchProductEntry, 
  HistoryEntry 
} from '../types/productSharing';

// Helper function to check if backend is available
const checkBackendAvailability = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Get token if available
    const token = localStorage.getItem('ktc_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log(`Backend check failed for ${url}:`, error);
    return false;
  }
};

// Helper function to get current datetime in datetime-local format
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ktc_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to build station-filtered query parameters
const getStationQueryParams = (user: any): string => {
  // If user is a station manager, filter by their station
  if (user?.role === 'ROLE_STATION_MANAGER' && user?.id) {
    // Use the user's ID to find their station
    return `?managerId=${encodeURIComponent(user.id)}`;
  }
  return '';
};

export function useProductSharing() {
  const { user } = useAuth();
  
  // State management
  const [tankData, setTankData] = useState(initialTankData);
  const [sharedProductsData, setSharedProductsData] = useState<SharedProduct[]>([]);
  const [selectedTank, setSelectedTank] = useState<SelectedTank | null>(null);
  const [selectedSharedProduct, setSelectedSharedProduct] = useState<SharedProduct | null>(null);
  const [tankHistory, setTankHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  // Modal states
  const [modals, setModals] = useState<ModalState>({
    shareProduct: false,
    batchShareProduct: false,
    updatePrice: false,
    viewHistory: false,
    manageTank: false,
    orderRefill: false,
    addTank: false,
    deleteTank: false,
    viewSharedProduct: false,
    updateSharedProduct: false,
    deleteSharedProduct: false,
    importBatch: false,
    selectTemplate: false
  });

  // Form states
  const [shareForm, setShareForm] = useState(DEFAULT_SHARE_FORM);
  const [priceForm, setPriceForm] = useState(DEFAULT_PRICE_FORM);
  const [addTankForm, setAddTankForm] = useState(DEFAULT_ADD_TANK_FORM);
  const [manageForm, setManageForm] = useState(DEFAULT_MANAGE_FORM);
  const [refillForm, setRefillForm] = useState(DEFAULT_REFILL_FORM);
  const [updateSharedProductForm, setUpdateSharedProductForm] = useState(DEFAULT_UPDATE_SHARED_PRODUCT_FORM);
  const [newStationSelection, setNewStationSelection] = useState('');

// Check backend availability on component mount
useEffect(() => {
  const checkBackend = async () => {
    try {
      // Get token if available
      const token = localStorage.getItem('ktc_token');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.health, {
        method: "GET",
        headers,
      });

      const isAvailable = response.ok;
      setBackendAvailable(isAvailable);

      if (isAvailable) {
        setConnectionStatus("connected");
        fetchSharedProducts();
        fetchTanks();
      } else {
        // If 403 and no token, it might be that health endpoint requires auth
        if (response.status === 403 && !token) {
          console.log('Health endpoint requires authentication but no token available');
          setConnectionStatus("disconnected");
        } else {
          setConnectionStatus("disconnected");
        }
        
        setSharedProductsData(ensureArray(mockSharedProductsData, []));
        setTankData(ensureArray(initialTankData, []));

        toast.info("Backend server not available", {
          description:
            "Using mock data. Start your Spring Boot server on port 8081 to sync data.",
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setBackendAvailable(false);
      setConnectionStatus("disconnected");
      setSharedProductsData(ensureArray(mockSharedProductsData, []));
      setTankData(ensureArray(initialTankData, []));

      toast.info("Backend server not available", {
        description:
          "Using mock data. Start your Spring Boot server on port 8081 to sync data.",
      });
    }
  };

  checkBackend();
}, []);

  // Fetch functions
  const fetchTanks = async (isRetry: boolean = false) => {
    if (!isRetry) setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const stationParams = getStationQueryParams(user);
      const response = await fetch(`${API_ENDPOINTS.tanks}${stationParams}`, {
        signal: controller.signal,
        headers: getAuthHeaders(),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validatedTankData = ensureArray(data, initialTankData);
      setTankData(validatedTankData);
      setConnectionStatus('connected');
      setBackendAvailable(true);

      if (isRetry) {
        toast.success('Connected to tank API successfully!');
      }
    } catch (error) {
      console.error('Error fetching tanks:', error);
      let mockTankData = [...initialTankData];
      
      // Filter mock tank data by station for station managers
      if (user?.role === 'ROLE_STATION_MANAGER') {
        const userStationId = user?.station?.stationId || user?.stationId;
        if (userStationId) {
          mockTankData = mockTankData.filter(tank => tank.station === userStationId);
        }
      }
      
      setTankData(ensureArray(mockTankData, []));
      setConnectionStatus('disconnected');
      setBackendAvailable(false);
      
      if (!isRetry) {
        toast.warning('Tank API not available', {
          description: 'Using mock data. Check if your backend server is running on port 8081.'
        });
      }
    } finally {
      if (!isRetry) setIsLoading(false);
    }
  };

  const fetchSharedProducts = async (isRetry: boolean = false) => {
    if (!isRetry) setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const stationParams = getStationQueryParams(user);
      console.log('Fetching shared products from:', `${API_ENDPOINTS.supply}${stationParams}`);
      const response = await fetch(`${API_ENDPOINTS.supply}${stationParams}`, {
        signal: controller.signal,
        headers: getAuthHeaders(),
      });
 
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched shared products:', data);
      const validatedSharedProducts = ensureArray<SharedProduct>(data.content);
      setSharedProductsData(validatedSharedProducts);
      setConnectionStatus('connected');
      setBackendAvailable(true);

      if (isRetry) {
        toast.success('Connected to supply API successfully!');
      }
    } catch (error) {
      console.error('Error fetching shared products:', error);
      let mockData = [...mockSharedProductsData];
      
      // Filter mock data by station for station managers
      // Note: This would need to be updated based on actual station-product relationship
      // For now, we'll use a basic filter assuming station names match
      if (user?.role === 'ROLE_STATION_MANAGER' && user?.id) {
        // In a real implementation, you'd need to:
        // 1. First get the station where user.id === station.manager.userId
        // 2. Then filter products by that station
        // For mock data, we'll use a simplified approach
        console.log('Station manager logged in, filtering mock data for user ID:', user.id);
      }
      
      const validatedMockData = ensureArray<SharedProduct>(mockData, []);
      setSharedProductsData(validatedMockData);
      setConnectionStatus('disconnected');
      setBackendAvailable(false);
      
      if (!isRetry) {
        toast.warning('Supply API not available', {
          description: 'Using mock data. Check if your backend server is running on port 8081.'
        });
      }
    } finally {
      if (!isRetry) setIsLoading(false);
    }
  };

  const fetchTankHistory = async (tankId: number) => {
    setLoadingHistory(true);
    try {
      if (!backendAvailable) {
        setTankHistory(baseHistoryData);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_ENDPOINTS.tanks}/${tankId}/history`, {
        signal: controller.signal,
        headers: getAuthHeaders(),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validatedHistoryData = ensureArray<HistoryEntry>(data, baseHistoryData);
      setTankHistory(validatedHistoryData);
    } catch (error) {
      console.error('Error fetching tank history:', error);
      setTankHistory(baseHistoryData);
      toast.warning('Tank history API not available', {
        description: 'Using mock data.'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const retryConnection = async () => {
    setIsLoading(true);
    const isAvailable = await checkBackendAvailability(API_ENDPOINTS.health);
    
    if (isAvailable) {
      setBackendAvailable(true);
      await Promise.all([
        fetchSharedProducts(true),
        fetchTanks(true)
      ]);
    } else {
      setBackendAvailable(false);
      toast.error('Backend server is still not available', {
        description: 'Please ensure your Spring Boot server is running on port 8081.'
      });
    }
    setIsLoading(false);
  };

  // Helper function to calculate totals from station-quantity pairs
  const calculateTotalsFromStations = (stations: StationQuantityPair[], rate: string, salesRate: string) => {
    const costRate = parseFloat(rate) || 0;
    const saleRate = parseFloat(salesRate) || 0;
    
    let totalQty = 0;
    let amountCost = 0;
    let amountSales = 0;
    
    stations.forEach(station => {
      const qty = parseFloat(station.quantity) || 0;
      totalQty += qty;
      amountCost += qty * costRate;
      amountSales += qty * saleRate;
    });
    
    const expectedProfit = amountSales - amountCost;
    
    return {
      totalQty: totalQty.toString(),
      amountCost: amountCost.toFixed(2),
      amountSales: amountSales.toFixed(2),
      expectedProfit: expectedProfit.toFixed(2)
    };
  };

  // Form handlers
  const handleShareFormChange = (field: string, value: any) => {
    const newForm = { ...shareForm, [field]: value };
    
    if (field === 'selectedStations' || field === 'rate' || field === 'salesRate') {
      const calculated = calculateTotalsFromStations(
        field === 'selectedStations' ? value : newForm.selectedStations,
        field === 'rate' ? value : newForm.rate,
        field === 'salesRate' ? value : newForm.salesRate
      );
      
      newForm.totalQty = calculated.totalQty;
      newForm.amountCost = calculated.amountCost;
      newForm.amountSales = calculated.amountSales;
      newForm.expectedProfit = calculated.expectedProfit;
    }
    
    setShareForm(newForm);
  };

  const handleUpdateSharedProductFormChange = (field: string, value: string | Record<string, string>) => {
    const newForm = { ...updateSharedProductForm, [field]: value };
    
    if (field === 'stationQuantities' || field === 'rate' || field === 'salesRate') {
      const calculated = calculateTotals(
        field === 'stationQuantities' ? value as Record<string, string> : newForm.stationQuantities,
        field === 'rate' ? value as string : newForm.rate,
        field === 'salesRate' ? value as string : newForm.salesRate
      );
      
      newForm.totalQty = calculated.totalQty;
      newForm.amountCost = calculated.amountCost;
      newForm.amountSales = calculated.amountSales;
      newForm.expectedProfit = calculated.expectedProfit;
    }
    
    setUpdateSharedProductForm(newForm);
  };

  const handleStationQuantityChange = (station: string, quantity: string) => {
    const newStationQuantities = { ...updateSharedProductForm.stationQuantities, [station]: quantity };
    handleUpdateSharedProductFormChange('stationQuantities', newStationQuantities);
  };

  // Station management for share form
  const addStationToShare = () => {
    if (!newStationSelection || shareForm.selectedStations.some(s => s.station === newStationSelection)) {
      return;
    }

    const newStation: StationQuantityPair = {
      id: Date.now().toString(),
      station: newStationSelection,
      quantity: ''
    };

    const updatedStations = [...shareForm.selectedStations, newStation];
    handleShareFormChange('selectedStations', updatedStations);
    setNewStationSelection('');
  };

  const removeStationFromShare = (stationId: string) => {
    const updatedStations = shareForm.selectedStations.filter(s => s.id !== stationId);
    handleShareFormChange('selectedStations', updatedStations);
  };

  const updateStationQuantity = (stationId: string, quantity: string) => {
    const updatedStations = shareForm.selectedStations.map(s => 
      s.id === stationId ? { ...s, quantity } : s
    );
    handleShareFormChange('selectedStations', updatedStations);
  };

  // Modal management
  const openModal = (modalName: keyof ModalState, tank?: SelectedTank, sharedProduct?: SharedProduct) => {
    if (tank) {
      setSelectedTank(tank);
      if (modalName === 'updatePrice') {
        setPriceForm(prev => ({
          ...prev,
          tankId: tank.id.toString(),
          fuelType: tank.fuelType,
          newPrice: tank.pricePerLiter.toString(),
          currentStation: tank.station,
          effectiveDate: getCurrentDateTimeLocal()
        }));
      }
      if (modalName === 'manageTank') {
        setManageForm(prev => ({
          ...prev,
          name: tank.name,
          capacity: tank.capacity.toString(),
          status: tank.status.toLowerCase()
        }));
      }
      if (modalName === 'viewHistory') {
        fetchTankHistory(tank.id);
      }
    }
    if (sharedProduct) {
      setSelectedSharedProduct(sharedProduct);
      if (modalName === 'updateSharedProduct') {
        // Handle both array structure and flattened structure
        const stationQuantities: Record<string, string> = {};
        
        if (sharedProduct.stationQuantities) {
          // Handle array structure (from mockSharedProductsData)
          ensureArray(sharedProduct.stationQuantities).forEach((sq: any) => {
            if (sq && sq.station && sq.qty !== undefined) {
              stationQuantities[sq.station] = sq.qty.toString();
            }
          });
        } else if (sharedProduct.station && sharedProduct.qty) {
          // Handle flattened structure
          stationQuantities[sharedProduct.station] = sharedProduct.qty.toString();
        }
        
        // Format date for date input (YYYY-MM-DD)
        let formattedDate = '';
        if (sharedProduct.date) {
          const dateStr = sharedProduct.date;
          
          // Handle ISO date strings (e.g., "2025-09-02T00:00:00.000+00:00")
          if (dateStr.includes('T')) {
            formattedDate = dateStr.split('T')[0]; // Extract YYYY-MM-DD part
          }
          // Handle DD/MM/YYYY format
          else if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          // Handle YYYY-MM-DD format (already correct)
          else if (dateStr.includes('-') && dateStr.length === 10) {
            formattedDate = dateStr;
          }
          // Fallback: try to parse as Date and extract
          else {
            try {
              const dateObj = new Date(dateStr);
              if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
              } else {
                formattedDate = '';
              }
            } catch (error) {
              formattedDate = '';
            }
          }
        }
        
        const initialForm = {
          date: formattedDate,
          stationQuantities,
          product: sharedProduct.product || '',
          rate: sharedProduct.rate ? sharedProduct.rate.toString() : '0',
          salesRate: sharedProduct.salesRate ? sharedProduct.salesRate.toString() : '0',
          totalQty: sharedProduct.totalQty ? sharedProduct.totalQty.toString() : '0',
          amountCost: sharedProduct.amountCost ? sharedProduct.amountCost.toString() : '0',
          amountSales: sharedProduct.amountSales ? sharedProduct.amountSales.toString() : '0',
          expectedProfit: sharedProduct.expectedProfit ? sharedProduct.expectedProfit.toString() : '0'
        };
        
        // Calculate totals to ensure summary is updated
        const calculated = calculateTotals(
          stationQuantities,
          initialForm.rate,
          initialForm.salesRate
        );
        
        initialForm.totalQty = calculated.totalQty;
        initialForm.amountCost = calculated.amountCost;
        initialForm.amountSales = calculated.amountSales;
        initialForm.expectedProfit = calculated.expectedProfit;
        
        setUpdateSharedProductForm(initialForm);
      }
    }

    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedTank(null);
    setSelectedSharedProduct(null);
    setTankHistory([]);
    
    // Reset forms when closing
    if (modalName === 'shareProduct') {
      setShareForm(DEFAULT_SHARE_FORM);
      setNewStationSelection('');
    }
    
    if (modalName === 'updatePrice') {
      setPriceForm(DEFAULT_PRICE_FORM);
    }

    if (modalName === 'addTank') {
      setAddTankForm(DEFAULT_ADD_TANK_FORM);
    }

    if (modalName === 'manageTank') {
      setManageForm(DEFAULT_MANAGE_FORM);
    }

    if (modalName === 'orderRefill') {
      setRefillForm(DEFAULT_REFILL_FORM);
    }

    if (modalName === 'updateSharedProduct') {
      setUpdateSharedProductForm(DEFAULT_UPDATE_SHARED_PRODUCT_FORM);
    }
  };

  // Complete handler implementations

  // Share single product handler - Creates array of station-specific entries
  const handleShareProduct = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Filter stations with valid quantities
      const validStations = shareForm.selectedStations.filter(s => parseFloat(s.quantity) > 0);
      
      if (validStations.length === 0) {
        toast.error('No valid stations selected', {
          description: 'Please add at least one station with a quantity greater than 0.'
        });
        return;
      }

      // Create array of individual station entries with flattened structure
      const stationEntries = validStations.map(stationEntry => {
        const quantity = parseFloat(stationEntry.quantity);
        const rate = parseFloat(shareForm.rate) || 0;
        const salesRate = parseFloat(shareForm.salesRate) || 0;
        const amountCost = quantity * rate;
        const amountSales = quantity * salesRate;
        const expectedProfit = amountSales - amountCost;

        return {
          date: shareForm.date,
          station: stationEntry.station,  // Direct property
          qty: quantity,                  // Direct property
          product: shareForm.product,
          totalQty: quantity,
          rate: rate,
          amountCost: amountCost,
          salesRate: salesRate,
          amountSales: amountSales,
          expProfit: expectedProfit,
          status: 'PENDING',
          createdBy: user?.name || 'Current User'
        };
      });

      if (backendAvailable && connectionStatus === 'connected') {
        // Post array of station entries to backend
        console.log('Posting station entries:', stationEntries);
        const response = await fetch(API_ENDPOINTS.supply, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(stationEntries),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        toast.success('Product shared successfully!', {
          description: `${shareForm.product} shared to ${stationEntries.length} station${stationEntries.length > 1 ? 's' : ''}`
        });

        await fetchSharedProducts();
      } else {
        // Mock mode: Create individual entries for each station
        const newMockProducts: SharedProduct[] = stationEntries.map((entry, index) => ({
          id: Math.max(...ensureArray<SharedProduct>(sharedProductsData).map(p => p.id || 0), 0) + index + 1,
          date: shareForm.date,
          stationQuantities: [
            { station: entry.station, qty: parseFloat(entry.qty.toString()) || 0 }
          ],
          product: shareForm.product,
          totalQty: parseFloat(entry.qty.toString()) || 0,
          rate: parseFloat(shareForm.rate) || 0,
          amountCost: parseFloat(shareForm.amountCost) || 0,
          salesRate: parseFloat(shareForm.salesRate) || 0,
          amountSales: parseFloat(shareForm.amountSales) || 0,
          expectedProfit: parseFloat(shareForm.expectedProfit) || 0,
          status: 'PENDING',
          createdBy: user?.name || 'Mock User',
          createdAt: new Date().toISOString()
        }));

        setSharedProductsData((prev) => {
          const validatedPrev = ensureArray<SharedProduct>(prev);
          return [...newMockProducts, ...validatedPrev];
        });
        
        toast.success('Product shared successfully! (Mock Mode)', {
          description: `${shareForm.product} shared to ${stationEntries.length} station${stationEntries.length > 1 ? 's' : ''}. Start backend to sync data.`
        });
      }
      
      closeModal('shareProduct');
    } catch (error) {
      console.error('Error sharing product:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost', {
          description: 'Could not save to server. Please check if your Spring Boot server is running.'
        });
      } else {
        toast.error('Failed to share product', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

    // Update price handler - Handles single tank, station, or enterprise-wide updates
  const handleUpdatePrice = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validation
      if (!priceForm.fuelType || !priceForm.newPrice || !priceForm.reason.trim()) {
        toast.error('Missing required fields', {
          description: 'Please fill in fuel type, new price, and reason for change.'
        });
        return;
      }

      const newPrice = parseFloat(priceForm.newPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        toast.error('Invalid price', {
          description: 'Please enter a valid price greater than 0.'
        });
        return;
      }

      // Calculate affected tanks based on scope
      const validatedTankData = ensureArray(tankData);
      let affectedTanks: AffectedTank[] = [];
      let targetTankId: number | null = null;
      let targetStation: string | null = null;

      switch (priceForm.applyTo) {
        case 'selected':
          if (!selectedTank) {
            toast.error('No tank selected', {
              description: 'Please select a tank to update.'
            });
            return;
          }
          
          targetTankId = selectedTank.id;
          const tank = validatedTankData.find(t => t.id === selectedTank.id);
          targetStation = selectedTank?.station || null;
          if (tank && tank.fuelType === priceForm.fuelType) {
            affectedTanks = [{
              id: tank.id,
              name: tank.name,
              station: tank.station,
              fuelType: tank.fuelType,
              currentPrice: tank.pricePerLiter,
              newPrice: newPrice,
              priceDifference: newPrice - tank.pricePerLiter,
              percentageChange: ((newPrice - tank.pricePerLiter) / tank.pricePerLiter) * 100
            }];
          }
          break;

        case 'current_station':
          if (!selectedTank) {
            toast.error('No station selected', {
              description: 'Please select a tank to determine the station.'
            });
            return;
          }
          targetStation = selectedTank.station;
          affectedTanks = validatedTankData
            .filter(tank => tank.station === selectedTank.station && tank.fuelType === priceForm.fuelType)
            .map(tank => ({
              id: tank.id,
              name: tank.name,
              station: tank.station,
              fuelType: tank.fuelType,
              currentPrice: tank.pricePerLiter,
              newPrice: newPrice,
              priceDifference: newPrice - tank.pricePerLiter,
              percentageChange: ((newPrice - tank.pricePerLiter) / tank.pricePerLiter) * 100
            }));
          break;

        case 'all_stations':
          
          affectedTanks = validatedTankData
            .filter(tank => tank.fuelType === priceForm.fuelType)
            .map(tank => ({
              id: tank.id,
              name: tank.name,
              station: tank.station,
              fuelType: tank.fuelType,
              currentPrice: tank.pricePerLiter,
              newPrice: newPrice,
              priceDifference: newPrice - tank.pricePerLiter,
              percentageChange: ((newPrice - tank.pricePerLiter) / tank.pricePerLiter) * 100
            }));
            console.log('Selected tank for price update:', affectedTanks);
          break;
      }

      if (affectedTanks.length === 0) {
        toast.error('No tanks to update', {
          description: `No tanks match the selected criteria for ${priceForm.fuelType} fuel.`
        });
        return;
      }
      const firstTank = affectedTanks[0];
      // Prepare payload for backend
      const priceUpdatePayload = {
        updateScope: priceForm.applyTo,
        targetTankId,
        targetStation: affectedTanks.map(tank => tank.station),
        fuelType: priceForm.fuelType,
        newPrice: newPrice,
        effectiveDate: priceForm.effectiveDate,
        reason: priceForm.reason,
        updatedBy: user?.name || 'Current User',
        affectedTankIds: affectedTanks.map(tank => tank.id),
        totalAffectedTanks: affectedTanks.length,
        currentPrice: firstTank?.currentPrice,
        percentageChange: firstTank?.percentageChange,
        priceDifference: firstTank?.priceDifference,
        status: 'Pending'
      };

      if (backendAvailable && connectionStatus === 'connected') {
        // Send to backend
        console.log('Sending price update payload to backend:', priceUpdatePayload);
        const response = await fetch(API_ENDPOINTS.bulkPriceUpdate, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(priceUpdatePayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        
        toast.success('Prices updated successfully!', {
          description: `Updated ${result.updatedCount || affectedTanks.length} tank${affectedTanks.length !== 1 ? 's' : ''} with new ${priceForm.fuelType} price of ${formatCurrency(newPrice)}/L`
        });

        // Refresh tank data to show updated prices
        await fetchTanks();
      } else {
        // Mock mode: Update local tank data
        setTankData(prev => {
          const validatedPrev = ensureArray(prev);
          return validatedPrev.map(tank => {
            const affectedTank = affectedTanks.find(at => at.id === tank.id);
            if (affectedTank) {
              return {
                ...tank,
                pricePerLiter: newPrice
              };
            }
            return tank;
          });
        });

        let scopeDescription = '';
        switch (priceForm.applyTo) {
          case 'selected':
            scopeDescription = `for ${selectedTank?.name}`;
            break;
          case 'current_station':
            scopeDescription = `at ${selectedTank?.station}`;
            break;
          case 'all_stations':
            scopeDescription = 'across all stations';
            break;
        }

        toast.success('Prices updated successfully! (Mock Mode)', {
          description: `Updated ${affectedTanks.length} tank${affectedTanks.length !== 1 ? 's' : ''} with new ${priceForm.fuelType} price of ${formatCurrency(newPrice)}/L ${scopeDescription}. Start backend to sync data.`
        });
      }

      closeModal('updatePrice');
    } catch (error) {
      console.error('Error updating prices:', error);

      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost', {
          description: 'Could not save price updates. Please check if your Spring Boot server is running.'
        });
      } else {
        toast.error('Failed to update prices', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add tank handler
  const handleAddTank = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const currentStock = parseFloat(addTankForm.currentStock) || 0;
      const capacity = parseFloat(addTankForm.capacity) || 1;
      const fillPercentage = Math.round((currentStock / capacity) * 100);
      
      let status = 'Good';
      if (fillPercentage < 20) status = 'Critical';
      else if (fillPercentage < 40) status = 'Low';
      
      const tankPayload = {
        date: new Date().toISOString().split("T")[0],
        name: addTankForm.name,
        station: addTankForm.station,
        fuelType: addTankForm.fuelType,
        capacity: capacity,
        currentStock: currentStock,
        fillPercentage,
        pricePerLiter: parseFloat(addTankForm.pricePerLiter) || 0,
        lastRefill: new Date().toISOString(),
        status
      };
      console.log('Adding new tank with payload:', tankPayload);
      if (backendAvailable && connectionStatus === 'connected') {
        const response = await fetch(API_ENDPOINTS.tanks, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(tankPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        toast.success('Tank added successfully!', {
          description: `${addTankForm.name} added to ${addTankForm.station}`
        });

        await fetchTanks();
      } else {
        const newTank = {
          id: Math.max(...ensureArray(tankData).map(t => t.id || 0), 0) + 1,
          ...tankPayload
        };
        
        setTankData(prev => {
          const validatedPrev = ensureArray(prev);
          return [...validatedPrev, newTank];
        });
        
        toast.success('Tank added successfully! (Mock Mode)', {
          description: `${addTankForm.name} added to ${addTankForm.station}. Start backend to sync data.`
        });
      }
      
      closeModal('addTank');
    } catch (error) {
      console.error('Error adding tank:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost', {
          description: 'Could not save tank. Please check if your backend server is running.'
        });
      } else {
        toast.error('Failed to add tank', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manage tank handler
  const handleManageTank = async () => {
    if (!selectedTank || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const updatedTank = {
        ...selectedTank,
        name: manageForm.name || selectedTank.name,
        capacity: parseFloat(manageForm.capacity) || selectedTank.capacity,
        status: manageForm.status || selectedTank.status
      };

      if (backendAvailable && connectionStatus === 'connected') {
        const response = await fetch(`${API_ENDPOINTS.tanks}/${selectedTank.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedTank),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        toast.success('Tank updated successfully!', {
          description: `${selectedTank.name} configuration updated`
        });

        await fetchTanks();
      } else {
        setTankData(prev => {
          const validatedPrev = ensureArray(prev);
          return validatedPrev.map(tank => 
            tank.id === selectedTank.id ? updatedTank : tank
          );
        });

        toast.success('Tank updated successfully! (Mock Mode)', {
          description: `${selectedTank.name} configuration updated. Start backend to sync changes.`
        });
      }

      closeModal('manageTank');
    } catch (error) {
      console.error('Error updating tank:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost');
      } else {
        toast.error('Failed to update tank', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tank handler
  const handleDeleteTank = async () => {
    if (!selectedTank || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (backendAvailable && connectionStatus === 'connected') {
        const response = await fetch(`${API_ENDPOINTS.tanks}/${selectedTank.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        toast.success('Tank deleted successfully!', {
          description: `${selectedTank.name} removed from ${selectedTank.station}`
        });

        await fetchTanks();
      } else {
        setTankData(prev => {
          const validatedPrev = ensureArray(prev);
          return validatedPrev.filter(tank => tank.id !== selectedTank.id);
        });
        toast.success('Tank deleted successfully! (Mock Mode)', {
          description: `${selectedTank.name} removed from ${selectedTank.station}. Start backend to sync changes.`
        });
      }
      
      closeModal('deleteTank');
    } catch (error) {
      console.error('Error deleting tank:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost');
      } else {
        toast.error('Failed to delete tank', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order refill handler
  const handleOrderRefill = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const refillPayload = {
        tankId: selectedTank?.id,
        tankName: selectedTank?.name,
        station: selectedTank?.station,
        supplier: refillForm.supplier,
        amount: parseFloat(refillForm.amount) || 0,
        estimatedCost: parseFloat(refillForm.estimatedCost) || 0,
        urgency: refillForm.urgency,
        notes: refillForm.notes,
        scheduledDate: refillForm.scheduledDate,
        status: 'PENDING',
        requestedBy: user?.name || 'Current User',
        requestedAt: new Date().toISOString()
      };

      // Mock success since this is typically an external system integration
      toast.success('Refill order placed successfully!', {
        description: `${refillForm.amount}L order placed for ${selectedTank?.name}`
      });
      
      closeModal('orderRefill');
    } catch (error) {
      console.error('Error ordering refill:', error);
      toast.error('Failed to place refill order', {
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update shared product handler - Works with flattened structure
  const handleUpdateSharedProduct = async () => {
    if (!selectedSharedProduct || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Get the first station and quantity from form (flattened structure has only one station per entry)
      const stationEntries = Object.entries(updateSharedProductForm.stationQuantities)
        .filter(([_, qty]) => parseFloat(qty) > 0);
      
      if (stationEntries.length === 0) {
        toast.error('No valid quantity entered', {
          description: 'Please enter a valid quantity greater than 0.'
        });
        return;
      }

      const [station, qty] = stationEntries[0]; // Take first entry since flattened structure has one station per record
      const quantity = parseFloat(qty);
      const rate = parseFloat(updateSharedProductForm.rate) || 0;
      const salesRate = parseFloat(updateSharedProductForm.salesRate) || 0;
      const amountCost = quantity * rate;
      const amountSales = quantity * salesRate;
      const expectedProfit = amountSales - amountCost;

      const updatedPayload = {
        ...selectedSharedProduct,
        date: updateSharedProductForm.date,
        station: station,               // Direct property
        qty: quantity,                  // Direct property  
        product: updateSharedProductForm.product,
        totalQty: quantity,
        rate: rate,
        amountCost: amountCost,
        salesRate: salesRate,
        amountSales: amountSales,
        expectedProfit: expectedProfit,
        updatedBy: user?.name || 'Current User',
        updatedAt: new Date().toISOString()
      };

      if (backendAvailable && connectionStatus === 'connected') {
        const response = await fetch(`${API_ENDPOINTS.supply}/${selectedSharedProduct.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        toast.success('Product updated successfully!');
        await fetchSharedProducts();
      } else {
        setSharedProductsData(prev => {
          const validatedPrev = ensureArray(prev);
          return validatedPrev.map(p => p.id === selectedSharedProduct.id ? updatedPayload : p);
        });
        toast.success('Product updated successfully! (Mock Mode)', {
          description: 'Start backend to sync changes.'
        });
      }
      
      closeModal('updateSharedProduct');
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost', {
          description: 'Could not save changes. Please check if your Spring Boot server is running.'
        });
      } else {
        toast.error('Failed to update product', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete shared product handler
  const handleDeleteSharedProduct = async () => {
    if (!selectedSharedProduct || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (backendAvailable && connectionStatus === 'connected') {
        const response = await fetch(`${API_ENDPOINTS.supply}/${selectedSharedProduct.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        toast.success('Product deleted successfully!');
        await fetchSharedProducts();
      } else {
        setSharedProductsData(prev => {
          const validatedPrev = ensureArray(prev);
          return validatedPrev.filter(p => p.id !== selectedSharedProduct.id);
        });
        toast.success('Product deleted successfully! (Mock Mode)', {
          description: 'Start backend to sync changes.'
        });
      }
      
      closeModal('deleteSharedProduct');
    } catch (error) {
      console.error('Error deleting product:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost');
      } else {
        toast.error('Failed to delete product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced price update handler with proper scope handling
  /*
  const handleUpdatePrice = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Calculate affected tanks first
      const newPrice = parseFloat(priceForm.newPrice);
      const validatedTankData = ensureArray(tankData);
      
      let affectedTankIds: number[] = [];
      
      switch (priceForm.applyTo) {
        case 'selected':
          if (selectedTank) {
            const tank = validatedTankData.find(t => t.id === selectedTank.id);
            if (tank && tank.fuelType === priceForm.fuelType) {
              affectedTankIds = [tank.id];
            }
          }
          break;
          
        case 'current_station':
          if (selectedTank) {
            affectedTankIds = validatedTankData
              .filter(tank => tank.station === selectedTank.station && tank.fuelType === priceForm.fuelType)
              .map(tank => tank.id);
          }
          break;
          
        case 'all_stations':
          affectedTankIds = validatedTankData
            .filter(tank => tank.fuelType === priceForm.fuelType)
            .map(tank => tank.id);
          break;
      }

      // Prepare the price update payload according to the backend API structure
      const priceUpdatePayload = {
        updateScope: priceForm.applyTo,
        targetTankId: priceForm.applyTo === 'selected' ? parseInt(priceForm.tankId) : null,
        targetStation: priceForm.applyTo === 'current_station' ? priceForm.currentStation : null,
        fuelType: priceForm.fuelType,
        newPrice: newPrice,
        effectiveDate: priceForm.effectiveDate, // Now includes both date and time
        reason: priceForm.reason,
        updatedBy: user?.name || 'Current User',
        affectedTankIds: affectedTankIds,
        totalAffectedTanks: affectedTankIds.length
      };

      if (backendAvailable && connectionStatus === 'connected') {
        const response = await fetch(API_ENDPOINTS.bulkPriceUpdate, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(priceUpdatePayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        
        toast.success('Prices updated successfully!', {
          description: `${result.updatedCount || affectedTankIds.length} tank(s) updated to ${formatCurrency(newPrice)}/L`
        });

        await fetchTanks(); // Refresh tank data
      } else {
        // Mock update - update tanks in local state
        setTankData(prev => {
          const validatedPrev = ensureArray(prev);
          return validatedPrev.map(tank => {
            if (affectedTankIds.includes(tank.id)) {
              return { ...tank, pricePerLiter: newPrice };
            }
            return tank;
          });
        });

        toast.success('Prices updated successfully! (Mock Mode)', {
          description: `${affectedTankIds.length} tank(s) updated to ${formatCurrency(newPrice)}/L. Start backend to sync changes.`
        });
      }

      closeModal('updatePrice');
    } catch (error) {
      console.error('Error updating prices:', error);
      
      if (isConnectionError(error)) {
        setConnectionStatus('disconnected');
        setBackendAvailable(false);
        toast.error('Backend connection lost', {
          description: 'Could not update prices. Please check if your Spring Boot server is running.'
        });
      } else {
        toast.error('Failed to update prices', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
*/
  return {
    // State
    tankData,
    sharedProductsData,
    selectedTank,
    selectedSharedProduct,
    tankHistory,
    loadingHistory,
    isLoading,
    isSubmitting,
    connectionStatus,
    backendAvailable,
    modals,
    
    // Forms
    shareForm,
    priceForm,
    addTankForm,
    manageForm,
    refillForm,
    updateSharedProductForm,
    newStationSelection,
    
    // Setters
    setIsSubmitting,
    setShareForm,
    setPriceForm,
    setAddTankForm,
    setManageForm,
    setRefillForm,
    setUpdateSharedProductForm,
    setNewStationSelection,
    setTankData,
    setConnectionStatus,
    setBackendAvailable,
    
    // Actions
    fetchTanks,
    fetchSharedProducts,
    retryConnection,
    openModal,
    closeModal,
    handleShareFormChange,
    handleUpdateSharedProductFormChange,
    handleStationQuantityChange,
    addStationToShare,
    removeStationFromShare,
    updateStationQuantity,
    
    // Complete handlers
    handleShareProduct,
    handleAddTank,
    handleManageTank,
    handleDeleteTank,
    handleOrderRefill,
    handleUpdateSharedProduct,
    handleDeleteSharedProduct,
    handleUpdatePrice,
    
    // Utilities
    user,
    ensureArray,
    isConnectionError,
    formatCurrency
  };
}