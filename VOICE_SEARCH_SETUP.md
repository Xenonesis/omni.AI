# Voice Search with Real Data Setup Guide

## Overview

This guide will help you set up the enhanced voice search functionality to work with real data from a backend API instead of mock data.

## 🚀 Quick Start

### Step 1: Start the API Server

The voice search now integrates with a real API server that provides product data. You need to start this server first.

#### Option A: Using the Startup Scripts (Recommended)

**Windows:**
```bash
# Double-click or run in Command Prompt
start-api-server.bat
```

**macOS/Linux:**
```bash
# Make executable and run
chmod +x start-api-server.sh
./start-api-server.sh
```

#### Option B: Manual Setup

1. **Install server dependencies:**
```bash
# Copy the server package.json
cp server-package.json package.json

# Install dependencies
npm install express cors

# Restore original package.json
git checkout package.json
```

2. **Start the server:**
```bash
node server.js
```

### Step 2: Start the Frontend Application

In a separate terminal, start the React application:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 3: Test Voice Search

1. **Navigate to Voice Shopping:** Go to `http://localhost:5173/voice-shopping`
2. **Enable Voice Search:** Click the microphone button
3. **Test with Voice Commands:**
   - "Find Nike sneakers under $500"
   - "Show me wireless headphones"
   - "Search for gaming laptops"
   - "Find concert tickets"

## 🔍 How It Works

### API Integration Flow

1. **Voice Input:** User speaks a search query
2. **NLP Processing:** Query is parsed using natural language processing
3. **API Request:** Structured search parameters are sent to the API
4. **Real Data:** API returns actual product data
5. **AI Response:** Conversational AI generates helpful responses
6. **Results Display:** Products are shown with real pricing and details

### API Endpoints

The API server provides the following endpoints:

- **Search Products:** `GET /api/search?q=query&category=sneakers&max_price=500`
- **Health Check:** `GET /api/health`

### Search Parameters Supported

- `q` - Search query text
- `category` - Product category (sneakers, electronics, concert-tickets, sports-tickets)
- `brand` - Brand name (Nike, Apple, Sony, etc.)
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `sort_by` - Sort by (price, rating, reviews, relevance)
- `sort_order` - Sort order (asc, desc)
- `fast_shipping` - Filter for fast shipping (true/false)
- `free_returns` - Filter for free returns (true/false)

## 📊 Sample Data

The API includes sample data for:

### Sneakers
- Nike Air Jordan 1 High OG Chicago ($450)
- Adidas Yeezy Boost 350 V2 Zebra ($380)
- Nike Dunk Low Panda ($120)

### Electronics
- Apple MacBook Pro 16-inch M3 ($2,499)
- Sony WH-1000XM5 Wireless Headphones ($299)
- iPhone 15 Pro Max ($1,199)
- Gaming Laptop - ASUS ROG Strix ($1,599)

### Concert Tickets
- Taylor Swift Eras Tour - MetLife Stadium ($350)
- Drake - It's All A Blur Tour - Madison Square Garden ($280)

### Sports Tickets
- NBA Finals Game 7 - Lakers vs Celtics ($1,200)

## 🎤 Voice Search Examples

### Basic Search
- **"Find Nike shoes"** → Returns Nike sneakers
- **"Show me headphones under $300"** → Returns headphones under $300
- **"Search for concert tickets"** → Returns available concert tickets

### Advanced Queries
- **"Find wireless headphones under $400 with good bass"** → NLP extracts: product=headphones, max_price=400, features=bass
- **"Show me gaming laptops with fast shipping"** → NLP extracts: category=electronics, product=laptop, fast_shipping=true
- **"Find Nike Air Jordan in size 10"** → NLP extracts: brand=Nike, product=Air Jordan, size=10

### Follow-up Queries
- **"Show me cheaper options"** → Contextual filtering
- **"What about Adidas instead?"** → Brand switching
- **"Sort by best rating"** → Result sorting

## 🔧 Troubleshooting

### API Server Issues

**Problem:** API server won't start
**Solution:** 
1. Check if Node.js is installed: `node --version`
2. Check if port 3001 is available
3. Install dependencies manually: `npm install express cors`

**Problem:** "EADDRINUSE" error
**Solution:** 
1. Kill existing process: `lsof -ti:3001 | xargs kill` (macOS/Linux)
2. Or use a different port by editing `server.js`

### Voice Search Issues

**Problem:** Voice search not working
**Solution:**
1. Check browser compatibility (Chrome/Edge recommended)
2. Allow microphone permissions
3. Check console for errors

**Problem:** No search results
**Solution:**
1. Verify API server is running on `http://localhost:3001`
2. Check browser network tab for API calls
3. Try with mock data fallback

### Browser Compatibility

| Browser | Voice Recognition | Text-to-Speech | Status |
|---------|------------------|----------------|---------|
| Chrome | ✅ Full Support | ✅ Full Support | Recommended |
| Edge | ✅ Full Support | ✅ Full Support | Recommended |
| Safari | ⚠️ Limited | ✅ Full Support | Partial |
| Firefox | ❌ No Support | ✅ Full Support | Fallback Only |

## 🔄 Fallback Mechanism

The system includes intelligent fallback:

1. **Primary:** Real API data from `http://localhost:3001`
2. **Fallback:** Mock data from MarketplaceContext
3. **Error Handling:** Graceful degradation with user feedback

## 📈 Performance Monitoring

### API Response Times
- Target: < 500ms for search requests
- Monitoring: Check browser network tab
- Optimization: Results cached for repeated queries

### Voice Processing
- Speech Recognition: Real-time with interim results
- NLP Processing: < 100ms for query parsing
- AI Response Generation: < 200ms for contextual responses

## 🎯 Testing Scenarios

### Test Voice Commands

1. **Product Search:**
   ```
   "Find Nike Air Jordan shoes"
   "Show me wireless headphones under $300"
   "Search for gaming laptops"
   ```

2. **Price Filtering:**
   ```
   "Find headphones under $200"
   "Show me laptops over $1000"
   "Search for shoes between $100 and $500"
   ```

3. **Brand Filtering:**
   ```
   "Find Apple products"
   "Show me Nike sneakers"
   "Search for Sony headphones"
   ```

4. **Category Filtering:**
   ```
   "Find electronics"
   "Show me concert tickets"
   "Search for sports tickets"
   ```

### Expected Results

Each voice command should:
1. ✅ Trigger speech recognition
2. ✅ Parse query with NLP
3. ✅ Make API request with correct parameters
4. ✅ Return real product data
5. ✅ Generate AI response
6. ✅ Display results with proper formatting

## 🔮 Advanced Features

### Context Awareness
- Remembers previous searches
- Handles follow-up questions
- Maintains conversation flow

### Smart Filtering
- Automatic price range detection
- Brand name recognition
- Category classification

### Voice Navigation
- Hands-free marketplace navigation
- Voice-guided shopping flow
- Audio feedback for all actions

## 📞 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify API server** is running on port 3001
3. **Test with curl:** `curl "http://localhost:3001/api/search?q=nike"`
4. **Check browser permissions** for microphone access
5. **Try different browsers** if voice features don't work

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ API server starts without errors
- ✅ Voice search button responds to clicks
- ✅ Speech recognition captures your voice
- ✅ Search results show real product data
- ✅ AI provides contextual responses
- ✅ Navigation works with voice commands

The enhanced voice search is now ready to provide an intelligent, conversational shopping experience with real product data!
