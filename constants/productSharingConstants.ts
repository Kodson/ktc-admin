// Correct BASE_URL declaration
// Enhanced constants specific to ProductSharing component
export const FUEL_TYPES = [
  { value: 'PMS', label: 'PMS' },
  { value: 'AGO', label: 'AGO' },
  { value: 'RON 95', label: 'RON 95' },
  { value: 'Gas', label: 'Gas (LPG)' }
] as const;

export const SUPPLIERS = [
  'KTC Supply Co.',
  'Ghana Oil Company', 
  'Tema Oil Refinery',
  'Emergency Fuel Services'
] as const;

export const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'emergency', label: 'Emergency' }
] as const;

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' }
] as const;

export const PRICE_UPDATE_SCOPES = [
  { value: 'selected', label: 'Selected Tank Only' },
  { value: 'current_station', label: 'Current Station' },
  { value: 'all_stations', label: 'All Stations' }
] as const;

export const SHARED_PRODUCT_STATUS_FILTERS = [
  'All Status',
  'PENDING', 
  'APPROVED',
  'REJECTED'
] as const;

// Interface for station-quantity pairs
export interface StationQuantityPair {
  id: string;
  station: string;
  quantity: string;
}

// Interface for price update affected tanks
export interface AffectedTank {
  id: number;
  name: string;
  station: string;
  fuelType: string;
  currentPrice: number;
  newPrice: number;
  priceDifference: number;
  percentageChange: number;
}

// Helper function to get current datetime in datetime-local format
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Type augmentation for ImportMeta to include 'env'
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// API endpoints
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api';

export const API_ENDPOINTS = {
  tanks: `${BASE_URL}/tanks`,
  supply: `${BASE_URL}/supply`,
  prices: `${BASE_URL}/prices`,
  bulkPriceUpdate: `${BASE_URL}/price-updates`,
  health: `${BASE_URL}/health`,
  approve: `${BASE_URL}/supply/approve`,
  decline: `${BASE_URL}/supply/decline`
} as const;

/**
 * Backend API Structure Expected:
 * 
 * POST /api/prices/bulk-update
 * Request Body:
 * {
 *   "updateScope": "selected" | "current_station" | "all_stations",
 *   "targetTankId": number | null,  // Only for "selected" scope
 *   "targetStation": string | null, // Only for "current_station" scope
 *   "fuelType": string,            // Required for all scopes
 *   "newPrice": number,            // New price per liter
 *   "effectiveDate": string,       // ISO datetime string (YYYY-MM-DDTHH:mm)
 *   "reason": string,              // Reason for price change
 *   "updatedBy": string,           // User who made the change
 *   "affectedTankIds": number[],   // List of tank IDs that will be updated
 *   "totalAffectedTanks": number   // Count of affected tanks
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "updatedCount": number,
 *   "affectedTanks": Array<{
 *     "id": number,
 *     "name": string,
 *     "station": string,
 *     "oldPrice": number,
 *     "newPrice": number
 *   }>
 * }
 */

// Default form states
export const DEFAULT_SHARE_FORM = {
  date: new Date().toISOString().split('T')[0],
  selectedStations: [] as StationQuantityPair[],
  product: '',
  rate: '',
  salesRate: '',
  totalQty: '',
  amountCost: '',
  amountSales: '',
  expectedProfit: ''
};

export const DEFAULT_PRICE_FORM = {
  tankId: '',
  applyTo: 'selected' as 'selected' | 'current_station' | 'all_stations',
  fuelType: '',
  newPrice: '',
  effectiveDate: getCurrentDateTimeLocal(),
  reason: '',
  currentStation: ''
};

export const DEFAULT_ADD_TANK_FORM = {
  name: '',
  station: '',
  fuelType: '',
  capacity: '',
  currentStock: '',
  pricePerLiter: ''
};

export const DEFAULT_MANAGE_FORM = {
  name: '',
  capacity: '',
  minLevel: '',
  maxLevel: '',
  autoReorder: false,
  reorderThreshold: '',
  status: 'active'
};

export const DEFAULT_REFILL_FORM = {
  supplier: '',
  amount: '',
  estimatedCost: '',
  urgency: 'normal',
  notes: '',
  scheduledDate: ''
};

export const DEFAULT_UPDATE_SHARED_PRODUCT_FORM = {
  date: '',
  stationQuantities: {} as Record<string, string>,
  product: '',
  rate: '',
  salesRate: '',
  totalQty: '',
  amountCost: '',
  amountSales: '',
  expectedProfit: ''
};