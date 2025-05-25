import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'pricing' | 'privacy';
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How does the voice AI agent work?",
    answer: "Our AI agent uses advanced speech recognition to understand your requests, then searches multiple retailers simultaneously. It analyzes prices, shipping costs, seller reputation, and return policies to recommend the best deals tailored to your preferences.",
    category: "general"
  },
  {
    id: 2,
    question: "Which browsers support voice recognition?",
    answer: "Voice recognition works best in Chrome, Edge, and Safari on desktop. Mobile support is available on Chrome for Android and Safari on iOS. We recommend using Chrome for the best experience.",
    category: "technical"
  },
  {
    id: 3,
    question: "Is my voice data stored or recorded?",
    answer: "No, we prioritize your privacy. Voice data is processed in real-time and not stored on our servers. We only keep the text transcription of your search query to improve our service, and you can delete this data anytime.",
    category: "privacy"
  },
  {
    id: 4,
    question: "How much does it cost to use?",
    answer: "Basic voice search is completely free with up to 10 searches per day. Premium plans start at $9.99/month for unlimited searches, priority support, and advanced filtering options.",
    category: "pricing"
  },
  {
    id: 5,
    question: "What types of products can I search for?",
    answer: "Our AI specializes in limited-edition and hard-to-find items including sneakers, collectibles, electronics, fashion items, toys, and more. We cover over 50+ major retailers and marketplaces.",
    category: "general"
  },
  {
    id: 6,
    question: "How accurate are the price comparisons?",
    answer: "Our system updates prices in real-time from verified retailers. We achieve 99.5% accuracy by cross-referencing multiple sources and factoring in shipping costs, taxes, and current promotions.",
    category: "technical"
  },
  {
    id: 7,
    question: "Can I set up alerts for specific items?",
    answer: "Yes! Premium users can set up voice-activated alerts. Just say 'Alert me when [item] is under [price]' and we'll notify you via email or SMS when deals match your criteria.",
    category: "general"
  },
  {
    id: 8,
    question: "What if I'm not satisfied with the results?",
    answer: "We offer a 30-day money-back guarantee for premium subscriptions. Our AI continuously learns from feedback, and you can always refine your search with more specific voice commands.",
    category: "pricing"
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([1]); // First item open by default
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categories = [
    { key: 'all', label: 'All Questions' },
    { key: 'general', label: 'General' },
    { key: 'technical', label: 'Technical' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'privacy', label: 'Privacy' }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-700';
      case 'technical': return 'bg-green-100 text-green-700';
      case 'pricing': return 'bg-purple-100 text-purple-700';
      case 'privacy': return 'bg-orange-100 text-orange-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === category.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredFAQs.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <HelpCircle size={20} className="text-primary-600 mr-3 flex-shrink-0" />
                  <span className="font-semibold text-neutral-900 mr-3">
                    {item.question}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown size={20} className="text-neutral-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openItems.includes(item.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-2">
                      <div className="pl-8 text-neutral-600 leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No results message */}
      {filteredFAQs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <HelpCircle size={48} className="text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No questions found in this category.</p>
        </motion.div>
      )}

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Still have questions?
        </h3>
        <p className="text-neutral-600 mb-4">
          Our support team is here to help you get the most out of our AI agent.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Contact Support
          </button>
          <button className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
            Schedule Demo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FAQ;
