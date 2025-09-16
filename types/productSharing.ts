export interface ModalState {
  shareProduct: boolean;
  batchShareProduct: boolean;
  updatePrice: boolean;
  viewHistory: boolean;
  manageTank: boolean;
  orderRefill: boolean;
  addTank: boolean;
  deleteTank: boolean;
  viewSharedProduct: boolean;
  updateSharedProduct: boolean;
  deleteSharedProduct: boolean;
  importBatch: boolean;
  selectTemplate: boolean;
}

export interface SelectedTank {
  id: number;
  name: string;
  station: string;
  fuelType: string;
  capacity: number;
  currentStock: number;
  fillPercentage: number;
  pricePerLiter: number;
  lastRefill: string;
  status: string;
}

export interface HistoryEntry {
  id: number;
  date: string;
  type: 'Refill' | 'Emergency Refill' | 'Transfer Out' | 'Transfer In' | 'Price Update' | 'Maintenance' | 'Calibration' | 'Quality Check';
  amount?: number;
  supplier?: string;
  source?: string;
  destination?: string;
  cost?: number;
  oldPrice?: number;
  newPrice?: number;
  description?: string;
  urgency?: string;
  operator: string;
}

export interface StationQuantity {
  station: string;
  qty: number;
}

export interface SharedProduct {
  id: number;
  date: string;
  station?: string;      // Direct property - flattened from stationQuantities (optional for backward compatibility)
  qty?: number;          // Direct property - flattened from stationQuantities (optional for backward compatibility)
  stationQuantities?: StationQuantity[]; // Array structure from mockSharedProductsData
  product: string;
  totalQty: number;
  rate: number;
  amountCost: number;
  salesRate: number;
  amountSales: number;
  expectedProfit: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}

export interface BatchProductEntry {
  id: string;
  product: string;
  stationQuantities: Record<string, string>;
  rate: string;
  salesRate: string;
  totalQty: string;
  amountCost: string;
  amountSales: string;
  expectedProfit: string;
}

// Price Change interfaces for approval system
export interface PriceChange {
  id: number | string;
  tankId: number;
  tankName: string;
  station: string;
  fuelType: string;
  currentPrice: number;
  newPrice: number;
  priceDifference: number;
  percentageChange: number;
  effectiveDate: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvalReason?: string;
  updateScope: 'selected' | 'current_station' | 'all_stations';
  totalAffectedTanks: number;
  affectedTankIds: number[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: 'MARKET_ADJUSTMENT' | 'COST_INCREASE' | 'PROMOTIONAL' | 'COMPETITIVE' | 'OTHER';
  targetStation?: string[];
}

// API Response interfaces for price changes
export interface PriceChangeResponse {
  success: boolean;
  data: PriceChange[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface PriceChangeApprovalRequest {
  id: number | string;
  action: 'APPROVE' | 'REJECT';
  reason: string;
  approvedBy: string;
}

export interface PriceChangeApprovalResponse {
  success: boolean;
  data: PriceChange;
  message: string;
}

// Filter interfaces for price changes
export interface PriceChangeFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
  station?: string;
  fuelType?: string;
  dateFrom?: string;
  dateTo?: string;
  requestedBy?: string;
  updateScope?: 'selected' | 'current_station' | 'all_stations' | 'ALL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'ALL';
  search?: string;
}

// Statistics interface for price approval dashboard
export interface PriceApprovalStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  totalAffectedTanks: number;
  averagePriceChange: number;
  totalValueImpact: number;
}

// Backend connection status
export interface ConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
}

// API Error interface
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}