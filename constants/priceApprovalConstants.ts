// API Endpoints for Price Approval
export const PRICE_APPROVAL_API = {
  // Base URL - can be configured via environment variables with fallback
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  // Price Change endpoints
  ENDPOINTS: {
    PENDING_CHANGES: '/price-updates/pending',
    HISTORICAL_CHANGES: '/price-updates/history',
    APPROVE_CHANGE: '/price-updates/approve',
    REJECT_CHANGE: '/price-updates/reject',
    BULK_APPROVE: '/price-updates/bulk-approve',
    STATISTICS: '/price-updates/statistics',
    HEALTH_CHECK: '/health'
  }
};

// Request configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Available stations for KTC Energy
export const KTC_STATIONS = [
  'All Stations',
  'KTC Accra Central',
  'KTC Kumasi Highway', 
  'KTC Takoradi Port',
  'KTC Cape Coast',
  'KTC Tema Industrial',
  'KTC Ashanti Region',
  'KTC Western Region',
  'KTC Northern Sector'
];

// Fuel types
export const FUEL_TYPES = [
  'All Types',
  'Super',
  'Regular', 
  'Diesel',
  'Gas'
];

// Price change categories
export const PRICE_CHANGE_CATEGORIES = {
  MARKET_ADJUSTMENT: 'Market Adjustment',
  COST_INCREASE: 'Cost Increase',
  PROMOTIONAL: 'Promotional Pricing',
  COMPETITIVE: 'Competitive Pricing',
  OTHER: 'Other'
};

// Update scopes
export const UPDATE_SCOPES = {
  selected: 'Selected Tank',
  current_station: 'Current Station',
  all_stations: 'All Stations'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

// Status colors for UI
export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200'
};

// Priority colors for UI
export const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800 border-gray-200',
  MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200'
};

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

// Price change validation rules
export const VALIDATION_RULES = {
  MAX_PRICE_CHANGE_PERCENTAGE: 20, // Maximum 20% price change
  MIN_APPROVAL_REASON_LENGTH: 10,
  MAX_APPROVAL_REASON_LENGTH: 500
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  PENDING_CHANGES: 30000, // 30 seconds for pending changes
  STATISTICS: 60000, // 1 minute for statistics
  HEALTH_CHECK: 120000 // 2 minutes for health check
};

// Mock data for development (when backend is not available)
export const MOCK_PENDING_CHANGES = [
  {
    id: 1,
    tankId: 1,
    tankName: 'Tank A - Super',
    station: 'KTC Accra Central',
    fuelType: 'Super',
    currentPrice: 8.45,
    newPrice: 8.75,
    priceDifference: 0.30,
    percentageChange: 3.55,
    effectiveDate: '2024-12-16T06:00:00Z',
    reason: 'Global crude oil price increase. Market rate adjustment required to maintain margins.',
    requestedBy: 'Samuel Osei',
    requestedAt: '2024-12-15T14:30:00Z',
    status: 'PENDING' as const,
    updateScope: 'all_stations' as const,
    totalAffectedTanks: 12,
    affectedTankIds: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
    priority: 'HIGH' as const,
    category: 'MARKET_ADJUSTMENT' as const
  },
  {
    id: 2,
    tankId: 8,
    tankName: 'Tank B - Diesel',
    station: 'KTC Kumasi Highway',
    fuelType: 'Diesel',
    currentPrice: 9.20,
    newPrice: 8.95,
    priceDifference: -0.25,
    percentageChange: -2.72,
    effectiveDate: '2024-12-16T10:00:00Z',
    reason: 'Supplier cost reduction due to bulk purchasing agreement. Passing savings to customers.',
    requestedBy: 'Mary Asante',
    requestedAt: '2024-12-15T16:45:00Z',
    status: 'PENDING' as const,
    updateScope: 'current_station' as const,
    totalAffectedTanks: 3,
    affectedTankIds: [8, 9, 11],
    priority: 'MEDIUM' as const,
    category: 'COST_INCREASE' as const
  },
  {
    id: 3,
    tankId: 15,
    tankName: 'Tank C - Gas',
    station: 'KTC Takoradi Port',
    fuelType: 'Gas',
    currentPrice: 6.80,
    newPrice: 7.10,
    priceDifference: 0.30,
    percentageChange: 4.41,
    effectiveDate: '2024-12-15T18:00:00Z',
    reason: 'LPG market adjustment due to increased demand during holiday season.',
    requestedBy: 'Kwame Boateng',
    requestedAt: '2024-12-15T12:15:00Z',
    status: 'PENDING' as const,
    updateScope: 'selected' as const,
    totalAffectedTanks: 1,
    affectedTankIds: [15],
    priority: 'URGENT' as const,
    category: 'MARKET_ADJUSTMENT' as const
  }
];

export const MOCK_HISTORICAL_CHANGES = [
  {
    id: 10,
    tankId: 5,
    tankName: 'Tank A - Regular',
    station: 'KTC Cape Coast',
    fuelType: 'Regular',
    currentPrice: 7.90,
    newPrice: 8.15,
    priceDifference: 0.25,
    percentageChange: 3.16,
    effectiveDate: '2024-12-14T06:00:00Z',
    reason: 'Weekly market rate adjustment based on crude oil price fluctuations.',
    requestedBy: 'Samuel Osei',
    requestedAt: '2024-12-13T15:20:00Z',
    status: 'APPROVED' as const,
    approvedBy: 'Dr. Emmanuel Asante',
    approvedAt: '2024-12-14T05:30:00Z',
    approvalReason: 'Approved based on market analysis. Price increase justified by crude oil trends.',
    updateScope: 'all_stations' as const,
    totalAffectedTanks: 8,
    affectedTankIds: [5, 12, 17, 20, 26, 29, 32, 35],
    priority: 'HIGH' as const,
    category: 'MARKET_ADJUSTMENT' as const
  },
  {
    id: 11,
    tankId: 21,
    tankName: 'Tank D - Super',
    station: 'KTC Tema Industrial',
    fuelType: 'Super',
    currentPrice: 8.60,
    newPrice: 8.40,
    priceDifference: -0.20,
    percentageChange: -2.33,
    effectiveDate: '2024-12-13T12:00:00Z',
    reason: 'Promotional pricing for industrial customers to increase volume.',
    requestedBy: 'Mary Asante',
    requestedAt: '2024-12-12T10:45:00Z',
    status: 'REJECTED' as const,
    rejectedBy: 'Dr. Emmanuel Asante',
    rejectedAt: '2024-12-13T08:15:00Z',
    approvalReason: 'Rejected due to insufficient margin analysis. Please provide detailed cost breakdown and competitor pricing comparison.',
    updateScope: 'current_station' as const,
    totalAffectedTanks: 4,
    affectedTankIds: [21, 22, 23, 24],
    priority: 'MEDIUM' as const,
    category: 'PROMOTIONAL' as const
  }
];

// Default filter values
export const DEFAULT_FILTERS = {
  status: 'ALL' as const,
  station: 'All Stations' as const,
  fuelType: 'All Types' as const,
  updateScope: 'ALL' as const,
  priority: 'ALL' as const,
  search: ''
};