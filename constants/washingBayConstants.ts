// Washing Bay Management Constants for KTC Energy - Washing Bay Operations and Financial Tracking
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
// API Configuration
export const WASHING_BAY_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    ENTRIES: '/washingBay/station/:stationId',
    CREATE_ENTRY: '/washingBay',
    UPDATE_ENTRY: '/washingBay/entries/:id',
    DELETE_ENTRY: '/washingBay/entries/:id',
    STATISTICS: '/washingBay/statistics/:stationId',
    ANALYSIS: '/washingBay/analysis/:stationId',
    CHART_DATA: '/washingBay/chart-data/:stationId',
    SERVICE_PRICING: '/washingBay/pricing/:stationId',
    EQUIPMENT: '/washingBay/equipment/:stationId',
    STAFF: '/washingBay/staff/:stationId',
    EXPORT: '/washingBay/export/:stationId',
    HEALTH_CHECK: '/health'
  }
};

export const WASHING_BAY_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 3 * 60 * 1000, // 3 minutes
};

// Service Types
export const WASHING_BAY_SERVICES = [
  'Exterior Wash',
  'Interior Wash', 
  'Full Service',
  'Premium Wash',
  'Vacuum Only'
];

// Status Options
export const KODSON_STATUS = {
  COMPLETE: 'Complete',
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review'
};

// Status Colors for UI
export const STATUS_COLORS = {
  COMPLETE: 'bg-green-100 text-green-800 border-green-200',
  PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
  'UNDER REVIEW': 'bg-blue-100 text-blue-800 border-blue-200'
};

// Ghana Car Wash Service Pricing (in Ghana Cedis)
export const GHANA_WASHING_BAY_PRICING = {
  'Exterior Wash': 15.00,
  'Interior Wash': 20.00,
  'Full Service': 35.00,
  'Premium Wash': 50.00,
  'Vacuum Only': 8.00
};

// Standard commission rates for washing bay operations in Ghana
export const DEFAULT_COMMISSION_RATES = {
  WASHING_BAY_COMMISSION_RATE: 20, // 20%
  COMPANY_COMMISSION_RATE: 80, // 80%
  STAFF_WAGE_PERCENTAGE: 15 // 15% of total revenue
};

// Mock Washing Bay Entries Data for Ghana stations
export const MOCK_WASHING_BAY_ENTRIES = [
  {
    id: 1,
    date: 'Dec 1, 2024',
    noOfVehicles: 25,
    pricePerVehicle: 100.00,
    totalSale: 2500.00,
    washingBayCommission: 500.00,
    washingBayCommissionRate: 20,
    companyCommission: 2000.00,
    expenses: 150.00,
    bankDeposit: 2350.00,
    balancing: 0.00,
    kodsonStatus: 'Complete' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Samuel Osei',
    serviceTypes: [
      { id: '1', type: 'Full Service' as const, count: 15, pricePerService: 35.00, totalRevenue: 525.00 },
      { id: '2', type: 'Exterior Wash' as const, count: 8, pricePerService: 15.00, totalRevenue: 120.00 },
      { id: '3', type: 'Premium Wash' as const, count: 2, pricePerService: 50.00, totalRevenue: 100.00 }
    ]
  },
  {
    id: 2,
    date: 'Dec 2, 2024',
    noOfVehicles: 30,
    pricePerVehicle: 100.00,
    totalSale: 3000.00,
    washingBayCommission: 600.00,
    washingBayCommissionRate: 20,
    companyCommission: 2400.00,
    expenses: 200.00,
    bankDeposit: 2800.00,
    balancing: 0.00,
    kodsonStatus: 'Complete' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Mary Asante'
  },
  {
    id: 3,
    date: 'Dec 3, 2024',
    noOfVehicles: 22,
    pricePerVehicle: 100.00,
    totalSale: 2200.00,
    washingBayCommission: 440.00,
    washingBayCommissionRate: 20,
    companyCommission: 1760.00,
    expenses: 120.00,
    bankDeposit: 2080.00,
    balancing: 0.00,
    kodsonStatus: 'Complete' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Kwame Boateng'
  },
  {
    id: 4,
    date: 'Dec 4, 2024',
    noOfVehicles: 35,
    pricePerVehicle: 100.00,
    totalSale: 3500.00,
    washingBayCommission: 700.00,
    washingBayCommissionRate: 20,
    companyCommission: 2800.00,
    expenses: 250.00,
    bankDeposit: 3250.00,
    balancing: 0.00,
    kodsonStatus: 'Pending' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Joseph Amponsah'
  },
  // Additional entries for other stations
  {
    id: 5,
    date: 'Dec 1, 2024',
    noOfVehicles: 18,
    pricePerVehicle: 95.00,
    totalSale: 1710.00,
    washingBayCommission: 342.00,
    washingBayCommissionRate: 20,
    companyCommission: 1368.00,
    expenses: 100.00,
    bankDeposit: 1610.00,
    balancing: 0.00,
    kodsonStatus: 'Complete' as const,
    stationId: 'kumasi-highway',
    stationName: 'KTC Kumasi Highway',
    createdBy: 'Akwasi Prempeh'
  },
  {
    id: 6,
    date: 'Dec 2, 2024',
    noOfVehicles: 28,
    pricePerVehicle: 110.00,
    totalSale: 3080.00,
    washingBayCommission: 616.00,
    washingBayCommissionRate: 20,
    companyCommission: 2464.00,
    expenses: 180.00,
    bankDeposit: 2900.00,
    balancing: 0.00,
    kodsonStatus: 'Pending' as const,
    stationId: 'takoradi-port',
    stationName: 'KTC Takoradi Port',
    createdBy: 'Kofi Asante'
  }
];

// Mock statistics by station
export const MOCK_WASHING_BAY_STATS = {
  'accra-central': {
    totalVehicles: 112,
    totalRevenue: 11200.00,
    totalWashingBayCommission: 2240.00,
    totalCompanyCommission: 8960.00,
    totalExpenses: 720.00,
    totalBankDeposits: 10480.00,
    averageVehiclesPerDay: 28,
    averageRevenuePerVehicle: 100.00,
    thisMonth: {
      vehicles: 112,
      revenue: 11200.00,
      commission: 2240.00
    },
    lastMonth: {
      vehicles: 95,
      revenue: 9500.00,
      commission: 1900.00
    },
    serviceBreakdown: {
      exteriorWash: 30,
      interiorWash: 25,
      fullService: 40,
      premiumWash: 12,
      vacuumOnly: 5
    }
  },
  'kumasi-highway': {
    totalVehicles: 86,
    totalRevenue: 8170.00,
    totalWashingBayCommission: 1634.00,
    totalCompanyCommission: 6536.00,
    totalExpenses: 520.00,
    totalBankDeposits: 7650.00,
    averageVehiclesPerDay: 21.5,
    averageRevenuePerVehicle: 95.00,
    thisMonth: {
      vehicles: 86,
      revenue: 8170.00,
      commission: 1634.00
    },
    lastMonth: {
      vehicles: 72,
      revenue: 6840.00,
      commission: 1368.00
    },
    serviceBreakdown: {
      exteriorWash: 35,
      interiorWash: 28,
      fullService: 18,
      premiumWash: 3,
      vacuumOnly: 2
    }
  },
  'takoradi-port': {
    totalVehicles: 140,
    totalRevenue: 15400.00,
    totalWashingBayCommission: 3080.00,
    totalCompanyCommission: 12320.00,
    totalExpenses: 890.00,
    totalBankDeposits: 14510.00,
    averageVehiclesPerDay: 35,
    averageRevenuePerVehicle: 110.00,
    thisMonth: {
      vehicles: 140,
      revenue: 15400.00,
      commission: 3080.00
    },
    lastMonth: {
      vehicles: 125,
      revenue: 13750.00,
      commission: 2750.00
    },
    serviceBreakdown: {
      exteriorWash: 25,
      interiorWash: 30,
      fullService: 55,
      premiumWash: 25,
      vacuumOnly: 5
    }
  }
};

// Mock analysis data
export const MOCK_WASHING_BAY_ANALYSIS = {
  'accra-central': {
    bankDepositAnalysis: {
      totalIncome: 11200.00,
      lessWagesExpKodson: 3460.00, // Commission + expenses + KODSON estimate
      totalExpectedBankDep: 7740.00,
      actualAmountDeposited: 10480.00,
      overage: 2740.00
    },
    incomeAnalysis: {
      totalIncome: 2240.00, // Bay commission
      lessExpenses: 720.00,
      dailyWages: 1680.00, // 15% of total revenue
      waterCost: 150.00,
      electricityPrepaidExp: 200.00,
      netIncomeLoss: -510.00 // Negative indicates loss
    },
    performanceMetrics: {
      utilization: 75, // 75% utilization
      customerSatisfaction: 4.2, // out of 5
      averageServiceTime: 25, // 25 minutes per vehicle
      repeatCustomerRate: 65 // 65% repeat customers
    }
  }
};

// Chart data for visualization
export const MOCK_WASHING_BAY_CHART_DATA = [
  { date: 'Dec 1', vehicles: 25, revenue: 2500, commission: 500, expenses: 150 },
  { date: 'Dec 2', vehicles: 30, revenue: 3000, commission: 600, expenses: 200 },
  { date: 'Dec 3', vehicles: 22, revenue: 2200, commission: 440, expenses: 120 },
  { date: 'Dec 4', vehicles: 35, revenue: 3500, commission: 700, expenses: 250 },
  { date: 'Dec 5', vehicles: 28, revenue: 2800, commission: 560, expenses: 180 },
  { date: 'Dec 6', vehicles: 32, revenue: 3200, commission: 640, expenses: 220 },
  { date: 'Dec 7', vehicles: 26, revenue: 2600, commission: 520, expenses: 160 }
];

// Equipment data
export const MOCK_WASHING_BAY_EQUIPMENT = [
  {
    id: 'eq-001',
    name: 'High Pressure Washer - Main',
    type: 'Pressure Washer' as const,
    status: 'Active' as const,
    lastMaintenance: '2024-11-15',
    nextMaintenance: '2024-12-15',
    operatingCost: 12.50 // per hour
  },
  {
    id: 'eq-002',
    name: 'Industrial Vacuum Cleaner',
    type: 'Vacuum Cleaner' as const,
    status: 'Active' as const,
    lastMaintenance: '2024-11-20',
    nextMaintenance: '2024-12-20',
    operatingCost: 8.00
  },
  {
    id: 'eq-003',
    name: 'Foam Cannon System',
    type: 'Foam Cannon' as const,
    status: 'Maintenance' as const,
    lastMaintenance: '2024-11-10',
    nextMaintenance: '2024-12-10',
    operatingCost: 5.50
  }
];

// Staff data
export const MOCK_WASHING_BAY_STAFF = [
  {
    id: 'staff-001',
    name: 'Emmanuel Tetteh',
    role: 'Bay Manager' as const,
    shift: 'Morning' as const,
    dailyWage: 80.00,
    performanceRating: 4.5
  },
  {
    id: 'staff-002',
    name: 'Ama Serwaa',
    role: 'Wash Attendant' as const,
    shift: 'Morning' as const,
    dailyWage: 50.00,
    performanceRating: 4.2
  },
  {
    id: 'staff-003',
    name: 'Yaw Mensah',
    role: 'Wash Attendant' as const,
    shift: 'Afternoon' as const,
    dailyWage: 50.00,
    performanceRating: 4.0
  }
];

// Default filter values
export const DEFAULT_WASHING_BAY_FILTERS = {
  status: 'all' as const,
  search: ''
};

// Validation rules
export const WASHING_BAY_VALIDATION_RULES = {
  MIN_VEHICLES: 1,
  MAX_VEHICLES: 200, // Maximum vehicles per day
  MIN_PRICE_PER_VEHICLE: 5.00, // Minimum ₵5 per vehicle
  MAX_PRICE_PER_VEHICLE: 500.00, // Maximum ₵500 per vehicle
  MIN_COMMISSION_RATE: 0, // 0%
  MAX_COMMISSION_RATE: 50, // 50%
  MIN_EXPENSES: 0,
  MAX_EXPENSES: 10000, // Maximum ₵10,000 expenses per day
  MIN_NOTES_LENGTH: 5,
  MAX_NOTES_LENGTH: 500
};

// Refresh intervals (in milliseconds)
export const WASHING_BAY_REFRESH_INTERVALS = {
  ENTRY_DATA: 120000, // 2 minutes for entry data
  STATISTICS: 300000, // 5 minutes for statistics
  HEALTH_CHECK: 120000 // 2 minutes for health check
};

// Ghana Cedi currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('GH₵', '₵');
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Calculate commission based on rate and total sale
export const calculateCommission = (totalSale: number, rate: number): number => {
  return Math.round((totalSale * rate / 100) * 100) / 100;
};

// Calculate expected bank deposit
export const calculateBankDeposit = (totalSale: number, expenses: number): number => {
  return Math.round((totalSale - expenses) * 100) / 100;
};

// Calculate balancing amount
export const calculateBalancing = (totalSale: number, washingBayCommission: number, expenses: number, bankDeposit: number): number => {
  return Math.round((totalSale - washingBayCommission - expenses - bankDeposit) * 100) / 100;
};

// Average price per vehicle in Ghana washing bays
export const GHANA_AVERAGE_PRICES = {
  STANDARD_WASH: 80.00,
  PREMIUM_WASH: 120.00,
  LUXURY_VEHICLES: 150.00,
  COMMERCIAL_VEHICLES: 200.00
};

// Operating hours for washing bay
export const OPERATING_HOURS = {
  OPENING_TIME: '06:00',
  CLOSING_TIME: '18:00',
  LUNCH_BREAK_START: '12:00',
  LUNCH_BREAK_END: '13:00',
  PEAK_HOURS: ['08:00-10:00', '16:00-18:00']
};