import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertCircle, Gift, TrendingUp } from 'lucide-react';
import Button from './Button';

interface NewsletterProps {
  variant?: 'default' | 'minimal' | 'featured';
  className?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({
  variant = 'default',
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 2000);
  };

  const benefits = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "Weekly deal alerts for trending items"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      text: "Exclusive early access to limited drops"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: "AI-powered personalized recommendations"
    }
  ];

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={status === 'loading' || status === 'success'}
          />
          <Button
            type="submit"
            loading={status === 'loading'}
            disabled={status === 'success'}
            variant="primary"
          >
            {status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 rounded-2xl p-8 text-white relative overflow-hidden ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-400/20 rounded-full blur-xl" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
              <p className="text-primary-100">
                Welcome to the OmniDimension community. Check your email for a special welcome offer!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Mail className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Never Miss a Deal Again
                </h3>
                <p className="text-primary-100 text-lg">
                  Get exclusive access to the best limited-edition deals before they sell out
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center text-sm text-primary-100"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    {benefit.text}
                  </motion.div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') {
                        setStatus('idle');
                        setErrorMessage('');
                      }
                    }}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                    disabled={status === 'loading'}
                  />

                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 flex items-center text-red-200 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={status === 'loading'}
                  variant="outline"
                  className="!bg-white !text-primary-800 hover:!bg-neutral-100 hover:!text-primary-900 !font-semibold !shadow-lg !border-2 !border-white/20"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Get Exclusive Deals'}
                </Button>
              </form>

              <p className="text-center text-primary-200 text-sm mt-4">
                Join 50,000+ deal hunters • Unsubscribe anytime • No spam, ever
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Newsletter;
