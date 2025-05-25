/**
 * Voice Search Accuracy Test Script
 * Tests the enhanced voice search functionality with real data
 */

// Test queries to validate voice search accuracy
const testQueries = [
  // Exact matches
  'iPhone 14 Pro Max',
  'Samsung Galaxy Buds Pro',
  'Nike Air Force 1',
  
  // Brand searches
  'Samsung earbuds',
  'Nike shoes',
  'Apple smartphone',
  
  // Misspellings (should be corrected)
  'aple iphone',
  'samsang galaxy',
  'naik shoes',
  
  // Indian price formats
  'mobile under Rs 50000',
  'shoes under 10000',
  'electronics under 25000',
  
  // Casual speech patterns
  'show me samsung products',
  'find nike sneakers',
  'I want beauty products',
  
  // Complex queries
  'find samsung wireless earbuds under 15000',
  'show me apple products',
  'nike shoes for running'
];

async function testVoiceSearchAPI() {
  console.log('🧪 Testing Voice Search API with Enhanced Accuracy\n');
  
  let totalTests = 0;
  let successfulTests = 0;
  
  for (const query of testQueries) {
    totalTests++;
    
    try {
      console.log(`🔍 Testing: "${query}"`);
      
      // Test the search API
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Analyze results
      const resultCount = data.products.length;
      const hasRelevantResults = resultCount > 0;
      
      if (hasRelevantResults) {
        successfulTests++;
        console.log(`✅ Found ${resultCount} products`);
        
        // Show top result
        if (data.products[0]) {
          const topResult = data.products[0];
          console.log(`   🏆 Top: ${topResult.name} (${topResult.brand}) - ₹${topResult.price}`);
        }
        
        // Show recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
          console.log(`   💡 ${data.recommendations.length} recommendations available`);
        }
      } else {
        console.log(`❌ No results found`);
      }
      
      console.log(`   ⚡ Query processed successfully\n`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  const successRate = (successfulTests / totalTests * 100).toFixed(1);
  console.log('📊 Test Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Successful: ${successfulTests}`);
  console.log(`   Success Rate: ${successRate}%`);
  
  if (successRate >= 80) {
    console.log('🎉 Voice search accuracy is EXCELLENT!');
  } else if (successRate >= 60) {
    console.log('👍 Voice search accuracy is GOOD');
  } else {
    console.log('⚠️  Voice search accuracy needs improvement');
  }
}

async function testSpecificScenarios() {
  console.log('\n🎯 Testing Specific Voice Search Scenarios\n');
  
  // Test 1: Brand recognition
  console.log('Test 1: Brand Recognition');
  const brandQueries = ['samsung', 'apple', 'nike', 'oneplus'];
  
  for (const brand of brandQueries) {
    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${brand}`);
      const data = await response.json();
      const brandMatches = data.products.filter(p => 
        p.brand.toLowerCase() === brand.toLowerCase()
      );
      
      console.log(`   ${brand}: ${brandMatches.length}/${data.products.length} brand matches`);
    } catch (error) {
      console.log(`   ${brand}: Error - ${error.message}`);
    }
  }
  
  // Test 2: Category filtering
  console.log('\nTest 2: Category Filtering');
  const categories = ['electronics', 'fashion', 'beauty'];
  
  for (const category of categories) {
    try {
      const response = await fetch(`http://localhost:3001/api/search?category=${category}`);
      const data = await response.json();
      
      console.log(`   ${category}: ${data.products.length} products found`);
    } catch (error) {
      console.log(`   ${category}: Error - ${error.message}`);
    }
  }
  
  // Test 3: Price filtering
  console.log('\nTest 3: Price Filtering');
  const priceRanges = [
    { max: 10000, label: 'Under ₹10,000' },
    { min: 10000, max: 50000, label: '₹10,000 - ₹50,000' },
    { min: 50000, label: 'Above ₹50,000' }
  ];
  
  for (const range of priceRanges) {
    try {
      const params = new URLSearchParams();
      if (range.min) params.append('min_price', range.min.toString());
      if (range.max) params.append('max_price', range.max.toString());
      
      const response = await fetch(`http://localhost:3001/api/search?${params}`);
      const data = await response.json();
      
      console.log(`   ${range.label}: ${data.products.length} products found`);
    } catch (error) {
      console.log(`   ${range.label}: Error - ${error.message}`);
    }
  }
}

async function testAPIHealth() {
  console.log('\n🏥 Testing API Health\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ API is healthy and running');
      console.log(`   Timestamp: ${data.timestamp}`);
    } else {
      console.log('❌ API health check failed');
    }
  } catch (error) {
    console.log(`❌ API is not accessible: ${error.message}`);
    console.log('   Make sure the server is running with: node server.js');
    return false;
  }
  
  return true;
}

// Main execution
async function main() {
  console.log('🔍 Voice Search Accuracy Validation\n');
  console.log('Testing enhanced voice search with real marketplace data...\n');
  
  // Check API health first
  const isHealthy = await testAPIHealth();
  
  if (!isHealthy) {
    console.log('\n❌ Cannot proceed with tests - API is not available');
    return;
  }
  
  // Run comprehensive tests
  await testVoiceSearchAPI();
  await testSpecificScenarios();
  
  console.log('\n🎉 Voice search accuracy validation completed!');
  console.log('\nNext steps:');
  console.log('1. Open the marketplace in your browser');
  console.log('2. Try voice search with the tested queries');
  console.log('3. Use the Voice Search Debugger for real-time testing');
  console.log('4. Monitor console logs for detailed accuracy information');
}

// Run the tests
main().catch(console.error);
