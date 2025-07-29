import { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';

// Track all hook calls, including undocumented ones
const allHookCalls: Array<{
  hook: string;
  timestamp: number;
  args: any;
  documented: boolean;
}> = [];

const DOCUMENTED_HOOKS = [
  'name',
  'beforeInit',
  'init', 
  'beforeRequest',
  'afterResolve',
  'onLoad',
  'loadShare',
  'beforeLoadShare',
  'handlePreloadError'
];

export default function (): ModuleFederationRuntimePlugin {
  const basePlugin: ModuleFederationRuntimePlugin = {
    name: 'hook-proxy-plugin',
    
    beforeInit(args) {
      console.log('[PROXY] beforeInit called');
      return args;
    }
  };

  // Create a proxy to intercept ALL property access
  return new Proxy(basePlugin, {
    get(target, prop, receiver) {
      const propName = String(prop);
      
      // Special handling for 'name'
      if (propName === 'name') {
        return target.name;
      }
      
      // Check if this is a hook call
      if (typeof prop === 'string' && prop !== 'constructor') {
        const isDocumented = DOCUMENTED_HOOKS.includes(prop);
        
        if (!isDocumented) {
          console.warn(`[PROXY] UNDOCUMENTED HOOK ACCESSED: ${prop}`);
        }
        
        // Return a function that logs the call
        return function(...args: any[]) {
          const callInfo = {
            hook: prop,
            timestamp: Date.now(),
            args: args,
            documented: isDocumented
          };
          
          allHookCalls.push(callInfo);
          console.log(`[PROXY] Hook called: ${prop}`, {
            documented: isDocumented,
            argsCount: args.length,
            args: args
          });
          
          // Call original if it exists
          if (prop in target) {
            return (target as any)[prop](...args);
          }
          
          // For undocumented hooks, just return the args
          return args[0];
        };
      }
      
      return Reflect.get(target, prop, receiver);
    },
    
    has(target, prop) {
      // Report all property checks
      console.log(`[PROXY] Property check: ${String(prop)}`);
      return true; // Claim we have all properties to see what gets called
    },
    
    ownKeys(target) {
      // Log when keys are enumerated
      console.log('[PROXY] Keys enumerated');
      return Reflect.ownKeys(target);
    }
  });
}

// Export hook calls for analysis
(window as any).__ALL_HOOK_CALLS = allHookCalls;