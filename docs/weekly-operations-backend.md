# Weekly Operations Backend Documentation
## KTC Energy Management System

### Overview
The Weekly Operations management system handles fuel station operational data on a weekly basis, including fuel inventory tracking, sales reporting, pricing management, and profit calculations. This system supports a complete approval workflow from submission to final approval.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Custom Hook Integration](#custom-hook-integration)
5. [Approval Workflow](#approval-workflow)
6. [Business Logic](#business-logic)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)

---

## 🏗️ System Architecture

### Components Overview
- **`/types/weeklyOperations.ts`** - TypeScript type definitions
- **`/constants/weeklyOperationsConstants.ts`** - Configuration and constants
- **`/hooks/useWeeklyOperations.ts`** - Custom hook for API integration
- **`/components/WeeklyOperationsManager.tsx`** - Main UI component

### Integration Pattern
```typescript
// Component Integration Example
import { useWeeklyOperations } from '../hooks/useWeeklyOperations';

const WeeklyOperationsManager = () => {
  const {
    operations,
    isLoading,
    createOperation,
    submitOperation,
    validateOperation,
    approveOperation
  } = useWeeklyOperations();
  
  // Component logic...
};
```

---

## 📊 Data Models

### Core Data Structure

#### WeeklyOperationsData
```typescript
interface WeeklyOperationsData {
  id: string;                           // Unique identifier
  weekInfo: WeekInfo;                   // Week metadata
  stationId: string;                    // Station identifier
  stationName: string;                  // Station display name
  totals: WeeklyTotals;                // Fuel totals and calculations
  summaryData: WeeklySummaryData;       // Financial summary
  pricingPeriods: PricingPeriods;       // Price changes during week
  status: OperationStatus;              // Workflow status
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  submittedBy: string;                  // User ID who submitted
  validatedBy?: string;                 // User ID who validated
  approvedBy?: string;                  // User ID who approved
  validatedAt?: string;                 // Validation timestamp
  approvedAt?: string;                  // Approval timestamp
}
```

#### WeekInfo
```typescript
interface WeekInfo {
  month: string;          // "JAN", "FEB", etc.
  week: string;           // "WEEK 1", "WEEK 2", etc.
  weekNumber: number;     // 1-4 (week of month)
  year: number;           // 2025, 2024, etc.
  monthIndex: number;     // 0-11 (JavaScript month index)
  dateRange: string;      // "(15 - 21/01/25)"
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
}
```

#### WeeklyTotals
```typescript
interface WeeklyTotals {
  pms: FuelProductTotals;     // Petrol data
  ago: FuelProductTotals;     // Diesel data  
  rate?: FuelProductTotals;   // Rate/Premium data (optional)
  pms_value: FuelProductValues;   // Petrol financial values
  ago_value: FuelProductValues;   // Diesel financial values
  total: FuelProductValues;       // Combined totals
}
```

#### FuelProductTotals
```typescript
interface FuelProductTotals {
  openingStock: number;       // Liters at week start
  supply: number;             // Liters received during week
  availableStock: number;     // Total available for sale
  salesCost: number;          // Liters sold (cost basis)
  salesUnitPrice: number;     // Sales value in GHS
  unitPrice: number;          // Price per liter
  closingStock: number;       // Liters remaining
  closingDispensing: number;  // Dispenser reading
  undergroundGains: number;   // Underground tank gains
  pumpGains: number;          // Pump-level gains
}
```

#### WeeklySummaryData
```typescript
interface WeeklySummaryData {
  openingStockValue: number;              // GHS value of opening stock
  totalSupplyValue: number;               // GHS value of supplies received
  availableStockValue: number;            // GHS value available for sale
  salesValue: number;                     // GHS actual sales revenue
  closingStockValue: number;              // GHS value of closing stock
  expectedProfit: number;                 // GHS expected profit
  salesProfit: number;                    // GHS actual profit
  undergroundGains: number;               // Liters gained underground
  winFallValue: number;                   // GHS value of windfall gains
  profitMarginVariance: number;           // GHS variance from expected
  profitMarginPercentage: number;         // Percentage profit margin
  operationalEfficiencyExpected: number; // Expected efficiency value
  operationalEfficiencyAdjusted: number; // Adjusted efficiency
  creditSales: number;                    // GHS credit sales amount
  actualVariance: number;                 // Percentage actual variance
}
```

#### PricingPeriods
```typescript
interface PricingPeriods {
  pms: FuelPricingData;   // Petrol pricing
  ago: FuelPricingData;   // Diesel pricing
}

interface FuelPricingData {
  basePrice: number;                      // Base price per liter (GHS)
  priceChanges: PriceChangeRecord[];      // Price adjustments during week
}

interface PriceChangeRecord {
  period: string;         // "Period 1", "Period 2", etc.
  dateRange: string;      // "Mon-Tue", "Wed-Thu", etc.
  priceAdjustment: number; // GHS adjustment (+/-)
  finalPrice: number;     // GHS final price
  quantity: number;       // Liters sold at this price
  salesValue: number;     // GHS revenue at this price
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
}
```

### Status Management

#### OperationStatus
```typescript
type OperationStatus = 'draft' | 'submitted' | 'validated' | 'approved' | 'rejected';

// Status flow
const STATUS_FLOW = {
  draft: ['submitted'],
  submitted: ['validated', 'rejected'],
  validated: ['approved', 'rejected'],
  approved: [],
  rejected: ['draft']
};
```

---

## 🚀 API Endpoints

### Base Configuration
```typescript
const WEEKLY_OPERATIONS_ENDPOINTS = {
  GET_ALL: '/api/weekly-operations',
  GET_BY_ID: '/api/weekly-operations/:id',
  CREATE: '/api/weekly-operations',
  UPDATE: '/api/weekly-operations/:id',
  DELETE: '/api/weekly-operations/:id',
  SUBMIT: '/api/weekly-operations/:id/submit',
  VALIDATE: '/api/weekly-operations/:id/validate',
  APPROVE: '/api/weekly-operations/:id/approve',
  REJECT: '/api/weekly-operations/:id/reject',
  GET_ANALYTICS: '/api/weekly-operations/analytics',
  EXPORT: '/api/weekly-operations/export',
  GET_BY_STATION: '/api/weekly-operations/station/:stationId',
  GET_BY_WEEK: '/api/weekly-operations/week/:year/:month/:week'
};
```

### API Methods

#### GET /api/weekly-operations
**Description**: Retrieve weekly operations with filtering and pagination

**Query Parameters**:
```typescript
interface WeeklyOperationsFilter {
  stationId?: string;     // Filter by station
  month?: string;         // Filter by month ("JAN", "FEB", etc.)
  year?: number;          // Filter by year
  week?: number;          // Filter by week number
  status?: OperationStatus; // Filter by status
  dateFrom?: string;      // ISO date string
  dateTo?: string;        // ISO date string
  submittedBy?: string;   // Filter by submitter
  validatedBy?: string;   // Filter by validator
  approvedBy?: string;    // Filter by approver
  page?: number;          // Pagination page (default: 1)
  limit?: number;         // Items per page (default: 10)
}
```

**Response**:
```typescript
interface WeeklyOperationsResponse {
  success: boolean;
  data: WeeklyOperationsData[];
  total: number;          // Total items count
  page: number;           // Current page
  limit: number;          // Items per page
  message?: string;       // Optional message
}
```

#### GET /api/weekly-operations/:id
**Description**: Retrieve a specific weekly operation

**Response**:
```typescript
interface WeeklyOperationsSingleResponse {
  success: boolean;
  data: WeeklyOperationsData;
  message?: string;
}
```

#### POST /api/weekly-operations
**Description**: Create a new weekly operation

**Request Body**:
```typescript
interface WeeklyOperationsSubmission {
  weekInfo: WeekInfo;
  stationId: string;
  totals: WeeklyTotals;
  summaryData: WeeklySummaryData;
  pricingPeriods: PricingPeriods;
  notes?: string;
}
```

#### PUT /api/weekly-operations/:id
**Description**: Update an existing weekly operation
**Note**: Only allowed for 'draft' status

#### DELETE /api/weekly-operations/:id
**Description**: Delete a weekly operation
**Note**: Only allowed for 'draft' status

#### POST /api/weekly-operations/:id/submit
**Description**: Submit operation for validation
**Transitions**: draft → submitted

#### POST /api/weekly-operations/:id/validate
**Description**: Validate a submitted operation

**Request Body**:
```typescript
interface WeeklyOperationsValidation {
  operationId: string;
  validatorId: string;
  validationNotes?: string;
  isApproved: boolean;
  validatedAt: string;
}
```
**Transitions**: submitted → validated | rejected

#### POST /api/weekly-operations/:id/approve
**Description**: Approve a validated operation

**Request Body**:
```typescript
interface WeeklyOperationsApproval {
  operationId: string;
  approverId: string;
  approvalNotes?: string;
  isApproved: boolean;
  approvedAt: string;
}
```
**Transitions**: validated → approved | rejected

#### POST /api/weekly-operations/:id/reject
**Description**: Reject an operation at any stage

**Request Body**:
```typescript
{
  reason: string;
  rejectedBy: string;
  rejectedAt: string;
}
```

---

## 🔧 Custom Hook Integration

### useWeeklyOperations Hook

```typescript
const useWeeklyOperations = (): UseWeeklyOperationsReturn => {
  // State management
  const [operations, setOperations] = useState<WeeklyOperationsData[]>([]);
  const [currentOperation, setCurrentOperation] = useState<WeeklyOperationsData | null>(null);
  const [analytics, setAnalytics] = useState<WeeklyOperationsAnalytics | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Pagination
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<WeeklyOperationsFilter>({});

  // ... hook implementation
};
```

### Key Methods

#### CRUD Operations
```typescript
// Create new operation
const createOperation = async (data: WeeklyOperationsSubmission): Promise<boolean> => {
  setIsSubmitting(true);
  try {
    const response = await WeeklyOperationsAPI.createOperation(data);
    if (response.success) {
      setOperations(prev => [response.data, ...prev]);
      toast.success(WEEKLY_OPERATIONS_MESSAGES.CREATED);
      return true;
    }
    // Handle error...
  } finally {
    setIsSubmitting(false);
  }
};

// Update existing operation
const updateOperation = async (id: string, data: Partial<WeeklyOperationsSubmission>): Promise<boolean> => {
  // Implementation...
};
```

#### Workflow Operations
```typescript
// Submit for validation
const submitOperation = async (id: string): Promise<boolean> => {
  setIsSubmitting(true);
  try {
    const response = await WeeklyOperationsAPI.submitOperation(id);
    if (response.success) {
      // Update local state
      setOperations(prev => prev.map(op => 
        op.id === id ? { ...op, status: 'submitted' } : op
      ));
      toast.success(WEEKLY_OPERATIONS_MESSAGES.SUBMITTED);
      return true;
    }
    // Handle error...
  } finally {
    setIsSubmitting(false);
  }
};

// Validate operation
const validateOperation = async (id: string, validation: Omit<WeeklyOperationsValidation, 'operationId'>): Promise<boolean> => {
  // Implementation...
};

// Approve operation
const approveOperation = async (id: string, approval: Omit<WeeklyOperationsApproval, 'operationId'>): Promise<boolean> => {
  // Implementation...
};
```

#### Form Helpers
```typescript
// Validate form data
const validateForm = (data: WeeklyOperationsFormData): boolean => {
  const errors: Record<string, string> = {};
  
  // Required field validation
  if (!data.weekInfo?.month) errors.month = 'Month is required';
  if (!data.weekInfo?.week) errors.week = 'Week is required';
  if (!data.stationId) errors.stationId = 'Station is required';
  
  // Numeric validation
  if (!data.totals?.pms?.openingStock || data.totals.pms.openingStock < 0) {
    errors.pmsOpeningStock = 'PMS opening stock must be greater than 0';
  }
  
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

// Calculate dynamic values
const calculateDynamicValues = (data: WeeklyOperationsFormData): WeeklyOperationsFormData => {
  const updated = { ...data };
  
  // Calculate available stock
  if (updated.totals?.pms) {
    updated.totals.pms.availableStock = 
      (updated.totals.pms.openingStock || 0) + (updated.totals.pms.supply || 0);
  }
  
  // Calculate sales values
  if (updated.pricingPeriods?.pms?.priceChanges) {
    updated.pricingPeriods.pms.priceChanges.forEach(period => {
      period.salesValue = period.quantity * period.finalPrice;
    });
  }
  
  // Calculate summary data
  if (updated.summaryData) {
    updated.summaryData.availableStockValue = 
      (updated.totals?.pms?.availableStock || 0) * (updated.pricingPeriods?.pms?.basePrice || 0) +
      (updated.totals?.ago?.availableStock || 0) * (updated.pricingPeriods?.ago?.basePrice || 0);
  }
  
  return updated;
};
```

---

## 🔄 Approval Workflow

### Workflow States
1. **Draft** - Initial state, editable by station manager
2. **Submitted** - Submitted for admin validation
3. **Validated** - Approved by admin, pending super admin approval
4. **Approved** - Final approved state
5. **Rejected** - Rejected at any stage, returns to draft

### Role-Based Permissions

#### Station Manager
- Create new operations
- Edit draft operations
- Submit operations for validation
- View own station operations

#### Admin
- View all operations
- Validate submitted operations
- Reject operations with reason
- Access validation dashboard

#### Super Admin
- All admin permissions
- Approve validated operations
- Access comprehensive analytics
- Manage system-wide operations

### Workflow Implementation
```typescript
// Check if user can perform action
const canPerformAction = (operation: WeeklyOperationsData, action: string, userRole: string): boolean => {
  const { status } = operation;
  
  switch (action) {
    case 'edit':
      return status === 'draft' && userRole === 'station_manager';
    case 'submit':
      return status === 'draft' && userRole === 'station_manager';
    case 'validate':
      return status === 'submitted' && (userRole === 'admin' || userRole === 'super_admin');
    case 'approve':
      return status === 'validated' && userRole === 'super_admin';
    case 'reject':
      return ['submitted', 'validated'].includes(status) && 
             (userRole === 'admin' || userRole === 'super_admin');
    default:
      return false;
  }
};
```

---

## 💼 Business Logic

### Financial Calculations

#### Profit Calculations
```typescript
const calculateProfit = (totals: WeeklyTotals, pricingPeriods: PricingPeriods): WeeklySummaryData => {
  // Opening stock value
  const openingStockValue = 
    (totals.pms.openingStock * pricingPeriods.pms.basePrice) +
    (totals.ago.openingStock * pricingPeriods.ago.basePrice);
  
  // Sales value from pricing periods
  const salesValue = 
    pricingPeriods.pms.priceChanges.reduce((sum, period) => sum + period.salesValue, 0) +
    pricingPeriods.ago.priceChanges.reduce((sum, period) => sum + period.salesValue, 0);
  
  // Cost of goods sold
  const costOfSales = 
    (totals.pms.salesCost * pricingPeriods.pms.basePrice) +
    (totals.ago.salesCost * pricingPeriods.ago.basePrice);
  
  // Gross profit
  const salesProfit = salesValue - costOfSales;
  
  // Profit margin percentage
  const profitMarginPercentage = salesValue > 0 ? (salesProfit / salesValue) * 100 : 0;
  
  return {
    openingStockValue,
    salesValue,
    salesProfit,
    profitMarginPercentage,
    // ... other calculated values
  };
};
```

#### Inventory Reconciliation
```typescript
const validateInventory = (totals: WeeklyTotals): { isValid: boolean; discrepancies: string[] } => {
  const discrepancies: string[] = [];
  
  // Check PMS inventory balance
  const pmsExpectedClosing = totals.pms.openingStock + totals.pms.supply - totals.pms.salesCost;
  const pmsActualClosing = totals.pms.closingStock;
  const pmsVariance = Math.abs(pmsExpectedClosing - pmsActualClosing);
  
  if (pmsVariance > 100) { // Allow 100L variance threshold
    discrepancies.push(`PMS inventory variance: ${pmsVariance.toFixed(2)}L`);
  }
  
  // Check AGO inventory balance
  const agoExpectedClosing = totals.ago.openingStock + totals.ago.supply - totals.ago.salesCost;
  const agoActualClosing = totals.ago.closingStock;
  const agoVariance = Math.abs(agoExpectedClosing - agoActualClosing);
  
  if (agoVariance > 150) { // Allow 150L variance threshold for AGO
    discrepancies.push(`AGO inventory variance: ${agoVariance.toFixed(2)}L`);
  }
  
  return {
    isValid: discrepancies.length === 0,
    discrepancies
  };
};
```

### Data Validation Rules

#### Business Rules
```typescript
const BUSINESS_RULES = {
  // Inventory limits
  MAX_WEEKLY_VARIANCE: 0.02, // 2% maximum variance
  MIN_PROFIT_MARGIN: 0.05,   // 5% minimum profit margin
  MAX_DAILY_SALES: 10000,    // Maximum daily sales in liters
  
  // Price change limits
  MAX_PRICE_INCREASE: 2.00,  // GHS 2.00 maximum price increase
  MAX_PRICE_PERIODS: 5,      // Maximum 5 price periods per week
  
  // Stock limits
  MIN_OPENING_STOCK: 1000,   // Minimum 1000L opening stock
  MAX_SUPPLY_PER_WEEK: 50000, // Maximum 50,000L supply per week
};

const validateBusinessRules = (data: WeeklyOperationsData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check profit margin
  if (data.summaryData.profitMarginPercentage < BUSINESS_RULES.MIN_PROFIT_MARGIN * 100) {
    warnings.push(`Low profit margin: ${data.summaryData.profitMarginPercentage.toFixed(2)}%`);
  }
  
  // Check price changes
  if (data.pricingPeriods.pms.priceChanges.length > BUSINESS_RULES.MAX_PRICE_PERIODS) {
    errors.push(`Too many PMS price periods: ${data.pricingPeriods.pms.priceChanges.length}`);
  }
  
  // Check stock levels
  if (data.totals.pms.openingStock < BUSINESS_RULES.MIN_OPENING_STOCK) {
    warnings.push(`Low PMS opening stock: ${data.totals.pms.openingStock}L`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
```

---

## 🚨 Error Handling

### Error Types
```typescript
enum WeeklyOperationsErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR'
}

interface WeeklyOperationsError {
  type: WeeklyOperationsErrorType;
  message: string;
  details?: Record<string, any>;
  field?: string;
  code?: string;
}
```

### Error Handling Implementation
```typescript
const handleAPIError = (error: any): WeeklyOperationsError => {
  // Network errors
  if (!navigator.onLine) {
    return {
      type: WeeklyOperationsErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.'
    };
  }
  
  // HTTP errors
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: WeeklyOperationsErrorType.VALIDATION_ERROR,
          message: data.message || 'Invalid data provided',
          details: data.errors
        };
      case 403:
        return {
          type: WeeklyOperationsErrorType.PERMISSION_ERROR,
          message: 'You do not have permission to perform this action'
        };
      case 404:
        return {
          type: WeeklyOperationsErrorType.NOT_FOUND_ERROR,
          message: 'Weekly operations report not found'
        };
      case 422:
        return {
          type: WeeklyOperationsErrorType.BUSINESS_RULE_ERROR,
          message: data.message || 'Business rule validation failed',
          details: data.violations
        };
      default:
        return {
          type: WeeklyOperationsErrorType.SERVER_ERROR,
          message: 'An unexpected error occurred. Please try again later.'
        };
    }
  }
  
  // Default error
  return {
    type: WeeklyOperationsErrorType.SERVER_ERROR,
    message: 'An unexpected error occurred'
  };
};
```

### User-Friendly Error Messages
```typescript
const ERROR_MESSAGES = {
  [WeeklyOperationsErrorType.VALIDATION_ERROR]: {
    title: 'Validation Error',
    description: 'Please fix the highlighted fields and try again.',
    action: 'Fix Errors'
  },
  [WeeklyOperationsErrorType.PERMISSION_ERROR]: {
    title: 'Access Denied',
    description: 'You do not have the required permissions for this action.',
    action: 'Contact Administrator'
  },
  [WeeklyOperationsErrorType.BUSINESS_RULE_ERROR]: {
    title: 'Business Rule Violation',
    description: 'The data violates business rules and cannot be processed.',
    action: 'Review Data'
  },
  [WeeklyOperationsErrorType.NETWORK_ERROR]: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Retry'
  },
  [WeeklyOperationsErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    description: 'An unexpected error occurred. Please try again later.',
    action: 'Try Again'
  },
  [WeeklyOperationsErrorType.NOT_FOUND_ERROR]: {
    title: 'Not Found',
    description: 'The requested weekly operations report could not be found.',
    action: 'Go Back'
  }
};
```

---

## ⚡ Performance Considerations

### Caching Strategy
```typescript
// Cache configuration
const CACHE_CONFIG = {
  OPERATIONS_TTL: 5 * 60 * 1000,      // 5 minutes
  ANALYTICS_TTL: 15 * 60 * 1000,      // 15 minutes
  STATIONS_TTL: 60 * 60 * 1000,       // 1 hour
  MAX_CACHE_SIZE: 100                  // Maximum cached items
};

// Simple in-memory cache
class WeeklyOperationsCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = CACHE_CONFIG.OPERATIONS_TTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

### Data Loading Optimization
```typescript
// Pagination with prefetching
const useOptimizedPagination = (pageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [prefetchedPages, setPrefetchedPages] = useState<Map<number, WeeklyOperationsData[]>>(new Map());
  
  const loadPage = useCallback(async (page: number) => {
    // Check cache first
    if (prefetchedPages.has(page)) {
      return prefetchedPages.get(page);
    }
    
    // Load page data
    const data = await WeeklyOperationsAPI.getOperations({}, page, pageSize);
    
    // Cache the result
    setPrefetchedPages(prev => new Map(prev.set(page, data.data)));
    
    // Prefetch adjacent pages
    const prefetchPages = [page - 1, page + 1].filter(p => p > 0 && !prefetchedPages.has(p));
    prefetchPages.forEach(p => {
      WeeklyOperationsAPI.getOperations({}, p, pageSize).then(result => {
        setPrefetchedPages(prev => new Map(prev.set(p, result.data)));
      });
    });
    
    return data.data;
  }, [pageSize, prefetchedPages]);
  
  return { currentPage, setCurrentPage, loadPage };
};
```

### Memory Management
```typescript
// Clean up old data to prevent memory leaks
const useMemoryCleanup = () => {
  useEffect(() => {
    const cleanup = () => {
      // Clear old cache entries
      WeeklyOperationsCache.clearExpired();
      
      // Cancel pending requests
      pendingRequests.forEach(request => request.cancel());
      pendingRequests.clear();
    };
    
    // Cleanup on unmount
    return cleanup;
  }, []);
  
  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      WeeklyOperationsCache.clearExpired();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);
};
```

---

## 📊 Analytics and Reporting

### Analytics Data Structure
```typescript
interface WeeklyOperationsAnalytics {
  totalOperations: number;
  pendingValidation: number;
  pendingApproval: number;
  averageProfitMargin: number;
  totalSalesValue: number;
  totalExpectedProfit: number;
  topPerformingStations: StationPerformance[];
  weeklyTrends: WeeklyTrend[];
  statusDistribution: StatusDistribution[];
  profitMarginTrends: ProfitTrend[];
}

interface StationPerformance {
  stationId: string;
  stationName: string;
  totalSales: number;
  profitMargin: number;
  efficiency: number;
  operationsCount: number;
  rank: number;
}
```

### Export Functionality
```typescript
// Export operations data
const exportWeeklyOperations = async (format: 'pdf' | 'excel' | 'csv', filters?: WeeklyOperationsFilter) => {
  try {
    const data = await WeeklyOperationsAPI.getOperations(filters, 1, 1000); // Get all data
    
    switch (format) {
      case 'pdf':
        return await generatePDFReport(data.data);
      case 'excel':
        return await generateExcelReport(data.data);
      case 'csv':
        return await generateCSVReport(data.data);
    }
  } catch (error) {
    throw new Error(`Failed to export ${format.toUpperCase()} report`);
  }
};
```

---

## 🔐 Security Considerations

### Data Sanitization
```typescript
const sanitizeInput = (data: WeeklyOperationsSubmission): WeeklyOperationsSubmission => {
  return {
    ...data,
    notes: data.notes?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''), // Remove scripts
    stationId: data.stationId.replace(/[^a-zA-Z0-9-]/g, ''), // Alphanumeric + hyphens only
    weekInfo: {
      ...data.weekInfo,
      month: data.weekInfo.month.toUpperCase().replace(/[^A-Z]/g, ''), // Month codes only
      week: data.weekInfo.week.replace(/[^A-Z0-9\s]/g, '') // Alphanumeric + spaces only
    }
  };
};
```

### Audit Trail
```typescript
interface AuditLogEntry {
  id: string;
  operationId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'SUBMIT' | 'VALIDATE' | 'APPROVE' | 'REJECT' | 'DELETE';
  previousState?: Partial<WeeklyOperationsData>;
  newState?: Partial<WeeklyOperationsData>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

const logAuditEvent = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const auditEntry: AuditLogEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString()
  };
  
  // Send to audit service
  await AuditService.logEvent(auditEntry);
};
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example test for calculation functions
describe('Weekly Operations Calculations', () => {
  test('should calculate profit correctly', () => {
    const totals = createMockTotals();
    const pricingPeriods = createMockPricingPeriods();
    
    const result = calculateProfit(totals, pricingPeriods);
    
    expect(result.salesProfit).toBe(expectedProfit);
    expect(result.profitMarginPercentage).toBeCloseTo(expectedMargin, 2);
  });
  
  test('should validate inventory correctly', () => {
    const totals = createMockTotalsWithVariance();
    
    const result = validateInventory(totals);
    
    expect(result.isValid).toBe(false);
    expect(result.discrepancies).toHaveLength(1);
  });
});
```

### Integration Tests
```typescript
// Example API integration test
describe('Weekly Operations API', () => {
  test('should create operation successfully', async () => {
    const mockData = createMockOperationData();
    
    const result = await WeeklyOperationsAPI.createOperation(mockData);
    
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject(mockData);
  });
  
  test('should handle validation errors', async () => {
    const invalidData = createInvalidOperationData();
    
    await expect(WeeklyOperationsAPI.createOperation(invalidData))
      .rejects.toThrow('Validation failed');
  });
});
```

---

## 📝 Usage Examples

### Basic Component Integration
```tsx
import React from 'react';
import { useWeeklyOperations } from '../hooks/useWeeklyOperations';
import { WeeklyOperationsTable } from './WeeklyOperationsTable';
import { LoadingSpinner } from './ui/LoadingSpinner';

const WeeklyOperationsManager: React.FC = () => {
  const {
    operations,
    isLoading,
    error,
    createOperation,
    submitOperation,
    validateOperation,
    approveOperation,
    filters,
    setFilters
  } = useWeeklyOperations();
  
  const handleCreateOperation = async (data: WeeklyOperationsSubmission) => {
    const success = await createOperation(data);
    if (success) {
      // Handle success (e.g., show success message, redirect)
    }
  };
  
  const handleSubmitOperation = async (id: string) => {
    const success = await submitOperation(id);
    if (success) {
      // Handle success
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage error={error} />;
  }
  
  return (
    <div className="weekly-operations-manager">
      <div className="header">
        <h1>Weekly Operations Management</h1>
        <CreateOperationButton onClick={handleCreateOperation} />
      </div>
      
      <div className="filters">
        <FilterControls filters={filters} onFiltersChange={setFilters} />
      </div>
      
      <div className="content">
        <WeeklyOperationsTable
          data={operations}
          onSubmit={handleSubmitOperation}
          onValidate={validateOperation}
          onApprove={approveOperation}
        />
      </div>
    </div>
  );
};

export default WeeklyOperationsManager;
```

### Advanced Usage with Caching
```tsx
const WeeklyOperationsWithCache: React.FC = () => {
  const { operations, isLoading, refreshData } = useWeeklyOperations();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshData();
      setLastRefresh(new Date());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshData]);
  
  // Manual refresh with loading state
  const handleRefresh = async () => {
    await refreshData();
    setLastRefresh(new Date());
  };
  
  return (
    <div>
      <div className="refresh-controls">
        <button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
        {lastRefresh && (
          <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
        )}
      </div>
      
      {/* Rest of component */}
    </div>
  );
};
```

---

This comprehensive backend documentation provides all the necessary information for implementing, maintaining, and extending the Weekly Operations management system in the KTC Energy Management System. The documentation covers data structures, API integration, business logic, error handling, performance optimization, and security considerations necessary for a production-ready fuel station management system.