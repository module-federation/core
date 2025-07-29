/**
 * Version Conflict Tests - Testing how Module Federation handles version conflicts in production
 * Includes incompatible dependencies, breaking changes, and circular dependencies
 */

const { ModuleFederation } = require('@module-federation/runtime-core');

// Version conflict simulator
class VersionConflictSimulator {
  constructor() {
    this.conflicts = [];
    this.resolutions = [];
    this.circularDeps = new Map();
  }

  addConflict(pkgName, requestedVersion, availableVersions, severity = 'MEDIUM') {
    this.conflicts.push({
      pkgName,
      requestedVersion,
      availableVersions,
      severity,
      timestamp: Date.now()
    });
  }

  addResolution(pkgName, requestedVersion, resolvedVersion, strategy) {
    this.resolutions.push({
      pkgName,
      requestedVersion,
      resolvedVersion,
      strategy,
      timestamp: Date.now()
    });
  }

  detectCircularDependency(from, to) {
    if (!this.circularDeps.has(from)) {
      this.circularDeps.set(from, new Set());
    }
    
    const deps = this.circularDeps.get(from);
    if (deps.has(to)) {
      return true; // Already tracking this circular dep
    }
    
    // Check if 'to' depends on 'from' (circular)
    if (this.circularDeps.has(to) && this.circularDeps.get(to).has(from)) {
      return true;
    }
    
    deps.add(to);
    return false;
  }

  generateReport() {
    return {
      totalConflicts: this.conflicts.length,
      conflictsBySeverity: this.conflicts.reduce((acc, c) => {
        acc[c.severity] = (acc[c.severity] || 0) + 1;
        return acc;
      }, {}),
      resolutionStrategies: this.resolutions.reduce((acc, r) => {
        acc[r.strategy] = (acc[r.strategy] || 0) + 1;
        return acc;
      }, {}),
      circularDependencies: Array.from(this.circularDeps.entries()).map(([from, deps]) => ({
        from,
        dependsOn: Array.from(deps)
      }))
    };
  }
}

describe('Version Conflict Production Tests', () => {
  let conflictSim;

  beforeEach(() => {
    conflictSim = new VersionConflictSimulator();
  });

  test('BRUTAL TEST: Incompatible shared dependency versions', async () => {
    // Simulate multiple apps with conflicting React versions
    
    const versionConflictPlugin = {
      name: 'VersionConflictPlugin',
      
      beforeLoadShare(args) {
        const { pkgName, shareInfo, shared, origin } = args;
        const shareScope = origin.shareScopeMap['default'] || {};
        
        if (shareScope[pkgName]) {
          const availableVersions = Object.keys(shareScope[pkgName]);
          const requestedVersion = shareInfo?.requiredVersion || '*';
          
          // Check for version conflicts
          const compatible = availableVersions.some(version => {
            // Simplified semver check (real implementation would use semver library)
            if (requestedVersion === '*') return true;
            if (requestedVersion.startsWith('^')) {
              const major = version.split('.')[0];
              const reqMajor = requestedVersion.slice(1).split('.')[0];
              return major === reqMajor;
            }
            return version === requestedVersion;
          });
          
          if (!compatible) {
            conflictSim.addConflict(
              pkgName,
              requestedVersion,
              availableVersions,
              'HIGH'
            );
          }
        }
        
        return args;
      },
      
      afterResolve(args) {
        const { id, pkgNameOrAlias, resolved } = args;
        
        if (resolved) {
          conflictSim.addResolution(
            pkgNameOrAlias,
            args.requestedVersion || '*',
            resolved.version,
            resolved.singleton ? 'SINGLETON' : 'MULTI_VERSION'
          );
        }
        
        return args;
      }
    };

    // Create federation instance with conflicting dependencies
    const federation = new ModuleFederation({
      name: 'version-conflict-test',
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        lodash: { singleton: false, requiredVersion: '^4.17.0' },
        axios: { singleton: false, requiredVersion: '^0.27.0' }
      },
      plugins: [versionConflictPlugin]
    });

    // Populate share scope with conflicting versions
    const shareScope = federation.shareScopeMap['default'] = {};
    
    // React versions (major version conflict)
    shareScope['react'] = {
      '16.14.0': {
        get: () => Promise.resolve({ version: '16.14.0' }),
        loaded: true
      },
      '17.0.2': {
        get: () => Promise.resolve({ version: '17.0.2' }),
        loaded: true
      },
      '18.2.0': {
        get: () => Promise.resolve({ version: '18.2.0' }),
        loaded: true
      }
    };
    
    // Lodash versions (minor version differences)
    shareScope['lodash'] = {
      '4.16.0': {
        get: () => Promise.resolve({ version: '4.16.0' }),
        loaded: true
      },
      '4.17.21': {
        get: () => Promise.resolve({ version: '4.17.21' }),
        loaded: true
      },
      '4.18.0': {
        get: () => Promise.resolve({ version: '4.18.0' }),
        loaded: true
      }
    };

    // Simulate loading shared dependencies
    const sharedDeps = ['react', 'react-dom', 'lodash', 'axios'];
    
    for (const dep of sharedDeps) {
      try {
        await federation.loadShare(dep);
      } catch (error) {
        console.log(`Failed to load ${dep}:`, error.message);
      }
    }

    const report = conflictSim.generateReport();
    console.log('Version conflict test results:', report);
    
    // Expect conflicts due to React version mismatch
    expect(report.totalConflicts).toBeGreaterThan(0);
  });

  test('BRUTAL TEST: Breaking changes between versions', async () => {
    // Test handling of breaking API changes
    
    const breakingChangePlugin = {
      name: 'BreakingChangePlugin',
      breakingChanges: {
        'api-client': {
          '2.0.0': ['Removed deprecated methods', 'Changed response format'],
          '3.0.0': ['Complete API redesign', 'Async/await required']
        },
        'ui-components': {
          '2.0.0': ['CSS-in-JS migration', 'Props renamed'],
          '3.0.0': ['React 18 required', 'TypeScript only']
        }
      },
      
      onLoad(args) {
        const { id, pkgNameOrAlias } = args;
        const [pkg, version] = pkgNameOrAlias.split('@');
        
        if (this.breakingChanges[pkg] && this.breakingChanges[pkg][version]) {
          conflictSim.addConflict(
            pkg,
            version,
            Object.keys(this.breakingChanges[pkg]),
            'CRITICAL'
          );
          
          console.warn(`Breaking changes in ${pkg}@${version}:`, 
            this.breakingChanges[pkg][version]);
        }
        
        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'breaking-changes-test',
      remotes: [{
        name: 'legacy-app',
        entry: 'https://example.com/legacy/remoteEntry.js'
      }, {
        name: 'modern-app',
        entry: 'https://example.com/modern/remoteEntry.js'
      }],
      plugins: [breakingChangePlugin]
    });

    // Test loading modules with breaking changes
    const testCases = [
      { id: 'legacy-app/api-client@1.0.0', expectSuccess: true },
      { id: 'modern-app/api-client@3.0.0', expectSuccess: false },
      { id: 'legacy-app/ui-components@1.5.0', expectSuccess: true },
      { id: 'modern-app/ui-components@3.0.0', expectSuccess: false }
    ];

    for (const testCase of testCases) {
      try {
        await federation.loadRemote(testCase.id);
        if (!testCase.expectSuccess) {
          console.error(`Unexpectedly loaded ${testCase.id} despite breaking changes`);
        }
      } catch (error) {
        if (testCase.expectSuccess) {
          console.error(`Failed to load ${testCase.id}:`, error.message);
        }
      }
    }

    console.log('Breaking changes detected:', 
      conflictSim.conflicts.filter(c => c.severity === 'CRITICAL').length);
  });

  test('BRUTAL TEST: Circular dependency detection', async () => {
    // Test circular dependency scenarios
    
    const circularDepPlugin = {
      name: 'CircularDepPlugin',
      loadStack: [],
      
      beforeRequest(args) {
        const { id } = args;
        
        // Check if we're already loading this module (circular)
        if (this.loadStack.includes(id)) {
          const circular = [...this.loadStack, id];
          console.error('Circular dependency detected:', circular.join(' -> '));
          
          conflictSim.addConflict(
            id,
            'N/A',
            circular,
            'CRITICAL'
          );
          
          // Detect in simulator
          for (let i = 0; i < circular.length - 1; i++) {
            conflictSim.detectCircularDependency(circular[i], circular[i + 1]);
          }
          
          throw new Error(`Circular dependency: ${circular.join(' -> ')}`);
        }
        
        this.loadStack.push(id);
        return args;
      },
      
      onLoad(args) {
        const { id } = args;
        this.loadStack = this.loadStack.filter(item => item !== id);
        return args;
      },
      
      errorLoadRemote(args) {
        const { id } = args;
        this.loadStack = this.loadStack.filter(item => item !== id);
        return null;
      }
    };

    const federation = new ModuleFederation({
      name: 'circular-dep-test',
      remotes: [{
        name: 'app-a',
        entry: 'https://example.com/app-a/remoteEntry.js'
      }, {
        name: 'app-b',
        entry: 'https://example.com/app-b/remoteEntry.js'
      }, {
        name: 'app-c',
        entry: 'https://example.com/app-c/remoteEntry.js'
      }],
      plugins: [circularDepPlugin]
    });

    // Mock circular dependencies
    const mockLoadRemote = async (id) => {
      circularDepPlugin.beforeRequest({ id });
      
      // Simulate dependencies
      if (id === 'app-a/ComponentA') {
        await mockLoadRemote('app-b/ComponentB'); // A depends on B
      } else if (id === 'app-b/ComponentB') {
        await mockLoadRemote('app-c/ComponentC'); // B depends on C
      } else if (id === 'app-c/ComponentC') {
        await mockLoadRemote('app-a/ComponentA'); // C depends on A (circular!)
      }
      
      circularDepPlugin.onLoad({ id });
    };

    // Test circular dependency
    try {
      await mockLoadRemote('app-a/ComponentA');
    } catch (error) {
      console.log('Circular dependency caught:', error.message);
    }

    // Test self-referential dependency
    try {
      circularDepPlugin.loadStack = [];
      circularDepPlugin.beforeRequest({ id: 'app-a/Self' });
      circularDepPlugin.beforeRequest({ id: 'app-a/Self' }); // Same module again
    } catch (error) {
      console.log('Self-referential dependency caught:', error.message);
    }

    const report = conflictSim.generateReport();
    console.log('Circular dependency report:', report.circularDependencies);
    
    expect(report.circularDependencies.length).toBeGreaterThan(0);
  });

  test('BRUTAL TEST: Peer dependency conflicts', async () => {
    // Test peer dependency version conflicts
    
    const peerDepPlugin = {
      name: 'PeerDepPlugin',
      peerDependencies: {
        'plugin-a': { 'react': '^17.0.0', 'react-dom': '^17.0.0' },
        'plugin-b': { 'react': '^18.0.0', 'react-dom': '^18.0.0' },
        'theme-engine': { 'styled-components': '^5.0.0' },
        'legacy-theme': { 'styled-components': '^4.0.0' }
      },
      
      beforeLoadShare(args) {
        const { pkgName, shareInfo } = args;
        
        // Check peer dependency conflicts
        for (const [plugin, peers] of Object.entries(this.peerDependencies)) {
          if (peers[pkgName]) {
            const required = peers[pkgName];
            const provided = shareInfo?.version || 'unknown';
            
            // Simple version check
            if (!this.isVersionCompatible(required, provided)) {
              conflictSim.addConflict(
                `${plugin} -> ${pkgName}`,
                required,
                [provided],
                'HIGH'
              );
            }
          }
        }
        
        return args;
      },
      
      isVersionCompatible(required, provided) {
        if (required === provided) return true;
        if (required.startsWith('^')) {
          const reqMajor = required.slice(1).split('.')[0];
          const provMajor = provided.split('.')[0];
          return reqMajor === provMajor;
        }
        return false;
      }
    };

    const federation = new ModuleFederation({
      name: 'peer-dep-test',
      shared: {
        'react': { singleton: true, version: '17.0.2' },
        'react-dom': { singleton: true, version: '17.0.2' },
        'styled-components': { singleton: false, version: '5.3.0' }
      },
      plugins: [peerDepPlugin]
    });

    // Test loading modules with conflicting peer deps
    const modules = ['plugin-a', 'plugin-b', 'theme-engine', 'legacy-theme'];
    
    for (const module of modules) {
      try {
        // Simulate peer dep check
        const peers = peerDepPlugin.peerDependencies[module];
        if (peers) {
          for (const [peer, version] of Object.entries(peers)) {
            await federation.loadShare(peer);
          }
        }
      } catch (error) {
        console.log(`Peer dependency conflict for ${module}:`, error.message);
      }
    }

    const conflicts = conflictSim.conflicts.filter(c => c.pkgName.includes('->'));
    console.log('Peer dependency conflicts:', conflicts.length);
    
    expect(conflicts.length).toBeGreaterThan(0);
  });

  test('BRUTAL TEST: Transitive dependency conflicts', async () => {
    // Test deep transitive dependency conflicts
    
    const transitiveDepPlugin = {
      name: 'TransitiveDepPlugin',
      dependencyTree: {
        'app-shell': {
          'ui-library': '2.0.0',
          'utils': '1.5.0'
        },
        'ui-library@2.0.0': {
          'react': '18.0.0',
          'utils': '2.0.0' // Conflicts with app-shell's utils
        },
        'utils@1.5.0': {
          'lodash': '4.17.0'
        },
        'utils@2.0.0': {
          'lodash': '4.18.0' // Different lodash version
        }
      },
      
      resolveDependencies(module, visited = new Set()) {
        if (visited.has(module)) {
          return {}; // Prevent infinite recursion
        }
        visited.add(module);
        
        const deps = this.dependencyTree[module] || {};
        const resolved = { ...deps };
        
        // Recursively resolve transitive dependencies
        for (const [dep, version] of Object.entries(deps)) {
          const depKey = `${dep}@${version}`;
          const transitive = this.resolveDependencies(depKey, visited);
          
          // Check for conflicts
          for (const [transDep, transVersion] of Object.entries(transitive)) {
            if (resolved[transDep] && resolved[transDep] !== transVersion) {
              conflictSim.addConflict(
                transDep,
                resolved[transDep],
                [transVersion],
                'MEDIUM'
              );
            }
            resolved[transDep] = resolved[transDep] || transVersion;
          }
        }
        
        return resolved;
      },
      
      beforeRequest(args) {
        const { id } = args;
        const allDeps = this.resolveDependencies(id);
        
        console.log(`Transitive dependencies for ${id}:`, allDeps);
        
        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'transitive-dep-test',
      remotes: [{
        name: 'app-shell',
        entry: 'https://example.com/shell/remoteEntry.js'
      }],
      plugins: [transitiveDepPlugin]
    });

    // Test loading with transitive conflicts
    try {
      await federation.loadRemote('app-shell');
    } catch (error) {
      console.log('Transitive dependency error:', error.message);
    }

    console.log('Transitive conflicts found:', 
      conflictSim.conflicts.filter(c => c.severity === 'MEDIUM').length);
  });

  test('BRUTAL TEST: Version resolution strategies', async () => {
    // Test different version resolution strategies and their problems
    
    const resolutionPlugin = {
      name: 'ResolutionPlugin',
      strategies: ['NEWEST', 'OLDEST', 'SINGLETON', 'DUPLICATE'],
      
      resolveVersion(pkgName, versions, strategy) {
        const sorted = versions.sort((a, b) => {
          const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
          const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
          
          if (aMajor !== bMajor) return bMajor - aMajor;
          if (aMinor !== bMinor) return bMinor - aMinor;
          return bPatch - aPatch;
        });
        
        switch (strategy) {
          case 'NEWEST':
            return sorted[0];
          case 'OLDEST':
            return sorted[sorted.length - 1];
          case 'SINGLETON':
            // Force single version, may break compatibility
            conflictSim.addResolution(pkgName, 'multiple', sorted[0], 'SINGLETON');
            return sorted[0];
          case 'DUPLICATE':
            // Allow duplicates, increases bundle size
            conflictSim.addResolution(pkgName, 'multiple', 'all', 'DUPLICATE');
            return versions;
          default:
            return sorted[0];
        }
      },
      
      beforeLoadShare(args) {
        const { pkgName, shareInfo, origin } = args;
        const shareScope = origin.shareScopeMap['default'] || {};
        
        if (shareScope[pkgName]) {
          const versions = Object.keys(shareScope[pkgName]);
          
          if (versions.length > 1) {
            // Test each strategy
            for (const strategy of this.strategies) {
              const resolved = this.resolveVersion(pkgName, [...versions], strategy);
              console.log(`${strategy} strategy for ${pkgName}: ${resolved}`);
              
              // Check for potential issues
              if (strategy === 'SINGLETON' && versions.length > 2) {
                conflictSim.addConflict(
                  pkgName,
                  'multiple',
                  versions,
                  'HIGH'
                );
              }
              
              if (strategy === 'DUPLICATE') {
                const totalSize = versions.length * 100; // Assume 100KB per version
                if (totalSize > 500) {
                  console.warn(`Bundle size impact: ${totalSize}KB for ${pkgName}`);
                }
              }
            }
          }
        }
        
        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'resolution-test',
      shared: {
        'complex-lib': { singleton: false },
        'core-lib': { singleton: true },
        'util-lib': { singleton: false, eager: true }
      },
      plugins: [resolutionPlugin]
    });

    // Populate with many versions
    const libs = ['complex-lib', 'core-lib', 'util-lib'];
    federation.shareScopeMap['default'] = {};
    
    for (const lib of libs) {
      federation.shareScopeMap['default'][lib] = {};
      
      // Add many versions
      for (let major = 1; major <= 3; major++) {
        for (let minor = 0; minor <= 2; minor++) {
          for (let patch = 0; patch <= 5; patch++) {
            const version = `${major}.${minor}.${patch}`;
            federation.shareScopeMap['default'][lib][version] = {
              get: () => Promise.resolve({ version }),
              loaded: true
            };
          }
        }
      }
    }

    // Test loading with different strategies
    for (const lib of libs) {
      try {
        await federation.loadShare(lib);
      } catch (error) {
        console.log(`Resolution failed for ${lib}:`, error.message);
      }
    }

    const report = conflictSim.generateReport();
    console.log('Version resolution report:', report);
  });

  test('VERSION CONFLICT SUMMARY', () => {
    const report = conflictSim.generateReport();
    
    console.log('\nVersion Conflict Summary:');
    console.log('========================');
    console.log(`Total Conflicts: ${report.totalConflicts}`);
    console.log('\nConflicts by Severity:');
    console.log(`  CRITICAL: ${report.conflictsBySeverity.CRITICAL || 0}`);
    console.log(`  HIGH: ${report.conflictsBySeverity.HIGH || 0}`);
    console.log(`  MEDIUM: ${report.conflictsBySeverity.MEDIUM || 0}`);
    console.log(`  LOW: ${report.conflictsBySeverity.LOW || 0}`);
    
    console.log('\nResolution Strategies Used:');
    for (const [strategy, count] of Object.entries(report.resolutionStrategies)) {
      console.log(`  ${strategy}: ${count}`);
    }
    
    console.log('\nCircular Dependencies:', report.circularDependencies.length);
    
    // Version conflicts are expected in production
    expect(report.totalConflicts).toBeGreaterThan(0);
  });
});

module.exports = { VersionConflictSimulator };