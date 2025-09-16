// Daily Sales Entry Types for KTC Energy

export interface DailySalesEntry {
  id?: string;
  date: string;
  product: 'Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene';
  
  // Stock Management
  openSL: number; // Opening Stock in Liters
  supply: number; // Supply received
  overageShortageL: number; // Overage/Shortage in Liters (positive for overage, negative for shortage)
  availableL: number; // Available = Open Stock + Supply + Overage/Shortage (calculated)
  closingSL: number; // Closing Stock in Liters
  differenceL: number; // Difference = Sales - Sales Check (calculated)
  checkL: number; // Sales Check = Available - Closing Stock (calculated)
  
  // Meter Readings
  openSR: number; // Opening Stock Reading
  closingSR: number; // Closing Stock Reading
  returnTT: number; // Return to Tank
  
  // Sales Calculations
  salesL: number; // Sales = Closing Reading - Opening Reading - Return TT (calculated)
  rate: number; // Rate per liter in Ghana Cedis
  value: number; // Value = Rate * Sales (calculated)
  
  // Financial Management
  cashSales: number; // Cash Sales = Value - Credit Sales (calculated)
  creditSales: number; // Credit Sales (manual entry)
  advances: number; // Advances given
  shortageMomo: number; // Shortage/Mobile Money
  cashAvailable: number; // Cash Available = Cash Sales - Advances - Shortage/Momo (calculated)
  repaymentShortageMomo: number; // Repayment of Shortage/Momo
  repaymentAdvances: number; // Repayment of Advances
  receivedFromDebtors: number; // Amount received from debtors
  cashToBank: number; // Cash to Bank = Cash Available + Repayments + Debtors (calculated)
  bankLodgement: number; // Actual bank lodgement amount
  
  // Metadata
  stationId: string;
  stationName: string;
  enteredBy: string;
  enteredAt: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'APPROVED';
  validatedBy?: string;
  validatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface PreviousDayData {
  date: string;
  product: string;
  closingSL: number;
  closingSR: number;
}

export interface SupplyData {
  date: string;
  product: string;
  qty: number;
  hasOverageShortage: boolean;
  overageShortageAmount: number;
  overage?: number;
  shortage?: number;
  qtyReceived: number;
}

export interface DailySalesStats {
  totalSalesValue: number;
  totalCashSales: number;
  totalCreditSales: number;
  totalBankLodgement: number;
  entriesCount: number;
  pendingValidation: number;
  pendingApproval: number;
}

export interface DailySalesFilters {
  status?: 'ALL' | 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'APPROVED';
  product?: 'ALL' | 'Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DailySalesEntryRequest {
  date: string;
  product: string;
  openSL: number;
  supply: number;
  overageShortageL: number;
  availableL: number;
  differenceL: number;
  checkL: number;
  salesL: number;
  closingSL: number;
  openSR: number;
  closingSR: number;
  returnTT: number;
  rate: number;
  creditSales: number;
  advances: number;
  value: number;
  cashSales: number;
  cashAvailable: number;
  cashToBank: number;
  shortageMomo: number;
  repaymentShortageMomo: number;
  repaymentAdvances: number;
  receivedFromDebtors: number;
  bankLodgement: number;
  notes?: string;
  station: string;
  enteredBy: string;
  status: 'DRAFT' | 'SUBMITTED';

}

export interface DailySalesEntryResponse {
  success: boolean;
  message: string;
  entry: DailySalesEntry;
  calculatedFields: {
    availableL: number;
    checkL: number;
    salesL: number;
    value: number;
    cashSales: number;
    cashAvailable: number;
    cashToBank: number;
    differenceL: number;
  };
}

export interface DailySalesValidationRules {
  maxVariancePercentage: number;
  maxCashVariance: number;
  requireSupplyData: boolean;
  mandatoryFields: string[];
}

// API Error types
export interface DailySalesApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  entryId?: string;
}

// Connection status
export interface DailySalesConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}