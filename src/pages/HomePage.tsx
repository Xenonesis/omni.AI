import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  Award,
  Clock,
  DollarSign,
  Info,
  Mic,
  Play,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CursorFollower from "../components/ui/CursorFollower";
import FAQ from "../components/ui/FAQ";
import InfoModal from "../components/ui/InfoModal";
import InteractiveDemo from "../components/ui/InteractiveDemo";
import Newsletter from "../components/ui/Newsletter";
import PricingPlans from "../components/ui/PricingPlans";
import ScrollProgress from "../components/ui/ScrollProgress";
import ScrollReveal from "../components/ui/ScrollReveal";
import Testimonials from "../components/ui/Testimonials";
import TypewriterText from "../components/ui/TypewriterText";
import EnhancedVoiceSearch from "../components/voice/EnhancedVoiceSearch";
import VoiceSearchDemo from "../components/voice/VoiceSearchDemo";
import { useSearchContext } from "../context/SearchContext";
import { useVoiceSearch } from "../context/VoiceSearchContext";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useSearchContext();
  const { startListening, speak, state: voiceState } = useVoiceSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceDemo, setShowVoiceDemo] = useState(false);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Parallax effects (disabled for reduced motion)
  const heroY = useTransform(
    scrollY,
    [0, 500],
    shouldReduceMotion ? [0, 0] : [0, -150]
  );
  const heroOpacity = useTransform(
    scrollY,
    [0, 300],
    [1, shouldReduceMotion ? 1 : 0.3]
  );

  const handleStartSearch = async () => {
    setIsLoading(true);
    setIsVoiceSearchActive(true);
    dispatch({ type: "START_LISTENING" });

    try {
      // Start voice search with enhanced feedback
      await startListening();
      await speak("I'm listening. Please tell me what you're looking for.");

      // Navigate to marketplace after voice input
      setTimeout(() => {
        setIsLoading(false);
        setIsVoiceSearchActive(false);
        navigate("/marketplace");
      }, 1000);
    } catch (error) {
      console.error("Voice search error:", error);
      setIsLoading(false);
      setIsVoiceSearchActive(false);
      // Fallback to marketplace without voice
      navigate("/marketplace");
    }
  };

  const handleVoiceSearchResults = (results: any) => {
    // Clean voice search results (remove dots and extra formatting)
    const cleanResults = {
      ...results,
      query: results.query?.replace(/[.!?]+$/, "").trim(),
      products: results.products?.map((product: any) => ({
        ...product,
        name: product.name?.replace(/[.!?]+$/, "").trim(),
        description: product.description?.replace(/[.!?]+$/, "").trim(),
      })),
    };

    dispatch({ type: "SET_SEARCH_RESULTS", payload: cleanResults });
    navigate("/marketplace");
  };

  const features = [
    {
      icon: <Mic className="h-7 w-7" />,
      title: "Voice-Powered Search",
      description:
        "Simply speak what you're looking for in natural language. Our AI understands Indian accents and product names.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: <Star className="h-7 w-7" />,
      title: "Indian Product Catalog",
      description:
        "Comprehensive database of Electronics, Fashion & Beauty products with Rs. pricing from verified Indian sellers.",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: "Real-time Price Comparison",
      description:
        "Connect with multiple resellers instantly to find the best deals across India with live pricing.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: <Volume2 className="h-7 w-7" />,
      title: "Voice-Guided Shopping",
      description:
        "Complete your entire shopping journey hands-free with voice navigation and audio feedback.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const stats = [
    {
      number: "50K+",
      label: "Indian Products",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      number: "₹2.5Cr+",
      label: "Total Savings",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      number: "95%",
      label: "Voice Accuracy",
      icon: <Mic className="h-5 w-5" />,
    },
    {
      number: "24/7",
      label: "AI Assistant",
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  const heroTexts = [
    "iPhone & Samsung Phones",
    "Nike & Adidas Shoes",
    "Levi's & H&M Fashion",
    "Sony & JBL Electronics",
    "Lakme & Maybelline Beauty",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 relative">
      {/* Enhanced UI Components */}
      <ScrollProgress />
      {!shouldReduceMotion && <CursorFollower />}

      {/* Voice Search Modal Overlay */}
      {isVoiceSearchActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mic className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Listening...
            </h3>
            <p className="text-gray-600">Tell me what you're looking for</p>
          </motion.div>
        </motion.div>
      )}

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
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
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
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
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
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
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
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2"
            >
              Voice Search for{" "}
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
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
            >
              India's first voice-powered marketplace. Simply speak to find the
              best deals on Electronics, Fashion & Beauty with real-time price
              comparison across multiple sellers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12 px-4"
            >
              {/* Primary Voice Search Button */}
              <motion.div
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                className="relative w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  icon={<Mic size={window.innerWidth < 640 ? 20 : 24} />}
                  onClick={handleStartSearch}
                  loading={isLoading}
                  glow
                  variant="outline"
                  mobileOptimized={true}
                  className="!bg-white !text-primary-800 hover:!bg-neutral-100 hover:!text-primary-900 !shadow-2xl hover:!shadow-white/25 !px-6 sm:!px-10 !py-3 sm:!py-5 !text-base sm:!text-xl !font-bold !border-2 !border-white/20 !rounded-2xl w-full sm:w-auto"
                >
                  {isLoading ? "Starting..." : "Start Voice Search"}
                </Button>

                {/* Pulse animation around button */}
                {!shouldReduceMotion && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 rounded-2xl -z-10"
                  />
                )}
              </motion.div>

              {/* Secondary Actions */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                  className="flex items-center justify-center text-white/80 hover:text-white transition-colors px-4 py-2.5 rounded-lg hover:bg-white/10 touch-target w-full xs:w-auto min-h-touch"
                  onClick={() => setShowVoiceDemo(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Watch Demo</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                  className="flex items-center justify-center text-white/80 hover:text-white transition-colors px-4 py-2.5 rounded-lg hover:bg-white/10 touch-target w-full xs:w-auto min-h-touch"
                  onClick={() => {
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="mr-2 text-sm sm:text-base">Learn More</span>
                  <ArrowDown className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Prominent Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center"
              >
                {/* Info Button */}
                <motion.button
                  whileHover={{
                    scale: shouldReduceMotion ? 1 : 1.05,
                    y: shouldReduceMotion ? 0 : -2,
                  }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                  onClick={() => setIsInfoModalOpen(true)}
                  className="group relative bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        How to Use Locally
                      </div>
                      <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                        Set up omniverse.AI on your computer
                      </div>
                    </div>
                  </div>

                  {/* Subtle glow effect */}
                  {!shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(255, 255, 255, 0.1)",
                          "0 0 20px 0 rgba(255, 255, 255, 0.2)",
                          "0 0 0 0 rgba(255, 255, 255, 0.1)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>

                {/* Know Your Developer Button */}
                <motion.button
                  whileHover={{
                    scale: shouldReduceMotion ? 1 : 1.05,
                    y: shouldReduceMotion ? 0 : -2,
                  }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                  onClick={() => navigate("/developer")}
                  className="group relative bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        Know Your Developer
                      </div>
                      <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                        Meet the creator behind omniverse.AI
                      </div>
                    </div>
                  </div>

                  {/* Subtle glow effect */}
                  {!shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(255, 255, 255, 0.1)",
                          "0 0 20px 0 rgba(255, 255, 255, 0.2)",
                          "0 0 0 0 rgba(255, 255, 255, 0.1)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-1 sm:mb-2 text-accent-400">
                    {React.cloneElement(stat.icon, {
                      size: window.innerWidth < 640 ? 20 : 24,
                    })}
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-primary-200">
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
      <section
        id="features"
        className="py-24 bg-white relative overflow-hidden"
      >
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
              Our advanced platform streamlines the process of finding the best
              deals on limited-edition items using cutting-edge AI technology.
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
                  <div
                    className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div
                      className={`${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                    >
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
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`}
                  />
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
                Our AI agent is designed to understand complex requests and find
                exactly what you're looking for.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "iPhone 15 Pro Max 256GB under ₹1,20,000",
                  "Nike Air Force 1 white shoes size 9 under ₹8,000",
                  "Samsung Galaxy Watch 6 with best offers",
                  "Levi's 511 slim fit jeans size 32 under ₹3,000",
                  "Lakme 9to5 lipstick red shade under ₹500",
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
                      dispatch({ type: "SET_QUERY", payload: example });
                      dispatch({ type: "START_PROCESSING" });
                      navigate("/marketplace");
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
                    <h3 className="font-medium text-neutral-800">
                      Voice Request
                    </h3>
                    <p className="text-sm text-neutral-500">
                      "iPhone 15 Pro Max 256GB under ₹1,20,000"
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <h4 className="font-medium text-neutral-800 mb-2">
                      Best Deal Found
                    </h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Price:</span>
                      <span className="font-semibold text-green-600">
                        ₹1,15,999
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Seller:</span>
                      <span className="font-semibold text-neutral-800">
                        Flipkart
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Delivery:</span>
                      <span className="font-semibold text-neutral-800">
                        Next day
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-600">Savings:</span>
                      <span className="font-semibold text-green-600">
                        ₹4,001 saved
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Return Policy:</span>
                      <span className="font-semibold text-neutral-800">
                        7-day returns
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                    <div className="text-sm text-neutral-600">
                      4 more offers available
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                    <div className="text-sm text-neutral-600">
                      Comparison report ready
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                    <div className="text-sm text-neutral-600">
                      Email notification sent
                    </div>
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
              Watch how our voice AI agent processes requests and finds the best
              deals in real-time.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <InteractiveDemo />
          </ScrollReveal>
        </div>
      </section>

      {/* Enhanced Voice Search Demo Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
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
                Live Voice Search Demo
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Try Voice Search Right Now
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Experience our advanced voice AI that understands Indian accents,
              product names, and natural language queries for seamless shopping.
            </p>
          </ScrollReveal>

          {/* Live Voice Search Component */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="max-w-4xl mx-auto">
              <Card
                variant="elevated"
                className="p-8 bg-white/80 backdrop-blur-sm"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Live Voice Search
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click the microphone and try saying: "Find iPhone 15 under
                    ₹80,000" or "Show me Nike shoes size 9"
                  </p>

                  <EnhancedVoiceSearch
                    onSearchResults={handleVoiceSearchResults}
                    onNavigate={(path) => navigate(path)}
                    autoSpeak={true}
                    showTranscript={true}
                    showConfidence={false}
                    reducedMotion={shouldReduceMotion}
                    className="mx-auto"
                  />
                </div>
              </Card>
            </div>
          </ScrollReveal>

          <ScrollReveal
            direction="up"
            delay={0.4}
            className="text-center mt-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-md border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Natural Language Processing
                </h3>
                <p className="text-sm text-gray-600">
                  Understands complex queries like "Find wireless headphones
                  under $200 with good bass"
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Conversational AI
                </h3>
                <p className="text-sm text-gray-600">
                  Maintains context across multiple interactions and provides
                  helpful follow-up suggestions
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Voice Navigation
                </h3>
                <p className="text-sm text-gray-600">
                  Navigate the entire marketplace hands-free with voice commands
                  and audio feedback
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Indian Product Showcase Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-green-200/30 rounded-full blur-3xl transform -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-orange-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Made for India
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Comprehensive Indian Product Catalog
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              From the latest smartphones to trending fashion, find everything
              you need with real-time pricing from verified Indian sellers.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Electronics Category */}
            <ScrollReveal direction="up" delay={0.1}>
              <Card variant="elevated" hoverable className="p-6 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Electronics
                </h3>
                <p className="text-gray-600 mb-4">
                  Latest smartphones, laptops, headphones, and gadgets
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• iPhone, Samsung, OnePlus</div>
                  <div>• Sony, JBL, Boat headphones</div>
                  <div>• MacBook, Dell, HP laptops</div>
                  <div>• Starting from ₹999</div>
                </div>
              </Card>
            </ScrollReveal>

            {/* Fashion Category */}
            <ScrollReveal direction="up" delay={0.2}>
              <Card variant="elevated" hoverable className="p-6 group">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Fashion & Footwear
                </h3>
                <p className="text-gray-600 mb-4">
                  Trending clothes, shoes, and accessories
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Nike, Adidas, Puma shoes</div>
                  <div>• Levi's, H&M, Zara clothing</div>
                  <div>• Watches, bags, accessories</div>
                  <div>• Starting from ₹299</div>
                </div>
              </Card>
            </ScrollReveal>

            {/* Beauty Category */}
            <ScrollReveal direction="up" delay={0.3}>
              <Card variant="elevated" hoverable className="p-6 group">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Beauty & Personal Care
                </h3>
                <p className="text-gray-600 mb-4">
                  Cosmetics, skincare, and wellness products
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Lakme, Maybelline, L'Oreal</div>
                  <div>• Skincare, makeup, fragrances</div>
                  <div>• Hair care, wellness products</div>
                  <div>• Starting from ₹149</div>
                </div>
              </Card>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={0.4} className="text-center">
            <Button
              variant="primary"
              size="lg"
              icon={<Search size={20} />}
              onClick={() => navigate("/marketplace")}
              className="shadow-lg hover:shadow-xl"
            >
              Explore All Products
            </Button>
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
              Join thousands of satisfied users who save time and money with our
              AI agent.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                number: "50K+",
                label: "Active Users",
                color: "text-blue-600",
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                number: "$2.5M+",
                label: "Total Savings",
                color: "text-green-600",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                number: "24/7",
                label: "AI Availability",
                color: "text-purple-600",
              },
              {
                icon: <Award className="w-8 h-8" />,
                number: "4.9/5",
                label: "User Rating",
                color: "text-yellow-600",
              },
            ].map((stat, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                <Card
                  variant="elevated"
                  className="text-center p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 mb-4 ${stat.color}`}
                  >
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
              Real stories from real users who've saved thousands using our AI
              agent.
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
              Start free and upgrade as you save more. All plans include our
              core AI features.
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
              Ready to Find Your{" "}
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                Perfect Deal?
              </span>
            </h2>

            <p className="max-w-3xl mx-auto mb-10 text-xl text-primary-100 leading-relaxed">
              Start using our voice AI agent today and never overpay for
              limited-edition items again. Join thousands of satisfied users who
              save time and money.
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
                onClick={() => navigate("/marketplace")}
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
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span className="mr-2">Learn More</span>
                <ArrowDown className="w-4 h-4 rotate-180" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Voice Demo Modal */}
      {showVoiceDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVoiceDemo(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Voice Search Demo
              </h3>
              <button
                type="button"
                onClick={() => setShowVoiceDemo(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <VoiceSearchDemo
              autoPlay={true}
              showControls={true}
              reducedMotion={shouldReduceMotion}
            />

            <div className="mt-8 text-center">
              <Button
                variant="primary"
                size="lg"
                icon={<Mic size={20} />}
                onClick={() => {
                  setShowVoiceDemo(false);
                  handleStartSearch();
                }}
                className="shadow-lg hover:shadow-xl"
              >
                Try Voice Search Now
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Voice Agent Demo Section */}
      <section className="max-w-3xl mx-auto my-12 p-6 bg-white rounded-xl shadow border">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Mic className="inline-block text-blue-500" />
          Try Our AI Voice Agent
        </h2>
        <p className="text-gray-600 mb-4">
          Powered by Omnidim Voice Agent API. Your voice queries are processed
          securely using our API key integration.
        </p>
        <EnhancedVoiceSearch />
      </section>

      {/* Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
