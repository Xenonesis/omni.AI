#!/usr/bin/env node

/**
 * Health Monitoring Script for omniverse.AI API
 */

const fetch = require('node-fetch');

const ENDPOINTS = [
  'https://omniverseai.netlify.app/api/health',
  'https://omniverse-ai-api.vercel.app/api/health',
  'https://omniverse-ai-api.railway.app/api/health'
];

async function checkHealth() {
  console.log('🏥 Health Check Report - ' + new Date().toISOString());
  
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { timeout: 10000 });
      const data = await response.json();
      
      console.log(`✅ ${endpoint}: ${response.status} - ${data.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

checkHealth();
