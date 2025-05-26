#!/usr/bin/env node

/**
 * 🔍 omniverse.AI API Connection Verifier
 * 
 * Comprehensive API endpoint testing and validation
 * for production deployment verification
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// API Configuration
const API_ENDPOINTS = {
  local: 'http://localhost:3001',
  production: 'https://omniverseai.netlify.app/.netlify/functions'
};

const TEST_CASES = [
  {
    name: 'Health Check',
    endpoint: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'timestamp', 'version']
  },
  {
    name: 'Search All Products',
    endpoint: '/api/search',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'products', 'total']
  },
  {
    name: 'Search Electronics',
    endpoint: '/api/search?category=electronics',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'products', 'total']
  },
  {
    name: 'Search with Query',
    endpoint: '/api/search?q=nike shoes',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'products', 'query']
  },
  {
    name: 'Price Filter',
    endpoint: '/api/search?min_price=1000&max_price=10000',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'products']
  },
  {
    name: 'Get Categories',
    endpoint: '/api/categories',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['success', 'categories', 'brands']
  },
  {
    name: 'Voice Search',
    endpoint: '/api/voice-search',
    method: 'POST',
    body: { transcript: 'find nike shoes under 10000 rupees' },
    expectedStatus: 200,
    expectedFields: ['success', 'results', 'response']
  },
  {
    name: 'Invalid Endpoint',
    endpoint: '/api/invalid',
    method: 'GET',
    expectedStatus: 404,
    expectedFields: ['success', 'error']
  }
];

class APIVerifier {
  constructor() {
    this.results = [];
    this.baseUrl = '';
  }

  async verifyEndpoint(testCase) {
    const url = `${this.baseUrl}${testCase.endpoint}`;
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`   URL: ${url}`);
    
    try {
      const options = {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'omniverse-ai-verifier/3.0.0'
        },
        timeout: 10000
      };
      
      if (testCase.body) {
        options.body = JSON.stringify(testCase.body);
      }
      
      const startTime = Date.now();
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      const result = {
        name: testCase.name,
        url,
        method: testCase.method,
        status: response.status,
        expectedStatus: testCase.expectedStatus,
        responseTime,
        contentType,
        data: responseData,
        passed: this.validateResponse(testCase, response.status, responseData),
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      this.logResult(result);
      
      return result;
      
    } catch (error) {
      const result = {
        name: testCase.name,
        url,
        method: testCase.method,
        error: error.message,
        passed: false,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`   ❌ ERROR: ${error.message}\n`);
      
      return result;
    }
  }

  validateResponse(testCase, status, data) {
    // Check status code
    if (status !== testCase.expectedStatus) {
      return false;
    }
    
    // Check expected fields
    if (testCase.expectedFields && typeof data === 'object') {
      for (const field of testCase.expectedFields) {
        if (!(field in data)) {
          return false;
        }
      }
    }
    
    // Additional validations based on endpoint
    if (testCase.endpoint.includes('/api/search') && data.success) {
      if (!Array.isArray(data.products)) {
        return false;
      }
    }
    
    if (testCase.endpoint.includes('/api/categories') && data.success) {
      if (!Array.isArray(data.categories) || !Array.isArray(data.brands)) {
        return false;
      }
    }
    
    return true;
  }

  logResult(result) {
    const statusIcon = result.passed ? '✅' : '❌';
    const statusText = result.passed ? 'PASSED' : 'FAILED';
    
    console.log(`   Status: ${result.status} (expected: ${result.expectedStatus})`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Result: ${statusIcon} ${statusText}`);
    
    if (result.data && typeof result.data === 'object') {
      if (result.data.products) {
        console.log(`   Products Found: ${result.data.products.length}`);
      }
      if (result.data.categories) {
        console.log(`   Categories: ${result.data.categories.length}`);
      }
      if (result.data.response) {
        console.log(`   Voice Response: "${result.data.response.substring(0, 50)}..."`);
      }
    }
    
    console.log('');
  }

  async testAPIConnection(baseUrl) {
    this.baseUrl = baseUrl;
    console.log(`🚀 Testing API at: ${baseUrl}\n`);
    
    for (const testCase of TEST_CASES) {
      await this.verifyEndpoint(testCase);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  generateReport() {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      averageResponseTime: Math.round(
        this.results
          .filter(r => r.responseTime)
          .reduce((sum, r) => sum + r.responseTime, 0) / 
        this.results.filter(r => r.responseTime).length
      )
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary,
      results: this.results
    };
    
    // Save report
    const reportPath = path.join(process.cwd(), 'api-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 API Verification Summary:');
    console.log(`   Base URL: ${this.baseUrl}`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Success Rate: ${Math.round((summary.passed / summary.total) * 100)}%`);
    console.log(`   Average Response Time: ${summary.averageResponseTime}ms`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
  }

  async verifyProductionAPI() {
    console.log('🌐 Verifying Production API...\n');
    
    // Test production endpoints
    const productionTests = [
      {
        name: 'Production Health Check',
        url: 'https://omniverseai.netlify.app/api/health',
        expectedStatus: 200
      },
      {
        name: 'Production Search',
        url: 'https://omniverseai.netlify.app/api/search?q=nike',
        expectedStatus: 200
      }
    ];
    
    for (const test of productionTests) {
      try {
        const response = await fetch(test.url, { timeout: 10000 });
        const data = await response.json();
        
        console.log(`${test.name}: ${response.status === test.expectedStatus ? '✅' : '❌'}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   URL: ${test.url}`);
        
        if (data.products) {
          console.log(`   Products: ${data.products.length}`);
        }
        
      } catch (error) {
        console.log(`${test.name}: ❌`);
        console.log(`   Error: ${error.message}`);
      }
      
      console.log('');
    }
  }

  async run() {
    try {
      console.log('🔍 omniverse.AI API Connection Verifier v3.0.0\n');
      
      // Test local API first
      console.log('📍 Testing Local API...');
      await this.testAPIConnection(API_ENDPOINTS.local);
      
      const report = this.generateReport();
      
      // Test production API
      await this.verifyProductionAPI();
      
      // Exit with error if tests failed
      if (report.summary.failed > 0) {
        console.log('\n❌ Some API tests failed. Check the report for details.');
        process.exit(1);
      } else {
        console.log('\n✅ All API tests passed successfully!');
      }
      
    } catch (error) {
      console.error('❌ API verification failed:', error);
      process.exit(1);
    }
  }
}

// Run verification
if (require.main === module) {
  const verifier = new APIVerifier();
  verifier.run();
}

module.exports = APIVerifier;
