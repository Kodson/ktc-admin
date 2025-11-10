# Weekly Sales Analysis Backend Documentation
## KTC Energy Management System

### Overview
The Weekly Sales Analysis system provides comprehensive fuel station sales performance analytics on a weekly basis, including sales metrics tracking, product performance analysis, trend identification, and comparative reporting. This system supports automated analysis generation and approval workflows for business intelligence and strategic decision-making.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Custom Hook Integration](#custom-hook-integration)
5. [Analysis Generation Workflow](#analysis-generation-workflow)
6. [Business Intelligence Logic](#business-intelligence-logic)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)

---

## 🏗️ System Architecture

### Components Overview
- **`/types/weeklySalesAnalysis.ts`** - TypeScript type definitions for analysis data
- **`/constants/weeklySalesAnalysisConstants.ts`** - Configuration, sample data, and constants
- **`/hooks/useWeeklySalesAnalysis.ts`** - Custom hook for API integration and state management
- **`/components/WeeklySalesAnalysis.tsx`** - Main UI component for analysis management

### Integration Pattern
```typescript
// Component Integration Example
import { useWeeklySalesAnalysis } from '../hooks/useWeeklySalesAnalysis';

const WeeklySalesAnalysisManager = () => {
  const {
    analyses,
    analytics,
    isLoading,
    generateAnalysis,
    approveAnalysis,
    publishAnalysis
  } = useWeeklySalesAnalysis();
  
  // Component logic...
};
```

---

## 📊 Data Models

### Core Data Structure

#### WeeklySalesAnalysisData
```typescript
interface WeeklySalesAnalysisData {
  id: string;                           // Unique identifier
  weekInfo: WeeklyAnalysisWeekInfo;     // Week period information
  stationId: string;                    // Station identifier
  stationName: string;                  // Station display name
  salesMetrics: WeeklySalesMetrics;     // Core sales performance metrics
  productBreakdown: ProductSalesBreakdown; // Product-specific analysis
  trends: SalesTrendData;               // Trend analysis and comparisons
  status: SalesAnalysisStatus;          // Workflow status
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  analyzedBy: string;                   // User ID who generated analysis
  approvedBy?: string;                  // User ID who approved
  approvedAt?: string;                  // Approval timestamp
}
```

#### WeeklyAnalysisWeekInfo
```typescript
interface WeeklyAnalysisWeekInfo {
  month: string;          // "JAN", "FEB", etc.
  week: string;           // "WEEK 1", "WEEK 2", etc.
  weekNumber: number;     // 1-4 (week of month)
  year: number;           // 2025, 2024, etc.
  monthIndex: number;     // 0-11 (JavaScript month index)
  dateRange: string;      // "Jan 20 - Jan 26, 2025"
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
  timePeriod: string;     // "20th - 26th Jan"
}
```

#### WeeklySalesMetrics
```typescript
interface WeeklySalesMetrics {
  totalSales: number;                 // Total fuel sales volume (liters)
  totalVolume: number;               // Same as totalSales (redundant for compatibility)
  averageDailySales: number;         // Average daily sales volume
  peakDaySales: number;              // Highest single day sales
  lowestDaySales: number;            // Lowest single day sales
  salesValue: number;                // Total sales revenue (GHS)
  averageTransactionValue: number;   // Average transaction amount (GHS)
  totalTransactions: number;         // Total number of transactions
  profitMargin: number;              // Profit margin percentage
  revenueGrowth: number;             // Revenue growth percentage
}
```

#### ProductSalesBreakdown
```typescript
interface ProductSalesBreakdown {
  pms: ProductSalesData;     // Petrol sales data
  ago: ProductSalesData;     // Diesel sales data
  total: ProductSalesData;   // Combined totals
}

interface ProductSalesData {
  volume: number;           // Sales volume (liters)
  value: number;            // Sales value (GHS)
  averagePrice: number;     // Average price per liter (GHS)
  dailyAverage: number;     // Average daily volume
  marketShare: number;      // Market share percentage
  growthRate: number;       // Growth rate percentage
  transactions: number;     // Number of transactions
  variance: number;         // Volume variance percentage
}
```

#### SalesTrendData
```typescript
interface SalesTrendData {
  weeklyComparison: WeeklyComparisonData[];   // Historical comparison data
  previousWeekDifference: number;             // Volume difference from previous week
  previousWeekPercentChange: number;          // Percentage change from previous week
  monthlyTrend: 'up' | 'down' | 'stable' | 'peak'; // Overall monthly trend
  seasonalPattern: string;                    // Seasonal pattern description
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'; // Performance rating
}

interface WeeklyComparisonData {
  weekNumber: number;        // Week number within month
  month: string;             // Month abbreviation
  totalSales: number;        // Total sales volume
  pmsVolume: number;         // PMS sales volume
  agoVolume: number;         // AGO sales volume
  salesValue: number;        // Total sales value (GHS)
  difference: number;        // Volume difference from previous week
  percentChange: number;     // Percentage change from previous week
  trend: 'up' | 'down' | 'stable' | 'peak'; // Trend classification
  isHighlighted: boolean;    // Whether to highlight in UI
  bgColor: string;           // Background color for UI
  monthColor: string;        // Month indicator color
  timePeriod: string;        // Display period (e.g., "20th - 26th Jan")
}
```

### Status Management

#### SalesAnalysisStatus
```typescript
type SalesAnalysisStatus = 
  | 'draft'        // Initial draft state
  | 'generated'    // Auto-generated from sales data
  | 'reviewed'     // Under manual review
  | 'approved'     // Approved by admin/super admin
  | 'published'    // Published and available for viewing
  | 'archived';    // Archived/historical data

// Status flow
const STATUS_FLOW = {
  draft: ['generated'],
  generated: ['reviewed', 'approved'],
  reviewed: ['approved', 'draft'],
  approved: ['published'],
  published: ['archived'],
  archived: []
};
```

---

## 🚀 API Endpoints

### Base Configuration
```typescript
const WEEKLY_SALES_ANALYSIS_ENDPOINTS = {
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
};
```

### API Methods

#### GET /api/weekly-sales-analysis
**Description**: Retrieve weekly sales analyses with filtering and pagination

**Query Parameters**:
```typescript
interface WeeklySalesAnalysisFilter {
  stationId?: string;           // Filter by station
  status?: SalesAnalysisStatus; // Filter by status
  month?: string;               // Filter by month ("JAN", "FEB", etc.)
  year?: number;                // Filter by year
  weekNumber?: number;          // Filter by week number
  dateFrom?: string;            // ISO date string
  dateTo?: string;              // ISO date string
  performance?: string;         // Filter by performance rating
  trend?: string;               // Filter by trend direction
  page?: number;                // Pagination page (default: 1)
  limit?: number;               // Items per page (default: 10)
}
```

**Response**:
```typescript
interface WeeklySalesAnalysisResponse {
  success: boolean;
  data: WeeklySalesAnalysisData[];
  total: number;          // Total items count
  page: number;           // Current page
  limit: number;          // Items per page
  message?: string;       // Optional message
}
```

#### GET /api/weekly-sales-analysis/:id
**Description**: Retrieve a specific weekly sales analysis

**Response**:
```typescript
interface WeeklySalesAnalysisSingleResponse {
  success: boolean;
  data: WeeklySalesAnalysisData;
  message?: string;
}
```

#### POST /api/weekly-sales-analysis
**Description**: Create a new weekly sales analysis manually

**Request Body**:
```typescript
interface WeeklySalesAnalysisSubmission {
  weekInfo: WeeklyAnalysisWeekInfo;
  stationId: string;
  salesMetrics: WeeklySalesMetrics;
  productBreakdown: ProductSalesBreakdown;
  trends: SalesTrendData;
  notes?: string;
}
```

#### POST /api/weekly-sales-analysis/generate
**Description**: Auto-generate analysis from sales data

**Request Body**:
```typescript
{
  weekInfo: WeeklyAnalysisWeekInfo;
  stationId: string;
  includeComparisons: boolean;  // Whether to include historical comparisons
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}
```

**Response**: Returns generated `WeeklySalesAnalysisData`

#### PUT /api/weekly-sales-analysis/:id
**Description**: Update an existing analysis
**Note**: Only allowed for 'draft' and 'generated' status

#### DELETE /api/weekly-sales-analysis/:id
**Description**: Delete an analysis
**Note**: Only allowed for 'draft' status

#### POST /api/weekly-sales-analysis/:id/approve
**Description**: Approve a generated analysis

**Request Body**:
```typescript
interface WeeklySalesAnalysisApproval {
  analysisId: string;
  approverId: string;
  isApproved: boolean;
  approvedAt: string;
  approvalComments?: string;
  publicationDate?: string;  // Optional scheduled publication
}
```
**Transitions**: generated/reviewed → approved

#### POST /api/weekly-sales-analysis/:id/publish
**Description**: Publish an approved analysis

**Request Body**:
```typescript
{
  publisherId: string;
  publishedAt: string;
  distributionList?: string[];  // Optional distribution list
}
```
**Transitions**: approved → published

#### GET /api/weekly-sales-analysis/analytics
**Description**: Get comprehensive sales analytics

**Response**:
```typescript
interface WeeklySalesAnalytics {
  totalAnalyses: number;
  averageWeeklySales: number;
  topPerformingWeeks: WeeklyComparisonData[];
  bottomPerformingWeeks: WeeklyComparisonData[];
  salesTrends: SalesTrendSummary;
  productPerformance: ProductPerformanceSummary;
  stationComparison: StationPerformanceData[];
}
```

#### GET /api/weekly-sales-analysis/trends
**Description**: Get detailed trend analysis across periods

**Query Parameters**:
```typescript
{
  stationId?: string;
  periodCount?: number;    // Number of periods to analyze
  trendType?: 'volume' | 'value' | 'transactions' | 'performance';
}
```

---

## 🔧 Custom Hook Integration

### useWeeklySalesAnalysis Hook

```typescript
const useWeeklySalesAnalysis = (): UseWeeklySalesAnalysisReturn => {
  // State management
  const [analyses, setAnalyses] = useState<WeeklySalesAnalysisData[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<WeeklySalesAnalysisData | null>(null);
  const [analytics, setAnalytics] = useState<WeeklySalesAnalytics | null>(null);
  const [comparisonData, setComparisonData] = useState<WeeklyComparisonData[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pagination and filtering
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<WeeklySalesAnalysisFilter>({});

  // ... hook implementation
};
```

### Key Methods

#### Analysis Generation
```typescript
// Auto-generate analysis from sales data
const generateAnalysis = async (weekInfo: WeeklyAnalysisWeekInfo, stationId: string): Promise<WeeklySalesAnalysisData | null> => {
  setIsGenerating(true);
  try {
    const response = await WeeklySalesAnalysisAPI.generateAnalysis({
      weekInfo,
      stationId,
      includeComparisons: true,
      analysisDepth: 'comprehensive'
    });
    
    if (response.success) {
      setAnalyses(prev => [response.data, ...prev]);
      toast.success(WEEKLY_SALES_ANALYSIS_MESSAGES.GENERATED);
      return response.data;
    }
    // Handle error...
  } finally {
    setIsGenerating(false);
  }
};
```

#### Workflow Operations
```typescript
// Approve analysis
const approveAnalysis = async (id: string, approval: Omit<WeeklySalesAnalysisApproval, 'analysisId'>): Promise<boolean> => {
  setIsApproving(true);
  try {
    const response = await WeeklySalesAnalysisAPI.approveAnalysis(id, approval);
    if (response.success) {
      // Update local state
      setAnalyses(prev => prev.map(analysis => 
        analysis.id === id ? { ...analysis, status: 'approved', ...approval } : analysis
      ));
      toast.success(WEEKLY_SALES_ANALYSIS_MESSAGES.APPROVED);
      return true;
    }
    // Handle error...
  } finally {
    setIsApproving(false);
  }
};

// Publish analysis
const publishAnalysis = async (id: string): Promise<boolean> => {
  setIsPublishing(true);
  try {
    const response = await WeeklySalesAnalysisAPI.publishAnalysis(id);
    if (response.success) {
      setAnalyses(prev => prev.map(analysis => 
        analysis.id === id ? { ...analysis, status: 'published' } : analysis
      ));
      toast.success(WEEKLY_SALES_ANALYSIS_MESSAGES.PUBLISHED);
      return true;
    }
    // Handle error...
  } finally {
    setIsPublishing(false);
  }
};
```

#### Form Validation
```typescript
// Validate analysis form data
const validateForm = (data: WeeklySalesAnalysisFormData): boolean => {
  const errors: Record<string, string> = {};
  
  // Required field validation
  if (!data.weekInfo?.month) errors.month = 'Month is required';
  if (!data.weekInfo?.week) errors.week = 'Week is required';
  if (!data.stationId) errors.stationId = 'Station is required';
  
  // Sales metrics validation
  if (!data.salesMetrics?.totalSales || data.salesMetrics.totalSales <= 0) {
    errors.totalSales = 'Total sales must be greater than 0';
  }
  
  if (!data.salesMetrics?.salesValue || data.salesMetrics.salesValue <= 0) {
    errors.salesValue = 'Sales value must be greater than 0';
  }
  
  // Product breakdown validation
  if (data.productBreakdown?.pms?.volume && data.productBreakdown?.ago?.volume) {
    const totalVolume = data.productBreakdown.pms.volume + data.productBreakdown.ago.volume;
    if (Math.abs(totalVolume - (data.salesMetrics?.totalSales || 0)) > 100) {
      errors.volumeBalance = 'Product volumes must equal total sales volume';
    }
  }
  
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

---

## 🔄 Analysis Generation Workflow

### Automated Analysis Process
1. **Data Collection** - Gather sales data from specified week period
2. **Metrics Calculation** - Calculate core sales metrics and KPIs
3. **Product Analysis** - Analyze product-specific performance
4. **Trend Analysis** - Compare with historical periods and identify trends
5. **Performance Rating** - Assign performance classification
6. **Report Generation** - Generate comprehensive analysis report

### Workflow States
1. **Draft** - Manual analysis creation
2. **Generated** - Auto-generated from sales data
3. **Reviewed** - Under manual review by admin
4. **Approved** - Approved for publication
5. **Published** - Available for stakeholder viewing
6. **Archived** - Historical archive status

### Role-Based Permissions

#### Station Manager
- View own station analyses
- Request analysis generation
- Access basic analytics dashboard

#### Admin
- View all station analyses
- Generate analyses for any station
- Review and approve analyses
- Access comprehensive analytics
- Manage analysis workflow

#### Super Admin
- All admin permissions
- Publish approved analyses
- Archive analyses
- System-wide analytics access
- Manage analysis distribution

### Analysis Generation Logic
```typescript
// Generate comprehensive analysis from sales data
const generateComprehensiveAnalysis = async (weekInfo: WeeklyAnalysisWeekInfo, stationId: string) => {
  // 1. Collect sales data for the week
  const salesData = await collectWeekSalesData(weekInfo, stationId);
  
  // 2. Calculate core metrics
  const salesMetrics = calculateSalesMetrics(salesData);
  
  // 3. Analyze product breakdown
  const productBreakdown = analyzeProductPerformance(salesData);
  
  // 4. Generate trend analysis
  const trends = await generateTrendAnalysis(weekInfo, stationId, salesData);
  
  // 5. Assign performance rating
  const performance = classifyPerformance(salesMetrics, trends);
  
  return {
    weekInfo,
    stationId,
    salesMetrics,
    productBreakdown,
    trends: { ...trends, performance },
    status: 'generated'
  };
};
```

---

## 💼 Business Intelligence Logic

### Sales Metrics Calculations

#### Core Metrics
```typescript
const calculateSalesMetrics = (salesData: DailySalesData[]): WeeklySalesMetrics => {
  const dailySales = salesData.map(day => day.totalVolume);
  const dailyValues = salesData.map(day => day.totalValue);
  
  return {
    totalSales: dailySales.reduce((sum, sales) => sum + sales, 0),
    totalVolume: dailySales.reduce((sum, sales) => sum + sales, 0),
    averageDailySales: dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length,
    peakDaySales: Math.max(...dailySales),
    lowestDaySales: Math.min(...dailySales),
    salesValue: dailyValues.reduce((sum, value) => sum + value, 0),
    averageTransactionValue: calculateAverageTransactionValue(salesData),
    totalTransactions: salesData.reduce((sum, day) => sum + day.transactionCount, 0),
    profitMargin: calculateProfitMargin(salesData),
    revenueGrowth: calculateRevenueGrowth(salesData, previousWeekData)
  };
};
```

#### Product Performance Analysis
```typescript
const analyzeProductPerformance = (salesData: DailySalesData[]): ProductSalesBreakdown => {
  const pmsData = extractProductData(salesData, 'pms');
  const agoData = extractProductData(salesData, 'ago');
  
  return {
    pms: {
      volume: pmsData.totalVolume,
      value: pmsData.totalValue,
      averagePrice: pmsData.totalValue / pmsData.totalVolume,
      dailyAverage: pmsData.totalVolume / 7,
      marketShare: (pmsData.totalVolume / (pmsData.totalVolume + agoData.totalVolume)) * 100,
      growthRate: calculateGrowthRate(pmsData, previousPmsData),
      transactions: pmsData.totalTransactions,
      variance: calculateVariance(pmsData.dailyVolumes)
    },
    ago: {
      volume: agoData.totalVolume,
      value: agoData.totalValue,
      averagePrice: agoData.totalValue / agoData.totalVolume,
      dailyAverage: agoData.totalVolume / 7,
      marketShare: (agoData.totalVolume / (pmsData.totalVolume + agoData.totalVolume)) * 100,
      growthRate: calculateGrowthRate(agoData, previousAgoData),
      transactions: agoData.totalTransactions,
      variance: calculateVariance(agoData.dailyVolumes)
    },
    total: {
      volume: pmsData.totalVolume + agoData.totalVolume,
      value: pmsData.totalValue + agoData.totalValue,
      averagePrice: (pmsData.totalValue + agoData.totalValue) / (pmsData.totalVolume + agoData.totalVolume),
      dailyAverage: (pmsData.totalVolume + agoData.totalVolume) / 7,
      marketShare: 100,
      growthRate: calculateCombinedGrowthRate(pmsData, agoData, previousCombinedData),
      transactions: pmsData.totalTransactions + agoData.totalTransactions,
      variance: calculateCombinedVariance(pmsData.dailyVolumes, agoData.dailyVolumes)
    }
  };
};
```

#### Trend Analysis
```typescript
const generateTrendAnalysis = async (weekInfo: WeeklyAnalysisWeekInfo, stationId: string, currentData: any): Promise<SalesTrendData> => {
  // Get historical data for comparison
  const historicalData = await getHistoricalData(stationId, weekInfo, 12); // Last 12 weeks
  
  // Generate weekly comparison data
  const weeklyComparison = historicalData.map((week, index) => ({
    weekNumber: week.weekNumber,
    month: week.month,
    totalSales: week.totalSales,
    pmsVolume: week.pmsVolume,
    agoVolume: week.agoVolume,
    salesValue: week.salesValue,
    difference: index > 0 ? week.totalSales - historicalData[index - 1].totalSales : 0,
    percentChange: index > 0 ? ((week.totalSales - historicalData[index - 1].totalSales) / historicalData[index - 1].totalSales) * 100 : 0,
    trend: classifyTrend(week.totalSales, historicalData[index - 1]?.totalSales),
    isHighlighted: index === historicalData.length - 1, // Highlight current week
    bgColor: index === historicalData.length - 1 ? 'bg-yellow-100' : '',
    monthColor: getMonthColor(week.month),
    timePeriod: week.timePeriod
  }));
  
  const previousWeek = historicalData[historicalData.length - 2];
  const currentWeek = historicalData[historicalData.length - 1];
  
  return {
    weeklyComparison,
    previousWeekDifference: currentWeek.totalSales - previousWeek.totalSales,
    previousWeekPercentChange: ((currentWeek.totalSales - previousWeek.totalSales) / previousWeek.totalSales) * 100,
    monthlyTrend: analyzeMonthlyTrend(historicalData),
    seasonalPattern: identifySeasonalPattern(historicalData),
    performance: classifyPerformance(currentWeek, historicalData)
  };
};
```

### Performance Classification

#### Performance Rating Logic
```typescript
const classifyPerformance = (salesMetrics: WeeklySalesMetrics, trends: SalesTrendData): 'excellent' | 'good' | 'average' | 'below_average' | 'poor' => {
  const score = calculatePerformanceScore(salesMetrics, trends);
  
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  if (score >= 40) return 'below_average';
  return 'poor';
};

const calculatePerformanceScore = (salesMetrics: WeeklySalesMetrics, trends: SalesTrendData): number => {
  let score = 0;
  
  // Revenue growth component (30%)
  if (salesMetrics.revenueGrowth > 15) score += 30;
  else if (salesMetrics.revenueGrowth > 10) score += 25;
  else if (salesMetrics.revenueGrowth > 5) score += 20;
  else if (salesMetrics.revenueGrowth > 0) score += 15;
  else score += 5;
  
  // Profit margin component (25%)
  if (salesMetrics.profitMargin > 20) score += 25;
  else if (salesMetrics.profitMargin > 15) score += 20;
  else if (salesMetrics.profitMargin > 10) score += 15;
  else if (salesMetrics.profitMargin > 5) score += 10;
  else score += 5;
  
  // Volume consistency component (20%)
  const volumeVariance = calculateVolumeVariance(trends.weeklyComparison);
  if (volumeVariance < 0.1) score += 20;
  else if (volumeVariance < 0.2) score += 15;
  else if (volumeVariance < 0.3) score += 10;
  else score += 5;
  
  // Transaction efficiency component (15%)
  if (salesMetrics.averageTransactionValue > 500) score += 15;
  else if (salesMetrics.averageTransactionValue > 400) score += 12;
  else if (salesMetrics.averageTransactionValue > 300) score += 9;
  else score += 5;
  
  // Trend momentum component (10%)
  if (trends.monthlyTrend === 'peak') score += 10;
  else if (trends.monthlyTrend === 'up') score += 8;
  else if (trends.monthlyTrend === 'stable') score += 6;
  else score += 3;
  
  return Math.min(score, 100);
};
```

#### Seasonal Pattern Recognition
```typescript
const identifySeasonalPattern = (historicalData: WeeklyComparisonData[]): string => {
  const monthlyAverages = calculateMonthlyAverages(historicalData);
  const yearOverYearComparison = getYearOverYearData(historicalData);
  
  // Holiday surge pattern (December, major holidays)
  if (isHolidayPeriod(historicalData[historicalData.length - 1])) {
    const holidayIncrease = calculateHolidayIncrease(historicalData);
    if (holidayIncrease > 0.2) return 'holiday_surge';
  }
  
  // Back-to-school pattern (September)
  if (isBackToSchoolPeriod(historicalData[historicalData.length - 1])) {
    return 'back_to_school_boost';
  }
  
  // Summer driving pattern (June-August)
  if (isSummerPeriod(historicalData[historicalData.length - 1])) {
    return 'summer_driving_season';
  }
  
  // Normal growth pattern
  const averageGrowth = calculateAverageGrowth(historicalData);
  if (averageGrowth > 0.15) return 'strong_growth';
  if (averageGrowth > 0.05) return 'normal_growth';
  if (averageGrowth > -0.05) return 'stable';
  return 'declining';
};
```

---

## 🚨 Error Handling

### Analysis-Specific Error Types
```typescript
enum WeeklySalesAnalysisErrorType {
  GENERATION_ERROR = 'GENERATION_ERROR',
  DATA_INSUFFICIENT = 'DATA_INSUFFICIENT',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  TREND_ANALYSIS_ERROR = 'TREND_ANALYSIS_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  APPROVAL_ERROR = 'APPROVAL_ERROR',
  PUBLISH_ERROR = 'PUBLISH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

interface WeeklySalesAnalysisError {
  type: WeeklySalesAnalysisErrorType;
  message: string;
  details?: Record<string, any>;
  analysisId?: string;
  recommendations?: string[];
}
```

### Data Quality Validation
```typescript
const validateSalesData = (salesData: DailySalesData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check data completeness
  if (salesData.length < 7) {
    errors.push('Incomplete week data - missing daily sales records');
  }
  
  // Check for zero-volume days
  const zeroVolumeDays = salesData.filter(day => day.totalVolume === 0);
  if (zeroVolumeDays.length > 1) {
    warnings.push(`${zeroVolumeDays.length} days with zero sales volume detected`);
  }
  
  // Check for unrealistic values
  const maxDailyVolume = Math.max(...salesData.map(day => day.totalVolume));
  const avgDailyVolume = salesData.reduce((sum, day) => sum + day.totalVolume, 0) / salesData.length;
  
  if (maxDailyVolume > avgDailyVolume * 3) {
    warnings.push('Unusually high sales volume detected on peak day');
  }
  
  // Check price consistency
  const priceVariations = analyzePriceConsistency(salesData);
  if (priceVariations.coefficient > 0.1) {
    warnings.push('High price variation detected during analysis period');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQualityScore: calculateDataQualityScore(salesData)
  };
};
```

---

## ⚡ Performance Considerations

### Efficient Data Processing
```typescript
// Optimized analysis generation with caching
class AnalysisGenerator {
  private cache = new Map<string, any>();
  
  async generateAnalysis(weekInfo: WeeklyAnalysisWeekInfo, stationId: string): Promise<WeeklySalesAnalysisData> {
    const cacheKey = `${stationId}-${weekInfo.year}-${weekInfo.monthIndex}-${weekInfo.weekNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Generate analysis
    const analysis = await this.performAnalysisCalculations(weekInfo, stationId);
    
    // Cache result
    this.cache.set(cacheKey, analysis);
    
    // Schedule cache cleanup
    setTimeout(() => this.cache.delete(cacheKey), 30 * 60 * 1000); // 30 minutes
    
    return analysis;
  }
  
  private async performAnalysisCalculations(weekInfo: WeeklyAnalysisWeekInfo, stationId: string) {
    // Parallel data collection
    const [salesData, historicalData, stationData] = await Promise.all([
      this.collectSalesData(weekInfo, stationId),
      this.getHistoricalData(stationId, 12),
      this.getStationMetadata(stationId)
    ]);
    
    // Sequential calculations (order-dependent)
    const salesMetrics = this.calculateSalesMetrics(salesData);
    const productBreakdown = this.analyzeProductPerformance(salesData);
    const trends = this.generateTrendAnalysis(salesData, historicalData);
    
    return {
      weekInfo,
      stationId,
      stationName: stationData.name,
      salesMetrics,
      productBreakdown,
      trends,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'system'
    };
  }
}
```

### Memory-Efficient Trend Analysis
```typescript
// Stream-based processing for large datasets
const processHistoricalTrends = async (stationId: string, periodCount: number) => {
  const trendData: WeeklyComparisonData[] = [];
  
  // Process data in chunks to avoid memory issues
  const chunkSize = 50;
  for (let offset = 0; offset < periodCount; offset += chunkSize) {
    const chunk = await getHistoricalDataChunk(stationId, offset, Math.min(chunkSize, periodCount - offset));
    
    // Process chunk
    const processedChunk = chunk.map((week, index) => ({
      ...week,
      trend: calculateTrend(week, chunk[index - 1]),
      percentChange: calculatePercentChange(week, chunk[index - 1])
    }));
    
    trendData.push(...processedChunk);
    
    // Yield control to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return trendData;
};
```

---

## 📊 Analytics and Insights

### Comprehensive Analytics Structure
```typescript
interface WeeklySalesAnalytics {
  totalAnalyses: number;
  averageWeeklySales: number;
  topPerformingWeeks: WeeklyComparisonData[];
  bottomPerformingWeeks: WeeklyComparisonData[];
  salesTrends: SalesTrendSummary;
  productPerformance: ProductPerformanceSummary;
  stationComparison: StationPerformanceData[];
}

// Advanced trend analysis
interface SalesTrendSummary {
  overallTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate: number;              // Annual growth rate
  consistency: number;             // Consistency score (0-1)
  seasonality: string;             // Seasonal pattern description
  volatilityIndex: number;         // Volatility measure (0-1)
}

// Product performance insights
interface ProductPerformanceSummary {
  pmsPerformance: ProductPerformanceMetrics;
  agoPerformance: ProductPerformanceMetrics;
  productMix: ProductMixData;
}

interface ProductMixData {
  pmsRatio: number;                // PMS percentage of total sales
  agoRatio: number;                // AGO percentage of total sales
  optimalMix: boolean;             // Whether current mix is optimal
  recommendations: string[];        // Optimization recommendations
}
```

### Export and Reporting
```typescript
// Export analysis data in multiple formats
const exportAnalysisData = async (analysisId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
  const analysis = await getAnalysisById(analysisId);
  const analytics = await getAnalyticsForAnalysis(analysisId);
  
  const exportData: WeeklySalesAnalysisExportData = {
    reportType: 'weekly-sales-analysis',
    analysisData: analysis,
    comparisonData: analysis.trends.weeklyComparison,
    analytics,
    exportFormat: format,
    generatedAt: new Date().toISOString(),
    generatedBy: getCurrentUser().id
  };
  
  switch (format) {
    case 'pdf':
      return await generatePDFReport(exportData);
    case 'excel':
      return await generateExcelReport(exportData);
    case 'csv':
      return await generateCSVReport(exportData);
    default:
      throw new Error('Unsupported export format');
  }
};
```

---

## 🧪 Testing Strategy

### Analysis Generation Tests
```typescript
describe('Weekly Sales Analysis Generation', () => {
  test('should generate comprehensive analysis from complete sales data', async () => {
    const mockSalesData = createMockWeeklySalesData();
    const weekInfo = createMockWeekInfo();
    
    const result = await generateAnalysis(weekInfo, 'station-001');
    
    expect(result).toMatchObject({
      salesMetrics: expect.objectContaining({
        totalSales: expect.any(Number),
        averageDailySales: expect.any(Number),
        profitMargin: expect.any(Number)
      }),
      productBreakdown: expect.objectContaining({
        pms: expect.any(Object),
        ago: expect.any(Object),
        total: expect.any(Object)
      }),
      trends: expect.objectContaining({
        weeklyComparison: expect.any(Array),
        performance: expect.stringMatching(/excellent|good|average|below_average|poor/)
      })
    });
  });
  
  test('should handle insufficient data gracefully', async () => {
    const incompleteSalesData = createIncompleteSalesData();
    
    await expect(generateAnalysis(weekInfo, 'station-001'))
      .rejects.toThrow('Insufficient data for analysis generation');
  });
  
  test('should calculate correct performance ratings', () => {
    const highPerformanceMetrics = createHighPerformanceMetrics();
    const trends = createPositiveTrends();
    
    const rating = classifyPerformance(highPerformanceMetrics, trends);
    
    expect(rating).toBe('excellent');
  });
});
```

### Business Logic Tests
```typescript
describe('Sales Analysis Business Logic', () => {
  test('should calculate accurate sales metrics', () => {
    const salesData = createMockDailySalesData();
    
    const metrics = calculateSalesMetrics(salesData);
    
    expect(metrics.totalSales).toBe(expectedTotalSales);
    expect(metrics.averageDailySales).toBeCloseTo(expectedAverageDailySales, 2);
    expect(metrics.profitMargin).toBeGreaterThan(0);
  });
  
  test('should identify correct seasonal patterns', () => {
    const holidayData = createHolidaySeasonData();
    
    const pattern = identifySeasonalPattern(holidayData);
    
    expect(pattern).toBe('holiday_surge');
  });
  
  test('should validate product breakdown consistency', () => {
    const productBreakdown = createMockProductBreakdown();
    
    const isValid = validateProductBreakdown(productBreakdown);
    
    expect(isValid.isValid).toBe(true);
    expect(productBreakdown.pms.volume + productBreakdown.ago.volume)
      .toBeCloseTo(productBreakdown.total.volume, 2);
  });
});
```

---

## 📝 Usage Examples

### Basic Analysis Generation
```tsx
import React, { useState } from 'react';
import { useWeeklySalesAnalysis } from '../hooks/useWeeklySalesAnalysis';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

const AnalysisGenerator: React.FC = () => {
  const { generateAnalysis, isGenerating } = useWeeklySalesAnalysis();
  const [selectedWeek, setSelectedWeek] = useState<WeeklyAnalysisWeekInfo | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>('');
  
  const handleGenerateAnalysis = async () => {
    if (!selectedWeek || !selectedStation) {
      toast.error('Please select week and station');
      return;
    }
    
    try {
      const analysis = await generateAnalysis(selectedWeek, selectedStation);
      if (analysis) {
        toast.success('Analysis generated successfully');
        // Handle success (e.g., navigate to analysis view)
      }
    } catch (error) {
      toast.error('Failed to generate analysis');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <WeekSelector onWeekSelect={setSelectedWeek} />
        <StationSelector onStationSelect={setSelectedStation} />
      </div>
      
      <Button 
        onClick={handleGenerateAnalysis}
        disabled={isGenerating || !selectedWeek || !selectedStation}
        className="w-full"
      >
        {isGenerating ? 'Generating Analysis...' : 'Generate Weekly Analysis'}
      </Button>
    </div>
  );
};
```

### Advanced Analytics Dashboard
```tsx
const AnalyticsDashboard: React.FC = () => {
  const { 
    analytics, 
    analyses, 
    isLoading, 
    getAnalytics,
    filters,
    setFilters 
  } = useWeeklySalesAnalysis();
  
  useEffect(() => {
    getAnalytics();
  }, []);
  
  if (isLoading) return <AnalyticsLoadingSkeleton />;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Average Weekly Sales"
          value={formatCurrency(analytics?.averageWeeklySales || 0)}
          trend={analytics?.salesTrends.overallTrend}
          icon="TrendingUp"
        />
        <MetricCard
          title="Total Analyses"
          value={analytics?.totalAnalyses || 0}
          description="Generated this month"
          icon="BarChart"
        />
        <MetricCard
          title="Growth Rate"
          value={`${analytics?.salesTrends.growthRate || 0}%`}
          trend={analytics?.salesTrends.growthRate > 0 ? 'up' : 'down'}
          icon="Growth"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart data={analytics?.salesTrends} />
        <ProductPerformanceChart data={analytics?.productPerformance} />
      </div>
      
      <div className="space-y-4">
        <h3>Recent Analyses</h3>
        <AnalysisTable 
          data={analyses}
          onViewAnalysis={handleViewAnalysis}
          onApproveAnalysis={handleApproveAnalysis}
        />
      </div>
    </div>
  );
};
```

---

This comprehensive backend documentation provides all the necessary information for implementing, maintaining, and extending the Weekly Sales Analysis system in the KTC Energy Management System. The documentation covers automated analysis generation, business intelligence calculations, trend analysis, performance classification, and comprehensive analytics necessary for data-driven fuel station management decisions.