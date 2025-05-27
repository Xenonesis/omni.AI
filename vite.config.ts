import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        // Enable React Fast Refresh for better development experience
        fastRefresh: true,
        // Optimize JSX runtime
        jsxRuntime: "automatic",
      }),
    ],
    optimizeDeps: {
      exclude: ["lucide-react"],
      include: [
        "framer-motion",
        "react",
        "react-dom",
        "react-router-dom",
        "react/jsx-runtime",
        "react-dom/client",
      ],
      // Force pre-bundling of these dependencies
      force: true,
    },
    define: {
      // Make environment variables available to the app
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENVIRONMENT || mode),
      // Define global constants for better tree-shaking
      __DEV__: JSON.stringify(mode === "development"),
      __PROD__: JSON.stringify(mode === "production"),
    },
    build: {
      rollupOptions: {
        output: {
          // Enhanced manual chunking for better caching
          manualChunks: (id) => {
            // Vendor chunk for core React libraries
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router")
              ) {
                return "vendor-react";
              }
              if (id.includes("framer-motion")) {
                return "vendor-animations";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              if (id.includes("recharts") || id.includes("d3-")) {
                return "vendor-charts";
              }
              // Group other vendor libraries
              return "vendor-utils";
            }

            // App chunks based on functionality
            if (id.includes("/components/voice/")) {
              return "chunk-voice";
            }
            if (id.includes("/components/marketplace/")) {
              return "chunk-marketplace";
            }
            if (id.includes("/components/chat/")) {
              return "chunk-chat";
            }
            if (id.includes("/pages/")) {
              return "chunk-pages";
            }
            if (id.includes("/services/")) {
              return "chunk-services";
            }
          },
          // Optimize chunk file names for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split("/").pop()
              : "chunk";
            return `assets/[name]-[hash].js`;
          },
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
        // External dependencies that should not be bundled
        external: (id) => {
          // Keep external CDN resources external
          return (
            id.includes("backend.omnidim.io") ||
            id.includes("youtube.com") ||
            id.includes("web-vitals")
          );
        },
      },
      chunkSizeWarningLimit: 800, // Reduced for better performance
      sourcemap: mode === "development", // Only in development
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: true,
          pure_funcs:
            mode === "production"
              ? ["console.log", "console.info", "console.debug"]
              : [],
          // Remove unused code
          dead_code: true,
          // Optimize conditionals
          conditionals: true,
          // Optimize comparisons
          comparisons: true,
          // Optimize sequences
          sequences: true,
          // Optimize properties
          properties: true,
        },
        mangle: {
          safari10: true,
          // Keep function names for better debugging in development
          keep_fnames: mode === "development",
        },
        format: {
          // Remove comments in production
          comments: mode === "development",
        },
      },
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
      cssCodeSplit: true,
      assetsInlineLimit: 2048, // Reduced for better caching
      // Enable CSS minification
      cssMinify: true,
      // Preload module dependencies
      modulePreload: {
        polyfill: true,
      },
      // Report compressed size
      reportCompressedSize: true,
    },
    server: {
      hmr: {
        overlay: false,
        port: 24678, // Custom HMR port
      },
      proxy: {
        // Proxy API requests to the local server in development
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          timeout: 10000,
        },
      },
      // Enable compression in development
      middlewareMode: false,
    },
    preview: {
      port: 4173,
      host: true,
      // Enable compression for preview
      cors: true,
    },
    // Performance optimizations
    esbuild: {
      // Drop console logs in production
      drop: mode === "production" ? ["console", "debugger"] : [],
      // Optimize for size
      legalComments: "none",
    },
    // CSS optimization
    css: {
      devSourcemap: mode === "development",
      preprocessorOptions: {
        // Add any CSS preprocessor options here
      },
    },
  };
});
