import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { voiceService, VoiceState } from '../services/voiceService';
import { nlpService, ParsedQuery, ConversationContext } from '../services/nlpService';
import { conversationEngine, AIResponse, ConversationState } from '../services/conversationEngine';

export interface VoiceSearchState {
  // Voice Recognition State
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isSupported: boolean;

  // Current Session
  currentTranscript: string;
  interimTranscript: string;
  confidence: number;

  // NLP & AI
  parsedQuery: ParsedQuery | null;
  aiResponse: AIResponse | null;
  conversationContext: ConversationContext | null;
  conversationState: ConversationState | null;

  // Search Results
  searchResults: any;
  recommendations: any[];

  // Settings
  autoSpeak: boolean;
  showTranscript: boolean;
  showConfidence: boolean;
  reducedMotion: boolean;

  // Error Handling
  error: string | null;
  lastError: string | null;
}

type VoiceSearchAction =
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_TRANSCRIPT'; payload: { transcript: string; interim: string; confidence: number } }
  | { type: 'SET_PARSED_QUERY'; payload: ParsedQuery }
  | { type: 'SET_AI_RESPONSE'; payload: AIResponse }
  | { type: 'SET_SEARCH_RESULTS'; payload: any }
  | { type: 'SET_RECOMMENDATIONS'; payload: any[] }
  | { type: 'SET_CONVERSATION_CONTEXT'; payload: ConversationContext }
  | { type: 'SET_CONVERSATION_STATE'; payload: ConversationState }
  | { type: 'SET_SETTINGS'; payload: Partial<VoiceSearchState> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_SESSION' }
  | { type: 'UPDATE_VOICE_STATE'; payload: VoiceState };

const initialState: VoiceSearchState = {
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  isSupported: true,
  currentTranscript: '',
  interimTranscript: '',
  confidence: 0,
  parsedQuery: null,
  aiResponse: null,
  conversationContext: null,
  conversationState: null,
  searchResults: null,
  recommendations: [],
  autoSpeak: true,
  showTranscript: true,
  showConfidence: false,
  reducedMotion: false,
  error: null,
  lastError: null,
};

const voiceSearchReducer = (state: VoiceSearchState, action: VoiceSearchAction): VoiceSearchState => {
  switch (action.type) {
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload, error: action.payload ? null : state.error };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };

    case 'SET_TRANSCRIPT':
      return {
        ...state,
        currentTranscript: action.payload.transcript,
        interimTranscript: action.payload.interim,
        confidence: action.payload.confidence,
      };

    case 'SET_PARSED_QUERY':
      return { ...state, parsedQuery: action.payload };

    case 'SET_AI_RESPONSE':
      return { ...state, aiResponse: action.payload };

    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };

    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };

    case 'SET_CONVERSATION_CONTEXT':
      return { ...state, conversationContext: action.payload };

    case 'SET_CONVERSATION_STATE':
      return { ...state, conversationState: action.payload };

    case 'SET_SETTINGS':
      return { ...state, ...action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, lastError: action.payload || state.lastError };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'RESET_SESSION':
      return {
        ...state,
        currentTranscript: '',
        interimTranscript: '',
        confidence: 0,
        parsedQuery: null,
        aiResponse: null,
        searchResults: null,
        recommendations: [],
        error: null,
      };

    case 'UPDATE_VOICE_STATE':
      return {
        ...state,
        isListening: action.payload.isListening,
        isProcessing: action.payload.isProcessing,
        isSpeaking: action.payload.isSpeaking,
        isSupported: action.payload.isSupported,
        error: action.payload.error || state.error,
      };

    default:
      return state;
  }
};

interface VoiceSearchContextType {
  state: VoiceSearchState;
  dispatch: React.Dispatch<VoiceSearchAction>;

  // Voice Control Methods
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;

  // Search Methods
  processVoiceQuery: (transcript: string) => Promise<void>;
  executeSearch: (parsedQuery: ParsedQuery) => Promise<any>;

  // Settings Methods
  updateSettings: (settings: Partial<VoiceSearchState>) => void;

  // Session Methods
  resetSession: () => void;
  clearError: () => void;
}

const VoiceSearchContext = createContext<VoiceSearchContextType | undefined>(undefined);

export const VoiceSearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(voiceSearchReducer, initialState);

  // Clean transcript function to remove unwanted punctuation
  const cleanTranscript = (text: string): string => {
    if (!text) return '';

    return text
      // Remove trailing periods, commas, and other punctuation
      .replace(/[.,!?;:]+$/g, '')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Convert to lowercase for consistency
      .toLowerCase()
      // Remove any remaining unwanted characters but keep essential ones
      .replace(/[^\w\s\-']/g, '')
      // Clean up any double spaces that might have been created
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    // Initialize voice service and check support
    const isSupported = voiceService.isSupported();
    dispatch({ type: 'SET_SETTINGS', payload: { isSupported } });

    if (!isSupported) {
      dispatch({ type: 'SET_ERROR', payload: 'Voice search is not supported in your browser' });
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    dispatch({ type: 'SET_SETTINGS', payload: { reducedMotion: mediaQuery.matches } });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_SETTINGS', payload: { reducedMotion: e.matches } });
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      voiceService.cleanup();
    };
  }, []);

  const startListening = async (): Promise<void> => {
    try {
      await voiceService.startListening({
        onStart: () => {
          dispatch({ type: 'SET_LISTENING', payload: true });
          dispatch({ type: 'SET_TRANSCRIPT', payload: { transcript: '', interim: '', confidence: 0 } });
        },
        onResult: async (transcript: string, isFinal: boolean, confidence: number) => {
          // Clean the transcript to remove unwanted punctuation
          const cleanedTranscript = cleanTranscript(transcript);

          if (isFinal) {
            dispatch({ type: 'SET_TRANSCRIPT', payload: { transcript: cleanedTranscript, interim: '', confidence } });
            dispatch({ type: 'SET_LISTENING', payload: false });
            await processVoiceQuery(cleanedTranscript);
          } else {
            dispatch({ type: 'SET_TRANSCRIPT', payload: {
              transcript: state.currentTranscript,
              interim: cleanedTranscript,
              confidence
            } });
          }
        },
        onError: (error: string) => {
          dispatch({ type: 'SET_ERROR', payload: error });
          dispatch({ type: 'SET_LISTENING', payload: false });
        },
        onEnd: () => {
          dispatch({ type: 'SET_LISTENING', payload: false });
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to start listening: ${error}` });
    }
  };

  const stopListening = (): void => {
    voiceService.stopListening();
    dispatch({ type: 'SET_LISTENING', payload: false });
  };

  const speak = async (text: string): Promise<void> => {
    if (!state.autoSpeak) return;

    try {
      dispatch({ type: 'SET_SPEAKING', payload: true });
      await voiceService.speak(text);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      dispatch({ type: 'SET_SPEAKING', payload: false });
    }
  };

  const stopSpeaking = (): void => {
    voiceService.stopSpeaking();
    dispatch({ type: 'SET_SPEAKING', payload: false });
  };

  const processVoiceQuery = async (transcript: string): Promise<void> => {
    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      // Parse the query using NLP
      const parsedQuery = nlpService.parseQuery(transcript, state.currentTranscript);
      dispatch({ type: 'SET_PARSED_QUERY', payload: parsedQuery });

      // Execute search if needed
      let searchResults = null;
      if (parsedQuery.intent === 'search' || parsedQuery.intent === 'filter') {
        searchResults = await executeSearch(parsedQuery);
      }

      // Generate AI response
      const aiResponse = conversationEngine.generateResponse(parsedQuery, searchResults);
      dispatch({ type: 'SET_AI_RESPONSE', payload: aiResponse });

      // Update conversation context
      const conversationContext = nlpService.getContext();
      const conversationState = conversationEngine.getState();
      dispatch({ type: 'SET_CONVERSATION_CONTEXT', payload: conversationContext });
      dispatch({ type: 'SET_CONVERSATION_STATE', payload: conversationState });

      // Speak the response
      if (aiResponse.shouldSpeak) {
        await speak(aiResponse.text);
      }

    } catch (error) {
      const errorMessage = `Failed to process voice query: ${error}`;
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      await speak('Sorry, I had trouble processing your request. Please try again.');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const executeSearch = async (parsedQuery: ParsedQuery): Promise<any> => {
    try {
      // Build search parameters from parsed query
      const searchParams = buildSearchParams(parsedQuery);

      // Try to fetch from real search endpoint first
      const searchResults = await fetchFromSearchEndpoint(searchParams);

      if (searchResults) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: searchResults });
        return searchResults;
      }

      // Fallback to mock data if endpoint is not available
      const mockResults = {
        query: parsedQuery.originalQuery,
        products: [],
        recommendations: [],
      };

      dispatch({ type: 'SET_SEARCH_RESULTS', payload: mockResults });
      return mockResults;
    } catch (error) {
      console.error('Search execution failed:', error);
      throw error;
    }
  };

  const buildSearchParams = (parsedQuery: ParsedQuery) => {
    const { entities, filters } = parsedQuery;
    return {
      q: entities.product || parsedQuery.originalQuery,
      category: entities.category,
      brand: entities.brand,
      min_price: entities.priceRange?.min,
      max_price: entities.priceRange?.max,
      size: entities.size,
      color: entities.color,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
      fast_shipping: filters.fastShipping,
      free_returns: filters.freeReturns,
    };
  };

  const fetchFromSearchEndpoint = async (searchParams: any): Promise<any> => {
    try {
      // Build query string
      const queryString = new URLSearchParams(
        Object.entries(searchParams).filter(([_, value]) => value !== undefined && value !== null)
      ).toString();

      const response = await fetch(`http://localhost:3001/api/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to match our expected format
      return {
        query: searchParams.q,
        products: data.products || [],
        recommendations: data.recommendations || [],
        filters: searchParams,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Search endpoint not available, falling back to mock data:', error);
      return null;
    }
  };

  const updateSettings = (settings: Partial<VoiceSearchState>): void => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  };

  const resetSession = (): void => {
    dispatch({ type: 'RESET_SESSION' });
    nlpService.resetContext();
    conversationEngine.endSession();
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: VoiceSearchContextType = {
    state,
    dispatch,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    processVoiceQuery,
    executeSearch,
    updateSettings,
    resetSession,
    clearError,
  };

  return (
    <VoiceSearchContext.Provider value={contextValue}>
      {children}
    </VoiceSearchContext.Provider>
  );
};

export const useVoiceSearch = (): VoiceSearchContextType => {
  const context = useContext(VoiceSearchContext);
  if (!context) {
    throw new Error('useVoiceSearch must be used within a VoiceSearchProvider');
  }
  return context;
};
