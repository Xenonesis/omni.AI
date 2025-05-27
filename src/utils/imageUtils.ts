/**
 * Image utility functions for reliable image loading
 */

// Fallback image URLs in order of preference
const FALLBACK_IMAGES = [
  'https://picsum.photos/400/300?random=',
  'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Product+',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjFmNWY5Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+'
];

/**
 * Generate a reliable image URL with fallbacks
 */
export const generateImageUrl = (index: number = 1): string => {
  return `https://picsum.photos/400/300?random=${index}`;
};

/**
 * Generate fallback image URL
 */
export const generateFallbackImageUrl = (index: number = 1): string => {
  return `https://via.placeholder.com/400x300/e2e8f0/64748b?text=Product+${index}`;
};

/**
 * Generate SVG placeholder as base64
 */
export const generateSVGPlaceholder = (text: string = 'Product Image'): string => {
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f1f5f9"/>
      <text x="200" y="150" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="16">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Test if an image URL is accessible
 */
export const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Get the best available image URL with fallbacks
 */
export const getBestImageUrl = async (preferredUrl: string, fallbackIndex: number = 1): Promise<string> => {
  // Test the preferred URL first
  const isPreferredWorking = await testImageUrl(preferredUrl);
  if (isPreferredWorking) {
    return preferredUrl;
  }

  // Try fallback URLs
  for (let i = 0; i < FALLBACK_IMAGES.length - 1; i++) {
    const fallbackUrl = FALLBACK_IMAGES[i] + fallbackIndex;
    const isWorking = await testImageUrl(fallbackUrl);
    if (isWorking) {
      return fallbackUrl;
    }
  }

  // Return SVG placeholder as last resort
  return FALLBACK_IMAGES[FALLBACK_IMAGES.length - 1];
};

/**
 * Preload critical images
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Generate optimized image URLs for different screen sizes
 */
export const generateResponsiveImageUrls = (baseUrl: string) => {
  return {
    small: baseUrl.replace('400/300', '200/150'),
    medium: baseUrl,
    large: baseUrl.replace('400/300', '800/600'),
    webp: baseUrl + '&format=webp',
    avif: baseUrl + '&format=avif'
  };
};
