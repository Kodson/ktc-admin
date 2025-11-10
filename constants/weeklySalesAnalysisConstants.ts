/**
 * Constants for Weekly Sales Analysis
 * KTC Energy Management System
 */

import type { 
  WeeklySalesAnalysisData,
  WeeklySalesMetrics,
  ProductSalesBreakdown,
  SalesTrendData,
  WeeklyAnalysisWeekInfo,
  WeeklySalesAnalytics
} from '../types/weeklySalesAnalysis';

// Mock API endpoints
export const WEEKLY_SALES_ANALYSIS_ENDPOINTS = {
  GET_ALL: '/api/weekly-sales-analysis',
  GET_BY_ID: '/api/weekly-sales-analysis/:id',
  CREATE: '/api/weekly-sales-analysis',
  UPDATE: '/api/weekly-sales-analysis/:id',
  DELETE: '/api/weekly-sales-analysis/:id',
  GENERATE: '/api/weekly-sales-analysis/generate',
  APPROVE: '/api/weekly-sales-analysis/:id/approve',
  PUBLISH: '/api/weekly-sales-analysis/:id/publish',
  GET_ANALYTICS: '/api/weekly-sales-analysis/analytics',
  EXPORT: '/api/weekly-sales-analysis/export',
  GET_BY_STATION: '/api/weekly-sales-analysis/station/:stationId',
  GET_BY_WEEK: '/api/weekly-sales-analysis/week/:year/:month/:week',
  GET_TRENDS: '/api/weekly-sales-analysis/trends'
} as const;

// System messages
export const WEEKLY_SALES_ANALYSIS_MESSAGES = {
  CREATED: 'Weekly sales analysis created successfully',
  UPDATED: 'Weekly sales analysis updated successfully',
  DELETED: 'Weekly sales analysis deleted successfully',
  GENERATED: 'Weekly sales analysis generated successfully',
  APPROVED: 'Weekly sales analysis approved successfully',
  PUBLISHED: 'Weekly sales analysis published successfully',
  REJECTED: 'Weekly sales analysis rejected',
  NOT_FOUND: 'Weekly sales analysis not found',
  SERVER_ERROR: 'Server error occurred',
  VALIDATION_ERROR: 'Please check the form for errors',
  UNAUTHORIZED: 'You are not authorized to perform this action'
} as const;

// Default sales metrics for new analyses
export const DEFAULT_SALES_METRICS: WeeklySalesMetrics = {
  totalSales: 0,
  totalVolume: 0,
  averageDailySales: 0,
  peakDaySales: 0,
  lowestDaySales: 0,
  salesValue: 0,
  averageTransactionValue: 350,
  totalTransactions: 0,
  profitMargin: 15.0,
  revenueGrowth: 0
};

// Default product breakdown structure
export const DEFAULT_PRODUCT_BREAKDOWN: ProductSalesBreakdown = {
  pms: {
    volume: 0,
    value: 0,
    averagePrice: 17.50,
    dailyAverage: 0,
    marketShare: 45.0,
    growthRate: 0,
    transactions: 0,
    variance: 0
  },
  ago: {
    volume: 0,
    value: 0,
    averagePrice: 19.20,
    dailyAverage: 0,
    marketShare: 55.0,
    growthRate: 0,
    transactions: 0,
    variance: 0
  },
  total: {
    volume: 0,
    value: 0,
    averagePrice: 18.35,
    dailyAverage: 0,
    marketShare: 100.0,
    growthRate: 0,
    transactions: 0,
    variance: 0
  }
};

// Default trend data structure
export const DEFAULT_TREND_DATA: SalesTrendData = {
  weeklyComparison: [],
  previousWeekDifference: 0,
  previousWeekPercentChange: 0,
  monthlyTrend: 'stable',
  seasonalPattern: 'normal',
  performance: 'average'
};

// Sample weekly sales analysis data for development
export const SAMPLE_WEEKLY_SALES_ANALYSIS: WeeklySalesAnalysisData[] = [
  {
    id: 'wsa-001',
    weekInfo: {
      month: 'JAN',
      week: 'WEEK 4',
      weekNumber: 4,
      year: 2025,
      monthIndex: 0,
      dateRange: 'Jan 20 - Jan 26, 2025',
      startDate: '2025-01-20',
      endDate: '2025-01-26',
      timePeriod: '20th - 26th Jan'
    },
    stationId: 'station-001',
    stationName: 'KTC Energy Dzorwulu',
    salesMetrics: {
      totalSales: 18734.56,
      totalVolume: 59581.28,
      averageDailySales: 2676.37,
      peakDaySales: 3456.78,
      lowestDaySales: 2103.45,
      salesValue: 1063892.45,
      averageTransactionValue: 385.50,
      totalTransactions: 2760,
      profitMargin: 16.8,
      revenueGrowth: 12.3
    },
    productBreakdown: {
      pms: {
        volume: 26811.58,
        value: 469202.65,
        averagePrice: 17.50,
        dailyAverage: 3830.23,
        marketShare: 45.0,
        growthRate: 14.2,
        transactions: 1242,
        variance: 2.5
      },
      ago: {
        volume: 32769.70,
        value: 629458.56,
        averagePrice: 19.20,
        dailyAverage: 4681.39,
        marketShare: 55.0,
        growthRate: 10.8,
        transactions: 1518,
        variance: -1.2
      },
      total: {
        volume: 59581.28,
        value: 1098661.21,
        averagePrice: 18.44,
        dailyAverage: 8511.61,
        marketShare: 100.0,
        growthRate: 12.3,
        transactions: 2760,
        variance: 0.8
      }
    },
    trends: {
      weeklyComparison: [
        {
          weekNumber: 2,
          month: 'JAN',
          totalSales: 16234.67,
          pmsVolume: 23456.78,
          agoVolume: 28777.89,
          salesValue: 982345.67,
          difference: 0,
          percentChange: 0,
          trend: 'stable',
          isHighlighted: false,
          bgColor: '',
          monthColor: 'bg-blue-200',
          timePeriod: '6th - 12th Jan'
        },
        {
          weekNumber: 3,
          month: 'JAN',
          totalSales: 17456.89,
          pmsVolume: 24789.12,
          agoVolume: 29234.56,
          salesValue: 1023456.78,
          difference: 1222.22,
          percentChange: 7.5,
          trend: 'up',
          isHighlighted: false,
          bgColor: '',
          monthColor: 'bg-blue-200',
          timePeriod: '13th - 19th Jan'
        },
        {
          weekNumber: 4,
          month: 'JAN',
          totalSales: 18734.56,
          pmsVolume: 26811.58,
          agoVolume: 32769.70,
          salesValue: 1098661.21,
          difference: 1277.67,
          percentChange: 7.3,
          trend: 'up',
          isHighlighted: true,
          bgColor: 'bg-yellow-100',
          monthColor: 'bg-blue-200',
          timePeriod: '20th - 26th Jan'
        }
      ],
      previousWeekDifference: 1277.67,
      previousWeekPercentChange: 7.3,
      monthlyTrend: 'up',
      seasonalPattern: 'normal_growth',
      performance: 'good'
    },
    status: 'approved',
    createdAt: '2025-01-27T08:00:00Z',
    updatedAt: '2025-01-27T10:30:00Z',
    analyzedBy: 'user-003',
    approvedBy: 'user-001',
    approvedAt: '2025-01-27T10:30:00Z'
  },
  {
    id: 'wsa-002',
    weekInfo: {
      month: 'JAN',
      week: 'WEEK 3',
      weekNumber: 3,
      year: 2025,
      monthIndex: 0,
      dateRange: 'Jan 13 - Jan 19, 2025',
      startDate: '2025-01-13',
      endDate: '2025-01-19',
      timePeriod: '13th - 19th Jan'
    },
    stationId: 'station-002',
    stationName: 'KTC Energy East Legon',
    salesMetrics: {
      totalSales: 21456.78,
      totalVolume: 68123.45,
      averageDailySales: 3065.25,
      peakDaySales: 4123.56,
      lowestDaySales: 2234.67,
      salesValue: 1256789.34,
      averageTransactionValue: 425.75,
      totalTransactions: 2950,
      profitMargin: 18.2,
      revenueGrowth: 15.6
    },
    productBreakdown: {
      pms: {
        volume: 29834.51,
        value: 522103.93,
        averagePrice: 17.50,
        dailyAverage: 4262.07,
        marketShare: 43.8,
        growthRate: 16.8,
        transactions: 1298,
        variance: 3.2
      },
      ago: {
        volume: 38288.94,
        value: 735147.65,
        averagePrice: 19.20,
        dailyAverage: 5469.85,
        marketShare: 56.2,
        growthRate: 14.7,
        transactions: 1652,
        variance: 1.8
      },
      total: {
        volume: 68123.45,
        value: 1257251.58,
        averagePrice: 18.46,
        dailyAverage: 9731.92,
        marketShare: 100.0,
        growthRate: 15.6,
        transactions: 2950,
        variance: 2.4
      }
    },
    trends: {
      weeklyComparison: [
        {
          weekNumber: 1,
          month: 'JAN',
          totalSales: 18432.10,
          pmsVolume: 25234.56,
          agoVolume: 32197.54,
          salesValue: 1087654.32,
          difference: 0,
          percentChange: 0,
          trend: 'stable',
          isHighlighted: false,
          bgColor: '',
          monthColor: 'bg-blue-200',
          timePeriod: '30th Dec - 5th Jan'
        },
        {
          weekNumber: 2,
          month: 'JAN',
          totalSales: 19876.54,
          pmsVolume: 27765.43,
          agoVolume: 34111.11,
          salesValue: 1156789.45,
          difference: 1444.44,
          percentChange: 7.8,
          trend: 'up',
          isHighlighted: false,
          bgColor: '',
          monthColor: 'bg-blue-200',
          timePeriod: '6th - 12th Jan'
        },
        {
          weekNumber: 3,
          month: 'JAN',
          totalSales: 21456.78,
          pmsVolume: 29834.51,
          agoVolume: 38288.94,
          salesValue: 1257251.58,
          difference: 1580.24,
          percentChange: 7.9,
          trend: 'up',
          isHighlighted: true,
          bgColor: 'bg-yellow-100',
          monthColor: 'bg-blue-200',
          timePeriod: '13th - 19th Jan'
        }
      ],
      previousWeekDifference: 1580.24,
      previousWeekPercentChange: 7.9,
      monthlyTrend: 'up',
      seasonalPattern: 'strong_growth',
      performance: 'excellent'
    },
    status: 'generated',
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-01-20T09:45:00Z',
    analyzedBy: 'user-002'
  },
  {
    id: 'wsa-003',
    weekInfo: {
      month: 'DEC',
      week: 'WEEK 4',
      weekNumber: 4,
      year: 2024,
      monthIndex: 11,
      dateRange: 'Dec 23 - Dec 29, 2024',
      startDate: '2024-12-23',
      endDate: '2024-12-29',
      timePeriod: '23rd - 29th Dec'
    },
    stationId: 'station-003',
    stationName: 'KTC Energy Accra Mall',
    salesMetrics: {
      totalSales: 24567.89,
      totalVolume: 78234.56,
      averageDailySales: 3509.70,
      peakDaySales: 5234.78,
      lowestDaySales: 2678.45,
      salesValue: 1445678.90,
      averageTransactionValue: 467.25,
      totalTransactions: 3095,
      profitMargin: 19.5,
      revenueGrowth: 22.8
    },
    productBreakdown: {
      pms: {
        volume: 34305.50,
        value: 600346.25,
        averagePrice: 17.50,
        dailyAverage: 4900.79,
        marketShare: 43.8,
        growthRate: 25.4,
        transactions: 1378,
        variance: 4.8
      },
      ago: {
        volume: 43929.06,
        value: 843438.35,
        averagePrice: 19.20,
        dailyAverage: 6275.58,
        marketShare: 56.2,
        growthRate: 20.9,
        transactions: 1717,
        variance: 3.2
      },
      total: {
        volume: 78234.56,
        value: 1443784.60,
        averagePrice: 18.46,
        dailyAverage: 11176.37,
        marketShare: 100.0,
        growthRate: 22.8,
        transactions: 3095,
        variance: 3.9
      }
    },
    trends: {
      weeklyComparison: [
        {
          weekNumber: 2,
          month: 'DEC',
          totalSales: 19234.65,
          pmsVolume: 26567.89,
          agoVolume: 34666.76,
          salesValue: 1123456.78,
          difference: 0,
          percentChange: 0,
          trend: 'stable',
          isHighlighted: false,
          bgColor: '',
          monthColor: 'bg-emerald-200',
          timePeriod: '9th - 15th Dec'
        },
        {
          weekNumber: 3,
          month: 'DEC',
          totalSales: 21876.45,
          pmsVolume: 29123.78,
          agoVolume: 37234.89,
          salesValue: 1278945.67,
          difference: 2641.80,
          percentChange: 13.7,
          trend: 'peak',
          isHighlighted: false,
          bgColor: 'bg-green-100',
          monthColor: 'bg-emerald-200',
          timePeriod: '16th - 22nd Dec'
        },
        {
          weekNumber: 4,
          month: 'DEC',
          totalSales: 24567.89,
          pmsVolume: 34305.50,
          agoVolume: 43929.06,
          salesValue: 1445678.90,
          difference: 2691.44,
          percentChange: 12.3,
          trend: 'peak',
          isHighlighted: true,
          bgColor: 'bg-yellow-100',
          monthColor: 'bg-emerald-200',
          timePeriod: '23rd - 29th Dec'
        }
      ],
      previousWeekDifference: 2691.44,
      previousWeekPercentChange: 12.3,
      monthlyTrend: 'peak',
      seasonalPattern: 'holiday_surge',
      performance: 'excellent'
    },
    status: 'published',
    createdAt: '2024-12-30T08:00:00Z',
    updatedAt: '2025-01-02T14:20:00Z',
    analyzedBy: 'user-004',
    approvedBy: 'user-001',
    approvedAt: '2025-01-02T14:20:00Z'
  }
];

// Default analytics data
export const DEFAULT_ANALYTICS: WeeklySalesAnalytics = {
  totalAnalyses: 0,
  averageWeeklySales: 0,
  topPerformingWeeks: [],
  bottomPerformingWeeks: [],
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
      pmsRatio: 45.0,
      agoRatio: 55.0,
      optimalMix: true,
      recommendations: []
    }
  },
  stationComparison: []
};

// Status colors and labels
export const SALES_ANALYSIS_STATUS_CONFIG = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  generated: { color: 'bg-blue-100 text-blue-800', label: 'Generated' },
  reviewed: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  published: { color: 'bg-purple-100 text-purple-800', label: 'Published' },
  archived: { color: 'bg-gray-100 text-gray-600', label: 'Archived' }
} as const;

// Performance ratings
export const PERFORMANCE_RATINGS = {
  excellent: { color: 'text-green-600', label: 'Excellent', icon: '🔥' },
  good: { color: 'text-blue-600', label: 'Good', icon: '📈' },
  average: { color: 'text-yellow-600', label: 'Average', icon: '📊' },
  below_average: { color: 'text-orange-600', label: 'Below Average', icon: '📉' },
  poor: { color: 'text-red-600', label: 'Poor', icon: '⚠️' }
} as const;

// Trend indicators
export const TREND_INDICATORS = {
  up: { color: 'text-green-600', icon: '▲', label: 'Increasing' },
  down: { color: 'text-red-600', icon: '▼', label: 'Decreasing' },
  stable: { color: 'text-blue-600', icon: '▶', label: 'Stable' },
  peak: { color: 'text-purple-600', icon: '🔺', label: 'Peak Performance' }
} as const;

// Chart colors
export const CHART_COLORS = {
  pms: '#3B82F6',      // Blue
  ago: '#10B981',      // Emerald
  total: '#8B5CF6',    // Purple
  trend_up: '#059669', // Green
  trend_down: '#DC2626', // Red
  trend_stable: '#6B7280', // Gray
  trend_peak: '#7C3AED'  // Violet
} as const;