import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import Button from './Button';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  voiceInput: string;
  aiResponse: string;
  duration: number;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "Voice Input",
    description: "User speaks their request",
    voiceInput: "Find me Nike Air Jordan 1 Chicago in size 10 under $400",
    aiResponse: "",
    duration: 3000
  },
  {
    id: 2,
    title: "AI Processing",
    description: "AI analyzes and searches multiple sources",
    voiceInput: "",
    aiResponse: "Searching 15+ retailers for Nike Air Jordan 1 Chicago, size 10...",
    duration: 2000
  },
  {
    id: 3,
    title: "Results Found",
    description: "Best deals presented with analysis",
    voiceInput: "",
    aiResponse: "Found 8 offers! Best deal: $349.99 from SneakerMarket with 2-day shipping and 30-day returns.",
    duration: 4000
  }
];

const InteractiveDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      const step = demoSteps[currentStep];
      const stepDuration = step.duration;
      const updateInterval = 50;
      
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (updateInterval / stepDuration) * 100;
          
          if (newProgress >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, updateInterval);

      // Simulate listening state for voice input step
      if (currentStep === 0) {
        setIsListening(true);
        setTimeout(() => setIsListening(false), step.duration - 500);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setIsListening(false);
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Interactive AI Demo
        </h3>
        <p className="text-neutral-600">
          See how our voice AI agent works in real-time
        </p>
      </div>

      {/* Demo Visualization */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Voice Input Visualization */}
              {currentStep === 0 && (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={isListening ? {
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(79, 70, 229, 0.4)",
                        "0 0 0 20px rgba(79, 70, 229, 0)",
                        "0 0 0 0 rgba(79, 70, 229, 0)"
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
                    className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mb-4"
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="bg-white rounded-lg p-4 shadow-md max-w-md">
                    <p className="text-neutral-700 italic">
                      "{currentStepData.voiceInput}"
                    </p>
                  </div>
                </div>
              )}

              {/* AI Processing Visualization */}
              {currentStep === 1 && (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center mb-4"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full" />
                    </div>
                  </motion.div>
                  <div className="bg-white rounded-lg p-4 shadow-md max-w-md">
                    <p className="text-neutral-700">
                      {currentStepData.aiResponse}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Visualization */}
              {currentStep === 2 && (
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✓
                    </motion.div>
                  </motion.div>
                  <div className="bg-white rounded-lg p-4 shadow-md max-w-md">
                    <p className="text-neutral-700">
                      {currentStepData.aiResponse}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-neutral-600 mb-2">
            <span>{currentStepData.title}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            {currentStepData.description}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isPlaying ? (
          <Button
            onClick={handlePlay}
            icon={<Play size={20} />}
            variant="primary"
            glow
          >
            Start Demo
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            icon={<Pause size={20} />}
            variant="secondary"
          >
            Pause
          </Button>
        )}
        
        <Button
          onClick={handleReset}
          icon={<RotateCcw size={20} />}
          variant="outline"
        >
          Reset
        </Button>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {demoSteps.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-primary-600'
                : index < currentStep
                ? 'bg-green-500'
                : 'bg-neutral-300'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default InteractiveDemo;
