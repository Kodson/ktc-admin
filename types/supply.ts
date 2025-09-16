// Supply Management Types for KTC Energy - Product Sharing Integration

export interface ProductSharingSupply {
  id: string;
  date: string; // Date of the product sharing request
  product: 'Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene';
  qty: number; // Original quantity allocated
  qtyR: number | null; // Quantity received (to be updated by station manager)
  rate: number; // Rate per liter in Ghana Cedis
  overage: number | null; // Overage amount (to be updated by station manager)
  shortage: number | null; // Shortage amount (to be updated by station manager)
  salesRate: number; // Sales rate per liter
  amountSales: number; // Total sales amount expected
  expProfit: number; // Expected profit
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'RECEIVED'; // Manager status
  mstatus: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'RECEIVED'; // Manager status
  // Additional tracking fields
  stationId: string;
  stationName: string;
  fromStationId: string;
  fromStationName: string;
  productSharingRequestId: string;
  createdBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  receivedAt?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
}

export interface SupplyConfirmationRequest {
  id: string;
  qtyR: number; // Actual quantity received
  overage: number | null; // Any overage
  shortage: number | null; // Any shortage
  confirmedBy: string;
  confirmedAt: string;
  notes?: string;
  product: string;
  station: string;
}

export interface SupplyConfirmationResponse {
  success: boolean;
  message: string;
  updatedSupply: ProductSharingSupply;
}

export interface SupplyStats {
  totalPendingSupplies: number;
  totalConfirmedToday: number;
  totalQuantityExpected: number;
  totalQuantityReceived: number;
  totalValueExpected: number;
  totalValueReceived: number;
  totalShortage: number;
  totalOverage: number;
  totalExpectedProfit: number;
  averageReceiptTime: number; // in hours
}

export interface SupplyFilters {
  status?: 'ALL' | 'PENDING' | 'CONFIRMED' | 'RECEIVED';
  product?: 'ALL' | 'Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene';
  priority?: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  mstatus?: 'ALL' | 'PENDING' | 'CONFIRMED' | 'RECEIVED';
}

export interface SupplyResponse {
  success: boolean;
  content: ProductSharingSupply[];
  stats: SupplyStats;
  total: number;
  message?: string;
}

// API Error types
export interface SupplyApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  supplyId?: string;
}

// Connection status
export interface SupplyConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}