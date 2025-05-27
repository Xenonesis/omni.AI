import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import APIErrorBoundary from "./components/ui/APIErrorBoundary";
import PerformanceMonitor from "./components/ui/PerformanceMonitor";
import { AppProvider } from "./context/AppContext";
// ChatBotProvider removed - using only OmniDimension widget
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { SearchProvider } from "./context/SearchContext";
import { VoiceSearchProvider } from "./context/VoiceSearchContext";
import ChatTestPage from "./pages/ChatTestPage";
import DeveloperPage from "./pages/DeveloperPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import OrderManagementPage from "./pages/OrderManagementPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SavedDealsPage from "./pages/SavedDealsPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SettingsPage from "./pages/SettingsPage";
import VoiceShoppingPage from "./pages/VoiceShoppingPage";

import VoiceSearchDebug from "./components/debug/VoiceSearchDebug";

function App() {
  return (
    <APIErrorBoundary>
      <AppProvider>
        <SearchProvider>
          <MarketplaceProvider>
            <VoiceSearchProvider>
              <Router>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/search"
                        element={<Navigate to="/marketplace" replace />}
                      />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/saved" element={<SavedDealsPage />} />
                      <Route path="/saved-deals" element={<SavedDealsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route
                        path="/marketplace"
                        element={<MarketplacePage />}
                      />
                      <Route
                        path="/product/:id"
                        element={<ProductDetailsPage />}
                      />
                      <Route
                        path="/voice-shopping"
                        element={<VoiceShoppingPage />}
                      />
                      <Route path="/orders" element={<OrderManagementPage />} />
                      <Route
                        path="/seller-dashboard"
                        element={<SellerDashboardPage />}
                      />

                      <Route
                        path="/debug-voice"
                        element={<VoiceSearchDebug />}
                      />
                      <Route path="/chat-test" element={<ChatTestPage />} />
                      <Route path="/developer" element={<DeveloperPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <PerformanceMonitor />
                  {/* Only OmniDimension widget script is active - no custom chat UI */}
                </div>
              </Router>
            </VoiceSearchProvider>
          </MarketplaceProvider>
        </SearchProvider>
      </AppProvider>
    </APIErrorBoundary>
  );
}

export default App;
