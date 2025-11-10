// Sales Entries Constants for KTC Energy - Backend Integration

// Type augmentation for ImportMeta to include 'env'
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// API Configuration
export const SALES_ENTRIES_API = {
 BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    ENTRIES: '/dailysales/all',
    ENTRY_BY_ID: '/sales-entries/:id',
    ENTRIES_BY_STATION: '/dailysales/station/:station',
    STATISTICS: '/sales-entries/statistics/:stationId',
    REQUEST_EDIT: '/sales-entries/:id/request-edit',
    APPROVE_EDIT: '/sales-entries/:id/approve-edit',
    EXPORT: '/sales-entries/export',
    BULK_APPROVE: '/sales-entries/bulk-approve',
    BULK_REJECT: '/sales-entries/bulk-reject',
    HEALTH_CHECK: '/health'
  }
};

export const SALES_ENTRIES_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// KTC Energy Stations in Ghana
export const KTC_STATIONS = {
  'accra-central': 'KTC Accra Central',
  'kumasi-highway': 'KTC Kumasi Highway', 
  'takoradi-port': 'KTC Takoradi Port',
  'cape-coast': 'KTC Cape Coast',
  'tema-industrial': 'KTC Tema Industrial',
  'tamale-north': 'KTC Tamale North',
  'ho-regional': 'KTC Ho Regional',
  'sunyani-west': 'KTC Sunyani West'
};

// Fuel Products
export const FUEL_PRODUCTS = [
  'All Products',
  'Super',
  'Regular', 
  'Diesel',
  'Gas',
  'Kerosene'
];

// Entry Status Options
export const ENTRY_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  VALIDATED: 'Validated',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

// Status Colors for UI
export const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  VALIDATED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200'
};

// Current Ghana fuel rates (December 2024) - in Ghana Cedis per liter
export const GHANA_FUEL_RATES = {
  Super: 15.85,
  Regular: 15.45,
  Diesel: 17.20,
  Gas: 13.90,
  Kerosene: 14.30
};

// Mock Sales Entries Data for Ghana stations
export const MOCK_SALES_ENTRIES = [
  {
    id: 'SE-001',
    date: '2024-12-15',
    product: 'Super' as const,
    openSL: 8500,
    supply: 15000,
    overageShortageL: 0,
    availableL: 23500,
    closingSL: 6200,
    differenceL: 0,
    checkL: 17300,
    openSR: 125680,
    closingSR: 143280,
    returnTT: 300,
    salesL: 17300,
    rate: 15.85,
    value: 274205,
    cashSales: 260205,
    creditSales: 14000,
    advances: 5000,
    shortageMomo: 2000,
    cashAvailable: 253205,
    repaymentShortageMomo: 1500,
    repaymentAdvances: 3000,
    receivedFromDebtors: 8000,
    cashToBank: 265705,
    bankLodgement: 265000,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-15T18:30:00Z',
    submittedAt: '2024-12-15T18:45:00Z',
    status: 'SUBMITTED' as const,
    notes: 'Normal operations. Slight variance in bank lodgement due to change shortage.'
  },
  {
    id: 'SE-002',
    date: '2024-12-14',
    product: 'Diesel' as const,
    openSL: 12800,
    supply: 12000,
    overageShortageL: -50,
    availableL: 24750,
    closingSL: 8500,
    differenceL: 0,
    checkL: 16250,
    openSR: 98450,
    closingSR: 114700,
    returnTT: 0,
    salesL: 16250,
    rate: 17.20,
    value: 279500,
    cashSales: 265500,
    creditSales: 14000,
    advances: 3500,
    shortageMomo: 1000,
    cashAvailable: 261000,
    repaymentShortageMomo: 800,
    repaymentAdvances: 2000,
    receivedFromDebtors: 5500,
    cashToBank: 269300,
    bankLodgement: 269300,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-14T19:15:00Z',
    submittedAt: '2024-12-14T19:30:00Z',
    status: 'VALIDATED' as const,
    validatedBy: 'Mary Asante',
    validatedAt: '2024-12-15T08:30:00Z'
  },
  {
    id: 'SE-003',
    date: '2024-12-13',
    product: 'Regular' as const,
    openSL: 9200,
    supply: 18000,
    overageShortageL: 0,
    availableL: 27200,
    closingSL: 9800,
    differenceL: 50,
    checkL: 17400,
    openSR: 87650,
    closingSR: 105100,
    returnTT: 50,
    salesL: 17400,
    rate: 15.45,
    value: 268830,
    cashSales: 254830,
    creditSales: 14000,
    advances: 4000,
    shortageMomo: 1500,
    cashAvailable: 249330,
    repaymentShortageMomo: 1000,
    repaymentAdvances: 2500,
    receivedFromDebtors: 6000,
    cashToBank: 258830,
    bankLodgement: 258500,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-13T18:45:00Z',
    submittedAt: '2024-12-13T19:00:00Z',
    status: 'APPROVED' as const,
    validatedBy: 'Mary Asante',
    validatedAt: '2024-12-14T08:15:00Z',
    approvedBy: 'Joseph Amponsah',
    approvedAt: '2024-12-14T12:30:00Z'
  },
  {
    id: 'SE-004',
    date: '2024-12-12',
    product: 'Gas' as const,
    openSL: 3400,
    supply: 8000,
    overageShortageL: 100,
    availableL: 11500,
    closingSL: 2800,
    differenceL: -200,
    checkL: 8700,
    openSR: 45230,
    closingSR: 53830,
    returnTT: 100,
    salesL: 8500,
    rate: 13.90,
    value: 118150,
    cashSales: 110150,
    creditSales: 8000,
    advances: 2000,
    shortageMomo: 500,
    cashAvailable: 107650,
    repaymentShortageMomo: 300,
    repaymentAdvances: 1500,
    receivedFromDebtors: 3000,
    cashToBank: 112450,
    bankLodgement: 112000,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-12T18:20:00Z',
    submittedAt: '2024-12-12T18:35:00Z',
    status: 'REJECTED' as const,
    validatedBy: 'Mary Asante',
    validatedAt: '2024-12-13T08:45:00Z',
    rejectedBy: 'Mary Asante',
    rejectedAt: '2024-12-13T08:45:00Z',
    rejectionReason: 'Significant variance between sales check and actual sales. Please verify meter readings.',
    editRequested: true,
    editRequestedBy: 'Samuel Osei',
    editRequestedAt: '2024-12-13T14:30:00Z',
    editRequestReason: 'Meter reading error discovered - opening reading was incorrectly recorded'
  },
  {
    id: 'SE-005',
    date: '2024-12-16',
    product: 'Kerosene' as const,
    openSL: 1800,
    supply: 5000,
    overageShortageL: 0,
    availableL: 6800,
    closingSL: 2100,
    differenceL: 0,
    checkL: 4700,
    openSR: 23450,
    closingSR: 28150,
    returnTT: 0,
    salesL: 4700,
    rate: 14.30,
    value: 67210,
    cashSales: 62210,
    creditSales: 5000,
    advances: 1000,
    shortageMomo: 800,
    cashAvailable: 60410,
    repaymentShortageMomo: 500,
    repaymentAdvances: 800,
    receivedFromDebtors: 2000,
    cashToBank: 63710,
    bankLodgement: 63710,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-16T18:50:00Z',
    status: 'DRAFT' as const
  }
];

// Mock data for other stations
export const MOCK_SALES_ENTRIES_KUMASI = [
  {
    id: 'SE-KH-001',
    date: '2024-12-15',
    product: 'Super' as const,
    openSL: 12300,
    supply: 20000,
    overageShortageL: 0,
    availableL: 32300,
    closingSL: 9800,
    differenceL: 0,
    checkL: 22500,
    openSR: 156780,
    closingSR: 179280,
    returnTT: 0,
    salesL: 22500,
    rate: 15.85,
    value: 356625,
    cashSales: 340625,
    creditSales: 16000,
    advances: 6000,
    shortageMomo: 2500,
    cashAvailable: 332125,
    repaymentShortageMomo: 2000,
    repaymentAdvances: 4000,
    receivedFromDebtors: 10000,
    cashToBank: 348125,
    bankLodgement: 348000,
    stationId: 'kumasi-highway',
    stationName: 'KTC Kumasi Highway',
    enteredBy: 'Kwame Boateng',
    enteredAt: '2024-12-15T19:00:00Z',
    submittedAt: '2024-12-15T19:15:00Z',
    status: 'SUBMITTED' as const
  }
];

// Mock statistics by station
export const MOCK_SALES_ENTRIES_STATS = {
  'accra-central': {
    totalEntries: 5,
    draftEntries: 1,
    submittedEntries: 1,
    validatedEntries: 1,
    approvedEntries: 1,
    rejectedEntries: 1,
    pendingValidation: 1,
    pendingApproval: 1,
    totalSalesValue: 1007895, // Sum of all approved/validated entries
    totalSalesVolume: 63850, // Sum of all sales volumes
    totalCashSales: 940195,
    totalCreditSales: 67700,
    totalBankLodgements: 1005540,
    averageVariance: 1.2 // Average percentage variance
  },
  'kumasi-highway': {
    totalEntries: 1,
    draftEntries: 0,
    submittedEntries: 1,
    validatedEntries: 0,
    approvedEntries: 0,
    rejectedEntries: 0,
    pendingValidation: 1,
    pendingApproval: 0,
    totalSalesValue: 356625,
    totalSalesVolume: 22500,
    totalCashSales: 340625,
    totalCreditSales: 16000,
    totalBankLodgements: 348000,
    averageVariance: 0.5
  },
  'takoradi-port': {
    totalEntries: 3,
    draftEntries: 0,
    submittedEntries: 1,
    validatedEntries: 1,
    approvedEntries: 1,
    rejectedEntries: 0,
    pendingValidation: 1,
    pendingApproval: 1,
    totalSalesValue: 485000,
    totalSalesVolume: 28000,
    totalCashSales: 460000,
    totalCreditSales: 25000,
    totalBankLodgements: 485000,
    averageVariance: 0.8
  }
};

// Default filter values
export const DEFAULT_SALES_ENTRIES_FILTERS = {
  status: 'ALL' as const,
  product: 'ALL' as const,
  search: ''
};

// Pagination defaults
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
  sortBy: 'date' as const,
  sortOrder: 'desc' as const
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'CSV',
  EXCEL: 'Excel',
  PDF: 'PDF'
};

// Validation rules
export const SALES_ENTRIES_VALIDATION_RULES = {
  MAX_EDIT_REQUEST_LENGTH: 500,
  MIN_EDIT_REQUEST_LENGTH: 10,
  MAX_VARIANCE_ALERT: 5, // 5% variance triggers alert
  MAX_CASH_VARIANCE_ALERT: 500 // ₵500 cash variance triggers alert
};

// Refresh intervals (in milliseconds)
export const SALES_ENTRIES_REFRESH_INTERVALS = {
  ENTRIES: 300000, // 5 minutes for entries data
  STATISTICS: 600000, // 10 minutes for statistics
  HEALTH_CHECK: 120000 // 2 minutes for health check
};

// Ghana Cedi currency formatting
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₵0.00';
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('GH₵', '₵');
};

// Format volume in liters
export const formatLiters = (volume: number | undefined | null): string => {
  if (volume === undefined || volume === null || isNaN(volume)) {
    return '0L';
  }
  return `${volume.toLocaleString()}L`;
};

// Format date for display
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'N/A';
  }
  try {
    const dateObj = new Date(dateString);
    // If valid date, format as '5 Sept 2025'
    if (!isNaN(dateObj.getTime())) {
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString('en-US', { month: 'short' });
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return 'Invalid Date';
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format datetime for display
export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'N/A';
  }
  try {
    return new Date(dateString).toLocaleString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Calculate variance percentage
export const calculateVariance = (expected: number | undefined | null, actual: number | undefined | null): number => {
  if (expected === undefined || expected === null || isNaN(expected) || 
      actual === undefined || actual === null || isNaN(actual)) {
    return 0;
  }
  if (expected === 0) return 0;
  return ((actual - expected) / expected) * 100;
};

// Get status priority for sorting
export const getStatusPriority = (status: string): number => {
  const priorities = {
    'DRAFT': 1,
    'SUBMITTED': 2,
    'VALIDATED': 3,
    'APPROVED': 4,
    'REJECTED': 5
  };
  return priorities[status as keyof typeof priorities] || 0;
};