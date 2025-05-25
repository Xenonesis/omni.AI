// Test script to verify all 30 Indian marketplace products
const http = require('http');

async function testProducts() {
  try {
    console.log('🧪 Testing Indian marketplace products...\n');

    // Test 1: Get all products
    const data = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3001/api/search?q=', (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
    });

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

    console.log('📂 Category breakdown:');
    console.log(`   Electronics: ${categories.electronics || 0} (expected: 10)`);
    console.log(`   Fashion: ${categories.fashion || 0} (expected: 10)`);
    console.log(`   Beauty: ${categories.beauty || 0} (expected: 10)\n`);

    // Test 3: Verify key products
    const keyProducts = [
      { name: 'Apple iPhone 14 Pro Max', price: 129999, seller: 'TechMart', rating: 4.8 },
      { name: 'Nike Air Force 1', price: 7495, seller: 'KicksKart', rating: 4.7 },
      { name: 'L\'Oréal Revitalift Serum', price: 1099, seller: 'GlowStore', rating: 4.5 },
      { name: 'Dyson Airwrap', price: 44900, seller: 'HairPro', rating: 4.8 },
      { name: 'The Ordinary Niacinamide 10%', price: 599, seller: 'SkinLabs', rating: 4.7 }
    ];

    console.log('🔍 Verifying key products:');
    keyProducts.forEach(expected => {
      const found = data.products.find(p => p.name === expected.name);
      if (found) {
        const match = found.price === expected.price &&
                     found.seller === expected.seller &&
                     found.rating === expected.rating;
        console.log(`   ${match ? '✅' : '❌'} ${expected.name}: Rs.${found.price}, ${found.seller}, ${found.rating}⭐`);
      } else {
        console.log(`   ❌ ${expected.name}: NOT FOUND`);
      }
    });

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProducts();
