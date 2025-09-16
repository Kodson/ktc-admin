// Station Management Types for KTC Energy - Enhanced with User Authentication

export interface StationUser {
  id: string;
  username: string; // Station code will be used as username
  email: string;
  password?: string; // Only included during creation/password reset
  role: 'station_manager';
  managerStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: string;
  passwordChanged?: boolean;
  mustChangePassword?: boolean;
  accountLocked?: boolean;
  loginAttempts?: number;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface Station {
  id: string;
  name: string;
  code: string; // Unique station code (e.g., "KTC-ACC-01")
  location: {
    address: string;
    city: string;
    region: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    manager?: {
      name: string;
      phone: string;
      email: string;
      userId?: string;
    };
  };
  operational: {
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
    operatingHours: {
      open: string; // "06:00"
      close: string; // "22:00"
      is24Hours: boolean;
    };
    fuelTypes: ('Super' | 'Regular' | 'Diesel' | 'Gas' | 'Kerosene')[];
    tankCapacity: {
      [key: string]: number; // fuel type -> capacity in liters
    };
    pumpCount: number;
  };
  financial: {
    monthlyTarget: number; // in Ghana Cedis
    commissionRate: number; // percentage
    securityDeposit: number; // in Ghana Cedis
    lastAuditDate?: string;
  };
  
  // User Authentication - Links to StationUser
  user: StationUser;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  notes?: string;
}

export interface StationFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  fuelTypes: string[];
  tankCapacity: {
    [key: string]: number;
  };
  pumpCount: number;
  monthlyTarget: number;
  notes?: string;
}

export interface StationUserCredentials {
  stationId: string;
  username: string;
  email: string;
  password: string;
  temporaryPassword: boolean;
}

export interface PasswordResetRequest {
  stationId: string;
  newPassword: string;
  confirmPassword: string;
  mustChangePassword: boolean;
  requestedBy: string;
}

export interface StationStats {
  totalStations: number;
  activeStations: number;
  inactiveStations: number;
  maintenanceStations: number;
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalMonthlyTarget: number;
  averageCommissionRate: number;
  stationsWithManagers: number;
  stationsNeedingAttention: number;
  usersNeedingPasswordReset: number;
}

export interface StationFilters {
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
  userStatus?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';
  region?: 'ALL' | string;
  hasManager?: 'ALL' | 'YES' | 'NO';
  needsPasswordReset?: 'ALL' | 'YES' | 'NO';
  search?: string;
}

export interface StationManagerAssignment {
  stationId: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
  assignedBy: string;
  assignedAt: string;
  notes?: string;
}

export interface UserActivityLog {
  id: string;
  stationId: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'PASSWORD_RESET';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
}

export interface StationResponse {
  success: boolean;
  content: Station;
  message: string;
}

export interface StationsResponse {
  success: boolean;
  content: Station[];
  stats: StationStats;
  total: number;
  message?: string;
}

export interface StationUserResponse {
  success: boolean;
  user: StationUser;
  credentials: StationUserCredentials;
  message: string;
  securityNotes: string[];
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  temporaryPassword?: string;
  mustChangePassword: boolean;
}

export interface StationValidationErrors {
  [key: string]: string[];
}

// API Error types
export interface StationManagementApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stationId?: string;
}

// Connection status
export interface StationManagementConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}

// Ghana regions and cities for forms
export interface GhanaLocation {
  region: string;
  cities: string[];
}

// Audit log entry
export interface StationAuditLog {
  id: string;
  stationId: string;
  action: 'CREATED' | 'UPDATED' | 'ACTIVATED' | 'DEACTIVATED' | 'MANAGER_ASSIGNED' | 'USER_CREATED' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED';
  performedBy: string;
  performedAt: string;
  details: {
    previousValues?: Partial<Station>;
    newValues?: Partial<Station>;
    additionalInfo?: string;
  };
}

// User login attempt tracking
export interface LoginAttemptLog {
  id: string;
  stationId: string;
  username: string;
  timestamp: string;
  success: boolean;
  ipAddress?: string;
  failureReason?: string;
}