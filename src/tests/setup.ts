/**
 * 🧪 Jest Test Setup for omniverse.AI
 * 
 * Global test configuration and mocks for voice shopping platform
 */

import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
  grammars: null,
  onstart: null,
  onend: null,
  onerror: null,
  onresult: null,
  onnomatch: null,
  onsoundstart: null,
  onsoundend: null,
  onspeechstart: null,
  onspeechend: null,
  onaudiostart: null,
  onaudioend: null
};

const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
  onvoiceschanged: null
};

// Mock global objects
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn(() => mockSpeechRecognition)
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn(() => mockSpeechRecognition)
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis
});

// Mock MediaDevices API
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => []
    })),
    enumerateDevices: jest.fn(() => Promise.resolve([]))
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
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
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn()
});

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
  writable: true,
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      success: true,
      products: [],
      total: 0
    }),
    text: () => Promise.resolve(''),
    headers: new Headers()
  })
) as jest.Mock;

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3001';
process.env.VITE_OMNIDIM_SECRET_KEY = 'test-secret-key';
process.env.VITE_OMNIDIM_API_KEY = 'test-api-key';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn()
  }),
  useInView: () => true,
  useMotionValue: (initial: any) => ({ get: () => initial, set: jest.fn() }),
  useSpring: (value: any) => value,
  useTransform: (value: any, input: any, output: any) => value
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  MicOff: () => <div data-testid="mic-off-icon">MicOff</div>,
  ShoppingCart: () => <div data-testid="cart-icon">Cart</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up-icon">ChevronUp</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Volume2: () => <div data-testid="volume-icon">Volume</div>,
  VolumeX: () => <div data-testid="volume-off-icon">VolumeOff</div>
}));

// Global test utilities
global.testUtils = {
  // Mock voice recognition result
  mockVoiceResult: (transcript: string) => ({
    results: [{
      0: { transcript },
      isFinal: true,
      length: 1
    }],
    resultIndex: 0
  }),
  
  // Mock product data
  mockProduct: {
    id: 'test-product-1',
    name: 'Test Product',
    category: 'electronics',
    brand: 'Test Brand',
    price: 9999,
    rating: 4.5,
    reviews: 100,
    image: 'https://example.com/image.jpg',
    description: 'Test product description',
    seller: 'Test Seller',
    inStock: true,
    fastDelivery: true,
    tags: ['test', 'product']
  },
  
  // Mock API response
  mockApiResponse: (data: any) => ({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  }),
  
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Console error suppression for known issues
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: React.createFactory() is deprecated'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Global test timeout
jest.setTimeout(10000);
