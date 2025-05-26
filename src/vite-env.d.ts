/// <reference types="vite/client" />

// OmniDimension Widget Types
declare global {
  interface Window {
    OmniDimensionWidget?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
    omnidim?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  }
}
