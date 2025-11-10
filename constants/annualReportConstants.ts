/**
 * Constants for Annual Report Management
 * KTC Energy Management System
 */

import type {
  AnnualReportData,
  AnnualTotalsData,
  AnnualPricingData,
  AnnualProfitAnalysis,
  AnnualTrendData,
  AnnualReportAnalytics,
  MonthlyBreakdownData,
  QuarterlyBreakdownData,
  AnnualProductPerformanceSummary,
  AnnualSalesTrendSummary,
  AnnualStationPerformanceData
} from '../types/annualReport';

// API endpoints
export const ANNUAL_REPORT_ENDPOINTS = {
  GET_REPORTS: '/api/reports/annual',
  GET_REPORT: '/api/reports/annual/:id',
  CREATE_REPORT: '/api/reports/annual',
  UPDATE_REPORT: '/api/reports/annual/:id',
  DELETE_REPORT: '/api/reports/annual/:id',
  GENERATE_REPORT: '/api/reports/annual/generate',
  APPROVE_REPORT: '/api/reports/annual/:id/approve',
  PUBLISH_REPORT: '/api/reports/annual/:id/publish',
  ARCHIVE_REPORT: '/api/reports/annual/:id/archive',
  GET_ANALYTICS: '/api/reports/annual/analytics'
};

// Messages
export const ANNUAL_REPORT_MESSAGES = {
  CREATED: 'Annual report created successfully',
  UPDATED: 'Annual report updated successfully',
  DELETED: 'Annual report deleted successfully',
  GENERATED: 'Annual report generated successfully',
  APPROVED: 'Annual report approved successfully',
  REJECTED: 'Annual report rejected',
  PUBLISHED: 'Annual report published successfully',
  ARCHIVED: 'Annual report archived successfully',
  NOT_FOUND: 'Annual report not found',
  SERVER_ERROR: 'An error occurred while processing your request'
};

// Default data structures
export const DEFAULT_ANNUAL_TOTALS: AnnualTotalsData = {
  pms: {
    openingStock: 0,
    totalSupply: 0,
    availableStock: 0,
    totalSales: 0,
    totalSalesValue: 0,
    averageUnitPrice: 17.50,
    closingStock: 0,
    totalGains: 0,
    averageMonthlySales: 0,
    peakMonthSales: 0,
    lowestMonthSales: 0
  },
  ago: {
    openingStock: 0,
    totalSupply: 0,
    availableStock: 0,
    totalSales: 0,
    totalSalesValue: 0,
    averageUnitPrice: 19.20,
    closingStock: 0,
    totalGains: 0,
    averageMonthlySales: 0,
    peakMonthSales: 0,
    lowestMonthSales: 0
  },
  rate: {
    openingStock: 0,
    totalSupply: 0,
    availableStock: 0,
    totalSales: 0,
    totalSalesValue: 0,
    averageUnitPrice: 0,
    closingStock: 0,
    totalGains: 0,
    averageMonthlySales: 0,
    peakMonthSales: 0,
    lowestMonthSales: 0
  },
  pms_value: {
    openingStock: 0,
    totalSupply: 0,
    availableStock: 0,
    totalSales: 0,
    totalSalesValue: 0,
    totalGains: 0,
    averageMonthlyValue: 0
  },
  ago_value: {
    openingStock: 0,
    totalSupply: 0,
    availableStock: 0,
    totalSales: 0,
    totalSalesValue: 0,
    totalGains: 0,
    averageMonthlyValue: 0
  }
};

export const DEFAULT_ANNUAL_PRICING_DATA: AnnualPricingData = {
  pms: {
    averagePrice: 17.50,
    maxPrice: 18.00,
    minPrice: 17.00,
    priceVolatility: 0,
    monthlyPeriods: [],
    seasonalAdjustments: []
  },
  ago: {
    averagePrice: 19.20,
    maxPrice: 20.00,
    minPrice: 18.50,
    priceVolatility: 0,
    monthlyPeriods: [],
    seasonalAdjustments: []
  }
};

export const DEFAULT_ANNUAL_PROFIT_ANALYSIS: AnnualProfitAnalysis = {
  totalRevenue: 0,
  totalCost: 0,
  grossProfit: 0,
  profitMargin: 0,
  operatingExpenses: 0,
  netProfit: 0,
  roi: 0,
  quarterlyBreakdown: [],
  breakdownByProduct: {
    pms: {
      revenue: 0,
      cost: 0,
      profit: 0,
      margin: 0,
      contribution: 0,
      averageMonthlyProfit: 0
    },
    ago: {
      revenue: 0,
      cost: 0,
      profit: 0,
      margin: 0,
      contribution: 0,
      averageMonthlyProfit: 0
    }
  }
};

export const DEFAULT_ANNUAL_TRENDS: AnnualTrendData = {
  previousYearComparison: 0,
  previousYearPercentChange: 0,
  growthTrend: 'stable',
  seasonalPattern: 'normal',
  performance: 'average',
  forecastNextYear: 0,
  bestPerformingQuarter: 'Q1',
  worstPerformingQuarter: 'Q1',
  consistencyScore: 0
};

export const DEFAULT_ANNUAL_ANALYTICS: AnnualReportAnalytics = {
  totalReports: 0,
  averageAnnualSales: 0,
  topPerformingYears: [],
  bottomPerformingYears: [],
  salesTrends: {
    overallTrend: 'stable',
    growthRate: 0,
    consistency: 0,
    yearOverYearChange: 0,
    volatilityIndex: 0
  },
  productPerformance: {
    pmsPerformance: {
      averageVolume: 0,
      averageValue: 0,
      growthTrend: 0,
      marketShareTrend: 0,
      consistency: 0,
      seasonalVariability: 0
    },
    agoPerformance: {
      averageVolume: 0,
      averageValue: 0,
      growthTrend: 0,
      marketShareTrend: 0,
      consistency: 0,
      seasonalVariability: 0
    },
    productMix: {
      pmsRatio: 40,
      agoRatio: 60,
      optimalMix: true,
      recommendations: [],
      seasonalTrends: []
    }
  },
  stationComparison: []
};

// Sample data for testing and mock API
export const SAMPLE_ANNUAL_REPORTS: AnnualReportData[] = [
  {
    id: 'annual-001',
    yearInfo: {
      year: 2024,
      dateRange: '01/01/24 - 31/12/24',
      totalDays: 366,
      businessDays: 261,
      completedMonths: 12,
      timePeriod: 'Year 2024'
    },
    stationId: 'station-001',
    stationName: 'KTC Energy Station Accra',
    annualTotals: {
      pms: {
        openingStock: 62400.00,
        totalSupply: 432000.00,
        availableStock: 494400.00,
        totalSales: 3246500.11,
        totalSalesValue: 57014342.35,
        averageUnitPrice: 17.57,
        closingStock: 27899.89,
        totalGains: 3605.16,
        averageMonthlySales: 270541.68,
        peakMonthSales: 320450.25,
        lowestMonthSales: 198320.45
      },
      ago: {
        openingStock: 126400.00,
        totalSupply: 856800.00,
        availableStock: 983200.00,
        totalSales: 7557830.16,
        totalSalesValue: 145748246.89,
        averageUnitPrice: 19.32,
        closingStock: 67980.82,
        totalGains: 6222.18,
        averageMonthlySales: 629819.18,
        peakMonthSales: 745680.32,
        lowestMonthSales: 485950.67
      },
      pms_value: {
        openingStock: 1096880.00,
        totalSupply: 7585280.00,
        availableStock: 8682160.00,
        totalSales: 57014342.35,
        totalSalesValue: 57014342.35,
        totalGains: 63345.16,
        averageMonthlyValue: 4751195.20
      },
      ago_value: {
        openingStock: 2443648.00,
        totalSupply: 16572576.00,
        availableStock: 19016224.00,
        totalSales: 145748246.89,
        totalSalesValue: 145748246.89,
        totalGains: 120182.27,
        averageMonthlyValue: 12145687.24
      }
    },
    monthlyBreakdown: [
      {
        month: 'JAN',
        monthNumber: 1,
        year: 2024,
        dateRange: '01-31 Jan',
        pms: {
          quantity: 270500.11,
          price: 17.57,
          priceAdjustment: 0.07,
          salesValue: 4754285.12,
          dailyAverage: 8725.81,
          growth: 8.2
        },
        ago: {
          quantity: 629819.18,
          price: 19.32,
          priceAdjustment: 0.12,
          salesValue: 12145687.45,
          dailyAverage: 20317.07,
          growth: 12.5
        },
        totalSales: 900319.29,
        totalValue: 16899972.57,
        growth: 10.8,
        trend: 'up'
      },
      {
        month: 'FEB',
        monthNumber: 2,
        year: 2024,
        dateRange: '01-29 Feb',
        pms: {
          quantity: 261350.22,
          price: 17.31,
          priceAdjustment: -0.26,
          salesValue: 4523167.89,
          dailyAverage: 9012.77,
          growth: -3.4
        },
        ago: {
          quantity: 607234.56,
          price: 19.25,
          priceAdjustment: -0.07,
          salesValue: 11687543.21,
          dailyAverage: 20939.81,
          growth: -3.6
        },
        totalSales: 868584.78,
        totalValue: 16210711.10,
        growth: -3.5,
        trend: 'down'
      }
    ],
    quarterlyBreakdown: [
      {
        quarter: 'Q1',
        period: 'Jan-Mar',
        months: ['JAN', 'FEB', 'MAR'],
        pms: {
          quantity: 812450.78,
          averagePrice: 17.42,
          salesValue: 14150891.56,
          monthlyAverage: 270816.93,
          growth: 5.8
        },
        ago: {
          quantity: 1845789.32,
          averagePrice: 19.28,
          salesValue: 35582015.67,
          monthlyAverage: 615263.11,
          growth: 7.2
        },
        totalSales: 2658240.10,
        totalValue: 49732907.23,
        growth: 6.7,
        performance: 'good'
      },
      {
        quarter: 'Q2',
        period: 'Apr-Jun',
        months: ['APR', 'MAY', 'JUN'],
        pms: {
          quantity: 789320.45,
          averagePrice: 17.68,
          salesValue: 13955437.56,
          monthlyAverage: 263106.82,
          growth: 3.2
        },
        ago: {
          quantity: 1798450.67,
          averagePrice: 19.45,
          salesValue: 34980867.52,
          monthlyAverage: 599483.56,
          growth: 4.1
        },
        totalSales: 2587771.12,
        totalValue: 48936305.08,
        growth: 3.8,
        performance: 'average'
      }
    ],
    pricingData: {
      pms: {
        averagePrice: 17.57,
        maxPrice: 18.15,
        minPrice: 17.05,
        priceVolatility: 3.14,
        monthlyPeriods: [
          {
            month: 'JAN',
            period: 'January',
            averagePrice: 17.57,
            quantity: 270500.11,
            salesValue: 4754285.12,
            priceAdjustment: 0.07
          }
        ],
        seasonalAdjustments: [
          {
            season: 'Q1',
            period: 'Jan-Mar',
            averagePrice: 17.42,
            priceVolatility: 2.8,
            seasonalFactor: 1.02
          }
        ]
      },
      ago: {
        averagePrice: 19.32,
        maxPrice: 20.25,
        minPrice: 18.75,
        priceVolatility: 3.89,
        monthlyPeriods: [
          {
            month: 'JAN',
            period: 'January',
            averagePrice: 19.32,
            quantity: 629819.18,
            salesValue: 12145687.45,
            priceAdjustment: 0.12
          }
        ],
        seasonalAdjustments: [
          {
            season: 'Q1',
            period: 'Jan-Mar',
            averagePrice: 19.28,
            priceVolatility: 3.1,
            seasonalFactor: 0.98
          }
        ]
      }
    },
    profitAnalysis: {
      totalRevenue: 202762589.24,
      totalCost: 162210071.39,
      grossProfit: 40552517.85,
      profitMargin: 20.0,
      operatingExpenses: 20276258.92,
      netProfit: 20276258.93,
      roi: 12.5,
      quarterlyBreakdown: [
        {
          quarter: 'Q1',
          revenue: 49732907.23,
          cost: 39786325.78,
          profit: 9946581.45,
          margin: 20.0,
          growth: 8.5
        }
      ],
      breakdownByProduct: {
        pms: {
          revenue: 57014342.35,
          cost: 45611473.88,
          profit: 11402868.47,
          margin: 20.0,
          contribution: 28.1,
          averageMonthlyProfit: 950239.04
        },
        ago: {
          revenue: 145748246.89,
          cost: 116598597.51,
          profit: 29149649.38,
          margin: 20.0,
          contribution: 71.9,
          averageMonthlyProfit: 2429137.45
        }
      }
    },
    trends: {
      previousYearComparison: 18245620.45,
      previousYearPercentChange: 9.9,
      growthTrend: 'growth',
      seasonalPattern: 'strong_q1_q4',
      performance: 'excellent',
      forecastNextYear: 223039048.16,
      bestPerformingQuarter: 'Q4',
      worstPerformingQuarter: 'Q2',
      consistencyScore: 87.5
    },
    status: 'published',
    createdAt: '2024-12-31T10:30:00Z',
    updatedAt: '2025-01-15T14:45:00Z',
    analyzedBy: 'user-001',
    approvedBy: 'admin-001',
    approvedAt: '2025-01-15T14:45:00Z'
  },
  {
    id: 'annual-002',
    yearInfo: {
      year: 2023,
      dateRange: '01/01/23 - 31/12/23',
      totalDays: 365,
      businessDays: 260,
      completedMonths: 12,
      timePeriod: 'Year 2023'
    },
    stationId: 'station-001',
    stationName: 'KTC Energy Station Accra',
    annualTotals: {
      pms: {
        openingStock: 58200.00,
        totalSupply: 398000.00,
        availableStock: 456200.00,
        totalSales: 2952450.33,
        totalSalesValue: 51089633.21,
        averageUnitPrice: 17.31,
        closingStock: 32150.67,
        totalGains: 3245.78,
        averageMonthlySales: 246037.53,
        peakMonthSales: 298650.45,
        lowestMonthSales: 189340.22
      },
      ago: {
        openingStock: 118900.00,
        totalSupply: 784500.00,
        availableStock: 903400.00,
        totalSales: 6889234.67,
        totalSalesValue: 132620267.83,
        averageUnitPrice: 19.25,
        closingStock: 62450.33,
        totalGains: 5678.90,
        averageMonthlySales: 574102.89,
        peakMonthSales: 685430.12,
        lowestMonthSales: 445670.34
      },
      pms_value: {
        openingStock: 1007022.00,
        totalSupply: 6889780.00,
        availableStock: 7896802.00,
        totalSales: 51089633.21,
        totalSalesValue: 51089633.21,
        totalGains: 56203.22,
        averageMonthlyValue: 4257469.43
      },
      ago_value: {
        openingStock: 2288675.00,
        totalSupply: 15100125.00,
        availableStock: 17388800.00,
        totalSales: 132620267.83,
        totalSalesValue: 132620267.83,
        totalGains: 109318.28,
        averageMonthlyValue: 11051688.99
      }
    },
    monthlyBreakdown: [],
    quarterlyBreakdown: [],
    pricingData: DEFAULT_ANNUAL_PRICING_DATA,
    profitAnalysis: DEFAULT_ANNUAL_PROFIT_ANALYSIS,
    trends: {
      previousYearComparison: 15234567.89,
      previousYearPercentChange: 9.1,
      growthTrend: 'growth',
      seasonalPattern: 'consistent',
      performance: 'good',
      forecastNextYear: 201542789.34,
      bestPerformingQuarter: 'Q3',
      worstPerformingQuarter: 'Q1',
      consistencyScore: 82.3
    },
    status: 'approved',
    createdAt: '2023-12-31T09:15:00Z',
    updatedAt: '2024-01-10T16:30:00Z',
    analyzedBy: 'user-002'
  }
];

// Station data for dropdown
export const SAMPLE_STATIONS_FOR_ANNUAL_REPORTS = [
  { id: 'station-001', name: 'KTC Energy Station Accra', code: 'ACC001' },
  { id: 'station-002', name: 'KTC Energy Station Kumasi', code: 'KUM001' },
  { id: 'station-003', name: 'KTC Energy Station Tamale', code: 'TAM001' },
  { id: 'station-004', name: 'KTC Energy Station Cape Coast', code: 'CC001' },
  { id: 'station-005', name: 'KTC Energy Station Sunyani', code: 'SUN001' }
];

// Validation rules
export const ANNUAL_REPORT_VALIDATION_RULES = {
  yearInfo: {
    year: { required: true, min: 2020, max: 2030 }
  },
  stationId: { required: true, minLength: 3 },
  annualTotals: {
    totalSales: { required: true, min: 0 },
    totalSalesValue: { required: true, min: 0 }
  }
};

// Chart colors and themes
export const ANNUAL_CHART_COLORS = {
  pms: '#3B82F6', // Blue
  ago: '#10B981', // Green
  total: '#8B5CF6', // Purple
  revenue: '#F59E0B', // Amber
  profit: '#EF4444', // Red
  trend_up: '#22C55E', // Green
  trend_down: '#EF4444', // Red
  trend_stable: '#6B7280', // Gray
  q1: '#3B82F6', // Blue
  q2: '#10B981', // Green
  q3: '#F59E0B', // Amber
  q4: '#EF4444' // Red
};

export const YEAR_COLORS = {
  2020: '#EF4444',
  2021: '#F59E0B',
  2022: '#10B981',
  2023: '#3B82F6',
  2024: '#8B5CF6',
  2025: '#EC4899'
};

// Available years for selection
export const AVAILABLE_YEARS = [
  { value: '2025', label: '2025', year: 2025 },
  { value: '2024', label: '2024', year: 2024 },
  { value: '2023', label: '2023', year: 2023 },
  { value: '2022', label: '2022', year: 2022 },
  { value: '2021', label: '2021', year: 2021 },
  { value: '2020', label: '2020', year: 2020 }
];

// Quarterly data patterns
export const QUARTERLY_PATTERNS = {
  Q1: { name: 'Q1 (Jan-Mar)', months: ['JAN', 'FEB', 'MAR'], seasonalFactor: 0.95 },
  Q2: { name: 'Q2 (Apr-Jun)', months: ['APR', 'MAY', 'JUN'], seasonalFactor: 0.88 },
  Q3: { name: 'Q3 (Jul-Sep)', months: ['JUL', 'AUG', 'SEP'], seasonalFactor: 1.08 },
  Q4: { name: 'Q4 (Oct-Dec)', months: ['OCT', 'NOV', 'DEC'], seasonalFactor: 1.12 }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  excellent: { min: 90, color: '#22C55E' },
  good: { min: 75, color: '#3B82F6' },
  average: { min: 60, color: '#F59E0B' },
  below_average: { min: 40, color: '#EF4444' },
  poor: { min: 0, color: '#DC2626' }
};