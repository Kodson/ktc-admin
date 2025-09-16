// Statutory Management Types for KTC Energy - Statutory Compliance and Documentation Tracking

export interface StatutoryDocument {
  id: number;
  type: 'Business License' | 'Environmental Permit' | 'Fire Safety Certificate' | 'Fuel Retail License' | 'Health Permit' | 'Insurance Policy' | 'Tax Certificate';
  title: string;
  authority: string;
  reference: string;
  registeredDate: string;
  issuedDate: string;
  expiresDate: string;
  daysRemaining: number;
  fees: number;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  status: 'Compliant' | 'Expiring Soon' | 'Expired' | 'Under Review';
  assignee: string;
  
  // Additional tracking fields
  stationId: string;
  stationName: string;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: string;
  notes?: string;
  documentUrl?: string;
}

export interface CreateStatutoryDocumentRequest {
  type: string;
  title: string;
  authority: string;
  reference: string;
  registeredDate: string;
  issuedDate: string;
  expiresDate: string;
  fees: string;
  paymentStatus: string;
  assignee: string;
  notes?: string;
  documentUrl?: string;
}

export interface UpdateStatutoryDocumentRequest extends CreateStatutoryDocumentRequest {
  id: number;
}

export interface StatutoryRenewalRequest {
  id: number;
  newExpiresDate: string;
  renewalFees: string;
  renewedBy: string;
  renewedAt: string;
  notes?: string;
}

export interface StatutoryStats {
  complianceScore: number;
  activeDocuments: {
    count: number;
    total: number;
  };
  expiringSoon: {
    count: number;
    days: number;
  };
  overdueFees: {
    amount: number;
    count: number;
  };
  criticalAlerts: {
    count: number;
    unread: number;
  };
  totalFeesPaid: number;
  totalFeesOutstanding: number;
}

export interface StatutoryChartData {
  month: string;
  count: number;
  year?: number;
}

export interface DocumentDistribution {
  name: string;
  count: number;
  color: string;
}

export interface UpcomingDeadline {
  id: number;
  title: string;
  type: 'Document Expiry' | 'Inspection' | 'Renewal' | 'Payment Due';
  date: string;
  daysRemaining: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  documentId?: number;
}

export interface StatutoryFilters {
  status?: 'all' | 'compliant' | 'expiring soon' | 'expired' | 'under review';
  documentType?: 'all' | 'business license' | 'environmental permit' | 'fire safety certificate' | 'fuel retail license' | 'health permit' | 'insurance policy' | 'tax certificate';
  paymentStatus?: 'all' | 'paid' | 'pending' | 'overdue';
  authority?: string;
  search?: string;
}

export interface StatutoryResponse {
  success: boolean;
  data: {
    documents: StatutoryDocument[];
    stats: StatutoryStats;
    monthlyExpirations: StatutoryChartData[];
    documentDistribution: DocumentDistribution[];
    upcomingDeadlines: UpcomingDeadline[];
  };
  total: number;
  message?: string;
}

export interface StatutoryRenewalResponse {
  success: boolean;
  message: string;
  updatedDocument: StatutoryDocument;
}

// API Error types
export interface StatutoryApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  documentId?: number;
}

// Connection status
export interface StatutoryConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}

export interface StatutoryInspection {
  id: number;
  type: 'Fire Safety' | 'Environmental' | 'Health' | 'Electrical' | 'Structural';
  title: string;
  inspector: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Failed' | 'Postponed';
  findings?: string;
  recommendations?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  documentId?: number;
  stationId: string;
}

export interface StatutoryAlert {
  id: number;
  type: 'Document Expiry' | 'Payment Due' | 'Inspection Required' | 'Compliance Issue';
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  dateCreated: string;
  dueDate?: string;
  status: 'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  documentId?: number;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type StatutoryApiResponse = StatutoryResponse;