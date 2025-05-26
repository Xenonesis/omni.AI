import { useState, useCallback, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAppContext } from '../context/AppContext';

export interface UnifiedVoiceSearchState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

export interface UnifiedVoiceSearchCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onSearchComplete?: (query: string, results: any) => void;
}

export const useUnifiedVoiceSearch = (callbacks?: UnifiedVoiceSearchCallbacks) => {
  const { searchProducts } = useMarketplace();
  const { dispatch: appDispatch } = useAppContext();

  const [state, setState] = useState<UnifiedVoiceSearchState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Clean transcript function to remove unwanted punctuation
  const cleanTranscript = useCallback((text: string): string => {
    return text
      .replace(/[.,!?;:]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }, []);

  // Check if speech recognition is supported
  const isSupported = useCallback(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }, []);

  // Enhanced microphone permission check
  const checkMicrophonePermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('🎤 getUserMedia not supported');
        setState(prev => ({
          ...prev,
          error: 'Microphone access not supported in this browser. Please use Chrome or Edge.'
        }));
        return false;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Stop the stream immediately after permission check
      stream.getTracks().forEach(track => track.stop());
      console.log('🎤 Microphone permission granted');
      return true;
    } catch (error: any) {
      console.error('🎤 Microphone permission error:', error);

      let errorMessage = 'Microphone access failed. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone permissions in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Microphone is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Microphone access was aborted. Please try again.';
      } else {
        errorMessage += 'Please check your microphone settings and try again.';
      }

      setState(prev => ({ ...prev, error: errorMessage }));
      callbacks?.onError?.(errorMessage);
      return false;
    }
  }, [callbacks]);

  // Start voice recognition with enhanced error handling
  const startListening = useCallback(async () => {
    if (!isSupported()) {
      const error = 'Voice search is not supported in your browser. Please use Chrome or Edge.';
      setState(prev => ({ ...prev, error }));
      callbacks?.onError?.(error);
      return;
    }

    if (state.isListening) {
      return; // Already listening
    }

    // Check microphone permissions first
    const hasPermission = await checkMicrophonePermissions();
    if (!hasPermission) {
      return;
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.warn('Error stopping existing recognition:', error);
      }
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English for better accuracy
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setState(prev => ({
          ...prev,
          isListening: true,
          error: null,
          transcript: '',
          interimTranscript: ''
        }));
        callbacks?.onStart?.();
      };

      recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const cleanedInterim = cleanTranscript(interimTranscript);
        const cleanedFinal = cleanTranscript(finalTranscript);

        setState(prev => ({
          ...prev,
          interimTranscript: cleanedInterim,
          confidence: event.results[0]?.[0]?.confidence || 0
        }));

        callbacks?.onResult?.(cleanedInterim, false);

        if (finalTranscript) {
          console.log('🎤 Final transcript:', cleanedFinal);
          setState(prev => ({
            ...prev,
            transcript: cleanedFinal,
            interimTranscript: '',
            isListening: false,
            isProcessing: true
          }));

          callbacks?.onResult?.(cleanedFinal, true);

          try {
            // Perform the search
            console.log('🔍 Starting voice search for:', cleanedFinal);
            await searchProducts(cleanedFinal);

            // Add to search history
            appDispatch({
              type: 'ADD_SEARCH_HISTORY',
              payload: {
                query: cleanedFinal,
                product: undefined,
                recommendations: []
              }
            });

            callbacks?.onSearchComplete?.(cleanedFinal, null);
            console.log('✅ Voice search completed successfully');
          } catch (searchError) {
            console.error('❌ Voice search failed:', searchError);
            const errorMessage = 'Voice search failed. Please try again.';
            setState(prev => ({ ...prev, error: errorMessage }));
            callbacks?.onError?.(errorMessage);
          } finally {
            setState(prev => ({ ...prev, isProcessing: false }));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);

        let errorMessage = 'Voice recognition failed. ';

        switch (event.error) {
          case 'audio-capture':
            errorMessage = 'Microphone access failed. Please check your microphone permissions and ensure no other application is using the microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your internet connection and try again.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Please try again.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech recognition grammar error. Please try again.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported. Please try again.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}. Please try again.`;
        }

        setState(prev => ({
          ...prev,
          isListening: false,
          isProcessing: false,
          error: errorMessage
        }));
        callbacks?.onError?.(errorMessage);
      };

      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setState(prev => ({ ...prev, isListening: false }));
        callbacks?.onEnd?.();
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('🎤 Failed to start voice recognition:', error);
      const errorMessage = 'Failed to start voice recognition. Please check your microphone permissions.';
      setState(prev => ({ ...prev, error: errorMessage }));
      callbacks?.onError?.(errorMessage);
    }
  }, [state.isListening, isSupported, cleanTranscript, searchProducts, appDispatch, callbacks]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping recognition:', error);
        // Force abort if stop fails
        try {
          recognitionRef.current.abort();
        } catch (abortError) {
          console.warn('Error aborting recognition:', abortError);
        }
      }
      recognitionRef.current = null;
    }
    setState(prev => ({ ...prev, isListening: false, isProcessing: false }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    stopListening();
    setState({
      isListening: false,
      isProcessing: false,
      transcript: '',
      interimTranscript: '',
      error: null,
      confidence: 0,
    });
  }, [stopListening]);

  return {
    state,
    startListening,
    stopListening,
    clearError,
    reset,
    isSupported: isSupported(),
  };
};
