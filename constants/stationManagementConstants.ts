// Station Management Constants for KTC Energy - Enhanced with User Authentication
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
// API Configuration
export const STATION_MANAGEMENT_API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8081/api',
  
  ENDPOINTS: {
    STATIONS: '/stations',
    STATION_BY_ID: '/stations/:id',
    CREATE_STATION: '/stations',
    UPDATE_STATION: '/stations/:id/update',
    DELETE_STATION: '/stations/:id/delete',
    ACTIVATE_STATION: '/stations/:id/activate',
    DEACTIVATE_STATION: '/stations/:id/deactivate',
    ASSIGN_MANAGER: '/stations/assign/:id',
    UNASSIGN_MANAGER: '/stations/unassign/:id',
    // User Management Endpoints
    STATION_USERS: '/stations/users',
    CREATE_STATION_USER: '/stations/:id/create-user',
    RESET_PASSWORD: '/stations/:id/reset-password',
    LOCK_USER: '/stations/:id/lock-user',
    UNLOCK_USER: '/stations/:id/unlock-user',
    UPDATE_USER_STATUS: '/stations/:id/user-status',
    USER_ACTIVITY_LOG: '/stations/:id/activity-log',
    
    STATION_STATISTICS: '/stations/statistics',
    AUDIT_LOG: '/stations/:id/audit-log',
    HEALTH_CHECK: '/health'
  }
};

export const STATION_MANAGEMENT_API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
};

// Ghana Regions and All Major Cities/Towns
export const GHANA_REGIONS = [
  {
    region: 'Greater Accra',
    cities: [
      'Accra', 'Tema', 'Kasoa', 'Adenta', 'Madina', 'Legon', 'Teshie', 'Nungua',
      'Dansoman', 'Osu', 'Labone', 'Cantonments', 'Airport Residential Area',
      'Spintex', 'Achimota', 'Dome', 'Ga East', 'Weija', 'Gbawe', 'Ablekuma',
      'Odorkor', 'Darkuman', 'Sowutuom', 'Pokuase', 'Amasaman', 'Nsawam','Kpone',
      'Ashaiman','Oyibi','Bortianor','Mallam','Haatso','Ashaley Botwe','Ofankor','Dzorwulu',
      'East Legon','West Legon','North Legon','South Legon','Kaneshie','Korle Gonno',
      'Chorkor','James Town','Ussher Town','La','Nungua Estates','Teshie-Nungua Estates',
      'Tema Newtown','Community 1','Community 2','Community 3','Community 4','Community 5',
      'Community 6','Community 7','Community 8','Community 9','Community 10','Sakumono',
      'Ashaiman Estates','Tema West','Tema East','Tema Central','Tema Industrial Area',
      'Tema Harbour', 'Tema Community 11', 'Tema Community 12', 'Tema Community 13', 'Tema Community 14', 'Tema Community 15',
      'Tema Community 16', 'Tema Community 17', 'Tema Community 18', 'Tema Community 19', 'Tema Community 20',
      'Tema Community 21', 'Tema Community 22', 'Tema Community 23', 'Tema Community 24', 'Tema Community 25',
      'Oyibi','Malejor'
    ]
  },
  {
    region: 'Ashanti',
    cities: [
      'Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Mampong', 'Offinso', 'Bekwai',
      'Suame', 'Bantama', 'Tafo', 'Pankrono', 'Kwadaso', 'Asokore Mampong',
      'Juaben', 'Agogo', 'Jacobu', 'Fomena', 'Manso Nkwanta', 'Dunkwa',
      'Tepa', 'Kenyase', 'Adansi', 'Manhyia', 'Adum', 'Kejetia', 'Santasi',
      'Mampongteng Bodede', 'Asafo', 'Nhyiaeso', 'Asawase', 'Atonsu', 'Kwame Nkrumah University of Science and Technology (KNUST)', 'Aboabo',
      'Asonomaso', 'Bantama', 'Bodwesango', 'Bomso', 'Danyame', 'Fante New Town',
      'Kotei', 'Kwadaso', 'Moshie Zongo', 'Nhyiaeso', 'Oduom', 'Suame Magazine',
      'Tafo', 'Zongo Junction', 'Asokwa', 'Asawase', 'Atonsu', 'Ayigya', 'Bantama',
      'Bodwesango', 'Bomso', 'Danyame', 'Fante New Town', 'Kotei', 'Kwadaso',
    ]
  },
  {
    region: 'Western',
    cities: [
      'Takoradi', 'Sekondi', 'Tarkwa', 'Axim', 'Elubo', 'Prestea', 'Bogoso',
      'Aboso', 'Nsuta', 'Dunkwa-On-Offin', 'Obuasi', 'Simpa', 'Shama',
      'Agona Nkwanta', 'Dixcove', 'Busua', 'Ahanta West', 'Amenfi West',
      'Amenfi Central', 'Amenfi East', 'Wassa East', 'Wassa West',
      'Ellembelle', 'Jomoro', 'Nzema East', 'Nzema West', 'Mpohor', 'Bibiani',
    ]
  },
  {
    region: 'Central',
    cities: [
      'Cape Coast', 'Elmina', 'Winneba', 'Dunkwa', 'Agona Swedru', 'Ajumako',
      'Assin Fosu', 'Komenda', 'Saltpond', 'Anomabu', 'Mankessim', 'Abura',
      'Asebu', 'Gomoa Buduburam', 'Apam', 'Mumford', 'Fetteh', 'Biriwa',
      'Twifo Praso', 'Nyakrom', 'Diaso', 'Hemang Lower Denkyira',
      'Upper Denkyira', 'Cape Coast University', 'Korshie', 'Pedu', 'Atonsu',
      'Abakrampa', 'Esiam', 'Abeadze Dominase', 'Bawjiase', 'Assin Manso',

    ]
  },
  {
    region: 'Eastern',
    cities: [
      'Koforidua', 'Akosombo', 'Akyem Oda', 'Nkawkaw', 'Mpraeso', 'Begoro',
      'Somanya', 'Aburi', 'Nsawam', 'Suhum', 'Kibi', 'Asamankese', 'Akropong',
      'Kpong', 'Atimpoku', 'New Tafo', 'Kukurantumi', 'Anyinam', 'Bunso',
      'Akwatia', 'Afosu', 'Kwahu Tafo', 'Nkronua', 'Oyoko',
      'Adeiso', 'Aseseeso', 'Dawu', 'Osiem', 'Obo', 'Adukrom', 'Kwahu Praso'

    ]
  },
  {
    region: 'Northern',
    cities: [
      'Tamale', 'Yendi', 'Salaga', 'Bimbilla', 'Walewale', 'Savelugu',
      'Gushegu', 'Karaga', 'Tolon', 'Kpandai', 'Zabzugu', 'Tatale',
      'Chereponi', 'Wulensi', 'Kumbungu', 'Sagnarigu', 'Mion',
      'Nanton', 'Gushiegu', 'Gambaga', 'Nalerigu', 'Daboya', 'Kpandae',
      'Wulensi', 'Chereponi', 'Yendi', 'Savelugu', 'Tolon', 'Kumbungu'

    ]
  },
  {
    region: 'Volta',
    cities: [
      'Ho', 'Hohoe', 'Keta', 'Aflao', 'Denu', 'Akatsi', 'Kpando',
      'Dzodze', 'Sogakope', 'Anloga', 'Dzita', 'Weta', 'Agbozume',
      'Dabala', 'Adidome', 'Battor', 'Mepe', 'Agortime Ziope',
      'Ve Golokuati', 'Peki', 'Jasikan', 'Kadjebi', 'Nkwanta',
      'Nkonya', 'Tafi Atome', 'Tafi Abuipe', 'Lolobi', 'Gbi Kpeme',
      'Gbi Baatome', 'Gbi Dzigbe', 'Gbi Gbedome', 'Gbi Kpeme'

    ]
  },
  {
    region: 'Upper East',
    cities: [
      'Bolgatanga', 'Navrongo', 'Bawku', 'Zebilla', 'Paga', 'Garu',
      'Tempane', 'Binduri', 'Pusiga', 'Builsa North', 'Builsa South',
      'Kassena Nankana West', 'Kassena Nankana East', 'Talensi',
      'Nabdam', 'Bongo', 'Sandema', 'Fumbisi', 'Chuchuliga', 'Wakii'

    ]
  },
  {
    region: 'Upper West',
    cities: [
      'Wa', 'Lawra', 'Tumu', 'Nandom', 'Jirapa', 'Funsi',
      'Hamile', 'Lambussie', 'Karni', 'Kaleo', 'Nadowli', 'Daffiama',
      'Bussie', 'Issa', 'Sisaala East', 'Sisaala West', 'Wa East', 'Wa West'
    ]
  },
  {
    region: 'Bono',
    cities: [
      'Sunyani', 'Techiman', 'Berekum', 'Dormaa Ahenkro', 'Kintampo', 'Wenchi',
      'Nkoranza', 'Atebubu', 'Abesim', 'Fiapre', 'Nsawkaw', 'Tuobodom',
      'Yeji', 'Prang', 'Mathias Man', 'Wamfie', 'New Longoro'
    ]
  },
  {
    region: 'Bono East',
    cities: [
      'Techiman', 'Atebubu', 'Kintampo', 'Yeji', 'Prang', 'Nkoranza',
      'Kwame Danso', 'Tuobodom', 'Amantin', 'Tanoso', 'Buya'
    ]
  },
  {
    region: 'Ahafo',
    cities: [
      'Goaso', 'Bechem', 'Hwidiem', 'Kenyasi', 'Duayaw Nkwanta',
      'Yamfo', 'Mim', 'Kukuom', 'Sankore', 'Dadiesoaba'
    ]
  },
  {
    region: 'Western North',
    cities: [
      'Sefwi Wiawso', 'Bibiani', 'Juaboso', 'Bia West', 'Bia East',
      'Akontombra', 'Aowin', 'Suaman', 'Bodi', 'Anhwiaso'
    ]
  },
  {
    region: 'Savannah',
    cities: [
      'Damongo', 'Salaga', 'Bole', 'Sawla', 'Tuna', 'Kalba',
      'Larabanga', 'Busunu', 'Bamboi', 'Mankarigu', 'Daboya'
    ]
  },
  {
    region: 'North East',
    cities: [
      'Nalerigu', 'Gambaga', 'Walewale', 'Chereponi', 'Yagaba',
      'Yunyoo', 'Nasuan', 'Sheriga'
    ]
  },
  {
    region: 'Oti',
    cities: [
      'Dambai', 'Nkwanta', 'Kadjebi', 'Jasikan', 'Kpassa',
      'Chinderi', 'Worawora', 'Bowiri', 'Likpe Todome',
      'Nkonya Ahenkro', 'Nkonya Tepo', 'Nkonya Ntumda',
      'Abotuase'
    ]
  }
];

// Fuel Types Available in Ghana
export const GHANA_FUEL_TYPES = [
  'PMS',
  'AGO',
  'RON 95',
  'Gas',
  
];

// Station Status Options
export const STATION_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  MAINTENANCE: 'Under Maintenance',
  SUSPENDED: 'Suspended'
};

// User Status Options
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  LOCKED: 'Locked'
};

// Status Colors for UI
export const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200'
};

// User Status Colors for UI
export const USER_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  LOCKED: 'bg-orange-100 text-orange-800 border-orange-200'
};

// Standard tank capacities in liters
export const STANDARD_TANK_CAPACITIES = {
  Super: 50000,
  Regular: 50000,
  Diesel: 40000,
  Gas: 30000,
  Kerosene: 20000
};

// Default operating hours
export const DEFAULT_OPERATING_HOURS = {
  open: '06:00',
  close: '22:00',
  is24Hours: false
};

// Mock Station Data for Development - Enhanced with Users
export const MOCK_STATIONS = [
  {
    id: 'accra-central',
    name: 'KTC Accra Central',
    code: 'KTC-ACC-01',
    location: {
      address: '123 Independence Avenue',
      city: 'Accra',
      region: 'Greater Accra',
      gpsCoordinates: {
        latitude: 5.6037,
        longitude: -0.1870
      }
    },
    contact: {
      phone: '+233 24 123 4567',
      email: 'accra.central@ktcenergy.com.gh',
      manager: {
        name: 'Samuel Osei',
        phone: '+233 24 987 6543',
        email: 'samuel.osei@ktcenergy.com.gh',
        userId: 'user-acc-001'
      }
    },
    operational: {
      status: 'ACTIVE' as const,
      operatingHours: {
        open: '06:00',
        close: '22:00',
        is24Hours: false
      },
      fuelTypes: ['Super', 'Regular', 'Diesel', 'Gas'] as const,
      tankCapacity: {
        Super: 50000,
        Regular: 50000,
        Diesel: 40000,
        Gas: 30000
      },
      pumpCount: 8
    },
    financial: {
      monthlyTarget: 500000,
      commissionRate: 2.5,
      securityDeposit: 50000,
      lastAuditDate: '2024-11-15'
    },
    user: {
      id: 'user-acc-001',
      username: 'ktc-acc-01',
      email: 'accra.central@ktcenergy.com.gh',
      role: 'station_manager' as const,
      status: 'ACTIVE' as const,
      lastLogin: '2024-12-15T08:30:00Z',
      passwordChanged: true,
      mustChangePassword: false,
      accountLocked: false,
      loginAttempts: 0,
      createdAt: '2024-01-15T10:00:00Z',
      lastModifiedAt: '2024-12-01T14:30:00Z'
    },
    createdBy: 'System Admin',
    createdAt: '2024-01-15T10:00:00Z',
    lastModifiedBy: 'Mary Asante',
    lastModifiedAt: '2024-12-01T14:30:00Z',
    notes: 'Main flagship station in Accra central business district'
  },
  {
    id: 'kumasi-highway',
    name: 'KTC Kumasi Highway',
    code: 'KTC-KUM-01',
    location: {
      address: 'Kumasi-Accra Highway, Mile 7',
      city: 'Kumasi',
      region: 'Ashanti',
      gpsCoordinates: {
        latitude: 6.6885,
        longitude: -1.6244
      }
    },
    contact: {
      phone: '+233 24 234 5678',
      email: 'kumasi.highway@ktcenergy.com.gh',
      manager: {
        name: 'Kwame Boateng',
        phone: '+233 24 876 5432',
        email: 'kwame.boateng@ktcenergy.com.gh',
        userId: 'user-kum-001'
      }
    },
    operational: {
      status: 'ACTIVE' as const,
      operatingHours: {
        open: '05:30',
        close: '23:00',
        is24Hours: false
      },
      fuelTypes: ['Super', 'Regular', 'Diesel'] as const,
      tankCapacity: {
        Super: 60000,
        Regular: 60000,
        Diesel: 50000
      },
      pumpCount: 12
    },
    financial: {
      monthlyTarget: 750000,
      commissionRate: 3.0,
      securityDeposit: 75000,
      lastAuditDate: '2024-10-20'
    },
    user: {
      id: 'user-kum-001',
      username: 'ktc-kum-01',
      email: 'kumasi.highway@ktcenergy.com.gh',
      role: 'station_manager' as const,
      status: 'ACTIVE' as const,
      lastLogin: '2024-12-14T09:15:00Z',
      passwordChanged: true,
      mustChangePassword: false,
      accountLocked: false,
      loginAttempts: 0,
      createdAt: '2024-02-01T11:00:00Z',
      lastModifiedAt: '2024-11-15T16:45:00Z'
    },
    createdBy: 'System Admin',
    createdAt: '2024-02-01T11:00:00Z',
    lastModifiedBy: 'Joseph Amponsah',
    lastModifiedAt: '2024-11-15T16:45:00Z',
    notes: 'High-traffic highway station serving long-distance travelers'
  },
  {
    id: 'takoradi-port',
    name: 'KTC Takoradi Port',
    code: 'KTC-TAK-01',
    location: {
      address: 'Harbour Road, Near Takoradi Port',
      city: 'Takoradi',
      region: 'Western',
      gpsCoordinates: {
        latitude: 4.8845,
        longitude: -1.7554
      }
    },
    contact: {
      phone: '+233 24 345 6789',
      email: 'takoradi.port@ktcenergy.com.gh'
    },
    operational: {
      status: 'MAINTENANCE' as const,
      operatingHours: {
        open: '06:00',
        close: '20:00',
        is24Hours: false
      },
      fuelTypes: ['Super', 'Regular', 'Diesel', 'Gas', 'Kerosene'] as const,
      tankCapacity: {
        Super: 40000,
        Regular: 40000,
        Diesel: 60000,
        Gas: 25000,
        Kerosene: 15000
      },
      pumpCount: 6
    },
    financial: {
      monthlyTarget: 400000,
      commissionRate: 2.8,
      securityDeposit: 40000
    },
    user: {
      id: 'user-tak-001',
      username: 'ktc-tak-01',
      email: 'takoradi.port@ktcenergy.com.gh',
      role: 'station_manager' as const,
      status: 'INACTIVE' as const,
      passwordChanged: false,
      mustChangePassword: true,
      accountLocked: false,
      loginAttempts: 0,
      createdAt: '2024-03-10T09:30:00Z'
    },
    createdBy: 'System Admin',
    createdAt: '2024-03-10T09:30:00Z',
    notes: 'Strategic location near port for commercial vehicles and maritime fuel needs'
  }
];

// Mock Statistics - Enhanced with User Data
export const MOCK_STATION_STATS = {
  totalStations: 8,
  activeStations: 6,
  inactiveStations: 1,
  maintenanceStations: 1,
  totalUsers: 8,
  activeUsers: 6,
  lockedUsers: 0,
  totalMonthlyTarget: 3200000, // ₵3.2M total target
  averageCommissionRate: 2.7,
  stationsWithManagers: 6,
  stationsNeedingAttention: 2, // expired auth or no manager
  usersNeedingPasswordReset: 1
};

// Validation Rules
export const STATION_VALIDATION_RULES = {
  NAME_MIN_LENGTH: 5,
  NAME_MAX_LENGTH: 100,
  CODE_MIN_LENGTH: 8,
  CODE_MAX_LENGTH: 15,
  CODE_PATTERN: /^KTC-[A-Z]{3}-\d{2}$/,
  PHONE_PATTERN: /^\+233\s\d{2}\s\d{3}\s\d{4}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_TANK_CAPACITY: 10000, // 10,000 liters
  MAX_TANK_CAPACITY: 100000, // 100,000 liters
  MIN_PUMP_COUNT: 2,
  MAX_PUMP_COUNT: 20,
  MIN_MONTHLY_TARGET: 50000, // ₵50,000
  MAX_MONTHLY_TARGET: 2000000 // ₵2,000,000
};

// Default filter values - Enhanced with User Filters
export const DEFAULT_STATION_FILTERS = {
  status: 'ALL' as const,
  userStatus: 'ALL' as const,
  region: 'ALL' as const,
  hasManager: 'ALL' as const,
  needsPasswordReset: 'ALL' as const,
  search: ''
};

// Refresh intervals (in milliseconds)
export const STATION_REFRESH_INTERVALS = {
  STATIONS_DATA: 300000, // 5 minutes
  STATISTICS: 600000, // 10 minutes
  HEALTH_CHECK: 120000 // 2 minutes
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

// Generate station code
export const generateStationCode = (city: string, existingCodes: string[]): string => {
  const codesArray = Array.isArray(existingCodes) ? existingCodes : [];
  const cityCode = city.substring(0, 3).toUpperCase();
  let counter = 1;
  let code: string;
  
  do {
    code = `KTC-${cityCode}-${counter.toString().padStart(2, '0')}`;
    counter++;
  } while (codesArray.includes(code));
  
  return code;
};

// Generate username from station code
export const generateUsername = (stationCode: string): string => {
  return stationCode.toLowerCase().replace(/-/g, '-');
};



// Validate station form data
export const validateStationForm = (data: Partial<any>): { [key: string]: string[] } => {
  const errors: { [key: string]: string[] } = {};
  
  // Name validation
  if (!data.name || data.name.length < STATION_VALIDATION_RULES.NAME_MIN_LENGTH) {
    errors.name = [`Name must be at least ${STATION_VALIDATION_RULES.NAME_MIN_LENGTH} characters`];
  }
  
  // Code validation
  if (!data.code || !STATION_VALIDATION_RULES.CODE_PATTERN.test(data.code)) {
    errors.code = ['Code must follow format: KTC-XXX-XX (e.g., KTC-ACC-01)'];
  }
  
  // Phone validation
  if (!data.phone || !STATION_VALIDATION_RULES.PHONE_PATTERN.test(data.phone)) {
    errors.phone = ['Phone must follow format: +233 XX XXX XXXX'];
  }
  
  // Email validation
  if (!data.email || !STATION_VALIDATION_RULES.EMAIL_PATTERN.test(data.email)) {
    errors.email = ['Please enter a valid email address'];
  }
  
  // Financial validations
  if (data.monthlyTarget && (data.monthlyTarget < STATION_VALIDATION_RULES.MIN_MONTHLY_TARGET || data.monthlyTarget > STATION_VALIDATION_RULES.MAX_MONTHLY_TARGET)) {
    errors.monthlyTarget = [`Monthly target must be between ₵${STATION_VALIDATION_RULES.MIN_MONTHLY_TARGET.toLocaleString()} and ₵${STATION_VALIDATION_RULES.MAX_MONTHLY_TARGET.toLocaleString()}`];
  }
  
  return errors;
};

