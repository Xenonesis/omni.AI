#!/usr/bin/env node

/**
 * 🌐 omniverse.AI API Server Deployment
 * 
 * Deploys the Express.js API server to cloud platforms
 * with health monitoring and auto-scaling configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class APIServerDeployer {
  constructor() {
    this.deploymentId = `api-deploy-${Date.now()}`;
    this.platforms = ['netlify-functions', 'vercel', 'railway'];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      deploy: '🚀'
    };
    
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  async createNetlifyFunctions() {
    this.log('Creating Netlify Functions...', 'deploy');
    
    // Create netlify functions directory
    const functionsDir = path.join(process.cwd(), 'netlify', 'functions');
    if (!fs.existsSync(functionsDir)) {
      fs.mkdirSync(functionsDir, { recursive: true });
    }
    
    // Create API function
    const apiFunction = `
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const natural = require('natural');
const compromise = require('compromise');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://omniverseai.netlify.app', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Import product data
const INDIAN_PRODUCTS = ${JSON.stringify(require('./src/data/indianProducts.ts').indianProducts || [], null, 2)};

// Helper functions (simplified for serverless)
function searchProducts(query = '', filters = {}) {
  let results = INDIAN_PRODUCTS;
  
  if (query) {
    const queryLower = query.toLowerCase();
    results = results.filter(product => 
      product.name.toLowerCase().includes(queryLower) ||
      product.description.toLowerCase().includes(queryLower) ||
      product.brand.toLowerCase().includes(queryLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }
  
  // Apply filters
  if (filters.category) {
    results = results.filter(p => p.category === filters.category);
  }
  
  if (filters.min_price) {
    results = results.filter(p => p.price >= parseInt(filters.min_price));
  }
  
  if (filters.max_price) {
    results = results.filter(p => p.price <= parseInt(filters.max_price));
  }
  
  if (filters.brand) {
    results = results.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
  }
  
  // Sort results
  if (filters.sort_by) {
    switch (filters.sort_by) {
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
    }
  }
  
  return results;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    platform: 'netlify-functions'
  });
});

app.get('/api/search', (req, res) => {
  try {
    const { q: query, ...filters } = req.query;
    const results = searchProducts(query, filters);
    
    res.json({
      success: true,
      query: query || '',
      filters,
      total: results.length,
      products: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(INDIAN_PRODUCTS.map(p => p.category))];
    const brands = [...new Set(INDIAN_PRODUCTS.map(p => p.brand))];
    
    res.json({
      success: true,
      categories,
      brands,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

app.post('/api/voice-search', (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required'
      });
    }
    
    const results = searchProducts(transcript);
    const responseText = results.length > 0 
      ? \`Found \${results.length} products matching "\${transcript}". The top result is \${results[0].name} for ₹\${results[0].price}.\`
      : \`Sorry, I couldn't find any products matching "\${transcript}". Try searching for electronics, fashion, or beauty products.\`;
    
    res.json({
      success: true,
      transcript,
      results: results.slice(0, 10),
      response: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Voice search failed',
      message: error.message
    });
  }
});

// Error handling
app.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Export serverless handler
module.exports.handler = serverless(app);
`;
    
    fs.writeFileSync(path.join(functionsDir, 'api.js'), apiFunction);
    
    // Create netlify.toml configuration
    const netlifyConfig = `
[build]
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"

[functions]
  node_bundler = "esbuild"
`;
    
    fs.writeFileSync('netlify.toml', netlifyConfig);
    
    this.log('Netlify Functions created successfully', 'success');
  }

  async createVercelConfig() {
    this.log('Creating Vercel configuration...', 'deploy');
    
    const vercelConfig = {
      version: 2,
      name: 'omniverse-ai-api',
      builds: [
        {
          src: 'server.js',
          use: '@vercel/node'
        }
      ],
      routes: [
        {
          src: '/api/(.*)',
          dest: '/server.js'
        }
      ],
      env: {
        NODE_ENV: 'production'
      },
      functions: {
        'server.js': {
          maxDuration: 30
        }
      }
    };
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    
    this.log('Vercel configuration created', 'success');
  }

  async createRailwayConfig() {
    this.log('Creating Railway configuration...', 'deploy');
    
    const railwayConfig = {
      build: {
        builder: 'NIXPACKS'
      },
      deploy: {
        startCommand: 'node server.js',
        healthcheckPath: '/api/health',
        healthcheckTimeout: 300,
        restartPolicyType: 'ON_FAILURE',
        restartPolicyMaxRetries: 10
      }
    };
    
    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
    
    // Create Procfile for Railway
    fs.writeFileSync('Procfile', 'web: node server.js');
    
    this.log('Railway configuration created', 'success');
  }

  async createDockerfile() {
    this.log('Creating Dockerfile...', 'deploy');
    
    const dockerfile = `
# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start server
CMD ["node", "server.js"]
`;
    
    fs.writeFileSync('Dockerfile', dockerfile.trim());
    
    // Create .dockerignore
    const dockerignore = `
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode
dist
`;
    
    fs.writeFileSync('.dockerignore', dockerignore.trim());
    
    this.log('Docker configuration created', 'success');
  }

  async createHealthMonitoring() {
    this.log('Creating health monitoring...', 'deploy');
    
    const healthMonitor = `
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
      
      console.log(\`✅ \${endpoint}: \${response.status} - \${data.status}\`);
    } catch (error) {
      console.log(\`❌ \${endpoint}: \${error.message}\`);
    }
  }
}

checkHealth();
`;
    
    fs.writeFileSync('health-monitor.js', healthMonitor);
    
    this.log('Health monitoring script created', 'success');
  }

  async updatePackageJson() {
    this.log('Updating package.json for deployment...', 'deploy');
    
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add deployment scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'deploy:netlify': 'netlify deploy --prod --dir=dist',
      'deploy:vercel': 'vercel --prod',
      'deploy:railway': 'railway up',
      'deploy:all': 'npm run deploy:netlify && npm run deploy:vercel && npm run deploy:railway',
      'health:check': 'node health-monitor.js',
      'server:start': 'node server.js',
      'server:dev': 'nodemon server.js'
    };
    
    // Add engines
    packageJson.engines = {
      node: '>=18.0.0',
      npm: '>=9.0.0'
    };
    
    // Add serverless dependencies
    if (!packageJson.dependencies['serverless-http']) {
      packageJson.dependencies['serverless-http'] = '^3.2.0';
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    
    this.log('Package.json updated for deployment', 'success');
  }

  async generateDeploymentGuide() {
    this.log('Generating deployment guide...', 'deploy');
    
    const guide = `
# 🚀 API Server Deployment Guide

## Quick Deploy Commands

### Netlify Functions
\`\`\`bash
npm run deploy:netlify
\`\`\`

### Vercel
\`\`\`bash
npm run deploy:vercel
\`\`\`

### Railway
\`\`\`bash
npm run deploy:railway
\`\`\`

### Deploy to All Platforms
\`\`\`bash
npm run deploy:all
\`\`\`

## Health Monitoring
\`\`\`bash
npm run health:check
\`\`\`

## API Endpoints

- **Netlify**: https://omniverseai.netlify.app/api/
- **Vercel**: https://omniverse-ai-api.vercel.app/api/
- **Railway**: https://omniverse-ai-api.railway.app/api/

## Environment Variables

Set these in your deployment platform:

\`\`\`
NODE_ENV=production
OMNIDIM_API_KEY=hW9MprUtUHNXwakl-aXp2Tqy-Dfz0Q3IhMEx2ntqo5E
OMNIDIM_SECRET_KEY=201ff4fd19c1ffd37b272cc1eacb874a
\`\`\`

## Testing Deployment

\`\`\`bash
# Test health endpoint
curl https://omniverseai.netlify.app/api/health

# Test search endpoint
curl "https://omniverseai.netlify.app/api/search?q=nike"

# Test voice search
curl -X POST https://omniverseai.netlify.app/api/voice-search \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "find nike shoes under 10000 rupees"}'
\`\`\`
`;
    
    fs.writeFileSync('API-DEPLOYMENT-GUIDE.md', guide.trim());
    
    this.log('Deployment guide created: API-DEPLOYMENT-GUIDE.md', 'success');
  }

  async deploy() {
    try {
      this.log(\`Starting API server deployment: \${this.deploymentId}\`, 'deploy');
      
      await this.createNetlifyFunctions();
      await this.createVercelConfig();
      await this.createRailwayConfig();
      await this.createDockerfile();
      await this.createHealthMonitoring();
      await this.updatePackageJson();
      await this.generateDeploymentGuide();
      
      this.log('🎉 API server deployment configuration completed!', 'success');
      this.log('📚 Check API-DEPLOYMENT-GUIDE.md for deployment instructions', 'info');
      this.log('🏥 Use "npm run health:check" to monitor API health', 'info');
      
    } catch (error) {
      this.log(\`API deployment setup failed: \${error.message}\`, 'error');
      process.exit(1);
    }
  }
}

// Run deployment setup
if (require.main === module) {
  const deployer = new APIServerDeployer();
  deployer.deploy();
}

module.exports = APIServerDeployer;
`;
    
    fs.writeFileSync('deploy-api-server.js', deploymentScript);
    
    this.log('API deployment script created', 'success');
  }
}

// Run deployment setup
if (require.main === module) {
  const deployer = new APIServerDeployer();
  deployer.deploy();
}

module.exports = APIServerDeployer;
