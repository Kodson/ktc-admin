// Example component demonstrating how to use authentication token
import { useState, useEffect } from 'react';
import { useToken } from '../hooks/useToken'; //useApiHeaders
import { apiClient } from '../utils/apiClient';

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
}

export function ExampleApiComponent() {
  const { token, isAuthenticated, user } = useToken();
 // const { getHeaders } = useApiHeaders();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example function to fetch user profile using the token
  const fetchUserProfile = async () => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Method 1: Using the apiClient (recommended)
      const profileData = await apiClient.get<UserProfile>('/user/profile');
      setProfile(profileData);

      // Method 2: Using fetch with custom headers
      // const response = await fetch('http://localhost:8081/api/user/profile', {
      //   method: 'GET',
      //   headers: getHeaders(),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to fetch profile');
      // }
      // 
      // const profileData = await response.json();
      // setProfile(profileData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please login to view this content.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">User Profile Example</h2>
      
      {/* Display current token info */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-medium">Token Info:</h3>
        <p>Token exists: {token ? 'Yes' : 'No'}</p>
        <p>User in context: {user?.name || 'None'}</p>
        <p>User role: {user?.role || 'None'}</p>
        <p>Token in user object: {user?.token ? 'Yes' : 'No'}</p>
      </div>

      {/* Profile data display */}
      {loading && <div>Loading profile...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {profile && (
        <div className="p-3 border rounded">
          <h3 className="font-medium">Profile Data:</h3>
          <p>ID: {profile.id}</p>
          <p>Username: {profile.username}</p>
          <p>Email: {profile.email || 'N/A'}</p>
          <p>Name: {profile.name}</p>
          <p>Role: {profile.role}</p>
        </div>
      )}

      <button 
        onClick={fetchUserProfile}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh Profile'}
      </button>
    </div>
  );
}
