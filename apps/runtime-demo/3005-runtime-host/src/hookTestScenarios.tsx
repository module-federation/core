import React, { useEffect, useState } from 'react';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const HookTestScenarios: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addResult = (result: string) => {
    console.log('[TEST-SCENARIO]', result);
    setTestResults(prev => [...prev, result]);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const runAllTests = async () => {
    addResult('Starting hook verification tests...');
    
    // Test 1: Normal module load
    try {
      addResult('Test 1: Loading normal module...');
      const module1 = await loadRemote('runtime_remote/button');
      addResult(`Test 1 Result: ${module1 ? 'Success' : 'Failed'}`);
    } catch (error) {
      addResult(`Test 1 Error: ${error}`);
    }

    // Test 2: Load with error (non-existent module)
    try {
      addResult('Test 2: Loading non-existent module...');
      const module2 = await loadRemote('runtime_remote/nonexistent');
      addResult(`Test 2 Result: ${module2 ? 'Unexpected success' : 'Failed as expected'}`);
    } catch (error) {
      addResult(`Test 2 Error (expected): ${error}`);
    }

    // Test 3: Dynamic remote load
    try {
      addResult('Test 3: Loading dynamic remote...');
      const module3 = await loadRemote('dynamic-remote/button');
      addResult(`Test 3 Result: ${module3 ? 'Success' : 'Failed'}`);
    } catch (error) {
      addResult(`Test 3 Error: ${error}`);
    }

    // Test 4: Multiple loads in parallel
    try {
      addResult('Test 4: Parallel module loads...');
      const [mod1, mod2, mod3] = await Promise.all([
        loadRemote('runtime_remote/button'),
        loadRemote('runtime_remote/menu'),
        loadRemote('dynamic-remote/button')
      ]);
      addResult(`Test 4 Result: All loaded = ${!!(mod1 && mod2 && mod3)}`);
    } catch (error) {
      addResult(`Test 4 Error: ${error}`);
    }

    // Test 5: Shared module loading
    try {
      addResult('Test 5: Testing shared module behavior...');
      // This should trigger loadShare/beforeLoadShare hooks
      const React = await import('react');
      addResult(`Test 5 Result: React loaded = ${!!React}`);
    } catch (error) {
      addResult(`Test 5 Error: ${error}`);
    }

    // Test 6: Hook error propagation
    try {
      addResult('Test 6: Testing hook error propagation...');
      // Temporarily modify window to inject error
      (window as any).__FORCE_HOOK_ERROR = true;
      const module6 = await loadRemote('runtime_remote/button');
      addResult(`Test 6 Result: ${module6 ? 'Error not propagated!' : 'Failed'}`);
    } catch (error) {
      addResult(`Test 6 Error: ${error}`);
    } finally {
      (window as any).__FORCE_HOOK_ERROR = false;
    }

    // Check execution log
    setTimeout(() => {
      const log = (window as any).__HOOK_EXECUTION_LOG;
      if (log) {
        addResult(`\nTotal hook executions: ${log.length}`);
        
        // Analyze execution order
        const order = log.map((e: any) => e.hook);
        addResult(`Execution order: ${order.join(' -> ')}`);
        
        // Check async timing
        const asyncHooks = log.filter((e: any) => e.isAsync);
        addResult(`Async hooks: ${asyncHooks.map((e: any) => e.hook).join(', ')}`);
        
        // Check return value usage
        const hooksWithReturns = log.filter((e: any) => e.returnValue);
        addResult(`Hooks with return values: ${hooksWithReturns.length}`);
      }
    }, 2000);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h2>Hook Verification Test Results</h2>
      <button onClick={runAllTests}>Re-run Tests</button>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
        {testResults.join('\n')}
      </pre>
    </div>
  );
};