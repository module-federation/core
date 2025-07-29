/**
 * Security Audit Tests - Testing for vulnerabilities in Module Federation patterns
 * Includes XSS, prototype pollution, supply chain attacks, and CSP violations
 */

const { ModuleFederation } = require('@module-federation/runtime-core');

// Security testing utilities
class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.securityEvents = [];
  }

  reportVulnerability(type, severity, details) {
    this.vulnerabilities.push({
      type,
      severity,
      details,
      timestamp: Date.now()
    });
  }

  trackSecurityEvent(event) {
    this.securityEvents.push({
      ...event,
      timestamp: Date.now()
    });
  }

  generateReport() {
    const severityCounts = this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVulnerabilities: this.vulnerabilities.length,
      severityCounts,
      vulnerabilities: this.vulnerabilities,
      securityEvents: this.securityEvents
    };
  }
}

describe('Security Audit Production Tests', () => {
  let auditor;

  beforeEach(() => {
    auditor = new SecurityAuditor();
  });

  test('BRUTAL TEST: XSS vulnerability testing', async () => {
    // Test if module loading can be exploited for XSS
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      '\';alert("XSS");//',
      '</script><script>alert("XSS")</script>',
      'data:text/html,<script>alert("XSS")</script>'
    ];

    const xssDetectionPlugin = {
      name: 'XSSDetectionPlugin',
      
      beforeRequest(args) {
        // Check if request contains XSS payloads
        if (xssPayloads.some(payload => args.id.includes(payload))) {
          auditor.reportVulnerability('XSS', 'HIGH', {
            location: 'beforeRequest',
            payload: args.id,
            message: 'XSS payload in module ID'
          });
        }
        return args;
      },
      
      createScript({ url }) {
        // Check URL for XSS
        if (xssPayloads.some(payload => url.includes(payload))) {
          auditor.reportVulnerability('XSS', 'CRITICAL', {
            location: 'createScript',
            payload: url,
            message: 'XSS payload in script URL'
          });
        }

        const script = document.createElement('script');
        script.src = url;
        
        // Check if proper sanitization is applied
        if (!script.src.startsWith('https://') && !script.src.startsWith('http://localhost')) {
          auditor.reportVulnerability('XSS', 'MEDIUM', {
            location: 'createScript',
            url: script.src,
            message: 'Non-HTTPS script source'
          });
        }

        return script;
      },
      
      onLoad(args) {
        // Check if module exports contain dangerous content
        if (args.exposeModule) {
          const moduleStr = args.exposeModule.toString();
          if (moduleStr.includes('eval(') || moduleStr.includes('Function(')) {
            auditor.reportVulnerability('XSS', 'HIGH', {
              location: 'onLoad',
              moduleId: args.id,
              message: 'Module contains eval or Function constructor'
            });
          }
        }
        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'xss-test',
      remotes: [{
        name: 'untrusted',
        entry: 'https://untrusted.example.com/remoteEntry.js'
      }],
      plugins: [xssDetectionPlugin]
    });

    // Test XSS payloads in module IDs
    for (const payload of xssPayloads) {
      try {
        await federation.loadRemote(`untrusted/${payload}`);
      } catch (error) {
        auditor.trackSecurityEvent({
          type: 'xss_attempt_blocked',
          payload,
          error: error.message
        });
      }
    }

    // Test dynamic module loading with user input
    const userInput = '<img src=x onerror=alert("XSS")>';
    try {
      await federation.loadRemote(`untrusted/${userInput}`);
    } catch (error) {
      // Expected to fail
    }

    console.log('XSS vulnerability test results:', {
      vulnerabilitiesFound: auditor.vulnerabilities.filter(v => v.type === 'XSS').length,
      blockedAttempts: auditor.securityEvents.filter(e => e.type === 'xss_attempt_blocked').length
    });
  });

  test('BRUTAL TEST: Prototype pollution testing', async () => {
    // Test if federation can be exploited for prototype pollution
    
    const pollutionPlugin = {
      name: 'PrototypePollutionPlugin',
      
      onLoad(args) {
        // Check if module tries to pollute prototypes
        const dangerousPatterns = [
          '__proto__',
          'constructor.prototype',
          'Object.prototype',
          'Array.prototype'
        ];

        if (args.exposeModule) {
          const moduleStr = JSON.stringify(args.exposeModule);
          
          for (const pattern of dangerousPatterns) {
            if (moduleStr.includes(pattern)) {
              auditor.reportVulnerability('PROTOTYPE_POLLUTION', 'CRITICAL', {
                location: 'onLoad',
                moduleId: args.id,
                pattern,
                message: `Module contains dangerous pattern: ${pattern}`
              });
            }
          }
        }

        return args;
      },
      
      beforeLoadShare(args) {
        // Check shared modules for pollution attempts
        const { pkgName, shareInfo } = args;
        
        if (pkgName === '__proto__' || pkgName === 'constructor') {
          auditor.reportVulnerability('PROTOTYPE_POLLUTION', 'CRITICAL', {
            location: 'beforeLoadShare',
            packageName: pkgName,
            message: 'Attempting to share prototype-polluting package name'
          });
        }

        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'pollution-test',
      remotes: [{
        name: 'malicious',
        entry: 'https://malicious.example.com/remoteEntry.js'
      }],
      plugins: [pollutionPlugin]
    });

    // Test prototype pollution attempts
    const pollutionAttempts = [
      { id: 'malicious/__proto__', expected: 'blocked' },
      { id: 'malicious/constructor.prototype', expected: 'blocked' },
      { id: 'malicious/Object.prototype.polluted', expected: 'blocked' }
    ];

    for (const attempt of pollutionAttempts) {
      try {
        await federation.loadRemote(attempt.id);
      } catch (error) {
        auditor.trackSecurityEvent({
          type: 'prototype_pollution_blocked',
          attempt: attempt.id,
          error: error.message
        });
      }
    }

    // Test if federation instance can be polluted
    const originalProto = Object.getPrototypeOf(federation);
    const beforePollution = { ...originalProto };

    // Attempt to pollute
    try {
      federation.__proto__.polluted = true;
      federation.constructor.prototype.hacked = true;
    } catch (error) {
      auditor.trackSecurityEvent({
        type: 'pollution_attempt_failed',
        error: error.message
      });
    }

    // Check if pollution succeeded
    if (federation.polluted || federation.hacked) {
      auditor.reportVulnerability('PROTOTYPE_POLLUTION', 'CRITICAL', {
        location: 'federation_instance',
        message: 'Federation instance prototype was successfully polluted'
      });
    }

    console.log('Prototype pollution test results:', {
      vulnerabilitiesFound: auditor.vulnerabilities.filter(v => v.type === 'PROTOTYPE_POLLUTION').length,
      pollutionBlocked: auditor.securityEvents.filter(e => e.type === 'prototype_pollution_blocked').length
    });
  });

  test('BRUTAL TEST: Supply chain attack detection', async () => {
    // Test for supply chain vulnerabilities
    
    const supplyChainPlugin = {
      name: 'SupplyChainPlugin',
      trustedDomains: ['trusted.example.com', 'cdn.trusted.com'],
      
      beforeRequest(args) {
        const url = args.id;
        
        // Check if loading from untrusted source
        const isUntrusted = !this.trustedDomains.some(domain => url.includes(domain));
        
        if (isUntrusted) {
          auditor.reportVulnerability('SUPPLY_CHAIN', 'HIGH', {
            location: 'beforeRequest',
            url,
            message: 'Loading module from untrusted source'
          });
        }

        // Check for suspicious patterns
        if (url.includes('eval') || url.includes('base64')) {
          auditor.reportVulnerability('SUPPLY_CHAIN', 'CRITICAL', {
            location: 'beforeRequest',
            url,
            message: 'Suspicious pattern in module URL'
          });
        }

        return args;
      },
      
      fetch(url, options) {
        // Check fetch options for security issues
        if (!options || !options.integrity) {
          auditor.reportVulnerability('SUPPLY_CHAIN', 'MEDIUM', {
            location: 'fetch',
            url,
            message: 'Missing subresource integrity check'
          });
        }

        // Check for HTTP URLs
        if (url.startsWith('http://') && !url.includes('localhost')) {
          auditor.reportVulnerability('SUPPLY_CHAIN', 'HIGH', {
            location: 'fetch',
            url,
            message: 'Loading module over insecure HTTP'
          });
        }

        return fetch(url, options);
      },
      
      onLoad(args) {
        // Check module for suspicious code patterns
        if (args.exposeModule) {
          const moduleCode = args.exposeModule.toString();
          
          const suspiciousPatterns = [
            /fetch\s*\(\s*['"`]https?:\/\/[^'"]*\.(ru|cn|tk)/i,
            /document\.write/i,
            /window\.location\s*=/,
            /eval\s*\(/,
            /new\s+Function\s*\(/,
            /atob\s*\(/,
            /btoa\s*\(/
          ];

          for (const pattern of suspiciousPatterns) {
            if (pattern.test(moduleCode)) {
              auditor.reportVulnerability('SUPPLY_CHAIN', 'HIGH', {
                location: 'onLoad',
                moduleId: args.id,
                pattern: pattern.toString(),
                message: 'Module contains suspicious code pattern'
              });
            }
          }
        }

        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'supply-chain-test',
      remotes: [{
        name: 'external',
        entry: 'https://untrusted-cdn.example.com/remoteEntry.js'
      }],
      plugins: [supplyChainPlugin]
    });

    // Test various supply chain attack vectors
    const attackVectors = [
      'external/crypto-miner',
      'external/data-exfiltrator',
      'external/eval-executor',
      'http://insecure.example.com/module',
      'https://malicious.ru/backdoor'
    ];

    for (const vector of attackVectors) {
      try {
        await federation.loadRemote(vector);
      } catch (error) {
        auditor.trackSecurityEvent({
          type: 'supply_chain_blocked',
          vector,
          error: error.message
        });
      }
    }

    console.log('Supply chain attack test results:', {
      vulnerabilitiesFound: auditor.vulnerabilities.filter(v => v.type === 'SUPPLY_CHAIN').length,
      untrustedSources: auditor.vulnerabilities.filter(v => v.details.message.includes('untrusted')).length
    });
  });

  test('BRUTAL TEST: CSP (Content Security Policy) violations', async () => {
    // Test CSP compatibility and violations
    
    const cspPlugin = {
      name: 'CSPPlugin',
      
      createScript({ url }) {
        const script = document.createElement('script');
        script.src = url;

        // Check if script would violate common CSP directives
        const cspViolations = [];

        // Check script-src violations
        if (!url.startsWith('https://') && !url.includes('localhost')) {
          cspViolations.push("script-src 'self' https:");
        }

        // Check if inline scripts would be blocked
        if (script.innerHTML) {
          cspViolations.push("script-src 'unsafe-inline'");
        }

        // Check for data: URLs
        if (url.startsWith('data:')) {
          cspViolations.push("script-src data:");
        }

        if (cspViolations.length > 0) {
          auditor.reportVulnerability('CSP_VIOLATION', 'MEDIUM', {
            location: 'createScript',
            url,
            violations: cspViolations,
            message: `Would violate CSP directives: ${cspViolations.join(', ')}`
          });
        }

        // Simulate CSP enforcement
        script.onerror = (error) => {
          auditor.trackSecurityEvent({
            type: 'csp_block',
            url,
            error: 'CSP blocked script execution'
          });
        };

        return script;
      },
      
      fetch(url, options) {
        // Check connect-src violations
        const connectSrcViolations = [];

        if (!url.startsWith('https://') && !url.includes('localhost')) {
          connectSrcViolations.push("connect-src 'self' https:");
        }

        if (url.includes('ws://') || url.includes('wss://')) {
          connectSrcViolations.push("connect-src ws: wss:");
        }

        if (connectSrcViolations.length > 0) {
          auditor.reportVulnerability('CSP_VIOLATION', 'MEDIUM', {
            location: 'fetch',
            url,
            violations: connectSrcViolations,
            message: `Would violate CSP directives: ${connectSrcViolations.join(', ')}`
          });
        }

        return fetch(url, options);
      }
    };

    const federation = new ModuleFederation({
      name: 'csp-test',
      remotes: [{
        name: 'csp-test-remote',
        entry: 'http://insecure.example.com/remoteEntry.js'
      }],
      plugins: [cspPlugin]
    });

    // Test various CSP-violating scenarios
    const cspTestCases = [
      { url: 'http://insecure.com/module.js', expectedViolation: 'script-src' },
      { url: 'data:text/javascript,alert(1)', expectedViolation: 'script-src data:' },
      { url: 'blob:http://example.com/uuid', expectedViolation: 'script-src blob:' }
    ];

    for (const testCase of cspTestCases) {
      try {
        await federation.loadRemote(testCase.url);
      } catch (error) {
        auditor.trackSecurityEvent({
          type: 'csp_test',
          testCase,
          error: error.message
        });
      }
    }

    console.log('CSP violation test results:', {
      violationsFound: auditor.vulnerabilities.filter(v => v.type === 'CSP_VIOLATION').length,
      blockedByCSP: auditor.securityEvents.filter(e => e.type === 'csp_block').length
    });
  });

  test('BRUTAL TEST: Authentication and authorization bypass', async () => {
    // Test if module loading can bypass auth checks
    
    const authPlugin = {
      name: 'AuthPlugin',
      authToken: null,
      
      beforeRequest(args) {
        // Check if request includes proper authentication
        if (!this.authToken) {
          auditor.reportVulnerability('AUTH_BYPASS', 'HIGH', {
            location: 'beforeRequest',
            moduleId: args.id,
            message: 'Module request without authentication token'
          });
        }

        return args;
      },
      
      fetch(url, options = {}) {
        // Check if auth headers are included
        if (!options.headers || !options.headers['Authorization']) {
          auditor.reportVulnerability('AUTH_BYPASS', 'MEDIUM', {
            location: 'fetch',
            url,
            message: 'Fetch request without Authorization header'
          });
        }

        // Check for credential leakage
        if (options.credentials === 'include') {
          auditor.reportVulnerability('AUTH_BYPASS', 'HIGH', {
            location: 'fetch',
            url,
            message: 'Credentials included in cross-origin request'
          });
        }

        return fetch(url, options);
      }
    };

    const federation = new ModuleFederation({
      name: 'auth-test',
      remotes: [{
        name: 'protected',
        entry: 'https://api.example.com/protected/remoteEntry.js'
      }],
      plugins: [authPlugin]
    });

    // Test loading protected modules without auth
    const protectedModules = [
      'protected/admin-panel',
      'protected/user-data',
      'protected/api-keys'
    ];

    for (const moduleId of protectedModules) {
      try {
        await federation.loadRemote(moduleId);
        auditor.trackSecurityEvent({
          type: 'unauthorized_access',
          moduleId,
          message: 'Successfully loaded protected module without auth'
        });
      } catch (error) {
        // Expected to fail
      }
    }

    console.log('Auth bypass test results:', {
      authVulnerabilities: auditor.vulnerabilities.filter(v => v.type === 'AUTH_BYPASS').length,
      unauthorizedAccess: auditor.securityEvents.filter(e => e.type === 'unauthorized_access').length
    });
  });

  test('BRUTAL TEST: Injection attack vectors', async () => {
    // Test various injection vulnerabilities
    
    const injectionPlugin = {
      name: 'InjectionPlugin',
      
      beforeRequest(args) {
        const injectionPatterns = [
          { pattern: /\$\{.*\}/, type: 'TEMPLATE_INJECTION' },
          { pattern: /{{.*}}/, type: 'TEMPLATE_INJECTION' },
          { pattern: /\.\.[\/\\]/, type: 'PATH_TRAVERSAL' },
          { pattern: /[\r\n]/, type: 'CRLF_INJECTION' },
          { pattern: /%0[dD]|%0[aA]/, type: 'CRLF_INJECTION' },
          { pattern: /[;&|`]/, type: 'COMMAND_INJECTION' }
        ];

        for (const { pattern, type } of injectionPatterns) {
          if (pattern.test(args.id)) {
            auditor.reportVulnerability(type, 'HIGH', {
              location: 'beforeRequest',
              moduleId: args.id,
              pattern: pattern.toString(),
              message: `Potential ${type} in module ID`
            });
          }
        }

        return args;
      }
    };

    const federation = new ModuleFederation({
      name: 'injection-test',
      remotes: [{
        name: 'injectable',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [injectionPlugin]
    });

    // Test injection payloads
    const injectionPayloads = [
      'injectable/../../../etc/passwd',
      'injectable/${process.env.SECRET}',
      'injectable/module\r\nSet-Cookie: session=hijacked',
      'injectable/module;rm -rf /',
      'injectable/{{7*7}}',
      'injectable/module%0d%0aContent-Type:%20text/html'
    ];

    for (const payload of injectionPayloads) {
      try {
        await federation.loadRemote(payload);
      } catch (error) {
        auditor.trackSecurityEvent({
          type: 'injection_blocked',
          payload,
          error: error.message
        });
      }
    }

    console.log('Injection attack test results:', {
      injectionVulnerabilities: auditor.vulnerabilities.filter(v => v.details.pattern).length,
      blockedInjections: auditor.securityEvents.filter(e => e.type === 'injection_blocked').length
    });
  });

  test('SECURITY AUDIT SUMMARY', () => {
    const report = auditor.generateReport();
    
    console.log('\nSecurity Audit Report:');
    console.log('======================');
    console.log(`Total Vulnerabilities Found: ${report.totalVulnerabilities}`);
    console.log('\nSeverity Breakdown:');
    console.log(`  CRITICAL: ${report.severityCounts.CRITICAL || 0}`);
    console.log(`  HIGH: ${report.severityCounts.HIGH || 0}`);
    console.log(`  MEDIUM: ${report.severityCounts.MEDIUM || 0}`);
    console.log(`  LOW: ${report.severityCounts.LOW || 0}`);
    
    console.log('\nVulnerability Types:');
    const typeCount = report.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.type] = (acc[vuln.type] || 0) + 1;
      return acc;
    }, {});
    
    for (const [type, count] of Object.entries(typeCount)) {
      console.log(`  ${type}: ${count}`);
    }
    
    console.log('\nSecurity Events:', report.securityEvents.length);
    
    // Fail if critical vulnerabilities found
    expect(report.severityCounts.CRITICAL || 0).toBe(0);
  });
});

module.exports = { SecurityAuditor };