import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication token
 * @returns {Object} Token and authentication status
 */
export function useToken() {
  const { user, getToken } = useAuth();
  
  const token = getToken();
  const isAuthenticated = !!token;
  
  return {
    token,
    isAuthenticated,
    user,
    hasToken: !!user?.token, // Check if user object contains token
  };
}

/**
 * Custom hook for making authenticated API requests
 * This hook provides the token and headers needed for API calls
 */
export function useApiHeaders() {
  const { getToken } = useAuth();
  
  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  const getHeaders = (additionalHeaders: Record<string, string> = {}) => {
    return {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...additionalHeaders,
    };
  };
  
  return {
    getAuthHeaders,
    getHeaders,
    token: getToken(),
  };
}
