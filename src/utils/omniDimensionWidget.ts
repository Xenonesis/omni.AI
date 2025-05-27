/**
 * Utility functions for interacting with the OmniDimension web widget
 */

export interface OmniDimensionWidget {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen?: () => boolean;
}

/**
 * Attempts to open the OmniDimension chat widget using various methods
 */
export const openOmniDimensionWidget = (): boolean => {
  try {
    // Method 1: Check for global OmniDimensionWidget object
    if (
      window.OmniDimensionWidget &&
      typeof window.OmniDimensionWidget.open === "function"
    ) {
      console.log("🤖 Opening OmniDimension widget via global object");
      window.OmniDimensionWidget.open();
      return true;
    }

    // Method 2: Check for omnidim global object
    if (window.omnidim && typeof window.omnidim.open === "function") {
      console.log("🤖 Opening OmniDimension widget via omnidim object");
      window.omnidim.open();
      return true;
    }

    // Method 3: Try to find widget button by common selectors
    const selectors = [
      "[data-omnidim-widget]",
      ".omnidim-widget-button",
      "#omnidim-widget-button",
      '[id*="omnidim"]',
      '[class*="omnidim"]',
      '[data-widget="omnidim"]',
      ".chat-widget-button",
      "#chat-widget-button",
      'iframe[src*="omnidim"]',
      "[data-widget-id]",
      ".widget-launcher",
      "#widget-launcher",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && typeof element.click === "function") {
        console.log(
          `🤖 Opening OmniDimension widget via selector: ${selector}`
        );
        element.click();
        return true;
      }
    }

    // Method 4: Try to trigger widget via custom events
    const event = new CustomEvent("omnidim:open", { bubbles: true });
    document.dispatchEvent(event);
    console.log("🤖 Dispatched omnidim:open event");

    // Method 5: Check for iframe-based widget
    const iframe = document.querySelector(
      'iframe[src*="omnidim"]'
    ) as HTMLIFrameElement;
    if (iframe) {
      console.log("🤖 Found OmniDimension iframe, attempting to show");
      iframe.style.display = "block";
      iframe.style.visibility = "visible";
      return true;
    }

    console.warn("🤖 OmniDimension widget not found or not loaded yet");
    return false;
  } catch (error) {
    console.error("🤖 Error opening OmniDimension widget:", error);
    return false;
  }
};

/**
 * Checks if the OmniDimension widget is available without trying to open it
 */
export const isOmniDimensionWidgetAvailable = (): boolean => {
  // Check for global objects
  if (window.OmniDimensionWidget || window.omnidim) {
    return true;
  }

  // Check for widget elements
  const widgetElements = document.querySelectorAll(
    '[data-omnidim-widget], .omnidim-widget-button, #omnidim-widget-button, [id*="omnidim"], [class*="omnidim"], iframe[src*="omnidim"]'
  );

  if (widgetElements.length > 0) {
    return true;
  }

  // Check for script element
  const scriptElement = document.querySelector(
    '#omnidimension-web-widget, #omniverse-web-widget, script[src*="web_widget.js"]'
  );
  return !!scriptElement;
};

/**
 * Waits for the OmniDimension widget to load
 */
export const waitForOmniDimensionWidget = (
  maxWaitTime = 10000
): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkWidget = () => {
      if (isOmniDimensionWidgetAvailable()) {
        console.log("🤖 OmniDimension widget is now available");
        resolve(true);
        return;
      }

      if (Date.now() - startTime > maxWaitTime) {
        console.warn("🤖 Timeout waiting for OmniDimension widget");
        resolve(false);
        return;
      }

      setTimeout(checkWidget, 500);
    };

    checkWidget();
  });
};

/**
 * Initializes OmniDimension widget detection and setup
 */
export const initializeOmniDimensionWidget = () => {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupWidgetDetection();
    });
  } else {
    setupWidgetDetection();
  }
};

const setupWidgetDetection = () => {
  // Check if widget script is loaded
  const widgetScript = document.querySelector(
    "#omniverse-web-widget, #omnidimension-web-widget"
  );
  if (widgetScript) {
    console.log("🤖 OmniDimension widget script found");
  }

  // Listen for widget load events
  window.addEventListener("omnidim:loaded", () => {
    console.log("🤖 OmniDimension widget loaded");
  });

  // Set up mutation observer to detect widget elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (
            element.id?.includes("omnidim") ||
            element.className?.includes("omnidim") ||
            (element.tagName === "IFRAME" &&
              element.getAttribute("src")?.includes("omnidim"))
          ) {
            console.log("🤖 OmniDimension widget element detected:", element);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Clean up observer after 30 seconds
  setTimeout(() => {
    observer.disconnect();
  }, 30000);
};

// Auto-initialize when module is imported
initializeOmniDimensionWidget();
