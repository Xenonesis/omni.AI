import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBotState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  isVoiceMode: boolean;
  isListening: boolean;
  sessionId: string;
  error: string | null;
}

type ChatBotAction =
  | { type: 'TOGGLE_CHAT'; payload?: boolean }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'REMOVE_TYPING_MESSAGES' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VOICE_MODE'; payload: boolean }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET_SESSION' };

const initialState: ChatBotState = {
  isOpen: false,
  isMinimized: false,
  messages: [],
  isLoading: false,
  isVoiceMode: false,
  isListening: false,
  sessionId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  error: null,
};

function chatBotReducer(state: ChatBotState, action: ChatBotAction): ChatBotState {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen,
        isMinimized: false, // Reset minimize when toggling
      };

    case 'TOGGLE_MINIMIZE':
      return {
        ...state,
        isMinimized: !state.isMinimized,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };

    case 'REMOVE_TYPING_MESSAGES':
      return {
        ...state,
        messages: state.messages.filter(msg => !msg.isTyping),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_VOICE_MODE':
      return {
        ...state,
        isVoiceMode: action.payload,
      };

    case 'SET_LISTENING':
      return {
        ...state,
        isListening: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        error: null,
      };

    case 'RESET_SESSION':
      return {
        ...initialState,
        sessionId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

    default:
      return state;
  }
}

interface ChatBotContextType {
  state: ChatBotState;
  dispatch: React.Dispatch<ChatBotAction>;

  // Convenience methods
  openChat: () => void;
  closeChat: () => void;
  toggleChat: (open?: boolean) => void;
  toggleMinimize: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  removeMessage: (id: string) => void;
  removeTypingMessages: () => void;
  setLoading: (loading: boolean) => void;
  setVoiceMode: (enabled: boolean) => void;
  setListening: (listening: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  resetSession: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

interface ChatBotProviderProps {
  children: ReactNode;
}

export const ChatBotProvider: React.FC<ChatBotProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatBotReducer, initialState);

  // Convenience methods
  const openChat = () => dispatch({ type: 'TOGGLE_CHAT', payload: true });
  const closeChat = () => dispatch({ type: 'TOGGLE_CHAT', payload: false });
  const toggleChat = (open?: boolean) => dispatch({ type: 'TOGGLE_CHAT', payload: open });
  const toggleMinimize = () => dispatch({ type: 'TOGGLE_MINIMIZE' });

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    // Generate a more unique ID to prevent duplicates
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const counter = Math.floor(Math.random() * 10000);

    const fullMessage: ChatMessage = {
      ...message,
      id: `msg_${timestamp}_${counter}_${random}`,
      timestamp: new Date(),
    };

    // Check if message with same content and type already exists in last 5 messages
    const recentMessages = state.messages.slice(-5);
    const isDuplicate = recentMessages.some(existingMsg =>
      existingMsg.content === message.content &&
      existingMsg.type === message.type &&
      !existingMsg.isTyping &&
      !message.isTyping
    );

    // Only add if not a duplicate (unless it's a typing indicator)
    if (!isDuplicate || message.isTyping) {
      dispatch({ type: 'ADD_MESSAGE', payload: fullMessage });
    }
  };

  const removeMessage = (id: string) => dispatch({ type: 'REMOVE_MESSAGE', payload: id });
  const removeTypingMessages = () => {
    dispatch({ type: 'REMOVE_TYPING_MESSAGES' });
  };
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setVoiceMode = (enabled: boolean) => dispatch({ type: 'SET_VOICE_MODE', payload: enabled });
  const setListening = (listening: boolean) => dispatch({ type: 'SET_LISTENING', payload: listening });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const clearMessages = () => dispatch({ type: 'CLEAR_MESSAGES' });
  const resetSession = () => dispatch({ type: 'RESET_SESSION' });

  const contextValue: ChatBotContextType = {
    state,
    dispatch,
    openChat,
    closeChat,
    toggleChat,
    toggleMinimize,
    addMessage,
    removeMessage,
    removeTypingMessages,
    setLoading,
    setVoiceMode,
    setListening,
    setError,
    clearMessages,
    resetSession,
  };

  return (
    <ChatBotContext.Provider value={contextValue}>
      {children}
    </ChatBotContext.Provider>
  );
};

export default ChatBotContext;
