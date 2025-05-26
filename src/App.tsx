import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { SearchProvider } from './context/SearchContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { VoiceSearchProvider } from './context/VoiceSearchContext';
// import { ChatBotProvider } from './context/ChatBotContext';
import APIErrorBoundary from './components/ui/APIErrorBoundary';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PerformanceMonitor from './components/ui/PerformanceMonitor';
import UnifiedChatSystem from './components/chat/UnifiedChatSystem';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SavedDealsPage from './pages/SavedDealsPage';
import SettingsPage from './pages/SettingsPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import VoiceShoppingPage from './pages/VoiceShoppingPage';
import OrderManagementPage from './pages/OrderManagementPage';
import SellerDashboardPage from './pages/SellerDashboardPage';

import VoiceSearchDebug from './components/debug/VoiceSearchDebug';
import OmniDimensionDebug from './components/debug/OmniDimensionDebug';

function App() {
  return (
    <APIErrorBoundary>
      <AppProvider>
        <SearchProvider>
          <MarketplaceProvider>
            <VoiceSearchProvider>
              {/* <ChatBotProvider> */}
                <Router>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<Navigate to="/marketplace" replace />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/saved" element={<SavedDealsPage />} />
                    <Route path="/saved-deals" element={<SavedDealsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/voice-shopping" element={<VoiceShoppingPage />} />
                    <Route path="/orders" element={<OrderManagementPage />} />
                    <Route path="/seller-dashboard" element={<SellerDashboardPage />} />

                    <Route path="/debug-voice" element={<VoiceSearchDebug />} />
                  </Routes>
                </main>
                <Footer />
                <PerformanceMonitor />
                {/* <UnifiedChatSystem /> */}
                {/* <OmniDimensionDebug /> */}
              </div>
            </Router>
              {/* </ChatBotProvider> */}
            </VoiceSearchProvider>
          </MarketplaceProvider>
        </SearchProvider>
      </AppProvider>
    </APIErrorBoundary>
  );
}

export default App;