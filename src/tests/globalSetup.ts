/**
 * Global Jest Setup for omniverse.AI
 */

export default async function globalSetup() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.VITE_API_URL = 'http://localhost:3001';
  
  console.log('🧪 Global test setup completed');
}
