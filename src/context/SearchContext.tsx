import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SearchState, Product, UserPreferences, Offer, Recommendation } from '../types';

type SearchAction =
  | { type: 'START_LISTENING' }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'START_PROCESSING' }
  | { type: 'SET_PRODUCT'; payload: Product }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_OFFERS'; payload: Offer[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: SearchState = {
  status: 'idle',
};

const SearchContext = createContext<{
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'START_LISTENING':
      return { ...state, status: 'listening', error: undefined };
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'START_PROCESSING':
      return { ...state, status: 'processing' };
    case 'SET_PRODUCT':
      return { ...state, product: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    case 'SET_OFFERS':
      return { ...state, offers: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload, status: 'results' };
    case 'SET_ERROR':
      return { ...state, error: action.payload, status: 'error' };
    case 'RESET':
      return { status: 'idle' };
    default:
      return state;
  }
};

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  return <SearchContext.Provider value={{ state, dispatch }}>{children}</SearchContext.Provider>;
};

export const useSearchContext = () => useContext(SearchContext);