/**
 * Constants for End of Month Report Management
 * KTC Energy Management System
 */

import type {
  EndOfMonthReportData,
  MonthlyTotalsData,
  MonthlyPricingData,
  MonthlyProfitAnalysis,
  MonthlyTrendData,
  MonthlyReportAnalytics,
  WeeklyBreakdownData,
  MonthlyProductPerformanceSummary,
  MonthlySalesTrendSummary,
  MonthlyStationPerformanceData
} from '../types/endOfMonthReport';

// API endpoints
export const END_OF_MONTH_REPORT_ENDPOINTS = {
  GET_REPORTS: '/api/reports/end-of-month',
  GET_REPORT: '/api/reports/end-of-month/:id',
  CREATE_REPORT: '/api/reports/end-of-month',
  UPDATE_REPORT: '/api/reports/end-of-month/:id',
  DELETE_REPORT: '/api/reports/end-of-month/:id',
  GENERATE_REPORT: '/api/reports/end-of-month/generate',
  APPROVE_REPORT: '/api/reports/end-of-month/:id/approve',
  PUBLISH_REPORT: '/api/reports/end-of-month/:id/publish',
  ARCHIVE_REPORT: '/api/reports/end-of-month/:id/archive',
  GET_ANALYTICS: '/api/reports/end-of-month/analytics'
};

// Messages
export const END_OF_MONTH_REPORT_MESSAGES = {
  CREATED: 'End of month report created successfully',
  UPDATED: 'End of month report updated successfully',
  DELETED: 'End of month report deleted successfully',
  GENERATED: 'End of month report generated successfully',
  APPROVED: 'End of month report approved successfully',
  REJECTED: 'End of month report rejected',
  PUBLISHED: 'End of month report published successfully',
  ARCHIVED: 'End of month report archived successfully',
  NOT_FOUND: 'End of month report not found',
  SERVER_ERROR: 'An error occurred while processing your request'
};

// Default data structures
export const DEFAULT_MONTHLY_TOTALS: MonthlyTotalsData = {
  pms: {
    openingStock: 0,
    supply: 0,
    availableStock: 0,
    salesCost: 0,
    salesUnitPrice: 0,
    unitPrice: 17.50,
    closingStock: 0,
    closingDispensing: 0,
    undergroundGains: 0,
    pumpGains: 0
  },
  ago: {
    openingStock: 0,
    supply: 0,
    availableStock: 0,
    salesCost: 0,
    salesUnitPrice: 0,
    unitPrice: 19.20,
    closingStock: 0,
    closingDispensing: 0,
    undergroundGains: 0,
    pumpGains: 0
  },
  rate: {
    openingStock: 0,
    supply: 0,
    availableStock: 0,
    salesCost: 0,
    salesUnitPrice: 0,
    unitPrice: 0,
    closingStock: 0,
    closingDispensing: 0,
    undergroundGains: 0,
    pumpGains: 0
  },
  pms_value: {
    openingStock: 0,
    availableStock: 0,
    salesCost: 0,
    salesUnitPrice: 0,
    undergroundGains: 0,
    pumpGains: 0
  },
  ago_value: {
    openingStock: 0,
    availableStock: 0,
    salesCost: 0,
    salesUnitPrice: 0,
    undergroundGains: 0,
    pumpGains: 0
  }
};

export const DEFAULT_PRICING_DATA: MonthlyPricingData = {
  pms: {
    basePrice: 17.50,
    averagePrice: 17.50,
    maxPrice: 17.50,
    minPrice: 17.50,
    priceVolatility: 0,
    weeklyPeriods: []
  },
  ago: {
    basePrice: 19.20,
    averagePrice: 19.20,
    maxPrice: 19.20,
    minPrice: 19.20,
    priceVolatility: 0,
    weeklyPeriods: []
  }
};

export const DEFAULT_PROFIT_ANALYSIS: MonthlyProfitAnalysis = {
  totalRevenue: 0,
  totalCost: 0,
  grossProfit: 0,
  profitMargin: 0,
  operatingExpenses: 0,
  netProfit: 0,
  roi: 0,
  breakdownByProduct: {
    pms: {
      revenue: 0,
      cost: 0,
      profit: 0,
      margin: 0,
      contribution: 0
    },
    ago: {
      revenue: 0,
      cost: 0,
      profit: 0,
      margin: 0,
      contribution: 0
    }
  }
};

export const DEFAULT_MONTHLY_TRENDS: MonthlyTrendData = {
  previousMonthComparison: 0,
  previousMonthPercentChange: 0,
  yearOverYearChange: 0,
  monthlyTrend: 'stable',
  seasonalPattern: 'normal',
  performance: 'average',
  forecastNextMonth: 0
};

export const DEFAULT_ANALYTICS: MonthlyReportAnalytics = {
  totalReports: 0,
  averageMonthlySales: 0,
  topPerformingMonths: [],
  bottomPerformingMonths: [],
  salesTrends: {
    overallTrend: 'stable',
    growthRate: 0,
    consistency: 0,
    seasonality: 'normal',
    volatilityIndex: 0
  },
  productPerformance: {
    pmsPerformance: {
      averageVolume: 0,
      averageValue: 0,
      growthTrend: 0,
      marketShareTrend: 0,
      consistency: 0
    },
    agoPerformance: {
      averageVolume: 0,
      averageValue: 0,
      growthTrend: 0,
      marketShareTrend: 0,
      consistency: 0
    },
    productMix: {
      pmsRatio: 50,
      agoRatio: 50,
      optimalMix: true,
      recommendations: []
    }
  },
  stationComparison: []
};

// Sample data for testing and mock API
export const SAMPLE_END_OF_MONTH_REPORTS: EndOfMonthReportData[] = [
  {
    id: 'eom-001',
    monthInfo: {
      month: 'JAN',
      year: 2025,
      monthIndex: 0,
      dateRange: '01 - 31/01/25',
      totalDays: 31,
      businessDays: 22,
      timePeriod: 'January 2025'
    },
    stationId: 'station-001',
    stationName: 'KTC Energy Station Accra',
    monthlyTotals: {
      pms: {
        openingStock: 62400.00,
        supply: 36000.00,
        availableStock: 98400.00,
        salesCost: 270500.11,
        salesUnitPrice: 4754285.12,
        unitPrice: 17.57,
        closingStock: 27899.89,
        closingDispensing: 28200.00,
        undergroundGains: 300.11,
        pumpGains: 154.05
      },
      ago: {
        openingStock: 126400.00,
        supply: 71400.00,
        availableStock: 197800.00,
        salesCost: 629819.18,
        salesUnitPrice: 12145687.45,
        unitPrice: 19.32,
        closingStock: 67980.82,
        closingDispensing: 68500.00,
        undergroundGains: 519.18,
        pumpGains: 212.60
      },
      pms_value: {
        openingStock: 1096880.00,
        availableStock: 1729280.00,
        salesCost: 4753285.43,
        salesUnitPrice: 4754285.12,
        undergroundGains: 5271.93,
        pumpGains: 2706.33
      },
      ago_value: {
        openingStock: 2443648.00,
        availableStock: 3823248.00,
        salesCost: 12169930.68,
        salesUnitPrice: 12145687.45,
        undergroundGains: 10030.28,
        pumpGains: 4111.07
      }
    },
    weeklyBreakdown: [
      {
        weekNumber: 1,
        period: 'Week 1',
        dateRange: '01-07 Jan',
        pms: {
          quantity: 63450.36,
          price: 17.50,
          priceAdjustment: 0.00,
          salesValue: 1110381.30,
          dailyAverage: 9064.34
        },
        ago: {
          quantity: 149128.97,
          price: 19.20,
          priceAdjustment: 0.00,
          salesValue: 2863276.22,
          dailyAverage: 21304.14
        },
        totalSales: 212579.33,
        totalValue: 3973657.52
      },
      {
        weekNumber: 2,
        period: 'Week 2',
        dateRange: '08-14 Jan',
        pms: {
          quantity: 65773.90,
          price: 17.55,
          priceAdjustment: 0.05,
          salesValue: 1154332.95,
          dailyAverage: 9396.27
        },
        ago: {
          quantity: 154691.34,
          price: 19.28,
          priceAdjustment: 0.08,
          salesValue: 2982436.23,
          dailyAverage: 22098.76
        },
        totalSales: 220465.24,
        totalValue: 4136769.18
      }
    ],
    pricingData: {
      pms: {
        basePrice: 17.50,
        averagePrice: 17.57,
        maxPrice: 17.65,
        minPrice: 17.50,
        priceVolatility: 0.43,
        weeklyPeriods: [
          {
            period: 'Week 1',
            dateRange: '01-07 Jan',
            priceAdjustment: 0.00,
            quantity: 63450.36,
            salesValue: 1110381.30,
            effectivePrice: 17.50
          }
        ]
      },
      ago: {
        basePrice: 19.20,
        averagePrice: 19.32,
        maxPrice: 19.44,
        minPrice: 19.20,
        priceVolatility: 0.62,
        weeklyPeriods: [
          {
            period: 'Week 1',
            dateRange: '01-07 Jan',
            priceAdjustment: 0.00,
            quantity: 149128.97,
            salesValue: 2863276.22,
            effectivePrice: 19.20
          }
        ]
      }
    },
    profitAnalysis: {
      totalRevenue: 16899972.57,
      totalCost: 13542216.11,
      grossProfit: 3357756.46,
      profitMargin: 19.87,
      operatingExpenses: 1689997.26,
      netProfit: 1667759.20,
      roi: 12.31,
      breakdownByProduct: {
        pms: {
          revenue: 4754285.12,
          cost: 3803428.10,
          profit: 950857.02,
          margin: 20.0,
          contribution: 28.13
        },
        ago: {
          revenue: 12145687.45,
          cost: 9738788.01,
          profit: 2406899.44,
          margin: 19.81,
          contribution: 71.87
        }
      }
    },
    trends: {
      previousMonthComparison: 1245630.45,
      previousMonthPercentChange: 8.2,
      yearOverYearChange: 15.7,
      monthlyTrend: 'up',
      seasonalPattern: 'strong',
      performance: 'excellent',
      forecastNextMonth: 17563245.88
    },
    status: 'published',
    createdAt: '2025-01-31T10:30:00Z',
    updatedAt: '2025-01-31T14:45:00Z',
    analyzedBy: 'user-001',
    approvedBy: 'admin-001',
    approvedAt: '2025-01-31T14:45:00Z'
  },
  {
    id: 'eom-002',
    monthInfo: {
      month: 'DEC',
      year: 2024,
      monthIndex: 11,
      dateRange: '01 - 31/12/24',
      totalDays: 31,
      businessDays: 21,
      timePeriod: 'December 2024'
    },
    stationId: 'station-001',
    stationName: 'KTC Energy Station Accra',
    monthlyTotals: {
      pms: {
        openingStock: 58200.00,
        supply: 42000.00,
        availableStock: 100200.00,
        salesCost: 261350.22,
        salesUnitPrice: 4523167.89,
        unitPrice: 17.31,
        closingStock: 38849.78,
        closingDispensing: 39200.00,
        undergroundGains: 350.22,
        pumpGains: 189.45
      },
      ago: {
        openingStock: 132400.00,
        supply: 68900.00,
        availableStock: 201300.00,
        salesCost: 607234.56,
        salesUnitPrice: 11687543.21,
        unitPrice: 19.25,
        closingStock: 94065.44,
        closingDispensing: 94500.00,
        undergroundGains: 434.56,
        pumpGains: 276.89
      },
      pms_value: {
        openingStock: 1007022.00,
        availableStock: 1734462.00,
        salesCost: 4522167.89,
        salesUnitPrice: 4523167.89,
        undergroundGains: 6061.31,
        pumpGains: 3279.53
      },
      ago_value: {
        openingStock: 2548700.00,
        availableStock: 3874525.00,
        salesCost: 11687543.21,
        salesUnitPrice: 11687543.21,
        undergroundGains: 8365.57,
        pumpGains: 5329.77
      }
    },
    weeklyBreakdown: [
      {
        weekNumber: 1,
        period: 'Week 1',
        dateRange: '01-07 Dec',
        pms: {
          quantity: 61234.45,
          price: 17.25,
          priceAdjustment: 0.00,
          salesValue: 1056294.26,
          dailyAverage: 8747.78
        },
        ago: {
          quantity: 145689.12,
          price: 19.15,
          priceAdjustment: 0.00,
          salesValue: 2789946.65,
          dailyAverage: 20812.73
        },
        totalSales: 206923.57,
        totalValue: 3846240.91
      }
    ],
    pricingData: DEFAULT_PRICING_DATA,
    profitAnalysis: DEFAULT_PROFIT_ANALYSIS,
    trends: {
      previousMonthComparison: -876543.21,
      previousMonthPercentChange: -5.4,
      yearOverYearChange: 11.2,
      monthlyTrend: 'down',
      seasonalPattern: 'holiday_dip',
      performance: 'good',
      forecastNextMonth: 17235467.89
    },
    status: 'approved',
    createdAt: '2024-12-31T09:15:00Z',
    updatedAt: '2024-12-31T16:30:00Z',
    analyzedBy: 'user-002'
  }
];

// Station data for dropdown
export const SAMPLE_STATIONS_FOR_REPORTS = [
  { id: 'station-001', name: 'KTC Energy Station Accra', code: 'ACC001' },
  { id: 'station-002', name: 'KTC Energy Station Kumasi', code: 'KUM001' },
  { id: 'station-003', name: 'KTC Energy Station Tamale', code: 'TAM001' },
  { id: 'station-004', name: 'KTC Energy Station Cape Coast', code: 'CC001' },
  { id: 'station-005', name: 'KTC Energy Station Sunyani', code: 'SUN001' }
];

// Validation rules
export const END_OF_MONTH_REPORT_VALIDATION_RULES = {
  monthInfo: {
    month: { required: true, minLength: 3, maxLength: 3 },
    year: { required: true, min: 2020, max: 2030 }
  },
  stationId: { required: true, minLength: 3 },
  monthlyTotals: {
    openingStock: { required: true, min: 0 },
    supply: { required: true, min: 0 },
    salesCost: { required: true, min: 0 }
  }
};

// Chart colors and themes
export const MONTHLY_CHART_COLORS = {
  pms: '#3B82F6', // Blue
  ago: '#10B981', // Green
  total: '#8B5CF6', // Purple
  revenue: '#F59E0B', // Amber
  profit: '#EF4444', // Red
  trend_up: '#22C55E', // Green
  trend_down: '#EF4444', // Red
  trend_stable: '#6B7280' // Gray
};

export const MONTH_COLORS = {
  JAN: '#3B82F6',
  FEB: '#8B5CF6',
  MAR: '#10B981',
  APR: '#F59E0B',
  MAY: '#EF4444',
  JUN: '#EC4899',
  JUL: '#06B6D4',
  AUG: '#84CC16',
  SEP: '#F97316',
  OCT: '#6366F1',
  NOV: '#14B8A6',
  DEC: '#F43F5E'
};