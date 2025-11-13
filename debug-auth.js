// Token debugging utilities
// You can run these in browser console to help debug authentication issues

// Check token expiration and content
function debugToken() {
  const ktcUser = localStorage.getItem('ktc_user');
  if (!ktcUser) {
    console.log('❌ No ktc_user found in localStorage');
    return;
  }
  
  const userData = JSON.parse(ktcUser);
  const token = userData.token;
  
  if (!token) {
    console.log('❌ No token found in user data');
    return;
  }
  
  console.log('🔍 Token Analysis:');
  console.log('- Token length:', token.length);
  console.log('- Token starts with:', token.substring(0, 50) + '...');
  
  try {
    const parts = token.split('.');
    console.log('- Token parts:', parts.length);
    
    if (parts.length === 3) {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('📋 Token Header:', header);
      console.log('📋 Token Payload:', payload);
      
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp) {
        const expired = payload.exp < now;
        console.log(`⏰ Expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
        console.log(`⏰ Is Expired: ${expired ? '❌ YES' : '✅ NO'}`);
        console.log(`⏰ Time until expiry: ${payload.exp - now} seconds`);
      }
      
      if (payload.iat) {
        console.log(`⏰ Issued: ${new Date(payload.iat * 1000).toLocaleString()}`);
      }
      
      console.log('👤 User Info from Token:');
      console.log('- Subject:', payload.sub);
      console.log('- Username:', payload.username);
      console.log('- Role:', payload.role);
      console.log('- Authorities:', payload.authorities);
      
      console.log('🏢 Station Info from localStorage:');
      console.log('- Station Name:', userData.station?.stationName);
      console.log('- Station ID:', userData.station?.stationId);
    }
  } catch (e) {
    console.error('❌ Error parsing token:', e);
  }
}

// Test API endpoint with current token
async function testApiEndpoint(stationName = 'KTC POKUASE') {
  const ktcUser = localStorage.getItem('ktc_user');
  if (!ktcUser) {
    console.log('❌ No user data found');
    return;
  }
  
  const userData = JSON.parse(ktcUser);
  const token = userData.token;
  
  if (!token) {
    console.log('❌ No token found');
    return;
  }
  
  const baseUrl = 'http://localhost:8081/api';
  const url = `${baseUrl}/reports/station/${encodeURIComponent(stationName)}?startDate=2025-01-01&endDate=2025-01-31`;
  
  console.log('🌐 Testing API endpoint:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ API call successful!');
      try {
        const data = JSON.parse(responseText);
        console.log('📄 Parsed Data:', data);
      } catch (e) {
        console.log('📄 Response is not JSON');
      }
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run both debug functions
debugToken();
console.log('\n🧪 To test API endpoint, run: testApiEndpoint()');