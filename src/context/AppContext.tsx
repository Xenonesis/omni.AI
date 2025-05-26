import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, UserPreferences, Recommendation } from '../types';

type AppAction =
  | { type: 'ADD_SEARCH_HISTORY'; payload: { query: string; product?: any; recommendations?: Recommendation[] } }
  | { type: 'SAVE_DEAL'; payload: Recommendation }
  | { type: 'REMOVE_SAVED_DEAL'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: UserPreferences }
  | { type: 'LOAD_PERSISTED_DATA'; payload: AppState }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'CLEAR_SAVED_DEALS' };

const initialState: AppState = {
  searchHistory: [],
  savedDeals: [],
  userPreferences: {
    prioritizePrice: true,
    prioritizeSpeed: false,
    prioritizeReputation: false,
  },
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// localStorage utilities
const STORAGE_KEY = 'omnidimension_app_data';

const loadFromStorage = (): Partial<AppState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load data from localStorage:', error);
    return {};
  }
};

const saveToStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save data to localStorage:', error);
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  let newState: AppState;

  switch (action.type) {
    case 'ADD_SEARCH_HISTORY':
      newState = {
        ...state,
        searchHistory: [
          {
            timestamp: Date.now(),
            query: action.payload.query,
            product: action.payload.product,
            recommendations: action.payload.recommendations,
          },
          ...state.searchHistory.slice(0, 9), // Keep only last 10 searches
        ],
      };
      break;
    case 'SAVE_DEAL':
      console.log('💾 SAVE_DEAL action received:', action.payload);
      // Check if deal is already saved
      const isDealSaved = state.savedDeals.some(deal => deal.offer.id === action.payload.offer.id);
      console.log('💾 Is deal already saved?', isDealSaved);
      if (isDealSaved) {
        console.log('💾 Deal already saved, skipping');
        return state; // Don't add duplicate
      }
      newState = {
        ...state,
        savedDeals: [...state.savedDeals, action.payload],
      };
      console.log('💾 New saved deals state:', newState.savedDeals);
      break;
    case 'REMOVE_SAVED_DEAL':
      console.log('🗑️ REMOVE_SAVED_DEAL action received:', action.payload);
      console.log('🗑️ Current saved deals before removal:', state.savedDeals);
      newState = {
        ...state,
        savedDeals: state.savedDeals.filter((deal) => deal.offer.id !== action.payload),
      };
      console.log('🗑️ Saved deals after removal:', newState.savedDeals);
      break;
    case 'UPDATE_PREFERENCES':
      newState = {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload },
      };
      break;
    case 'LOAD_PERSISTED_DATA':
      return { ...state, ...action.payload };
    case 'CLEAR_HISTORY':
      newState = {
        ...state,
        searchHistory: [],
      };
      break;
    case 'CLEAR_SAVED_DEALS':
      newState = {
        ...state,
        savedDeals: [],
      };
      break;
    default:
      return state;
  }

  // Save to localStorage after state change
  saveToStorage(newState);
  return newState;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = loadFromStorage();
    if (Object.keys(persistedData).length > 0) {
      dispatch({ type: 'LOAD_PERSISTED_DATA', payload: persistedData as AppState });
    }
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);