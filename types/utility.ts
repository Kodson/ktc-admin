// Utility Management Types for KTC Energy - Utility Bills and Consumption Tracking

export interface UtilityBill {
  id: number;
  dueDate: string;
  daysOverdue: number;
  utility: 'Electricity' | 'Water' | 'Internet' | 'Security Systems' | 'Waste Management' | 'Gas' | 'Maintenance';
  provider: string;
  billNumber: string;
  period: string;
  consumption: {
    value: number | 'N/A';
    unit: string;
    rate: number;
  };
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Processing';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  
  // Additional tracking fields
  stationId: string;
  stationName: string;
  createdBy: string;
  paidBy?: string;
  paidAt?: string;
  notes?: string;
}

export interface CreateUtilityBillRequest {
  utility: string;
  provider: string;
  billNumber: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  consumption?: string;
  unit?: string;
  rate?: string;
  amount: string;
  status: string;
  priority: string;
  notes?: string;
}

export interface UpdateUtilityBillRequest extends CreateUtilityBillRequest {
  id: number;
}

export interface UtilityPaymentRequest {
  id: number;
  paidBy: string;
  paidAt: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque' | 'Mobile Money';
  transactionReference?: string;
  notes?: string;
}

export interface UtilityStats {
  thisMonth: {
    amount: number;
    count: number;
  };
  pending: {
    amount: number;
    count: number;
  };
  overdue: {
    amount: number;
    count: number;
  };
  paid: {
    amount: number;
    count: number;
  };
  budgetStatus: number; // percentage
  totalBudget: number;
  totalSpent: number;
}

export interface UtilityBudgetItem {
  name: string;
  current: number;
  budget: number;
  percentage: number;
  category: string;
}

export interface UtilityChartData {
  month: string;
  amount: number;
  year?: number;
}

export interface UtilityPieData {
  name: string;
  value: number;
  color: string;
}

export interface UtilityFilters {
  status?: 'all' | 'pending' | 'paid' | 'overdue' | 'processing';
  utility?: 'all' | 'electricity' | 'water' | 'internet' | 'security systems' | 'waste management' | 'gas' | 'maintenance';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface UtilityResponse {
  success: boolean;
  content: UtilityBill[];
  stats: UtilityStats;
  budgetData: UtilityBudgetItem[];
  monthlyData: UtilityChartData[];
  pieData: UtilityPieData[];
  total: number;
  message?: string;
  // Pagination fields
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  pageable?: any;
  size?: number;
  sort?: any;
  totalElements?: number;
  totalPages?: number;
}

export interface UtilityPaymentResponse {
  success: boolean;
  message: string;
  updatedBill: UtilityBill;
}

// API Error types
export interface UtilityApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  billId?: number;
}

// Connection status
export interface UtilityConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}