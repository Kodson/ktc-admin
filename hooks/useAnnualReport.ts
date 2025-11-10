/**
 * Custom hook for Annual Report Management
 * Handles CRUD operations, data generation, approval workflows, and API integration
 * KTC Energy Management System
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import type {
  AnnualReportData,
  AnnualReportSubmission,
  AnnualReportValidation,
  AnnualReportApproval,
  AnnualReportFilter,
  AnnualReportResponse,
  AnnualReportSingleResponse,
  AnnualReportFormData,
  AnnualReportTableRow,
  AnnualReportAnalytics,
  AnnualReportStatus,
  AnnualComparisonData
} from '../types/annualReport';
import {
  SAMPLE_ANNUAL_REPORTS,
  ANNUAL_REPORT_ENDPOINTS,
  ANNUAL_REPORT_MESSAGES,
  DEFAULT_ANNUAL_TOTALS,
  DEFAULT_ANNUAL_PRICING_DATA,
  DEFAULT_ANNUAL_PROFIT_ANALYSIS,
  DEFAULT_ANNUAL_TRENDS,
  DEFAULT_ANNUAL_ANALYTICS
} from '../constants/annualReportConstants';
import {
  formatCurrency,
  formatNumber
} from '../utils/dateUtils';

interface UseAnnualReportReturn {
  // Data state
  reports: AnnualReportData[];
  currentReport: AnnualReportData | null;
  analytics: AnnualReportAnalytics | null;
  comparisonData: AnnualComparisonData[];
  
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
  filters: AnnualReportFilter;
  
  // CRUD operations
  createReport: (data: AnnualReportSubmission) => Promise<boolean>;
  updateReport: (id: string, data: Partial<AnnualReportSubmission>) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  getReport: (id: string) => Promise<AnnualReportData | null>;
  getReports: (filters?: AnnualReportFilter, page?: number, limit?: number) => Promise<void>;
  
  // Report operations
  generateReport: (yearInfo: any, stationId: string) => Promise<AnnualReportData | null>;
  approveReport: (id: string, approval: Omit<AnnualReportApproval, 'reportId'>) => Promise<boolean>;
  publishReport: (id: string) => Promise<boolean>;
  archiveReport: (id: string) => Promise<boolean>;
  
  // Utility functions
  setFilters: (filters: Partial<AnnualReportFilter>) => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  getAnalytics: () => Promise<void>;
  setComparisonData: (data: AnnualComparisonData[]) => void;
  
  // Form helpers
  validateForm: (data: AnnualReportFormData) => boolean;
  resetForm: () => AnnualReportFormData;
}

// Mock API service
class AnnualReportAPI {
  private static async mockDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getReports(filters?: AnnualReportFilter, page: number = 1, limit: number = 10): Promise<AnnualReportResponse> {
    await this.mockDelay(800);
    
    let filteredData = [...SAMPLE_ANNUAL_REPORTS];
    
    // Apply filters
    if (filters?.stationId) {
      filteredData = filteredData.filter(report => report.stationId === filters.stationId);
    }
    if (filters?.status) {
      filteredData = filteredData.filter(report => report.status === filters.status);
    }
    if (filters?.year) {
      filteredData = filteredData.filter(report => report.yearInfo.year === filters.year);
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

  static async getReport(id: string): Promise<AnnualReportSingleResponse> {
    await this.mockDelay(500);
    
    const report = SAMPLE_ANNUAL_REPORTS.find(r => r.id === id);
    
    if (!report) {
      return {
        success: false,
        data: {} as AnnualReportData,
        message: ANNUAL_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    return {
      success: true,
      data: report
    };
  }

  static async createReport(data: AnnualReportSubmission): Promise<AnnualReportSingleResponse> {
    await this.mockDelay(1200);
    
    const newReport: AnnualReportData = {
      id: `annual-${Date.now()}`,
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'current-user'
    };
    
    SAMPLE_ANNUAL_REPORTS.unshift(newReport);
    
    return {
      success: true,
      data: newReport,
      message: ANNUAL_REPORT_MESSAGES.CREATED
    };
  }

  static async generateReport(yearInfo: any, stationId: string): Promise<AnnualReportSingleResponse> {
    await this.mockDelay(2000);
    
    const currentYear = new Date().getFullYear();
    const selectedYear = yearInfo.year;
    const isCurrentYear = selectedYear === currentYear;
    const completedMonths = isCurrentYear ? new Date().getMonth() + 1 : 12;
    
    // Generate realistic annual data based on patterns
    const baseYearlyPmsSales = 2800000 + (Math.random() * 800000); // 2.8M-3.6M range
    const baseYearlyAgoSales = 6800000 + (Math.random() * 1500000); // 6.8M-8.3M range
    const pmsPrice = 17.00 + (Math.random() * 1.00); // 17.00-18.00
    const agoPrice = 19.00 + (Math.random() * 1.50); // 19.00-20.50
    
    // Adjust for completed months if current year
    const adjustmentFactor = isCurrentYear ? completedMonths / 12 : 1;
    const actualPmsSales = baseYearlyPmsSales * adjustmentFactor;
    const actualAgoSales = baseYearlyAgoSales * adjustmentFactor;
    
    // Generate monthly breakdown
    const monthlyBreakdown = [];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const seasonalFactors = [1.1, 0.95, 0.88, 0.82, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2];
    
    for (let month = 0; month < (isCurrentYear ? completedMonths : 12); month++) {
      const seasonalFactor = seasonalFactors[month];
      const monthPms = (actualPmsSales / completedMonths) * seasonalFactor * (0.8 + Math.random() * 0.4);
      const monthAgo = (actualAgoSales / completedMonths) * seasonalFactor * (0.8 + Math.random() * 0.4);
      const monthPmsPrice = pmsPrice + (Math.random() * 0.3 - 0.15);
      const monthAgoPrice = agoPrice + (Math.random() * 0.3 - 0.15);
      
      monthlyBreakdown.push({
        month: monthNames[month],
        monthNumber: month + 1,
        year: selectedYear,
        dateRange: `01-${month === 1 ? '28' : '31'} ${monthNames[month].slice(0, 3)}`,
        pms: {
          quantity: monthPms,
          price: monthPmsPrice,
          priceAdjustment: monthPmsPrice - pmsPrice,
          salesValue: monthPms * monthPmsPrice,
          dailyAverage: monthPms / 30,
          growth: (Math.random() - 0.3) * 20 // -6% to +14% growth bias
        },
        ago: {
          quantity: monthAgo,
          price: monthAgoPrice,
          priceAdjustment: monthAgoPrice - agoPrice,
          salesValue: monthAgo * monthAgoPrice,
          dailyAverage: monthAgo / 30,
          growth: (Math.random() - 0.3) * 20
        },
        totalSales: monthPms + monthAgo,
        totalValue: (monthPms * monthPmsPrice) + (monthAgo * monthAgoPrice),
        growth: (Math.random() - 0.3) * 20,
        trend: Math.random() > 0.4 ? 'up' : Math.random() > 0.7 ? 'stable' : 'down'
      });
    }
    
    // Generate quarterly breakdown
    const quarterlyBreakdown = [];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterMonths = [
      ['JAN', 'FEB', 'MAR'],
      ['APR', 'MAY', 'JUN'],
      ['JUL', 'AUG', 'SEP'],
      ['OCT', 'NOV', 'DEC']
    ];
    
    for (let q = 0; q < 4; q++) {
      const quarterData = monthlyBreakdown.filter(m => 
        quarterMonths[q].includes(m.month)
      );
      
      if (quarterData.length > 0) {
        const totalPms = quarterData.reduce((sum, m) => sum + m.pms.quantity, 0);
        const totalAgo = quarterData.reduce((sum, m) => sum + m.ago.quantity, 0);
        const avgPmsPrice = quarterData.reduce((sum, m) => sum + m.pms.price, 0) / quarterData.length;
        const avgAgoPrice = quarterData.reduce((sum, m) => sum + m.ago.price, 0) / quarterData.length;
        
        quarterlyBreakdown.push({
          quarter: quarters[q],
          period: `${quarterMonths[q][0]}-${quarterMonths[q][2]}`,
          months: quarterMonths[q],
          pms: {
            quantity: totalPms,
            averagePrice: avgPmsPrice,
            salesValue: totalPms * avgPmsPrice,
            monthlyAverage: totalPms / quarterData.length,
            growth: (Math.random() - 0.2) * 15
          },
          ago: {
            quantity: totalAgo,
            averagePrice: avgAgoPrice,
            salesValue: totalAgo * avgAgoPrice,
            monthlyAverage: totalAgo / quarterData.length,
            growth: (Math.random() - 0.2) * 15
          },
          totalSales: totalPms + totalAgo,
          totalValue: (totalPms * avgPmsPrice) + (totalAgo * avgAgoPrice),
          growth: (Math.random() - 0.2) * 15,
          performance: totalPms + totalAgo > (actualPmsSales + actualAgoSales) / 4 * 1.1 ? 'excellent' : 
                      totalPms + totalAgo > (actualPmsSales + actualAgoSales) / 4 ? 'good' : 'average'
        });
      }
    }

    const totalRevenue = (actualPmsSales * pmsPrice) + (actualAgoSales * agoPrice);
    const totalCost = totalRevenue * 0.8; // 80% cost ratio
    const grossProfit = totalRevenue * 0.2; // 20% gross profit

    const newReport: AnnualReportData = {
      id: `annual-${Date.now()}`,
      yearInfo: {
        year: selectedYear,
        dateRange: `01/01/${selectedYear.toString().slice(-2)} - 31/12/${selectedYear.toString().slice(-2)}`,
        totalDays: selectedYear % 4 === 0 ? 366 : 365,
        businessDays: Math.floor((selectedYear % 4 === 0 ? 366 : 365) * 0.714), // ~71.4% business days
        completedMonths: completedMonths,
        timePeriod: `Year ${selectedYear}`
      },
      stationId,
      stationName: `KTC Energy Station ${stationId.slice(-3)}`,
      annualTotals: {
        pms: {
          openingStock: 60000 + (Math.random() * 20000),
          totalSupply: actualPmsSales * 1.2, // 20% more supply than sales
          availableStock: actualPmsSales * 1.3,
          totalSales: actualPmsSales,
          totalSalesValue: actualPmsSales * pmsPrice,
          averageUnitPrice: pmsPrice,
          closingStock: 20000 + (Math.random() * 15000),
          totalGains: Math.random() * 5000,
          averageMonthlySales: actualPmsSales / completedMonths,
          peakMonthSales: Math.max(...monthlyBreakdown.map(m => m.pms.quantity)),
          lowestMonthSales: Math.min(...monthlyBreakdown.map(m => m.pms.quantity))
        },
        ago: {
          openingStock: 120000 + (Math.random() * 30000),
          totalSupply: actualAgoSales * 1.2,
          availableStock: actualAgoSales * 1.3,
          totalSales: actualAgoSales,
          totalSalesValue: actualAgoSales * agoPrice,
          averageUnitPrice: agoPrice,
          closingStock: 60000 + (Math.random() * 20000),
          totalGains: Math.random() * 8000,
          averageMonthlySales: actualAgoSales / completedMonths,
          peakMonthSales: Math.max(...monthlyBreakdown.map(m => m.ago.quantity)),
          lowestMonthSales: Math.min(...monthlyBreakdown.map(m => m.ago.quantity))
        },
        pms_value: {
          openingStock: (60000 + (Math.random() * 20000)) * pmsPrice,
          totalSupply: actualPmsSales * 1.2 * pmsPrice,
          availableStock: actualPmsSales * 1.3 * pmsPrice,
          totalSales: actualPmsSales * pmsPrice,
          totalSalesValue: actualPmsSales * pmsPrice,
          totalGains: (Math.random() * 5000) * pmsPrice,
          averageMonthlyValue: (actualPmsSales * pmsPrice) / completedMonths
        },
        ago_value: {
          openingStock: (120000 + (Math.random() * 30000)) * agoPrice,
          totalSupply: actualAgoSales * 1.2 * agoPrice,
          availableStock: actualAgoSales * 1.3 * agoPrice,
          totalSales: actualAgoSales * agoPrice,
          totalSalesValue: actualAgoSales * agoPrice,
          totalGains: (Math.random() * 8000) * agoPrice,
          averageMonthlyValue: (actualAgoSales * agoPrice) / completedMonths
        }
      },
      monthlyBreakdown,
      quarterlyBreakdown,
      pricingData: {
        pms: {
          averagePrice: pmsPrice,
          maxPrice: pmsPrice + 0.5,
          minPrice: pmsPrice - 0.3,
          priceVolatility: Math.random() * 2.0,
          monthlyPeriods: monthlyBreakdown.map(month => ({
            month: month.month,
            period: month.month,
            averagePrice: month.pms.price,
            quantity: month.pms.quantity,
            salesValue: month.pms.salesValue,
            priceAdjustment: month.pms.priceAdjustment
          })),
          seasonalAdjustments: quarterlyBreakdown.map(quarter => ({
            season: quarter.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
            period: quarter.period,
            averagePrice: quarter.pms.averagePrice,
            priceVolatility: Math.random() * 1.5,
            seasonalFactor: 0.95 + Math.random() * 0.1
          }))
        },
        ago: {
          averagePrice: agoPrice,
          maxPrice: agoPrice + 0.8,
          minPrice: agoPrice - 0.5,
          priceVolatility: Math.random() * 2.5,
          monthlyPeriods: monthlyBreakdown.map(month => ({
            month: month.month,
            period: month.month,
            averagePrice: month.ago.price,
            quantity: month.ago.quantity,
            salesValue: month.ago.salesValue,
            priceAdjustment: month.ago.priceAdjustment
          })),
          seasonalAdjustments: quarterlyBreakdown.map(quarter => ({
            season: quarter.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
            period: quarter.period,
            averagePrice: quarter.ago.averagePrice,
            priceVolatility: Math.random() * 2.0,
            seasonalFactor: 0.95 + Math.random() * 0.1
          }))
        }
      },
      profitAnalysis: {
        totalRevenue: totalRevenue,
        totalCost: totalCost,
        grossProfit: grossProfit,
        profitMargin: 20,
        operatingExpenses: totalRevenue * 0.1,
        netProfit: totalRevenue * 0.1,
        roi: 10 + (Math.random() * 5),
        quarterlyBreakdown: quarterlyBreakdown.map(quarter => ({
          quarter: quarter.quarter,
          revenue: quarter.totalValue,
          cost: quarter.totalValue * 0.8,
          profit: quarter.totalValue * 0.2,
          margin: 20,
          growth: quarter.growth
        })),
        breakdownByProduct: {
          pms: {
            revenue: actualPmsSales * pmsPrice,
            cost: actualPmsSales * pmsPrice * 0.8,
            profit: actualPmsSales * pmsPrice * 0.2,
            margin: 20,
            contribution: (actualPmsSales * pmsPrice) / totalRevenue * 100,
            averageMonthlyProfit: (actualPmsSales * pmsPrice * 0.2) / completedMonths
          },
          ago: {
            revenue: actualAgoSales * agoPrice,
            cost: actualAgoSales * agoPrice * 0.8,
            profit: actualAgoSales * agoPrice * 0.2,
            margin: 20,
            contribution: (actualAgoSales * agoPrice) / totalRevenue * 100,
            averageMonthlyProfit: (actualAgoSales * agoPrice * 0.2) / completedMonths
          }
        }
      },
      trends: {
        previousYearComparison: (Math.random() - 0.2) * totalRevenue * 0.3,
        previousYearPercentChange: (Math.random() - 0.2) * 25,
        growthTrend: totalRevenue > 150000000 ? 'strong_growth' : totalRevenue > 120000000 ? 'growth' : 'stable',
        seasonalPattern: 'strong_q4_performance',
        performance: totalRevenue > 180000000 ? 'excellent' : totalRevenue > 150000000 ? 'good' : 'average',
        forecastNextYear: totalRevenue * (1 + (Math.random() * 0.2)),
        bestPerformingQuarter: quarterlyBreakdown.reduce((max, q) => q.totalValue > max.totalValue ? q : max, quarterlyBreakdown[0])?.quarter || 'Q1',
        worstPerformingQuarter: quarterlyBreakdown.reduce((min, q) => q.totalValue < min.totalValue ? q : min, quarterlyBreakdown[0])?.quarter || 'Q1',
        consistencyScore: 70 + (Math.random() * 25)
      },
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'current-user'
    };
    
    SAMPLE_ANNUAL_REPORTS.unshift(newReport);
    
    return {
      success: true,
      data: newReport,
      message: ANNUAL_REPORT_MESSAGES.GENERATED
    };
  }

  static async updateReport(id: string, data: Partial<AnnualReportSubmission>): Promise<AnnualReportSingleResponse> {
    await this.mockDelay(1000);
    
    const index = SAMPLE_ANNUAL_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        data: {} as AnnualReportData,
        message: ANNUAL_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    const updatedReport = {
      ...SAMPLE_ANNUAL_REPORTS[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    SAMPLE_ANNUAL_REPORTS[index] = updatedReport;
    
    return {
      success: true,
      data: updatedReport,
      message: ANNUAL_REPORT_MESSAGES.UPDATED
    };
  }

  static async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(800);
    
    const index = SAMPLE_ANNUAL_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: ANNUAL_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    SAMPLE_ANNUAL_REPORTS.splice(index, 1);
    
    return {
      success: true,
      message: ANNUAL_REPORT_MESSAGES.DELETED
    };
  }

  static async approveReport(id: string, approval: AnnualReportApproval): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(1000);
    
    const index = SAMPLE_ANNUAL_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: ANNUAL_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    const newStatus: AnnualReportStatus = approval.isApproved ? 'approved' : 'draft';
    
    SAMPLE_ANNUAL_REPORTS[index] = {
      ...SAMPLE_ANNUAL_REPORTS[index],
      status: newStatus,
      approvedBy: approval.approverId,
      approvedAt: approval.approvedAt,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: approval.isApproved ? ANNUAL_REPORT_MESSAGES.APPROVED : ANNUAL_REPORT_MESSAGES.REJECTED
    };
  }

  static async publishReport(id: string): Promise<{ success: boolean; message: string }> {
    await this.mockDelay(800);
    
    const index = SAMPLE_ANNUAL_REPORTS.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: ANNUAL_REPORT_MESSAGES.NOT_FOUND
      };
    }
    
    SAMPLE_ANNUAL_REPORTS[index] = {
      ...SAMPLE_ANNUAL_REPORTS[index],
      status: 'published',
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: ANNUAL_REPORT_MESSAGES.PUBLISHED
    };
  }
}

export const useAnnualReport = (): UseAnnualReportReturn => {
  const { user } = useAuth();
  
  // State management
  const [reports, setReports] = useState<AnnualReportData[]>([]);
  const [currentReport, setCurrentReport] = useState<AnnualReportData | null>(null);
  const [analytics, setAnalytics] = useState<AnnualReportAnalytics | null>(null);
  const [comparisonData, setComparisonData] = useState<AnnualComparisonData[]>([]);
  
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
  const [filters, setFiltersState] = useState<AnnualReportFilter>({});

  // CRUD operations
  const createReport = useCallback(async (data: AnnualReportSubmission): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await AnnualReportAPI.createReport(data);
      
      if (response.success) {
        setReports(prev => [response.data, ...prev]);
        toast.success(response.message || ANNUAL_REPORT_MESSAGES.CREATED);
        return true;
      } else {
        setError(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
        toast.error(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
        return false;
      }
    } catch (err) {
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateReport = useCallback(async (id: string, data: Partial<AnnualReportSubmission>): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await AnnualReportAPI.updateReport(id, data);
      
      if (response.success) {
        setReports(prev => prev.map(r => r.id === id ? response.data : r));
        if (currentReport?.id === id) {
          setCurrentReport(response.data);
        }
        toast.success(response.message || ANNUAL_REPORT_MESSAGES.UPDATED);
        return true;
      } else {
        setError(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
        toast.error(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
        return false;
      }
    } catch (err) {
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
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
      const response = await AnnualReportAPI.deleteReport(id);
      
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
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentReport]);

  const getReport = useCallback(async (id: string): Promise<AnnualReportData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AnnualReportAPI.getReport(id);
      
      if (response.success) {
        setCurrentReport(response.data);
        return response.data;
      } else {
        setError(response.message || ANNUAL_REPORT_MESSAGES.NOT_FOUND);
        return null;
      }
    } catch (err) {
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReports = useCallback(async (
    filterParams?: AnnualReportFilter, 
    page: number = 1, 
    limit: number = 10
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AnnualReportAPI.getReports(filterParams || filters, page, limit);
      
      if (response.success) {
        setReports(response.data);
        setTotalItems(response.total);
        setTotalPages(Math.ceil(response.total / limit));
        setCurrentPageState(page);
      } else {
        setError(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Report operations
  const generateReport = useCallback(async (yearInfo: any, stationId: string): Promise<AnnualReportData | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await AnnualReportAPI.generateReport(yearInfo, stationId);
      
      if (response.success) {
        setReports(prev => [response.data, ...prev]);
        setCurrentReport(response.data);
        toast.success(response.message || ANNUAL_REPORT_MESSAGES.GENERATED);
        return response.data;
      } else {
        setError(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
        toast.error(response.message || ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
        return null;
      }
    } catch (err) {
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const approveReport = useCallback(async (
    id: string, 
    approval: Omit<AnnualReportApproval, 'reportId'>
  ): Promise<boolean> => {
    setIsApproving(true);
    setError(null);
    
    try {
      const fullApproval: AnnualReportApproval = {
        ...approval,
        reportId: id
      };
      
      const response = await AnnualReportAPI.approveReport(id, fullApproval);
      
      if (response.success) {
        const newStatus: AnnualReportStatus = approval.isApproved ? 'approved' : 'draft';
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
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
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
      const response = await AnnualReportAPI.publishReport(id);
      
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
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
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
      toast.success('Annual report archived successfully');
      return true;
    } catch (err) {
      const errorMessage = ANNUAL_REPORT_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentReport]);

  // Utility functions
  const setFilters = useCallback((newFilters: Partial<AnnualReportFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  const setComparisonDataState = useCallback((data: AnnualComparisonData[]) => {
    setComparisonData(data);
  }, []);

  const refreshData = useCallback(async () => {
    await getReports(filters, currentPage);
  }, [getReports, filters, currentPage]);

  const getAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const mockAnalytics: AnnualReportAnalytics = {
        ...DEFAULT_ANNUAL_ANALYTICS,
        totalReports: reports.length,
        averageAnnualSales: reports.reduce((sum, r) => sum + (r.annualTotals.pms.totalSales + r.annualTotals.ago.totalSales), 0) / (reports.length || 1),
        topPerformingYears: comparisonData.slice(0, 3),
        bottomPerformingYears: comparisonData.slice(-3)
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(ANNUAL_REPORT_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [reports, comparisonData]);

  // Form helpers
  const validateForm = useCallback((data: AnnualReportFormData): boolean => {
    const errors: Record<string, string> = {};
    
    if (!data.yearInfo?.year) errors.year = 'Year is required';
    if (!data.stationId) errors.stationId = 'Station is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const resetForm = useCallback((): AnnualReportFormData => {
    return {
      yearInfo: {},
      stationId: '',
      annualTotals: DEFAULT_ANNUAL_TOTALS,
      monthlyBreakdown: [],
      quarterlyBreakdown: [],
      pricingData: DEFAULT_ANNUAL_PRICING_DATA,
      profitAnalysis: DEFAULT_ANNUAL_PROFIT_ANALYSIS,
      trends: DEFAULT_ANNUAL_TRENDS,
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
    setComparisonData: setComparisonDataState,
    
    // Form helpers
    validateForm,
    resetForm
  };
};