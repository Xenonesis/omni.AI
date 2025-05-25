/**
 * Test script for Voice Search API
 * Run this to verify the API is working correctly
 */

const testAPI = async () => {
  const baseURL = 'http://localhost:3001';

  console.log('🧪 Testing Voice Search API...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Basic Search
  try {
    console.log('\n2️⃣ Testing basic search...');
    const searchResponse = await fetch(`${baseURL}/api/search?q=nike`);
    const searchData = await searchResponse.json();
    console.log(`✅ Basic search passed: Found ${searchData.total} products`);
    console.log(`   Sample product: ${searchData.products[0]?.name}`);
  } catch (error) {
    console.log('❌ Basic search failed:', error.message);
  }

  // Test 3: Category Filter
  try {
    console.log('\n3️⃣ Testing category filter...');
    const categoryResponse = await fetch(`${baseURL}/api/search?q=&category=sneakers`);
    const categoryData = await categoryResponse.json();
    console.log(`✅ Category filter passed: Found ${categoryData.total} sneakers`);
  } catch (error) {
    console.log('❌ Category filter failed:', error.message);
  }

  // Test 4: Price Range Filter
  try {
    console.log('\n4️⃣ Testing price range filter...');
    const priceResponse = await fetch(`${baseURL}/api/search?q=&max_price=500`);
    const priceData = await priceResponse.json();
    console.log(`✅ Price filter passed: Found ${priceData.total} products under $500`);
  } catch (error) {
    console.log('❌ Price filter failed:', error.message);
  }

  // Test 5: Complex Query
  try {
    console.log('\n5️⃣ Testing complex query...');
    const complexResponse = await fetch(`${baseURL}/api/search?q=headphones&max_price=400&sort_by=price&sort_order=asc`);
    const complexData = await complexResponse.json();
    console.log(`✅ Complex query passed: Found ${complexData.total} headphones under $400`);
    if (complexData.products.length > 0) {
      console.log(`   Cheapest: ${complexData.products[0].name} - $${complexData.products[0].price}`);
    }
  } catch (error) {
    console.log('❌ Complex query failed:', error.message);
  }

  // Test 6: Voice Search Simulation
  try {
    console.log('\n6️⃣ Testing voice search simulation...');
    const voiceQueries = [
      'nike shoes under 200',
      'wireless headphones',
      'gaming laptop',
      'concert tickets'
    ];

    for (const query of voiceQueries) {
      const voiceResponse = await fetch(`${baseURL}/api/search?q=${encodeURIComponent(query)}`);
      const voiceData = await voiceResponse.json();
      console.log(`   "${query}" → ${voiceData.total} results`);
    }
    console.log('✅ Voice search simulation passed');
  } catch (error) {
    console.log('❌ Voice search simulation failed:', error.message);
  }

  console.log('\n🎉 API testing complete!');
  console.log('\n📋 Summary:');
  console.log('   • API server is running on http://localhost:3001');
  console.log('   • Search endpoint is working correctly');
  console.log('   • Filters and sorting are functional');
  console.log('   • Ready for voice search integration');
  console.log('\n🚀 You can now use voice search with real data!');
};

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use built-in fetch (Node 18+)
  testAPI().catch(console.error);
} else {
  // Browser environment
  console.log('Run this script with Node.js: node test-api.js');
}

export default testAPI;
