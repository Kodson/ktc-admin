/**
 * Weekly Report API Service
 * Handles API calls for fetching weekly station reports
 */

// API Response Types
export interface WeeklyReportSummary {
  salesProfit: number;
  salesValue: number;
  closingStockValue: number;
  ecash: string | number;
  expectedLodgement: number;
  winfall: string | number;
  momoShortageRefund: string | number;
  creditRefund: string | number;
  actualLodgement: number;
  availableStockValue: number;
  shortfall: string | number;
  undergroundGainsLoss: number;
  advances: number;
  expectedProfit: number;
  saleClosingStock: number;
  openingStockValue: number;
  difference: number;
  totalSupplyValue: number;
  credit: string | number;
  advanceRefund: number;
}

export interface StationTotals {
  salesUnitPrice: {
    totalSales: number;
  } | number[] | { [key: string]: number } | number;
  openingStock: number;
  salesCost: number;
  availableStock: number;
  closingDispensing: number;
  closingStock: number;
  pumpGains: number;
  supply: number;
  undergroundGains: number;
}

export interface WeeklyReportTotals {
  pms_rate: StationTotals;
  total: StationTotals;
  pms: StationTotals;
  ago: StationTotals;
  ago_value: StationTotals;
  ago_rate: StationTotals;
  pms_value: StationTotals;
  totalValues: StationTotals;
}

export interface WeeklyReportApiResponse {
  summary: WeeklyReportSummary;
  totals: WeeklyReportTotals;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get authentication token from localStorage
 * @returns string | null - JWT token or null if not found
 */
function getAuthToken(): string | null {
  try {
    const ktcUser = localStorage.getItem('ktc_user');
    if (ktcUser) {
      const userData = JSON.parse(ktcUser);
      return userData.token || null;
    }
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
  }
  return null;
}

/**
 * Check if the current token is expired
 * @returns boolean - true if token is expired or invalid
 */
export function isTokenExpired(): boolean {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp && payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Get user information from token
 * @returns object with user info or null
 */
export function getUserFromToken(): { username?: string; role?: string; station?: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return {
      username: payload.sub || payload.username,
      role: payload.role,
      station: payload.station
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Fetch weekly report data from the backend
 * @param stationName - Name of the station (e.g., "KTC KPONE")
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise with the weekly report data
 */
export const fetchWeeklyReport = async (
  stationName: string,
  startDate: string,
  endDate: string
): Promise<WeeklyReportApiResponse> => {
  try {
    const url = `${API_BASE_URL}/reports/station/${encodeURIComponent(stationName)}?startDate=${startDate}&endDate=${endDate}`;
    
    console.log('Fetching weekly report from:', url);
    
    // Get authentication token
    const token = getAuthToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Request with authentication token');
      
      // Check if token might be expired (basic JWT payload check)
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTime) {
            console.warn('Token appears to be expired:', new Date(payload.exp * 1000));
          } else if (payload.exp) {
            console.log('Token expires at:', new Date(payload.exp * 1000));
          }
        }
      } catch (e) {
        console.warn('Could not parse token for expiration check');
      }
    } else {
      console.warn('No authentication token found - request may fail');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorText = await response.text();
        if (errorText) {
          errorDetails = ` - ${errorText}`;
        }
      } catch (e) {
        // Ignore if can't read response body
      }

      if (response.status === 401) {
        throw new Error(`Authentication failed (401). Token may be expired or invalid. Please login again.${errorDetails}`);
      } else if (response.status === 403) {
        throw new Error(`Access forbidden (403). User may not have permission to access station "${stationName}".${errorDetails}`);
      } else if (response.status === 404) {
        throw new Error(`Weekly report not found for station "${stationName}" in the specified date range.${errorDetails}`);
      } else {
        throw new Error(`HTTP error! status: ${response.status}${errorDetails}`);
      }
    }
    console.log('Weekly report response status:', response);
    const data = await response.json();
    
    console.log('Weekly report data received:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    throw new Error(`Failed to fetch weekly report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Helper function to safely extract sales unit price value
 * @param salesUnitPrice - The salesUnitPrice value from API
 * @returns number - The total sales value
 */
function extractSalesUnitPrice(salesUnitPrice: StationTotals['salesUnitPrice']): number {
  if (typeof salesUnitPrice === 'number') {
    return salesUnitPrice;
  } else if (Array.isArray(salesUnitPrice)) {
    return salesUnitPrice.reduce((sum, value) => sum + value, 0);
  } else if (salesUnitPrice && typeof salesUnitPrice === 'object') {
    if ('totalSales' in salesUnitPrice) {
      return salesUnitPrice.totalSales;
    }
    // Sum all numeric values in the object
    return Object.values(salesUnitPrice).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
  }
  return 0;
}

/**
 * Transform API response to match the component's expected data structure
 * @param apiData - Raw API response
 * @param startDate - Start date string for metadata
 * @param endDate - End date string for metadata
 * @returns Transformed data for the component
 */
export const transformWeeklyReportData = (
  apiData: WeeklyReportApiResponse,
  startDate: string,
  endDate: string
) => {
  const { summary, totals } = apiData;

  // Calculate week info from dates
  const startDateObj = new Date(startDate + 'T00:00:00');
  const endDateObj = new Date(endDate + 'T00:00:00');
  
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                     'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[startDateObj.getMonth()];
  
  // Calculate week number
  const firstDayOfMonth = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1);
  const daysSinceFirstDay = Math.floor((startDateObj.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysSinceFirstDay / 7) + 1;

  const dateRange = `(${formatDate(startDateObj)} - ${formatDate(endDateObj)})`;

  return {
    weekInfo: {
      month,
      week: `WEEK ${weekNumber}`,
      dateRange
    },
    
    // Transform totals to match component structure
    totals: {
      pms: {
        openingStock: totals.pms.openingStock,
        supply: totals.pms.supply,
        availableStock: totals.pms.availableStock,
        salesCost: totals.pms.salesCost,
        salesUnitPrice: extractSalesUnitPrice(totals.pms.salesUnitPrice),
        salesUnitPriceRaw: totals.pms.salesUnitPrice, // Keep raw structure for component
        unitPrice: extractSalesUnitPrice(totals.pms.salesUnitPrice) / (totals.pms.salesCost || 1), // Calculate unit price
        closingStock: totals.pms.closingStock,
        closingDispensing: totals.pms.closingDispensing,
        undergroundGains: totals.pms.undergroundGains,
        pumpGains: totals.pms.pumpGains
      },
      ago: {
        openingStock: totals.ago.openingStock,
        supply: totals.ago.supply,
        availableStock: totals.ago.availableStock,
        salesCost: totals.ago.salesCost,
        salesUnitPrice: extractSalesUnitPrice(totals.ago.salesUnitPrice),
        salesUnitPriceRaw: totals.ago.salesUnitPrice, // Keep raw structure for component
        unitPrice: extractSalesUnitPrice(totals.ago.salesUnitPrice) / (totals.ago.salesCost || 1), // Calculate unit price
        closingStock: totals.ago.closingStock,
        closingDispensing: totals.ago.closingDispensing,
        undergroundGains: totals.ago.undergroundGains,
        pumpGains: totals.ago.pumpGains
      },
      rate: {
        openingStock: totals.pms_rate.openingStock,
        supply: totals.pms_rate.supply,
        availableStock: totals.pms_rate.availableStock,
        salesCost: totals.pms_rate.salesCost,
        salesUnitPrice: extractSalesUnitPrice(totals.pms_rate.salesUnitPrice),
        salesUnitPriceRaw: totals.pms_rate.salesUnitPrice, // Keep raw structure for component
        closingStock: totals.pms_rate.closingStock,
        closingDispensing: totals.pms_rate.closingDispensing,
        undergroundGains: totals.pms_rate.undergroundGains,
        pumpGains: totals.pms_rate.pumpGains
      },
      pms_value: {
        openingStock: totals.pms_value.openingStock,
        supply: totals.pms_value.supply,
        availableStock: totals.pms_value.availableStock,
        salesCost: totals.pms_value.salesCost,
        salesUnitPrice: extractSalesUnitPrice(totals.pms_value.salesUnitPrice),
        salesUnitPriceRaw: totals.pms_value.salesUnitPrice, // Keep raw structure for component
        closingStock: totals.pms_value.closingStock,
        closingDispensing: totals.pms_value.closingDispensing,
        undergroundGains: totals.pms_value.undergroundGains,
        pumpGains: totals.pms_value.pumpGains
      },
      ago_value: {
        openingStock: totals.ago_value.openingStock,
        supply: totals.ago_value.supply,
        availableStock: totals.ago_value.availableStock,
        salesCost: totals.ago_value.salesCost,
        salesUnitPrice: extractSalesUnitPrice(totals.ago_value.salesUnitPrice),
        salesUnitPriceRaw: totals.ago_value.salesUnitPrice, // Keep raw structure for component
        closingStock: totals.ago_value.closingStock,
        closingDispensing: totals.ago_value.closingDispensing,
        undergroundGains: totals.ago_value.undergroundGains,
        pumpGains: totals.ago_value.pumpGains
      },
      total: {
        openingStock: totals.total.openingStock,
        supply: totals.total.supply,
        availableStock: totals.total.availableStock,
        salesCost: totals.total.salesCost,
        salesUnitPrice: extractSalesUnitPrice(totals.total.salesUnitPrice),
        salesUnitPriceRaw: totals.total.salesUnitPrice, // Keep raw structure for component
        closingStock: totals.total.closingStock,
        closingDispensing: totals.total.closingDispensing,
        undergroundGains: totals.total.undergroundGains,
        pumpGains: totals.total.pumpGains
      }
    },

    // Transform summary data
    summaryData: {
      openingStockValue: summary.openingStockValue,
      totalSupplyValue: summary.totalSupplyValue,
      availableStockValue: summary.availableStockValue,
      salesValue: summary.salesValue,
      closingStockValue: summary.closingStockValue,
      expectedProfit: summary.expectedProfit,
      salesProfit: summary.salesProfit,
      undergroundGains: summary.undergroundGainsLoss,
      winFallValue: typeof summary.winfall === 'number' ? summary.winfall : 0,
      profitMarginVariance: summary.difference,
      profitMarginPercentage: summary.salesValue > 0 ? (summary.salesProfit / summary.salesValue) * 100 : 0,
      operationalEfficiencyExpected: summary.expectedLodgement,
      operationalEfficiencyAdjusted: summary.actualLodgement,
      creditSales: typeof summary.credit === 'number' ? summary.credit : 0,
      actualVariance: summary.difference
    }
  };
};

/**
 * Get available stations list (if needed)
 * @returns Promise with list of available stations
 */
export const fetchStationsList = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.stations || [];
  } catch (error) {
    console.error('Error fetching stations list:', error);
    // Return default stations if API fails
    return ['KTC KPONE', 'Accra Central Station'];
  }
};