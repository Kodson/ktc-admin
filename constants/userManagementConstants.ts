// User Management Constants for KTC Energy
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
// API Configuration
export const USER_MANAGEMENT_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    USERS: '/user/list',
    USER_BY_ID: '/users/:id',
    CREATE_USER: '/user/adduser',
    UPDATE_USER: '/users/:id/update',
    DELETE_USER: '/users/:id/delete',
    ACTIVATE_USER: '/users/:id/activate',
    DEACTIVATE_USER: '/users/:id/deactivate',
    SUSPEND_USER: '/users/:id/suspend',
    UNLOCK_USER: '/users/:id/unlock',
    RESET_PASSWORD: '/users/:id/reset-password',
    ASSIGN_STATIONS: '/users/:id/assign-stations',
    UNASSIGN_STATIONS: '/users/:id/unassign-stations',
    USER_STATISTICS: '/users/statistics',
    USER_ACTIVITY_LOG: '/users/:id/activity-log',
    AUDIT_LOG: '/users/:id/audit-log',
    HEALTH_CHECK: '/health'
  }
};

export const USER_MANAGEMENT_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// User Roles
export const USER_ROLES = {
  station_manager: 'ROLE_STATION_MANAGER',
  admin: 'Admin',
  super_admin: 'Super Admin'
};

// User Status Options
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  LOCKED: 'Locked'
};

// Status Colors for UI
export const USER_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  LOCKED: 'bg-orange-100 text-orange-800 border-orange-200'
};

// Role Colors for UI
export const USER_ROLE_COLORS = {
  station_manager: 'bg-blue-100 text-blue-800 border-blue-200',
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  super_admin: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

// Mock User Data for Development
export const MOCK_USERS = [
  {
    id: 'user-001',
    username: 'samuel.osei',
    email: 'samuel.osei@ktcenergy.com.gh',
    phone: '+233 24 987 6543',
    role: 'station_manager' as const,
    status: 'ACTIVE' as const,
    firstName: 'Samuel',
    lastName: 'Osei',
    fullName: 'Samuel Osei',
    lastLogin: '2024-12-15T08:30:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: ['accra-central'],
    primaryStation: 'accra-central',
    createdBy: 'System Admin',
    createdAt: '2024-01-15T10:00:00Z',
    lastModifiedBy: 'Mary Asante',
    lastModifiedAt: '2024-12-01T14:30:00Z',
    notes: 'Primary station manager for Accra Central location'
  },
  {
    id: '202',
    username: 'kwame.boateng',
    email: 'kwame.boateng@ktcenergy.com.gh',
    phone: '+233 24 876 5432',
    role: 'station_manager' as const,
    status: 'ACTIVE' as const,
    firstName: 'Kwame',
    lastName: 'Boateng',
    fullName: 'Kwame Boateng',
    lastLogin: '2024-12-14T09:15:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: ['kumasi-highway'],
    primaryStation: 'kumasi-highway',
    createdBy: 'System Admin',
    createdAt: '2024-02-01T11:00:00Z',
    lastModifiedBy: 'Joseph Amponsah',
    lastModifiedAt: '2024-11-15T16:45:00Z',
    notes: 'Experienced manager handling highway station operations'
  },
  {
    id: '102',
    username: 'mary.asante',
    email: 'mary.asante@ktcenergy.com.gh',
    phone: '+233 24 765 4321',
    role: 'admin' as const,
    status: 'ACTIVE' as const,
    firstName: 'Mary',
    lastName: 'Asante',
    fullName: 'Mary Asante',
    lastLogin: '2024-12-15T07:45:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: ['accra-central', 'kumasi-highway', 'cape-coast'],
    createdBy: 'Joseph Amponsah',
    createdAt: '2024-01-10T08:00:00Z',
    lastModifiedBy: 'Joseph Amponsah',
    lastModifiedAt: '2024-10-20T12:30:00Z',
    notes: 'Regional admin responsible for Greater Accra and Ashanti regions'
  },
  {
    id: '202',
    username: 'joseph.amponsah',
    email: 'joseph.amponsah@ktcenergy.com.gh',
    phone: '+233 24 654 3210',
    role: 'super_admin' as const,
    status: 'ACTIVE' as const,
    firstName: 'Joseph',
    lastName: 'Amponsah',
    fullName: 'Joseph Amponsah',
    lastLogin: '2024-12-15T06:00:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: [], // Super admins have access to all stations
    createdBy: 'System',
    createdAt: '2024-01-01T00:00:00Z',
    notes: 'System administrator with full access to all operations'
  },
  {
    id: 'user-005',
    username: 'akosua.mensah',
    email: 'akosua.mensah@ktcenergy.com.gh',
    phone: '+233 24 543 2109',
    role: 'station_manager' as const,
    status: 'ACTIVE' as const,
    firstName: 'Akosua',
    lastName: 'Mensah',
    fullName: 'Akosua Mensah',
    lastLogin: '2024-12-13T07:45:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: ['cape-coast'],
    primaryStation: 'cape-coast',
    createdBy: 'Mary Asante',
    createdAt: '2024-04-12T12:00:00Z',
    lastModifiedBy: 'Mary Asante',
    lastModifiedAt: '2024-10-05T15:20:00Z',
    notes: 'Managing Cape Coast operations with focus on university customer base'
  },
  {
    id: 'user-006',
    username: 'eric.asante',
    email: 'eric.asante@ktcenergy.com.gh',
    phone: '+233 24 432 1098',
    role: 'station_manager' as const,
    status: 'ACTIVE' as const,
    firstName: 'Eric',
    lastName: 'Asante',
    fullName: 'Eric Asante',
    lastLogin: '2024-12-15T06:00:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: ['tema-industrial'],
    primaryStation: 'tema-industrial',
    createdBy: 'Joseph Amponsah',
    createdAt: '2024-05-20T09:30:00Z',
    lastModifiedBy: 'Mary Asante',
    lastModifiedAt: '2024-12-10T11:15:00Z',
    notes: 'Specialist in handling industrial and commercial vehicle fueling'
  },
  {
    id: 'user-007',
    username: 'ama.yeboah',
    email: 'ama.yeboah@ktcenergy.com.gh',
    phone: '+233 24 321 0987',
    role: 'station_manager' as const,
    status: 'INACTIVE' as const,
    firstName: 'Ama',
    lastName: 'Yeboah',
    fullName: 'Ama Yeboah',
    passwordChanged: false,
    mustChangePassword: true,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: [],
    createdBy: 'Mary Asante',
    createdAt: '2024-11-01T14:00:00Z',
    notes: 'New hire pending station assignment and initial training'
  },
  {
    id: 'user-008',
    username: 'kwaku.mensah',
    email: 'kwaku.mensah@ktcenergy.com.gh',
    phone: '+233 24 210 9876',
    role: 'admin' as const,
    status: 'SUSPENDED' as const,
    firstName: 'Kwaku',
    lastName: 'Mensah',
    fullName: 'Kwaku Mensah',
    lastLogin: '2024-11-20T16:30:00Z',
    passwordChanged: true,
    mustChangePassword: false,
    accountLocked: false,
    loginAttempts: 0,
    assignedStations: ['takoradi-port', 'western-region-stations'],
    createdBy: 'Joseph Amponsah',
    createdAt: '2024-03-10T09:30:00Z',
    lastModifiedBy: 'Joseph Amponsah',
    lastModifiedAt: '2024-11-21T10:00:00Z',
    notes: 'Suspended pending investigation - compliance review in progress'
  }
];

// Mock Statistics
export const MOCK_USER_STATS = {
  totalUsers: 8,
  activeUsers: 6,
  inactiveUsers: 1,
  suspendedUsers: 1,
  lockedUsers: 0,
  stationManagers: 5,
  admins: 2,
  superAdmins: 1,
  unassignedUsers: 1,
  usersNeedingPasswordReset: 1
};

// Validation Rules
export const USER_VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  USERNAME_PATTERN: /^[a-zA-Z0-9._-]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+233\s\d{2}\s\d{3}\s\d{4}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  NAME_PATTERN: /^[a-zA-Z\s\-']+$/
};

// Default filter values
export const DEFAULT_USER_FILTERS = {
  status: 'ALL' as const,
  role: 'ALL' as const,
  assignmentStatus: 'ALL' as const,
  needsPasswordReset: 'ALL' as const,
  search: ''
};

// Pagination defaults
export const DEFAULT_USER_PAGINATION = {
  page: 1,
  pageSize: 20,
  sortBy: 'username' as const,
  sortOrder: 'asc' as const
};

// Refresh intervals (in milliseconds)
export const USER_REFRESH_INTERVALS = {
  USERS_DATA: 300000, // 5 minutes
  STATISTICS: 600000, // 10 minutes
  HEALTH_CHECK: 120000 // 2 minutes
};

// Format phone number for Ghana
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Ghana phone numbers
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Convert 0XX XXX XXXX to +233 XX XXX XXXX
    return `+233 ${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('233')) {
    // Format 233XXXXXXXXX to +233 XX XXX XXXX
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  
  return phone; // Return original if no formatting rules match
};

// Generate secure password
export const generateSecurePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
  let password = '';
  
  // Ensure at least one character from each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '@$!%*?&'[Math.floor(Math.random() * 7)]; // Special character
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Validate user form data
export const validateUserForm = (data: Partial<any>): { [key: string]: string[] } => {
  const errors: { [key: string]: string[] } = {};
  
  // Username validation
  if (!data.username || data.username.length < USER_VALIDATION_RULES.USERNAME_MIN_LENGTH) {
    errors.username = [`Username must be at least ${USER_VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`];
  } else if (!USER_VALIDATION_RULES.USERNAME_PATTERN.test(data.username)) {
    errors.username = ['Username can only contain letters, numbers, dots, hyphens, and underscores'];
  }
  
  // Email validation
  if (!data.email || !USER_VALIDATION_RULES.EMAIL_PATTERN.test(data.email)) {
    errors.email = ['Please enter a valid email address'];
  }
  
  // Phone validation
  if (!data.phone || !USER_VALIDATION_RULES.PHONE_PATTERN.test(data.phone)) {
    errors.phone = ['Phone must follow format: +233 XX XXX XXXX'];
  }
  
  // First name validation
  if (!data.firstName || data.firstName.length < USER_VALIDATION_RULES.NAME_MIN_LENGTH) {
    errors.firstName = [`First name must be at least ${USER_VALIDATION_RULES.NAME_MIN_LENGTH} characters`];
  } else if (!USER_VALIDATION_RULES.NAME_PATTERN.test(data.firstName)) {
    errors.firstName = ['First name can only contain letters, spaces, hyphens, and apostrophes'];
  }
  
  // Last name validation
  if (!data.lastName || data.lastName.length < USER_VALIDATION_RULES.NAME_MIN_LENGTH) {
    errors.lastName = [`Last name must be at least ${USER_VALIDATION_RULES.NAME_MIN_LENGTH} characters`];
  } else if (!USER_VALIDATION_RULES.NAME_PATTERN.test(data.lastName)) {
    errors.lastName = ['Last name can only contain letters, spaces, hyphens, and apostrophes'];
  }
  
  // Password validation
  if (data.password) {
    if (data.password.length < USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.password = [`Password must be at least ${USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`];
    } else if (!USER_VALIDATION_RULES.PASSWORD_PATTERN.test(data.password)) {
      errors.password = ['Password must contain uppercase, lowercase, number, and special character'];
    }
  }
  
  // Confirm password validation
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = ['Passwords do not match'];
  }
  
  // Role validation
  if (!data.role || !Object.keys(USER_ROLES).includes(data.role)) {
    errors.role = ['Please select a valid role'];
  }
  
  return errors;
};

// Validate password strength
export const validatePasswordStrength = (password: string): { 
  score: number; 
  feedback: string[]; 
  isValid: boolean; 
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    score += 1;
  } else {
    feedback.push(`Password must be at least ${USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`);
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain lowercase letters');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain uppercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain numbers');
  }
  
  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain special characters (@$!%*?&)');
  }
  
  return {
    score,
    feedback,
    isValid: score === 5
  };
};

// Get user role priority for sorting
export const getRolePriority = (role: string): number => {
  const priorities = {
    'super_admin': 1,
    'admin': 2,
    'station_manager': 3
  };
  return priorities[role as keyof typeof priorities] || 4;
};

// Get status priority for sorting
export const getStatusPriority = (status: string): number => {
  const priorities = {
    'ACTIVE': 1,
    'INACTIVE': 2,
    'SUSPENDED': 3,
    'LOCKED': 4
  };
  return priorities[status as keyof typeof priorities] || 5;
};