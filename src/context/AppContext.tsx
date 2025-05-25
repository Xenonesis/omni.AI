import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, UserPreferences, Recommendation } from '../types';

type AppAction =
  | { type: 'ADD_SEARCH_HISTORY'; payload: { query: string; product?: any; recommendations?: Recommendation[] } }
  | { type: 'SAVE_DEAL'; payload: Recommendation }
  | { type: 'REMOVE_SAVED_DEAL'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: UserPreferences };

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

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_SEARCH_HISTORY':
      return {
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
    case 'SAVE_DEAL':
      return {
        ...state,
        savedDeals: [...state.savedDeals, action.payload],
      };
    case 'REMOVE_SAVED_DEAL':
      return {
        ...state,
        savedDeals: state.savedDeals.filter((deal) => deal.offer.id !== action.payload),
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload },
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);