// Centralized API utility for authenticated requests
const API_BASE_URL = 'http://localhost:8081/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean; // Flag to indicate if auth is required
}

/**
 * Makes an authenticated API request
 * @param endpoint - The API endpoint (without base URL)
 * @param options - Request options
 * @returns Promise<Response>
 */
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = true,
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token exists and auth is required
  if (requireAuth) {
    const token = localStorage.getItem('ktc_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  return fetch(url, config);
};

/**
 * Checks if backend is available with optional authentication
 * @param endpoint - The endpoint to check (defaults to /health)
 * @param requireAuth - Whether authentication is required for this endpoint
 * @returns Promise<boolean>
 */
export const checkBackendHealth = async (
  endpoint: string = '/health',
  requireAuth: boolean = false
): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await makeAuthenticatedRequest(endpoint, {
      method: 'GET',
      requireAuth,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error(`Health check failed for ${endpoint}:`, error);
    return false;
  }
};

/**
 * Makes a health check with progressive authentication
 * First tries without auth, then with auth if available
 * @param endpoint - The health endpoint
 * @returns Promise<{ available: boolean, requiresAuth: boolean }>
 */
export const checkBackendHealthProgressive = async (
  endpoint: string = '/health'
): Promise<{ available: boolean; requiresAuth: boolean }> => {
  try {
    // First try without authentication
    const response = await makeAuthenticatedRequest(endpoint, {
      method: 'GET',
      requireAuth: false,
    });

    if (response.ok) {
      return { available: true, requiresAuth: false };
    }

    // If 401 or 403, try with authentication
    if (response.status === 401 || response.status === 403) {
      const token = localStorage.getItem('ktc_token');
      if (token) {
        const authResponse = await makeAuthenticatedRequest(endpoint, {
          method: 'GET',
          requireAuth: true,
        });
        return { available: authResponse.ok, requiresAuth: true };
      }
    }

    return { available: false, requiresAuth: false };
  } catch (error) {
    console.error(`Progressive health check failed for ${endpoint}:`, error);
    return { available: false, requiresAuth: false };
  }
};

export { API_BASE_URL };
