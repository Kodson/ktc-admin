import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = 'https://ktc-backend-advy.onrender.com/api'; //http://localhost:8081/api

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    return localStorage.getItem('ktc_token');
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('ktc_user');
    const savedToken = localStorage.getItem('ktc_token');
    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser);
      // Ensure token is included in user data
      userData.token = savedToken;
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Try the backend API first
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      let userData: User;

      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        
        // Extract token from response
        const token = data.token || data.accessToken || data.access_token;
        
        // Determine user ID - prioritize response userId, then JWT token, then username
        let userId = data.userId || data.id; // First try direct userId/id from response
        
        if (!userId && token) {
          // Fallback to JWT token parsing if no direct userId in response
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            userId = tokenPayload.userId || tokenPayload.sub;
          } catch (e) {
            console.warn('Could not parse JWT token for userId');
          }
        }
        
        // Final fallback to username if no userId found
        if (!userId) {
          userId = data.username || username;
        }
        
        // Convert userId to string for consistency
        const userIdString = String(userId);
        console.log('Extracted user ID:', userIdString, 'from userId:', userId);
        
        // Use backend response with correct structure
        userData = {
          id: userIdString,
          username: data.username || username,
          email: data.email,
          name: data.name || data.username || username,
          role: data.role || 'ROLE_ADMIN',
          stationId: data.stationId, // Legacy field for backward compatibility
          station: data.station, // New station object with stationId and stationName
          avatar: data.avatar,
          token: token,
        };

        // Store token separately in localStorage
        if (token) {
          localStorage.setItem('ktc_token', token);
        }
      } else {
        // Fallback for development if backend is not available
        console.log('Backend not available, using fallback authentication');
        
        // Create mock user based on username
        if (username === 'I.T' && password === '0040105715@Icon') {
          userData = {
            id: '1',
            username: 'I.T',
            email: 'it@ktcenergy.com',
            name: 'IT Administrator',
            role: 'ROLE_SUPER_ADMIN',
          };
        } else if (username === 'admin' && password === 'password123') {
          userData = {
            id: '2',
            username: 'admin',
            email: 'admin@ktcenergy.com',
            name: 'Admin User',
            role: 'ROLE_ADMIN',
          };
        } else if (username === 'manager' && password === 'password123') {
          userData = {
            id: '3',
            username: 'manager',
            email: 'manager@ktcenergy.com',
            name: 'Station Manager',
            role: 'ROLE_STATION_MANAGER',
            stationId: 'station-1', // Legacy field
            station: {
              stationId: 'station-1',
              stationName: 'KTC Test Station'
            },
          };
        } else {
          throw new Error('Invalid credentials');
        }
      }

      console.log('Processed user data:', userData);
      setUser(userData);
      localStorage.setItem('ktc_user', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Additional fallback for complete offline testing
      if (username === 'I.T' && password === '0040105715@Icon') {
        const fallbackUser: User = {
          id: '1',
          username: 'I.T',
          email: 'it@ktcenergy.com',
          name: 'IT Administrator',
          role: 'ROLE_SUPER_ADMIN',
        };
        console.log('Using offline fallback user:', fallbackUser);
        setUser(fallbackUser);
        localStorage.setItem('ktc_user', JSON.stringify(fallbackUser));
        return;
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Unable to connect to server. Please check your connection.');
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid username or password');
        } else if (error.message.includes('500')) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(error.message);
        }
      } else {
        throw new Error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ktc_user');
    localStorage.removeItem('ktc_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}