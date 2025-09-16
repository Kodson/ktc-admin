import { useState } from 'react';
import { checkBackendHealthProgressive } from '../utils/authenticatedRequest';
import { testBackendConnection } from '../utils/backendTest';

export function HealthCheckDebug() {
  const [results, setResults] = useState<{
    progressive: { available: boolean; requiresAuth: boolean } | null;
    simple: boolean | null;
    error: string | null;
  }>({
    progressive: null,
    simple: null,
    error: null,
  });
  const [loading, setLoading] = useState(false);

  const runHealthChecks = async () => {
    setLoading(true);
    setResults({ progressive: null, simple: null, error: null });

    try {
      // Test progressive health check
      const progressiveResult = await checkBackendHealthProgressive();
      
      // Test simple health check
      const simpleResult = await testBackendConnection();

      setResults({
        progressive: progressiveResult,
        simple: simpleResult,
        error: null,
      });
    } catch (error) {
      setResults({
        progressive: null,
        simple: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Health Check Debug</h3>
      
      <button 
        onClick={runHealthChecks}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Testing...' : 'Run Health Checks'}
      </button>

      {results.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {results.error}
        </div>
      )}

      {results.progressive && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
          <strong>Progressive Health Check:</strong>
          <ul className="mt-2 space-y-1">
            <li>Available: {results.progressive.available ? '✅' : '❌'}</li>
            <li>Requires Auth: {results.progressive.requiresAuth ? '🔐' : '🔓'}</li>
          </ul>
        </div>
      )}

      {results.simple !== null && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <strong>Simple Health Check:</strong>
          <span className="ml-2">{results.simple ? '✅ Available' : '❌ Unavailable'}</span>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
        <strong>Token Status:</strong>
        <ul className="mt-1 space-y-1">
          <li>Token exists: {localStorage.getItem('ktc_token') ? '✅' : '❌'}</li>
          <li>User data: {localStorage.getItem('ktc_user') ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
}
