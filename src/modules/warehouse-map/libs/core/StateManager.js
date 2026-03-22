/**
 * StateManager - Centralized state management for warehouse operations
 * Uses React Context and Reducers for state management
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import logger from "../../../../utils/logger";

// Action Types
export const WAREHOUSE_ACTIONS = {
  // Location actions
  SET_LOCATIONS: 'SET_LOCATIONS',
  ADD_LOCATION: 'ADD_LOCATION',
  UPDATE_LOCATION: 'UPDATE_LOCATION',
  DELETE_LOCATION: 'DELETE_LOCATION',

  // Inventory actions
  SET_INVENTORY: 'SET_INVENTORY',
  ADD_INVENTORY: 'ADD_INVENTORY',
  UPDATE_INVENTORY: 'UPDATE_INVENTORY',
  REMOVE_INVENTORY: 'REMOVE_INVENTORY',
  MOVE_INVENTORY: 'MOVE_INVENTORY',

  // Zone actions
  SET_ZONES: 'SET_ZONES',
  ADD_ZONE: 'ADD_ZONE',
  UPDATE_ZONE: 'UPDATE_ZONE',
  DELETE_ZONE: 'DELETE_ZONE',

  // UI state actions
  SET_SELECTED_LOCATION: 'SET_SELECTED_LOCATION',
  SET_SELECTED_ZONE: 'SET_SELECTED_ZONE',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',

  // Modal actions
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SET_MODAL_DATA: 'SET_MODAL_DATA',

  // Loading and error states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Statistics
  UPDATE_STATISTICS: 'UPDATE_STATISTICS',
};

// Initial State
const initialState = {
  // Data
  locations: new Map(),
  inventory: new Map(),
  zones: new Map(),
  statistics: {
    totalLocations: 0,
    occupiedLocations: 0,
    totalCapacity: 0,
    currentStock: 0,
    utilizationRate: 0,
    recentTransactions: []
  },

  // UI State
  selectedLocation: null,
  selectedZone: null,
  viewMode: 'grid', // 'grid', 'list', 'map'
  filters: {
    status: 'all', // 'all', 'occupied', 'empty', 'reserved'
    zone: 'all',
    capacity: 'all',
    dateRange: null
  },
  searchQuery: '',

  // Modal State
  modal: {
    isOpen: false,
    type: null, // 'location', 'inventory', 'zone', 'report', etc.
    data: null,
    mode: 'create' // 'create', 'edit', 'view'
  },

  // Loading and Error States
  loading: {
    locations: false,
    inventory: false,
    zones: false,
    statistics: false,
    general: false
  },
  error: {
    message: null,
    type: null,
    details: null
  }
};

// Reducer
function warehouseReducer(state, action) {
  switch (action.type) {
    // Location actions
    case WAREHOUSE_ACTIONS.SET_LOCATIONS:
      return {
        ...state,
        locations: new Map(action.payload.map(loc => [loc.id, loc]))
      };

    case WAREHOUSE_ACTIONS.ADD_LOCATION:
      return {
        ...state,
        locations: new Map(state.locations.set(action.payload.id, action.payload))
      };

    case WAREHOUSE_ACTIONS.UPDATE_LOCATION:
      if (state.locations.has(action.payload.id)) {
        const updatedLocation = { ...state.locations.get(action.payload.id), ...action.payload };
        return {
          ...state,
          locations: new Map(state.locations.set(action.payload.id, updatedLocation))
        };
      }
      return state;

    case WAREHOUSE_ACTIONS.DELETE_LOCATION:
      const newLocations = new Map(state.locations);
      newLocations.delete(action.payload);
      return {
        ...state,
        locations: newLocations,
        selectedLocation: state.selectedLocation?.id === action.payload ? null : state.selectedLocation
      };

    // Inventory actions
    case WAREHOUSE_ACTIONS.SET_INVENTORY:
      return {
        ...state,
        inventory: new Map(action.payload.map(item => [item.id, item]))
      };

    case WAREHOUSE_ACTIONS.ADD_INVENTORY:
      return {
        ...state,
        inventory: new Map(state.inventory.set(action.payload.id, action.payload))
      };

    // Zone actions
    case WAREHOUSE_ACTIONS.SET_ZONES:
      return {
        ...state,
        zones: new Map(action.payload.map(zone => [zone.id, zone]))
      };

    // UI state actions
    case WAREHOUSE_ACTIONS.SET_SELECTED_LOCATION:
      return {
        ...state,
        selectedLocation: action.payload
      };

    case WAREHOUSE_ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload
      };

    case WAREHOUSE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case WAREHOUSE_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };

    // Modal actions
    case WAREHOUSE_ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modal: {
          isOpen: true,
          type: action.payload.type,
          data: action.payload.data || null,
          mode: action.payload.mode || 'create'
        }
      };

    case WAREHOUSE_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modal: {
          ...state.modal,
          isOpen: false,
          data: null
        }
      };

    // Loading states
    case WAREHOUSE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, ...action.payload }
      };

    // Error states
    case WAREHOUSE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: {
          message: action.payload.message,
          type: action.payload.type || 'general',
          details: action.payload.details || null
        }
      };

    case WAREHOUSE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: { message: null, type: null, details: null }
      };

    // Statistics
    case WAREHOUSE_ACTIONS.UPDATE_STATISTICS:
      return {
        ...state,
        statistics: { ...state.statistics, ...action.payload }
      };

    default:
      logger.warn('[StateManager] Unknown action type:', action.type);
      return state;
  }
}

// Context
const WarehouseContext = createContext();

// Provider Component
export function WarehouseStateProvider({ children, initialData = {} }) {
  const [state, dispatch] = useReducer(warehouseReducer, {
    ...initialState,
    ...initialData
  });

  // Action creators
  const actions = {
    // Location actions
    setLocations: useCallback((locations) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_LOCATIONS, payload: locations });
    }, []),

    addLocation: useCallback((location) => {
      dispatch({ type: WAREHOUSE_ACTIONS.ADD_LOCATION, payload: location });
    }, []),

    updateLocation: useCallback((locationUpdate) => {
      dispatch({ type: WAREHOUSE_ACTIONS.UPDATE_LOCATION, payload: locationUpdate });
    }, []),

    deleteLocation: useCallback((locationId) => {
      dispatch({ type: WAREHOUSE_ACTIONS.DELETE_LOCATION, payload: locationId });
    }, []),

    // UI actions
    setSelectedLocation: useCallback((location) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_SELECTED_LOCATION, payload: location });
    }, []),

    setViewMode: useCallback((mode) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_VIEW_MODE, payload: mode });
    }, []),

    setFilters: useCallback((filters) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_FILTERS, payload: filters });
    }, []),

    setSearchQuery: useCallback((query) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []),

    // Modal actions
    openModal: useCallback((type, data = null, mode = 'create') => {
      dispatch({
        type: WAREHOUSE_ACTIONS.OPEN_MODAL,
        payload: { type, data, mode }
      });
    }, []),

    closeModal: useCallback(() => {
      dispatch({ type: WAREHOUSE_ACTIONS.CLOSE_MODAL });
    }, []),

    // Loading and error actions
    setLoading: useCallback((loadingStates) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_LOADING, payload: loadingStates });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: WAREHOUSE_ACTIONS.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: WAREHOUSE_ACTIONS.CLEAR_ERROR });
    }, []),

    // Statistics
    updateStatistics: useCallback((stats) => {
      dispatch({ type: WAREHOUSE_ACTIONS.UPDATE_STATISTICS, payload: stats });
    }, [])
  };

  const value = {
    state,
    dispatch,
    actions
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
}

// Hook to use warehouse state
export function useWarehouseState() {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouseState must be used within a WarehouseStateProvider');
  }
  return context;
}

// Selectors
export const selectors = {
  getLocationById: (state, id) => state.locations.get(id),
  getInventoryByLocationId: (state, locationId) =>
    Array.from(state.inventory.values()).filter(item => item.locationId === locationId),
  getFilteredLocations: (state) => {
    let locations = Array.from(state.locations.values());

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      locations = locations.filter(loc =>
        loc.name?.toLowerCase().includes(query) ||
        loc.description?.toLowerCase().includes(query) ||
        loc.code?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (state.filters.status !== 'all') {
      locations = locations.filter(loc => loc.status === state.filters.status);
    }

    if (state.filters.zone !== 'all') {
      locations = locations.filter(loc => loc.zoneId === state.filters.zone);
    }

    return locations;
  },
  getStatistics: (state) => state.statistics,
  getLoadingState: (state, key) => state.loading[key] || false,
  getError: (state) => state.error
};

export default WarehouseStateProvider;
