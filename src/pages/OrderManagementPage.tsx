import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, Package, Check, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CartItem } from '../types/marketplace';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';

const OrderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    state, 
    getProductById, 
    getSellerById, 
    removeFromCart, 
    getCartTotal, 
    createOrder,
    dispatch 
  } = useMarketplace();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'confirmation'>('cart');

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      dispatch({
        type: 'UPDATE_CART_ITEM',
        payload: { id: itemId, updates: { quantity: newQuantity } }
      });
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const order = await createOrder({
        items: state.cart.map(item => {
          const product = getProductById(item.productId);
          const offers = state.offers[item.productId] || [];
          const offer = offers.find(o => o.id === item.offerId);
          
          return {
            id: `item_${Date.now()}_${Math.random()}`,
            productId: item.productId,
            offerId: item.offerId,
            sellerId: offer?.sellerId || '',
            quantity: item.quantity,
            price: offer?.price || 0,
            shippingCost: offer?.shippingOptions[0]?.price || 0,
            status: 'pending' as const,
          };
        }),
        totalAmount: getCartTotal(),
        shippingAddress: {
          id: 'addr_1',
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          phone: '+1 (555) 123-4567',
        },
        billingAddress: {
          id: 'addr_1',
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          phone: '+1 (555) 123-4567',
        },
        paymentMethod: {
          id: 'pm_1',
          type: 'credit-card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      });

      // Clear cart after successful order
      dispatch({ type: 'CLEAR_CART' });
      setCheckoutStep('confirmation');
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => {
    const product = getProductById(item.productId);
    const offers = state.offers[item.productId] || [];
    const offer = offers.find(o => o.id === item.offerId);
    const seller = offer ? getSellerById(offer.sellerId) : null;

    if (!product || !offer || !seller) return null;

    const itemTotal = offer.price * item.quantity;

    return (
      <Card className="p-6">
        <div className="flex gap-4">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-neutral-900 mb-2">
              {product.name}
            </h3>
            
            <div className="text-sm text-neutral-600 mb-3">
              Sold by <span className="font-medium text-primary-600">{seller.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                >
                  <Minus size={16} />
                </button>
                
                <span className="font-medium text-lg">{item.quantity}</span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-primary-600">
                  ${itemTotal.toFixed(2)}
                </div>
                <div className="text-sm text-neutral-600">
                  ${offer.price} each
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </Card>
    );
  };

  if (checkoutStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center">
        <ScrollReveal direction="up">
          <Card className="max-w-md mx-auto text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Order Confirmed!
            </h2>
            
            <p className="text-neutral-600 mb-6">
              Thank you for your purchase. You'll receive email confirmations and tracking information shortly.
            </p>
            
            <div className="space-y-3">
              <Button fullWidth onClick={() => navigate('/marketplace')}>
                Continue Shopping
              </Button>
              <Button variant="outline" fullWidth onClick={() => navigate('/orders')}>
                View Order History
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 text-white py-12">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Shopping Cart</h1>
                <p className="text-primary-100">
                  {state.cart.length} {state.cart.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-primary-100">Total</div>
                <div className="text-3xl font-bold">${getCartTotal().toFixed(2)}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {state.cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <ScrollReveal direction="left">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Items</h2>
              </ScrollReveal>
              
              {state.cart.map((item, index) => (
                <ScrollReveal key={item.id} direction="left" delay={index * 0.1}>
                  <CartItemCard item={item} />
                </ScrollReveal>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <ScrollReveal direction="right">
                <Card className="p-6 sticky top-8">
                  <h3 className="text-xl font-bold text-neutral-900 mb-6">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal</span>
                      <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Shipping</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Tax</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleCheckout}
                      loading={isCheckingOut}
                      icon={<CreditCard size={20} />}
                    >
                      {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={() => navigate('/marketplace')}
                      icon={<ShoppingCart size={20} />}
                    >
                      Continue Shopping
                    </Button>
                  </div>

                  {/* Security Features */}
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Secure checkout
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Free returns within 30 days
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Authenticity guaranteed
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        ) : (
          <ScrollReveal direction="up">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Your cart is empty</h2>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Discover amazing deals on limited-edition items with our AI-powered voice search.
              </p>
              
              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/voice-shopping')}
                  icon={<Package size={20} />}
                >
                  Start Voice Shopping
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/marketplace')}
                  icon={<ShoppingCart size={20} />}
                >
                  Browse Marketplace
                </Button>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};

export default OrderManagementPage;
