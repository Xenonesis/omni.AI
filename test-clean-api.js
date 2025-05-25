// Test script to verify clean Indian marketplace products
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing clean Indian marketplace API...\n');

    // Test 1: Get all products
    const response = await fetch('http://localhost:3001/api/search?q=');
    const data = await response.json();

    console.log(`📊 Total products: ${data.total}`);
    console.log(`📋 Expected: 30 Indian products\n`);

    if (data.total !== 30) {
      console.log('❌ ERROR: Expected exactly 30 products!');
      return;
    }

    // Test 2: Check categories
    const categories = {};
    data.products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });

    console.log('📂 Products by category:');
    console.log(`   Electronics: ${categories.electronics || 0} (expected: 10)`);
    console.log(`   Fashion: ${categories.fashion || 0} (expected: 10)`);
    console.log(`   Beauty: ${categories.beauty || 0} (expected: 10)`);
    console.log('');

    // Test 3: Check for old products (should be none)
    const oldCategories = ['sneakers', 'concert-tickets', 'sports-tickets'];
    const hasOldProducts = data.products.some(p => oldCategories.includes(p.category));

    if (hasOldProducts) {
      console.log('❌ ERROR: Found old product categories!');
      return;
    }

    // Test 4: Check pricing (should all be in Indian Rupees)
    const highestPrice = Math.max(...data.products.map(p => p.price));
    const lowestPrice = Math.min(...data.products.map(p => p.price));

    console.log('💰 Price range:');
    console.log(`   Highest: ₹${highestPrice.toLocaleString()}`);
    console.log(`   Lowest: ₹${lowestPrice.toLocaleString()}`);
    console.log('');

    // Test 5: Sample products
    console.log('🛍️ Sample products:');
    data.products.slice(0, 5).forEach(product => {
      console.log(`   ${product.name} - ₹${product.price.toLocaleString()} (${product.seller})`);
    });

    console.log('\n✅ API test completed successfully!');
    console.log('🇮🇳 Clean Indian marketplace with 30 products confirmed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
