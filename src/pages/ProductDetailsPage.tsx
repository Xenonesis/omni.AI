import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Award, MapPin, Clock, HeartOff, Check, Copy } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAppContext } from '../context/AppContext';
import { SellerOffer } from '../types/marketplace';
import { Recommendation } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';
import LazyImage from '../components/ui/LazyImage';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, getSellerById, getOffersForProduct, addToCart } = useMarketplace();
  const { state: appState, dispatch: appDispatch } = useAppContext();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<SellerOffer | null>(null);
  const [selectedShipping, setSelectedShipping] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success' | 'copied'>('idle');

  const product = id ? getProductById(id) : null;
  const offers = id ? getOffersForProduct(id) : [];

  // Check if product is saved
  const isSaved = useMemo(() =>
    appState.savedDeals.some(deal => deal.offer.productId === id),
    [appState.savedDeals, id]
  );

  useEffect(() => {
    if (offers.length > 0) {
      const bestOffer = offers.sort((a, b) => a.price - b.price)[0];
      setSelectedOffer(bestOffer);
      setSelectedShipping(bestOffer.shippingOptions[0]?.id || '');
    }
  }, [offers]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Product not found</h2>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const selectedSeller = selectedOffer ? getSellerById(selectedOffer.sellerId) : null;
  const selectedShippingOption = selectedOffer?.shippingOptions.find(opt => opt.id === selectedShipping);
  const totalPrice = selectedOffer ? selectedOffer.price * quantity + (selectedShippingOption?.price || 0) : 0;

  const handleAddToCart = () => {
    if (selectedOffer) {
      addToCart(product.id, selectedOffer.id, quantity);
      // Show success message or redirect
      alert('Added to cart successfully!');
    }
  };

  const handleSaveToggle = () => {
    if (!product || !selectedOffer) return;

    if (isSaved) {
      // Remove from saved deals
      appDispatch({ type: 'REMOVE_SAVED_DEAL', payload: product.id });
    } else {
      // Add to saved deals
      const selectedSeller = getSellerById(selectedOffer.sellerId);
      const dealToSave: Recommendation = {
        offer: {
          id: product.id, // Use product ID to match the existing pattern
          sellerId: selectedOffer.sellerId,
          sellerName: selectedSeller?.name || 'Direct',
          sellerLogo: selectedSeller?.logo,
          productId: product.id,
          price: selectedOffer.price,
          currency: 'INR',
          stock: selectedOffer.stockQuantity,
          estimatedDeliveryDays: selectedOffer.shippingOptions[0]?.estimatedDays || 3,
          reputationScore: selectedSeller?.rating || 4.5,
          returnPolicy: `${selectedOffer.returnPolicy?.returnWindow || 30} days`,
          // Additional properties for display
          productName: product.name,
          originalPrice: product.basePrice,
          rating: selectedSeller?.rating || 4.5,
          deliveryTime: `${selectedOffer.shippingOptions[0]?.estimatedDays || 3} days`,
          shippingCost: selectedShipping ? selectedOffer.shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0 : 0,
          inStock: selectedOffer.stockQuantity > 0,
          imageUrl: product.images[0],
          productUrl: `/product/${product.id}`,
        } as any, // Type assertion to handle the extended properties
        totalScore: (selectedSeller?.rating || 4.5) * 20,
        priceScore: 85,
        deliveryScore: 90,
        reputationScore: (selectedSeller?.rating || 4.5) * 20,
        returnPolicyScore: 95,
      };
      appDispatch({ type: 'SAVE_DEAL', payload: dealToSave });
    }
  };

  const handleShare = async () => {
    if (!product || !selectedOffer) return;

    setShareStatus('sharing');

    const selectedSeller = getSellerById(selectedOffer.sellerId);
    const shareData = {
      title: `${product.name} - ${product.brand}`,
      text: `Check out this ${product.name} for ₹${selectedOffer.price.toLocaleString()} from ${selectedSeller?.name || 'Direct'}`,
      url: window.location.href,
    };

    try {
      // Try Web Share API first (mobile browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareStatus('success');
      } else {
        // Fallback to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareStatus('copied');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard if share fails
      try {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareStatus('copied');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        setShareStatus('idle');
      }
    }

    // Reset status after 2 seconds
    setTimeout(() => setShareStatus('idle'), 2000);
  };

  const OfferCard: React.FC<{ offer: SellerOffer; isSelected: boolean }> = ({ offer, isSelected }) => {
    const seller = getSellerById(offer.sellerId);
    if (!seller) return null;

    return (
      <Card
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={() => {
          setSelectedOffer(offer);
          setSelectedShipping(offer.shippingOptions[0]?.id || '');
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {seller.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">{seller.name}</h4>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="ml-1 text-xs text-neutral-600">{seller.rating}</span>
                  {seller.verificationStatus === 'verified' && (
                    <Award className="w-3 h-3 text-blue-500 ml-2" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">${offer.price}</div>
              {offer.discount && (
                <div className="text-xs text-green-600 font-medium">{offer.discount}% off</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-neutral-600">
            <div className="flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              {offer.shippingOptions[0]?.estimatedDays} days
            </div>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {seller.location}
            </div>
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              {offer.condition}
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {seller.responseTime}
            </div>
          </div>

          {offer.authenticity.guaranteed && (
            <div className="mt-3 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
              ✓ Authenticity Guaranteed
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ScrollReveal direction="left">
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                <LazyImage
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-primary-500' : 'border-neutral-200'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Product Info */}
          <ScrollReveal direction="right">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                    {product.brand}
                  </span>
                  {product.isLimitedEdition && (
                    <span className="text-sm font-medium text-accent-600 bg-accent-100 px-2 py-1 rounded">
                      Limited Edition
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-neutral-600">
                      {product.averageRating} ({product.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-neutral-600 leading-relaxed mb-6">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-neutral-600">{key}:</span>
                        <span className="font-medium text-neutral-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Purchase Options */}
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-4">
                    Choose Your Seller ({offers.length} offers available)
                  </h3>

                  <div className="space-y-3 mb-6">
                    {offers.slice(0, 3).map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        isSelected={selectedOffer?.id === offer.id}
                      />
                    ))}
                  </div>

                  {selectedOffer && (
                    <div className="space-y-4">
                      {/* Shipping Options */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                          Shipping Options
                        </label>
                        <div className="space-y-2">
                          {selectedOffer.shippingOptions.map((option) => (
                            <label key={option.id} className="flex items-center">
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShipping === option.id}
                                onChange={(e) => setSelectedShipping(e.target.value)}
                                className="mr-3"
                              />
                              <div className="flex-1 flex justify-between">
                                <span>{option.name} ({option.estimatedDays} days)</span>
                                <span className="font-medium">
                                  {option.price === 0 ? 'Free' : `$${option.price}`}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                          Quantity
                        </label>
                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-label="Select quantity"
                        >
                          {[...Array(Math.min(selectedOffer.stockQuantity, 10))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>

                      {/* Total Price */}
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          fullWidth
                          size="lg"
                          onClick={handleAddToCart}
                          icon={<ShoppingCart size={20} />}
                        >
                          Add to Cart
                        </Button>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            icon={isSaved ? <HeartOff size={20} /> : <Heart size={20} />}
                            onClick={handleSaveToggle}
                            className={isSaved ? 'text-error-600 border-error-200 hover:bg-error-50' : ''}
                          >
                            {isSaved ? 'Unsave' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            icon={
                              shareStatus === 'sharing' ? <Share2 size={20} className="animate-pulse" /> :
                              shareStatus === 'success' ? <Check size={20} /> :
                              shareStatus === 'copied' ? <Copy size={20} /> :
                              <Share2 size={20} />
                            }
                            onClick={handleShare}
                            disabled={shareStatus === 'sharing'}
                            className={
                              shareStatus === 'success' ? 'text-green-600 border-green-200 bg-green-50' :
                              shareStatus === 'copied' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                              ''
                            }
                          >
                            {shareStatus === 'sharing' ? 'Sharing...' :
                             shareStatus === 'success' ? 'Shared!' :
                             shareStatus === 'copied' ? 'Copied!' :
                             'Share'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
