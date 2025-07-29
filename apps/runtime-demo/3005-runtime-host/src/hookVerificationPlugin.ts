import { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';

// Track execution order and actual parameters
const executionLog: Array<{
  hook: string;
  timestamp: number;
  args: any;
  returnValue?: any;
  error?: any;
  isAsync?: boolean;
}> = [];

function logExecution(hook: string, args: any, returnValue?: any, error?: any, isAsync = false) {
  const entry = {
    hook,
    timestamp: Date.now(),
    args: JSON.stringify(args, null, 2),
    returnValue: returnValue !== undefined ? JSON.stringify(returnValue, null, 2) : undefined,
    error: error?.message || error,
    isAsync
  };
  executionLog.push(entry);
  console.log(`[HOOK-TRACE] ${hook}:`, entry);
}

// Helper to test async timing
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function (): ModuleFederationRuntimePlugin {
  console.log('[HOOK-VERIFICATION] Plugin initialized');
  
  // Log execution summary periodically
  setInterval(() => {
    if (executionLog.length > 0) {
      console.log('[HOOK-VERIFICATION] Execution Summary:', {
        totalCalls: executionLog.length,
        hooks: executionLog.map(e => ({
          hook: e.hook,
          time: e.timestamp,
          hasReturn: !!e.returnValue,
          hasError: !!e.error,
          isAsync: e.isAsync
        }))
      });
    }
  }, 5000);

  const plugin = {
    name: 'hook-verification-plugin',
    
    // Test all documented hooks
    beforeInit(args) {
      try {
        logExecution('beforeInit', args);
        console.log('[VERIFY] beforeInit arg keys:', Object.keys(args));
        console.log('[VERIFY] beforeInit userOptions:', args.userOptions);
        console.log('[VERIFY] beforeInit shareInfo exists?', !!args.shareInfo);
        
        // Test mutation
        const modifiedArgs = { ...args, testMutation: 'beforeInit-modified' };
        logExecution('beforeInit-return', modifiedArgs);
        return modifiedArgs;
      } catch (error) {
        logExecution('beforeInit-error', args, undefined, error);
        throw error;
      }
    },

    init(args) {
      try {
        logExecution('init', args);
        console.log('[VERIFY] init arg keys:', Object.keys(args));
        console.log('[VERIFY] init options:', args.options);
        console.log('[VERIFY] init remote exists?', !!args.remote);
        
        // Check if mutation from beforeInit persists
        console.log('[VERIFY] testMutation from beforeInit?', (args as any).testMutation);
        
        const result = { ...args, initProcessed: true };
        logExecution('init-return', result);
        return result;
      } catch (error) {
        logExecution('init-error', args, undefined, error);
        throw error;
      }
    },

    async beforeRequest(args) {
      try {
        logExecution('beforeRequest', args, undefined, undefined, true);
        console.log('[VERIFY] beforeRequest arg keys:', Object.keys(args));
        console.log('[VERIFY] beforeRequest id:', args.id);
        console.log('[VERIFY] beforeRequest origin:', args.origin);
        
        // Test async behavior
        await delay(100);
        console.log('[VERIFY] beforeRequest after delay');
        
        const result = { ...args, beforeRequestProcessed: true };
        logExecution('beforeRequest-return', result, undefined, undefined, true);
        return result;
      } catch (error) {
        logExecution('beforeRequest-error', args, undefined, error, true);
        throw error;
      }
    },

    async afterResolve(args) {
      try {
        logExecution('afterResolve', args, undefined, undefined, true);
        console.log('[VERIFY] afterResolve arg keys:', Object.keys(args));
        console.log('[VERIFY] afterResolve id:', args.id);
        console.log('[VERIFY] afterResolve expose:', args.expose);
        console.log('[VERIFY] afterResolve remote:', args.remote);
        console.log('[VERIFY] afterResolve entry:', args.entry);
        
        // Check if mutations from beforeRequest persist
        console.log('[VERIFY] beforeRequestProcessed?', (args as any).beforeRequestProcessed);
        
        await delay(50);
        
        const result = { ...args, afterResolveProcessed: true };
        logExecution('afterResolve-return', result, undefined, undefined, true);
        return result;
      } catch (error) {
        logExecution('afterResolve-error', args, undefined, error, true);
        throw error;
      }
    },

    onLoad(args) {
      try {
        logExecution('onLoad', args);
        console.log('[VERIFY] onLoad arg keys:', Object.keys(args));
        console.log('[VERIFY] onLoad id:', args.id);
        console.log('[VERIFY] onLoad expose:', args.expose);
        console.log('[VERIFY] onLoad remote:', args.remote);
        console.log('[VERIFY] onLoad entry:', args.entry);
        console.log('[VERIFY] onLoad remoteInfo:', args.remoteInfo);
        
        // Check if mutations persist through the chain
        console.log('[VERIFY] afterResolveProcessed?', (args as any).afterResolveProcessed);
        
        const result = { ...args, onLoadProcessed: true };
        logExecution('onLoad-return', result);
        return result;
      } catch (error) {
        logExecution('onLoad-error', args, undefined, error);
        throw error;
      }
    },

    async loadShare(args) {
      try {
        logExecution('loadShare', args, undefined, undefined, true);
        console.log('[VERIFY] loadShare arg keys:', Object.keys(args));
        console.log('[VERIFY] loadShare pkgName:', args.pkgName);
        console.log('[VERIFY] loadShare version:', args.version);
        console.log('[VERIFY] loadShare shared:', args.shared);
        console.log('[VERIFY] loadShare from:', args.from);
        
        await delay(75);
        
        // According to types, loadShare should return void or false
        logExecution('loadShare-return', 'void', undefined, undefined, true);
        // Test returning different values to see what happens
        if (Math.random() > 0.5) {
          console.log('[VERIFY] loadShare returning false');
          return false;
        }
        console.log('[VERIFY] loadShare returning void');
        return;
      } catch (error) {
        logExecution('loadShare-error', args, undefined, error, true);
        throw error;
      }
    },

    async beforeLoadShare(args) {
      try {
        logExecution('beforeLoadShare', args, undefined, undefined, true);
        console.log('[VERIFY] beforeLoadShare arg keys:', Object.keys(args));
        console.log('[VERIFY] beforeLoadShare pkgName:', args.pkgName);
        console.log('[VERIFY] beforeLoadShare version:', args.version);
        console.log('[VERIFY] beforeLoadShare shareInfo:', args.shareInfo);
        
        await delay(60);
        
        const result = { ...args, beforeLoadShareProcessed: true };
        logExecution('beforeLoadShare-return', result, undefined, undefined, true);
        return result;
      } catch (error) {
        logExecution('beforeLoadShare-error', args, undefined, error, true);
        throw error;
      }
    },

    // Test error handling
    handlePreloadError(args) {
      logExecution('handlePreloadError', args);
      console.log('[VERIFY] handlePreloadError arg keys:', Object.keys(args));
      console.log('[VERIFY] handlePreloadError error:', args.error);
      console.log('[VERIFY] handlePreloadError preloadConfig:', args.preloadConfig);
      
      // Test if we can recover
      const result = { ...args, errorHandled: true };
      logExecution('handlePreloadError-return', result);
      return result;
    },

    // Test undocumented hooks that might exist
    createScript(args) {
      logExecution('createScript', args);
      console.log('[VERIFY] createScript UNDOCUMENTED HOOK called!');
      console.log('[VERIFY] createScript args:', args);
      return args;
    },

    // Try other potential undocumented hooks
    beforeLoad(args) {
      logExecution('beforeLoad', args);
      console.log('[VERIFY] beforeLoad POTENTIAL UNDOCUMENTED HOOK!');
      return args;
    },

    afterLoad(args) {
      logExecution('afterLoad', args);
      console.log('[VERIFY] afterLoad POTENTIAL UNDOCUMENTED HOOK!');
      return args;
    },

    resolveShare(args) {
      logExecution('resolveShare', args);
      console.log('[VERIFY] resolveShare POTENTIAL UNDOCUMENTED HOOK!');
      return args;
    },

    fetch(args) {
      logExecution('fetch', args);
      console.log('[VERIFY] fetch POTENTIAL UNDOCUMENTED HOOK!');
      return args;
    },

    // Add type assertion to test additional hooks
  };
  
  return plugin as unknown as ModuleFederationRuntimePlugin;
}

// Export execution log for external analysis
(window as any).__HOOK_EXECUTION_LOG = executionLog;