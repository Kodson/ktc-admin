/**
 * TypeScript type definitions for Annual Report
 * KTC Energy Management System
 */

// Main data interfaces
export interface AnnualReportData {
  id: string;
  yearInfo: AnnualReportYearInfo;
  stationId: string;
  stationName: string;
  annualTotals: AnnualTotalsData;
  monthlyBreakdown: MonthlyBreakdownData[];
  quarterlyBreakdown: QuarterlyBreakdownData[];
  pricingData: AnnualPricingData;
  profitAnalysis: AnnualProfitAnalysis;
  trends: AnnualTrendData;
  status: AnnualReportStatus;
  createdAt: string;
  updatedAt: string;
  analyzedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AnnualReportYearInfo {
  year: number;
  dateRange: string;
  totalDays: number;
  businessDays: number;
  completedMonths: number;
  timePeriod: string;
}

export interface AnnualTotalsData {
  pms: ProductAnnualTotals;
  ago: ProductAnnualTotals;
  rate?: ProductAnnualTotals;
  pms_value: ProductValueTotals;
  ago_value: ProductValueTotals;
}

export interface ProductAnnualTotals {
  openingStock: number;
  totalSupply: number;
  availableStock: number;
  totalSales: number;
  totalSalesValue: number;
  averageUnitPrice: number;
  closingStock: number;
  totalGains: number;
  averageMonthlySales: number;
  peakMonthSales: number;
  lowestMonthSales: number;
}

export interface ProductValueTotals {
  openingStock: number;
  totalSupply: number;
  availableStock: number;
  totalSales: number;
  totalSalesValue: number;
  totalGains: number;
  averageMonthlyValue: number;
}

export interface MonthlyBreakdownData {
  month: string;
  monthNumber: number;
  year: number;
  dateRange: string;
  pms: MonthlyProductData;
  ago: MonthlyProductData;
  totalSales: number;
  totalValue: number;
  growth: number;
  trend: 'up' | 'down' | 'stable' | 'peak';
}

export interface QuarterlyBreakdownData {
  quarter: string;
  period: string;
  months: string[];
  pms: QuarterlyProductData;
  ago: QuarterlyProductData;
  totalSales: number;
  totalValue: number;
  growth: number;
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

export interface MonthlyProductData {
  quantity: number;
  price: number;
  priceAdjustment: number;
  salesValue: number;
  dailyAverage: number;
  growth: number;
}

export interface QuarterlyProductData {
  quantity: number;
  averagePrice: number;
  salesValue: number;
  monthlyAverage: number;
  growth: number;
}

export interface AnnualPricingData {
  pms: ProductAnnualPricingData;
  ago: ProductAnnualPricingData;
}

export interface ProductAnnualPricingData {
  averagePrice: number;
  maxPrice: number;
  minPrice: number;
  priceVolatility: number;
  monthlyPeriods: MonthlyPricingPeriod[];
  seasonalAdjustments: SeasonalPricingData[];
}

export interface MonthlyPricingPeriod {
  month: string;
  period: string;
  averagePrice: number;
  quantity: number;
  salesValue: number;
  priceAdjustment: number;
}

export interface SeasonalPricingData {
  season: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  period: string;
  averagePrice: number;
  priceVolatility: number;
  seasonalFactor: number;
}

export interface AnnualProfitAnalysis {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  operatingExpenses: number;
  netProfit: number;
  roi: number;
  quarterlyBreakdown: QuarterlyProfitData[];
  breakdownByProduct: {
    pms: ProductProfitData;
    ago: ProductProfitData;
  };
}

export interface QuarterlyProfitData {
  quarter: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  growth: number;
}

export interface ProductProfitData {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  contribution: number;
  averageMonthlyProfit: number;
}

export interface AnnualTrendData {
  previousYearComparison: number;
  previousYearPercentChange: number;
  growthTrend: 'strong_growth' | 'growth' | 'stable' | 'decline' | 'strong_decline';
  seasonalPattern: string;
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  forecastNextYear: number;
  bestPerformingQuarter: string;
  worstPerformingQuarter: string;
  consistencyScore: number;
}

// Form and submission interfaces
export interface AnnualReportSubmission {
  yearInfo: AnnualReportYearInfo;
  stationId: string;
  annualTotals: AnnualTotalsData;
  monthlyBreakdown: MonthlyBreakdownData[];
  quarterlyBreakdown: QuarterlyBreakdownData[];
  pricingData: AnnualPricingData;
  profitAnalysis: AnnualProfitAnalysis;
  trends: AnnualTrendData;
  notes?: string;
}

export interface AnnualReportFormData {
  yearInfo: Partial<AnnualReportYearInfo>;
  stationId: string;
  annualTotals: Partial<AnnualTotalsData>;
  monthlyBreakdown: Partial<MonthlyBreakdownData>[];
  quarterlyBreakdown: Partial<QuarterlyBreakdownData>[];
  pricingData: Partial<AnnualPricingData>;
  profitAnalysis: Partial<AnnualProfitAnalysis>;
  trends: Partial<AnnualTrendData>;
  notes: string;
}

// Status and workflow interfaces
export type AnnualReportStatus = 
  | 'draft' 
  | 'generated' 
  | 'reviewed' 
  | 'approved' 
  | 'published' 
  | 'archived';

export interface AnnualReportValidation {
  reportId: string;
  validatorId: string;
  isApproved: boolean;
  validatedAt: string;
  comments?: string;
  validationNotes?: string;
}

export interface AnnualReportApproval {
  reportId: string;
  approverId: string;
  isApproved: boolean;
  approvedAt: string;
  approvalComments?: string;
  publicationDate?: string;
}

// Filter and pagination interfaces
export interface AnnualReportFilter {
  stationId?: string;
  status?: AnnualReportStatus;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  performance?: string;
  trend?: string;
}

// API response interfaces
export interface AnnualReportResponse {
  success: boolean;
  data: AnnualReportData[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface AnnualReportSingleResponse {
  success: boolean;
  data: AnnualReportData;
  message?: string;
}

// Analytics and insights interfaces
export interface AnnualReportAnalytics {
  totalReports: number;
  averageAnnualSales: number;
  topPerformingYears: AnnualComparisonData[];
  bottomPerformingYears: AnnualComparisonData[];
  salesTrends: AnnualSalesTrendSummary;
  productPerformance: AnnualProductPerformanceSummary;
  stationComparison: AnnualStationPerformanceData[];
}

export interface AnnualComparisonData {
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
  yearColor: string;
  timePeriod: string;
}

export interface AnnualSalesTrendSummary {
  overallTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate: number;
  consistency: number;
  yearOverYearChange: number;
  volatilityIndex: number;
}

export interface AnnualProductPerformanceSummary {
  pmsPerformance: AnnualProductPerformanceMetrics;
  agoPerformance: AnnualProductPerformanceMetrics;
  productMix: AnnualProductMixData;
}

export interface AnnualProductPerformanceMetrics {
  averageVolume: number;
  averageValue: number;
  growthTrend: number;
  marketShareTrend: number;
  consistency: number;
  seasonalVariability: number;
}

export interface AnnualProductMixData {
  pmsRatio: number;
  agoRatio: number;
  optimalMix: boolean;
  recommendations: string[];
  seasonalTrends: string[];
}

export interface AnnualStationPerformanceData {
  stationId: string;
  stationName: string;
  averageAnnualSales: number;
  rank: number;
  performanceRating: string;
  trend: string;
  yearOverYearGrowth: number;
}

// Table row interface for display
export interface AnnualReportTableRow {
  id: string;
  year: number;
  station: string;
  totalSales: number;
  pmsVolume: number;
  agoVolume: number;
  salesValue: number;
  growthRate: number;
  performance: string;
  trend: string;
  status: AnnualReportStatus;
  createdAt: string;
}

// Export formats
export interface AnnualReportExportData {
  reportType: 'annual-report';
  reportData: AnnualReportData;
  comparisonData: AnnualComparisonData[];
  analytics: AnnualReportAnalytics;
  exportFormat: 'pdf' | 'excel' | 'csv';
  generatedAt: string;
  generatedBy: string;
}

// Chart data interfaces
export interface AnnualSalesChartData {
  year: string;
  pmsVolume: number;
  agoVolume: number;
  totalSales: number;
  salesValue: number;
  trend: string;
  color: string;
}

export interface AnnualTrendChartData {
  period: string;
  value: number;
  change: number;
  color: string;
  label: string;
}

export interface MonthlyAnnualChartData {
  month: string;
  pmsVolume: number;
  agoVolume: number;
  totalSales: number;
  salesValue: number;
  growth: number;
  color: string;
}

export interface QuarterlyAnnualChartData {
  quarter: string;
  pmsVolume: number;
  agoVolume: number;
  totalSales: number;
  salesValue: number;
  growth: number;
  performance: string;
  color: string;
}

// Utility types for calculations
export interface AnnualCalculations {
  totalVolume: number;
  totalValue: number;
  averageMonthlyVolume: number;
  averageMonthlyValue: number;
  peakQuarterVolume: number;
  lowestQuarterVolume: number;
  volatilityIndex: number;
  consistencyScore: number;
  seasonalityIndex: number;
  growthConsistency: number;
}

// Seasonal analysis interfaces
export interface SeasonalAnalysisData {
  seasonalTrends: SeasonalTrendData[];
  bestPerformingSeason: string;
  worstPerformingSeason: string;
  seasonalVolatility: number;
  seasonalRecommendations: string[];
}

export interface SeasonalTrendData {
  season: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  name: string;
  months: string[];
  averageVolume: number;
  averageValue: number;
  growth: number;
  volatility: number;
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}