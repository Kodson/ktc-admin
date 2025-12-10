/**
 * Custom hook for Weekly Sales Analysis Management
 * Handles CRUD operations, data generation, approval workflows, and API integration
 * KTC Energy Management System
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import type {
  WeeklySalesAnalysisData,
  WeeklySalesAnalysisSubmission,
  WeeklySalesAnalysisValidation,
  WeeklySalesAnalysisApproval,
  WeeklySalesAnalysisFilter,
  WeeklySalesAnalysisResponse,
  WeeklySalesAnalysisSingleResponse,
  WeeklySalesAnalysisFormData,
  WeeklySalesAnalysisTableRow,
  WeeklySalesAnalytics,
  SalesAnalysisStatus,
  WeeklyComparisonData
} from '../types/weeklySalesAnalysis';
import {
  SAMPLE_WEEKLY_SALES_ANALYSIS,
  WEEKLY_SALES_ANALYSIS_ENDPOINTS,
  WEEKLY_SALES_ANALYSIS_MESSAGES,
  DEFAULT_SALES_METRICS,
  DEFAULT_PRODUCT_BREAKDOWN,
  DEFAULT_TREND_DATA,
  DEFAULT_ANALYTICS
} from '../constants/weeklySalesAnalysisConstants';
import {
  getCurrentWeekOfMonth,
  getCurrentMonthYear,
  generateAvailableMonths,
  generateWeeksForMonth,
  getWeekDateRange,
  getWeekTimePeriod
} from '../utils/dateUtils';
import { 
  weeklySalesAnalysisService, 
  WeeklySalesAnalysisResponse,
  WeeklyAnalysisItem 
} from '../services/weeklySalesAnalysisService';

interface UseWeeklySalesAnalysisReturn {
  // Data state
  analyses: WeeklySalesAnalysisData[];
  currentAnalysis: WeeklySalesAnalysisData | null;
  analytics: WeeklySalesAnalytics | null;
  comparisonData: WeeklyComparisonData[];
  
  // Backend data
  backendAnalysisData: WeeklySalesAnalysisResponse | null;
  
  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  isApproving: boolean;
  isPublishing: boolean;
  
  // Error states
  error: string | null;
  validationErrors: Record<string, string>;
  
  // Pagination and filtering
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filters: WeeklySalesAnalysisFilter;
  
  // CRUD operations
  createAnalysis: (data: WeeklySalesAnalysisSubmission) => Promise<boolean>;
  updateAnalysis: (id: string, data: Partial<WeeklySalesAnalysisSubmission>) => Promise<boolean>;
  deleteAnalysis: (id: string) => Promise<boolean>;
  getAnalysis: (id: string) => Promise<WeeklySalesAnalysisData | null>;
  getAnalyses: (filters?: WeeklySalesAnalysisFilter, page?: number, limit?: number) => Promise<void>;
  
  // Analysis operations
  generateAnalysis: (weekInfo: any, stationId: string) => Promise<WeeklySalesAnalysisData | null>;
  approveAnalysis: (id: string, approval: Omit<WeeklySalesAnalysisApproval, 'analysisId'>) => Promise<boolean>;
  publishAnalysis: (id: string) => Promise<boolean>;
  archiveAnalysis: (id: string) => Promise<boolean>;
  
  // Backend integration
  fetchBackendAnalysis: (stationName: string, startDate: string, endDate: string) => Promise<WeeklySalesAnalysisResponse | null>;
  
  // Utility functions
  setFilters: (filters: Partial<WeeklySalesAnalysisFilter>) => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  getAnalytics: () => Promise<void>;
  setComparisonData: (data: WeeklyComparisonData[]) => void;
  
  // Form helpers
  validateForm: (data: WeeklySalesAnalysisFormData) => boolean;
  resetForm: () => WeeklySalesAnalysisFormData;
}

// Mock API service
class WeeklySalesAnalysisAPI {
  private static async mockDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getAnalyses(filters?: WeeklySalesAnalysisFilter, page: number = 1, limit: number = 10): Promise<WeeklySalesAnalysisResponse> {
    await this.mockDelay(800);
    
    let filteredData = [...SAMPLE_WEEKLY_SALES_ANALYSIS];
    
    // Apply filters
    if (filters?.stationId) {
      filteredData = filteredData.filter(analysis => analysis.stationId === filters.stationId);
    }
    if (filters?.status) {
      filteredData = filteredData.filter(analysis => analysis.status === filters.status);
    }
    if (filters?.month) {
      filteredData = filteredData.filter(analysis => analysis.weekInfo.month === filters.month);
    }
    if (filters?.year) {
      filteredData = filteredData.filter(analysis => analysis.weekInfo.year === filters.year);
    }
    if (filters?.weekNumber) {
      filteredData = filteredData.filter(analysis => analysis.weekInfo.weekNumber === filters.weekNumber);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedData,
      total: filteredData.length,
      page,
      limit
    };
  }

  static async getAnalysis(id: string): Promise<WeeklySalesAnalysisSingleResponse> {
    await this.mockDelay(500);
    
    const analysis = SAMPLE_WEEKLY_SALES_ANALYSIS.find(a => a.id === id);
    
    if (!analysis) {
      return {
        success: false,
        data: {} as WeeklySalesAnalysisData,
        message: WEEKLY_SALES_ANALYSIS_MESSAGES.NOT_FOUND
      };
    }
    
    return {
      success: true,
      data: analysis
    };
  }

  static async createAnalysis(data: WeeklySalesAnalysisSubmission): Promise<WeeklySalesAnalysisSingleResponse> {
    await this.mockDelay(1200);
    
    const newAnalysis: WeeklySalesAnalysisData = {
      id: `wsa-${Date.now()}`,
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'current-user'
    };
    
    SAMPLE_WEEKLY_SALES_ANALYSIS.unshift(newAnalysis);
    
    return {
      success: true,
      data: newAnalysis,
      message: WEEKLY_SALES_ANALYSIS_MESSAGES.CREATED
    };
  }

  static async generateAnalysis(weekInfo: any, stationId: string): Promise<WeeklySalesAnalysisSingleResponse> {
    await this.mockDelay(1500);
    
    // Generate realistic sales data based on patterns
    const totalSales = 15000 + (Math.random() * 10000); // 15k-25k range
    const pmsRatio = 0.4 + (Math.random() * 0.2); // 40-60% PMS
    const pmsVolume = totalSales * pmsRatio;
    const agoVolume = totalSales - pmsVolume;
    
    const newAnalysis: WeeklySalesAnalysisData = {
      id: `wsa-${Date.now()}`,
      weekInfo,
      stationId,
      stationName: `KTC Energy Station ${stationId.slice(-3)}`,
      salesMetrics: {
        totalSales,
        totalVolume: totalSales * 3.2, // Approximate volume conversion
        averageDailySales: totalSales / 7,
        peakDaySales: totalSales * 0.18,
        lowestDaySales: totalSales * 0.12,
        salesValue: totalSales * 18.0, // Average price
        averageTransactionValue: 350 + (Math.random() * 100),
        totalTransactions: Math.round(totalSales / 350),
        profitMargin: 15 + (Math.random() * 5),
        revenueGrowth: (Math.random() - 0.5) * 20 // ±10% growth
      },
      productBreakdown: {
        pms: {
          volume: pmsVolume,
          value: pmsVolume * 17.50,
          averagePrice: 17.50,
          dailyAverage: pmsVolume / 7,
          marketShare: (pmsVolume / totalSales) * 100,
          growthRate: (Math.random() - 0.5) * 20,
          transactions: Math.round(pmsVolume / 350),
          variance: (Math.random() - 0.5) * 10
        },
        ago: {
          volume: agoVolume,
          value: agoVolume * 19.20,
          averagePrice: 19.20,
          dailyAverage: agoVolume / 7,
          marketShare: (agoVolume / totalSales) * 100,
          growthRate: (Math.random() - 0.5) * 20,
          transactions: Math.round(agoVolume / 350),
          variance: (Math.random() - 0.5) * 10
        },
        total: {
          volume: totalSales,
          value: totalSales * 18.35,
          averagePrice: 18.35,
          dailyAverage: totalSales / 7,
          marketShare: 100,
          growthRate: (Math.random() - 0.5) * 20,
          transactions: Math.round(totalSales / 350),
          variance: (Math.random() - 0.5) * 5
        }
      },
      trends: {
        weeklyComparison: [],
        previousWeekDifference: (Math.random() - 0.5) * 2000,
        previousWeekPercentChange: (Math.random() - 0.5) * 20,
        monthlyTrend: Math.random() > 0.5 ? 'up' : 'stable',
        seasonalPattern: 'normal',
        performance: totalSales > 20000 ? 'excellent' : totalSales > 18000 ? 'good' : 'average'
      },
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'current-user'
    };
    
    SAMPLE_WEEKLY_SALES_ANALYSIS.unshift(newAnalysis);
    
    return {
      success: true,
      data: newAnalysis,
      message: WEEKLY_SALES_ANALYSIS_MESSAGES.GENERATED
    };
  }

  static async updateAnalysis(id: string, data: Partial<WeeklySalesAnalysisSubmission>): Promise<WeeklySalesAnalysisSingleResponse> {
    await this.mockDelay(1000);
    
    const index = SAMPLE_WEEKLY_SALES_ANALYSIS.findIndex(a => a.id === id);
    
    if (index === -1) {
      return {
        success: false,
        data: {} as WeeklySalesAnalysisData,
        message: WEEKLY_SALES_ANALYSIS_MESSAGES.NOT_FOUND
      };
    }
    
    const updatedAnalysis = {
      ...SAMPLE_WEEKLY_SALES_ANALYSIS[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    SAMPLE_WEEKLY_SALES_ANALYSIS[index] = updatedAnalysis;
    
    return {
      success: true,
      data: updatedAnalysis,
      message: WEEKLY_SALES_ANALYSIS_MESSAGES.UPDATED
    };
  }

  static async deleteAnalysis(id: string): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(800);
    
    const index = SAMPLE_WEEKLY_SALES_ANALYSIS.findIndex(a => a.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: WEEKLY_SALES_ANALYSIS_MESSAGES.NOT_FOUND
      };
    }
    
    SAMPLE_WEEKLY_SALES_ANALYSIS.splice(index, 1);
    
    return {
      success: true,
      message: WEEKLY_SALES_ANALYSIS_MESSAGES.DELETED
    };
  }

  static async approveAnalysis(id: string, approval: WeeklySalesAnalysisApproval): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(1000);
    
    const index = SAMPLE_WEEKLY_SALES_ANALYSIS.findIndex(a => a.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: WEEKLY_SALES_ANALYSIS_MESSAGES.NOT_FOUND
      };
    }
    
    const newStatus: SalesAnalysisStatus = approval.isApproved ? 'approved' : 'draft';
    
    SAMPLE_WEEKLY_SALES_ANALYSIS[index] = {
      ...SAMPLE_WEEKLY_SALES_ANALYSIS[index],
      status: newStatus,
      approvedBy: approval.approverId,
      approvedAt: approval.approvedAt,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: approval.isApproved ? WEEKLY_SALES_ANALYSIS_MESSAGES.APPROVED : WEEKLY_SALES_ANALYSIS_MESSAGES.REJECTED
    };
  }

  static async publishAnalysis(id: string): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(800);
    
    const index = SAMPLE_WEEKLY_SALES_ANALYSIS.findIndex(a => a.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: WEEKLY_SALES_ANALYSIS_MESSAGES.NOT_FOUND
      };
    }
    
    SAMPLE_WEEKLY_SALES_ANALYSIS[index] = {
      ...SAMPLE_WEEKLY_SALES_ANALYSIS[index],
      status: 'published',
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: WEEKLY_SALES_ANALYSIS_MESSAGES.PUBLISHED
    };
  }
}

export const useWeeklySalesAnalysis = (): UseWeeklySalesAnalysisReturn => {
  const { user } = useAuth();
  
  // State management
  const [analyses, setAnalyses] = useState<WeeklySalesAnalysisData[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<WeeklySalesAnalysisData | null>(null);
  const [analytics, setAnalytics] = useState<WeeklySalesAnalytics | null>(null);
  const [comparisonData, setComparisonData] = useState<WeeklyComparisonData[]>([]);
  
  // Backend data state
  const [backendAnalysisData, setBackendAnalysisData] = useState<WeeklySalesAnalysisResponse | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pagination and filtering
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<WeeklySalesAnalysisFilter>({});

  // CRUD operations
  const createAnalysis = useCallback(async (data: WeeklySalesAnalysisSubmission): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.createAnalysis(data);
      
      if (response.success) {
        setAnalyses(prev => [response.data, ...prev]);
        toast.success(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.CREATED);
        return true;
      } else {
        setError(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
        toast.error(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
        return false;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateAnalysis = useCallback(async (id: string, data: Partial<WeeklySalesAnalysisSubmission>): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.updateAnalysis(id, data);
      
      if (response.success) {
        setAnalyses(prev => prev.map(a => a.id === id ? response.data : a));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(response.data);
        }
        toast.success(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.UPDATED);
        return true;
      } else {
        setError(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
        toast.error(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
        return false;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [currentAnalysis]);

  const deleteAnalysis = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.deleteAnalysis(id);
      
      if (response.success) {
        setAnalyses(prev => prev.filter(a => a.id !== id));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(null);
        }
        toast.success(response.message);
        return true;
      } else {
        setError(response.message);
        toast.error(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentAnalysis]);

  const getAnalysis = useCallback(async (id: string): Promise<WeeklySalesAnalysisData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.getAnalysis(id);
      
      if (response.success) {
        setCurrentAnalysis(response.data);
        return response.data;
      } else {
        setError(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.NOT_FOUND);
        return null;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAnalyses = useCallback(async (
    filterParams?: WeeklySalesAnalysisFilter, 
    page: number = 1, 
    limit: number = 10
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.getAnalyses(filterParams || filters, page, limit);
      
      if (response.success) {
        setAnalyses(response.data);
        setTotalItems(response.total);
        setTotalPages(Math.ceil(response.total / limit));
        setCurrentPageState(page);
      } else {
        setError(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Analysis operations
  const generateAnalysis = useCallback(async (weekInfo: any, stationId: string): Promise<WeeklySalesAnalysisData | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.generateAnalysis(weekInfo, stationId);
      
      if (response.success) {
        setAnalyses(prev => [response.data, ...prev]);
        setCurrentAnalysis(response.data);
        toast.success(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.GENERATED);
        return response.data;
      } else {
        setError(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
        toast.error(response.message || WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
        return null;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const approveAnalysis = useCallback(async (
    id: string, 
    approval: Omit<WeeklySalesAnalysisApproval, 'analysisId'>
  ): Promise<boolean> => {
    setIsApproving(true);
    setError(null);
    
    try {
      const fullApproval: WeeklySalesAnalysisApproval = {
        ...approval,
        analysisId: id
      };
      
      const response = await WeeklySalesAnalysisAPI.approveAnalysis(id, fullApproval);
      
      if (response.success) {
        const newStatus: SalesAnalysisStatus = approval.isApproved ? 'approved' : 'draft';
        setAnalyses(prev => prev.map(a => 
          a.id === id ? { 
            ...a, 
            status: newStatus, 
            approvedBy: approval.approverId,
            approvedAt: approval.approvedAt,
            updatedAt: new Date().toISOString() 
          } : a
        ));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(prev => prev ? { 
            ...prev, 
            status: newStatus,
            approvedBy: approval.approverId,
            approvedAt: approval.approvedAt,
            updatedAt: new Date().toISOString() 
          } : null);
        }
        toast.success(response.message);
        return true;
      } else {
        setError(response.message);
        toast.error(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [currentAnalysis]);

  const publishAnalysis = useCallback(async (id: string): Promise<boolean> => {
    setIsPublishing(true);
    setError(null);
    
    try {
      const response = await WeeklySalesAnalysisAPI.publishAnalysis(id);
      
      if (response.success) {
        setAnalyses(prev => prev.map(a => 
          a.id === id ? { ...a, status: 'published', updatedAt: new Date().toISOString() } : a
        ));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(prev => prev ? { ...prev, status: 'published', updatedAt: new Date().toISOString() } : null);
        }
        toast.success(response.message);
        return true;
      } else {
        setError(response.message);
        toast.error(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [currentAnalysis]);

  const archiveAnalysis = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      setAnalyses(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'archived', updatedAt: new Date().toISOString() } : a
      ));
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(prev => prev ? { ...prev, status: 'archived', updatedAt: new Date().toISOString() } : null);
      }
      toast.success('Analysis archived successfully');
      return true;
    } catch (err) {
      const errorMessage = WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentAnalysis]);

  // Backend integration
  const fetchBackendAnalysis = useCallback(async (
    stationName: string, 
    startDate: string, 
    endDate: string
  ): Promise<WeeklySalesAnalysisResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching backend weekly analysis data:', {
        stationName,
        startDate,
        endDate
      });
      
      const response = await weeklySalesAnalysisService.fetchWeeklySalesAnalysis(
        stationName, 
        startDate, 
        endDate
      );
      
      setBackendAnalysisData(response);
      
      // Transform backend data to comparison format
      console.log('🔧 Transforming backend data to comparison format...');
      const tableData = weeklySalesAnalysisService.transformToTableData(response);
      console.log('📋 Transform result:', {
        tableDataLength: tableData.length,
        firstRow: tableData[0],
        sampleData: tableData.slice(0, 2)
      });
      
      const mappedComparisonData = tableData.map((row, index) => ({
        weekNumber: index + 1,
        month: row.month,
        totalSales: row.totalSales,
        pmsVolume: row.pms,
        agoVolume: row.ago,
        salesValue: row.totalSales * 18.0, // Estimated value
        difference: row.overallDiff,
        percentChange: row.percentChange,
        trend: (row.percentChange > 5 ? 'up' : row.percentChange < -5 ? 'down' : 'stable') as 'up' | 'down' | 'stable' | 'peak',
        isHighlighted: false,
        bgColor: row.bgColor,
        monthColor: row.monthColor,
        timePeriod: row.timePeriod
      }));
      
      console.log('🎯 Setting comparison data:', {
        mappedLength: mappedComparisonData.length,
        firstMapped: mappedComparisonData[0]
      });
      
      setComparisonData(mappedComparisonData);
      
      console.log('✅ Backend analysis data fetched successfully:', {
        weeks: response.weeklyAnalysis?.length || 0,
        totalSales: response.totalSales,
        averageWeeklySales: response.averageWeeklySales
      });
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch weekly sales analysis from backend';
      setError(errorMessage);
      console.error('❌ Error fetching backend analysis:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Data generation functions (integration with existing WeeklySalesAnalysis logic)
  const generateWeeklySalesData = useCallback((selectedMonthData: any, selectedWeekData: any): WeeklyComparisonData[] => {
    if (!selectedMonthData || !selectedWeekData) return [];
    
    // Generate based on the same patterns as in the original component
    const monthKey = `${selectedMonthData.month.toLowerCase()}-${selectedMonthData.year}`;
    const baseValue = 15000 + (Math.random() * 5000);
    const weekNumber = selectedWeekData.weekNumber;
    
    const weeks = [];
    for (let i = Math.max(1, weekNumber - 2); i <= Math.min(4, weekNumber + 2); i++) {
      const variation = (Math.random() - 0.5) * 0.3;
      const totalSales = baseValue * (1 + variation);
      const pmsRatio = 0.4 + (Math.random() * 0.2);
      const pms = totalSales * pmsRatio;
      const ago = totalSales - pms;
      
      const isSelectedWeek = i === weekNumber;
      const timePeriod = getWeekTimePeriod(i, selectedMonthData.year, selectedMonthData.monthIndex);
      
      const prevWeekSales = i > 1 && weeks.length > 0 ? weeks[weeks.length - 1]?.totalSales : null;
      const difference = prevWeekSales !== null ? totalSales - prevWeekSales : 0;
      const percentChange = prevWeekSales !== null && prevWeekSales > 0 ? ((totalSales - prevWeekSales) / prevWeekSales) * 100 : 0;

      weeks.push({
        weekNumber: i,
        month: selectedMonthData.month,
        totalSales: Number(totalSales.toFixed(2)),
        pmsVolume: Number(pms.toFixed(2)),
        agoVolume: Number(ago.toFixed(2)),
        salesValue: Number((totalSales * 18.0).toFixed(2)),
        difference: Number(difference.toFixed(2)),
        percentChange: Number(percentChange.toFixed(2)),
        trend: Math.random() > 0.5 ? 'up' : 'stable' as 'up' | 'down' | 'stable' | 'peak',
        isHighlighted: isSelectedWeek,
        bgColor: isSelectedWeek ? 'bg-yellow-100' : '',
        monthColor: 'bg-blue-200',
        timePeriod
      });
    }
    
    return weeks;
  }, []);

  const generateChartData = useCallback((tableData: WeeklyComparisonData[]) => {
    return tableData.map((week, index) => ({
      week: `${week.month.slice(0, 3)} W${week.weekNumber}`,
      value: week.totalSales,
      color: week.isHighlighted ? 'bg-yellow-500' : (week.trend === 'peak' ? 'bg-purple-500' : 'bg-blue-500')
    }));
  }, []);

  // Utility functions
  const setFilters = useCallback((newFilters: Partial<WeeklySalesAnalysisFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  const setComparisonDataState = useCallback((data: WeeklyComparisonData[]) => {
    setComparisonData(data);
  }, []);

  const refreshData = useCallback(async () => {
    await getAnalyses(filters, currentPage);
  }, [getAnalyses, filters, currentPage]);

  const getAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const mockAnalytics: WeeklySalesAnalytics = {
        ...DEFAULT_ANALYTICS,
        totalAnalyses: analyses.length,
        averageWeeklySales: analyses.reduce((sum, a) => sum + a.salesMetrics.totalSales, 0) / (analyses.length || 1),
        topPerformingWeeks: comparisonData.slice(0, 3),
        bottomPerformingWeeks: comparisonData.slice(-3)
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(WEEKLY_SALES_ANALYSIS_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [analyses, comparisonData]);

  // Form helpers
  const validateForm = useCallback((data: WeeklySalesAnalysisFormData): boolean => {
    const errors: Record<string, string> = {};
    
    if (!data.weekInfo?.month) errors.month = 'Month is required';
    if (!data.weekInfo?.year) errors.year = 'Year is required';
    if (!data.stationId) errors.stationId = 'Station is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const resetForm = useCallback((): WeeklySalesAnalysisFormData => {
    return {
      weekInfo: {},
      stationId: '',
      salesMetrics: DEFAULT_SALES_METRICS,
      productBreakdown: DEFAULT_PRODUCT_BREAKDOWN,
      trends: DEFAULT_TREND_DATA,
      notes: ''
    };
  }, []);

  // Initialize data on mount
  useEffect(() => {
    getAnalyses();
  }, []);

  return {
    // Data state
    analyses,
    currentAnalysis,
    analytics,
    comparisonData,
    
    // Backend data
    backendAnalysisData,
    
    // Loading states
    isLoading,
    isGenerating,
    isApproving,
    isPublishing,
    
    // Error states
    error,
    validationErrors,
    
    // Pagination and filtering
    currentPage,
    totalPages,
    totalItems,
    filters,
    
    // CRUD operations
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    getAnalysis,
    getAnalyses,
    
    // Analysis operations
    generateAnalysis,
    approveAnalysis,
    publishAnalysis,
    archiveAnalysis,
    
    // Backend integration
    fetchBackendAnalysis,
    
    // Utility functions
    setFilters,
    setCurrentPage,
    clearError,
    refreshData,
    getAnalytics,
    
    // Form helpers
    validateForm,
    resetForm,
    
    // Data setters
    setComparisonData: setComparisonDataState
  };
};