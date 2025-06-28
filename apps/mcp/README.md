# MCP Federation Demo - E2E Testing Suite

This directory contains a comprehensive end-to-end testing suite for the MCP (Model Context Protocol) federation system using Module Federation.

## System Overview

The federation system consists of:

- **Host Application** (`mcp-host`): Aggregates and exposes tools from remote servers
- **Remote 1** (`mcp-remote1`): Provides filesystem and tools servers via HTTP
- **Remote 2** (`mcp-remote2`): Provides git and database servers via HTTP

## Test Suite Features

✅ **HTTP Accessibility Testing**: Validates remote servers are reachable via HTTP  
✅ **Module Federation Loading**: Tests dynamic import of remote modules  
✅ **Tool Registration & Discovery**: Verifies tools are properly registered  
✅ **Cross-Server Tool Calls**: Tests tool execution across federation boundaries  
✅ **Health Check Endpoints**: Monitors server health and availability  
✅ **Error Scenario Testing**: Tests resilience with server failures  
✅ **Automated Test Reports**: Generates JSON and HTML test reports  

## Quick Start

```bash
# Run all tests (recommended)
pnpm test

# Run specific test suites
pnpm test:e2e      # End-to-end federation tests
pnpm test:api      # API integration tests
pnpm demo          # Interactive demo

# Development workflow
pnpm build:all     # Build all projects
pnpm serve:all     # Start all servers for development
```

## Test Architecture

### 1. Test Runner (`test-runner.js`)
Orchestrates all test suites and generates comprehensive reports.

### 2. E2E Test Suite (`e2e-test.js`)
Comprehensive federation testing with:
- Server lifecycle management
- HTTP endpoint validation
- Federation loading verification
- Tool functionality testing
- Error scenario simulation

### 3. API Integration Tests (`test-mcp-api.js`)
Focused API testing for MCP protocol compliance.

### 4. Health Check Servers
HTTP endpoints for monitoring server health:
- `remote1/src/health-check.ts` - Remote1 health monitoring
- `remote2/src/health-check.ts` - Remote2 health monitoring

## Federation Configuration

### Host Configuration (`host/webpack.config.js`)
```javascript
remotes: {
  mcp_remote1: 'mcp_remote1@http://localhost:3030/remoteEntry.js',
  mcp_remote2: 'mcp_remote2@http://localhost:3031/remoteEntry.js',
}
```

### Remote Exposure
- **Remote1** exposes: `./filesystem`, `./tools`
- **Remote2** exposes: `./git`, `./database`

## Test Scenarios

### HTTP Accessibility Tests
1. Verify remote servers are accessible via HTTP
2. Validate `remoteEntry.js` contains Module Federation code
3. Check health endpoints respond correctly

### Federation Loading Tests
1. Import remote modules dynamically
2. Verify server registration in registry
3. Confirm tool discovery and aggregation

### Tool Functionality Tests
1. List all available tools across remotes
2. Execute tools with proper routing
3. Validate tool responses and error handling

### Error Scenario Tests
1. Partial remote failure (one remote down)
2. Network connectivity issues
3. Malformed tool calls
4. Recovery after remote restart

## Server Architecture

### MCP Registry (`host/src/mcp-registry.ts`)
- Manages server registration
- Routes tool calls to appropriate servers
- Provides aggregated statistics

### Federation Loader (`host/src/federation-loader.ts`)
- Dynamically loads remote servers
- Handles remote loading failures gracefully
- Supports server reloading

### Health Check Integration
Each remote provides health endpoints:
- `/health` - Overall server health
- `/health/[service]` - Individual service health
- `/federation/info` - Federation metadata

## Test Reports

After running tests, reports are generated:
- `test-report.json` - Machine-readable results
- `test-report.html` - Human-readable dashboard

## Configuration

### Ports
- Host: 3032
- Remote1: 3030
- Remote2: 3031

### Timeouts
- Server startup: 10s
- Health checks: 20s
- Test suite: 5 minutes per suite

## Debugging

### Common Issues

1. **Build Failures**: Ensure all dependencies are installed with `pnpm install`
2. **Port Conflicts**: Check if ports 3030-3032 are available
3. **Module Federation Errors**: Verify webpack configurations are correct
4. **Health Check Failures**: Ensure express dependency is available

### Verbose Logging
All test output includes timestamps and color-coded status indicators for easy debugging.

### Manual Testing
```bash
# Start servers manually for debugging
npx nx serve mcp-remote1 --port=3030
npx nx serve mcp-remote2 --port=3031

# Test individual components
curl http://localhost:3030/health
curl http://localhost:3030/remoteEntry.js
```

## Development Workflow

1. **Make Changes**: Modify federation or MCP code
2. **Build**: `pnpm build:all`
3. **Test**: `pnpm test`
4. **Debug**: Check `test-report.html` for detailed results
5. **Fix Issues**: Address any failing tests
6. **Repeat**: Until all tests pass

## CI/CD Integration

The test suite is designed for automated environments:
- Returns proper exit codes (0 = success, 1 = failure)
- Generates machine-readable reports
- Includes timeout handling
- Provides detailed error messages

```bash
# CI/CD example
node test-runner.js
echo "Exit code: $?"
```

## Contributing

When adding new federation features:
1. Add corresponding tests to `e2e-test.js`
2. Update health check endpoints if needed
3. Document new test scenarios in this README
4. Ensure tests pass in clean environment

## Architecture Decisions

### Why HTTP-Based Federation?
- **Realistic Testing**: Mirrors production deployment scenarios
- **Network Resilience**: Tests real network conditions
- **Scalability**: Supports distributed server architectures
- **Debugging**: Easy to inspect HTTP traffic

### Why Comprehensive E2E Tests?
- **Integration Confidence**: Verifies entire system works together
- **Regression Prevention**: Catches breaking changes early
- **Documentation**: Tests serve as living documentation
- **Production Readiness**: Validates deployment scenarios
