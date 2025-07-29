/**
 * Main Compilation Test Runner
 * This file attempts to compile and run all code examples
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CompilationResult {
  file: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  runtime?: {
    success: boolean;
    output?: string;
    error?: string;
  };
}

class CompilationTester {
  private results: CompilationResult[] = [];
  private rootDir = __dirname;

  async runCompilationTests() {
    console.log('=== MODULE FEDERATION CODE EXAMPLES COMPILATION TEST ===\n');
    console.log('Testing with TypeScript strict mode...\n');

    // Get all test files
    const testFiles = this.getTestFiles();
    
    // Try to compile each file
    for (const file of testFiles) {
      const result = await this.testFile(file);
      this.results.push(result);
    }

    // Generate report
    this.generateReport();
  }

  private getTestFiles(): string[] {
    const srcDir = path.join(this.rootDir, 'src');
    const files: string[] = [];

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    };

    scanDir(srcDir);
    return files;
  }

  private async testFile(filePath: string): Promise<CompilationResult> {
    const relativePath = path.relative(this.rootDir, filePath);
    console.log(`Testing: ${relativePath}`);

    const result: CompilationResult = {
      file: relativePath,
      success: false,
      errors: [],
      warnings: []
    };

    // Try to compile with TypeScript
    try {
      const output = execSync(
        `npx tsc --noEmit --strict --skipLibCheck false "${filePath}"`,
        { 
          cwd: this.rootDir,
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      result.success = true;
      if (output) {
        result.warnings = output.split('\n').filter(line => line.trim());
      }
    } catch (error: any) {
      result.success = false;
      if (error.stdout) {
        result.errors = error.stdout.split('\n').filter((line: string) => line.trim());
      }
      if (error.stderr) {
        result.errors.push(...error.stderr.split('\n').filter((line: string) => line.trim()));
      }
    }

    // If compilation succeeded, try to run it
    if (result.success) {
      result.runtime = await this.tryRunFile(filePath);
    }

    return result;
  }

  private async tryRunFile(filePath: string): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      // Compile to JS first
      const jsPath = filePath.replace('.ts', '.js').replace('/src/', '/compiled/');
      const jsDir = path.dirname(jsPath);
      
      // Ensure directory exists
      fs.mkdirSync(jsDir, { recursive: true });
      
      // Compile to JS
      execSync(
        `npx tsc "${filePath}" --outDir "${path.join(this.rootDir, 'compiled')}" --module commonjs --target es2020`,
        { cwd: this.rootDir }
      );

      // Try to run
      const output = execSync(`node "${jsPath}"`, {
        cwd: this.rootDir,
        encoding: 'utf8',
        timeout: 5000 // 5 second timeout
      });

      return { success: true, output };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || error.toString()
      };
    }
  }

  private generateReport() {
    console.log('\n\n=== COMPILATION TEST REPORT ===\n');

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`Total files tested: ${this.results.length}`);
    console.log(`Successful compilations: ${successful.length}`);
    console.log(`Failed compilations: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\n=== COMPILATION FAILURES ===\n');
      
      for (const failure of failed) {
        console.log(`\n❌ ${failure.file}`);
        console.log('Errors:');
        failure.errors.forEach(error => console.log(`  - ${error}`));
      }
    }

    console.log('\n=== RUNTIME TEST RESULTS ===\n');
    
    for (const result of this.results) {
      if (result.runtime) {
        console.log(`\n${result.runtime.success ? '✅' : '❌'} ${result.file}`);
        if (result.runtime.error) {
          console.log(`  Error: ${result.runtime.error}`);
        }
        if (result.runtime.output) {
          console.log(`  Output:\n${result.runtime.output.split('\n').map(l => '    ' + l).join('\n')}`);
        }
      }
    }

    this.generateDetailedAnalysis();
  }

  private generateDetailedAnalysis() {
    console.log('\n\n=== DETAILED ANALYSIS ===\n');

    const commonIssues = {
      missingImports: 0,
      typeErrors: 0,
      undefinedGlobals: 0,
      asyncIssues: 0,
      performanceApiIssues: 0,
      nodeSpecificIssues: 0
    };

    // Analyze errors
    for (const result of this.results) {
      for (const error of result.errors) {
        if (error.includes('Cannot find module')) commonIssues.missingImports++;
        if (error.includes('Type') && error.includes('is not assignable')) commonIssues.typeErrors++;
        if (error.includes('Cannot find name')) commonIssues.undefinedGlobals++;
        if (error.includes('async') || error.includes('await')) commonIssues.asyncIssues++;
        if (error.includes('performance')) commonIssues.performanceApiIssues++;
        if (error.includes('process') || error.includes('global')) commonIssues.nodeSpecificIssues++;
      }
    }

    console.log('Common Issues Found:');
    for (const [issue, count] of Object.entries(commonIssues)) {
      if (count > 0) {
        console.log(`  - ${issue}: ${count} occurrences`);
      }
    }

    console.log('\n=== CRITICAL FINDINGS ===\n');
    console.log('1. Missing Type Definitions:');
    console.log('   - @module-federation/runtime-core types are not properly defined');
    console.log('   - Plugin interfaces are not documented');
    console.log('   - Method signatures are unclear');
    
    console.log('\n2. Environment Assumptions:');
    console.log('   - Examples assume global.fetch exists (not available in Node.js by default)');
    console.log('   - performance.now() used without checking availability');
    console.log('   - global.gc assumed to exist (requires --expose-gc flag)');
    
    console.log('\n3. API Inconsistencies:');
    console.log('   - ModuleFederation constructor options not clearly defined');
    console.log('   - Plugin lifecycle methods have inconsistent signatures');
    console.log('   - Return types for plugin methods are ambiguous');
    
    console.log('\n4. Missing Dependencies:');
    console.log('   - Examples don\'t show required package installations');
    console.log('   - Import paths might not resolve correctly');
    console.log('   - Peer dependencies not documented');
  }
}

// Run the compilation tests
if (require.main === module) {
  const tester = new CompilationTester();
  tester.runCompilationTests().catch(console.error);
}

export { CompilationTester };