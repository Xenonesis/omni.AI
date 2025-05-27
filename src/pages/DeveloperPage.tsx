import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Code,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  Star,
} from "lucide-react";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import {
  enhancedSkills,
  getCategoryColor,
  getSkillLevelColor,
} from "../data/skillsConfig";
import useFetchDeveloperContent from "../hooks/useFetchDeveloperContent";
import {
  useIntersectionObserver,
  useStaggeredIntersection,
} from "../hooks/useIntersectionObserver";
import {
  prefersReducedMotion,
  slideVariants,
  staggerContainer,
} from "../utils/optimizedAnimations";

// Lazy load heavy components for better performance
const FloatingASCIIText = lazy(
  () => import("../components/ui/FloatingASCIIText")
);
const PixelTransition = lazy(() => import("../components/ui/PixelTransition"));
const Skill3DLogo = lazy(() => import("../components/ui/Skill3DLogo"));
const PerformanceMonitor = lazy(
  () => import("../components/ui/PerformanceMonitor")
);

// Loading fallback component for lazy-loaded components
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-2 text-neutral-600">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  </div>
);

const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const shouldReduceMotion = prefersReducedMotion();

  // Simplified performance settings for now to avoid hook issues
  const performanceReducedMotion = false;
  const quality = "high" as const;
  const webVitals = useMemo(
    () => ({ lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 }),
    []
  );

  // Use performance-aware motion settings
  const optimizedReduceMotion = shouldReduceMotion || performanceReducedMotion;

  // Performance monitoring and optimization
  useEffect(() => {
    // Log Core Web Vitals for monitoring
    if (webVitals.lcp && webVitals.lcp > 0) {
      console.log(`🚀 Developer Page Performance:`, {
        LCP: `${webVitals.lcp?.toFixed(2) || 0}ms`,
        FID: `${webVitals.fid?.toFixed(2) || 0}ms`,
        CLS: webVitals.cls?.toFixed(3) || 0,
        FCP: `${webVitals.fcp?.toFixed(2) || 0}ms`,
        TTFB: `${webVitals.ttfb?.toFixed(2) || 0}ms`,
      });
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalImages = ["/developer-photo.jpg"];
      criticalImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();
  }, [webVitals]);

  const { content, loading, error, retry } = useFetchDeveloperContent(
    "https://iaddy.netlify.app"
  );

  // Intersection observers for performance-optimized animations
  const { targetRef: heroRef, isIntersecting: heroVisible } =
    useIntersectionObserver({
      threshold: 0.2,
      triggerOnce: true,
    });

  const { targetRef: aboutRef, isIntersecting: aboutVisible } =
    useIntersectionObserver({
      threshold: 0.1,
      triggerOnce: true,
    });

  const { observe: observeStaggered, isVisible: isStaggerVisible } =
    useStaggeredIntersection({
      threshold: 0.1,
      staggerDelay: optimizedReduceMotion ? 50 : 100,
    });

  const handleASCIIComplete = useCallback(() => {
    setShowContent(true);
  }, []);

  // Memoized animation variants for performance
  const optimizedVariants = useMemo(
    () => ({
      pageVariants: {
        initial: { opacity: 0, y: optimizedReduceMotion ? 0 : 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: optimizedReduceMotion ? 0 : -20 },
      },
      pageTransition: {
        type: "tween",
        ease: "anticipate",
        duration: optimizedReduceMotion ? 0.01 : 0.5,
      },
    }),
    [optimizedReduceMotion]
  );

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: shouldReduceMotion ? 0.01 : 0.5,
  };

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
        className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Loader2 className="w-8 h-8 text-primary-600" />
          </motion.div>
          <p className="text-neutral-600 font-medium">
            Loading developer information...
          </p>
        </div>
      </motion.div>
    );
  }

  if (error && !content) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
        className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center"
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-error-500 mb-4">
            <ExternalLink className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">
            Unable to Load Content
          </h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button
            onClick={retry}
            icon={<RefreshCw className="w-4 h-4" />}
            variant="primary"
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="ml-3"
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/80">
        <div className="container mx-auto mobile-container">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="text-neutral-600 hover:text-neutral-800"
            >
              Back to Home
            </Button>
            <h1 className="text-lg font-semibold text-neutral-800">
              Know Your Developer
            </h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto mobile-container py-8">
        {/* ASCII Animation Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.div variants={slideVariants.up} className="mb-8">
            <div className="w-full h-96 bg-gradient-to-br from-primary-50/30 via-purple-50/20 to-accent-50/30 rounded-xl border border-primary-200/50 relative overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
              <Suspense fallback={<ComponentLoader />}>
                <FloatingASCIIText
                  text="Hey: I'm Aditya"
                  asciiFontSize={
                    optimizedReduceMotion ? 8 : quality === "low" ? 7 : 5
                  }
                  textFontSize={quality === "low" ? 100 : 120}
                  textColor="#6366f1"
                  planeBaseHeight={quality === "low" ? 6 : 8}
                  enableWaves={!optimizedReduceMotion && quality !== "low"}
                  enableParticles={!optimizedReduceMotion && quality === "high"}
                  enableSound={false}
                  intensity={
                    optimizedReduceMotion ? 0.3 : quality === "low" ? 0.8 : 1.2
                  }
                  className="floating-ascii"
                  onComplete={handleASCIIComplete}
                  onInteraction={() =>
                    console.log("🎯 ASCII interaction detected!")
                  }
                />
              </Suspense>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce"></div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.01 : 0.6,
                  delay: shouldReduceMotion ? 0 : 0.3,
                }}
                className="space-y-4"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800">
                  {content?.name || "Aditya Kumar Tiwari"}
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  {content?.title ||
                    "Cybersecurity Enthusiast | Web Developer | Lifelong Learner"}
                </p>
                {content?.education && (
                  <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 mt-4 border border-primary-100 max-w-md mx-auto">
                    <p className="text-sm font-semibold text-primary-700">
                      Currently Pursuing
                    </p>
                    <p className="text-neutral-800 font-medium">
                      {content.education.degree} in{" "}
                      {content.education.specialization}
                    </p>
                    <p className="text-neutral-600 text-sm">
                      {content.education.institution}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Content Sections */}
        <AnimatePresence>
          {showContent && content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.8,
                delay: shouldReduceMotion ? 0 : 0.6,
              }}
              className="space-y-12"
            >
              {/* About Section */}
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary-600" />
                  About Me
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Developer Image with Pixel Transition */}
                  <div className="lg:col-span-1">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.6,
                        delay: shouldReduceMotion ? 0 : 0.2,
                      }}
                      className="relative"
                    >
                      <div className="w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-100 relative">
                        <Suspense fallback={<ComponentLoader />}>
                          <PixelTransition
                            src="/developer-photo.jpg"
                            alt="Aditya Kumar Tiwari - Developer"
                            className="w-full h-full"
                            pixelSize={
                              optimizedReduceMotion
                                ? 12
                                : quality === "low"
                                ? 8
                                : 4
                            }
                            revealRadius={
                              optimizedReduceMotion
                                ? 120
                                : quality === "low"
                                ? 80
                                : 50
                            }
                            smoothness={
                              optimizedReduceMotion
                                ? 0.15
                                : quality === "low"
                                ? 0.05
                                : 0.02
                            }
                            autoRevealDuration={
                              optimizedReduceMotion
                                ? 1000
                                : quality === "low"
                                ? 1500
                                : 1800
                            }
                            delay={optimizedReduceMotion ? 0 : 400}
                            onComplete={() =>
                              console.log(
                                "🎨 Ultra-smooth pixel transition complete!"
                              )
                            }
                          />
                        </Suspense>
                        {/* Overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                        {/* Professional badge */}
                        <motion.div
                          className="absolute bottom-4 left-4 right-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.01 : 0.6,
                            delay: shouldReduceMotion ? 0 : 3.5,
                          }}
                        >
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-semibold text-neutral-800">
                              {content?.name || "Aditya Kumar Tiwari"}
                            </p>
                            <p className="text-xs text-neutral-600">
                              Cybersecurity Specialist
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* About Text */}
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.6,
                        delay: shouldReduceMotion ? 0 : 0.4,
                      }}
                    >
                      <p className="text-neutral-600 leading-relaxed text-lg mb-6">
                        {content.about}
                      </p>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                          <div className="text-2xl font-bold text-primary-600">
                            {content.experience?.length || 3}
                          </div>
                          <div className="text-sm text-neutral-600">
                            Experience
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {content.projects?.length || 10}
                          </div>
                          <div className="text-sm text-neutral-600">
                            Projects
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {content.certifications?.length || 10}+
                          </div>
                          <div className="text-sm text-neutral-600">
                            Certifications
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {content.achievements?.length || 3}
                          </div>
                          <div className="text-sm text-neutral-600">
                            Achievements
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Enhanced Skills Section with 3D Logos */}
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary-600" />
                  Skills & Technologies
                </h3>

                {/* Skills Grid with 3D Logos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enhancedSkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: optimizedReduceMotion ? 0.01 : 0.3,
                        delay: optimizedReduceMotion ? 0 : index * 0.1,
                      }}
                      className="bg-neutral-50 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                    >
                      {/* Skill Header with 3D Logo */}
                      <div className="flex items-center gap-4 mb-3">
                        <Suspense
                          fallback={
                            <div className="w-[60px] h-[60px] bg-neutral-200 rounded-lg animate-pulse" />
                          }
                        >
                          <Skill3DLogo
                            skillName={skill.name}
                            logoColor={skill.logoColor}
                            logoShape={skill.logoShape}
                            size={quality === "low" ? 50 : 60}
                            onInteraction={() =>
                              console.log(`🎯 ${skill.name} logo clicked!`)
                            }
                          />
                        </Suspense>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-neutral-800 text-lg">
                              {skill.name}
                            </h4>
                            <span
                              className="text-sm font-medium px-2 py-1 rounded-full"
                              style={{
                                backgroundColor:
                                  getSkillLevelColor(skill.level) + "20",
                                color: getSkillLevelColor(skill.level),
                              }}
                            >
                              {skill.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded font-medium"
                              style={{
                                backgroundColor:
                                  getCategoryColor(skill.category) + "20",
                                color: getCategoryColor(skill.category),
                              }}
                            >
                              {skill.category}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {skill.score}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Skill Description */}
                      {skill.description && (
                        <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                          {skill.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.score}%` }}
                          transition={{
                            duration: optimizedReduceMotion ? 0.01 : 1.2,
                            delay: optimizedReduceMotion
                              ? 0
                              : index * 0.1 + 0.3,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${skill.logoColor}, ${skill.logoColor}dd)`,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Skills Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: optimizedReduceMotion ? 0.01 : 0.5,
                    delay: optimizedReduceMotion
                      ? 0
                      : enhancedSkills.length * 0.1 + 0.5,
                  }}
                  className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-100"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">
                        {
                          enhancedSkills.filter((s) => s.level === "Advanced")
                            .length
                        }
                      </div>
                      <div className="text-sm text-neutral-600">Advanced</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {
                          enhancedSkills.filter(
                            (s) => s.level === "Intermediate"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-neutral-600">
                        Intermediate
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {
                          enhancedSkills.filter(
                            (s) => s.category === "Frontend"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-neutral-600">Frontend</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {
                          enhancedSkills.filter(
                            (s) => s.category === "Security"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-neutral-600">Security</div>
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* Experience Section */}
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  Professional Experience
                </h3>
                <div className="space-y-6">
                  {content.experience.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.4,
                        delay: shouldReduceMotion ? 0 : index * 0.1,
                      }}
                      className="border-l-4 border-primary-200 pl-6 pb-6 last:pb-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="font-semibold text-neutral-800">
                          {exp.position}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Calendar className="w-4 h-4" />
                          {exp.duration}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600 font-medium">
                          {exp.company}
                        </span>
                        {exp.location && (
                          <>
                            <span className="text-neutral-400">•</span>
                            <span className="text-neutral-500 text-sm">
                              {exp.location}
                            </span>
                          </>
                        )}
                        {exp.type && (
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                            {exp.type}
                          </span>
                        )}
                      </div>
                      {Array.isArray(exp.description) ? (
                        <ul className="text-neutral-600 leading-relaxed space-y-2">
                          {exp.description.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-600 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Projects Section */}
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary-600" />
                  Featured Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.projects.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.4,
                        delay: shouldReduceMotion ? 0 : index * 0.1,
                      }}
                      className="bg-neutral-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 relative"
                    >
                      {project.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="mb-3">
                        <h4 className="font-semibold text-neutral-800 mb-1">
                          {project.name}
                        </h4>
                        <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                          {project.category}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.technologies.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={() => window.open(project.link, "_blank")}
                        variant="outline"
                        size="sm"
                        icon={<ExternalLink className="w-3 h-3" />}
                        className="w-full"
                      >
                        View Project
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Achievements Section */}
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.4,
                        delay: shouldReduceMotion ? 0 : index * 0.1,
                      }}
                      className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Award className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-800 mb-1">
                            {achievement.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm text-neutral-600">
                              {achievement.organization}
                            </p>
                            {achievement.year && (
                              <>
                                <span className="text-neutral-400">•</span>
                                <span className="text-xs text-neutral-500">
                                  {achievement.year}
                                </span>
                              </>
                            )}
                          </div>
                          {Array.isArray(achievement.description) ? (
                            <ul className="text-sm text-neutral-600 leading-relaxed space-y-1">
                              {achievement.description.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="w-1 h-1 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-neutral-600 leading-relaxed">
                              {achievement.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Certifications Section */}
              {content.certifications && content.certifications.length > 0 && (
                <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary-600" />
                    Certifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0.01 : 0.4,
                          delay: shouldReduceMotion ? 0 : index * 0.05,
                        }}
                        className="bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-lg p-4 border border-neutral-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-neutral-800 text-sm leading-tight">
                            {cert.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              cert.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {cert.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-1">
                          {cert.issuer}
                        </p>
                        <p className="text-xs text-neutral-500 mb-3">
                          {cert.date}
                        </p>
                        <Button
                          onClick={() => window.open(cert.link, "_blank")}
                          variant="outline"
                          size="sm"
                          icon={<ExternalLink className="w-3 h-3" />}
                          className="w-full text-xs"
                        >
                          View Certificate
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Testimonials Section */}
              {content.testimonials && content.testimonials.length > 0 && (
                <section className="bg-gradient-to-br from-primary-50/50 to-purple-50/50 rounded-xl p-6 lg:p-8 border border-primary-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary-600" />
                    What People Say
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.testimonials.map((testimonial, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: shouldReduceMotion ? 0.01 : 0.4,
                          delay: shouldReduceMotion ? 0 : index * 0.1,
                        }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-700 leading-relaxed mb-3 italic">
                              "{testimonial.text}"
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-neutral-800 text-sm">
                                {testimonial.author}
                              </p>
                              <span className="text-neutral-400">•</span>
                              <p className="text-neutral-600 text-sm">
                                {testimonial.position}
                              </p>
                              {testimonial.linkedin && (
                                <Button
                                  onClick={() =>
                                    window.open(testimonial.linkedin, "_blank")
                                  }
                                  variant="ghost"
                                  size="sm"
                                  icon={<Linkedin className="w-3 h-3" />}
                                  className="ml-auto p-1 h-auto"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Contact Section */}
              <section className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  Get In Touch
                </h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={() =>
                      window.open(content.contact.linkedin, "_blank")
                    }
                    variant="outline"
                    icon={<Linkedin className="w-4 h-4" />}
                    className="bg-white/80 hover:bg-white"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(content.contact.github, "_blank")
                    }
                    variant="outline"
                    icon={<Github className="w-4 h-4" />}
                    className="bg-white/80 hover:bg-white"
                  >
                    GitHub
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(content.contact.instagram, "_blank")
                    }
                    variant="outline"
                    icon={<Instagram className="w-4 h-4" />}
                    className="bg-white/80 hover:bg-white"
                  >
                    Instagram
                  </Button>
                  {content.contact.portfolio && (
                    <Button
                      onClick={() =>
                        window.open(content.contact.portfolio, "_blank")
                      }
                      variant="outline"
                      icon={<ExternalLink className="w-4 h-4" />}
                      className="bg-white/80 hover:bg-white"
                    >
                      Portfolio
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      window.open(`mailto:${content.contact.email}`, "_blank")
                    }
                    variant="primary"
                    icon={<Mail className="w-4 h-4" />}
                  >
                    Email Me
                  </Button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DeveloperPage;
