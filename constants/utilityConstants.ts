// Utility Management Constants for KTC Energy - Utility Bills and Consumption Tracking

// API Configuration
export const UTILITY_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8080/api',
  
  ENDPOINTS: {
    UTILITIES: '/utility/bills/:stationId',
    CREATE_BILL: '/utility/bills',
    UPDATE_BILL: '/utility/bills/:id',
    DELETE_BILL: '/utility/bills/:id',
    PAY_BILL: '/utility/bills/:id/pay',
    STATISTICS: '/utility/statistics/:stationId',
    BUDGET_DATA: '/utility/budget/:stationId',
    MONTHLY_DATA: '/utility/monthly/:stationId',
    PIE_DATA: '/utility/breakdown/:stationId',
    EXPORT: '/utility/export/:stationId',
    HEALTH_CHECK: '/health'
  }
};

export const UTILITY_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Utility Types
export const UTILITY_TYPES = [
  'Electricity',
  'Water', 
  'Internet',
  'Security Systems',
  'Waste Management',
  'Gas',
  'Maintenance'
];

// Bill Status Options
export const BILL_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  PROCESSING: 'Processing'
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

// Status Colors for UI
export const STATUS_COLORS = {
  PENDING: 'bg-blue-100 text-blue-800 border-blue-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  PROCESSING: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

// Priority Colors for UI  
export const PRIORITY_COLORS = {
  LOW: 'bg-green-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  URGENT: 'bg-red-500 text-white'
};

// Common Ghana Utility Providers
export const GHANA_UTILITY_PROVIDERS = {
  Electricity: [
    'Electricity Company of Ghana (ECG)',
    'Northern Electricity Distribution Company (NEDCo)',
    'Ghana Grid Company (GRIDCo)'
  ],
  Water: [
    'Ghana Water Company Limited (GWCL)',
    'Aqua Vitens Rand Limited (AVRL)',
    'Urban Water Limited'
  ],
  Internet: [
    'MTN Ghana',
    'Vodafone Ghana',
    'AirtelTigo Ghana',
    'Surfline Communications',
    'Busy Internet'
  ],
  'Security Systems': [
    'SecureWatch Ghana',
    'Eagle Eye Security',
    'Ultimate Security',
    'Global Security Services'
  ],
  'Waste Management': [
    'Clean City Services',
    'Waste Management Ghana',
    'Environmental Services',
    'Green City Solutions'
  ]
};

// Mock Utility Bills Data for Ghana stations
export const MOCK_UTILITY_BILLS = [
  {
    id: 1,
    dueDate: 'Feb 14, 2025',
    daysOverdue: 170,
    utility: 'Electricity' as const,
    provider: 'Electricity Company of Ghana (ECG)',
    billNumber: 'ECG-2025-001',
    period: 'Dec 14, 2024 - Jan 14, 2025',
    consumption: { value: 2260, unit: 'kWh', rate: 1.64 },
    amount: 2640.00,
    status: 'Pending' as const,
    priority: 'High' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Samuel Osei'
  },
  {
    id: 2,
    dueDate: 'Feb 9, 2025',
    daysOverdue: 175,
    utility: 'Water' as const,
    provider: 'Ghana Water Company Limited (GWCL)',
    billNumber: 'GWCL-2025-002',
    period: 'Dec 9, 2024 - Jan 9, 2025',
    consumption: { value: 270, unit: 'cubic meters', rate: 1.67 },
    amount: 495.00,
    status: 'Pending' as const,
    priority: 'Medium' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Mary Asante'
  },
  {
    id: 3,
    dueDate: 'Jan 30, 2025',
    daysOverdue: 185,
    utility: 'Internet' as const,
    provider: 'MTN Ghana',
    billNumber: 'MTN-2025-003',
    period: 'Dec 31, 2024 - Jan 30, 2025',
    consumption: { value: 'N/A', unit: '', rate: 0 },
    amount: 350.00,
    status: 'Paid' as const,
    priority: 'Medium' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Kwame Boateng',
    paidBy: 'Sarah Admin',
    paidAt: '2025-01-28T10:30:00Z'
  },
  {
    id: 4,
    dueDate: 'Jan 27, 2025',
    daysOverdue: 188,
    utility: 'Security Systems' as const,
    provider: 'SecureWatch Ghana',
    billNumber: 'SW-2025-004',
    period: 'Nov 30, 2024 - Dec 30, 2024',
    consumption: { value: 'N/A', unit: '', rate: 0 },
    amount: 1200.00,
    status: 'Overdue' as const,
    priority: 'Urgent' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Joseph Amponsah'
  },
  {
    id: 5,
    dueDate: 'Feb 4, 2025',
    daysOverdue: 180,
    utility: 'Waste Management' as const,
    provider: 'Clean City Services',
    billNumber: 'CCS-2025-005',
    period: 'Nov 30, 2024 - Dec 30, 2024',
    consumption: { value: 'N/A', unit: '', rate: 0 },
    amount: 280.00,
    status: 'Pending' as const,
    priority: 'Low' as const,
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Grace Mensah'
  },
  // Additional bills for other stations
  {
    id: 6,
    dueDate: 'Feb 20, 2025',
    daysOverdue: 164,
    utility: 'Electricity' as const,
    provider: 'Electricity Company of Ghana (ECG)',
    billNumber: 'ECG-2025-006',
    period: 'Dec 20, 2024 - Jan 20, 2025',
    consumption: { value: 1890, unit: 'kWh', rate: 1.64 },
    amount: 2200.00,
    status: 'Pending' as const,
    priority: 'High' as const,
    stationId: 'kumasi-highway',
    stationName: 'KTC Kumasi Highway',
    createdBy: 'Akwasi Prempeh'
  },
  {
    id: 7,
    dueDate: 'Feb 15, 2025',
    daysOverdue: 169,
    utility: 'Water' as const,
    provider: 'Ghana Water Company Limited (GWCL)',
    billNumber: 'GWCL-2025-007',
    period: 'Dec 15, 2024 - Jan 15, 2025',
    consumption: { value: 185, unit: 'cubic meters', rate: 1.67 },
    amount: 380.00,
    status: 'Paid' as const,
    priority: 'Medium' as const,
    stationId: 'kumasi-highway',
    stationName: 'KTC Kumasi Highway',
    createdBy: 'Akwasi Prempeh',
    paidBy: 'Kumasi Admin',
    paidAt: '2025-02-10T14:20:00Z'
  }
];

// Mock statistics by station
export const MOCK_UTILITY_STATS = {
  'accra-central': {
    thisMonth: { amount: 0.00, count: 0 },
    pending: { amount: 3415.00, count: 3 },
    overdue: { amount: 1200.00, count: 1 },
    paid: { amount: 350.00, count: 1 },
    budgetStatus: 87.9,
    totalBudget: 6000.00,
    totalSpent: 4965.00
  },
  'kumasi-highway': {
    thisMonth: { amount: 380.00, count: 1 },
    pending: { amount: 2200.00, count: 1 },
    overdue: { amount: 0.00, count: 0 },
    paid: { amount: 380.00, count: 1 },
    budgetStatus: 92.3,
    totalBudget: 5500.00,
    totalSpent: 2580.00
  },
  'takoradi-port': {
    thisMonth: { amount: 1250.00, count: 2 },
    pending: { amount: 1890.00, count: 2 },
    overdue: { amount: 650.00, count: 1 },
    paid: { amount: 1250.00, count: 2 },
    budgetStatus: 78.5,
    totalBudget: 5800.00,
    totalSpent: 3790.00
  }
};

// Monthly utility data
export const MONTHLY_UTILITY_DATA = [
  { month: 'Mar', amount: 2800 },
  { month: 'Apr', amount: 3200 },
  { month: 'May', amount: 2900 },
  { month: 'Jun', amount: 3100 },
  { month: 'Jul', amount: 2700 },
  { month: 'Aug', amount: 3400 }
];

// Utility breakdown pie chart data
export const UTILITY_PIE_DATA = [
  { name: 'Electricity', value: 2640, color: '#000000' },
  { name: 'Water', value: 495, color: '#404040' },
  { name: 'Internet', value: 350, color: '#606060' },
  { name: 'Security', value: 1200, color: '#808080' },
  { name: 'Waste', value: 280, color: '#a0a0a0' }
];

// Budget data
export const UTILITY_BUDGET_DATA = [
  { name: 'Electricity', current: 2640, budget: 3000, percentage: 88.0, category: 'Power' },
  { name: 'Water', current: 495, budget: 600, percentage: 82.5, category: 'Utilities' },
  { name: 'Internet', current: 350, budget: 400, percentage: 87.5, category: 'Communications' },
  { name: 'Security Systems', current: 1200, budget: 1300, percentage: 92.3, category: 'Security' },
  { name: 'Waste Management', current: 280, budget: 350, percentage: 80.0, category: 'Maintenance' }
];

// Default filter values
export const DEFAULT_UTILITY_FILTERS = {
  status: 'all' as const,
  utility: 'all' as const,
  priority: 'all' as const,
  search: ''
};

// Validation rules
export const UTILITY_VALIDATION_RULES = {
  MIN_AMOUNT: 1, // Minimum ₵1
  MAX_AMOUNT: 50000, // Maximum ₵50,000 per bill
  MIN_CONSUMPTION: 0,
  MAX_CONSUMPTION: 100000,
  MIN_NOTES_LENGTH: 5,
  MAX_NOTES_LENGTH: 500
};

// Refresh intervals (in milliseconds)
export const UTILITY_REFRESH_INTERVALS = {
  UTILITY_DATA: 120000, // 2 minutes for utility data
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

// Format consumption units
export const formatConsumption = (value: number | 'N/A', unit: string): string => {
  if (value === 'N/A') return 'N/A';
  return `${value.toLocaleString()} ${unit}`;
};

// Calculate days overdue
export const calculateDaysOverdue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Ghana utility rate averages (as of December 2024)
export const GHANA_UTILITY_RATES = {
  Electricity: { rate: 1.64, unit: 'kWh', currency: '₵' },
  Water: { rate: 1.67, unit: 'cubic meters', currency: '₵' },
  Internet: { rate: 0, unit: 'monthly', currency: '₵' },
  'Security Systems': { rate: 0, unit: 'monthly', currency: '₵' },
  'Waste Management': { rate: 0, unit: 'monthly', currency: '₵' }
};