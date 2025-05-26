/**
 * Custom Jest Test Sequencer for omniverse.AI
 * Ensures tests run in optimal order for voice shopping platform
 */

const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Sort tests by priority: unit tests first, then integration, then e2e
    const testOrder = [
      'utils',
      'services', 
      'hooks',
      'components',
      'pages',
      'integration',
      'e2e'
    ];
    
    return tests.sort((testA, testB) => {
      const orderA = this.getTestOrder(testA.path);
      const orderB = this.getTestOrder(testB.path);
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If same order, sort alphabetically
      return testA.path.localeCompare(testB.path);
    });
  }
  
  getTestOrder(testPath) {
    if (testPath.includes('/utils/')) return 0;
    if (testPath.includes('/services/')) return 1;
    if (testPath.includes('/hooks/')) return 2;
    if (testPath.includes('/components/')) return 3;
    if (testPath.includes('/pages/')) return 4;
    if (testPath.includes('integration')) return 5;
    if (testPath.includes('e2e')) return 6;
    return 7; // Default order for other tests
  }
}

module.exports = CustomSequencer;
