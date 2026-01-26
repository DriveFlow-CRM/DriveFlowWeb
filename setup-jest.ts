/**
 * Jest Setup File
 * This file runs before each test file
 */
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock ResizeObserver
(globalThis as any).ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Suppress console errors during tests (optional, comment out for debugging)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn()
// };
