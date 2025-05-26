import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Mic } from 'lucide-react';
import Button from './Button';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for trying out our AI agent',
    features: [
      '10 voice searches per day',
      'Basic price comparison',
      'Email notifications',
      'Standard support',
      'Search history (7 days)'
    ],
    icon: <Mic className="w-6 h-6" />,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 99.99,
    description: 'For serious deal hunters and collectors',
    features: [
      'Unlimited voice searches',
      'Advanced filtering & analysis',
      'Real-time price alerts',
      'Priority customer support',
      'Unlimited search history',
      'Export deals to CSV',
      'Mobile app access'
    ],
    popular: true,
    icon: <Star className="w-6 h-6" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    yearlyPrice: 299.99,
    description: 'For businesses and power users',
    features: [
      'Everything in Pro',
      'API access for integration',
      'Custom voice commands',
      'Dedicated account manager',
      'Advanced analytics dashboard',
      'Team collaboration tools',
      'White-label options',
      'SLA guarantee'
    ],
    icon: <Crown className="w-6 h-6" />,
    color: 'text-accent-600',
    bgColor: 'bg-accent-100'
  }
];

const PricingPlans: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 'Free';
    const price = isYearly ? plan.yearlyPrice : plan.price;
    const period = isYearly ? '/year' : '/month';
    return `$${price}${period}`;
  };

  const getSavings = (plan: PricingPlan) => {
    if (plan.price === 0) return null;
    const monthlyTotal = plan.price * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    return savings > 0 ? `Save $${savings.toFixed(2)}` : null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-neutral-100 p-1 rounded-lg flex items-center">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !isYearly
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
              isYearly
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Yearly
            {isYearly && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 ${
              plan.popular
                ? 'border-primary-500 scale-105'
                : selectedPlan === plan.id
                ? 'border-primary-300'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
            onHoverStart={() => setSelectedPlan(plan.id)}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${plan.bgColor} mb-4`}>
                  <div className={plan.color}>
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl font-bold text-neutral-900">
                    {getPrice(plan)}
                  </span>
                  {plan.price > 0 && !isYearly && (
                    <span className="text-neutral-500 ml-1">/month</span>
                  )}
                </div>

                {/* Savings */}
                {isYearly && getSavings(plan) && (
                  <div className="text-green-600 text-sm font-medium">
                    {getSavings(plan)}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + featureIndex * 0.1 }}
                    className="flex items-center"
                  >
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-neutral-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                fullWidth
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                glow={plan.popular}
                className={`${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700'
                    : ''
                }`}
              >
                {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
              </Button>

              {plan.price > 0 && (
                <p className="text-center text-sm text-neutral-500 mt-3">
                  14-day free trial • No credit card required
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enterprise Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-center p-8 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-2xl border border-neutral-200"
      >
        <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          Need a Custom Solution?
        </h3>
        <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
          For large organizations or unique requirements, we offer custom pricing and features.
          Contact our sales team to discuss your specific needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg">
            Contact Sales
          </Button>
          <Button variant="outline" size="lg">
            Schedule Demo
          </Button>
        </div>
      </motion.div>

      {/* Money Back Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <Check size={16} className="mr-2" />
          30-day money-back guarantee on all paid plans
        </div>
      </motion.div>
    </div>
  );
};

export default PricingPlans;
