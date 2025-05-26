import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useUnifiedVoiceSearch } from '../../hooks/useUnifiedVoiceSearch';

const VoiceSearchInput: React.FC = () => {
  const [autoMode, setAutoMode] = useState(false);

  // Unified voice search hook
  const voiceSearch = useUnifiedVoiceSearch({
    onError: (error) => {
      console.error('Voice search error:', error);
    }
  });

  const handleToggleMode = () => {
    setAutoMode(!autoMode);
    if (voiceSearch.state.isListening) {
      voiceSearch.stopListening();
    }
  };

  const handleStartListening = () => {
    voiceSearch.startListening();
  };

  const handleStopListening = () => {
    voiceSearch.stopListening();
  };

  // Animation variants
  const pulseVariants = {
    listening: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
      }
    },
    idle: {
      scale: 1,
      opacity: 1,
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full flex justify-center mb-6">
        <button
          type="button"
          onClick={handleToggleMode}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          {autoMode ? (
            <>
              <ToggleRight className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">Auto Mode</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-neutral-400" />
              <span className="text-sm font-medium">Manual Mode</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        variants={pulseVariants}
        animate={voiceSearch.state.isListening ? 'listening' : 'idle'}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300
          ${voiceSearch.state.isListening
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
          }
          ${!autoMode && !voiceSearch.state.isListening ? 'cursor-pointer' : ''}
        `}
        onClick={() => !autoMode && handleStartListening()}
        whileHover={!autoMode && !voiceSearch.state.isListening ? { scale: 1.05 } : {}}
        whileTap={!autoMode ? { scale: 0.95 } : {}}
        animate={voiceSearch.state.isListening ? {
          ...pulseVariants.listening,
          boxShadow: [
            "0 0 0 0 rgba(239, 68, 68, 0.4)",
            "0 0 0 25px rgba(239, 68, 68, 0)",
            "0 0 0 0 rgba(239, 68, 68, 0)"
          ]
        } : pulseVariants.idle}
        transition={{
          ...pulseVariants.listening.transition,
          boxShadow: {
            duration: 1.5,
            repeat: voiceSearch.state.isListening ? Infinity : 0,
            ease: "easeInOut"
          }
        }}
      >
        {voiceSearch.state.isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Mic className="w-12 h-12" />
          </motion.div>
        ) : (
          <Mic className="w-12 h-12" />
        )}
      </motion.div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-neutral-800 mb-2">
          {voiceSearch.state.isListening
            ? "Listening..."
            : autoMode
              ? "Auto mode active - I'm always listening"
              : "Click the microphone to start"}
        </h2>
        <p className="text-neutral-500 text-sm">
          {voiceSearch.state.isListening
            ? "Speak clearly and include details like brand, model, size, color"
            : autoMode
              ? "Just start speaking whenever you're ready"
              : "Click to start voice recognition"}
        </p>

        {(voiceSearch.state.interimTranscript || voiceSearch.state.transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg shadow-sm"
          >
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Transcription</h3>
            {voiceSearch.state.interimTranscript && (
              <p className="text-neutral-500 italic mb-2">{voiceSearch.state.interimTranscript}...</p>
            )}
            {voiceSearch.state.transcript && (
              <p className="text-neutral-800 font-medium">{voiceSearch.state.transcript}</p>
            )}
          </motion.div>
        )}

        {voiceSearch.state.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-error-100 rounded-lg flex items-center"
          >
            <AlertCircle className="text-error-500 mr-2" size={16} />
            <p className="text-error-700 text-sm">{voiceSearch.state.error}</p>
          </motion.div>
        )}
      </div>

      {!autoMode && (
        <div className="flex gap-4">
          {voiceSearch.state.isListening ? (
            <motion.button
              type="button"
              onClick={handleStopListening}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MicOff size={18} />
              <span>Stop Listening</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleStartListening}
              disabled={voiceSearch.state.isProcessing}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!voiceSearch.state.isProcessing ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={18} />
              <span>Start Listening</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSearchInput;