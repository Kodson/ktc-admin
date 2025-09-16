export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_STATION_MANAGER';
  stationId?: string; // Legacy field for backward compatibility
  station?: {
    stationId: string;
    stationName: string;
  };
  avatar?: string;
  token?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  getToken: () => string | null;
}

export interface Station {
  id: string;
  name: string;
  location: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  fuelTypes: string[];
  monthlyRevenue: number;
}

export interface FuelTransaction {
  id: string;
  stationId: string;
  amount: number;
  fuelType: string;
  timestamp: Date;
  customerId?: string;
  paymentMethod: 'cash' | 'card' | 'mobile';
}