// Supply Management Constants for KTC Energy - Product Sharing Integration

// API Configuration
export const SUPPLY_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    PRODUCT_SHARING_SUPPLIES: '/supply',//product-sharing/:stationId
    CONFIRM_SUPPLY_RECEIPT: '/supply/confirm/:id',
    SUPPLY_STATISTICS: '/supply/statistics/:stationId',
    HEALTH_CHECK: '/health'
  }
};

export const SUPPLY_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 2 * 60 * 1000,
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

// Supply Status Options
export const SUPPLY_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  RECEIVED: 'Received',
  APPROVED: 'Approved',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium', 
  HIGH: 'High',
  EMERGENCY: 'Emergency'
};

// Status Colors for UI
export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  RECEIVED: 'bg-green-100 text-green-800 border-green-200'
};

// Priority Colors for UI  
export const PRIORITY_COLORS = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  EMERGENCY: 'bg-red-100 text-red-800 border-red-200 animate-pulse'
};

// Current Ghana fuel prices (December 2024) - in Ghana Cedis per liter
export const GHANA_FUEL_RATES = {
  Super: 15.85,
  Regular: 15.45,
  Diesel: 17.20,
  Gas: 13.90,
  Kerosene: 14.30
};

// Typical markup for sales rates in Ghana
export const FUEL_MARKUP_RATES = {
  Super: 1.25, // 25% markup
  Regular: 1.20, // 20% markup  
  Diesel: 1.18, // 18% markup
  Gas: 1.30, // 30% markup
  Kerosene: 1.15 // 15% markup
};

// Mock Product Sharing Supply Data for Ghana stations
export const MOCK_PRODUCT_SHARING_SUPPLIES = [
  {
    id: 'PS-001',
    date: '2024-12-15',
    product: 'Super' as const,
    qty: 15000,
    qtyR: null,
    rate: 15.85,
    overage: null,
    shortage: null,
    salesRate: 19.81, // 15.85 * 1.25
    amountSales: 297150, // 15000 * 19.81
    expProfit: 59400, // (19.81 - 15.85) * 15000
    mstatus: 'PENDING' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    fromStationId: 'tema-industrial', 
    fromStationName: 'KTC Tema Industrial',
    productSharingRequestId: 'REQ-001',
    createdBy: 'Samuel Osei',
    priority: 'HIGH' as const
  },
  {
    id: 'PS-002', 
    date: '2024-12-14',
    product: 'Diesel' as const,
    qty: 12000,
    qtyR: 11950,
    rate: 17.20,
    overage: null,
    shortage: 50,
    salesRate: 20.30, // 17.20 * 1.18
    amountSales: 242700, // 12000 * 20.30  
    expProfit: 37200, // (20.30 - 17.20) * 12000
    mstatus: 'RECEIVED' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    fromStationId: 'kumasi-highway',
    fromStationName: 'KTC Kumasi Highway', 
    productSharingRequestId: 'REQ-002',
    createdBy: 'Mary Asante',
    confirmedBy: 'Samuel Osei',
    confirmedAt: '2024-12-14T14:30:00Z',
    receivedAt: '2024-12-14T14:30:00Z',
    priority: 'MEDIUM' as const
  },
  {
    id: 'PS-003',
    date: '2024-12-16',
    product: 'Regular' as const,
    qty: 8000,
    qtyR: null,
    rate: 15.45,
    overage: null,
    shortage: null,
    salesRate: 18.54, // 15.45 * 1.20
    amountSales: 148320, // 8000 * 18.54
    expProfit: 24720, // (18.54 - 15.45) * 8000
    mstatus: 'CONFIRMED' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    fromStationId: 'cape-coast',
    fromStationName: 'KTC Cape Coast',
    productSharingRequestId: 'REQ-003', 
    createdBy: 'Kwame Boateng',
    confirmedBy: 'Samuel Osei',
    confirmedAt: '2024-12-16T09:15:00Z',
    priority: 'LOW' as const
  },
  {
    id: 'PS-004',
    date: '2024-12-15',
    product: 'Gas' as const,
    qty: 5000,
    qtyR: null,
    rate: 13.90,
    overage: null,
    shortage: null,
    salesRate: 18.07, // 13.90 * 1.30
    amountSales: 90350, // 5000 * 18.07
    expProfit: 20850, // (18.07 - 13.90) * 5000
    mstatus: 'PENDING' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    fromStationId: 'takoradi-port',
    fromStationName: 'KTC Takoradi Port',
    productSharingRequestId: 'REQ-004',
    createdBy: 'Joseph Amponsah',
    priority: 'EMERGENCY' as const
  }
];

// Mock statistics by station
export const MOCK_SUPPLY_STATS = {
  'accra-central': {
    totalPendingSupplies: 2,
    totalConfirmedToday: 1,
    totalQuantityExpected: 40000,
    totalQuantityReceived: 11950,
    totalValueExpected: 853620, // Sum of all amountSales
    totalValueReceived: 242700,
    totalShortage: 50,
    totalOverage: 0,
    totalExpectedProfit: 142170,
    averageReceiptTime: 4.5
  },
  'kumasi-highway': {
    totalPendingSupplies: 1,
    totalConfirmedToday: 0,
    totalQuantityExpected: 18000,
    totalQuantityReceived: 0,
    totalValueExpected: 320000,
    totalValueReceived: 0,
    totalShortage: 0,
    totalOverage: 0,
    totalExpectedProfit: 55000,
    averageReceiptTime: 0
  },
  'takoradi-port': {
    totalPendingSupplies: 3,
    totalConfirmedToday: 2,
    totalQuantityExpected: 35000,
    totalQuantityReceived: 22000,
    totalValueExpected: 650000,
    totalValueReceived: 420000,
    totalShortage: 100,
    totalOverage: 150,
    totalExpectedProfit: 95000,
    averageReceiptTime: 6.2
  },
  'cape-coast': {
    totalPendingSupplies: 0,
    totalConfirmedToday: 1,
    totalQuantityExpected: 12000,
    totalQuantityReceived: 12000,
    totalValueExpected: 220000,
    totalValueReceived: 220000,
    totalShortage: 0,
    totalOverage: 0,
    totalExpectedProfit: 38000,
    averageReceiptTime: 3.8
  },
  'tema-industrial': {
    totalPendingSupplies: 1,
    totalConfirmedToday: 0,
    totalQuantityExpected: 25000,
    totalQuantityReceived: 0,
    totalValueExpected: 480000,
    totalValueReceived: 0,
    totalShortage: 0,
    totalOverage: 0,
    totalExpectedProfit: 78000,
    averageReceiptTime: 0
  }
};

// Default filter values
export const DEFAULT_SUPPLY_FILTERS = {
  status: 'ALL' as const,
  product: 'All Products' as const,
  priority: 'ALL' as const,
  search: ''
};

// Validation rules
export const SUPPLY_VALIDATION_RULES = {
  MIN_QUANTITY: 100, // Minimum 100 liters
  MAX_QUANTITY: 50000, // Maximum 50000 liters per supply
  MAX_VARIANCE_PERCENTAGE: 5, // Maximum 5% variance allowed
  MIN_NOTES_LENGTH: 5,
  MAX_NOTES_LENGTH: 500
};

// Refresh intervals (in milliseconds)
export const SUPPLY_REFRESH_INTERVALS = {
  SUPPLY_DATA: 60000, // 1 minute for supply data
  STATISTICS: 300000, // 5 minutes for statistics
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
  if (volume === undefined || volume === null || typeof volume !== 'number' || isNaN(volume)) {
    return '0L';
  }
  return `${volume.toLocaleString()}L`;
};

// Calculate profit margin percentage
export const calculateProfitMargin = (salesRate: number, rate: number): number => {
  return ((salesRate - rate) / rate) * 100;
};