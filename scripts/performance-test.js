#!/usr/bin/env node

/**
 * 🚀 omniverse.AI Performance Testing Suite
 * 
 * Comprehensive performance testing for Core Web Vitals compliance
 * and voice shopping optimization
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Performance thresholds for Core Web Vitals
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1500, // First Contentful Paint (ms)
  TTI: 3500, // Time to Interactive (ms)
  TBT: 300   // Total Blocking Time (ms)
};

// Test URLs
const TEST_URLS = [
  'http://localhost:4173',
  'http://localhost:4173/marketplace',
  'http://localhost:4173/voice-shopping'
];

class PerformanceTest {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  async init() {
    console.log('🚀 Starting Performance Test Suite...\n');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async testPage(url) {
    console.log(`📊 Testing: ${url}`);
    
    const page = await this.browser.newPage();
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Collect performance metrics
    const metrics = await page.metrics();
    const startTime = Date.now();
    
    try {
      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Wait for page to be fully loaded
      await page.waitForTimeout(2000);
      
      // Get Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};
          
          // LCP - Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.LCP = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // FID - First Input Delay (simulated)
          vitals.FID = 0; // Will be measured during interaction
          
          // CLS - Cumulative Layout Shift
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.CLS = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
          
          // FCP - First Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            vitals.FCP = entries[0].startTime;
          }).observe({ entryTypes: ['paint'] });
          
          setTimeout(() => resolve(vitals), 3000);
        });
      });
      
      // Test voice search performance (if available)
      const voicePerformance = await this.testVoiceFeatures(page);
      
      // Test mobile performance
      const mobilePerformance = await this.testMobilePerformance(page);
      
      // Calculate load time
      const loadTime = Date.now() - startTime;
      
      const result = {
        url,
        timestamp: new Date().toISOString(),
        loadTime,
        webVitals,
        voicePerformance,
        mobilePerformance,
        status: response.status(),
        passed: this.evaluatePerformance(webVitals, loadTime)
      };
      
      this.results.push(result);
      this.logResults(result);
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
      this.results.push({
        url,
        error: error.message,
        passed: false
      });
    } finally {
      await page.close();
    }
  }

  async testVoiceFeatures(page) {
    try {
      // Test if voice search button exists and is responsive
      const voiceButton = await page.$('[aria-label*="voice"], [aria-label*="Voice"], .voice-search');
      
      if (voiceButton) {
        const startTime = Date.now();
        await voiceButton.click();
        await page.waitForTimeout(500);
        const responseTime = Date.now() - startTime;
        
        return {
          available: true,
          responseTime,
          passed: responseTime < 500
        };
      }
      
      return { available: false };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  async testMobilePerformance(page) {
    try {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 }); // iPhone SE
      await page.waitForTimeout(1000);
      
      // Test touch targets
      const touchTargets = await page.$$eval('button, a, [role="button"]', elements => {
        return elements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            meetsStandard: rect.width >= 44 && rect.height >= 44
          };
        });
      });
      
      const touchTargetCompliance = touchTargets.filter(t => t.meetsStandard).length / touchTargets.length;
      
      return {
        touchTargetCompliance,
        totalTouchTargets: touchTargets.length,
        passed: touchTargetCompliance > 0.9
      };
    } catch (error) {
      return { error: error.message, passed: false };
    }
  }

  evaluatePerformance(webVitals, loadTime) {
    const checks = [
      webVitals.LCP <= PERFORMANCE_THRESHOLDS.LCP,
      webVitals.FCP <= PERFORMANCE_THRESHOLDS.FCP,
      webVitals.CLS <= PERFORMANCE_THRESHOLDS.CLS,
      loadTime <= 5000 // 5 second max load time
    ];
    
    return checks.every(check => check);
  }

  logResults(result) {
    console.log(`\n📊 Results for ${result.url}:`);
    console.log(`   Load Time: ${result.loadTime}ms`);
    console.log(`   LCP: ${Math.round(result.webVitals.LCP)}ms (${result.webVitals.LCP <= PERFORMANCE_THRESHOLDS.LCP ? '✅' : '❌'})`);
    console.log(`   FCP: ${Math.round(result.webVitals.FCP)}ms (${result.webVitals.FCP <= PERFORMANCE_THRESHOLDS.FCP ? '✅' : '❌'})`);
    console.log(`   CLS: ${result.webVitals.CLS.toFixed(3)} (${result.webVitals.CLS <= PERFORMANCE_THRESHOLDS.CLS ? '✅' : '❌'})`);
    
    if (result.voicePerformance?.available) {
      console.log(`   Voice Response: ${result.voicePerformance.responseTime}ms (${result.voicePerformance.passed ? '✅' : '❌'})`);
    }
    
    if (result.mobilePerformance?.touchTargetCompliance) {
      console.log(`   Touch Targets: ${Math.round(result.mobilePerformance.touchTargetCompliance * 100)}% (${result.mobilePerformance.passed ? '✅' : '❌'})`);
    }
    
    console.log(`   Overall: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length
      },
      thresholds: PERFORMANCE_THRESHOLDS,
      results: this.results
    };
    
    // Save JSON report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Performance Test Summary:');
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.passed} ✅`);
    console.log(`   Failed: ${report.summary.failed} ❌`);
    console.log(`   Success Rate: ${Math.round((report.summary.passed / report.summary.totalTests) * 100)}%`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      for (const url of TEST_URLS) {
        await this.testPage(url);
      }
      
      const report = await this.generateReport();
      
      // Exit with error code if tests failed
      if (report.summary.failed > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Performance test suite failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run performance tests
if (require.main === module) {
  const performanceTest = new PerformanceTest();
  performanceTest.run();
}

module.exports = PerformanceTest;
