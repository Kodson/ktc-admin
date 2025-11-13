// Test functions to verify localStorage parsing
// These can be run in the browser console to test the localStorage functionality

function testLocalStorageTokenExtraction() {
  // Sample data structure from your localStorage
  const sampleData = {
    id: "4",
    username: "David Olere", 
    email: "admin@swiftgo.com",
    name: "David Olere",
    role: "ROLE_STATION_MANAGER",
    station: {
      stationName: "KTC POKUASE",
      stationId: "965ed479-69b4-43ea-8926-750b9ff40d0e"
    },
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJLb2Rzb24gRXJwIiwic3ViIjoiRGF2aWQgT2xlcmUiLCJyb2xlIjoiU1RBVElP"
  };

  // Simulate the localStorage token function
  const getAuthToken = () => {
    try {
      // In real usage, this would be: const ktcUser = localStorage.getItem('ktc_user');
      const ktcUser = JSON.stringify(sampleData); // Simulating localStorage data
      if (ktcUser) {
        const userData = JSON.parse(ktcUser);
        return userData.token || null;
      }
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
    }
    return null;
  };

  const token = getAuthToken();
  console.log('Extracted token:', token ? `${token.substring(0, 50)}...` : 'null'); // Show first 50 chars
  return token;
}

function testLocalStorageStationExtraction() {
  // Sample data structure from your localStorage
  const sampleData = {
    id: "4",
    username: "David Olere", 
    email: "admin@swiftgo.com",
    name: "David Olere",
    role: "ROLE_STATION_MANAGER",
    station: {
      stationName: "KTC POKUASE",
      stationId: "965ed479-69b4-43ea-8926-750b9ff40d0e"
    },
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  };

  // Simulate the localStorage function
  const getStationFromLocalStorage = () => {
    try {
      // In real usage, this would be: const ktcUser = localStorage.getItem('ktc_user');
      const ktcUser = JSON.stringify(sampleData); // Simulating localStorage data
      if (ktcUser) {
        const userData = JSON.parse(ktcUser);
        return userData.station?.stationName || 'KTC KPONE'; // Fallback to default
      }
    } catch (error) {
      console.error('Error reading station from localStorage:', error);
    }
    return 'KTC KPONE'; // Default fallback
  };

  const result = getStationFromLocalStorage();
  console.log('Extracted station name:', result); // Should output: "KTC POKUASE"
  return result;
}

// Run the tests
console.log('Station test result:', testLocalStorageStationExtraction());
console.log('Token test result:', testLocalStorageTokenExtraction() ? 'Token found' : 'No token');