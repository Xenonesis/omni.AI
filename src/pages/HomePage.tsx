import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Repeat, Mail, Mic, ArrowDown, Sparkles, Zap, Shield, TrendingUp, Users, Award, Clock, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';
import InteractiveDemo from '../components/ui/InteractiveDemo';
import VoiceSearchDemo from '../components/voice/VoiceSearchDemo';
import Testimonials from '../components/ui/Testimonials';
import FAQ from '../components/ui/FAQ';
import PricingPlans from '../components/ui/PricingPlans';
import Newsletter from '../components/ui/Newsletter';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import ScrollProgress from '../components/ui/ScrollProgress';
import CursorFollower from '../components/ui/CursorFollower';
import TypewriterText from '../components/ui/TypewriterText';
import { useSearchContext } from '../context/SearchContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useSearchContext();
  const [isLoading, setIsLoading] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const handleStartSearch = async () => {
    setIsLoading(true);
    dispatch({ type: 'START_LISTENING' });

    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
      navigate('/marketplace');
    }, 1000);
  };

  const features = [
    {
      icon: <Search className="h-7 w-7" />,
      title: 'Smart Search',
      description: 'Simply speak what you\'re looking for, including details like brand, size, and color.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: <Star className="h-7 w-7" />,
      title: 'Comprehensive Analysis',
      description: 'We analyze price, delivery speed, seller reputation, and return policies.',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: 'Real-time Data',
      description: 'Connect with 5+ resellers instantly to find the best available deals.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      icon: <Shield className="h-7 w-7" />,
      title: 'Automated Reports',
      description: 'Receive detailed email reports with all offers and direct purchase links.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Happy Users', icon: <TrendingUp className="h-5 w-5" /> },
    { number: '50K+', label: 'Deals Found', icon: <Search className="h-5 w-5" /> },
    { number: '95%', label: 'Success Rate', icon: <Star className="h-5 w-5" /> },
    { number: '24/7', label: 'AI Support', icon: <Sparkles className="h-5 w-5" /> },
  ];

  const heroTexts = [
    "Limited-Edition Items",
    "Rare Collectibles",
    "Exclusive Sneakers",
    "Vintage Electronics",
    "Designer Fashion"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 relative">
      {/* Enhanced UI Components */}
      <ScrollProgress />
      <CursorFollower />
      <FloatingActionButton onVoiceSearch={handleStartSearch} />
      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 -left-24 w-80 h-80 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.15, 1],
            }}
            transition={{
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -bottom-32 right-1/4 w-72 h-72 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-3xl"
          />
        </div>

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Deal Discovery
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Find the Best Deals on{' '}
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                <TypewriterText
                  texts={heroTexts}
                  speed={150}
                  deleteSpeed={75}
                  pauseDuration={3000}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Our advanced voice AI agent contacts multiple resellers, analyzes offers, and recommends the best deals based on your preferences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                size="lg"
                icon={<Mic size={24} />}
                onClick={handleStartSearch}
                loading={isLoading}
                glow
                variant="outline"
                className="!bg-white !text-primary-800 hover:!bg-neutral-100 hover:!text-primary-900 !shadow-2xl hover:!shadow-white/25 !px-8 !py-4 !text-lg !font-semibold !border-2 !border-white/20"
              >
                Start Voice Search
              </Button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-white/80 hover:text-white transition-colors"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="mr-2">Learn More</span>
                <ArrowDown className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2 text-accent-400">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-primary-200">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-primary-50/30" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-primary-100/40 to-accent-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-100/40 to-primary-100/40 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                How It Works
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              AI-Powered Deal Discovery
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Our advanced platform streamlines the process of finding the best deals on limited-edition items using cutting-edge AI technology.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 0.1}
                className="h-full"
              >
                <Card
                  variant="elevated"
                  hoverable
                  animateOnScroll
                  delay={index * 0.1}
                  className="h-full p-8 group hover:shadow-2xl transition-all duration-500"
                >
                  <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors">
                    {feature.description}
                  </p>

                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`} />
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Example Search Section */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-3xl transform -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <ScrollReveal direction="left" className="lg:w-1/2">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent-100 text-accent-700 text-sm font-medium">
                  <Mic className="w-4 h-4 mr-2" />
                  Try It Out
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Try These Example Searches
              </h2>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Our AI agent is designed to understand complex requests and find exactly what you're looking for.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Nike Air Jordan 1 High OG Chicago, Size 10",
                  "PlayStation 5 Digital Edition under $400",
                  "Supreme Box Logo Hoodie, Medium, Black",
                  "LEGO Star Wars Millennium Falcon set"
                ].map((example, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    className="bg-white p-4 rounded-xl shadow-md border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      dispatch({ type: 'SET_QUERY', payload: example });
                      dispatch({ type: 'START_PROCESSING' });
                      navigate('/marketplace');
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                        <Mic className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="text-neutral-700 font-medium group-hover:text-primary-700 transition-colors">
                        "{example}"
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <ScrollReveal direction="up" delay={0.4}>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Mic size={20} />}
                  onClick={handleStartSearch}
                  loading={isLoading}
                  glow
                  className="shadow-lg hover:shadow-xl"
                >
                  Try It Now
                </Button>
              </ScrollReveal>
            </ScrollReveal>

            <ScrollReveal direction="right" className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <Mic className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">Voice Request</h3>
                    <p className="text-sm text-neutral-500">"Find Nike Air Jordan 1 Chicago in size 10"</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <h4 className="font-medium text-neutral-800 mb-2">Top Recommendation</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Price:</span>
                      <span className="font-semibold text-neutral-800">$349.99</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Seller:</span>
                      <span className="font-semibold text-neutral-800">SneakerMarket</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Delivery:</span>
                      <span className="font-semibold text-neutral-800">2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Return Policy:</span>
                      <span className="font-semibold text-neutral-800">30-day returns</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                    <div className="text-sm text-neutral-600">4 more offers available</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                    <div className="text-sm text-neutral-600">Comparison report ready</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                    <div className="text-sm text-neutral-600">Email notification sent</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent-100 text-accent-700 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Live Demo
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              See Our AI Agent in Action
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Watch how our voice AI agent processes requests and finds the best deals in real-time.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <InteractiveDemo />
          </ScrollReveal>
        </div>
      </section>

      {/* Enhanced Voice Search Demo Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <Mic className="w-4 h-4 mr-2" />
                Enhanced AI Voice Search
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Experience Intelligent Voice Shopping
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Our advanced NLP-powered voice search understands natural language, provides contextual responses, and guides you through the entire shopping experience.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <VoiceSearchDemo autoPlay={false} showControls={true} />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4} className="text-center mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-md border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Natural Language Processing</h3>
                <p className="text-sm text-gray-600">Understands complex queries like "Find wireless headphones under $200 with good bass"</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Conversational AI</h3>
                <p className="text-sm text-gray-600">Maintains context across multiple interactions and provides helpful follow-up suggestions</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Voice Navigation</h3>
                <p className="text-sm text-gray-600">Navigate the entire marketplace hands-free with voice commands and audio feedback</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Social Proof Stats Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Trusted by Deal Hunters Worldwide
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied users who save time and money with our AI agent.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: <Users className="w-8 h-8" />, number: '50K+', label: 'Active Users', color: 'text-blue-600' },
              { icon: <DollarSign className="w-8 h-8" />, number: '$2.5M+', label: 'Total Savings', color: 'text-green-600' },
              { icon: <Clock className="w-8 h-8" />, number: '24/7', label: 'AI Availability', color: 'text-purple-600' },
              { icon: <Award className="w-8 h-8" />, number: '4.9/5', label: 'User Rating', color: 'text-yellow-600' },
            ].map((stat, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                <Card variant="elevated" className="text-center p-8 hover:shadow-2xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 mb-4 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    {stat.label}
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Customer Stories
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Real stories from real users who've saved thousands using our AI agent.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <Testimonials />
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <DollarSign className="w-4 h-4 mr-2" />
                Simple Pricing
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Start free and upgrade as you save more. All plans include our core AI features.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <PricingPlans />
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Got Questions?
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about our AI agent and how it works.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <FAQ />
          </ScrollReveal>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 to-primary-50/30">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up">
            <Newsletter />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-accent-900/90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <ScrollReveal direction="up">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started Today
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to Find Your{' '}
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                Perfect Deal?
              </span>
            </h2>

            <p className="max-w-3xl mx-auto mb-10 text-xl text-primary-100 leading-relaxed">
              Start using our voice AI agent today and never overpay for limited-edition items again. Join thousands of satisfied users who save time and money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                icon={<Mic size={24} />}
                onClick={handleStartSearch}
                loading={isLoading}
                glow
                variant="outline"
                className="!bg-white !text-primary-800 hover:!bg-neutral-100 hover:!text-primary-900 !shadow-2xl hover:!shadow-white/25 !px-8 !py-4 !text-lg !font-semibold !border-2 !border-white/20"
              >
                Start Voice Search
              </Button>

              <Button
                size="lg"
                onClick={() => navigate('/marketplace')}
                variant="outline"
                className="!bg-transparent !text-white !border-white/30 hover:!bg-white/10 !px-8 !py-4 !text-lg !font-semibold"
              >
                Browse Marketplace
              </Button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-white/80 hover:text-white transition-colors px-6 py-3"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span className="mr-2">Learn More</span>
                <ArrowDown className="w-4 h-4 rotate-180" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default HomePage;