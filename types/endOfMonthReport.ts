/**
 * TypeScript type definitions for End of Month Report
 * KTC Energy Management System
 */

// Main data interfaces
export interface EndOfMonthReportData {
  id: string;
  monthInfo: MonthlyReportMonthInfo;
  stationId: string;
  stationName: string;
  monthlyTotals: MonthlyTotalsData;
  weeklyBreakdown: WeeklyBreakdownData[];
  pricingData: MonthlyPricingData;
  profitAnalysis: MonthlyProfitAnalysis;
  trends: MonthlyTrendData;
  status: MonthlyReportStatus;
  createdAt: string;
  updatedAt: string;
  analyzedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface MonthlyReportMonthInfo {
  month: string;
  year: number;
  monthIndex: number;
  dateRange: string;
  totalDays: number;
  businessDays: number;
  timePeriod: string;
}

export interface MonthlyTotalsData {
  pms: ProductMonthlyTotals;
  ago: ProductMonthlyTotals;
  rate?: ProductMonthlyTotals;
  pms_value: ProductValueTotals;
  ago_value: ProductValueTotals;
}

export interface ProductMonthlyTotals {
  openingStock: number;
  supply: number;
  availableStock: number;
  salesCost: number;
  salesUnitPrice: number;
  unitPrice: number;
  closingStock: number;
  closingDispensing: number;
  undergroundGains: number;
  pumpGains: number;
}

export interface ProductValueTotals {
  openingStock: number;
  availableStock: number;
  salesCost: number;
  salesUnitPrice: number;
  undergroundGains: number;
  pumpGains: number;
}

export interface WeeklyBreakdownData {
  weekNumber: number;
  period: string;
  dateRange: string;
  pms: WeeklyProductData;
  ago: WeeklyProductData;
  totalSales: number;
  totalValue: number;
}

export interface WeeklyProductData {
  quantity: number;
  price: number;
  priceAdjustment: number;
  salesValue: number;
  dailyAverage: number;
}

export interface MonthlyPricingData {
  pms: ProductPricingData;
  ago: ProductPricingData;
}

export interface ProductPricingData {
  basePrice: number;
  averagePrice: number;
  maxPrice: number;
  minPrice: number;
  priceVolatility: number;
  weeklyPeriods: WeeklyPricingPeriod[];
}

export interface WeeklyPricingPeriod {
  period: string;
  dateRange: string;
  priceAdjustment: number;
  quantity: number;
  salesValue: number;
  effectivePrice?: number;
}

export interface MonthlyProfitAnalysis {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  operatingExpenses: number;
  netProfit: number;
  roi: number;
  breakdownByProduct: {
    pms: ProductProfitData;
    ago: ProductProfitData;
  };
}

export interface ProductProfitData {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  contribution: number;
}

export interface MonthlyTrendData {
  previousMonthComparison: number;
  previousMonthPercentChange: number;
  yearOverYearChange: number;
  monthlyTrend: 'up' | 'down' | 'stable' | 'peak';
  seasonalPattern: string;
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  forecastNextMonth: number;
}

// Form and submission interfaces
export interface EndOfMonthReportSubmission {
  monthInfo: MonthlyReportMonthInfo;
  stationId: string;
  monthlyTotals: MonthlyTotalsData;
  weeklyBreakdown: WeeklyBreakdownData[];
  pricingData: MonthlyPricingData;
  profitAnalysis: MonthlyProfitAnalysis;
  trends: MonthlyTrendData;
  notes?: string;
}

export interface EndOfMonthReportFormData {
  monthInfo: Partial<MonthlyReportMonthInfo>;
  stationId: string;
  monthlyTotals: Partial<MonthlyTotalsData>;
  weeklyBreakdown: Partial<WeeklyBreakdownData>[];
  pricingData: Partial<MonthlyPricingData>;
  profitAnalysis: Partial<MonthlyProfitAnalysis>;
  trends: Partial<MonthlyTrendData>;
  notes: string;
}

// Status and workflow interfaces
export type MonthlyReportStatus = 
  | 'draft' 
  | 'generated' 
  | 'reviewed' 
  | 'approved' 
  | 'published' 
  | 'archived';

export interface EndOfMonthReportValidation {
  reportId: string;
  validatorId: string;
  isApproved: boolean;
  validatedAt: string;
  comments?: string;
  validationNotes?: string;
}

export interface EndOfMonthReportApproval {
  reportId: string;
  approverId: string;
  isApproved: boolean;
  approvedAt: string;
  approvalComments?: string;
  publicationDate?: string;
}

// Filter and pagination interfaces
export interface EndOfMonthReportFilter {
  stationId?: string;
  status?: MonthlyReportStatus;
  month?: string;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  performance?: string;
  trend?: string;
}

// API response interfaces
export interface EndOfMonthReportResponse {
  success: boolean;
  data: EndOfMonthReportData[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface EndOfMonthReportSingleResponse {
  success: boolean;
  data: EndOfMonthReportData;
  message?: string;
}

// Analytics and insights interfaces
export interface MonthlyReportAnalytics {
  totalReports: number;
  averageMonthlySales: number;
  topPerformingMonths: MonthlyComparisonData[];
  bottomPerformingMonths: MonthlyComparisonData[];
  salesTrends: MonthlySalesTrendSummary;
  productPerformance: MonthlyProductPerformanceSummary;
  stationComparison: MonthlyStationPerformanceData[];
}

export interface MonthlyComparisonData {
  monthNumber: number;
  month: string;
  year: number;
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

export interface MonthlySalesTrendSummary {
  overallTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate: number;
  consistency: number;
  seasonality: string;
  volatilityIndex: number;
}

export interface MonthlyProductPerformanceSummary {
  pmsPerformance: MonthlyProductPerformanceMetrics;
  agoPerformance: MonthlyProductPerformanceMetrics;
  productMix: MonthlyProductMixData;
}

export interface MonthlyProductPerformanceMetrics {
  averageVolume: number;
  averageValue: number;
  growthTrend: number;
  marketShareTrend: number;
  consistency: number;
}

export interface MonthlyProductMixData {
  pmsRatio: number;
  agoRatio: number;
  optimalMix: boolean;
  recommendations: string[];
}

export interface MonthlyStationPerformanceData {
  stationId: string;
  stationName: string;
  averageMonthlySales: number;
  rank: number;
  performanceRating: string;
  trend: string;
}

// Table row interface for display
export interface EndOfMonthReportTableRow {
  id: string;
  month: string;
  year: number;
  station: string;
  totalSales: number;
  pmsVolume: number;
  agoVolume: number;
  salesValue: number;
  growthRate: number;
  performance: string;
  trend: string;
  status: MonthlyReportStatus;
  createdAt: string;
}

// Export formats
export interface EndOfMonthReportExportData {
  reportType: 'end-of-month-report';
  reportData: EndOfMonthReportData;
  comparisonData: MonthlyComparisonData[];
  analytics: MonthlyReportAnalytics;
  exportFormat: 'pdf' | 'excel' | 'csv';
  generatedAt: string;
  generatedBy: string;
}

// Chart data interfaces
export interface MonthlySalesChartData {
  month: string;
  pmsVolume: number;
  agoVolume: number;
  totalSales: number;
  salesValue: number;
  trend: string;
  color: string;
}

export interface MonthlyTrendChartData {
  period: string;
  value: number;
  change: number;
  color: string;
  label: string;
}

// Utility types for calculations
export interface MonthlyCalculations {
  totalVolume: number;
  totalValue: number;
  averageDailyVolume: number;
  averageDailyValue: number;
  peakWeekVolume: number;
  lowestWeekVolume: number;
  volatilityIndex: number;
  consistencyScore: number;
}