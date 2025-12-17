// Daily Sales Entry Constants for KTC Energy

// API Configuration
export const DAILY_SALES_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    ENTRIES: '/dailysales',
    ENTRY_BY_ID: '/daily-sales/entries/:id',
    SUBMIT_ENTRY: '/dailysales',
    PREVIOUS_DAY_DATA: '/dailysales/latest/:station/:product',
    SUPPLY_DATA: '/supply/supply-data/:station/:date/:product',
    STATISTICS: '/dailysales/statistics/:stationId',
    VALIDATE_ENTRY: '/dailysales/:id/validate',
    APPROVE_ENTRY: '/dailysales/:id/approve',
    HEALTH_CHECK: '/health'
  }
};
//PREVIOUS_DAY_DATA: '/dailysales/latest/:station/:product',
//PREVIOUS_DAY_DATA: '/dailysales/latest-by-date/:station/:product',
export const DAILY_SALES_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Fuel Products
export const FUEL_PRODUCTS = [
  '--',
  'PMS',
  'AGO', 
  'LPG',
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

// Validation Rules
export const DAILY_SALES_VALIDATION_RULES = {
  MAX_VARIANCE_PERCENTAGE: 2, // Maximum 2% variance allowed
  MAX_CASH_VARIANCE: 100, // Maximum ₵100 cash variance
  REQUIRE_SUPPLY_DATA: true,
  MANDATORY_FIELDS: [
    'date',
    'product', 
    'openSL',
    'closingSL',
    'openSR',
    'closingSR',
    'rate',
    'bankLodgement'
  ],
  MIN_STOCK_LEVEL: 0,
  MAX_STOCK_LEVEL: 70000,
  MIN_RATE: 1,
  MAX_RATE: 50
};

// Mock Data for Development
export const MOCK_DAILY_SALES_ENTRIES = [
  {
    id: 'DS-001',
    date: '2024-12-15',
    product: 'Super' as const,
    openSL: 8500,
    supply: 15000,
    overageShortageL: 0,
    availableL: 23500, // 8500 + 15000 + 0
    closingSL: 6200,
    differenceL: 300, // salesL - checkL
    checkL: 17300, // 23500 - 6200
    openSR: 125680,
    closingSR: 143280,
    returnTT: 300,
    salesL: 17300, // 143280 - 125680 - 300
    rate: 15.85,
    value: 274205, // 17300 * 15.85
    cashSales: 260205, // 274205 - 14000
    creditSales: 14000,
    advances: 5000,
    shortageMomo: 2000,
    cashAvailable: 253205, // 260205 - 5000 - 2000
    repaymentShortageMomo: 1500,
    repaymentAdvances: 3000,
    receivedFromDebtors: 8000,
    cashToBank: 265705, // 253205 + 1500 + 3000 + 8000
    bankLodgement: 265000,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-15T18:30:00Z',
    status: 'SUBMITTED' as const,
    notes: 'Normal operations. Slight variance in bank lodgement due to change shortage.'
  },
  {
    id: 'DS-002',
    date: '2024-12-14',
    product: 'Diesel' as const,
    openSL: 12800,
    supply: 12000,
    overageShortageL: -50, // Shortage
    availableL: 24750, // 12800 + 12000 - 50
    closingSL: 8500,
    differenceL: 0,
    checkL: 16250, // 24750 - 8500
    openSR: 98450,
    closingSR: 114700,
    returnTT: 0,
    salesL: 16250, // 114700 - 98450 - 0
    rate: 17.20,
    value: 279500, // 16250 * 17.20
    cashSales: 265500, // 279500 - 14000
    creditSales: 14000,
    advances: 3500,
    shortageMomo: 1000,
    cashAvailable: 261000, // 265500 - 3500 - 1000
    repaymentShortageMomo: 800,
    repaymentAdvances: 2000,
    receivedFromDebtors: 5500,
    cashToBank: 269300, // 261000 + 800 + 2000 + 5500
    bankLodgement: 269300,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    enteredBy: 'Samuel Osei',
    enteredAt: '2024-12-14T19:15:00Z',
    status: 'VALIDATED' as const,
    validatedBy: 'Mary Asante',
    validatedAt: '2024-12-15T08:30:00Z'
  }
];

export const MOCK_PREVIOUS_DAY_DATA = {
  'accra-central': {
    '2024-12-15': {
      Super: { closingSL: 8500, closingSR: 125680 },
      Diesel: { closingSL: 12800, closingSR: 98450 },
      Regular: { closingSL: 9200, closingSR: 87650 },
      Gas: { closingSL: 3400, closingSR: 45230 },
      Kerosene: { closingSL: 1800, closingSR: 23450 }
    },
    '2024-12-14': {
      Super: { closingSL: 6200, closingSR: 143280 },
      Diesel: { closingSL: 8500, closingSR: 114700 },
      Regular: { closingSL: 7800, closingSR: 102850 },
      Gas: { closingSL: 2100, closingSR: 52340 },
      Kerosene: { closingSL: 1200, closingSR: 28670 }
    }
  },
  'kumasi-highway': {
    '2024-12-15': {
      Super: { closingSL: 12300, closingSR: 156780 },
      Diesel: { closingSL: 18900, closingSR: 134560 },
      Regular: { closingSL: 11800, closingSR: 98450 },
      Kerosene: { closingSL: 6500, closingSR: 45230 }
    }
  }
};

export const MOCK_SUPPLY_DATA = {
  'accra-central': {
    '2024-12-15': {
      Super: { quantity: 15000, hasOverageShortage: false, overageShortageAmount: 0 },
      Diesel: { quantity: 12000, hasOverageShortage: true, overageShortageAmount: -50 }
    },
    '2024-12-16': {
      Regular: { quantity: 18000, hasOverageShortage: false, overageShortageAmount: 0 },
      Gas: { quantity: 8000, hasOverageShortage: true, overageShortageAmount: 100 }
    }
  },
  'kumasi-highway': {
    '2024-12-15': {
      Diesel: { quantity: 20000, hasOverageShortage: false, overageShortageAmount: 0 }
    }
  }
};

export const MOCK_DAILY_SALES_STATS = {
  'accra-central': {
    totalSalesValue: 553705,
    totalCashSales: 525705,
    totalCreditSales: 28000,
    totalBankLodgement: 534300,
    entriesCount: 2,
    pendingValidation: 1,
    pendingApproval: 0
  },
  'kumasi-highway': {
    totalSalesValue: 420000,
    totalCashSales: 395000,
    totalCreditSales: 25000,
    totalBankLodgement: 395000,
    entriesCount: 3,
    pendingValidation: 2,
    pendingApproval: 1
  },
  'takoradi-port': {
    totalSalesValue: 285000,
    totalCashSales: 270000,
    totalCreditSales: 15000,
    totalBankLodgement: 270000,
    entriesCount: 2,
    pendingValidation: 0,
    pendingApproval: 2
  }
};

// Default filter values
export const DEFAULT_DAILY_SALES_FILTERS = {
  status: 'ALL' as const,
  product: 'ALL' as const,
  search: ''
};

// Refresh intervals (in milliseconds)
export const DAILY_SALES_REFRESH_INTERVALS = {
  ENTRIES: 300000, // 5 minutes
  STATISTICS: 600000, // 10 minutes
  HEALTH_CHECK: 120000 // 2 minutes
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

// Calculate percentage variance
export const calculateVariance = (expected: number | undefined | null, actual: number | undefined | null): number => {
  if (expected === undefined || expected === null || isNaN(expected) || 
      actual === undefined || actual === null || isNaN(actual)) {
    return 0;
  }
  if (expected === 0) return 0;
  return ((actual - expected) / expected) * 100;
};

// Validation helper functions
export const validateEntry = (entry: Partial<DailySalesEntry>): string[] => {
  const errors: string[] = [];
  
  // Check mandatory fields
  DAILY_SALES_VALIDATION_RULES.MANDATORY_FIELDS.forEach(field => {
    if (!entry[field as keyof DailySalesEntry]) {
      errors.push(`${field} is required`);
    }
  });
  
  // Validate stock levels
  if (entry.openSL && (entry.openSL < DAILY_SALES_VALIDATION_RULES.MIN_STOCK_LEVEL || entry.openSL > DAILY_SALES_VALIDATION_RULES.MAX_STOCK_LEVEL)) {
    errors.push(`Opening stock must be between ${DAILY_SALES_VALIDATION_RULES.MIN_STOCK_LEVEL} and ${DAILY_SALES_VALIDATION_RULES.MAX_STOCK_LEVEL} liters`);
  }
  
  // Validate rate
  if (entry.rate && (entry.rate < DAILY_SALES_VALIDATION_RULES.MIN_RATE || entry.rate > DAILY_SALES_VALIDATION_RULES.MAX_RATE)) {
    errors.push(`Rate must be between ₵${DAILY_SALES_VALIDATION_RULES.MIN_RATE} and ₵${DAILY_SALES_VALIDATION_RULES.MAX_RATE}`);
  }
  
  // Validate readings
  if (entry.openSR && entry.closingSR && entry.closingSR <= entry.openSR) {
    errors.push('Closing reading must be greater than opening reading');
  }
  
  // Check cash variance (only for AGO)
  if (entry.product === 'AGO' && entry.cashToBank && entry.bankLodgement) {
    // For AGO, get expected combined value (AGO + PMS cashToBank)
    let expectedCashToBank = entry.cashToBank;
    try {
      const storedPmsData = localStorage.getItem('pmsCashToBank');
      if (storedPmsData) {
        const pmsData = JSON.parse(storedPmsData);
        const pmsValue = parseFloat(pmsData) || 0;
        expectedCashToBank = entry.cashToBank + pmsValue;
      }
    } catch (error) {
      console.error('Error parsing PMS data for validation:', error);
    }
    
    const variance = Math.abs(expectedCashToBank - entry.bankLodgement);
    if (variance > DAILY_SALES_VALIDATION_RULES.MAX_CASH_VARIANCE) {
      errors.push(`Cash variance exceeds ₵${DAILY_SALES_VALIDATION_RULES.MAX_CASH_VARIANCE} limit (Expected: ₵${expectedCashToBank.toFixed(2)})`);
    }
  }
  
  return errors;
};