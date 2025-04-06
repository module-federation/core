import * as fs from 'fs';
import * as ts from 'typescript';
import * as child_process from 'child_process'; // Keep for potential other commands
import * as path from 'path';
import { getPropertiesForMangling, PropertyConfig } from './property-analyzer';
import { run as runJscodeshift } from 'jscodeshift/src/Runner'; // Import the runner
import * as glob from 'glob'; // To find files for jscodeshift

// Configuration
const RUNTIME_CORE_SRC = 'packages/runtime-core/src';
const RUNTIME_CORE_ROOT = 'packages/runtime-core'; // Root of the package
const CONSTANTS_FILE_PATH = path.join(RUNTIME_CORE_SRC, 'constant.ts');
const TSCONFIG_PATH = path.join(RUNTIME_CORE_ROOT, 'tsconfig.lib.json'); // Path to tsconfig
const MIN_OCCURRENCES = 1; // Ensure all identified safe properties are included
const TRANSFORMATION_FILE = path.resolve(
  __dirname,
  './property-to-constant-codemod.ts',
); // Absolute path

// Run function for simple commands (if needed elsewhere)
function runSimpleCommand(command: string): string {
  console.log(`Running: ${command}`);
  try {
    return child_process.execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Step 1: Run property analyzer to identify candidates
function analyzeProperties(): PropertyConfig[] {
  console.log('\n--------- STEP 1: Analyzing Properties ---------');

  // Use the property-analyzer module directly instead of running it via CLI
  const propertyPatterns = [`${RUNTIME_CORE_SRC}/**/*.ts`];

  // Get properties for mangling
  const propertyConfigs = getPropertiesForMangling(propertyPatterns, {
    minOccurrences: MIN_OCCURRENCES,
    excludeBuiltIns: true, // Rely on analyzer's built-in exclusion
    prefix: 'PROP_',
  });

  // Additional filtering to exclude problematic properties
  const problematicProps = new Set(['for']);

  const filteredConfigs = propertyConfigs.filter(
    (config) => !problematicProps.has(config.propertyName),
  );

  // Display the identified properties
  console.log(
    `\nIdentified ${filteredConfigs.length} properties for mangling:`,
  );
  filteredConfigs.forEach((config) => {
    console.log(`- ${config.propertyName} → ${config.constantName}`);
  });

  return filteredConfigs;
}

// Step 2: Update constants file with property constants
function updateConstants(propertyConfigs: PropertyConfig[]): void {
  console.log('\n--------- STEP 2: Updating Constants ---------');

  if (propertyConfigs.length === 0) {
    console.log('No properties to add as constants.');
    return;
  }

  // Read the constants file
  const constantsContent = fs.readFileSync(CONSTANTS_FILE_PATH, 'utf8');

  // Parse it to check which constants are already defined
  const sourceFile = ts.createSourceFile(
    CONSTANTS_FILE_PATH,
    constantsContent,
    ts.ScriptTarget.Latest,
    true,
  );

  const existingConstants = new Set<string>();

  // Visit each node to find export declarations
  function visit(node: ts.Node) {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          existingConstants.add(declaration.name.text);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Generate new constant declarations if they don't already exist
  let newContent = constantsContent;
  let addedCount = 0;

  // Ensure constants file ends with a newline if not empty
  if (newContent.length > 0 && !newContent.endsWith('\n')) {
    newContent += '\n';
  }

  propertyConfigs.forEach((config) => {
    if (!existingConstants.has(config.constantName)) {
      // Add newline before export if content exists, ensures separation
      if (newContent.length > 0 && !newContent.endsWith('\n\n')) {
        if (!newContent.endsWith('\n')) {
          newContent += '\n';
        }
        newContent += '\n';
      }
      newContent += `export const ${config.constantName} = '${config.propertyName}';\n`;
      addedCount++;
    }
  });

  // Write back only if we have new constants
  if (addedCount > 0) {
    fs.writeFileSync(CONSTANTS_FILE_PATH, newContent);
    console.log(
      `Added ${addedCount} property constants to ${CONSTANTS_FILE_PATH}`,
    );
  } else {
    console.log('No new constants needed to be added.');
  }
}

// Step 2.5: Force TypeScript declaration file generation
function generateDeclarations(): void {
  console.log('\n--------- STEP 2.5: Generating Declaration Files ---------');
  // Use --emitDeclarationOnly and --project flags
  runSimpleCommand(`pnpm tsc --emitDeclarationOnly --project ${TSCONFIG_PATH}`);
  console.log('Declaration files generated.');
}

// Step 3: Run the property-to-constant-codemod programmatically
async function runCodemod(propertyConfigs: PropertyConfig[]): Promise<void> {
  // Make async
  console.log('--------- STEP 3: Running Codemod Programmatically ---------');

  const filesToProcess = glob.sync(`${RUNTIME_CORE_SRC}/**/*.{ts,tsx}`, {
    ignore: [`**/${path.basename(CONSTANTS_FILE_PATH)}`, '**/*.d.ts'], // Explicitly ignore constants and d.ts
    absolute: true,
  });

  if (filesToProcess.length === 0) {
    console.log('No files found to process with codemod.');
    return;
  }

  console.log(`Processing ${filesToProcess.length} files...`);

  const options = {
    dry: false,
    print: false,
    verbose: 1, // 0: quiet, 1: normal, 2: verbose
    parser: 'ts', // Use the TypeScript parser
    extensions: 'ts,tsx', // Use comma-separated string
    ignorePattern: [], // Handled by glob pattern above
    ignoreConfig: [],
    runInBand: false, // Run in parallel
    silent: false,
    babel: true, // Assume babel is available if needed by parser
    // --- Crucially, pass the propertyConfigs to the transformer ---
    propertyConfigs: propertyConfigs,
  };

  try {
    const result = await runJscodeshift(
      TRANSFORMATION_FILE,
      filesToProcess,
      options,
    );

    console.log('Codemod finished.');
    console.log(`- OK: ${result.ok}`);
    console.log(`- Errors: ${result.error}`);
    console.log(`- Skipped: ${result.skip}`);
    console.log(`- Nochange: ${result.nochange}`);

    if (result.error > 0) {
      console.error('Codemod encountered errors.');
      // Optionally exit or handle errors differently
      // process.exit(1);
    }
  } catch (error) {
    console.error('Failed to run jscodeshift programmatically:');
    console.error(error);
    process.exit(1);
  }
}

// Main function to run all steps
async function main() {
  // Make main async
  console.log('\n========= Property Transformation Workflow =========\n');

  try {
    // Step 1: Analyze properties
    const propertyConfigs = analyzeProperties();

    // Step 2: Update constants
    updateConstants(propertyConfigs);

    // Step 2.5: Generate declaration files
    generateDeclarations();

    // Step 3: Run the codemod programmatically
    await runCodemod(propertyConfigs);

    console.log('\n========= Transformation Script Complete =========\n');
    console.log('Generated constants and transformed code.');

    // Print the git diff
    console.log('\n--------- Git Diff ---------');
    runSimpleCommand('git diff HEAD');

    // Try to build the package
    console.log('\n--------- Building runtime-core ---------');
    console.log('Running: npx nx build runtime-core');

    try {
      child_process.execSync(
        'npx nx build runtime-core && pnpm run build:pkg',
        {
          encoding: 'utf-8',
          stdio: 'inherit', // Show build output in real-time
        },
      );

      // After successful build, run getsize to show bundle size metrics
      console.log('\n--------- Bundle Size Analysis ---------');
      console.log(
        'Running: npx nx build bundle-size --configuration=production',
      );

      try {
        // First build the bundle-size app to ensure it has latest runtime-core
        child_process.execSync(
          'npx nx build bundle-size --configuration=production',
          {
            encoding: 'utf-8',
            stdio: 'inherit',
          },
        );

        console.log('\nChecking bundle sizes:');
        // Use direct ls command instead of nx getsize to get accurate output
        const remoteEntrySize = child_process
          .execSync(
            "ls -lh apps/bundle-size/dist/remoteEntry.js | awk '{print $5}'",
            {
              encoding: 'utf-8',
            },
          )
          .trim();

        // Check runtime-core output size for all files
        console.log('\nRuntime Core Size Details:');
        const runtimeCoreFiles = child_process.execSync(
          'ls -lh packages/runtime-core/dist/',
          {
            encoding: 'utf-8',
          },
        );
        console.log(runtimeCoreFiles);

        // Still show the main file size for quick reference
        const runtimeCoreSize = child_process
          .execSync(
            "ls -lh packages/runtime-core/dist/index.esm.mjs | awk '{print $5}'",
            {
              encoding: 'utf-8',
            },
          )
          .trim();

        console.log('Bundle size metrics:');
        console.log(`📦 Remote Entry Size: ${remoteEntrySize}`);
        console.log(`📦 Runtime Core Size: ${runtimeCoreSize}`);

        // Print a summary of the files in the bundle-size dist directory
        console.log('\nBundle-size dist directory contents:');
        const bundleSizeFiles = child_process.execSync(
          'ls -lh apps/bundle-size/dist | grep -v @mf-types',
          {
            encoding: 'utf-8',
          },
        );
        console.log(bundleSizeFiles);
      } catch (sizeError) {
        console.error('Error running bundle size analysis:', sizeError.message);
        // Don't exit the process, just report the error and continue
      }

      console.log('\n✅ Build successful! You can now commit the changes.');
    } catch (buildError) {
      console.error('\n❌ Build failed. Resetting runtime-core directory...');

      // Reset the runtime-core directory
      // console.log('Running: git checkout -- packages/runtime-core');
      // child_process.execSync('git checkout -- packages/runtime-core', {
      //   encoding: 'utf-8',
      //   stdio: 'inherit'
      // });
    }
  } catch (error) {
    console.error('\n========= Transformation Failed =========\n');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
