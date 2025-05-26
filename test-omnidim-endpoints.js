#!/usr/bin/env node

/**
 * 🔗 OmniDim API Endpoint Tester
 * 
 * Tests integration with omnidim.io API endpoints
 * for voice AI agent functionality
 */

const fetch = require('node-fetch');
const fs = require('fs');

// OmniDim API Configuration
const OMNIDIM_CONFIG = {
  baseUrl: 'https://api.omnidim.io',
  apiKey: process.env.OMNIDIM_API_KEY || 'hW9MprUtUHNXwakl-aXp2Tqy-Dfz0Q3IhMEx2ntqo5E',
  secretKey: process.env.OMNIDIM_SECRET_KEY || '201ff4fd19c1ffd37b272cc1eacb874a',
  widgetId: 'omnidimension-web-widget'
};

// Test endpoints based on omnidim.io documentation
const OMNIDIM_ENDPOINTS = [
  {
    name: 'Authentication Test',
    endpoint: '/auth/validate',
    method: 'POST',
    body: {
      apiKey: OMNIDIM_CONFIG.apiKey,
      secretKey: OMNIDIM_CONFIG.secretKey
    }
  },
  {
    name: 'Voice Agent Status',
    endpoint: '/voice/agent/status',
    method: 'GET'
  },
  {
    name: 'Voice Processing',
    endpoint: '/voice/process',
    method: 'POST',
    body: {
      transcript: 'Find Nike shoes under 10000 rupees',
      language: 'en',
      context: 'ecommerce'
    }
  },
  {
    name: 'Chat Session Create',
    endpoint: '/chat/session',
    method: 'POST',
    body: {
      userId: 'test-user-123',
      sessionType: 'voice-shopping'
    }
  },
  {
    name: 'Widget Configuration',
    endpoint: '/widget/config',
    method: 'GET',
    params: {
      widgetId: OMNIDIM_CONFIG.widgetId
    }
  }
];

class OmniDimTester {
  constructor() {
    this.results = [];
    this.sessionToken = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${OMNIDIM_CONFIG.baseUrl}${endpoint.endpoint}`;
    
    const requestOptions = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OMNIDIM_CONFIG.apiKey}`,
        'X-Secret-Key': OMNIDIM_CONFIG.secretKey,
        'User-Agent': 'omniverse-ai/3.0.0'
      },
      timeout: 15000,
      ...options
    };

    if (endpoint.body) {
      requestOptions.body = JSON.stringify(endpoint.body);
    }

    if (endpoint.params) {
      const params = new URLSearchParams(endpoint.params);
      const urlWithParams = `${url}?${params}`;
      return fetch(urlWithParams, requestOptions);
    }

    return fetch(url, requestOptions);
  }

  async testEndpoint(endpoint) {
    console.log(`🔍 Testing: ${endpoint.name}`);
    console.log(`   Method: ${endpoint.method}`);
    console.log(`   Endpoint: ${endpoint.endpoint}`);
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(endpoint);
      const responseTime = Date.now() - startTime;
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      const result = {
        name: endpoint.name,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        status: response.status,
        responseTime,
        success: response.ok,
        data: responseData,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      this.logResult(result);
      
      // Store session token if this is auth endpoint
      if (endpoint.name === 'Authentication Test' && response.ok && responseData.token) {
        this.sessionToken = responseData.token;
      }
      
      return result;
      
    } catch (error) {
      const result = {
        name: endpoint.name,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`   ❌ ERROR: ${error.message}\n`);
      
      return result;
    }
  }

  logResult(result) {
    const statusIcon = result.success ? '✅' : '❌';
    const statusText = result.success ? 'SUCCESS' : 'FAILED';
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Result: ${statusIcon} ${statusText}`);
    
    if (result.data && typeof result.data === 'object') {
      if (result.data.message) {
        console.log(`   Message: ${result.data.message}`);
      }
      if (result.data.token) {
        console.log(`   Token: ${result.data.token.substring(0, 20)}...`);
      }
      if (result.data.sessionId) {
        console.log(`   Session ID: ${result.data.sessionId}`);
      }
    }
    
    console.log('');
  }

  async testFallbackEndpoints() {
    console.log('🔄 Testing Fallback Endpoints...\n');
    
    // Test alternative endpoints that might exist
    const fallbackEndpoints = [
      {
        name: 'Health Check',
        endpoint: '/health',
        method: 'GET'
      },
      {
        name: 'API Info',
        endpoint: '/api/info',
        method: 'GET'
      },
      {
        name: 'Voice Capabilities',
        endpoint: '/api/voice/capabilities',
        method: 'GET'
      }
    ];
    
    for (const endpoint of fallbackEndpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  async testWidgetIntegration() {
    console.log('🎛️ Testing Widget Integration...\n');
    
    // Test widget script availability
    const widgetScriptUrl = `https://widget.omnidim.io/widget.js?key=${OMNIDIM_CONFIG.secretKey}`;
    
    try {
      console.log('🔍 Testing Widget Script Availability');
      console.log(`   URL: ${widgetScriptUrl}`);
      
      const response = await fetch(widgetScriptUrl, { timeout: 10000 });
      const scriptContent = await response.text();
      
      const result = {
        name: 'Widget Script',
        url: widgetScriptUrl,
        status: response.status,
        success: response.ok,
        contentLength: scriptContent.length,
        isJavaScript: response.headers.get('content-type')?.includes('javascript')
      };
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Content Length: ${result.contentLength} bytes`);
      console.log(`   Is JavaScript: ${result.isJavaScript ? 'Yes' : 'No'}`);
      console.log(`   Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}\n`);
      
      this.results.push(result);
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      this.results.push({
        name: 'Widget Script',
        url: widgetScriptUrl,
        error: error.message,
        success: false
      });
    }
  }

  generateReport() {
    const summary = {
      total: this.results.length,
      successful: this.results.filter(r => r.success).length,
      failed: this.results.filter(r => !r.success).length,
      averageResponseTime: Math.round(
        this.results
          .filter(r => r.responseTime)
          .reduce((sum, r) => sum + r.responseTime, 0) / 
        this.results.filter(r => r.responseTime).length || 1
      )
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      omnidimConfig: {
        baseUrl: OMNIDIM_CONFIG.baseUrl,
        hasApiKey: !!OMNIDIM_CONFIG.apiKey,
        hasSecretKey: !!OMNIDIM_CONFIG.secretKey,
        widgetId: OMNIDIM_CONFIG.widgetId
      },
      summary,
      results: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Save report
    const reportPath = './omnidim-api-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 OmniDim API Test Summary:');
    console.log(`   Base URL: ${OMNIDIM_CONFIG.baseUrl}`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Successful: ${summary.successful} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Success Rate: ${Math.round((summary.successful / summary.total) * 100)}%`);
    
    if (summary.averageResponseTime) {
      console.log(`   Average Response Time: ${summary.averageResponseTime}ms`);
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const authResult = this.results.find(r => r.name === 'Authentication Test');
    if (!authResult || !authResult.success) {
      recommendations.push({
        type: 'authentication',
        message: 'Authentication failed. Verify API key and secret key are correct.',
        action: 'Check OMNIDIM_API_KEY and OMNIDIM_SECRET_KEY environment variables'
      });
    }
    
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'endpoints',
        message: `${failedTests.length} endpoints failed. Consider implementing fallback mechanisms.`,
        action: 'Implement local voice processing as backup'
      });
    }
    
    const slowTests = this.results.filter(r => r.responseTime > 5000);
    if (slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        message: 'Some endpoints are slow. Consider caching or timeout adjustments.',
        action: 'Implement request caching and optimize timeout values'
      });
    }
    
    return recommendations;
  }

  async run() {
    try {
      console.log('🔗 OmniDim API Endpoint Tester v3.0.0\n');
      console.log(`🌐 Testing API at: ${OMNIDIM_CONFIG.baseUrl}`);
      console.log(`🔑 API Key: ${OMNIDIM_CONFIG.apiKey ? 'Present' : 'Missing'}`);
      console.log(`🔐 Secret Key: ${OMNIDIM_CONFIG.secretKey ? 'Present' : 'Missing'}\n`);
      
      // Test main endpoints
      for (const endpoint of OMNIDIM_ENDPOINTS) {
        await this.testEndpoint(endpoint);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Test fallback endpoints
      await this.testFallbackEndpoints();
      
      // Test widget integration
      await this.testWidgetIntegration();
      
      // Generate report
      const report = this.generateReport();
      
      // Show recommendations
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.message}`);
          console.log(`      Action: ${rec.action}`);
        });
      }
      
      // Exit with appropriate code
      if (report.summary.failed > report.summary.successful) {
        console.log('\n❌ Most tests failed. Check API configuration and network connectivity.');
        process.exit(1);
      } else {
        console.log('\n✅ OmniDim API testing completed!');
      }
      
    } catch (error) {
      console.error('❌ OmniDim API testing failed:', error);
      process.exit(1);
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new OmniDimTester();
  tester.run();
}

module.exports = OmniDimTester;
