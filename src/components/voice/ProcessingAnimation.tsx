import React from 'react';
import { motion } from 'framer-motion';

const ProcessingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-10">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-32 h-32 mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-primary-100 opacity-30"></div>
        <div className="absolute inset-4 rounded-full bg-primary-200 opacity-40"></div>
        <div className="absolute inset-8 rounded-full bg-primary-300 opacity-50"></div>
        <div className="absolute inset-12 rounded-full bg-primary-400 opacity-60"></div>
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary-600 absolute" style={{ top: '10%', left: '50%' }}></div>
            <div className="w-2 h-2 rounded-full bg-accent-600 absolute" style={{ top: '50%', right: '10%' }}></div>
            <div className="w-2 h-2 rounded-full bg-success-600 absolute" style={{ bottom: '10%', left: '50%' }}></div>
            <div className="w-2 h-2 rounded-full bg-warning-600 absolute" style={{ top: '50%', left: '10%' }}></div>
          </div>
        </motion.div>
      </motion.div>

      <h2 className="text-xl font-medium text-neutral-800 mb-2 text-center">
        Processing your request
      </h2>
      
      <p className="text-neutral-600 text-center mb-6">
        Contacting resellers and analyzing the best deals for you
      </p>
      
      <div className="w-full max-w-md bg-neutral-100 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs mr-3">
              1
            </div>
            <span className="text-sm text-neutral-800">Identifying product specifications</span>
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="ml-auto"
            >
              <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded">
                Done
              </span>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs mr-3">
              2
            </div>
            <span className="text-sm text-neutral-800">Contacting resellers (5/8)</span>
            <motion.div
              animate={{ 
                opacity: [0, 1, 0],
                x: [0, 3, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-auto"
            >
              <span className="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded">
                In Progress
              </span>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="flex items-center opacity-50"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs mr-3">
              3
            </div>
            <span className="text-sm text-neutral-600">Analyzing offers</span>
            <div className="ml-auto">
              <span className="text-xs bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded">
                Pending
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="flex items-center opacity-50"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs mr-3">
              4
            </div>
            <span className="text-sm text-neutral-600">Preparing recommendations</span>
            <div className="ml-auto">
              <span className="text-xs bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded">
                Pending
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;