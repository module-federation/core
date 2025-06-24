# Hydration Fix Testing Guide

## Overview

This guide explains how to test the Module Federation HMR hydration fixes using comprehensive E2E tests that specifically validate the "second page load" scenario where hydration errors typically occur.

## Quick Test Execution

### 1. Run All Hydration Tests
```bash
pnpm test:hydration
```

### 2. Run Specific Test Suites

**Critical Second Load Test (Most Important):**
```bash
pnpm test:hydration:second-load
```

**Comprehensive Validation:**
```bash
pnpm test:hydration:comprehensive
```

### 3. Manual Test Execution
```bash
# Start apps first
pnpm app:next:dev

# In another terminal, run specific tests
npx nx run 3000-home:e2e:development --spec=apps/3000-home/cypress/e2e/second-load-hydration.cy.ts
```

## Test Scenarios Covered

### 🎯 Second Load Hydration Test (`second-load-hydration.cy.ts`)

**Critical Test Scenario:**
1. **First Load**: Visit `/shop` page (baseline)
2. **Modify Content**: Edit shop page content during session
3. **Navigate Away**: Trigger server-side revalidation
4. **Second Load**: Return to `/shop` (CRITICAL - where hydration errors occur)
5. **Validation**: Ensure no hydration mismatches

**Key Assertions:**
- ✅ No "Text content does not match server-rendered HTML" errors
- ✅ Server and client content synchronization
- ✅ DOM consistency across multiple loads

### 🧪 Comprehensive Validation (`hydration-fix-validation.cy.ts`)

**Extended Test Scenarios:**
1. **Page Modification with Reload**
2. **Component-Level Modifications**
3. **Rapid Modifications and Navigation**
4. **Concurrent Operations**
5. **Server-Side Rendering Consistency**

## Understanding the Hydration Error

### The Original Problem

Before the fix, this error occurred:
```
Unhandled Runtime Error
Error: Text content does not match server-rendered HTML.

Text content did not match:
Server: "This is a federated page owned by localhost:3001ijoiojoijoi"
Client: "This is a federated page owned by localhost:ojji"
```

### Why Second Load Testing is Critical

1. **First Load**: Often works because server and client start in sync
2. **Content Modification**: HMR updates change federation module content
3. **Second Load**: Server renders updated content, but client cache may be stale
4. **Hydration Mismatch**: React detects server ≠ client content

### What the Tests Validate

#### ✅ **Cache Invalidation**
- Federation module caches cleared on updates
- Next.js webpack cache properly invalidated
- Router component cache reset

#### ✅ **Server-Client Sync**
- Server-side revalidation working
- Client receives fresh federation modules
- HMR safety flags prevent cache conflicts

#### ✅ **Error Recovery**
- Nuclear reset handles corruption
- Fallback mechanisms prevent hydration errors
- Graceful degradation when HMR fails

## Test Architecture

### Error Detection Mechanisms

The tests implement comprehensive error monitoring:

```javascript
// Hydration error detection
win.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Text content does not match server-rendered HTML')) {
    throw new Error(`CRITICAL: Hydration error detected: ${e.message}`);
  }
});

// Console warning monitoring
win.console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('hydration') || message.includes('Hydration')) {
    throw new Error(`Console hydration error: ${message}`);
  }
};
```

### Content Modification Strategy

Tests modify actual federation module files:

```javascript
// Modify shop page content
cy.readFile(SHOP_PAGE_PATH).then((content) => {
  const modifiedContent = content.replace(
    /This is a federated page owned by localhost:3001.*?>/g,
    `This is a federated page owned by localhost:3001 (${newContent})>`
  );
  cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
});
```

### Validation Points

1. **Content Updates**: New content appears correctly
2. **No Hydration Errors**: Error listeners detect zero hydration issues
3. **DOM Consistency**: Multiple loads produce identical content
4. **Server Sync**: Server-side requests return updated content

## Running Tests in CI/CD

### Prerequisites
- Next.js apps running on ports 3000, 3001, 3002
- Federation modules properly configured
- Cypress installed and configured

### Test Execution Order
1. Start all Next.js applications
2. Wait for federation initialization
3. Run second-load tests (most critical)
4. Run comprehensive validation tests
5. Restore original file content

### Performance Considerations
- Tests modify actual source files (restored after)
- HMR processing requires 2-4 second waits
- Nuclear reset operations may take 200ms+
- Total test time: 3-5 minutes per suite

## Debugging Failed Tests

### Common Failure Patterns

#### 1. Hydration Mismatch Detected
```
CRITICAL: Hydration error detected: Text content does not match server-rendered HTML
```

**Investigation Steps:**
- Check if nuclear reset is working
- Verify cache invalidation mechanisms
- Examine server-side revalidation logs

#### 2. Content Not Updated
```
Expected content not found after modification
```

**Investigation Steps:**
- Verify file modification is being detected
- Check HMR processing logs
- Ensure apps are running and responsive

#### 3. Test Timeouts
```
Timed out retrying after 10000ms
```

**Investigation Steps:**
- Increase timeout values in cypress.config.ts
- Check app startup performance
- Verify federation modules are loading

### Debug Mode

Run tests with additional logging:
```bash
DEBUG=cypress:* pnpm test:hydration:second-load
```

### Manual Verification

1. Start apps: `pnpm app:next:dev`
2. Visit: `http://localhost:3000/shop`
3. Edit: `apps/3001-shop/pages/shop/index.tsx`
4. Navigate away and back
5. Check browser console for hydration errors

## Test Results Interpretation

### ✅ Success Indicators
- All tests pass without hydration errors
- Content updates propagate correctly
- Server-client synchronization working
- Multiple loads produce consistent results

### ❌ Failure Indicators
- Hydration error exceptions thrown
- Content mismatches between loads
- Console warnings about hydration
- Test timeouts or app crashes

### Performance Metrics
- Nuclear reset: < 200ms
- File change detection: < 3s
- Page load with federation: < 5s
- Total test execution: < 5min

## Contributing Test Cases

### Adding New Hydration Tests

1. Create test file in `apps/3000-home/cypress/e2e/`
2. Follow existing patterns for error detection
3. Include content restoration in `after()` hooks
4. Add comprehensive logging for debugging

### Test Naming Convention
- `*-hydration.cy.ts` for hydration-specific tests
- Descriptive test names explaining scenario
- Use `cy.log()` extensively for debugging

### Best Practices
- Always restore original content
- Wait for HMR processing (2-3 seconds)
- Test both component and page modifications
- Validate server-side content with `cy.request()`
- Monitor both errors and console warnings

This testing framework ensures the hydration fixes remain robust and reliable across different scenarios and edge cases.