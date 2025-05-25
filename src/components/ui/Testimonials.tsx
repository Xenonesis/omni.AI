import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  savings: string;
  timeUsing: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Sneaker Collector",
    company: "Fashion Enthusiast",
    content: "This AI agent found me a rare pair of Jordan 1s for $200 less than anywhere else. The voice search is so intuitive - I just describe what I want and it does all the work!",
    rating: 5,
    avatar: "SC",
    savings: "$1,200",
    timeUsing: "6 months"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Tech Reviewer",
    company: "TechCrunch",
    content: "As someone who reviews the latest gadgets, I need to find limited edition items quickly. This tool has saved me countless hours and helped me get exclusive items before they sell out.",
    rating: 5,
    avatar: "MR",
    savings: "$800",
    timeUsing: "1 year"
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "Fashion Buyer",
    company: "Nordstrom",
    content: "The comprehensive analysis feature is incredible. It doesn't just find the cheapest price - it considers shipping, return policies, and seller reputation. Game changer for my business.",
    rating: 5,
    avatar: "EW",
    savings: "$3,500",
    timeUsing: "8 months"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Collector",
    company: "Vintage Toys",
    content: "I've been collecting vintage LEGO sets for years. This AI agent found discontinued sets I thought were impossible to get, and at prices I could actually afford.",
    rating: 5,
    avatar: "DK",
    savings: "$2,100",
    timeUsing: "4 months"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Parent",
    company: "Busy Mom",
    content: "Finding limited edition toys for my kids used to be a nightmare. Now I just tell the AI what they want and it finds the best deals instantly. My kids think I'm magic!",
    rating: 5,
    avatar: "LT",
    savings: "$600",
    timeUsing: "3 months"
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      {/* Main Testimonial Display */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200 relative"
          >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 text-primary-200">
              <Quote size={40} />
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={`${
                    i < currentTestimonial.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-neutral-600">
                {currentTestimonial.rating}.0
              </span>
            </div>

            {/* Content */}
            <blockquote className="text-lg text-neutral-700 mb-6 leading-relaxed">
              "{currentTestimonial.content}"
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {currentTestimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {currentTestimonial.role} • {currentTestimonial.company}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {currentTestimonial.savings}
                </div>
                <div className="text-sm text-neutral-600">
                  saved in {currentTestimonial.timeUsing}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevTestimonial}
          className="p-2 rounded-full bg-white shadow-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} className="text-neutral-600" />
        </button>

        {/* Dots Indicator */}
        <div className="flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary-600 scale-125'
                  : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextTestimonial}
          className="p-2 rounded-full bg-white shadow-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} className="text-neutral-600" />
        </button>
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center text-sm text-neutral-500">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse mr-2" />
            Auto-playing testimonials
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
