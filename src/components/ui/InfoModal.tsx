import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Play, ExternalLink, CheckCircle, Info } from 'lucide-react';
import Button from './Button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const setupSteps = [
    {
      id: 1,
      title: 'Download & Install',
      description: 'Download the omniverse.AI desktop application for your operating system',
      details: [
        'Visit our official download page',
        'Choose your OS (Windows, macOS, or Linux)',
        'Run the installer with administrator privileges',
        'Follow the installation wizard'
      ],
      icon: <Download className="w-5 h-5" />
    },
    {
      id: 2,
      title: 'Initial Setup',
      description: 'Configure your voice settings and preferences',
      details: [
        'Launch the application',
        'Grant microphone permissions when prompted',
        'Complete the voice calibration process',
        'Set your preferred language and accent'
      ],
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      id: 3,
      title: 'Connect Your Account',
      description: 'Link your omniverse.AI account for personalized experience',
      details: [
        'Sign in with your existing account or create new one',
        'Sync your preferences and saved deals',
        'Enable cloud backup for your data',
        'Configure notification preferences'
      ],
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      id: 4,
      title: 'Start Voice Shopping',
      description: 'Begin using voice commands to find the best deals',
      details: [
        'Click the microphone button or use hotkey',
        'Speak naturally about what you\'re looking for',
        'Review AI-generated results and comparisons',
        'Save deals and complete purchases seamlessly'
      ],
      icon: <Play className="w-5 h-5" />
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">How to Use Locally</h2>
                    <p className="text-primary-100 text-sm">Set up omniverse.AI on your computer</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Video Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary-600" />
                  Video Tutorial
                </h3>
                <div className="bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-xl p-6 border border-neutral-200">
                  <div className="relative w-full aspect-video">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                      src="https://www.youtube.com/embed/t0l8Xd4SySU"
                      title="omniverse.AI Local Setup Tutorial"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-neutral-600 mb-2">
                      Watch this comprehensive tutorial to get started with omniverse.AI on your computer
                    </p>
                    <motion.a
                      href="https://youtu.be/t0l8Xd4SySU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in YouTube
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Setup Steps */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  Step-by-Step Setup Guide
                </h3>
                <div className="space-y-6">
                  {setupSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-neutral-50 to-primary-50/30 rounded-xl p-6 border border-neutral-200 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {step.id}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-primary-600">
                              {step.icon}
                            </div>
                            <h4 className="text-lg font-bold text-neutral-900">
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-neutral-600 mb-4">
                            {step.description}
                          </p>
                          <ul className="space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start gap-2 text-sm text-neutral-700">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200">
                <h4 className="text-lg font-bold text-neutral-900 mb-3">
                  Need Help?
                </h4>
                <p className="text-neutral-600 mb-4">
                  If you encounter any issues during setup, our support team is here to help you get started with omniverse.AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open('mailto:support@omniverse.ai', '_blank')}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open('https://docs.omniverse.ai', '_blank')}
                  >
                    View Documentation
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-600">
                  omniverse.AI - Voice-Powered Shopping Assistant
                </p>
                <Button
                  variant="primary"
                  onClick={onClose}
                  className="px-6"
                >
                  Got It!
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
