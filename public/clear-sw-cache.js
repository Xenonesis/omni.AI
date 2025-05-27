/**
 * Service Worker Cache Cleaner
 * Run this in browser console to clear all service worker caches
 */

async function clearServiceWorkerCaches() {
  console.log('🧹 Clearing Service Worker caches...');
  
  try {
    // Get all cache names
    const cacheNames = await caches.keys();
    console.log('📦 Found caches:', cacheNames);
    
    // Delete all caches
    const deletePromises = cacheNames.map(cacheName => {
      console.log(`🗑️ Deleting cache: ${cacheName}`);
      return caches.delete(cacheName);
    });
    
    await Promise.all(deletePromises);
    console.log('✅ All caches cleared successfully');
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('🔄 Unregistering service worker...');
        await registration.unregister();
      }
      console.log('✅ Service worker unregistered');
    }
    
    console.log('🎉 Cache cleanup complete! Please refresh the page.');
    
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
  console.log('🚀 Service Worker Cache Cleaner loaded');
  console.log('💡 Run clearServiceWorkerCaches() to clear all caches');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearServiceWorkerCaches };
}
