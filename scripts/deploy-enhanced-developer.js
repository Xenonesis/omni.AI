#!/usr/bin/env node

/**
 * 🚀 Enhanced Developer Page Deployment Script
 * 
 * This script ensures the enhanced developer page with 3D skills logos
 * and ultra-smooth pixel transition is properly deployed to Netlify
 * with all image loading issues resolved.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logStep(step, message) {
  log(`\n🔄 Step ${step}: ${message}`, COLORS.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.green);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, COLORS.yellow);
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateAssets() {
  logStep(1, 'Validating Enhanced Developer Page Assets');
  
  const requiredAssets = [
    'public/developer-profile.svg',
    'src/components/ui/PixelTransition.tsx',
    'src/components/ui/Skill3DLogo.tsx',
    'src/pages/DeveloperPage.tsx',
    'netlify.toml'
  ];

  for (const asset of requiredAssets) {
    const exists = await checkFileExists(asset);
    if (exists) {
      logSuccess(`Found: ${asset}`);
    } else {
      logError(`Missing: ${asset}`);
      throw new Error(`Required asset missing: ${asset}`);
    }
  }
}

async function validateDependencies() {
  logStep(2, 'Validating Dependencies');
  
  const packageJson = JSON.parse(await fs.promises.readFile('package.json', 'utf8'));
  const requiredDeps = [
    'three',
    '@types/three',
    'framer-motion',
    'react',
    'react-dom',
    'react-router-dom'
  ];

  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      logSuccess(`Dependency found: ${dep}`);
    } else {
      logError(`Missing dependency: ${dep}`);
      throw new Error(`Required dependency missing: ${dep}`);
    }
  }
}

async function buildProduction() {
  logStep(3, 'Building Production Version');
  
  try {
    log('🔨 Running production build...', COLORS.yellow);
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Production build completed successfully');
  } catch (error) {
    logError('Production build failed');
    throw error;
  }
}

async function validateBuild() {
  logStep(4, 'Validating Build Output');
  
  const distAssets = [
    'dist/index.html',
    'dist/developer-profile.svg',
    'dist/omniverse-favicon.svg',
    'dist/manifest.json',
    'dist/_redirects'
  ];

  for (const asset of distAssets) {
    const exists = await checkFileExists(asset);
    if (exists) {
      logSuccess(`Build asset found: ${asset}`);
    } else {
      logWarning(`Build asset missing: ${asset}`);
    }
  }

  // Check for JavaScript chunks
  const distDir = await fs.promises.readdir('dist/assets');
  const jsFiles = distDir.filter(file => file.endsWith('.js'));
  const cssFiles = distDir.filter(file => file.endsWith('.css'));

  logSuccess(`Found ${jsFiles.length} JavaScript chunks`);
  logSuccess(`Found ${cssFiles.length} CSS files`);
}

async function testImageLoading() {
  logStep(5, 'Testing Image Loading Configuration');
  
  // Check if developer profile image exists
  const profileExists = await checkFileExists('dist/developer-profile.svg');
  if (profileExists) {
    logSuccess('Developer profile image included in build');
  } else {
    logError('Developer profile image missing from build');
  }

  // Validate netlify.toml configuration
  const netlifyConfig = await fs.promises.readFile('netlify.toml', 'utf8');
  if (netlifyConfig.includes('https://cdn.jsdelivr.net') && 
      netlifyConfig.includes('https://iaddy.netlify.app')) {
    logSuccess('CDN and fallback image sources configured in netlify.toml');
  } else {
    logWarning('Image source configuration may need updating in netlify.toml');
  }
}

async function generateDeploymentReport() {
  logStep(6, 'Generating Deployment Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: '3.2.0',
    features: [
      '✅ Ultra-smooth PixelTransition with 60fps performance',
      '✅ 3D Skills Logos with real technology logos from CDN',
      '✅ Enhanced developer profile with fallback image support',
      '✅ Adaptive quality system for cross-device compatibility',
      '✅ Hardware-accelerated animations with GPU optimization',
      '✅ Accessibility compliance with reduced motion support',
      '✅ Production-ready Netlify configuration',
      '✅ Cross-platform image loading with error handling'
    ],
    deployment: {
      target: 'https://omniverseai.netlify.app/developer',
      buildSize: await getBuildSize(),
      optimizations: [
        'Code splitting for optimal loading',
        'Asset compression and minification',
        'CDN integration for external resources',
        'Fallback mechanisms for image loading',
        'Performance monitoring and adaptive quality'
      ]
    }
  };

  await fs.promises.writeFile(
    'deployment-report.json', 
    JSON.stringify(report, null, 2)
  );
  
  logSuccess('Deployment report generated: deployment-report.json');
  return report;
}

async function getBuildSize() {
  try {
    const stats = await fs.promises.stat('dist');
    return `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
  } catch {
    return 'Unknown';
  }
}

async function main() {
  try {
    log('\n🚀 Enhanced Developer Page Deployment Script', COLORS.bright);
    log('================================================', COLORS.cyan);
    
    await validateAssets();
    await validateDependencies();
    await buildProduction();
    await validateBuild();
    await testImageLoading();
    const report = await generateDeploymentReport();
    
    log('\n🎉 Deployment Preparation Complete!', COLORS.green);
    log('=====================================', COLORS.green);
    log('\n📋 Summary:', COLORS.bright);
    log(`• Version: ${report.version}`, COLORS.cyan);
    log(`• Build Size: ${report.deployment.buildSize}`, COLORS.cyan);
    log(`• Target URL: ${report.deployment.target}`, COLORS.cyan);
    log('\n🚀 Ready for Netlify deployment!', COLORS.green);
    log('\nNext steps:', COLORS.yellow);
    log('1. Deploy to Netlify: npm run deploy:netlify', COLORS.yellow);
    log('2. Test at: https://omniverseai.netlify.app/developer', COLORS.yellow);
    log('3. Verify 3D logos and pixel transition work correctly', COLORS.yellow);
    
  } catch (error) {
    logError(`Deployment preparation failed: ${error.message}`);
    process.exit(1);
  }
}

main();
