# Annual Report Backend Documentation
## KTC Energy Management System

### Overview
The Annual Report system provides comprehensive yearly fuel station performance analysis, consolidating monthly data into strategic business insights including annual totals, quarterly analysis, seasonal trends, and multi-year comparisons. This system serves as the highest-level reporting tool for executive decision-making and long-term strategic planning.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Custom Hook Integration](#custom-hook-integration)
5. [Report Generation Workflow](#report-generation-workflow)
6. [Strategic Analysis Logic](#strategic-analysis-logic)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)

---

## 🏗️ System Architecture

### Components Overview
- **`/types/annualReport.ts`** - TypeScript type definitions for annual reporting
- **`/constants/annualReportConstants.ts`** - Configuration, sample data, and business rules
- **`/hooks/useAnnualReport.ts`** - Custom hook for API integration and state management
- **`/components/AnnualReport.tsx`** - Main UI component for annual report management

### Integration Pattern
```typescript
// Component Integration Example
import { useAnnualReport } from '../hooks/useAnnualReport';

const AnnualReportManager = () => {
  const {
    reports,
    analytics,
    isLoading,
    generateReport,
    approveReport,
    publishReport
  } = useAnnualReport();
  
  // Component logic...
};
```

---

## 📊 Data Models

### Core Data Structure

#### AnnualReportData
```typescript
interface AnnualReportData {
  id: string;                           // Unique identifier
  yearInfo: AnnualReportYearInfo;       // Year period information
  stationId: string;                    // Station identifier
  stationName: string;                  // Station display name
  annualTotals: AnnualTotalsData;       // Consolidated annual totals
  monthlyBreakdown: MonthlyBreakdownData[]; // Monthly performance breakdown
  quarterlyBreakdown: QuarterlyBreakdownData[]; // Quarterly analysis
  pricingData: AnnualPricingData;       // Annual pricing analysis and seasonality
  profitAnalysis: AnnualProfitAnalysis; // Comprehensive profit and ROI analysis
  trends: AnnualTrendData;              // Trend analysis and strategic forecasting
  status: AnnualReportStatus;           // Workflow status
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  analyzedBy: string;                   // User ID who generated report
  approvedBy?: string;                  // User ID who approved
  approvedAt?: string;                  // Approval timestamp
}
```

#### AnnualReportYearInfo
```typescript
interface AnnualReportYearInfo {
  year: number;             // 2025, 2024, etc.
  dateRange: string;        // "01/01/24 - 31/12/24"
  totalDays: number;        // Total days in year (365/366)
  businessDays: number;     // Working days in year
  completedMonths: number;  // Number of completed months
  timePeriod: string;       // "Year 2024"
}
```

#### AnnualTotalsData
```typescript
interface AnnualTotalsData {
  pms: ProductAnnualTotals;     // Petrol annual totals
  ago: ProductAnnualTotals;     // Diesel annual totals
  rate?: ProductAnnualTotals;   // Premium/Rate totals (optional)
  pms_value: ProductValueTotals; // Petrol financial values
  ago_value: ProductValueTotals; // Diesel financial values
}

interface ProductAnnualTotals {
  openingStock: number;         // Liters at year start
  totalSupply: number;          // Total liters received during year
  availableStock: number;       // Total available for sale
  totalSales: number;           // Total liters sold during year
  totalSalesValue: number;      // Total sales revenue (GHS)
  averageUnitPrice: number;     // Volume-weighted average price (GHS)
  closingStock: number;         // Liters remaining at year end
  totalGains: number;           // Total gains/losses (liters)
  averageMonthlySales: number;  // Average monthly sales volume
  peakMonthSales: number;       // Highest monthly sales volume
  lowestMonthSales: number;     // Lowest monthly sales volume
}

interface ProductValueTotals {
  openingStock: number;         // GHS value of opening stock
  totalSupply: number;          // GHS value of annual supply
  availableStock: number;       // GHS value available for sale
  totalSales: number;           // GHS cost of goods sold
  totalSalesValue: number;      // GHS annual sales revenue
  totalGains: number;           // GHS value of gains/losses
  averageMonthlyValue: number;  // Average monthly sales value
}
```

#### MonthlyBreakdownData
```typescript
interface MonthlyBreakdownData {
  month: string;              // "JAN", "FEB", etc.
  monthNumber: number;        // 1-12
  year: number;               // 2024, 2025, etc.
  dateRange: string;          // "01-31 Jan"
  pms: MonthlyProductData;    // Petrol monthly data
  ago: MonthlyProductData;    // Diesel monthly data
  totalSales: number;         // Total monthly volume (liters)
  totalValue: number;         // Total monthly sales value (GHS)
  growth: number;             // Month-over-month growth percentage
  trend: 'up' | 'down' | 'stable' | 'peak'; // Trend classification
}

interface MonthlyProductData {
  quantity: number;           // Volume sold (liters)
  price: number;              // Average price (GHS/liter)
  priceAdjustment: number;    // Price adjustment from previous month
  salesValue: number;         // Total sales value (GHS)
  dailyAverage: number;       // Average daily volume (liters)
  growth: number;             // Growth percentage from previous month
}
```

#### QuarterlyBreakdownData
```typescript
interface QuarterlyBreakdownData {
  quarter: string;            // "Q1", "Q2", "Q3", "Q4"
  period: string;             // "Jan-Mar", "Apr-Jun", etc.
  months: string[];           // ["JAN", "FEB", "MAR"]
  pms: QuarterlyProductData;  // Petrol quarterly data
  ago: QuarterlyProductData;  // Diesel quarterly data
  totalSales: number;         // Total quarterly volume (liters)
  totalValue: number;         // Total quarterly sales value (GHS)
  growth: number;             // Quarter-over-quarter growth percentage
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'; // Performance rating
}

interface QuarterlyProductData {
  quantity: number;           // Quarterly volume sold (liters)
  averagePrice: number;       // Volume-weighted average price (GHS)
  salesValue: number;         // Quarterly sales value (GHS)
  monthlyAverage: number;     // Average monthly volume within quarter
  growth: number;             // Growth percentage from previous quarter
}
```

#### AnnualPricingData
```typescript
interface AnnualPricingData {
  pms: ProductAnnualPricingData; // Petrol pricing analysis
  ago: ProductAnnualPricingData; // Diesel pricing analysis
}

interface ProductAnnualPricingData {
  averagePrice: number;              // Volume-weighted annual average price (GHS)
  maxPrice: number;                  // Highest price during year (GHS)
  minPrice: number;                  // Lowest price during year (GHS)
  priceVolatility: number;           // Annual price volatility index
  monthlyPeriods: MonthlyPricingPeriod[]; // Monthly pricing breakdown
  seasonalAdjustments: SeasonalPricingData[]; // Quarterly seasonal analysis
}

interface MonthlyPricingPeriod {
  month: string;              // "JAN", "FEB", etc.
  period: string;             // "January", "February", etc.
  averagePrice: number;       // Monthly average price (GHS)
  quantity: number;           // Volume sold at this price (liters)
  salesValue: number;         // Revenue at this price (GHS)
  priceAdjustment: number;    // Adjustment from previous month (GHS)
}

interface SeasonalPricingData {
  season: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // Quarter designation
  period: string;             // "Jan-Mar", "Apr-Jun", etc.
  averagePrice: number;       // Quarterly average price (GHS)
  priceVolatility: number;    // Quarterly price volatility
  seasonalFactor: number;     // Seasonal price adjustment factor
}
```

#### AnnualProfitAnalysis
```typescript
interface AnnualProfitAnalysis {
  totalRevenue: number;               // Total annual revenue (GHS)
  totalCost: number;                  // Total cost of goods sold (GHS)
  grossProfit: number;                // Annual gross profit (GHS)
  profitMargin: number;               // Gross profit margin (%)
  operatingExpenses: number;          // Annual operating expenses (GHS)
  netProfit: number;                  // Net profit after expenses (GHS)
  roi: number;                        // Return on investment (%)
  quarterlyBreakdown: QuarterlyProfitData[]; // Quarterly profit breakdown
  breakdownByProduct: {
    pms: ProductProfitData;           // Petrol profit analysis
    ago: ProductProfitData;           // Diesel profit analysis
  };
}

interface QuarterlyProfitData {
  quarter: string;            // "Q1", "Q2", "Q3", "Q4"
  revenue: number;            // Quarterly revenue (GHS)
  cost: number;               // Quarterly cost (GHS)
  profit: number;             // Quarterly profit (GHS)
  margin: number;             // Quarterly profit margin (%)
  growth: number;             // Quarter-over-quarter growth (%)
}

interface ProductProfitData {
  revenue: number;            // Product annual revenue (GHS)
  cost: number;               // Product annual cost (GHS)
  profit: number;             // Product annual profit (GHS)
  margin: number;             // Product profit margin (%)
  contribution: number;       // Contribution to total profit (%)
  averageMonthlyProfit: number; // Average monthly profit (GHS)
}
```

#### AnnualTrendData
```typescript
interface AnnualTrendData {
  previousYearComparison: number;     // Revenue difference from previous year (GHS)
  previousYearPercentChange: number;  // Year-over-year growth percentage
  growthTrend: 'strong_growth' | 'growth' | 'stable' | 'decline' | 'strong_decline'; // Growth classification
  seasonalPattern: string;            // Seasonal pattern description
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'; // Annual performance rating
  forecastNextYear: number;           // Forecasted next year revenue (GHS)
  bestPerformingQuarter: string;      // Quarter with highest performance
  worstPerformingQuarter: string;     // Quarter with lowest performance
  consistencyScore: number;           // Consistency score (0-100)
}
```

### Status Management

#### AnnualReportStatus
```typescript
type AnnualReportStatus = 
  | 'draft'        // Initial draft state
  | 'generated'    // Auto-generated from annual data consolidation
  | 'reviewed'     // Under executive review
  | 'approved'     // Approved by senior management
  | 'published'    // Published for stakeholder distribution
  | 'archived';    // Archived for historical reference

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
const ANNUAL_REPORT_ENDPOINTS = {
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
```

### API Methods

#### GET /api/reports/annual
**Description**: Retrieve annual reports with filtering and pagination

**Query Parameters**:
```typescript
interface AnnualReportFilter {
  stationId?: string;           // Filter by station
  status?: AnnualReportStatus;  // Filter by status
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
interface AnnualReportResponse {
  success: boolean;
  data: AnnualReportData[];
  total: number;          // Total items count
  page: number;           // Current page
  limit: number;          // Items per page
  message?: string;       // Optional message
}
```

#### GET /api/reports/annual/:id
**Description**: Retrieve a specific annual report

**Response**:
```typescript
interface AnnualReportSingleResponse {
  success: boolean;
  data: AnnualReportData;
  message?: string;
}
```

#### POST /api/reports/annual
**Description**: Create a new annual report manually

**Request Body**:
```typescript
interface AnnualReportSubmission {
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
```

#### POST /api/reports/annual/generate
**Description**: Auto-generate annual report from consolidated monthly data

**Request Body**:
```typescript
{
  yearInfo: AnnualReportYearInfo;
  stationId: string;
  includeMonthlyBreakdown: boolean;     // Whether to include monthly analysis
  includeQuarterlyBreakdown: boolean;   // Whether to include quarterly analysis
  includeProfitAnalysis: boolean;       // Whether to calculate detailed profit metrics
  includeSeasonalAnalysis: boolean;     // Whether to generate seasonal insights
  includeTrendForecasting: boolean;     // Whether to generate trend forecasts
  analysisDepth: 'basic' | 'detailed' | 'comprehensive' | 'executive';
}
```

**Response**: Returns generated `AnnualReportData`

#### PUT /api/reports/annual/:id
**Description**: Update an existing report
**Note**: Only allowed for 'draft' and 'generated' status

#### DELETE /api/reports/annual/:id
**Description**: Delete a report
**Note**: Only allowed for 'draft' status

#### POST /api/reports/annual/:id/approve
**Description**: Approve a generated report

**Request Body**:
```typescript
interface AnnualReportApproval {
  reportId: string;
  approverId: string;
  isApproved: boolean;
  approvedAt: string;
  approvalComments?: string;
  publicationDate?: string;  // Optional scheduled publication
  distributionScope?: 'internal' | 'board' | 'stakeholders' | 'public';
}
```
**Transitions**: generated/reviewed → approved

#### POST /api/reports/annual/:id/publish
**Description**: Publish an approved report

**Request Body**:
```typescript
{
  publisherId: string;
  publishedAt: string;
  distributionList?: string[];  // Optional distribution list
  executiveSummary?: boolean;   // Whether to generate executive summary
  stakeholderNotification?: boolean; // Send notifications to stakeholders
  pressRelease?: boolean;       // Whether to prepare press release version
}
```
**Transitions**: approved → published

#### POST /api/reports/annual/:id/archive
**Description**: Archive a published report

**Request Body**:
```typescript
{
  archiverId: string;
  archivedAt: string;
  retentionPeriod?: number;     // Retention period in years
  archiveReason?: string;       // Reason for archiving
  complianceRequirement?: boolean; // Whether archived for compliance
}
```
**Transitions**: published → archived

#### GET /api/reports/annual/analytics
**Description**: Get comprehensive annual analytics

**Response**:
```typescript
interface AnnualReportAnalytics {
  totalReports: number;
  averageAnnualSales: number;
  topPerformingYears: AnnualComparisonData[];
  bottomPerformingYears: AnnualComparisonData[];
  salesTrends: AnnualSalesTrendSummary;
  productPerformance: AnnualProductPerformanceSummary;
  stationComparison: AnnualStationPerformanceData[];
}
```

---

## 🔧 Custom Hook Integration

### useAnnualReport Hook

```typescript
const useAnnualReport = (): UseAnnualReportReturn => {
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
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pagination and filtering
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<AnnualReportFilter>({});

  // ... hook implementation
};
```

### Key Methods

#### Report Generation
```typescript
// Auto-generate annual report from consolidated monthly data
const generateReport = async (yearInfo: AnnualReportYearInfo, stationId: string): Promise<AnnualReportData | null> => {
  setIsGenerating(true);
  try {
    const response = await AnnualReportAPI.generateReport({
      yearInfo,
      stationId,
      includeMonthlyBreakdown: true,
      includeQuarterlyBreakdown: true,
      includeProfitAnalysis: true,
      includeSeasonalAnalysis: true,
      includeTrendForecasting: true,
      analysisDepth: 'comprehensive'
    });
    
    if (response.success) {
      setReports(prev => [response.data, ...prev]);
      toast.success(ANNUAL_REPORT_MESSAGES.GENERATED);
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
const approveReport = async (id: string, approval: Omit<AnnualReportApproval, 'reportId'>): Promise<boolean> => {
  setIsApproving(true);
  try {
    const response = await AnnualReportAPI.approveReport(id, approval);
    if (response.success) {
      // Update local state
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, status: 'approved', ...approval } : report
      ));
      toast.success(ANNUAL_REPORT_MESSAGES.APPROVED);
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
    const response = await AnnualReportAPI.publishReport(id);
    if (response.success) {
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, status: 'published' } : report
      ));
      toast.success(ANNUAL_REPORT_MESSAGES.PUBLISHED);
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
// Validate annual report form data
const validateForm = (data: AnnualReportFormData): boolean => {
  const errors: Record<string, string> = {};
  
  // Required field validation
  if (!data.yearInfo?.year) errors.year = 'Year is required';
  if (!data.stationId) errors.stationId = 'Station is required';
  
  // Annual totals validation
  if (!data.annualTotals?.pms?.totalSales || data.annualTotals.pms.totalSales <= 0) {
    errors.pmsTotalSales = 'PMS total sales must be greater than 0';
  }
  
  if (!data.annualTotals?.ago?.totalSales || data.annualTotals.ago.totalSales <= 0) {
    errors.agoTotalSales = 'AGO total sales must be greater than 0';
  }
  
  // Profit analysis validation
  if (data.profitAnalysis?.totalRevenue && data.profitAnalysis.totalRevenue <= 0) {
    errors.totalRevenue = 'Total revenue must be greater than 0';
  }
  
  // Monthly breakdown validation
  if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
    const monthlyVolumeSum = data.monthlyBreakdown.reduce((sum, month) => 
      sum + (month.pms?.quantity || 0) + (month.ago?.quantity || 0), 0
    );
    const annualVolume = (data.annualTotals?.pms?.totalSales || 0) + 
                        (data.annualTotals?.ago?.totalSales || 0);
    
    if (Math.abs(monthlyVolumeSum - annualVolume) > 5000) {
      errors.monthlyBalance = 'Monthly breakdown volume does not match annual totals';
    }
  }
  
  // Quarterly breakdown validation
  if (data.quarterlyBreakdown && data.quarterlyBreakdown.length !== 4) {
    errors.quarterlyBreakdown = 'Annual report must include all 4 quarters';
  }
  
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

---

## 🔄 Report Generation Workflow

### Automated Report Process
1. **Data Consolidation** - Aggregate monthly reports for the entire year
2. **Annual Calculations** - Calculate comprehensive annual totals and averages
3. **Quarterly Analysis** - Generate quarterly breakdowns and seasonality patterns
4. **Financial Analysis** - Calculate ROI, profit margins, and cost analysis
5. **Trend Analysis** - Compare with previous years and generate forecasts
6. **Strategic Insights** - Generate executive summary and recommendations

### Workflow States
1. **Draft** - Manual report creation for preliminary analysis
2. **Generated** - Auto-generated from annual data consolidation
3. **Reviewed** - Under executive and management review
4. **Approved** - Approved for stakeholder distribution
5. **Published** - Available for all authorized stakeholders
6. **Archived** - Historical archive for compliance and multi-year analysis

### Role-Based Permissions

#### Station Manager
- View own station annual reports
- Request annual report generation
- Access basic annual metrics and trends

#### Admin
- View all station annual reports
- Generate reports for any station
- Review and validate annual data
- Access comprehensive analytics
- Manage report workflow

#### Super Admin
- All admin permissions
- Approve annual reports for publication
- Publish reports to stakeholders
- Archive reports for compliance
- System-wide strategic analytics access
- Executive summary generation

### Report Generation Logic
```typescript
// Generate comprehensive annual report
const generateComprehensiveAnnualReport = async (yearInfo: AnnualReportYearInfo, stationId: string) => {
  // 1. Consolidate monthly data for the year
  const monthlyReports = await consolidateMonthlyData(yearInfo, stationId);
  
  // 2. Calculate annual totals
  const annualTotals = calculateAnnualTotals(monthlyReports);
  
  // 3. Generate quarterly breakdowns
  const quarterlyBreakdown = generateQuarterlyBreakdown(monthlyReports);
  
  // 4. Analyze pricing data and seasonality
  const pricingData = analyzeAnnualPricingData(monthlyReports);
  
  // 5. Calculate comprehensive profit analysis
  const profitAnalysis = calculateAnnualProfitAnalysis(annualTotals, pricingData);
  
  // 6. Generate trend analysis and forecasting
  const trends = await generateAnnualTrendAnalysis(yearInfo, stationId, annualTotals);
  
  // 7. Create monthly breakdown
  const monthlyBreakdown = generateMonthlyBreakdown(monthlyReports);
  
  return {
    yearInfo,
    stationId,
    annualTotals,
    monthlyBreakdown,
    quarterlyBreakdown,
    pricingData,
    profitAnalysis,
    trends,
    status: 'generated'
  };
};
```

---

## 💼 Strategic Analysis Logic

### Annual Totals Calculation

#### Yearly Consolidation
```typescript
const calculateAnnualTotals = (monthlyReports: MonthlyReportData[]): AnnualTotalsData => {
  const pmsData = consolidateAnnualProductData(monthlyReports, 'pms');
  const agoData = consolidateAnnualProductData(monthlyReports, 'ago');
  
  return {
    pms: {
      openingStock: pmsData.openingStock,
      totalSupply: pmsData.totalSupply,
      availableStock: pmsData.openingStock + pmsData.totalSupply,
      totalSales: pmsData.totalSales,
      totalSalesValue: pmsData.totalSalesValue,
      averageUnitPrice: pmsData.totalSalesValue / pmsData.totalSales,
      closingStock: pmsData.closingStock,
      totalGains: pmsData.totalGains,
      averageMonthlySales: pmsData.totalSales / 12,
      peakMonthSales: Math.max(...pmsData.monthlySales),
      lowestMonthSales: Math.min(...pmsData.monthlySales)
    },
    ago: {
      openingStock: agoData.openingStock,
      totalSupply: agoData.totalSupply,
      availableStock: agoData.openingStock + agoData.totalSupply,
      totalSales: agoData.totalSales,
      totalSalesValue: agoData.totalSalesValue,
      averageUnitPrice: agoData.totalSalesValue / agoData.totalSales,
      closingStock: agoData.closingStock,
      totalGains: agoData.totalGains,
      averageMonthlySales: agoData.totalSales / 12,
      peakMonthSales: Math.max(...agoData.monthlySales),
      lowestMonthSales: Math.min(...agoData.monthlySales)
    },
    pms_value: calculateAnnualProductValues(pmsData),
    ago_value: calculateAnnualProductValues(agoData)
  };
};
```

#### Quarterly Analysis
```typescript
const generateQuarterlyBreakdown = (monthlyReports: MonthlyReportData[]): QuarterlyBreakdownData[] => {
  const quarters = groupMonthsByQuarter(monthlyReports);
  
  return quarters.map((quarter, index) => {
    const quarterNumber = index + 1;
    const quarterName = `Q${quarterNumber}`;
    const period = getQuarterPeriod(quarterNumber);
    const months = getQuarterMonths(quarterNumber);
    
    const pmsData = aggregateQuarterlyProductData(quarter, 'pms');
    const agoData = aggregateQuarterlyProductData(quarter, 'ago');
    
    const totalSales = pmsData.quantity + agoData.quantity;
    const totalValue = pmsData.salesValue + agoData.salesValue;
    
    // Calculate quarter-over-quarter growth
    const previousQuarter = index > 0 ? quarters[index - 1] : null;
    const growth = previousQuarter ? 
      calculateQuarterlyGrowth(quarter, previousQuarter) : 0;
    
    return {
      quarter: quarterName,
      period,
      months,
      pms: {
        quantity: pmsData.quantity,
        averagePrice: pmsData.salesValue / pmsData.quantity,
        salesValue: pmsData.salesValue,
        monthlyAverage: pmsData.quantity / 3,
        growth: pmsData.growth
      },
      ago: {
        quantity: agoData.quantity,
        averagePrice: agoData.salesValue / agoData.quantity,
        salesValue: agoData.salesValue,
        monthlyAverage: agoData.quantity / 3,
        growth: agoData.growth
      },
      totalSales,
      totalValue,
      growth,
      performance: classifyQuarterlyPerformance(totalSales, totalValue, growth)
    };
  });
};
```

#### Annual Profit Analysis
```typescript
const calculateAnnualProfitAnalysis = (annualTotals: AnnualTotalsData, pricingData: AnnualPricingData): AnnualProfitAnalysis => {
  // Calculate total revenue
  const pmsRevenue = annualTotals.pms.totalSalesValue;
  const agoRevenue = annualTotals.ago.totalSalesValue;
  const totalRevenue = pmsRevenue + agoRevenue;
  
  // Calculate cost of goods sold
  const pmsCost = annualTotals.pms.totalSales * getPMSAnnualCostPrice();
  const agoCost = annualTotals.ago.totalSales * getAGOAnnualCostPrice();
  const totalCost = pmsCost + agoCost;
  
  // Calculate profit metrics
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = (grossProfit / totalRevenue) * 100;
  
  // Estimate operating expenses (12% of revenue for annual scale)
  const operatingExpenses = totalRevenue * 0.12;
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
    quarterlyBreakdown: generateQuarterlyProfitBreakdown(monthlyReports),
    breakdownByProduct: {
      pms: {
        revenue: pmsRevenue,
        cost: pmsCost,
        profit: pmsRevenue - pmsCost,
        margin: ((pmsRevenue - pmsCost) / pmsRevenue) * 100,
        contribution: ((pmsRevenue - pmsCost) / grossProfit) * 100,
        averageMonthlyProfit: (pmsRevenue - pmsCost) / 12
      },
      ago: {
        revenue: agoRevenue,
        cost: agoCost,
        profit: agoRevenue - agoCost,
        margin: ((agoRevenue - agoCost) / agoRevenue) * 100,
        contribution: ((agoRevenue - agoCost) / grossProfit) * 100,
        averageMonthlyProfit: (agoRevenue - agoCost) / 12
      }
    }
  };
};
```

### Trend Analysis and Strategic Forecasting

#### Year-over-Year Analysis
```typescript
const generateAnnualTrendAnalysis = async (yearInfo: AnnualReportYearInfo, stationId: string, annualTotals: AnnualTotalsData): Promise<AnnualTrendData> => {
  // Get previous year data
  const previousYear = await getPreviousYearData(yearInfo, stationId);
  const currentYearRevenue = annualTotals.pms.totalSalesValue + annualTotals.ago.totalSalesValue;
  
  // Calculate year-over-year comparison
  const previousYearComparison = currentYearRevenue - (previousYear?.totalRevenue || 0);
  const previousYearPercentChange = previousYear?.totalRevenue ? 
    (previousYearComparison / previousYear.totalRevenue) * 100 : 0;
  
  // Determine growth trend classification
  const growthTrend = classifyGrowthTrend(previousYearPercentChange);
  
  // Identify seasonal patterns
  const seasonalPattern = identifyAnnualSeasonalPattern(yearInfo, previousYearPercentChange);
  
  // Calculate performance rating
  const performance = calculateAnnualPerformance(annualTotals, previousYear);
  
  // Generate strategic forecast
  const forecastNextYear = generateStrategicForecast(currentYearRevenue, previousYearPercentChange, seasonalPattern);
  
  // Analyze quarterly performance
  const quarterlyPerformance = analyzeQuarterlyPerformance(quarterlyBreakdown);
  
  return {
    previousYearComparison,
    previousYearPercentChange,
    growthTrend,
    seasonalPattern,
    performance,
    forecastNextYear,
    bestPerformingQuarter: quarterlyPerformance.best,
    worstPerformingQuarter: quarterlyPerformance.worst,
    consistencyScore: calculateConsistencyScore(quarterlyBreakdown)
  };
};
```

#### Strategic Performance Classification
```typescript
const calculateAnnualPerformance = (current: AnnualTotalsData, previous: any): 'excellent' | 'good' | 'average' | 'below_average' | 'poor' => {
  const score = calculateAnnualPerformanceScore(current, previous);
  
  if (score >= 95) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 65) return 'average';
  if (score >= 45) return 'below_average';
  return 'poor';
};

const calculateAnnualPerformanceScore = (current: AnnualTotalsData, previous: any): number => {
  let score = 0;
  
  // Revenue growth component (35%)
  const currentRevenue = current.pms.totalSalesValue + current.ago.totalSalesValue;
  const revenueGrowth = previous ? ((currentRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0;
  
  if (revenueGrowth > 20) score += 35;
  else if (revenueGrowth > 15) score += 30;
  else if (revenueGrowth > 10) score += 25;
  else if (revenueGrowth > 5) score += 20;
  else if (revenueGrowth > 0) score += 15;
  else score += 5;
  
  // Volume efficiency component (25%)
  const totalVolume = current.pms.totalSales + current.ago.totalSales;
  const volumeEfficiency = currentRevenue / totalVolume; // Revenue per liter
  
  if (volumeEfficiency > 19.5) score += 25;
  else if (volumeEfficiency > 18.5) score += 20;
  else if (volumeEfficiency > 17.5) score += 15;
  else score += 8;
  
  // Market expansion component (20%)
  const volumeGrowth = previous ? ((totalVolume - previous.totalVolume) / previous.totalVolume) * 100 : 0;
  if (volumeGrowth > 15) score += 20;
  else if (volumeGrowth > 10) score += 16;
  else if (volumeGrowth > 5) score += 12;
  else if (volumeGrowth > 0) score += 8;
  else score += 3;
  
  // Operational consistency component (20%)
  const consistencyScore = calculateOperationalConsistency(current);
  score += (consistencyScore / 100) * 20;
  
  return Math.min(score, 100);
};
```

#### Strategic Forecasting Algorithm
```typescript
const generateStrategicForecast = (currentRevenue: number, growthRate: number, seasonalPattern: string): number => {
  // Multi-factor forecasting model
  
  // 1. Trend-based forecast
  const trendForecast = currentRevenue * (1 + (growthRate / 100));
  
  // 2. Seasonal adjustment
  const seasonalMultiplier = getStrategicSeasonalMultiplier(seasonalPattern);
  const seasonalAdjustedForecast = trendForecast * seasonalMultiplier;
  
  // 3. Market maturity factor
  const maturityFactor = calculateMarketMaturityFactor(currentRevenue, growthRate);
  
  // 4. Economic environment factor
  const economicFactor = getEconomicEnvironmentFactor(); // External economic indicators
  
  // 5. Combine factors with weights
  const weightedForecast = seasonalAdjustedForecast * maturityFactor * economicFactor;
  
  // 6. Apply strategic constraints
  const minForecast = currentRevenue * 0.85; // Minimum 15% decline scenario
  const maxForecast = currentRevenue * 1.35; // Maximum 35% growth scenario
  
  return Math.max(minForecast, Math.min(maxForecast, weightedForecast));
};

const getStrategicSeasonalMultiplier = (pattern: string): number => {
  const multipliers: Record<string, number> = {
    'strong_q1_q4': 1.12,        // Strong year-end and new year performance
    'consistent': 1.05,          // Steady consistent growth
    'summer_peak': 1.08,         // Summer driving season strength
    'holiday_driven': 1.15,      // Holiday season dependency
    'economic_sensitive': 0.98,  // Economic downturn sensitivity
    'stable': 1.03,              // Stable growth pattern
    'volatile': 0.95             // High volatility pattern
  };
  
  return multipliers[pattern] || 1.00;
};
```

### Seasonal and Quarterly Analysis

#### Seasonal Pattern Recognition
```typescript
const identifyAnnualSeasonalPattern = (yearInfo: AnnualReportYearInfo, growthRate: number): string => {
  const quarterlyPerformance = analyzeQuarterlySeasonality(yearInfo);
  
  // Strong Q1 and Q4 pattern
  if (quarterlyPerformance.Q1 > 1.05 && quarterlyPerformance.Q4 > 1.10) {
    return 'strong_q1_q4';
  }
  
  // Summer peak pattern (Q2-Q3)
  if (quarterlyPerformance.Q2 > 1.08 && quarterlyPerformance.Q3 > 1.08) {
    return 'summer_peak';
  }
  
  // Holiday-driven pattern (Q4 dominant)
  if (quarterlyPerformance.Q4 > 1.15) {
    return 'holiday_driven';
  }
  
  // Economic sensitivity (low growth, high volatility)
  if (growthRate < 5 && calculateQuarterlyVolatility(quarterlyPerformance) > 0.15) {
    return 'economic_sensitive';
  }
  
  // Volatile pattern (high quarterly variation)
  if (calculateQuarterlyVolatility(quarterlyPerformance) > 0.20) {
    return 'volatile';
  }
  
  // Consistent pattern (low quarterly variation)
  if (calculateQuarterlyVolatility(quarterlyPerformance) < 0.08) {
    return 'consistent';
  }
  
  return 'stable';
};
```

---

## 🚨 Error Handling

### Annual Report-Specific Error Types
```typescript
enum AnnualReportErrorType {
  GENERATION_ERROR = 'GENERATION_ERROR',
  DATA_CONSOLIDATION_ERROR = 'DATA_CONSOLIDATION_ERROR',
  QUARTERLY_ANALYSIS_ERROR = 'QUARTERLY_ANALYSIS_ERROR',
  TREND_FORECASTING_ERROR = 'TREND_FORECASTING_ERROR',
  PROFIT_ANALYSIS_ERROR = 'PROFIT_ANALYSIS_ERROR',
  SEASONAL_ANALYSIS_ERROR = 'SEASONAL_ANALYSIS_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  APPROVAL_ERROR = 'APPROVAL_ERROR',
  PUBLISH_ERROR = 'PUBLISH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

interface AnnualReportError {
  type: AnnualReportErrorType;
  message: string;
  details?: Record<string, any>;
  reportId?: string;
  year?: number;
  recommendations?: string[];
}
```

### Data Integrity Validation
```typescript
const validateAnnualData = (annualTotals: AnnualTotalsData, monthlyData: MonthlyReportData[], quarterlyData: QuarterlyBreakdownData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check data completeness
  if (monthlyData.length < 12) {
    warnings.push(`Incomplete year data - only ${monthlyData.length} months available`);
  }
  
  if (quarterlyData.length < 4) {
    errors.push(`Missing quarterly data - only ${quarterlyData.length} quarters available`);
  }
  
  // Validate annual vs monthly totals consistency
  const monthlyVolumeSum = monthlyData.reduce((sum, month) => 
    sum + month.pms.quantity + month.ago.quantity, 0
  );
  const annualVolumeSum = annualTotals.pms.totalSales + annualTotals.ago.totalSales;
  const volumeDiscrepancy = Math.abs(monthlyVolumeSum - annualVolumeSum);
  
  if (volumeDiscrepancy > 2000) { // Allow 2000L tolerance for annual
    errors.push(`Annual/monthly volume discrepancy: ${volumeDiscrepancy.toFixed(2)} liters`);
  }
  
  // Validate quarterly vs annual consistency
  const quarterlyVolumeSum = quarterlyData.reduce((sum, quarter) => 
    sum + quarter.totalSales, 0
  );
  const quarterlyDiscrepancy = Math.abs(quarterlyVolumeSum - annualVolumeSum);
  
  if (quarterlyDiscrepancy > 1500) {
    warnings.push(`Quarterly/annual volume discrepancy: ${quarterlyDiscrepancy.toFixed(2)} liters`);
  }
  
  // Check for unrealistic annual growth
  const totalRevenue = annualTotals.pms.totalSalesValue + annualTotals.ago.totalSalesValue;
  if (totalRevenue < 1000000) { // Less than 1M GHS seems low for annual
    warnings.push(`Low annual revenue detected: ₵${totalRevenue.toLocaleString()}`);
  }
  
  // Check inventory balance
  const pmsInventoryBalance = validateAnnualInventoryBalance(annualTotals.pms);
  if (!pmsInventoryBalance.isValid) {
    errors.push(`PMS annual inventory imbalance: ${pmsInventoryBalance.discrepancy.toFixed(2)} liters`);
  }
  
  const agoInventoryBalance = validateAnnualInventoryBalance(annualTotals.ago);
  if (!agoInventoryBalance.isValid) {
    errors.push(`AGO annual inventory imbalance: ${agoInventoryBalance.discrepancy.toFixed(2)} liters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    dataQualityScore: calculateAnnualDataQualityScore(annualTotals, monthlyData, quarterlyData)
  };
};

const validateAnnualInventoryBalance = (productData: ProductAnnualTotals): { isValid: boolean; discrepancy: number } => {
  const expectedClosing = productData.openingStock + productData.totalSupply - productData.totalSales;
  const actualClosing = productData.closingStock;
  const discrepancy = Math.abs(expectedClosing - actualClosing);
  
  return {
    isValid: discrepancy <= 1000, // Allow 1000L tolerance for annual
    discrepancy
  };
};
```

---

## ⚡ Performance Considerations

### Efficient Annual Data Processing
```typescript
// Optimized annual report generation with parallel processing and caching
class AnnualReportGenerator {
  private cache = new Map<string, any>();
  private processingQueue = new Map<string, Promise<any>>();
  
  async generateReport(yearInfo: AnnualReportYearInfo, stationId: string): Promise<AnnualReportData> {
    const cacheKey = `${stationId}-${yearInfo.year}`;
    
    // Check if already processing
    if (this.processingQueue.has(cacheKey)) {
      return await this.processingQueue.get(cacheKey);
    }
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Start processing
    const processingPromise = this.performAnnualAnalysis(yearInfo, stationId);
    this.processingQueue.set(cacheKey, processingPromise);
    
    try {
      const report = await processingPromise;
      
      // Cache result
      this.cache.set(cacheKey, report);
      
      // Schedule cache cleanup (longer for annual data)
      setTimeout(() => this.cache.delete(cacheKey), 4 * 60 * 60 * 1000); // 4 hours
      
      return report;
    } finally {
      this.processingQueue.delete(cacheKey);
    }
  }
  
  private async performAnnualAnalysis(yearInfo: AnnualReportYearInfo, stationId: string) {
    // Parallel data collection with chunked processing
    const [monthlyData, historicalData, stationData, marketData] = await Promise.all([
      this.getMonthlyDataForYear(yearInfo, stationId),
      this.getMultiYearHistoricalData(stationId, 5), // Last 5 years
      this.getStationMetadata(stationId),
      this.getMarketDataForYear(yearInfo.year)
    ]);
    
    // Process data in chunks to avoid memory issues
    const annualTotals = await this.calculateAnnualTotalsChunked(monthlyData);
    const monthlyBreakdown = await this.generateMonthlyBreakdownChunked(monthlyData);
    const quarterlyBreakdown = await this.generateQuarterlyBreakdownChunked(monthlyData);
    
    // Sequential calculations (order-dependent)
    const pricingData = this.analyzeAnnualPricingData(monthlyData, marketData);
    const profitAnalysis = this.calculateAnnualProfitAnalysis(annualTotals, pricingData);
    const trends = await this.generateAnnualTrendAnalysis(yearInfo, stationId, annualTotals, historicalData);
    
    return {
      yearInfo,
      stationId,
      stationName: stationData.name,
      annualTotals,
      monthlyBreakdown,
      quarterlyBreakdown,
      pricingData,
      profitAnalysis,
      trends,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedBy: 'system'
    };
  }
  
  private async calculateAnnualTotalsChunked(monthlyData: MonthlyReportData[]) {
    // Process in quarterly chunks for memory efficiency
    const quarters = this.chunkByQuarter(monthlyData);
    const quarterlyTotals = await Promise.all(
      quarters.map(quarter => this.processQuarterTotals(quarter))
    );
    
    return this.consolidateQuarterlyTotals(quarterlyTotals);
  }
}
```

### Memory-Efficient Multi-Year Analysis
```typescript
// Stream-based processing for historical trend analysis
const processMultiYearTrends = async (stationId: string, yearCount: number) => {
  const trendData: AnnualComparisonData[] = [];
  
  // Process data in yearly chunks to avoid memory issues
  const chunkSize = 3; // 3 years at a time
  for (let offset = 0; offset < yearCount; offset += chunkSize) {
    const yearChunk = await getHistoricalYearChunk(stationId, offset, Math.min(chunkSize, yearCount - offset));
    
    // Process chunk with trend calculations
    const processedChunk = yearChunk.map((year, index) => ({
      ...year,
      trend: calculateYearOverYearTrend(year, yearChunk[index - 1]),
      percentChange: calculateYearOverYearChange(year, yearChunk[index - 1]),
      consistencyScore: calculateYearlyConsistency(year)
    }));
    
    trendData.push(...processedChunk);
    
    // Yield control to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return trendData;
};
```

---

## 📊 Executive Analytics

### Strategic Analytics Structure
```typescript
interface AnnualReportAnalytics {
  totalReports: number;
  averageAnnualSales: number;
  topPerformingYears: AnnualComparisonData[];
  bottomPerformingYears: AnnualComparisonData[];
  salesTrends: AnnualSalesTrendSummary;
  productPerformance: AnnualProductPerformanceSummary;
  stationComparison: AnnualStationPerformanceData[];
  strategicInsights: StrategicInsights;
  executiveSummary: ExecutiveSummary;
  complianceMetrics: ComplianceMetrics;
}

// Strategic business insights
interface StrategicInsights {
  marketPosition: MarketPositionAnalysis;
  growthOpportunities: GrowthOpportunity[];
  riskFactors: RiskFactor[];
  competitiveAdvantages: string[];
  strategicRecommendations: StrategicRecommendation[];
}

// Executive summary for board reporting
interface ExecutiveSummary {
  keyHighlights: string[];
  financialPerformance: FinancialSummary;
  operationalEfficiency: OperationalSummary;
  marketOutlook: MarketOutlook;
  actionItems: ActionItem[];
}

// Compliance and regulatory metrics
interface ComplianceMetrics {
  reportingCompliance: number;
  dataQualityScore: number;
  auditReadiness: number;
  regulatoryRequirements: ComplianceRequirement[];
}
```

### Executive Export and Distribution
```typescript
// Executive-level export with stakeholder customization
const exportExecutiveReport = async (reportId: string, stakeholderLevel: 'board' | 'executive' | 'management' | 'investor'): Promise<Blob> => {
  const report = await getReportById(reportId);
  const analytics = await getAnalyticsForReport(reportId);
  const strategicInsights = await generateStrategicInsights(report, analytics);
  
  // Customize data based on stakeholder level
  const customizedData = customizeForStakeholder(report, analytics, strategicInsights, stakeholderLevel);
  
  const exportData: AnnualReportExportData = {
    reportType: 'annual-report',
    reportData: customizedData.report,
    comparisonData: customizedData.comparison,
    analytics: customizedData.analytics,
    exportFormat: 'pdf', // Executive reports typically PDF
    generatedAt: new Date().toISOString(),
    generatedBy: getCurrentUser().id
  };
  
  switch (stakeholderLevel) {
    case 'board':
      return await generateBoardPresentationPDF(exportData);
    case 'executive':
      return await generateExecutiveSummaryPDF(exportData);
    case 'management':
      return await generateManagementReportPDF(exportData);
    case 'investor':
      return await generateInvestorReportPDF(exportData);
    default:
      return await generateComprehensivePDF(exportData);
  }
};

const customizeForStakeholder = (report: AnnualReportData, analytics: AnnualReportAnalytics, insights: StrategicInsights, level: string) => {
  switch (level) {
    case 'board':
      return {
        report: {
          // High-level strategic metrics only
          yearInfo: report.yearInfo,
          stationName: report.stationName,
          annualTotals: summarizeForBoard(report.annualTotals),
          profitAnalysis: {
            totalRevenue: report.profitAnalysis.totalRevenue,
            grossProfit: report.profitAnalysis.grossProfit,
            netProfit: report.profitAnalysis.netProfit,
            roi: report.profitAnalysis.roi
          },
          trends: {
            previousYearPercentChange: report.trends.previousYearPercentChange,
            growthTrend: report.trends.growthTrend,
            performance: report.trends.performance,
            forecastNextYear: report.trends.forecastNextYear
          }
        },
        comparison: analytics.topPerformingYears.slice(0, 3),
        analytics: {
          salesTrends: analytics.salesTrends,
          strategicInsights: insights
        }
      };
    case 'executive':
      return {
        report: {
          ...report,
          // Focus on strategic and operational metrics
          monthlyBreakdown: [], // Exclude detailed monthly data
          quarterlyBreakdown: report.quarterlyBreakdown // Keep quarterly view
        },
        comparison: analytics.topPerformingYears.concat(analytics.bottomPerformingYears),
        analytics: {
          ...analytics,
          strategicInsights: insights
        }
      };
    default:
      return { report, comparison: analytics.topPerformingYears, analytics };
  }
};
```

---

## 🧪 Testing Strategy

### Annual Report Generation Tests
```typescript
describe('Annual Report Generation', () => {
  test('should generate comprehensive annual report from monthly data', async () => {
    const mockMonthlyData = createMockAnnualData(12); // Full year
    const yearInfo = createMockYearInfo(2024);
    
    const result = await generateReport(yearInfo, 'station-001');
    
    expect(result).toMatchObject({
      annualTotals: expect.objectContaining({
        pms: expect.any(Object),
        ago: expect.any(Object)
      }),
      quarterlyBreakdown: expect.arrayContaining([
        expect.objectContaining({
          quarter: expect.stringMatching(/Q[1-4]/),
          performance: expect.stringMatching(/excellent|good|average|below_average|poor/)
        })
      ]),
      profitAnalysis: expect.objectContaining({
        totalRevenue: expect.any(Number),
        grossProfit: expect.any(Number),
        roi: expect.any(Number)
      }),
      trends: expect.objectContaining({
        previousYearPercentChange: expect.any(Number),
        growthTrend: expect.stringMatching(/strong_growth|growth|stable|decline|strong_decline/),
        forecastNextYear: expect.any(Number)
      })
    });
  });
  
  test('should handle partial year data gracefully', async () => {
    const incompleteAnnualData = createMockAnnualData(8); // Only 8 months
    
    const result = await generateReport(yearInfo, 'station-001');
    
    expect(result.yearInfo.completedMonths).toBe(8);
    expect(result.status).toBe('generated');
    // Should still generate report with warnings
  });
  
  test('should calculate accurate quarterly breakdowns', () => {
    const monthlyData = createMockMonthlyData();
    
    const quarters = generateQuarterlyBreakdown(monthlyData);
    
    expect(quarters).toHaveLength(4);
    expect(quarters[0].quarter).toBe('Q1');
    expect(quarters[0].months).toEqual(['JAN', 'FEB', 'MAR']);
    expect(quarters[0].totalSales).toBeGreaterThan(0);
  });
  
  test('should generate accurate forecasts', () => {
    const currentRevenue = 50000000; // 50M GHS
    const growthRate = 12.5;
    const seasonalPattern = 'strong_q1_q4';
    
    const forecast = generateStrategicForecast(currentRevenue, growthRate, seasonalPattern);
    
    expect(forecast).toBeGreaterThan(currentRevenue * 0.85);
    expect(forecast).toBeLessThan(currentRevenue * 1.35);
    expect(forecast).toBeCloseTo(currentRevenue * 1.125 * 1.12, -5); // Approximate expected value
  });
});
```

### Strategic Analysis Tests
```typescript
describe('Annual Strategic Analysis', () => {
  test('should classify performance ratings correctly', () => {
    const excellentData = createHighPerformanceAnnualData();
    const averageData = createAveragePerformanceAnnualData();
    const poorData = createPoorPerformanceAnnualData();
    
    expect(calculateAnnualPerformance(excellentData, null)).toBe('excellent');
    expect(calculateAnnualPerformance(averageData, null)).toBe('average');
    expect(calculateAnnualPerformance(poorData, null)).toBe('poor');
  });
  
  test('should identify seasonal patterns correctly', () => {
    const q1Q4StrongData = createQ1Q4StrongData();
    const summerPeakData = createSummerPeakData();
    const volatileData = createVolatileData();
    
    expect(identifyAnnualSeasonalPattern(yearInfo, q1Q4StrongData)).toBe('strong_q1_q4');
    expect(identifyAnnualSeasonalPattern(yearInfo, summerPeakData)).toBe('summer_peak');
    expect(identifyAnnualSeasonalPattern(yearInfo, volatileData)).toBe('volatile');
  });
  
  test('should validate annual data integrity', () => {
    const validAnnualData = createValidAnnualData();
    const invalidAnnualData = createInvalidAnnualData();
    
    const validResult = validateAnnualData(validAnnualData.totals, validAnnualData.monthly, validAnnualData.quarterly);
    const invalidResult = validateAnnualData(invalidAnnualData.totals, invalidAnnualData.monthly, invalidAnnualData.quarterly);
    
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});
```

---

## 📝 Usage Examples

### Executive Report Generation
```tsx
import React, { useState } from 'react';
import { useAnnualReport } from '../hooks/useAnnualReport';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

const ExecutiveReportGenerator: React.FC = () => {
  const { generateReport, isGenerating } = useAnnualReport();
  const [selectedYear, setSelectedYear] = useState<AnnualReportYearInfo | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>('');
  
  const handleGenerateExecutiveReport = async () => {
    if (!selectedYear || !selectedStation) {
      toast.error('Please select year and station');
      return;
    }
    
    try {
      const report = await generateReport(selectedYear, selectedStation);
      if (report) {
        toast.success('Annual executive report generated successfully');
        // Handle success (e.g., navigate to executive dashboard)
      }
    } catch (error) {
      toast.error('Failed to generate annual report');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <YearSelector onYearSelect={setSelectedYear} />
        <StationSelector onStationSelect={setSelectedStation} />
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Executive Annual Report</h3>
        <p className="text-gray-600 mb-4">
          Generate comprehensive annual performance report for executive and board review.
        </p>
        <Button 
          onClick={handleGenerateExecutiveReport}
          disabled={isGenerating || !selectedYear || !selectedStation}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isGenerating ? 'Generating Executive Report...' : 'Generate Annual Report'}
        </Button>
      </div>
    </div>
  );
};
```

### Strategic Analytics Dashboard
```tsx
const StrategicAnalyticsDashboard: React.FC = () => {
  const { 
    analytics, 
    reports, 
    isLoading, 
    getAnalytics,
    filters,
    setFilters 
  } = useAnnualReport();
  
  useEffect(() => {
    getAnalytics();
  }, []);
  
  if (isLoading) return <ExecutiveLoadingSkeleton />;
  
  return (
    <div className="space-y-8">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ExecutiveMetricCard
          title="Annual Revenue"
          value={formatCurrency(analytics?.averageAnnualSales || 0)}
          trend={analytics?.salesTrends.overallTrend}
          change={`${analytics?.salesTrends.yearOverYearChange || 0}%`}
          icon="DollarSign"
        />
        <ExecutiveMetricCard
          title="Growth Rate"
          value={`${analytics?.salesTrends.growthRate || 0}%`}
          trend={analytics?.salesTrends.growthRate > 0 ? 'up' : 'down'}
          change="Year-over-year"
          icon="TrendingUp"
        />
        <ExecutiveMetricCard
          title="Market Position"
          value={analytics?.stationComparison[0]?.rank || 'N/A'}
          description="Industry ranking"
          icon="Award"
        />
        <ExecutiveMetricCard
          title="Consistency Score"
          value={`${analytics?.salesTrends.consistency || 0}/100`}
          description="Operational stability"
          icon="Target"
        />
      </div>
      
      {/* Strategic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnnualRevenueGrowthChart data={analytics?.salesTrends} />
        <QuarterlyPerformanceChart data={analytics?.quarterlyBreakdown} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductMixAnalysisChart data={analytics?.productPerformance} />
        <SeasonalTrendsChart data={analytics?.seasonalInsights} />
      </div>
      
      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Strategic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StrategicInsightCard
            title="Growth Opportunities"
            insights={analytics?.strategicInsights?.growthOpportunities || []}
            icon="Growth"
          />
          <StrategicInsightCard
            title="Risk Factors"
            insights={analytics?.strategicInsights?.riskFactors || []}
            icon="AlertTriangle"
          />
        </div>
      </div>
      
      {/* Executive Report Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Annual Reports</h3>
        <AnnualReportTable 
          data={reports}
          onViewReport={handleViewReport}
          onApproveReport={handleApproveReport}
          onPublishReport={handlePublishReport}
          onExportExecutive={handleExportExecutive}
        />
      </div>
    </div>
  );
};
```

---

This comprehensive backend documentation provides all the necessary information for implementing, maintaining, and extending the Annual Report system in the KTC Energy Management System. The documentation covers strategic business analysis, multi-year forecasting, executive reporting, quarterly seasonality analysis, and comprehensive stakeholder-specific export capabilities necessary for enterprise-level fuel station management and strategic planning.