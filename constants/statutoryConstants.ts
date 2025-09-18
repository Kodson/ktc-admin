// Statutory Management Constants for KTC Energy - Statutory Compliance and Documentation Tracking
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
// API Configuration
export const STATUTORY_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    DOCUMENTS: '/statutory/documents/:stationId',
    CREATE_DOCUMENT: '/statutory/documents',
    UPDATE_DOCUMENT: '/statutory/documents/:id',
    DELETE_DOCUMENT: '/statutory/documents/:id',
    RENEW_DOCUMENT: '/statutory/documents/:id/renew',
    STATISTICS: '/statutory/statistics/:stationId',
    MONTHLY_DATA: '/statutory/monthly/:stationId',
    DISTRIBUTION_DATA: '/statutory/distribution/:stationId',
    DEADLINES: '/statutory/deadlines/:stationId',
    INSPECTIONS: '/statutory/inspections/:stationId',
    ALERTS: '/statutory/alerts/:stationId',
    EXPORT: '/statutory/export/:stationId',
    HEALTH_CHECK: '/health'
  }
};

export const STATUTORY_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Document Types
export const DOCUMENT_TYPES = [
  'Business License',
  'Environmental Permit',
  'Fire Safety Certificate',
  'Fuel Retail License',
  'Health Permit',
  'Insurance Policy',
  'Tax Certificate'
];

// Document Status Options
export const DOCUMENT_STATUS = {
  COMPLIANT: 'Compliant',
  EXPIRING_SOON: 'Expiring Soon',
  EXPIRED: 'Expired',
  UNDER_REVIEW: 'Under Review'
};

// Payment Status Options
export const PAYMENT_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE'
};

// Status Colors for UI
export const STATUS_COLORS = {
  COMPLIANT: 'bg-green-100 text-green-800 border-green-200',
  'EXPIRING SOON': 'bg-orange-100 text-orange-800 border-orange-200',
  EXPIRED: 'bg-red-100 text-red-800 border-red-200',
  'UNDER REVIEW': 'bg-blue-100 text-blue-800 border-blue-200'
};

// Payment Status Colors for UI  
export const PAYMENT_STATUS_COLORS = {
  PAID: 'bg-blue-600 text-white',
  PENDING: 'bg-orange-500 text-white',
  OVERDUE: 'bg-red-600 text-white'
};

// Ghana Regulatory Authorities
export const GHANA_AUTHORITIES = {
  'Business License': [
    'Accra Metropolitan Assembly',
    'Kumasi Metropolitan Assembly',
    'Sekondi-Takoradi Metropolitan Assembly',
    'Cape Coast Metropolitan Assembly',
    'Tamale Metropolitan Assembly'
  ],
  'Environmental Permit': [
    'Environmental Protection Agency (EPA)',
    'Ministry of Environment, Science, Technology and Innovation'
  ],
  'Fire Safety Certificate': [
    'Ghana National Fire Service',
    'National Disaster Management Organisation (NADMO)'
  ],
  'Fuel Retail License': [
    'National Petroleum Authority (NPA)',
    'Ministry of Energy'
  ],
  'Health Permit': [
    'Ghana Health Service',
    'Food and Drugs Authority (FDA)',
    'District Health Directorate'
  ],
  'Insurance Policy': [
    'National Insurance Commission (NIC)'
  ],
  'Tax Certificate': [
    'Ghana Revenue Authority (GRA)',
    'Internal Revenue Service'
  ]
};

// Mock Statutory Documents Data for Ghana stations
export const MOCK_STATUTORY_DOCUMENTS = [
  {
    id: 1,
    type: 'Business License' as const,
    title: 'Business Operating License',
    authority: 'Accra Metropolitan Assembly',
    reference: 'BOL-2024-001',
    registeredDate: 'Jan 14, 2023',
    issuedDate: 'Jan 14, 2024',
    expiresDate: 'Jan 14, 2025',
    daysRemaining: 45,
    fees: 2500.00,
    paymentStatus: 'PAID' as const,
    status: 'Compliant' as const,
    assignee: 'Station Manager',
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Samuel Osei'
  },
  {
    id: 2,
    type: 'Environmental Permit' as const,
    title: 'Environmental Protection Permit',
    authority: 'Environmental Protection Agency',
    reference: 'EPP-2024-007',
    registeredDate: 'Feb 28, 2023',
    issuedDate: 'Feb 28, 2024',
    expiresDate: 'Feb 28, 2025',
    daysRemaining: 89,
    fees: 1800.00,
    paymentStatus: 'PAID' as const,
    status: 'Compliant' as const,
    assignee: 'Environmental Officer',
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Mary Asante'
  },
  {
    id: 3,
    type: 'Fire Safety Certificate' as const,
    title: 'Fire Safety Certificate',
    authority: 'Ghana National Fire Service',
    reference: 'FSC-2024-156',
    registeredDate: 'Jan 14, 2023',
    issuedDate: 'Jan 14, 2024',
    expiresDate: 'Dec 14, 2024',
    daysRemaining: 15,
    fees: 800.00,
    paymentStatus: 'PENDING' as const,
    status: 'Expiring Soon' as const,
    assignee: 'Safety Officer',
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Kwame Boateng'
  },
  {
    id: 4,
    type: 'Fuel Retail License' as const,
    title: 'Petroleum Retail License',
    authority: 'National Petroleum Authority',
    reference: 'PRL-2024-044',
    registeredDate: 'Dec 31, 2022',
    issuedDate: 'Jan 31, 2024',
    expiresDate: 'Jan 31, 2026',
    daysRemaining: 405,
    fees: 5000.00,
    paymentStatus: 'PAID' as const,
    status: 'Compliant' as const,
    assignee: 'Operations Manager',
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Joseph Amponsah'
  },
  {
    id: 5,
    type: 'Health Permit' as const,
    title: 'Health Department Permit',
    authority: 'Ghana Health Service',
    reference: 'HDP-2024-089',
    registeredDate: 'Jan 19, 2023',
    issuedDate: 'Jan 19, 2024',
    expiresDate: 'Jul 19, 2024',
    daysRemaining: -123,
    fees: 400.00,
    paymentStatus: 'OVERDUE' as const,
    status: 'Expired' as const,
    assignee: 'Facility Manager',
    stationId: 'accra-central',
    stationName: 'KTC Accra Central',
    createdBy: 'Grace Mensah'
  },
  // Additional documents for other stations
  {
    id: 6,
    type: 'Business License' as const,
    title: 'Business Operating License',
    authority: 'Kumasi Metropolitan Assembly',
    reference: 'BOL-2024-002',
    registeredDate: 'Mar 10, 2023',
    issuedDate: 'Mar 10, 2024',
    expiresDate: 'Mar 10, 2025',
    daysRemaining: 99,
    fees: 2200.00,
    paymentStatus: 'PAID' as const,
    status: 'Compliant' as const,
    assignee: 'Station Manager',
    stationId: 'kumasi-highway',
    stationName: 'KTC Kumasi Highway',
    createdBy: 'Akwasi Prempeh'
  },
  {
    id: 7,
    type: 'Fire Safety Certificate' as const,
    title: 'Fire Safety Certificate',
    authority: 'Ghana National Fire Service',
    reference: 'FSC-2024-157',
    registeredDate: 'Apr 05, 2023',
    issuedDate: 'Apr 05, 2024',
    expiresDate: 'Apr 05, 2025',
    daysRemaining: 124,
    fees: 750.00,
    paymentStatus: 'PAID' as const,
    status: 'Compliant' as const,
    assignee: 'Safety Officer',
    stationId: 'kumasi-highway',
    stationName: 'KTC Kumasi Highway',
    createdBy: 'Akwasi Prempeh'
  }
];

// Mock statistics by station
export const STATUTORY_STATS = {
  'accra-central': {
    complianceScore: 60,
    activeDocuments: { count: 4, total: 5 },
    expiringSoon: { count: 1, days: 30 },
    overdueFees: { amount: 500.00, count: 1 },
    criticalAlerts: { count: 1, unread: 2 },
    totalFeesPaid: 9100.00,
    totalFeesOutstanding: 500.00
  },
  'kumasi-highway': {
    complianceScore: 85,
    activeDocuments: { count: 2, total: 2 },
    expiringSoon: { count: 0, days: 30 },
    overdueFees: { amount: 0.00, count: 0 },
    criticalAlerts: { count: 0, unread: 0 },
    totalFeesPaid: 2950.00,
    totalFeesOutstanding: 0.00
  },
  'takoradi-port': {
    complianceScore: 72,
    activeDocuments: { count: 3, total: 4 },
    expiringSoon: { count: 1, days: 30 },
    overdueFees: { amount: 300.00, count: 1 },
    criticalAlerts: { count: 1, unread: 1 },
    totalFeesPaid: 4200.00,
    totalFeesOutstanding: 300.00
  }
};

// Monthly expiration data
export const MONTHLY_STATUTORY_EXPIRATIONS = [
  { month: 'Aug', count: 0 },
  { month: 'Sep', count: 0 },
  { month: 'Oct', count: 0 },
  { month: 'Nov', count: 0 },
  { month: 'Dec', count: 4 },
  { month: 'Jan', count: 0 },
  { month: 'Feb', count: 0 },
  { month: 'Mar', count: 0 },
  { month: 'Apr', count: 0 },
  { month: 'May', count: 0 },
  { month: 'Jun', count: 0 },
  { month: 'Jul', count: 0 }
];

// Document distribution data
export const STATUTORY_DOCUMENT_DISTRIBUTION = [
  { name: 'Business License', count: 1, color: '#000000' },
  { name: 'Environmental Permit', count: 1, color: '#404040' },
  { name: 'Fire Safety Certificate', count: 1, color: '#606060' },
  { name: 'Fuel Retail License', count: 1, color: '#808080' },
  { name: 'Health Permit', count: 1, color: '#a0a0a0' }
];

// Upcoming deadlines
export const STATUTORY_UPCOMING_DEADLINES = [
  {
    id: 1,
    title: 'Fire Safety Certificate',
    type: 'Document Expiry' as const,
    date: 'Dec 14, 2024',
    daysRemaining: 15,
    priority: 'High' as const,
    documentId: 3
  },
  {
    id: 2,
    title: 'Annual Safety Inspection',
    type: 'Inspection' as const,
    date: 'Dec 19, 2024',
    daysRemaining: 20,
    priority: 'Medium' as const
  }
];

// Default filter values
export const DEFAULT_STATUTORY_FILTERS = {
  status: 'all' as const,
  documentType: 'all' as const,
  paymentStatus: 'all' as const,
  search: ''
};

// Validation rules
export const STATUTORY_VALIDATION_RULES = {
  MIN_FEES: 1, // Minimum ₵1
  MAX_FEES: 100000, // Maximum ₵100,000 per document
  MIN_REFERENCE_LENGTH: 3,
  MAX_REFERENCE_LENGTH: 50,
  MIN_NOTES_LENGTH: 5,
  MAX_NOTES_LENGTH: 1000
};

// Refresh intervals (in milliseconds)
export const STATUTORY_REFRESH_INTERVALS = {
  DOCUMENT_DATA: 180000, // 3 minutes for document data
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

// Calculate days remaining until expiry
export const calculateDaysRemaining = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Determine document status based on days remaining
export const getDocumentStatus = (daysRemaining: number): string => {
  if (daysRemaining < 0) return 'Expired';
  if (daysRemaining <= 30) return 'Expiring Soon';
  return 'Compliant';
};

// Generate document reference number
export const generateDocumentReference = (type: string, authority: string): string => {
  const typeAbbr = type.split(' ').map(word => word.charAt(0)).join('');
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${typeAbbr}-${year}-${random}`;
};

// Document renewal fee calculation (typically 10% increase)
export const calculateRenewalFee = (originalFee: number): number => {
  return Math.round(originalFee * 1.1 * 100) / 100;
};