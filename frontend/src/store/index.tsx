import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { User, HealthRecord, Consent } from '../types';

// State interfaces
interface AppState {
  user: User | null;
  healthRecords: HealthRecord[];
  consents: Consent[];
  loading: boolean;
  error: string | null;
}

// Action types
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_HEALTH_RECORDS'; payload: HealthRecord[] }
  | { type: 'ADD_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'UPDATE_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'SET_CONSENTS'; payload: Consent[] }
  | { type: 'UPDATE_CONSENT'; payload: Consent }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AppState = {
  user: null,
  healthRecords: [],
  consents: [],
  loading: false,
  error: null,
};

// Create context
const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_HEALTH_RECORDS':
      return {
        ...state,
        healthRecords: action.payload,
      };
    case 'ADD_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: [...state.healthRecords, action.payload],
      };
    case 'UPDATE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.map((record) =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'SET_CONSENTS':
      return {
        ...state,
        consents: action.payload,
      };
    case 'UPDATE_CONSENT':
      return {
        ...state,
        consents: state.consents.map((consent) =>
          consent.id === action.payload.id ? action.payload : consent
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hooks for accessing store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Specialized hooks for specific state slices
export const useUser = () => {
  const { state } = useStore();
  return state.user;
};

export const useHealthRecords = () => {
  const { state } = useStore();
  return state.healthRecords;
};

export const useConsents = () => {
  const { state } = useStore();
  return state.consents;
};

export const useLoading = () => {
  const { state } = useStore();
  return state.loading;
};

export const useError = () => {
  const { state } = useStore();
  return state.error;
};
