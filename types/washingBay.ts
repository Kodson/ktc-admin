// Washing Bay Management Types for KTC Energy - Washing Bay Operations and Financial Tracking

export interface WashingBayEntry {
  id: number;
  date: string;
  noOfVehicles: number;
  pricePerVehicle: number;
  totalSale: number;
  washingBayCommission: number;
  washingBayCommissionRate: number;
  companyCommission: number;
  expenses: number;
  bankDeposit: number;
  balancing: number;
  kodsonStatus: 'Complete' | 'Pending' | 'Under Review';
  
  // Additional tracking fields
  stationId: string;
  stationName: string;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: string;
  notes?: string;
  
  // Service breakdown
  serviceTypes?: WashingBayService[];
  staffOnDuty?: string[];
  equipmentUsed?: string[];
}

export interface WashingBayService {
  id: string;
  type: 'Exterior Wash' | 'Interior Wash' | 'Full Service' | 'Premium Wash' | 'Vacuum Only';
  count: number;
  pricePerService: number;
  totalRevenue: number;
}

export interface CreateWashingBayEntryRequest {
  date: string;
  noOfVehicles: string;
  pricePerVehicle: string;
  washingBayCommissionRate: string;
  expenses: string;
  notes?: string;
  serviceTypes?: WashingBayService[];
}

export interface UpdateWashingBayEntryRequest extends CreateWashingBayEntryRequest {
  id: number;
}

export interface WashingBayStats {
  totalVehicles: number;
  totalRevenue: number;
  totalWashingBayCommission: number;
  totalCompanyCommission: number;
  totalExpenses: number;
  totalBankDeposits: number;
  averageVehiclesPerDay: number;
  averageRevenuePerVehicle: number;
  
  // Period comparisons
  thisMonth: {
    vehicles: number;
    revenue: number;
    commission: number;
  };
  lastMonth: {
    vehicles: number;
    revenue: number;
    commission: number;
  };
  
  // Service type breakdown
  serviceBreakdown: {
    exteriorWash: number;
    interiorWash: number;
    fullService: number;
    premiumWash: number;
    vacuumOnly: number;
  };
}

export interface WashingBayAnalysis {
  bankDepositAnalysis: {
    totalIncome: number;
    lessWagesExpKodson: number;
    totalExpectedBankDep: number;
    actualAmountDeposited: number;
    overage: number;
  };
  
  incomeAnalysis: {
    totalIncome: number;
    lessExpenses: number;
    dailyWages: number;
    waterCost: number;
    electricityPrepaidExp: number;
    netIncomeLoss: number;
  };
  
  performanceMetrics: {
    utilization: number; // % of working hours with customers
    customerSatisfaction: number;
    averageServiceTime: number; // minutes per vehicle
    repeatCustomerRate: number; // %
  };
}

export interface WashingBayChartData {
  date: string;
  vehicles: number;
  revenue: number;
  commission: number;
  expenses: number;
}

export interface WashingBayFilters {
  status?: 'all' | 'complete' | 'pending' | 'under review';
  dateFrom?: string;
  dateTo?: string;
  minVehicles?: number;
  maxVehicles?: number;
  search?: string;
}

export interface WashingBayResponse {
  success: boolean;
  data: {
    entries: WashingBayEntry[];
    stats: WashingBayStats;
    analysis: WashingBayAnalysis;
    chartData: WashingBayChartData[];
  };
  total: number;
  message?: string;
}

export interface WashingBayServicePricing {
  exteriorWash: number;
  interiorWash: number;
  fullService: number;
  premiumWash: number;
  vacuumOnly: number;
}

export interface WashingBayEquipment {
  id: string;
  name: string;
  type: 'Pressure Washer' | 'Vacuum Cleaner' | 'Foam Cannon' | 'Water Recycling System' | 'Drying Equipment';
  status: 'Active' | 'Maintenance' | 'Out of Order';
  lastMaintenance: string;
  nextMaintenance: string;
  operatingCost: number; // per hour
}

export interface WashingBayStaff {
  id: string;
  name: string;
  role: 'Bay Manager' | 'Wash Attendant' | 'Cashier' | 'Maintenance';
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  dailyWage: number;
  performanceRating: number; // 1-5 stars
}

// API Error types
export interface WashingBayApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  entryId?: number;
}

// Connection status
export interface WashingBayConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}

export type WashingBayApiResponse = WashingBayResponse;