# 🚀 API Server Deployment Guide

## Quick Deploy Commands

### Netlify Functions
```bash
npm run deploy:netlify
```

### Vercel
```bash
npm run deploy:vercel
```

### Railway
```bash
npm run deploy:railway
```

### Deploy to All Platforms
```bash
npm run deploy:all
```

## Health Monitoring
```bash
npm run health:check
```

## API Endpoints

- **Netlify**: https://omniverseai.netlify.app/api/
- **Vercel**: https://omniverse-ai-api.vercel.app/api/
- **Railway**: https://omniverse-ai-api.railway.app/api/

## Environment Variables

Set these in your deployment platform:

```
NODE_ENV=production
OMNIDIM_API_KEY=hW9MprUtUHNXwakl-aXp2Tqy-Dfz0Q3IhMEx2ntqo5E
OMNIDIM_SECRET_KEY=201ff4fd19c1ffd37b272cc1eacb874a
```

## Testing Deployment

```bash
# Test health endpoint
curl https://omniverseai.netlify.app/api/health

# Test search endpoint
curl "https://omniverseai.netlify.app/api/search?q=nike"

# Test voice search
curl -X POST https://omniverseai.netlify.app/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"transcript": "find nike shoes under 10000 rupees"}'
```
