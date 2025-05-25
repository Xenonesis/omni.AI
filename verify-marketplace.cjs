// Quick verification script for marketplace update
const http = require('http');

async function verifyMarketplace() {
  try {
    console.log('🔍 Verifying marketplace update...\n');

    // Test API endpoint
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

    console.log(`✅ API Status: Connected`);
    console.log(`📊 Total Products: ${data.total}`);
    console.log(`📋 Expected: 30 Indian products\n`);

    // Check categories
    const categories = {};
    data.products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });

    console.log('📂 Category Breakdown:');
    console.log(`   Electronics: ${categories.electronics || 0}/10`);
    console.log(`   Fashion: ${categories.fashion || 0}/10`);
    console.log(`   Beauty: ${categories.beauty || 0}/10\n`);

    // Verify key Indian products
    const keyProducts = [
      { name: 'Apple iPhone 14 Pro Max', price: 129999, seller: 'TechMart' },
      { name: 'Nike Air Force 1', price: 7495, seller: 'KicksKart' },
      { name: 'L\'Oréal Revitalift Serum', price: 1099, seller: 'GlowStore' },
      { name: 'Mamaearth Ubtan Face Wash', price: 249, seller: 'NatureRoot' },
      { name: 'Dyson Airwrap', price: 44900, seller: 'HairPro' }
    ];

    console.log('🇮🇳 Verifying Indian Products:');
    keyProducts.forEach(expected => {
      const found = data.products.find(p => p.name === expected.name);
      if (found) {
        const priceMatch = found.price === expected.price;
        const sellerMatch = found.seller === expected.seller;
        const status = priceMatch && sellerMatch ? '✅' : '⚠️';
        console.log(`   ${status} ${expected.name}`);
        console.log(`      Price: Rs.${found.price.toLocaleString()} (Expected: Rs.${expected.price.toLocaleString()})`);
        console.log(`      Seller: ${found.seller} (Expected: ${expected.seller})`);
      } else {
        console.log(`   ❌ ${expected.name}: NOT FOUND`);
      }
    });

    console.log('\n🎉 Marketplace verification completed!');
    console.log('🌐 Frontend: http://localhost:5174/marketplace');
    console.log('🔗 API: http://localhost:3001/api/search?q=');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyMarketplace();
