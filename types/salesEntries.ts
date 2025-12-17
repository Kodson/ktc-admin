// Sales Entries Types for KTC Energy - Backend Integration

export interface SalesEntry {
  id: string;
  date: string;
  product: 'Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene';
  
  // Stock Management
  openSL: number; // Opening Stock in Liters
  supply: number; // Supply received
  overageShortageL: number; // Overage/Shortage in Liters
  availableL: number; // Available Stock (calculated)
  closingSL: number; // Closing Stock in Liters
  differenceL: number; // Difference (calculated)
  checkL: number; // Sales Check (calculated)
  
  // Meter Readings
  openSR: number; // Opening Stock Reading
  closingSR: number; // Closing Stock Reading
  returnTT: number; // Return to Tank
  
  // Sales Calculations
  salesL: number; // Sales Volume (calculated)
  rate: number; // Rate per liter in Ghana Cedis
  value: number; // Total Sales Value (calculated)
  
  // Financial Management
  cashSales: number; // Cash Sales (calculated)
  creditSales: number; // Credit Sales
  advances: number; // Advances given
  shortageMomo: number; // Shortage/Mobile Money
  cashAvailable: number; // Cash Available (calculated)
  repaymentShortageMomo: number; // Repayment of Shortage/Momo
  repaymentAdvances: number; // Repayment of Advances
  receivedFromDebtors: number; // Amount received from debtors
  cashToBank: number; // Cash to Bank (calculated)
  bankLodgement: number; // Actual bank lodgement amount
  
  // Entry Metadata
  stationId: string;
  station: string;
  enteredBy: string;
  enteredAt: string;
  submittedAt?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
  validatedBy?: string;
  validatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  
  // Edit Request Tracking
  editRequested?: boolean;
  editRequestedBy?: string;
  editRequestedAt?: string;
  editRequestReason?: string;
  editApprovedBy?: string;
  editApprovedAt?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface SalesEntriesStats {
  totalEntries: number;
  draftEntries: number;
  submittedEntries: number;
  validatedEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
  pendingValidation: number;
  pendingApproval: number;
  totalSalesValue: number;
  totalSalesVolume: number;
  totalCashSales: number;
  totalCreditSales: number;
  totalBankLodgements: number;
  averageVariance: number;
}

export interface SalesEntriesFilters {
  status?: 'ALL' | 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
  product?: 'ALL' | 'Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene';
  stationId?: string;
  dateFrom?: string;
  dateTo?: string;
  enteredBy?: string;
  search?: string;
}

export interface EditPermissionRequest {
  entryId: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface SalesEntriesResponse {
  success?: boolean;
  content: SalesEntry[];
  stats?: SalesEntriesStats;
  // Backend pagination metadata (Spring Boot Page structure)
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  message?: string;
}

export interface SalesEntryResponse {
  success: boolean;
  data: SalesEntry;
  message: string;
}

export interface EditPermissionResponse {
  success: boolean;
  message: string;
  requestId: string;
  status: string;
}

// Pagination and sorting
export interface SalesEntriesPagination {
  page: number;
  pageSize: number;
  sortBy: 'date' | 'product' | 'status' | 'enteredAt' | 'salesValue' | 'salesVolume';
  sortOrder: 'asc' | 'desc';
  // Pagination metadata from backend response
  totalElements?: number;
  totalPages?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

// API Error types
export interface SalesEntriesApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  entryId?: string;
}

// Connection status
export interface SalesEntriesConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}

// Export request types
export interface ExportRequest {
  format: 'CSV' | 'EXCEL' | 'PDF';
  filters: SalesEntriesFilters;
  dateRange: {
    from: string;
    to: string;
  };
  includeDetails: boolean;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  expiresAt: string;
  message?: string;
}