/**
 * Custom hook for End of Month Report Management
 * Handles CRUD operations, data generation, approval workflows, and API integration
 * KTC Energy Management System
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import type {
  EndOfMonthReportData,
  EndOfMonthReportSubmission,
  EndOfMonthReportValidation,
  EndOfMonthReportApproval,
  EndOfMonthReportFilter,
  EndOfMonthReportResponse,
  EndOfMonthReportSingleResponse,
  EndOfMonthReportFormData,
  EndOfMonthReportTableRow,
  MonthlyReportAnalytics,
  MonthlyReportStatus,
  MonthlyComparisonData
} from '../types/endOfMonthReport';
import {
  SAMPLE_END_OF_MONTH_REPORTS,
  END_OF_MONTH_REPORT_ENDPOINTS,
  END_OF_MONTH_REPORT_MESSAGES,
  DEFAULT_MONTHLY_TOTALS,
  DEFAULT_PRICING_DATA,
  DEFAULT_PROFIT_ANALYSIS,
  DEFAULT_MONTHLY_TRENDS,
  DEFAULT_ANALYTICS
} from '../constants/endOfMonthReportConstants';
import {
  getCurrentMonthYear,
  generateAvailableMonths,
  formatCurrency,
  formatNumber
} from '../utils/dateUtils';

interface UseEndOfMonthReportReturn {
  // Data state
  reports: EndOfMonthReportData[];
  currentReport: EndOfMonthReportData | null;
  analytics: MonthlyReportAnalytics | null;
  comparisonData: MonthlyComparisonData[];
  
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
  filters: EndOfMonthReportFilter;
  
  // CRUD operations
  createReport: (data: EndOfMonthReportSubmission) => Promise<boolean>;
  updateReport: (id: string, data: Partial<EndOfMonthReportSubmission>) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  getReport: (id: string) => Promise<EndOfMonthReportData | null>;
  getReports: (filters?: EndOfMonthReportFilter, page?: number, limit?: number) => Promise<void>;
  
  // Report operations
  generateReport: (monthInfo: any, stationId: string) => Promise<EndOfMonthReportData | null>;
  approveReport: (id: string, approval: Omit<EndOfMonthReportApproval, 'reportId'>) => Promise<boolean>;
  publishReport: (id: string) => Promise<boolean>;
  archiveReport: (id: string) => Promise<boolean>;
  
  // Utility functions
  setFilters: (filters: Partial<EndOfMonthReportFilter>) => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  getAnalytics: () => Promise<void>;
  setComparisonData: (data: MonthlyComparisonData[]) => void;
  
  // Form helpers
  validateForm: (data: EndOfMonthReportFormData) => boolean;
  resetForm: () => EndOfMonthReportFormData;
}

// Mock API service
class EndOfMonthReportAPI {
  private static async mockDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getReports(filters?: EndOfMonthReportFilter, page: number = 1, limit: number = 10): Promise<EndOfMonthReportResponse> {
    await this.mockDelay(800);
    
    let filteredData = [...SAMPLE_END_OF_MONTH_REPORTS];
    
    // Apply filters
    if (filters?.stationId) {
      filteredData = filteredData.filter(report => report.stationId === filters.stationId);
    }
    if (filters?.status) {
      filteredData = filteredData.filter(report => report.status === filters.status);
    }
    if (filters?.month) {
      filteredData = filteredData.filter(report => report.monthInfo.month === filters.month);
    }
    if (filters?.year) {
      filteredData = filteredData.filter(report => report.monthInfo.year === filters.year);
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

  static async getReport(id: string): Promise<EndOfMonthReportSingleResponse> {
    await this.mockDelay(500);
    
    const report = SAMPLE_END_OF_MONTH_REPORTS.find(r => r.id === id);
    
    if (!report) {
      return {
        success: false,
        data: {} as EndOfMonthReportData,
        message: END_OF_MONTH_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    return {
      success: true,
      data: report
    };
  }

  static async createReport(data: EndOfMonthReportSubmission): Promise<EndOfMonthReportSingleResponse> {
    await this.mockDelay(1200);
    
    const newReport: EndOfMonthReportData = {
      id: `eom-${Date.now()}`,
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'current-user'
    };
    
    SAMPLE_END_OF_MONTH_REPORTS.unshift(newReport);
    
    return {
      success: true,
      data: newReport,
      message: END_OF_MONTH_REPORT_MESSAGES.CREATED
    };
  }

  static async generateReport(monthInfo: any, stationId: string): Promise<EndOfMonthReportSingleResponse> {
    await this.mockDelay(1500);
    
    // Generate realistic monthly data based on patterns
    const totalPmsSales = 250000 + (Math.random() * 50000); // 250k-300k range
    const totalAgoSales = 600000 + (Math.random() * 100000); // 600k-700k range
    const pmsPrice = 17.00 + (Math.random() * 1.00); // 17.00-18.00
    const agoPrice = 19.00 + (Math.random() * 1.50); // 19.00-20.50
    
    // Generate weekly breakdown
    const weeklyBreakdown = [];
    for (let week = 1; week <= 4; week++) {
      const weekPms = totalPmsSales / 4 * (0.8 + Math.random() * 0.4); // ±20% variation
      const weekAgo = totalAgoSales / 4 * (0.8 + Math.random() * 0.4);
      const weekPmsPrice = pmsPrice + (Math.random() * 0.2 - 0.1); // ±0.1 variation
      const weekAgoPrice = agoPrice + (Math.random() * 0.2 - 0.1);
      
      weeklyBreakdown.push({
        weekNumber: week,
        period: `Week ${week}`,
        dateRange: `${(week-1)*7+1}-${Math.min(week*7, 31)} ${monthInfo.month.slice(0,3)}`,
        pms: {
          quantity: weekPms,
          price: weekPmsPrice,
          priceAdjustment: weekPmsPrice - pmsPrice,
          salesValue: weekPms * weekPmsPrice,
          dailyAverage: weekPms / 7
        },
        ago: {
          quantity: weekAgo,
          price: weekAgoPrice,
          priceAdjustment: weekAgoPrice - agoPrice,
          salesValue: weekAgo * weekAgoPrice,
          dailyAverage: weekAgo / 7
        },
        totalSales: weekPms + weekAgo,
        totalValue: (weekPms * weekPmsPrice) + (weekAgo * weekAgoPrice)
      });
    }

    const newReport: EndOfMonthReportData = {
      id: `eom-${Date.now()}`,
      monthInfo: {
        ...monthInfo,
        totalDays: monthInfo.totalDays || 31,
        businessDays: monthInfo.businessDays || 22,
        timePeriod: `${monthInfo.month} ${monthInfo.year}`
      },
      stationId,
      stationName: `KTC Energy Station ${stationId.slice(-3)}`,
      monthlyTotals: {
        pms: {
          openingStock: 60000 + (Math.random() * 20000),
          supply: 30000 + (Math.random() * 15000),
          availableStock: 90000 + (Math.random() * 20000),
          salesCost: totalPmsSales,
          salesUnitPrice: totalPmsSales * pmsPrice,
          unitPrice: pmsPrice,
          closingStock: 20000 + (Math.random() * 15000),
          closingDispensing: 20000 + (Math.random() * 15000),
          undergroundGains: Math.random() * 500,
          pumpGains: Math.random() * 300
        },
        ago: {
          openingStock: 120000 + (Math.random() * 30000),
          supply: 65000 + (Math.random() * 20000),
          availableStock: 185000 + (Math.random() * 40000),
          salesCost: totalAgoSales,
          salesUnitPrice: totalAgoSales * agoPrice,
          unitPrice: agoPrice,
          closingStock: 60000 + (Math.random() * 20000),
          closingDispensing: 60000 + (Math.random() * 20000),
          undergroundGains: Math.random() * 800,
          pumpGains: Math.random() * 400
        },
        pms_value: {
          openingStock: (60000 + (Math.random() * 20000)) * pmsPrice,
          availableStock: (90000 + (Math.random() * 20000)) * pmsPrice,
          salesCost: totalPmsSales * pmsPrice * 0.95, // Slight cost adjustment
          salesUnitPrice: totalPmsSales * pmsPrice,
          undergroundGains: (Math.random() * 500) * pmsPrice,
          pumpGains: (Math.random() * 300) * pmsPrice
        },
        ago_value: {
          openingStock: (120000 + (Math.random() * 30000)) * agoPrice,
          availableStock: (185000 + (Math.random() * 40000)) * agoPrice,
          salesCost: totalAgoSales * agoPrice * 0.95,
          salesUnitPrice: totalAgoSales * agoPrice,
          undergroundGains: (Math.random() * 800) * agoPrice,
          pumpGains: (Math.random() * 400) * agoPrice
        }
      },
      weeklyBreakdown,
      pricingData: {
        pms: {
          basePrice: pmsPrice,
          averagePrice: pmsPrice + (Math.random() * 0.1),
          maxPrice: pmsPrice + 0.2,
          minPrice: pmsPrice - 0.1,
          priceVolatility: Math.random() * 1.0,
          weeklyPeriods: weeklyBreakdown.map(week => ({
            period: week.period,
            dateRange: week.dateRange,
            priceAdjustment: week.pms.priceAdjustment,
            quantity: week.pms.quantity,
            salesValue: week.pms.salesValue,
            effectivePrice: week.pms.price
          }))
        },
        ago: {
          basePrice: agoPrice,
          averagePrice: agoPrice + (Math.random() * 0.1),
          maxPrice: agoPrice + 0.3,
          minPrice: agoPrice - 0.2,
          priceVolatility: Math.random() * 1.5,
          weeklyPeriods: weeklyBreakdown.map(week => ({
            period: week.period,
            dateRange: week.dateRange,
            priceAdjustment: week.ago.priceAdjustment,
            quantity: week.ago.quantity,
            salesValue: week.ago.salesValue,
            effectivePrice: week.ago.price
          }))
        }
      },
      profitAnalysis: {
        totalRevenue: (totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice),
        totalCost: (totalPmsSales * pmsPrice * 0.8) + (totalAgoSales * agoPrice * 0.8), // 80% cost ratio
        grossProfit: ((totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice)) * 0.2, // 20% gross profit
        profitMargin: 20,
        operatingExpenses: ((totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice)) * 0.1,
        netProfit: ((totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice)) * 0.1,
        roi: 10 + (Math.random() * 5),
        breakdownByProduct: {
          pms: {
            revenue: totalPmsSales * pmsPrice,
            cost: totalPmsSales * pmsPrice * 0.8,
            profit: totalPmsSales * pmsPrice * 0.2,
            margin: 20,
            contribution: (totalPmsSales * pmsPrice) / ((totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice)) * 100
          },
          ago: {
            revenue: totalAgoSales * agoPrice,
            cost: totalAgoSales * agoPrice * 0.8,
            profit: totalAgoSales * agoPrice * 0.2,
            margin: 20,
            contribution: (totalAgoSales * agoPrice) / ((totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice)) * 100
          }
        }
      },
      trends: {
        previousMonthComparison: (Math.random() - 0.5) * 100000,
        previousMonthPercentChange: (Math.random() - 0.5) * 20,
        yearOverYearChange: (Math.random() - 0.3) * 30, // Slightly positive bias
        monthlyTrend: Math.random() > 0.5 ? 'up' : 'stable',
        seasonalPattern: 'normal',
        performance: totalPmsSales + totalAgoSales > 800000 ? 'excellent' : totalPmsSales + totalAgoSales > 700000 ? 'good' : 'average',
        forecastNextMonth: ((totalPmsSales * pmsPrice) + (totalAgoSales * agoPrice)) * (1 + (Math.random() * 0.1))
      },
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'current-user'
    };
    
    SAMPLE_END_OF_MONTH_REPORTS.unshift(newReport);
    
    return {
      success: true,
      data: newReport,
      message: END_OF_MONTH_REPORT_MESSAGES.GENERATED
    };
  }

  static async updateReport(id: string, data: Partial<EndOfMonthReportSubmission>): Promise<EndOfMonthReportSingleResponse> {
    await this.mockDelay(1000);
    
    const index = SAMPLE_END_OF_MONTH_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        data: {} as EndOfMonthReportData,
        message: END_OF_MONTH_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    const updatedReport = {
      ...SAMPLE_END_OF_MONTH_REPORTS[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    SAMPLE_END_OF_MONTH_REPORTS[index] = updatedReport;
    
    return {
      success: true,
      data: updatedReport,
      message: END_OF_MONTH_REPORT_MESSAGES.UPDATED
    };
  }

  static async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(800);
    
    const index = SAMPLE_END_OF_MONTH_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: END_OF_MONTH_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    SAMPLE_END_OF_MONTH_REPORTS.splice(index, 1);
    
    return {
      success: true,
      message: END_OF_MONTH_REPORT_MESSAGES.DELETED
    };
  }

  static async approveReport(id: string, approval: EndOfMonthReportApproval): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(1000);
    
    const index = SAMPLE_END_OF_MONTH_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: END_OF_MONTH_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    const newStatus: MonthlyReportStatus = approval.isApproved ? 'approved' : 'draft';
    
    SAMPLE_END_OF_MONTH_REPORTS[index] = {
      ...SAMPLE_END_OF_MONTH_REPORTS[index],
      status: newStatus,
      approvedBy: approval.approverId,
      approvedAt: approval.approvedAt,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: approval.isApproved ? END_OF_MONTH_REPORT_MESSAGES.APPROVED : END_OF_MONTH_REPORT_MESSAGES.REJECTED
    };
  }

  static async publishReport(id: string): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(800);
    
    const index = SAMPLE_END_OF_MONTH_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: END_OF_MONTH_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    SAMPLE_END_OF_MONTH_REPORTS[index] = {
      ...SAMPLE_END_OF_MONTH_REPORTS[index],
      status: 'published',
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: END_OF_MONTH_REPORT_MESSAGES.PUBLISHED
    };
  }
}

export const useEndOfMonthReport = (): UseEndOfMonthReportReturn => {
  const { user } = useAuth();
  
  // State management
  const [reports, setReports] = useState<EndOfMonthReportData[]>([]);
  const [currentReport, setCurrentReport] = useState<EndOfMonthReportData | null>(null);
  const [analytics, setAnalytics] = useState<MonthlyReportAnalytics | null>(null);
  const [comparisonData, setComparisonData] = useState<MonthlyComparisonData[]>([]);
  
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
  const [filters, setFiltersState] = useState<EndOfMonthReportFilter>({});

  // CRUD operations
  const createReport = useCallback(async (data: EndOfMonthReportSubmission): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.createReport(data);
      
      if (response.success) {
        setReports(prev => [response.data, ...prev]);
        toast.success(response.message || END_OF_MONTH_REPORT_MESSAGES.CREATED);
        return true;
      } else {
        setError(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
        toast.error(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
        return false;
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateReport = useCallback(async (id: string, data: Partial<EndOfMonthReportSubmission>): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.updateReport(id, data);
      
      if (response.success) {
        setReports(prev => prev.map(r => r.id === id ? response.data : r));
        if (currentReport?.id === id) {
          setCurrentReport(response.data);
        }
        toast.success(response.message || END_OF_MONTH_REPORT_MESSAGES.UPDATED);
        return true;
      } else {
        setError(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
        toast.error(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
        return false;
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [currentReport]);

  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.deleteReport(id);
      
      if (response.success) {
        setReports(prev => prev.filter(r => r.id !== id));
        if (currentReport?.id === id) {
          setCurrentReport(null);
        }
        toast.success(response.message);
        return true;
      } else {
        setError(response.message);
        toast.error(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentReport]);

  const getReport = useCallback(async (id: string): Promise<EndOfMonthReportData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.getReport(id);
      
      if (response.success) {
        setCurrentReport(response.data);
        return response.data;
      } else {
        setError(response.message || END_OF_MONTH_REPORT_MESSAGES.NOT_FOUND);
        return null;
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReports = useCallback(async (
    filterParams?: EndOfMonthReportFilter, 
    page: number = 1, 
    limit: number = 10
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.getReports(filterParams || filters, page, limit);
      
      if (response.success) {
        setReports(response.data);
        setTotalItems(response.total);
        setTotalPages(Math.ceil(response.total / limit));
        setCurrentPageState(page);
      } else {
        setError(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Report operations
  const generateReport = useCallback(async (monthInfo: any, stationId: string): Promise<EndOfMonthReportData | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.generateReport(monthInfo, stationId);
      
      if (response.success) {
        setReports(prev => [response.data, ...prev]);
        setCurrentReport(response.data);
        toast.success(response.message || END_OF_MONTH_REPORT_MESSAGES.GENERATED);
        return response.data;
      } else {
        setError(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
        toast.error(response.message || END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
        return null;
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const approveReport = useCallback(async (
    id: string, 
    approval: Omit<EndOfMonthReportApproval, 'reportId'>
  ): Promise<boolean> => {
    setIsApproving(true);
    setError(null);
    
    try {
      const fullApproval: EndOfMonthReportApproval = {
        ...approval,
        reportId: id
      };
      
      const response = await EndOfMonthReportAPI.approveReport(id, fullApproval);
      
      if (response.success) {
        const newStatus: MonthlyReportStatus = approval.isApproved ? 'approved' : 'draft';
        setReports(prev => prev.map(r => 
          r.id === id ? { 
            ...r, 
            status: newStatus, 
            approvedBy: approval.approverId,
            approvedAt: approval.approvedAt,
            updatedAt: new Date().toISOString() 
          } : r
        ));
        if (currentReport?.id === id) {
          setCurrentReport(prev => prev ? { 
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
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [currentReport]);

  const publishReport = useCallback(async (id: string): Promise<boolean> => {
    setIsPublishing(true);
    setError(null);
    
    try {
      const response = await EndOfMonthReportAPI.publishReport(id);
      
      if (response.success) {
        setReports(prev => prev.map(r => 
          r.id === id ? { ...r, status: 'published', updatedAt: new Date().toISOString() } : r
        ));
        if (currentReport?.id === id) {
          setCurrentReport(prev => prev ? { ...prev, status: 'published', updatedAt: new Date().toISOString() } : null);
        }
        toast.success(response.message);
        return true;
      } else {
        setError(response.message);
        toast.error(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [currentReport]);

  const archiveReport = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      setReports(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'archived', updatedAt: new Date().toISOString() } : r
      ));
      if (currentReport?.id === id) {
        setCurrentReport(prev => prev ? { ...prev, status: 'archived', updatedAt: new Date().toISOString() } : null);
      }
      toast.success('Report archived successfully');
      return true;
    } catch (err) {
      const errorMessage = END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentReport]);

  // Utility functions
  const setFilters = useCallback((newFilters: Partial<EndOfMonthReportFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  const setComparisonDataState = useCallback((data: MonthlyComparisonData[]) => {
    setComparisonData(data);
  }, []);

  const refreshData = useCallback(async () => {
    await getReports(filters, currentPage);
  }, [getReports, filters, currentPage]);

  const getAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const mockAnalytics: MonthlyReportAnalytics = {
        ...DEFAULT_ANALYTICS,
        totalReports: reports.length,
        averageMonthlySales: reports.reduce((sum, r) => sum + (r.monthlyTotals.pms.salesCost + r.monthlyTotals.ago.salesCost), 0) / (reports.length || 1),
        topPerformingMonths: comparisonData.slice(0, 3),
        bottomPerformingMonths: comparisonData.slice(-3)
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(END_OF_MONTH_REPORT_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [reports, comparisonData]);

  // Form helpers
  const validateForm = useCallback((data: EndOfMonthReportFormData): boolean => {
    const errors: Record<string, string> = {};
    
    if (!data.monthInfo?.month) errors.month = 'Month is required';
    if (!data.monthInfo?.year) errors.year = 'Year is required';
    if (!data.stationId) errors.stationId = 'Station is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const resetForm = useCallback((): EndOfMonthReportFormData => {
    return {
      monthInfo: {},
      stationId: '',
      monthlyTotals: DEFAULT_MONTHLY_TOTALS,
      weeklyBreakdown: [],
      pricingData: DEFAULT_PRICING_DATA,
      profitAnalysis: DEFAULT_PROFIT_ANALYSIS,
      trends: DEFAULT_MONTHLY_TRENDS,
      notes: ''
    };
  }, []);

  // Initialize data on mount
  useEffect(() => {
    getReports();
  }, []);

  return {
    // Data state
    reports,
    currentReport,
    analytics,
    comparisonData,
    
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
    createReport,
    updateReport,
    deleteReport,
    getReport,
    getReports,
    
    // Report operations
    generateReport,
    approveReport,
    publishReport,
    archiveReport,
    
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