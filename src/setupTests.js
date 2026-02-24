// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// Polyfill for TextEncoder/TextDecoder (required by react-router v7)
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// Mock window.matchMedia - Required for Ant Design responsive features
// Ant Design's responsiveObserver stores MediaQueryList objects and expects them to have specific properties
const createMatchMedia = (query) => {
  const mediaQueryList = {
    matches: false,
    media: query || "",
    onchange: null,
    addListener: () => {}, // deprecated but required
    removeListener: () => {}, // deprecated but required
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
  return mediaQueryList;
};

// Setup matchMedia before anything else
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: createMatchMedia,
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

const originalWarn = console.warn;

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((...args) => {
    const full = args.map((a) => String(a ?? "")).join(" ");
    if (full.includes("React Router Future Flag Warning")) return;
    originalWarn(...args);
  });
});

afterAll(() => {
  console.warn.mockRestore?.();
});
