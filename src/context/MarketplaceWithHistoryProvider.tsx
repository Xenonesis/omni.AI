import React, { ReactNode } from 'react';
import { MarketplaceProvider, useMarketplace } from './MarketplaceContext';
import { useAppContext } from './AppContext';
import { VoiceSearchResult, SearchFilters } from '../types/marketplace';

// Wrapper component that adds search history functionality
const MarketplaceWithHistoryWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { dispatch: appDispatch } = useAppContext();
  const marketplace = useMarketplace();

  // Enhanced search function that adds to history
  const searchProductsWithHistory = async (
    query: string, 
    filters: SearchFilters = {}, 
    addToHistory: boolean = true
  ): Promise<VoiceSearchResult> => {
    try {
      // Call the original search function
      const result = await marketplace.searchProducts(query, filters, false);
      
      // Add to search history if requested and we have results
      if (addToHistory && result.products.length > 0) {
        console.log('📝 Adding search to history:', query);
        
        // Transform products to recommendations format for history
        const recommendations = result.products.slice(0, 3).map(product => {
          const bestOffer = marketplace.getBestOffer(product.id);
          const seller = bestOffer ? marketplace.getSellerById(bestOffer.sellerId) : null;
          
          return {
            offer: {
              id: product.id,
              productId: product.id,
              productName: product.name,
              price: bestOffer?.price || product.basePrice,
              originalPrice: bestOffer?.originalPrice || product.basePrice,
              sellerName: seller?.name || 'Direct',
              rating: product.averageRating,
              deliveryTime: '2-3 days',
              shippingCost: 0,
              returnPolicy: '30 days',
              stockStatus: product.stockStatus,
              discount: bestOffer?.discount || 0,
              condition: bestOffer?.condition || 'new',
              lastUpdated: new Date().toISOString(),
            }
          };
        });

        appDispatch({
          type: 'ADD_SEARCH_HISTORY',
          payload: {
            query,
            product: result.products[0], // First result as representative
            recommendations
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  };

  // Create enhanced marketplace context
  const enhancedMarketplace = {
    ...marketplace,
    searchProducts: searchProductsWithHistory
  };

  // Clone children and inject enhanced marketplace
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { marketplace: enhancedMarketplace } as any);
    }
    return child;
  });

  return <>{enhancedChildren}</>;
};

// Main provider component
export const MarketplaceWithHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MarketplaceProvider>
      <MarketplaceWithHistoryWrapper>
        {children}
      </MarketplaceWithHistoryWrapper>
    </MarketplaceProvider>
  );
};

export default MarketplaceWithHistoryProvider;
