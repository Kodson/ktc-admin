# End of Month Report Backend Documentation
## KTC Energy Management System

### Overview
The End of Month Report system provides comprehensive monthly fuel station performance analysis, including detailed financial metrics, profit analysis, product breakdowns, and trend forecasting. This system consolidates weekly operational data into monthly insights for strategic business planning and performance evaluation.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Custom Hook Integration](#custom-hook-integration)
5. [Report Generation Workflow](#report-generation-workflow)
6. [Financial Analysis Logic](#financial-analysis-logic)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)

---

## 🏗️ System Architecture

### Components Overview
- **`/types/endOfMonthReport.ts`** - TypeScript type definitions for monthly reporting
- **`/constants/endOfMonthReportConstants.ts`** - Configuration, sample data, and business rules
- **`/hooks/useEndOfMonthReport.ts`** - Custom hook for API integration and state management
- **`/components/EndOfMonthReport.tsx`** - Main UI component for report management

### Integration Pattern
```typescript
// Component Integration Example
import { useEndOfMonthReport } from '../hooks/useEndOfMonthReport';

const EndOfMonthReportManager = () => {
  const {
    reports,
    analytics,
    isLoading,
    generateReport,
    approveReport,
    publishReport
  } = useEndOfMonthReport();
  
  // Component logic...
};
```

---

## 📊 Data Models

### Core Data Structure

#### EndOfMonthReportData
```typescript
interface EndOfMonthReportData {
  id: string;                           // Unique identifier
  monthInfo: MonthlyReportMonthInfo;    // Month period information
  stationId: string;                    // Station identifier
  stationName: string;                  // Station display name
  monthlyTotals: MonthlyTotalsData;     // Aggregated monthly totals
  weeklyBreakdown: WeeklyBreakdownData[]; // Weekly performance breakdown
  pricingData: MonthlyPricingData;      // Pricing analysis and volatility
  profitAnalysis: MonthlyProfitAnalysis; // Comprehensive profit analysis
  trends: MonthlyTrendData;             // Trend analysis and forecasting
  status: MonthlyReportStatus;          // Workflow status
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  analyzedBy: string;                   // User ID who generated report
  approvedBy?: string;                  // User ID who approved
  approvedAt?: string;                  // Approval timestamp
}
```

#### MonthlyReportMonthInfo
```typescript
interface MonthlyReportMonthInfo {
  month: string;          // "JAN", "FEB", etc.
  year: number;           // 2025, 2024, etc.
  monthIndex: number;     // 0-11 (JavaScript month index)
  dateRange: string;      // "01 - 31/01/25"
  totalDays: number;      // Total days in month (28-31)
  businessDays: number;   // Working days in month
  timePeriod: string;     // "January 2025"
}
```

#### MonthlyTotalsData
```typescript
interface MonthlyTotalsData {
  pms: ProductMonthlyTotals;     // Petrol monthly totals
  ago: ProductMonthlyTotals;     // Diesel monthly totals
  rate?: ProductMonthlyTotals;   // Premium/Rate totals (optional)
  pms_value: ProductValueTotals; // Petrol financial values
  ago_value: ProductValueTotals; // Diesel financial values
}

interface ProductMonthlyTotals {
  openingStock: number;       // Liters at month start
  supply: number;             // Total liters received during month
  availableStock: number;     // Total available for sale
  salesCost: number;          // Liters sold (cost basis)
  salesUnitPrice: number;     // Total sales revenue (GHS)
  unitPrice: number;          // Average price per liter (GHS)
  closingStock: number;       // Liters remaining at month end
  closingDispensing: number;  // Final dispenser reading
  undergroundGains: number;   // Underground tank gains (liters)
  pumpGains: number;          // Pump-level gains (liters)
}

interface ProductValueTotals {
  openingStock: number;       // GHS value of opening stock
  availableStock: number;     // GHS value available for sale
  salesCost: number;          // GHS cost of goods sold
  salesUnitPrice: number;     // GHS sales revenue
  undergroundGains: number;   // GHS value of underground gains
  pumpGains: number;          // GHS value of pump gains
}
```

#### WeeklyBreakdownData
```typescript
interface WeeklyBreakdownData {
  weekNumber: number;         // Week number within month (1-5)
  period: string;             // "Week 1", "Week 2", etc.
  dateRange: string;          // "01-07 Jan"
  pms: WeeklyProductData;     // Petrol weekly data
  ago: WeeklyProductData;     // Diesel weekly data
  totalSales: number;         // Total volume sold (liters)
  totalValue: number;         // Total sales value (GHS)
}

interface WeeklyProductData {
  quantity: number;           // Volume sold (liters)
  price: number;              // Base price (GHS/liter)
  priceAdjustment: number;    // Price adjustment from base (GHS)
  salesValue: number;         // Total sales value (GHS)
  dailyAverage: number;       // Average daily volume (liters)
}
```

#### MonthlyPricingData
```typescript
interface MonthlyPricingData {
  pms: ProductPricingData;    // Petrol pricing analysis
  ago: ProductPricingData;    // Diesel pricing analysis
}

interface ProductPricingData {
  basePrice: number;              // Base price at month start (GHS)
  averagePrice: number;           // Volume-weighted average price (GHS)
  maxPrice: number;               // Highest price during month (GHS)
  minPrice: number;               // Lowest price during month (GHS)
  priceVolatility: number;        // Price volatility index
  weeklyPeriods: WeeklyPricingPeriod[]; // Weekly price breakdown
}

interface WeeklyPricingPeriod {
  period: string;             // "Week 1", "Week 2", etc.
  dateRange: string;          // "01-07 Jan"
  priceAdjustment: number;    // Adjustment from base price (GHS)
  quantity: number;           // Volume sold at this price (liters)
  salesValue: number;         // Revenue at this price (GHS)
  effectivePrice?: number;    // Calculated effective price (GHS)
}
```

#### MonthlyProfitAnalysis
```typescript
interface MonthlyProfitAnalysis {
  totalRevenue: number;               // Total monthly revenue (GHS)
  totalCost: number;                  // Total cost of goods sold (GHS)
  grossProfit: number;                // Gross profit (GHS)
  profitMargin: number;               // Gross profit margin (%)
  operatingExpenses: number;          // Monthly operating expenses (GHS)
  netProfit: number;                  // Net profit after expenses (GHS)
  roi: number;                        // Return on investment (%)
  breakdownByProduct: {
    pms: ProductProfitData;           // Petrol profit breakdown
    ago: ProductProfitData;           // Diesel profit breakdown
  };
}

interface ProductProfitData {
  revenue: number;            // Product revenue (GHS)
  cost: number;               // Product cost (GHS)
  profit: number;             // Product profit (GHS)
  margin: number;             // Product profit margin (%)
  contribution: number;       // Contribution to total profit (%)
}
```

#### MonthlyTrendData
```typescript
interface MonthlyTrendData {
  previousMonthComparison: number;     // Volume difference from previous month
  previousMonthPercentChange: number;  // Percentage change from previous month
  yearOverYearChange: number;          // Year-over-year growth percentage
  monthlyTrend: 'up' | 'down' | 'stable' | 'peak'; // Overall trend direction
  seasonalPattern: string;             // Seasonal pattern description
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'; // Performance rating
  forecastNextMonth: number;           // Forecasted next month revenue (GHS)
}
```

### Status Management

#### MonthlyReportStatus
```typescript
type MonthlyReportStatus = 
  | 'draft'        // Initial draft state
  | 'generated'    // Auto-generated from monthly data
  | 'reviewed'     // Under manual review
  | 'approved'     // Approved by admin/super admin
  | 'published'    // Published and available for stakeholders
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
const END_OF_MONTH_REPORT_ENDPOINTS = {
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
```

### API Methods

#### GET /api/reports/end-of-month
**Description**: Retrieve end of month reports with filtering and pagination

**Query Parameters**:
```typescript
interface EndOfMonthReportFilter {
  stationId?: string;           // Filter by station
  status?: MonthlyReportStatus; // Filter by status
  month?: string;               // Filter by month ("JAN", "FEB", etc.)
  year?: number;                // Filter by year
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
interface EndOfMonthReportResponse {
  success: boolean;
  data: EndOfMonthReportData[];
  total: number;          // Total items count
  page: number;           // Current page
  limit: number;          // Items per page
  message?: string;       // Optional message
}
```

#### GET /api/reports/end-of-month/:id
**Description**: Retrieve a specific monthly report

**Response**:
```typescript
interface EndOfMonthReportSingleResponse {
  success: boolean;
  data: EndOfMonthReportData;
  message?: string;
}
```

#### POST /api/reports/end-of-month
**Description**: Create a new monthly report manually

**Request Body**:
```typescript
interface EndOfMonthReportSubmission {
  monthInfo: MonthlyReportMonthInfo;
  stationId: string;
  monthlyTotals: MonthlyTotalsData;
  weeklyBreakdown: WeeklyBreakdownData[];
  pricingData: MonthlyPricingData;
  profitAnalysis: MonthlyProfitAnalysis;
  trends: MonthlyTrendData;
  notes?: string;
}
```

#### POST /api/reports/end-of-month/generate
**Description**: Auto-generate monthly report from consolidated data

**Request Body**:
```typescript
{
  monthInfo: MonthlyReportMonthInfo;
  stationId: string;
  includeWeeklyBreakdown: boolean;    // Whether to include weekly analysis
  includeProfitAnalysis: boolean;     // Whether to calculate detailed profit metrics
  includeTrendForecasting: boolean;   // Whether to generate trend forecasts
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}
```

**Response**: Returns generated `EndOfMonthReportData`

#### PUT /api/reports/end-of-month/:id
**Description**: Update an existing report
**Note**: Only allowed for 'draft' and 'generated' status

#### DELETE /api/reports/end-of-month/:id
**Description**: Delete a report
**Note**: Only allowed for 'draft' status

#### POST /api/reports/end-of-month/:id/approve
**Description**: Approve a generated report

**Request Body**:
```typescript
interface EndOfMonthReportApproval {
  reportId: string;
  approverId: string;
  isApproved: boolean;
  approvedAt: string;
  approvalComments?: string;
  publicationDate?: string;  // Optional scheduled publication
}
```
**Transitions**: generated/reviewed → approved

#### POST /api/reports/end-of-month/:id/publish
**Description**: Publish an approved report

**Request Body**:
```typescript
{
  publisherId: string;
  publishedAt: string;
  distributionList?: string[];  // Optional distribution list
  stakeholderNotification?: boolean; // Send notifications to stakeholders
}
```
**Transitions**: approved → published

#### POST /api/reports/end-of-month/:id/archive
**Description**: Archive a published report

**Request Body**:
```typescript
{
  archiverId: string;
  archivedAt: string;
  retentionPeriod?: number;  // Retention period in months
  archiveReason?: string;    // Reason for archiving
}
```
**Transitions**: published → archived

#### GET /api/reports/end-of-month/analytics
**Description**: Get comprehensive monthly analytics

**Response**:
```typescript
interface MonthlyReportAnalytics {
  totalReports: number;
  averageMonthlySales: number;
  topPerformingMonths: MonthlyComparisonData[];
  bottomPerformingMonths: MonthlyComparisonData[];
  salesTrends: MonthlySalesTrendSummary;
  productPerformance: MonthlyProductPerformanceSummary;
  stationComparison: MonthlyStationPerformanceData[];
}
```

---

## 🔧 Custom Hook Integration

### useEndOfMonthReport Hook

```typescript
const useEndOfMonthReport = (): UseEndOfMonthReportReturn => {
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
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pagination and filtering
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<EndOfMonthReportFilter>({});

  // ... hook implementation
};
```

### Key Methods

#### Report Generation
```typescript
// Auto-generate monthly report from consolidated data
const generateReport = async (monthInfo: MonthlyReportMonthInfo, stationId: string): Promise<EndOfMonthReportData | null> => {
  setIsGenerating(true);
  try {
    const response = await EndOfMonthReportAPI.generateReport({
      monthInfo,
      stationId,
      includeWeeklyBreakdown: true,
      includeProfitAnalysis: true,
      includeTrendForecasting: true,
      analysisDepth: 'comprehensive'
    });
    
    if (response.success) {
      setReports(prev => [response.data, ...prev]);
      toast.success(END_OF_MONTH_REPORT_MESSAGES.GENERATED);
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
// Approve report
const approveReport = async (id: string, approval: Omit<EndOfMonthReportApproval, 'reportId'>): Promise<boolean> => {
  setIsApproving(true);
  try {
    const response = await EndOfMonthReportAPI.approveReport(id, approval);
    if (response.success) {
      // Update local state
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, status: 'approved', ...approval } : report
      ));
      toast.success(END_OF_MONTH_REPORT_MESSAGES.APPROVED);
      return true;
    }
    // Handle error...
  } finally {
    setIsApproving(false);
  }
};

// Publish report
const publishReport = async (id: string): Promise<boolean> => {
  setIsPublishing(true);
  try {
    const response = await EndOfMonthReportAPI.publishReport(id);
    if (response.success) {
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, status: 'published' } : report
      ));
      toast.success(END_OF_MONTH_REPORT_MESSAGES.PUBLISHED);
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
// Validate report form data
const validateForm = (data: EndOfMonthReportFormData): boolean => {
  const errors: Record<string, string> = {};
  
  // Required field validation
  if (!data.monthInfo?.month) errors.month = 'Month is required';
  if (!data.monthInfo?.year) errors.year = 'Year is required';
  if (!data.stationId) errors.stationId = 'Station is required';
  
  // Monthly totals validation
  if (!data.monthlyTotals?.pms?.openingStock || data.monthlyTotals.pms.openingStock < 0) {
    errors.pmsOpeningStock = 'PMS opening stock must be greater than 0';
  }
  
  if (!data.monthlyTotals?.ago?.openingStock || data.monthlyTotals.ago.openingStock < 0) {
    errors.agoOpeningStock = 'AGO opening stock must be greater than 0';
  }
  
  // Profit analysis validation
  if (data.profitAnalysis?.totalRevenue && data.profitAnalysis.totalRevenue <= 0) {
    errors.totalRevenue = 'Total revenue must be greater than 0';
  }
  
  // Weekly breakdown validation
  if (data.weeklyBreakdown && data.weeklyBreakdown.length > 0) {
    const totalWeeklyVolume = data.weeklyBreakdown.reduce((sum, week) => 
      sum + (week.pms?.quantity || 0) + (week.ago?.quantity || 0), 0
    );
    const monthlyVolume = (data.monthlyTotals?.pms?.salesCost || 0) + 
                         (data.monthlyTotals?.ago?.salesCost || 0);
    
    if (Math.abs(totalWeeklyVolume - monthlyVolume) > 1000) {
      errors.weeklyBalance = 'Weekly breakdown volume does not match monthly totals';
    }
  }
  
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

---

## 🔄 Report Generation Workflow

### Automated Report Process
1. **Data Consolidation** - Aggregate weekly operational data for the month
2. **Financial Calculations** - Calculate comprehensive profit and loss metrics
3. **Pricing Analysis** - Analyze price volatility and pricing efficiency
4. **Trend Analysis** - Compare with historical data and generate forecasts
5. **Performance Rating** - Assign monthly performance classification
6. **Report Compilation** - Generate comprehensive monthly report

### Workflow States
1. **Draft** - Manual report creation
2. **Generated** - Auto-generated from monthly data consolidation
3. **Reviewed** - Under manual review by management
4. **Approved** - Approved for stakeholder distribution
5. **Published** - Available for all authorized stakeholders
6. **Archived** - Historical archive for compliance and analysis

### Role-Based Permissions

#### Station Manager
- View own station reports
- Request report generation
- Access basic monthly metrics

#### Admin
- View all station reports
- Generate reports for any station
- Review and approve reports
- Access comprehensive analytics
- Manage report workflow

#### Super Admin
- All admin permissions
- Publish approved reports
- Archive reports
- System-wide analytics access
- Stakeholder distribution management

### Report Generation Logic
```typescript
// Generate comprehensive monthly report
const generateComprehensiveReport = async (monthInfo: MonthlyReportMonthInfo, stationId: string) => {
  // 1. Consolidate weekly data for the month
  const weeklyData = await consolidateWeeklyData(monthInfo, stationId);
  
  // 2. Calculate monthly totals
  const monthlyTotals = calculateMonthlyTotals(weeklyData);
  
  // 3. Analyze pricing data
  const pricingData = analyzePricingData(weeklyData);
  
  // 4. Calculate profit analysis
  const profitAnalysis = calculateProfitAnalysis(monthlyTotals, pricingData);
  
  // 5. Generate trend analysis
  const trends = await generateTrendAnalysis(monthInfo, stationId, monthlyTotals);
  
  // 6. Create weekly breakdown
  const weeklyBreakdown = generateWeeklyBreakdown(weeklyData);
  
  return {
    monthInfo,
    stationId,
    monthlyTotals,
    weeklyBreakdown,
    pricingData,
    profitAnalysis,
    trends,
    status: 'generated'
  };
};
```

---

## 💼 Financial Analysis Logic

### Monthly Totals Calculation

#### Inventory Consolidation
```typescript
const calculateMonthlyTotals = (weeklyData: WeeklyOperationsData[]): MonthlyTotalsData => {
  const pmsData = consolidateProductData(weeklyData, 'pms');
  const agoData = consolidateProductData(weeklyData, 'ago');
  
  return {
    pms: {
      openingStock: pmsData.openingStock,
      supply: pmsData.totalSupply,
      availableStock: pmsData.openingStock + pmsData.totalSupply,
      salesCost: pmsData.totalSales,
      salesUnitPrice: pmsData.totalRevenue,
      unitPrice: pmsData.totalRevenue / pmsData.totalSales,
      closingStock: pmsData.openingStock + pmsData.totalSupply - pmsData.totalSales,
      closingDispensing: pmsData.finalDispenserReading,
      undergroundGains: pmsData.totalUndergroundGains,
      pumpGains: pmsData.totalPumpGains
    },
    ago: {
      openingStock: agoData.openingStock,
      supply: agoData.totalSupply,
      availableStock: agoData.openingStock + agoData.totalSupply,
      salesCost: agoData.totalSales,
      salesUnitPrice: agoData.totalRevenue,
      unitPrice: agoData.totalRevenue / agoData.totalSales,
      closingStock: agoData.openingStock + agoData.totalSupply - agoData.totalSales,
      closingDispensing: agoData.finalDispenserReading,
      undergroundGains: agoData.totalUndergroundGains,
      pumpGains: agoData.totalPumpGains
    },
    pms_value: calculateProductValues(pmsData),
    ago_value: calculateProductValues(agoData)
  };
};
```

#### Profit Analysis Calculation
```typescript
const calculateProfitAnalysis = (monthlyTotals: MonthlyTotalsData, pricingData: MonthlyPricingData): MonthlyProfitAnalysis => {
  // Calculate revenue
  const pmsRevenue = monthlyTotals.pms.salesUnitPrice;
  const agoRevenue = monthlyTotals.ago.salesUnitPrice;
  const totalRevenue = pmsRevenue + agoRevenue;
  
  // Calculate cost of goods sold
  const pmsCost = monthlyTotals.pms.salesCost * getPMSCostPrice();
  const agoCost = monthlyTotals.ago.salesCost * getAGOCostPrice();
  const totalCost = pmsCost + agoCost;
  
  // Calculate profit metrics
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = (grossProfit / totalRevenue) * 100;
  
  // Estimate operating expenses (10% of revenue)
  const operatingExpenses = totalRevenue * 0.10;
  const netProfit = grossProfit - operatingExpenses;
  
  // Calculate ROI
  const roi = (netProfit / totalCost) * 100;
  
  return {
    totalRevenue,
    totalCost,
    grossProfit,
    profitMargin,
    operatingExpenses,
    netProfit,
    roi,
    breakdownByProduct: {
      pms: {
        revenue: pmsRevenue,
        cost: pmsCost,
        profit: pmsRevenue - pmsCost,
        margin: ((pmsRevenue - pmsCost) / pmsRevenue) * 100,
        contribution: ((pmsRevenue - pmsCost) / grossProfit) * 100
      },
      ago: {
        revenue: agoRevenue,
        cost: agoCost,
        profit: agoRevenue - agoCost,
        margin: ((agoRevenue - agoCost) / agoRevenue) * 100,
        contribution: ((agoRevenue - agoCost) / grossProfit) * 100
      }
    }
  };
};
```

#### Pricing Analysis
```typescript
const analyzePricingData = (weeklyData: WeeklyOperationsData[]): MonthlyPricingData => {
  const pmsPricing = analyzeProductPricing(weeklyData, 'pms');
  const agoPricing = analyzeProductPricing(weeklyData, 'ago');
  
  return {
    pms: pmsPricing,
    ago: agoPricing
  };
};

const analyzeProductPricing = (weeklyData: WeeklyOperationsData[], product: 'pms' | 'ago'): ProductPricingData => {
  const weeklyPrices = extractWeeklyPrices(weeklyData, product);
  const weeklyVolumes = extractWeeklyVolumes(weeklyData, product);
  
  // Calculate volume-weighted average price
  const totalRevenue = weeklyPrices.reduce((sum, price, index) => sum + (price * weeklyVolumes[index]), 0);
  const totalVolume = weeklyVolumes.reduce((sum, volume) => sum + volume, 0);
  const averagePrice = totalRevenue / totalVolume;
  
  // Calculate price volatility
  const priceVolatility = calculatePriceVolatility(weeklyPrices);
  
  return {
    basePrice: weeklyPrices[0], // First week's price as base
    averagePrice,
    maxPrice: Math.max(...weeklyPrices),
    minPrice: Math.min(...weeklyPrices),
    priceVolatility,
    weeklyPeriods: generateWeeklyPricingPeriods(weeklyData, product)
  };
};

const calculatePriceVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(variance);
  
  return (standardDeviation / mean) * 100; // Coefficient of variation as percentage
};
```

### Trend Analysis and Forecasting

#### Historical Comparison
```typescript
const generateTrendAnalysis = async (monthInfo: MonthlyReportMonthInfo, stationId: string, monthlyTotals: MonthlyTotalsData): Promise<MonthlyTrendData> => {
  // Get previous month data
  const previousMonth = await getPreviousMonthData(monthInfo, stationId);
  const currentMonthRevenue = monthlyTotals.pms.salesUnitPrice + monthlyTotals.ago.salesUnitPrice;
  
  // Calculate month-over-month comparison
  const previousMonthComparison = currentMonthRevenue - (previousMonth?.totalRevenue || 0);
  const previousMonthPercentChange = previousMonth?.totalRevenue ? 
    (previousMonthComparison / previousMonth.totalRevenue) * 100 : 0;
  
  // Get year-over-year data
  const yearOverYearData = await getYearOverYearData(monthInfo, stationId);
  const yearOverYearChange = yearOverYearData ? 
    ((currentMonthRevenue - yearOverYearData.totalRevenue) / yearOverYearData.totalRevenue) * 100 : 0;
  
  // Determine trend direction
  const monthlyTrend = classifyMonthlyTrend(previousMonthPercentChange);
  
  // Identify seasonal pattern
  const seasonalPattern = identifySeasonalPattern(monthInfo, yearOverYearChange);
  
  // Calculate performance rating
  const performance = calculateMonthlyPerformance(monthlyTotals, previousMonth, yearOverYearData);
  
  // Generate forecast
  const forecastNextMonth = generateNextMonthForecast(currentMonthRevenue, previousMonthPercentChange, seasonalPattern);
  
  return {
    previousMonthComparison,
    previousMonthPercentChange,
    yearOverYearChange,
    monthlyTrend,
    seasonalPattern,
    performance,
    forecastNextMonth
  };
};
```

#### Performance Classification
```typescript
const calculateMonthlyPerformance = (current: MonthlyTotalsData, previous: any, yearOverYear: any): 'excellent' | 'good' | 'average' | 'below_average' | 'poor' => {
  const score = calculatePerformanceScore(current, previous, yearOverYear);
  
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  if (score >= 40) return 'below_average';
  return 'poor';
};

const calculatePerformanceScore = (current: MonthlyTotalsData, previous: any, yearOverYear: any): number => {
  let score = 0;
  
  // Revenue growth component (40%)
  const currentRevenue = current.pms.salesUnitPrice + current.ago.salesUnitPrice;
  const revenueGrowth = previous ? ((currentRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0;
  
  if (revenueGrowth > 15) score += 40;
  else if (revenueGrowth > 10) score += 35;
  else if (revenueGrowth > 5) score += 30;
  else if (revenueGrowth > 0) score += 25;
  else score += 10;
  
  // Volume efficiency component (30%)
  const totalVolume = current.pms.salesCost + current.ago.salesCost;
  const volumeEfficiency = currentRevenue / totalVolume; // Revenue per liter
  
  if (volumeEfficiency > 19) score += 30;
  else if (volumeEfficiency > 18) score += 25;
  else if (volumeEfficiency > 17) score += 20;
  else score += 10;
  
  // Inventory management component (20%)
  const inventoryTurnover = calculateInventoryTurnover(current);
  if (inventoryTurnover > 8) score += 20;
  else if (inventoryTurnover > 6) score += 15;
  else if (inventoryTurnover > 4) score += 10;
  else score += 5;
  
  // Year-over-year growth component (10%)
  const yoyGrowth = yearOverYear ? ((currentRevenue - yearOverYear.totalRevenue) / yearOverYear.totalRevenue) * 100 : 0;
  if (yoyGrowth > 20) score += 10;
  else if (yoyGrowth > 15) score += 8;
  else if (yoyGrowth > 10) score += 6;
  else if (yoyGrowth > 0) score += 4;
  else score += 1;
  
  return Math.min(score, 100);
};
```

#### Forecasting Algorithm
```typescript
const generateNextMonthForecast = (currentRevenue: number, growthRate: number, seasonalPattern: string): number => {
  // Base forecast using linear trend
  const trendForecast = currentRevenue * (1 + (growthRate / 100));
  
  // Apply seasonal adjustments
  const seasonalMultiplier = getSeasonalMultiplier(seasonalPattern);
  const seasonalAdjustedForecast = trendForecast * seasonalMultiplier;
  
  // Apply volatility dampening (reduce extreme predictions)
  const volatilityFactor = Math.min(Math.abs(growthRate), 25) / 100; // Cap at 25%
  const dampedForecast = currentRevenue + (seasonalAdjustedForecast - currentRevenue) * (1 - volatilityFactor * 0.5);
  
  return Math.max(dampedForecast, currentRevenue * 0.8); // Minimum 80% of current revenue
};

const getSeasonalMultiplier = (pattern: string): number => {
  const multipliers: Record<string, number> = {
    'holiday_surge': 1.20,      // December holiday boost
    'back_to_school': 1.10,     // September increase
    'summer_travel': 1.15,      // June-August increase
    'post_holiday_dip': 0.90,   // January decrease
    'normal': 1.02,             // Normal growth
    'stable': 1.00,             // No seasonal effect
    'declining': 0.95           // Declining trend
  };
  
  return multipliers[pattern] || 1.00;
};
```

---

## 🚨 Error Handling

### Report-Specific Error Types
```typescript
enum EndOfMonthReportErrorType {
  GENERATION_ERROR = 'GENERATION_ERROR',
  DATA_CONSOLIDATION_ERROR = 'DATA_CONSOLIDATION_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  PROFIT_ANALYSIS_ERROR = 'PROFIT_ANALYSIS_ERROR',
  TREND_ANALYSIS_ERROR = 'TREND_ANALYSIS_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  APPROVAL_ERROR = 'APPROVAL_ERROR',
  PUBLISH_ERROR = 'PUBLISH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

interface EndOfMonthReportError {
  type: EndOfMonthReportErrorType;
  message: string;
  details?: Record<string, any>;
  reportId?: string;
  recommendations?: string[];
}
```

### Data Quality Validation
```typescript
const validateMonthlyData = (monthlyTotals: MonthlyTotalsData, weeklyData: WeeklyBreakdownData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check data completeness
  if (weeklyData.length < 4) {
    warnings.push('Incomplete month data - less than 4 weeks of data available');
  }
  
  // Validate inventory balance
  const pmsInventoryBalance = validateInventoryBalance(monthlyTotals.pms);
  if (!pmsInventoryBalance.isValid) {
    errors.push(`PMS inventory imbalance: ${pmsInventoryBalance.discrepancy.toFixed(2)} liters`);
  }
  
  const agoInventoryBalance = validateInventoryBalance(monthlyTotals.ago);
  if (!agoInventoryBalance.isValid) {
    errors.push(`AGO inventory imbalance: ${agoInventoryBalance.discrepancy.toFixed(2)} liters`);
  }
  
  // Check weekly vs monthly totals consistency
  const weeklyVolumeSum = weeklyData.reduce((sum, week) => 
    sum + week.pms.quantity + week.ago.quantity, 0
  );
  const monthlyVolumeSum = monthlyTotals.pms.salesCost + monthlyTotals.ago.salesCost;
  const volumeDiscrepancy = Math.abs(weeklyVolumeSum - monthlyVolumeSum);
  
  if (volumeDiscrepancy > 500) { // Allow 500L tolerance
    warnings.push(`Weekly/monthly volume discrepancy: ${volumeDiscrepancy.toFixed(2)} liters`);
  }
  
  // Check for unusual profit margins
  const totalRevenue = monthlyTotals.pms.salesUnitPrice + monthlyTotals.ago.salesUnitPrice;
  const estimatedCost = (monthlyTotals.pms.salesCost * 15.5) + (monthlyTotals.ago.salesCost * 17.8);
  const profitMargin = ((totalRevenue - estimatedCost) / totalRevenue) * 100;
  
  if (profitMargin < 5) {
    warnings.push(`Low profit margin detected: ${profitMargin.toFixed(2)}%`);
  } else if (profitMargin > 30) {
    warnings.push(`Unusually high profit margin: ${profitMargin.toFixed(2)}%`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQualityScore: calculateDataQualityScore(monthlyTotals, weeklyData)
  };
};

const validateInventoryBalance = (productData: ProductMonthlyTotals): { isValid: boolean; discrepancy: number } => {
  const expectedClosing = productData.openingStock + productData.supply - productData.salesCost;
  const actualClosing = productData.closingStock;
  const discrepancy = Math.abs(expectedClosing - actualClosing);
  
  return {
    isValid: discrepancy <= 200, // Allow 200L tolerance
    discrepancy
  };
};
```

---

## ⚡ Performance Considerations

### Efficient Data Consolidation
```typescript
// Optimized monthly report generation with parallel processing
class MonthlyReportGenerator {
  private cache = new Map<string, any>();
  
  async generateReport(monthInfo: MonthlyReportMonthInfo, stationId: string): Promise<EndOfMonthReportData> {
    const cacheKey = `${stationId}-${monthInfo.year}-${monthInfo.monthIndex}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Parallel data collection
    const [weeklyData, historicalData, stationData, pricingHistory] = await Promise.all([
      this.getWeeklyDataForMonth(monthInfo, stationId),
      this.getHistoricalDataForTrends(stationId, 12), // Last 12 months
      this.getStationMetadata(stationId),
      this.getPricingHistoryForMonth(monthInfo, stationId)
    ]);
    
    // Sequential calculations (order-dependent)
    const monthlyTotals = this.calculateMonthlyTotals(weeklyData);
    const weeklyBreakdown = this.generateWeeklyBreakdown(weeklyData);
    const pricingData = this.analyzePricingData(weeklyData, pricingHistory);
    const profitAnalysis = this.calculateProfitAnalysis(monthlyTotals, pricingData);
    const trends = this.generateTrendAnalysis(monthInfo, stationId, monthlyTotals, historicalData);
    
    const report = {
      monthInfo,
      stationId,
      stationName: stationData.name,
      monthlyTotals,
      weeklyBreakdown,
      pricingData,
      profitAnalysis,
      trends,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'system'
    };
    
    // Cache result
    this.cache.set(cacheKey, report);
    
    // Schedule cache cleanup
    setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000); // 1 hour
    
    return report;
  }
}
```

### Memory-Efficient Historical Analysis
```typescript
// Stream-based processing for large historical datasets
const processHistoricalTrends = async (stationId: string, monthCount: number) => {
  const trendData: MonthlyComparisonData[] = [];
  
  // Process data in chunks to avoid memory issues
  const chunkSize = 24; // 2 years at a time
  for (let offset = 0; offset < monthCount; offset += chunkSize) {
    const chunk = await getHistoricalDataChunk(stationId, offset, Math.min(chunkSize, monthCount - offset));
    
    // Process chunk with trend calculations
    const processedChunk = chunk.map((month, index) => ({
      ...month,
      trend: calculateTrend(month, chunk[index - 1]),
      percentChange: calculatePercentChange(month, chunk[index - 1]),
      seasonalAdjustment: calculateSeasonalAdjustment(month)
    }));
    
    trendData.push(...processedChunk);
    
    // Yield control to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return trendData;
};
```

---

## 📊 Advanced Analytics

### Comprehensive Analytics Structure
```typescript
interface MonthlyReportAnalytics {
  totalReports: number;
  averageMonthlySales: number;
  topPerformingMonths: MonthlyComparisonData[];
  bottomPerformingMonths: MonthlyComparisonData[];
  salesTrends: MonthlySalesTrendSummary;
  productPerformance: MonthlyProductPerformanceSummary;
  stationComparison: MonthlyStationPerformanceData[];
  profitabilityMetrics: ProfitabilityAnalytics;
  seasonalInsights: SeasonalAnalytics;
  forecastAccuracy: ForecastAnalytics;
}

// Profitability analysis
interface ProfitabilityAnalytics {
  averageProfitMargin: number;
  profitTrend: number;
  mostProfitableProduct: string;
  profitVolatility: number;
  roiTrend: number;
}

// Seasonal pattern analysis
interface SeasonalAnalytics {
  peakMonths: string[];
  lowMonths: string[];
  seasonalityStrength: number;
  holidayImpact: number;
  weatherCorrelation?: number;
}

// Forecast accuracy tracking
interface ForecastAnalytics {
  averageAccuracy: number;
  accuracyTrend: number;
  bestForecastMonth: string;
  worstForecastMonth: string;
  forecastBias: number;
}
```

### Export and Distribution
```typescript
// Export monthly report in multiple formats with stakeholder customization
const exportMonthlyReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv', stakeholderType?: 'management' | 'finance' | 'operations'): Promise<Blob> => {
  const report = await getReportById(reportId);
  const analytics = await getAnalyticsForReport(reportId);
  
  // Customize data based on stakeholder type
  const customizedData = customizeDataForStakeholder(report, analytics, stakeholderType);
  
  const exportData: EndOfMonthReportExportData = {
    reportType: 'end-of-month-report',
    reportData: customizedData.report,
    comparisonData: customizedData.comparison,
    analytics: customizedData.analytics,
    exportFormat: format,
    generatedAt: new Date().toISOString(),
    generatedBy: getCurrentUser().id
  };
  
  switch (format) {
    case 'pdf':
      return await generateExecutivePDFReport(exportData);
    case 'excel':
      return await generateDetailedExcelReport(exportData);
    case 'csv':
      return await generateDataCSVReport(exportData);
    default:
      throw new Error('Unsupported export format');
  }
};

const customizeDataForStakeholder = (report: EndOfMonthReportData, analytics: MonthlyReportAnalytics, stakeholderType?: string) => {
  switch (stakeholderType) {
    case 'management':
      return {
        report: {
          ...report,
          // Focus on high-level metrics
          monthlyTotals: summarizeForManagement(report.monthlyTotals),
          weeklyBreakdown: [] // Exclude detailed weekly data
        },
        comparison: analytics.topPerformingMonths.slice(0, 6),
        analytics: {
          ...analytics,
          // Focus on strategic metrics
          salesTrends: analytics.salesTrends,
          profitabilityMetrics: analytics.profitabilityMetrics
        }
      };
    case 'finance':
      return {
        report: {
          ...report,
          // Include all financial details
        },
        comparison: analytics.topPerformingMonths.concat(analytics.bottomPerformingMonths),
        analytics: {
          ...analytics,
          // Focus on financial metrics
          profitabilityMetrics: analytics.profitabilityMetrics
        }
      };
    case 'operations':
      return {
        report: {
          ...report,
          // Focus on operational metrics
          weeklyBreakdown: report.weeklyBreakdown, // Include detailed breakdown
          pricingData: report.pricingData
        },
        comparison: analytics.topPerformingMonths.slice(0, 3),
        analytics: {
          ...analytics,
          // Focus on operational efficiency
          productPerformance: analytics.productPerformance
        }
      };
    default:
      return { report, comparison: analytics.topPerformingMonths, analytics };
  }
};
```

---

## 🧪 Testing Strategy

### Monthly Report Generation Tests
```typescript
describe('End of Month Report Generation', () => {
  test('should generate comprehensive report from monthly data', async () => {
    const mockMonthlyData = createMockMonthlyData();
    const monthInfo = createMockMonthInfo('JAN', 2025);
    
    const result = await generateReport(monthInfo, 'station-001');
    
    expect(result).toMatchObject({
      monthlyTotals: expect.objectContaining({
        pms: expect.any(Object),
        ago: expect.any(Object)
      }),
      profitAnalysis: expect.objectContaining({
        totalRevenue: expect.any(Number),
        grossProfit: expect.any(Number),
        profitMargin: expect.any(Number)
      }),
      trends: expect.objectContaining({
        previousMonthPercentChange: expect.any(Number),
        performance: expect.stringMatching(/excellent|good|average|below_average|poor/)
      })
    });
  });
  
  test('should handle incomplete monthly data gracefully', async () => {
    const incompleteMonthlyData = createIncompleteMonthlyData();
    
    await expect(generateReport(monthInfo, 'station-001'))
      .rejects.toThrow('Insufficient monthly data for report generation');
  });
  
  test('should calculate accurate profit margins', () => {
    const monthlyTotals = createMockMonthlyTotals();
    const pricingData = createMockPricingData();
    
    const profitAnalysis = calculateProfitAnalysis(monthlyTotals, pricingData);
    
    expect(profitAnalysis.profitMargin).toBeGreaterThan(0);
    expect(profitAnalysis.breakdownByProduct.pms.contribution + 
           profitAnalysis.breakdownByProduct.ago.contribution).toBeCloseTo(100, 1);
  });
});
```

### Financial Calculation Tests
```typescript
describe('Monthly Financial Calculations', () => {
  test('should calculate monthly totals correctly', () => {
    const weeklyData = createMockWeeklyData();
    
    const monthlyTotals = calculateMonthlyTotals(weeklyData);
    
    expect(monthlyTotals.pms.availableStock).toBe(
      monthlyTotals.pms.openingStock + monthlyTotals.pms.supply
    );
    expect(monthlyTotals.pms.closingStock).toBe(
      monthlyTotals.pms.availableStock - monthlyTotals.pms.salesCost
    );
  });
  
  test('should validate inventory balance within tolerance', () => {
    const productData = createMockProductData();
    
    const validation = validateInventoryBalance(productData);
    
    expect(validation.isValid).toBe(true);
    expect(validation.discrepancy).toBeLessThan(200);
  });
  
  test('should generate accurate forecasts', () => {
    const currentRevenue = 1000000;
    const growthRate = 8.5;
    const seasonalPattern = 'normal';
    
    const forecast = generateNextMonthForecast(currentRevenue, growthRate, seasonalPattern);
    
    expect(forecast).toBeGreaterThan(currentRevenue * 0.8);
    expect(forecast).toBeLessThan(currentRevenue * 1.3);
  });
});
```

---

## 📝 Usage Examples

### Basic Report Generation
```tsx
import React, { useState } from 'react';
import { useEndOfMonthReport } from '../hooks/useEndOfMonthReport';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

const MonthlyReportGenerator: React.FC = () => {
  const { generateReport, isGenerating } = useEndOfMonthReport();
  const [selectedMonth, setSelectedMonth] = useState<MonthlyReportMonthInfo | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>('');
  
  const handleGenerateReport = async () => {
    if (!selectedMonth || !selectedStation) {
      toast.error('Please select month and station');
      return;
    }
    
    try {
      const report = await generateReport(selectedMonth, selectedStation);
      if (report) {
        toast.success('Monthly report generated successfully');
        // Handle success (e.g., navigate to report view)
      }
    } catch (error) {
      toast.error('Failed to generate monthly report');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MonthSelector onMonthSelect={setSelectedMonth} />
        <StationSelector onStationSelect={setSelectedStation} />
      </div>
      
      <Button 
        onClick={handleGenerateReport}
        disabled={isGenerating || !selectedMonth || !selectedStation}
        className="w-full"
      >
        {isGenerating ? 'Generating Report...' : 'Generate Monthly Report'}
      </Button>
    </div>
  );
};
```

### Advanced Analytics Dashboard
```tsx
const MonthlyAnalyticsDashboard: React.FC = () => {
  const { 
    analytics, 
    reports, 
    isLoading, 
    getAnalytics,
    filters,
    setFilters 
  } = useEndOfMonthReport();
  
  useEffect(() => {
    getAnalytics();
  }, []);
  
  if (isLoading) return <AnalyticsLoadingSkeleton />;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Average Monthly Sales"
          value={formatCurrency(analytics?.averageMonthlySales || 0)}
          trend={analytics?.salesTrends.overallTrend}
          icon="TrendingUp"
        />
        <MetricCard
          title="Total Reports"
          value={analytics?.totalReports || 0}
          description="Generated this year"
          icon="FileText"
        />
        <MetricCard
          title="Profit Margin"
          value={`${analytics?.profitabilityMetrics.averageProfitMargin || 0}%`}
          trend={analytics?.profitabilityMetrics.profitTrend > 0 ? 'up' : 'down'}
          icon="DollarSign"
        />
        <MetricCard
          title="Forecast Accuracy"
          value={`${analytics?.forecastAccuracy.averageAccuracy || 0}%`}
          description="Prediction accuracy"
          icon="Target"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySalesTrendChart data={analytics?.salesTrends} />
        <ProductProfitabilityChart data={analytics?.productPerformance} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeasonalPatternsChart data={analytics?.seasonalInsights} />
        <StationComparisonChart data={analytics?.stationComparison} />
      </div>
      
      <div className="space-y-4">
        <h3>Recent Monthly Reports</h3>
        <MonthlyReportTable 
          data={reports}
          onViewReport={handleViewReport}
          onApproveReport={handleApproveReport}
          onPublishReport={handlePublishReport}
        />
      </div>
    </div>
  );
};
```

---

This comprehensive backend documentation provides all the necessary information for implementing, maintaining, and extending the End of Month Report system in the KTC Energy Management System. The documentation covers monthly data consolidation, comprehensive financial analysis, profit calculations, trend forecasting, and stakeholder-specific reporting necessary for strategic fuel station business management.