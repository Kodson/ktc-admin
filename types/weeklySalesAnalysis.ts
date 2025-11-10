/**
 * TypeScript type definitions for Weekly Sales Analysis
 * KTC Energy Management System
 */

// Main data interfaces
export interface WeeklySalesAnalysisData {
  id: string;
  weekInfo: WeeklyAnalysisWeekInfo;
  stationId: string;
  stationName: string;
  salesMetrics: WeeklySalesMetrics;
  productBreakdown: ProductSalesBreakdown;
  trends: SalesTrendData;
  status: SalesAnalysisStatus;
  createdAt: string;
  updatedAt: string;
  analyzedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface WeeklyAnalysisWeekInfo {
  month: string;
  week: string;
  weekNumber: number;
  year: number;
  monthIndex: number;
  dateRange: string;
  startDate: string;
  endDate: string;
  timePeriod: string;
}

export interface WeeklySalesMetrics {
  totalSales: number;
  totalVolume: number;
  averageDailySales: number;
  peakDaySales: number;
  lowestDaySales: number;
  salesValue: number;
  averageTransactionValue: number;
  totalTransactions: number;
  profitMargin: number;
  revenueGrowth: number;
}

export interface ProductSalesBreakdown {
  pms: ProductSalesData;
  ago: ProductSalesData;
  total: ProductSalesData;
}

export interface ProductSalesData {
  volume: number;
  value: number;
  averagePrice: number;
  dailyAverage: number;
  marketShare: number;
  growthRate: number;
  transactions: number;
  variance: number;
}

export interface SalesTrendData {
  weeklyComparison: WeeklyComparisonData[];
  previousWeekDifference: number;
  previousWeekPercentChange: number;
  monthlyTrend: 'up' | 'down' | 'stable' | 'peak';
  seasonalPattern: string;
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

export interface WeeklyComparisonData {
  weekNumber: number;
  month: string;
  totalSales: number;
  pmsVolume: number;
  agoVolume: number;
  salesValue: number;
  difference: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable' | 'peak';
  isHighlighted: boolean;
  bgColor: string;
  monthColor: string;
  timePeriod: string;
}

// Form and submission interfaces
export interface WeeklySalesAnalysisSubmission {
  weekInfo: WeeklyAnalysisWeekInfo;
  stationId: string;
  salesMetrics: WeeklySalesMetrics;
  productBreakdown: ProductSalesBreakdown;
  trends: SalesTrendData;
  notes?: string;
}

export interface WeeklySalesAnalysisFormData {
  weekInfo: Partial<WeeklyAnalysisWeekInfo>;
  stationId: string;
  salesMetrics: Partial<WeeklySalesMetrics>;
  productBreakdown: Partial<ProductSalesBreakdown>;
  trends: Partial<SalesTrendData>;
  notes: string;
}

// Status and workflow interfaces
export type SalesAnalysisStatus = 
  | 'draft' 
  | 'generated' 
  | 'reviewed' 
  | 'approved' 
  | 'published' 
  | 'archived';

export interface WeeklySalesAnalysisValidation {
  analysisId: string;
  validatorId: string;
  isApproved: boolean;
  validatedAt: string;
  comments?: string;
  validationNotes?: string;
}

export interface WeeklySalesAnalysisApproval {
  analysisId: string;
  approverId: string;
  isApproved: boolean;
  approvedAt: string;
  approvalComments?: string;
  publicationDate?: string;
}

// Filter and pagination interfaces
export interface WeeklySalesAnalysisFilter {
  stationId?: string;
  status?: SalesAnalysisStatus;
  month?: string;
  year?: number;
  weekNumber?: number;
  dateFrom?: string;
  dateTo?: string;
  performance?: string;
  trend?: string;
}

// API response interfaces
export interface WeeklySalesAnalysisResponse {
  success: boolean;
  data: WeeklySalesAnalysisData[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface WeeklySalesAnalysisSingleResponse {
  success: boolean;
  data: WeeklySalesAnalysisData;
  message?: string;
}

// Analytics and insights interfaces
export interface WeeklySalesAnalytics {
  totalAnalyses: number;
  averageWeeklySales: number;
  topPerformingWeeks: WeeklyComparisonData[];
  bottomPerformingWeeks: WeeklyComparisonData[];
  salesTrends: SalesTrendSummary;
  productPerformance: ProductPerformanceSummary;
  stationComparison: StationPerformanceData[];
}

export interface SalesTrendSummary {
  overallTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate: number;
  consistency: number;
  seasonality: string;
  volatilityIndex: number;
}

export interface ProductPerformanceSummary {
  pmsPerformance: ProductPerformanceMetrics;
  agoPerformance: ProductPerformanceMetrics;
  productMix: ProductMixData;
}

export interface ProductPerformanceMetrics {
  averageVolume: number;
  averageValue: number;
  growthTrend: number;
  marketShareTrend: number;
  consistency: number;
}

export interface ProductMixData {
  pmsRatio: number;
  agoRatio: number;
  optimalMix: boolean;
  recommendations: string[];
}

export interface StationPerformanceData {
  stationId: string;
  stationName: string;
  averageWeeklySales: number;
  rank: number;
  performanceRating: string;
  trend: string;
}

// Table row interface for display
export interface WeeklySalesAnalysisTableRow {
  id: string;
  week: string;
  month: string;
  station: string;
  totalSales: number;
  pmsVolume: number;
  agoVolume: number;
  salesValue: number;
  growthRate: number;
  performance: string;
  trend: string;
  status: SalesAnalysisStatus;
  createdAt: string;
}

// Export formats
export interface WeeklySalesAnalysisExportData {
  reportType: 'weekly-sales-analysis';
  analysisData: WeeklySalesAnalysisData;
  comparisonData: WeeklyComparisonData[];
  analytics: WeeklySalesAnalytics;
  exportFormat: 'pdf' | 'excel' | 'csv';
  generatedAt: string;
  generatedBy: string;
}

// Chart data interfaces
export interface SalesChartData {
  week: string;
  pmsVolume: number;
  agoVolume: number;
  totalSales: number;
  salesValue: number;
  trend: string;
  color: string;
}

export interface TrendChartData {
  period: string;
  value: number;
  change: number;
  color: string;
  label: string;
}