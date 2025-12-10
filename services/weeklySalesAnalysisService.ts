/**
 * Weekly Sales Analysis Service
 * Handles API integration for weekly sales analysis data from backend
 * Endpoint: {{baseUrl}}/reports/weekly-analysis/{stationName}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface WeeklyAnalysisItem {
  week: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  pmsVolume: number;
  agoVolume: number;
  salesValue: number;
  previousWeekSales?: number;
  weeklyChange?: number;
  percentageChange?: number;
}

export interface WeeklySalesAnalysisResponse {
  stationName: string;
  analysisStartDate: string;
  analysisEndDate: string;
  totalSales: number;
  averageWeeklySales: number;
  bestWeekSales: number;
  worstWeekSales: number;
  totalGrowth: number;
  weeklyAnalysis: WeeklyAnalysisItem[];
}

export interface WeeklySalesAnalysisRequest {
  stationName: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}

class WeeklySalesAnalysisService {
  private getAuthHeaders(): HeadersInit {
    const user = localStorage.getItem('ktc_user');
    
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        const token = userData.token;
        
        if (token) {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.substring(0, 20)}...`
          };
          console.log('✅ Auth headers prepared:', headers);
          return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          };
        }
      } catch (error) {
        console.error('❌ Error parsing user data for auth headers:', error);
      }
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    return headers;
  }

  /**
   * Fetch weekly sales analysis from backend
   * @param stationName - Name of the station (e.g., "KTC KPONE")
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Promise<WeeklySalesAnalysisResponse>
   */
  async fetchWeeklySalesAnalysis(
    stationName: string,
    startDate: string,
    endDate: string
  ): Promise<WeeklySalesAnalysisResponse> {
    
    try {
      // Encode station name for URL
      const encodedStationName = encodeURIComponent(stationName);
      const url = `${BASE_URL}/reports/weekly-analysis/${encodedStationName}?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        bodyUsed: response.bodyUsed
      });
      
      if (!response.ok) {
        let errorData = null;
        try {
          if (!response.bodyUsed) {
            errorData = await response.json();
          }
        } catch (e) {
          console.warn('Could not parse error response:', e);
        }
        throw new Error(
          errorData?.message || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ Response data parsed:', {
        stationName: data.stationName,
        currentMonth: data.currentMonth,
        weeklyAnalysisLength: data.weeklyAnalysis?.length,
        referenceDate: data.referenceDate
      });
      // Return data directly since it matches the actual API structure
      // The interface mismatch was causing issues, so we'll handle it in transform methods
      return data;
    } catch (error) {
      
      throw new Error(
        error instanceof Error 
          ? `Failed to fetch weekly sales analysis: ${error.message}`
          : 'Unknown error occurred while fetching weekly sales analysis'
      );
    }
  }

  /**
   * Process and validate weekly sales data from API response
   */
  private processWeeklySalesData(data: WeeklySalesAnalysisResponse): WeeklySalesAnalysisResponse {
    
    // Validate required fields
    if (!data.stationName) {
      throw new Error('Invalid response: missing station name');
    }

    if (!Array.isArray(data.weeklyAnalysis)) {
      throw new Error('Invalid response: weekly analysis data is not an array');
    }

    // Calculate percentage changes for each week
    const processedWeeks = data.weeklyAnalysis.map((week, index) => {
      
      // Map API response fields to expected interface (handle any field names)
      const weekAny = week as any;
      const processedWeek: WeeklyAnalysisItem = {
        week: weekAny.week || `WEEK ${index + 1}`,
        startDate: weekAny.startDate || '',
        endDate: weekAny.endDate || '',
        // Map API field names to interface field names
        totalSales: Number(weekAny.salesLtrs || weekAny.totalSales) || 0,
        pmsVolume: Number(weekAny.pms || weekAny.pmsVolume) || 0,
        agoVolume: Number(weekAny.ago || weekAny.agoVolume) || 0,
        salesValue: Number(weekAny.salesValue) || 0
      };

      // Calculate week-over-week changes
      if (index > 0) {
        const previousWeek = data.weeklyAnalysis[index - 1] as any;
        const previousSales = Number(previousWeek.salesLtrs || previousWeek.totalSales) || 0;
        
        processedWeek.previousWeekSales = previousSales;
        processedWeek.weeklyChange = processedWeek.totalSales - previousSales;
        
        if (previousSales > 0) {
          processedWeek.percentageChange = 
            ((processedWeek.totalSales - previousSales) / previousSales) * 100;
        } else {
          processedWeek.percentageChange = 0;
        }
      }

      return processedWeek;
    });

    return {
      ...data,
      // Ensure numeric summary fields
      totalSales: Number(data.totalSales) || 0,
      averageWeeklySales: Number(data.averageWeeklySales) || 0,
      bestWeekSales: Number(data.bestWeekSales) || 0,
      worstWeekSales: Number(data.worstWeekSales) || 0,
      totalGrowth: Number(data.totalGrowth) || 0,
      weeklyAnalysis: processedWeeks
    };
  }

  /**
   * Get date range for a specific week of a month
   */
  getWeekDateRange(year: number, month: number, weekNumber: number): { startDate: string; endDate: string } {
    // Create first day of the month
    const firstDay = new Date(year, month - 1, 1);
    
    // Find the first Monday of the month or the first day if it's already Monday
    const firstDayOfWeek = firstDay.getDay();
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek) % 7;
    
    // Calculate the start of the specified week
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() + daysToFirstMonday + (weekNumber - 1) * 7);
    
    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Ensure we don't go beyond the current month for end date
    const lastDayOfMonth = new Date(year, month, 0);
    if (endOfWeek > lastDayOfMonth) {
      endOfWeek.setTime(lastDayOfMonth.getTime());
    }

    return {
      startDate: this.formatDate(startOfWeek),
      endDate: this.formatDate(endOfWeek)
    };
  }

  /**
   * Format date to YYYY-MM-DD format
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get station name from localStorage or default
   */
  getStationName(): string {
    try {
      const user = localStorage.getItem('ktc_user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.station?.stationName || 'KTC KPONE';
      }
    } catch (error) {
      console.error('Error getting station name from localStorage:', error);
    }
    
    return 'KTC KPONE'; // Default fallback
  }

  /**
   * Calculate date range for multiple weeks analysis
   */
  getMultiWeekDateRange(
    year: number,
    month: number,
    startWeek: number,
    endWeek: number
  ): { startDate: string; endDate: string } {
    const firstWeekRange = this.getWeekDateRange(year, month, startWeek);
    const lastWeekRange = this.getWeekDateRange(year, month, endWeek);
    
    return {
      startDate: firstWeekRange.startDate,
      endDate: lastWeekRange.endDate
    };
  }

  /**
   * Transform API response to component-friendly format
   */
  transformToTableData(apiResponse: WeeklySalesAnalysisResponse): Array<{
    month: string;
    week: string;
    timePeriod: string;
    totalSales: number;
    pms: number;
    ago: number;
    diffPms: number;
    diffAgo: number;
    overallDiff: number;
    percentChange: number;
    isHighlighted: boolean;
    bgColor: string;
    monthColor: string;
  }> {
    
    if (!apiResponse.weeklyAnalysis) return [];

    return apiResponse.weeklyAnalysis.map((week, index) => {
      
      // Handle flexible field names from actual API response
      const weekAny = week as any;
      
      // Use API provided month or extract from data
      const monthName = (weekAny.month || (apiResponse as any).currentMonth || 'UNKNOWN').toUpperCase();
      
      // Use API provided time period or construct one
      const timePeriod = weekAny.timePeriod || `${weekAny.week} ${monthName}`;
      
      // Calculate differences from previous week - use API values first
      const prevWeek = index > 0 ? apiResponse.weeklyAnalysis[index - 1] as any : null;
      const diffPms = weekAny.diffPms || (prevWeek ? (weekAny.pms || 0) - (prevWeek.pms || 0) : 0);
      const diffAgo = weekAny.diffAgo || (prevWeek ? (weekAny.ago || 0) - (prevWeek.ago || 0) : 0);
      const overallDiff = weekAny.differenceLtrs || (prevWeek ? (weekAny.salesLtrs || weekAny.totalSales || 0) - (prevWeek.salesLtrs || prevWeek.totalSales || 0) : 0);
      
      // Parse percentage change
      let percentChange = 0;
      if (weekAny.percentageChange) {
        const percentStr = weekAny.percentageChange.toString().replace('%', '');
        percentChange = parseFloat(percentStr) || 0;
      }

      const transformed = {
        month: monthName,
        week: weekAny.week || `WEEK ${index + 1}`,
        timePeriod,
        totalSales: weekAny.salesLtrs || weekAny.totalSales || 0,
        pms: weekAny.pms || weekAny.pmsVolume || 0,
        ago: weekAny.ago || weekAny.agoVolume || 0,
        diffPms,
        diffAgo,
        overallDiff,
        percentChange,
        isHighlighted: false,
        bgColor: '',
        monthColor: this.getMonthColor(monthName)
      };
      return transformed;
    });
  }

  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  private getMonthColor(month: string): string {
    const colorMap: { [key: string]: string } = {
      'JAN': 'bg-blue-200',
      'FEB': 'bg-purple-200',
      'MAR': 'bg-green-200',
      'APR': 'bg-yellow-200',
      'MAY': 'bg-orange-200',
      'JUN': 'bg-red-200',
      'JUL': 'bg-pink-200',
      'AUG': 'bg-indigo-200',
      'SEP': 'bg-teal-200',
      'OCT': 'bg-cyan-200',
      'NOV': 'bg-amber-200',
      'DEC': 'bg-emerald-200'
    };
    return colorMap[month] || 'bg-gray-200';
  }
}

export const weeklySalesAnalysisService = new WeeklySalesAnalysisService();