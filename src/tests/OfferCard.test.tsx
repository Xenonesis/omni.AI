import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import OfferCard from '../components/results/OfferCard';
import { Offer } from '../types';

// Mock the navigation hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AppProvider>
      {children}
    </AppProvider>
  </BrowserRouter>
);

describe('OfferCard Navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const mockOffer: Offer = {
    id: 'test-offer-1',
    productId: 'product-123',
    productName: 'Test Product',
    price: 99.99,
    originalPrice: 129.99,
    sellerName: 'Test Seller',
    rating: 4.5,
    deliveryTime: '2-3 days',
    shippingCost: 0,
    returnPolicy: '30 days',
    inStock: true,
    imageUrl: 'https://example.com/image.jpg',
    productUrl: '/product/product-123',
  };

  const mockScores = {
    priceScore: 85,
    deliveryScore: 90,
    reputationScore: 88,
    returnPolicyScore: 95,
    totalScore: 89.5,
  };

  test('navigates to product page when View Deal button is clicked with productUrl', async () => {
    render(
      <TestWrapper>
        <OfferCard offer={mockOffer} scores={mockScores} />
      </TestWrapper>
    );

    const viewDealButton = screen.getByRole('button', { name: /view deal for test product/i });
    fireEvent.click(viewDealButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/product/product-123');
    });
  });

  test('navigates using productId when productUrl is not available', async () => {
    const offerWithoutUrl = { ...mockOffer, productUrl: undefined };
    
    render(
      <TestWrapper>
        <OfferCard offer={offerWithoutUrl} scores={mockScores} />
      </TestWrapper>
    );

    const viewDealButton = screen.getByRole('button', { name: /view deal for test product/i });
    fireEvent.click(viewDealButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/product/product-123');
    });
  });

  test('falls back to offer id when productId is not available', async () => {
    const offerWithoutProductId = { 
      ...mockOffer, 
      productUrl: undefined, 
      productId: undefined 
    };
    
    render(
      <TestWrapper>
        <OfferCard offer={offerWithoutProductId} scores={mockScores} />
      </TestWrapper>
    );

    const viewDealButton = screen.getByRole('button', { name: /view deal for test product/i });
    fireEvent.click(viewDealButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/product/test-offer-1');
    });
  });

  test('falls back to marketplace search when no navigation data is available', async () => {
    const offerWithoutNavData = { 
      ...mockOffer, 
      productUrl: undefined, 
      productId: undefined,
      id: undefined
    };
    
    render(
      <TestWrapper>
        <OfferCard offer={offerWithoutNavData} scores={mockScores} />
      </TestWrapper>
    );

    const viewDealButton = screen.getByRole('button', { name: /view deal for test product/i });
    fireEvent.click(viewDealButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/marketplace?search=Test%20Product');
    });
  });

  test('shows loading state during navigation', async () => {
    render(
      <TestWrapper>
        <OfferCard offer={mockOffer} scores={mockScores} />
      </TestWrapper>
    );

    const viewDealButton = screen.getByRole('button', { name: /view deal for test product/i });
    fireEvent.click(viewDealButton);

    // Check for loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(viewDealButton).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('handles navigation errors gracefully', async () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    // Mock alert to avoid actual alerts during tests
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    
    // Make navigate throw an error
    mockNavigate.mockImplementation(() => {
      throw new Error('Navigation failed');
    });

    render(
      <TestWrapper>
        <OfferCard offer={mockOffer} scores={mockScores} />
      </TestWrapper>
    );

    const viewDealButton = screen.getByRole('button', { name: /view deal for test product/i });
    fireEvent.click(viewDealButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Navigation error:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Unable to view deal details. Redirecting to marketplace...');
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
