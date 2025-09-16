// Test utility to check backend connectivity
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    // Get token if available
    const token = localStorage.getItem('ktc_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:8081/api/health', {
      method: 'GET',
      headers,
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export const testLoginEndpoint = async (): Promise<boolean> => {
  try {
    await fetch('http://localhost:8081/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      }),
    });
    
    // Even if credentials are wrong, endpoint should respond (not return network error)
    return true;
  } catch (error) {
    console.error('Login endpoint test failed:', error);
    return false;
  }
};
