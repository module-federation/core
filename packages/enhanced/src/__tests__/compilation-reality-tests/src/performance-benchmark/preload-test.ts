/**
 * Preloading Performance Test - Testing the preload claims from examples
 */

import { ModuleFederation } from '@module-federation/runtime-core';

async function testPreloadingPerformance() {
  console.log('Testing preloading performance claims...\n');
  
  // Issue: The example assumes these methods exist on ModuleFederation
  const federationWithPreload = new ModuleFederation({
    name: 'preload-test',
    remotes: [{
      name: 'remote1',
      entry: 'https://example.com/remote1/remoteEntry.js'
    }, {
      name: 'remote2',
      entry: 'https://example.com/remote2/remoteEntry.js'
    }, {
      name: 'remote3',
      entry: 'https://example.com/remote3/remoteEntry.js'
    }]
  } as any);
  
  // Test if preloadRemote method exists
  if ('preloadRemote' in federationWithPreload) {
    console.log('preloadRemote method exists');
    
    try {
      // Issue: The preloadRemote signature might be different
      await (federationWithPreload as any).preloadRemote([
        { nameOrAlias: 'remote1' },
        { nameOrAlias: 'remote2' },
        { nameOrAlias: 'remote3' }
      ]);
      
      console.log('Preload completed successfully');
    } catch (error) {
      console.error('Preload failed:', error);
    }
  } else {
    console.error('preloadRemote method not found on federation instance');
  }
  
  // Test loadRemote method
  if ('loadRemote' in federationWithPreload) {
    console.log('loadRemote method exists');
    
    try {
      const module = await (federationWithPreload as any).loadRemote('remote1/Module');
      console.log('Module loaded:', module);
    } catch (error) {
      console.error('loadRemote failed:', error);
    }
  } else {
    console.error('loadRemote method not found on federation instance');
  }
  
  // Test module cache
  if ('moduleCache' in federationWithPreload) {
    const cache = (federationWithPreload as any).moduleCache;
    console.log('Module cache type:', typeof cache);
    
    if (cache && 'size' in cache) {
      console.log('Module cache size:', cache.size);
    }
    
    if (cache && 'delete' in cache) {
      console.log('Module cache has delete method');
    }
  } else {
    console.error('moduleCache not found on federation instance');
  }
}

// Test cache effectiveness
async function testCachePerformance() {
  console.log('\nTesting cache performance...');
  
  const federation = new ModuleFederation({
    name: 'cache-test',
    remotes: [{ name: 'app', entry: 'https://example.com/remoteEntry.js' }]
  } as any);
  
  const moduleIds = ['app/Module1', 'app/Module2', 'app/Module3'];
  
  // First load (cold)
  console.log('Cold load test...');
  for (const moduleId of moduleIds) {
    const start = Date.now();
    try {
      await (federation as any).loadRemote(moduleId);
      const duration = Date.now() - start;
      console.log(`  ${moduleId}: ${duration}ms`);
    } catch (error) {
      console.log(`  ${moduleId}: Failed`);
    }
  }
  
  // Second load (warm - should use cache)
  console.log('\nWarm load test (from cache)...');
  for (const moduleId of moduleIds) {
    const start = Date.now();
    try {
      await (federation as any).loadRemote(moduleId);
      const duration = Date.now() - start;
      console.log(`  ${moduleId}: ${duration}ms`);
    } catch (error) {
      console.log(`  ${moduleId}: Failed`);
    }
  }
}

if (require.main === module) {
  (async () => {
    await testPreloadingPerformance();
    await testCachePerformance();
  })().catch(console.error);
}

export { testPreloadingPerformance, testCachePerformance };