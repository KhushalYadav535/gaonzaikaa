const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRoutes() {
  console.log('🧪 Testing Admin Routes...\n');

  const routes = [
    { name: 'Admin Test Route', url: '/admin/test', method: 'GET' },
    { name: 'Admin Dashboard', url: '/admin/dashboard', method: 'GET' },
    { name: 'Admin Earnings', url: '/admin/earnings', method: 'GET' },
    { name: 'Admin Restaurants', url: '/admin/restaurants', method: 'GET' },
    { name: 'Admin Orders', url: '/admin/orders', method: 'GET' },
    { name: 'Admin Users', url: '/admin/users', method: 'GET' },
    { name: 'Health Check', url: '/health', method: 'GET' },
    { name: 'Root Endpoint', url: '/', method: 'GET' }
  ];

  for (const route of routes) {
    try {
      console.log(`Testing ${route.name}...`);
      const response = await axios({
        method: route.method,
        url: `${BASE_URL}${route.url}`,
        timeout: 5000
      });
      
      console.log(`✅ ${route.name}: ${response.status} - ${response.data.success ? 'Success' : 'Failed'}`);
      if (route.name === 'Admin Test Route') {
        console.log(`   Message: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${route.name}: ${error.response.status} - ${error.response.data.message || 'Error'}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${route.name}: Connection refused - Server not running`);
      } else {
        console.log(`❌ ${route.name}: ${error.message}`);
      }
    }
  }

  console.log('\n🔍 Route Testing Complete!');
}

// Test the routes
testRoutes().catch(console.error); 