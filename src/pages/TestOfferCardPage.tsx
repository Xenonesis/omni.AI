import React from 'react';
import { motion } from 'framer-motion';
import OfferCard from '../components/results/OfferCard';
import { Offer } from '../types';

const TestOfferCardPage: React.FC = () => {
  // Test offers with different data structures
  const testOffers: Array<{ offer: Offer; title: string; description: string }> = [
    {
      title: "Complete Offer (with productUrl)",
      description: "This offer has all navigation data including productUrl",
      offer: {
        id: 'offer-1',
        productId: 'product-123',
        productName: 'iPhone 15 Pro Max',
        price: 89999,
        originalPrice: 99999,
        sellerName: 'TechWorld',
        rating: 4.8,
        deliveryTime: '2-3 days',
        shippingCost: 0,
        returnPolicy: '30 days',
        inStock: true,
        imageUrl: 'https://example.com/iphone.jpg',
        productUrl: '/product/product-123',
      }
    },
    {
      title: "Offer with productId only",
      description: "This offer has productId but no productUrl",
      offer: {
        id: 'offer-2',
        productId: 'product-456',
        productName: 'Samsung Galaxy S24 Ultra',
        price: 79999,
        originalPrice: 89999,
        sellerName: 'MobileHub',
        rating: 4.6,
        deliveryTime: '1-2 days',
        shippingCost: 0,
        returnPolicy: '15 days',
        inStock: true,
        imageUrl: 'https://example.com/samsung.jpg',
      }
    },
    {
      title: "Offer with ID only",
      description: "This offer only has an ID, no productId or productUrl",
      offer: {
        id: 'product-789',
        productName: 'Sony WH-1000XM5 Headphones',
        price: 24999,
        originalPrice: 29999,
        sellerName: 'AudioStore',
        rating: 4.9,
        deliveryTime: '3-4 days',
        shippingCost: 99,
        returnPolicy: '30 days',
        inStock: true,
        imageUrl: 'https://example.com/sony.jpg',
      }
    },
    {
      title: "Minimal Offer (fallback test)",
      description: "This offer has minimal data to test search fallback",
      offer: {
        id: 'minimal-offer',
        productName: 'Nike Air Jordan 1',
        price: 12999,
        originalPrice: 15999,
        sellerName: 'SneakerWorld',
        rating: 4.4,
        deliveryTime: '5-7 days',
        shippingCost: 199,
        returnPolicy: '7 days',
        inStock: false,
        imageUrl: 'https://example.com/nike.jpg',
      }
    }
  ];

  const mockScores = {
    priceScore: 85,
    deliveryScore: 90,
    reputationScore: 88,
    returnPolicyScore: 95,
    totalScore: 89.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            OfferCard Navigation Test
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Test the "View Deal" button functionality with different offer data structures.
            Check the browser console for navigation logs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testOffers.map((testCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="space-y-4"
            >
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {testCase.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  {testCase.description}
                </p>
                <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded font-mono">
                  <div>ID: {testCase.offer.id || 'undefined'}</div>
                  <div>ProductID: {testCase.offer.productId || 'undefined'}</div>
                  <div>ProductURL: {testCase.offer.productUrl || 'undefined'}</div>
                </div>
              </div>
              
              <OfferCard 
                offer={testCase.offer} 
                scores={mockScores}
                showDetailedScores={true}
                rank={index + 1}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Testing Instructions
            </h3>
            <ul className="text-sm text-blue-800 text-left space-y-2">
              <li>• Click each "View Deal" button to test navigation</li>
              <li>• Open browser console (F12) to see navigation logs</li>
              <li>• First card should navigate to /product/product-123</li>
              <li>• Second card should navigate to /product/product-456</li>
              <li>• Third card should navigate to /product/product-789</li>
              <li>• Fourth card should fallback to marketplace search</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestOfferCardPage;
