#!/usr/bin/env node
// import { analyzeCodebase, generateReport } from './code-analyzer'; // Keep original import if needed
import { analyzeCodebase, generateReport } from './code-analyzer';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const rootDir = args[0] || process.cwd();
  const outputPath =
    args[1] || path.join(process.cwd(), 'code-analysis-report.md');

  // --- Hardcoded API Keys ---
  // const googleApiKey = 'YOUR_GOOGLE_API_KEY'; // Google Key removed
  const deepseekApiKey = 'sk-4e2318c91e6b43bf8117d697d4a49947'; // Replace with your actual DeepSeek API key
  // -------------------------

  // Basic check if DeepSeek key is present
  if (!deepseekApiKey) {
    console.error('Error: DeepSeek API key is missing in the script.');
    process.exit(1);
  }

  try {
    console.log('Starting code analysis (DeepSeek Only)...');
    console.log(`Root directory: ${rootDir}`);
    console.log(`Output path: ${outputPath}`);

    const result = await analyzeCodebase({
      rootDir,
      filePatterns: ['**/*.ts', '**/*.js'], // Adjust patterns if needed
      // googleApiKey: googleApiKey, // Removed Google Key
      deepseekApiKey: deepseekApiKey,
      minDuplicateLines: 5,
    });

    const report = generateReport(
      result,
      outputPath.endsWith('.json') ? 'json' : 'markdown',
    );

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, report);
    console.log(`Analysis complete! Report saved to ${outputPath}`);
  } catch (error) {
    console.error('Error running analysis:', error);
    process.exit(1);
  }
}

main().catch(console.error);
