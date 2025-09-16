// User Management Types for KTC Energy

export interface userLists {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'station_manager' | 'admin' | 'super_admin';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';
  
  // Profile Information
  firstName: string;
  lastName: string;
  fullName: string;
  
  // Authentication
  password?: string; // Only included during creation/password reset
  lastLogin?: string;
  passwordChanged: boolean;
  mustChangePassword: boolean;
  accountLocked: boolean;
  loginAttempts: number;
  lockoutUntil?: string;
  
  // Assignment Information
  assignedStations: string[]; // Array of station IDs
  primaryStation?: string; // Primary station ID for station managers
  
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  notes?: string;
}

export interface UserFormData {
  username: string;
  password: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
  isNonLocked: boolean;
  profileImage?: File | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  lockedUsers: number;
  stationManagers: number;
  admins: number;
  superAdmins: number;
  unassignedUsers: number;
  usersNeedingPasswordReset: number;
}

export interface UserFilters {
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';
  role?: 'ALL' | 'station_manager' | 'admin' | 'super_admin';
  assignmentStatus?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
  needsPasswordReset?: 'ALL' | 'YES' | 'NO';
  search?: string;
}

export interface PasswordResetRequest {
  userId: string;
  newPassword: string;
  confirmPassword: string;
  mustChangePassword: boolean;
  requestedBy: string;
}

export interface UserAssignmentRequest {
  userId: string;
  stationIds: string[];
  primaryStationId?: string;
  assignedBy: string;
}

export interface UserStatusUpdateRequest {
  userId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  reason?: string;
  updatedBy: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  stats: UserStats;
  total: number;
  message?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  temporaryPassword?: string;
  mustChangePassword: boolean;
}

export interface UserValidationErrors {
  [key: string]: string[];
}

// API Error types
export interface UserManagementApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
}

// Connection status
export interface UserManagementConnectionStatus {
  connected: boolean;
  lastChecked: string;
  endpoint: string;
  responseTime?: number;
  lastSyncTime?: string;
}

// User activity log
export interface UserActivityLog {
  id: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'PASSWORD_RESET' | 'STATUS_CHANGED' | 'STATION_ASSIGNED' | 'STATION_UNASSIGNED';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  performedBy?: string;
  success: boolean;
  details?: string;
}

// Audit log entry
export interface UserAuditLog {
  id: string;
  userId: string;
  action: 'CREATED' | 'UPDATED' | 'ACTIVATED' | 'DEACTIVATED' | 'SUSPENDED' | 'DELETED' | 'PASSWORD_RESET' | 'STATION_ASSIGNED' | 'STATION_UNASSIGNED';
  performedBy: string;
  performedAt: string;
  details: {
    previousValues?: Partial<User>;
    newValues?: Partial<User>;
    additionalInfo?: string;
  };
}

// Pagination
export interface UserPagination {
  page: number;
  pageSize: number;
  sortBy: 'username' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
}