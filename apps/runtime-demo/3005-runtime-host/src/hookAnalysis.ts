// Hook Analysis Report Generator
export function generateHookAnalysisReport() {
  const executionLog = (window as any).__HOOK_EXECUTION_LOG || [];
  const allHookCalls = (window as any).__ALL_HOOK_CALLS || [];
  
  console.log('=== MODULE FEDERATION HOOKS RUNTIME ANALYSIS ===\n');
  
  // 1. DOCUMENTED VS ACTUAL HOOK SIGNATURES
  console.log('1. HOOK SIGNATURE VERIFICATION:\n');
  
  const hookSignatures: Record<string, { documented: string; actual: string[] }> = {
    beforeInit: {
      documented: '{ userOptions, options, origin, shareInfo }',
      actual: []
    },
    init: {
      documented: '{ options, remote }',
      actual: []
    },
    beforeRequest: {
      documented: '{ id, origin }',
      actual: []
    },
    afterResolve: {
      documented: '{ id, expose, remote, entry }',
      actual: []
    },
    onLoad: {
      documented: '{ id, expose, remote, entry, remoteInfo }',
      actual: []
    },
    loadShare: {
      documented: '{ pkgName, version, shared, from }',
      actual: []
    },
    beforeLoadShare: {
      documented: '{ pkgName, version, shareInfo }',
      actual: []
    }
  };
  
  // Analyze actual signatures
  executionLog.forEach((entry: any) => {
    const hook = entry.hook;
    if (hookSignatures[hook] && entry.args) {
      try {
        const parsedArgs = typeof entry.args === 'string' ? JSON.parse(entry.args) : entry.args;
        const actualKeys = Object.keys(parsedArgs).sort().join(', ');
        if (!hookSignatures[hook].actual.includes(actualKeys)) {
          hookSignatures[hook].actual.push(actualKeys);
        }
      } catch (e) {
        console.error('Failed to parse args for', hook, e);
      }
    }
  });
  
  // Compare documented vs actual
  Object.entries(hookSignatures).forEach(([hook, data]) => {
    if (data.actual.length > 0) {
      console.log(`${hook}:`);
      console.log(`  Documented: ${data.documented}`);
      console.log(`  Actual: ${data.actual.join(' OR ')}`);
      console.log(`  Match: ${data.actual.some(a => a === data.documented) ? '✅' : '❌'}\n`);
    }
  });
  
  // 2. EXECUTION ORDER ANALYSIS
  console.log('\n2. HOOK EXECUTION ORDER:\n');
  
  const executionOrder = executionLog.map((e: any) => e.hook);
  const uniqueOrder = [...new Set(executionOrder)];
  console.log('Unique execution order:', uniqueOrder.join(' → '));
  console.log('Total executions:', executionOrder.length);
  
  // Group by operation
  const operations: Record<string, string[]> = {};
  let currentOp = 'init';
  executionOrder.forEach((hook: string) => {
    if (hook === 'beforeRequest') currentOp = 'module-load';
    if (hook === 'beforeLoadShare') currentOp = 'share-load';
    operations[currentOp] = operations[currentOp] || [];
    operations[currentOp].push(hook);
  });
  
  console.log('\nGrouped by operation:');
  Object.entries(operations).forEach(([op, hooks]) => {
    console.log(`  ${op}: ${[...new Set(hooks)].join(' → ')}`);
  });
  
  // 3. ASYNC BEHAVIOR ANALYSIS
  console.log('\n3. ASYNC HOOK BEHAVIOR:\n');
  
  const asyncHooks = executionLog.filter((e: any) => e.isAsync);
  console.log('Async hooks called:', asyncHooks.map((e: any) => e.hook).join(', '));
  
  // Check timing
  const asyncTimings: Record<string, number[]> = {};
  for (let i = 0; i < executionLog.length - 1; i++) {
    const current = executionLog[i];
    if (current.isAsync && current.hook.endsWith('-return')) {
      const hookName = current.hook.replace('-return', '');
      const start = executionLog.find((e: any, idx: number) => 
        idx < i && e.hook === hookName
      );
      if (start) {
        const duration = current.timestamp - start.timestamp;
        asyncTimings[hookName] = asyncTimings[hookName] || [];
        asyncTimings[hookName].push(duration);
      }
    }
  }
  
  console.log('Async hook durations (ms):');
  Object.entries(asyncTimings).forEach(([hook, durations]) => {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    console.log(`  ${hook}: avg ${avg.toFixed(2)}ms, samples: ${durations.length}`);
  });
  
  // 4. RETURN VALUE USAGE
  console.log('\n4. RETURN VALUE BEHAVIOR:\n');
  
  const hooksWithReturns = executionLog.filter((e: any) => 
    e.hook.endsWith('-return') && e.returnValue
  );
  
  console.log('Hooks that return values:');
  hooksWithReturns.forEach((e: any) => {
    const hookName = e.hook.replace('-return', '');
    console.log(`  ${hookName}: returns data (check if mutations persist)`);
  });
  
  // Check mutation persistence
  const mutations: Record<string, boolean> = {
    'beforeInit→init': false,
    'beforeRequest→afterResolve': false,
    'afterResolve→onLoad': false,
    'beforeLoadShare→loadShare': false
  };
  
  // Look for our test mutations
  executionLog.forEach((e: any) => {
    if (e.args && e.args.includes('testMutation')) mutations['beforeInit→init'] = true;
    if (e.args && e.args.includes('beforeRequestProcessed')) mutations['beforeRequest→afterResolve'] = true;
    if (e.args && e.args.includes('afterResolveProcessed')) mutations['afterResolve→onLoad'] = true;
    if (e.args && e.args.includes('beforeLoadShareProcessed')) mutations['beforeLoadShare→loadShare'] = true;
  });
  
  console.log('\nMutation persistence:');
  Object.entries(mutations).forEach(([flow, persists]) => {
    console.log(`  ${flow}: ${persists ? '✅ Persists' : '❌ Does not persist'}`);
  });
  
  // 5. UNDOCUMENTED HOOKS
  console.log('\n5. UNDOCUMENTED HOOKS DISCOVERED:\n');
  
  const documentedHooks = [
    'name', 'beforeInit', 'init', 'beforeRequest', 'afterResolve', 
    'onLoad', 'loadShare', 'beforeLoadShare', 'handlePreloadError'
  ];
  
  const undocumentedCalls = allHookCalls.filter((h: any) => !h.documented);
  const uniqueUndocumented = [...new Set(undocumentedCalls.map((h: any) => h.hook))];
  
  if (uniqueUndocumented.length > 0) {
    console.log('Undocumented hooks called:', uniqueUndocumented.join(', '));
    undocumentedCalls.forEach((h: any) => {
      console.log(`  ${h.hook}: args count = ${h.args.length}`);
    });
  } else {
    console.log('No undocumented hooks detected');
  }
  
  // 6. ERROR HANDLING
  console.log('\n6. ERROR HANDLING BEHAVIOR:\n');
  
  const errors = executionLog.filter((e: any) => e.error);
  if (errors.length > 0) {
    console.log('Hooks that encountered errors:');
    errors.forEach((e: any) => {
      console.log(`  ${e.hook}: ${e.error}`);
    });
  } else {
    console.log('No errors detected during hook execution');
  }
  
  // 7. HOOK CONFLICTS
  console.log('\n7. MULTIPLE PLUGIN BEHAVIOR:\n');
  
  // Count how many times each hook was called
  const hookCounts: Record<string, number> = {};
  executionLog.forEach((e: any) => {
    if (!e.hook.includes('-return') && !e.hook.includes('-error')) {
      hookCounts[e.hook] = (hookCounts[e.hook] || 0) + 1;
    }
  });
  
  console.log('Hook call counts (multiple plugins):');
  Object.entries(hookCounts).forEach(([hook, count]) => {
    console.log(`  ${hook}: called ${count} times`);
  });
  
  // 8. WATERFALL VS NORMAL HOOKS
  console.log('\n8. WATERFALL HOOK BEHAVIOR:\n');
  
  const waterfallHooks = ['beforeInit', 'beforeRequest', 'afterResolve', 'beforeLoadShare'];
  console.log('Waterfall hooks (should pass data through chain):');
  waterfallHooks.forEach(hook => {
    const hasReturn = hooksWithReturns.some((e: any) => e.hook === `${hook}-return`);
    console.log(`  ${hook}: ${hasReturn ? '✅ Returns modified data' : '❌ No return detected'}`);
  });
  
  // Generate summary
  console.log('\n=== SUMMARY OF FINDINGS ===\n');
  
  const findings = [
    executionLog.length === 0 ? '❌ No hooks were executed (plugin may not be registered correctly)' : `✅ ${executionLog.length} hook executions captured`,
    uniqueUndocumented.length > 0 ? `⚠️ ${uniqueUndocumented.length} undocumented hooks discovered` : '✅ No undocumented hooks found',
    Object.values(mutations).some(v => v) ? '⚠️ Some mutations persist between hooks' : '❌ Hook mutations do not persist',
    asyncHooks.length > 0 ? `✅ ${asyncHooks.length} async hook executions verified` : '❌ No async hooks executed',
    errors.length > 0 ? `⚠️ ${errors.length} errors encountered` : '✅ No errors during execution'
  ];
  
  findings.forEach(f => console.log(f));
  
  return {
    executionLog,
    allHookCalls,
    hookSignatures,
    executionOrder: uniqueOrder,
    asyncTimings,
    mutations,
    undocumentedHooks: uniqueUndocumented,
    errors,
    findings
  };
}

// Auto-run analysis after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('Running hook analysis...');
      generateHookAnalysisReport();
    }, 3000);
  });
}