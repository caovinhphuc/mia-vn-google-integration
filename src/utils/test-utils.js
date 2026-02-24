/**
 * Test Utilities
 * Helper functions for testing React components with Redux, Router, and other providers
 */

import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { store } from "../store/store";

// Setup matchMedia before Ant Design components are used
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: false,
      media: query || "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

/**
 * Render component with Redux Provider
 */
export const renderWithRedux = (
  ui,
  { initialState = {}, store: customStore = store, ...renderOptions } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={customStore}>
      <ConfigProvider locale={viVN} componentSize="middle">
        {children}
      </ConfigProvider>
    </Provider>
  );

  return {
    store: customStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Render component with Router
 */
export const renderWithRouter = (
  ui,
  { route = "/", initialEntries = [route], ...renderOptions } = {}
) => {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <ConfigProvider locale={viVN} componentSize="middle">
        {children}
      </ConfigProvider>
    </MemoryRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Render component with Redux Provider and Router
 */
export const renderWithProviders = (
  ui,
  {
    route = "/",
    initialEntries = [route],
    initialState = {},
    store: customStore,
    ...renderOptions
  } = {}
) => {
  // Create store with initialState if provided and no custom store
  let testStore = customStore;
  if (!testStore && Object.keys(initialState).length > 0) {
    testStore = createMockStore(initialState);
  } else if (!testStore) {
    testStore = store;
  }

  const Wrapper = ({ children }) => (
    <Provider store={testStore}>
      <MemoryRouter initialEntries={initialEntries}>
        <ConfigProvider locale={viVN} componentSize="middle">
          {children}
        </ConfigProvider>
      </MemoryRouter>
    </Provider>
  );

  return {
    store: testStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Render component with BrowserRouter (for integration tests)
 */
export const renderWithBrowserRouter = (ui, { route = "/", ...renderOptions } = {}) => {
  window.history.pushState({}, "Test page", route);

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <Provider store={store}>
        <ConfigProvider locale={viVN} componentSize="middle">
          {children}
        </ConfigProvider>
      </Provider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Create mock store for testing
 */
export const createMockStore = (initialState = {}) => {
  let state = {
    auth: {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      sessionId: null,
      ...initialState.auth,
    },
    sheets: initialState.sheets || {},
    drive: initialState.drive || {},
    dashboard: initialState.dashboard || {},
    alerts: initialState.alerts || {},
  };

  const listeners = [];

  const mockStore = {
    getState: () => state,

    dispatch: jest.fn((action) => {
      // thunk
      if (typeof action === "function") {
        return action(mockStore.dispatch, mockStore.getState);
      }

      // (optional) allow tests to mutate state via a special action
      if (action && action.type === "__SET_STATE__") {
        state = { ...state, ...action.payload };
      }

      listeners.forEach((l) => l());
      return action;
    }),

    subscribe: jest.fn((listener) => {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx > -1) listeners.splice(idx, 1);
      };
    }),

    replaceReducer: jest.fn(),
  };

  return mockStore;
};

/**
 * Wait for async operations to complete
 */
export const waitForLoadingToFinish = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null),
  };
};

/**
 * Setup localStorage mock
 */
export const setupLocalStorageMock = () => {
  const localStorageMock = mockLocalStorage();
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
  return localStorageMock;
};

/**
 * Mock window.location
 */
export const mockWindowLocation = (url) => {
  delete window.location;
  window.location = new URL(url);
  Object.defineProperty(window, "location", {
    value: window.location,
    writable: true,
  });
};

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role: "user",
  ...overrides,
});

/**
 * Create mock auth state
 */
export const createMockAuthState = (overrides = {}) => ({
  isAuthenticated: true,
  user: createMockUser(),
  loading: false,
  error: null,
  serviceAccount: {
    email: "service@example.com",
    projectId: "test-project",
    isConfigured: true,
  },
  ...overrides,
});

/**
 * Re-export everything from @testing-library/react
 */
export * from "@testing-library/react";
