import { FileInfo, API, ASTPath, MemberExpression, Options } from 'jscodeshift';
import * as path from 'path';
// Remove direct dependency on the analyzer module
// import { getPropertiesForMangling, PropertyConfig } from './property-analyzer';

// Define the expected shape of the options passed to the transformer
interface CodemodOptions extends Options {
  propertyConfigs: PropertyConfig[];
}

// Define PropertyConfig locally as it's no longer imported
interface PropertyConfig {
  propertyName: string;
  constantName: string;
  minOccurrences: number;
}

// Debug flag - set to true to see more info during transformation
const DEBUG = false; // Keep debug off by default

// Parser configuration
export const parser = 'ts';

// REMOVED: Cached property configs and getPropertiesToTransform function
// The propertyConfigs will now be passed via options

// Helper function to transform deeper property chains after initial transformation
function transformDeepPropertyChains(
  j: any,
  root: any,
  propertyConfigs: PropertyConfig[],
  importedConstants: Set<string>,
): boolean {
  // Create a map of property names to constant names for quick lookup
  const propToConstMap = new Map<string, string>();
  propertyConfigs.forEach((config) => {
    propToConstMap.set(config.propertyName, config.constantName);
  });

  // Find all member expressions that might be part of property chains
  const allMemberExpressions = root.find(j.MemberExpression);
  let hasChanges = false;
  let changesCount = 0;

  // Maximum number of iterations to prevent infinite loops
  const MAX_ITERATIONS = 40; // Adjust as needed for complex chains
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    hasChanges = false;

    // Process each member expression
    allMemberExpressions.forEach((path) => {
      // Skip if this is already computed
      if (path.node.computed) return;

      // Check if property name is in our map
      const propertyName =
        path.node.property.type === 'Identifier'
          ? path.node.property.name
          : null;
      if (!propertyName || !propToConstMap.has(propertyName)) return;

      // Transform this property
      const constantName = propToConstMap.get(propertyName)!;
      j(path).replaceWith((p) => {
        hasChanges = true;
        changesCount++;
        importedConstants.add(constantName); // Track needed import
        return j.memberExpression(
          p.node.object,
          j.identifier(constantName),
          true, // computed
        );
      });
    });

    if (!hasChanges) break; // Exit loop if no changes in this iteration
  }

  if (DEBUG && changesCount > 0) {
    console.log(`Transformed ${changesCount} deep property chains`);
  }

  return changesCount > 0;
}

// Transform object literals properties in various contexts
function transformObjectLiteralKeys(
  j: any,
  root: any,
  propertyConfigs: PropertyConfig[],
  importedConstants: Set<string>,
): boolean {
  const propToConstMap = new Map<string, string>();
  propertyConfigs.forEach((config) => {
    propToConstMap.set(config.propertyName, config.constantName);
  });

  let hasChanges = false;

  // Find all object literals
  root.find(j.ObjectExpression).forEach((path) => {
    path.node.properties.forEach((prop) => {
      // Skip spread elements and already computed properties
      if (prop.type !== 'Property' || prop.computed || prop.method) return;

      let propName: string | null = null;
      if (prop.key.type === 'Identifier' && propToConstMap.has(prop.key.name)) {
        propName = prop.key.name;
      } else if (
        prop.key.type === 'StringLiteral' &&
        propToConstMap.has(prop.key.value)
      ) {
        propName = prop.key.value;
      }

      if (propName) {
        const constName = propToConstMap.get(propName)!;
        if (DEBUG)
          console.log(
            `Transforming object property "${propName}" to "[${constName}]"`,
          );

        // Transform the property
        prop.key = j.identifier(constName);
        prop.computed = true;
        importedConstants.add(constName); // Track needed import
        hasChanges = true;
      }
    });
  });

  return hasChanges;
}

// Transform class property declarations and methods
function transformClassPropertiesAndMethods(
  j: any,
  root: any,
  propertyConfigs: PropertyConfig[],
  importedConstants: Set<string>,
): boolean {
  const propToConstMap = new Map<string, string>();
  propertyConfigs.forEach((config) => {
    propToConstMap.set(config.propertyName, config.constantName);
  });

  let hasChanges = false;

  // Find INITIALIZED class property declarations
  root.find(j.ClassProperty, { computed: false }).forEach((path) => {
    if (
      path.node.key.type === 'Identifier' &&
      propToConstMap.has(path.node.key.name) &&
      path.node.value // Only transform if it has an initializer
    ) {
      const propName = path.node.key.name;
      const constName = propToConstMap.get(propName)!;

      if (DEBUG)
        console.log(
          `Transforming initialized class property "${propName}" to "[${constName}]"`,
        );

      // Transform the property key
      path.node.key = j.identifier(constName);
      path.node.computed = true;
      importedConstants.add(constName); // Track needed import
      hasChanges = true;
    }
  });

  // Find class methods
  root.find(j.MethodDefinition, { computed: false }).forEach((path) => {
    if (
      path.node.key.type === 'Identifier' &&
      propToConstMap.has(path.node.key.name)
    ) {
      const propName = path.node.key.name;
      const constName = propToConstMap.get(propName)!;

      if (DEBUG)
        console.log(
          `Transforming class method "${propName}" to "[${constName}]"`,
        );

      // Transform the method name
      path.node.key = j.identifier(constName);
      path.node.computed = true;
      importedConstants.add(constName); // Track needed import
      hasChanges = true;
    }
  });

  return hasChanges;
}

// Path to the constants file relative to the project root
export const CONSTANTS_FILE_PATH = 'packages/runtime-core/src/constant.ts';

/**
 * Main transform function for jscodeshift
 */
export default function transformer(
  file: FileInfo,
  api: API,
  options: CodemodOptions,
) {
  // Added options parameter
  const j = api.jscodeshift;
  const root = j(file.source);

  // Skip processing the constants file itself
  if (file.path.endsWith(CONSTANTS_FILE_PATH)) {
    // if (DEBUG) console.log(`Skipping constants file: ${file.path}`);
    return file.source;
  }

  // Ensure we're only processing files in the runtime-core directory
  if (!file.path.includes('packages/runtime-core/src')) {
    // if (DEBUG) console.log(`Skipping file outside of runtime-core: ${file.path}`);
    return file.source;
  }

  // Skip TypeScript declaration files
  if (file.path.endsWith('.d.ts')) {
    // if (DEBUG) console.log(`Skipping declaration file: ${file.path}`);
    return file.source;
  }

  // if (DEBUG) console.log(`Processing file: ${file.path}`);

  // Get properties to transform FROM OPTIONS
  const PROPERTIES_TO_TRANSFORM = options.propertyConfigs || [];
  if (!PROPERTIES_TO_TRANSFORM || PROPERTIES_TO_TRANSFORM.length === 0) {
    console.warn(
      `No propertyConfigs provided for ${file.path}, skipping transformation.`,
    );
    return file.source; // No properties to transform
  }

  let hasModifications = false;
  const importedConstants = new Set<string>(); // Track constants used in this file

  // --- Apply Transformations ---

  // Transform class properties/methods and object keys first, as they might contain nested accesses
  hasModifications =
    transformClassPropertiesAndMethods(
      j,
      root,
      PROPERTIES_TO_TRANSFORM,
      importedConstants,
    ) || hasModifications;
  hasModifications =
    transformObjectLiteralKeys(
      j,
      root,
      PROPERTIES_TO_TRANSFORM,
      importedConstants,
    ) || hasModifications;

  // Transform direct member accesses (obj.propName) and shorthand properties ({ propName })
  PROPERTIES_TO_TRANSFORM.forEach((config) => {
    // Find property access expressions: obj.propName or obj?.propName
    root
      .find(j.MemberExpression, {
        property: { type: 'Identifier', name: config.propertyName },
        computed: false,
      })
      .filter((path) => {
        // Special case: Don't transform Object.defineProperty when setting shareScopeMap
        // This ensures TypeScript understands the property is added to the object
        if (
          config.propertyName === 'defineProperty' &&
          path.node.object.type === 'Identifier' &&
          path.node.object.name === 'Object'
        ) {
          // Check for the special case Object.defineProperty calls that add shareScopeMap
          const parent = path.parent.node;
          if (
            parent &&
            parent.type === 'CallExpression' &&
            parent.arguments.length >= 2 &&
            ((parent.arguments[1].type === 'StringLiteral' &&
              parent.arguments[1].value === 'shareScopeMap') ||
              (parent.arguments[1].type === 'Literal' &&
                parent.arguments[1].value === 'shareScopeMap'))
          ) {
            if (DEBUG)
              console.log(
                'Skipping transformation of Object.defineProperty for shareScopeMap',
              );
            return false;
          }
        }

        return true;
      })
      .replaceWith((path: ASTPath<MemberExpression>) => {
        hasModifications = true;
        importedConstants.add(config.constantName);
        const newMemberExpression = j.memberExpression(
          path.node.object,
          j.identifier(config.constantName),
          true, // Set computed to true
        );
        // Preserve optional chaining if it existed
        newMemberExpression.optional = path.node.optional;
        return newMemberExpression;
      });

    // Find shorthand properties in object literals: { propName } -> { [PROP_NAME]: propName }
    root
      .find(j.ObjectProperty, {
        key: { type: 'Identifier', name: config.propertyName },
        shorthand: true,
      })
      .replaceWith((path) => {
        hasModifications = true;
        importedConstants.add(config.constantName);
        return {
          type: 'Property',
          key: j.identifier(config.constantName),
          value: j.identifier(config.propertyName),
          kind: 'init',
          method: false,
          shorthand: false,
          computed: true,
        };
      });
  });

  // Apply transformations for deeper property chains (e.g., obj.prop1.prop2)
  // This needs to run *after* initial direct accesses are transformed
  hasModifications =
    transformDeepPropertyChains(
      j,
      root,
      PROPERTIES_TO_TRANSFORM,
      importedConstants,
    ) || hasModifications;

  // --- Add Import Statement ---

  // Add import statement only if modifications were made AND constants were used
  if (hasModifications && importedConstants.size > 0) {
    const constArray = Array.from(importedConstants).sort(); // Sort for deterministic output

    if (DEBUG)
      console.log(
        `Adding/updating imports for constants: ${constArray.join(', ')}`,
      );

    // Determine the correct import path
    const importSource = determineImportPath(file.path, CONSTANTS_FILE_PATH);

    // Find existing imports from the constants file
    const existingImports = root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.type === 'StringLiteral' &&
          path.node.source.value === importSource,
      );

    if (existingImports.length > 0) {
      if (DEBUG)
        console.log(
          `Found existing import in ${file.path} from ${importSource}`,
        );
      const existingImport = existingImports.get(0);
      const existingSpecifiers = existingImport.node.specifiers || [];
      const existingNames = new Set(
        existingSpecifiers
          .filter(
            (spec: any) =>
              spec.type === 'ImportSpecifier' &&
              spec.imported?.type === 'Identifier',
          )
          .map((spec: any) => spec.imported.name),
      );

      // Add new constants that aren't already imported
      const newSpecifiers = existingSpecifiers.slice(); // Copy existing
      constArray.forEach((constantName) => {
        if (!existingNames.has(constantName)) {
          if (DEBUG) console.log(`Adding ${constantName} to existing import`);
          newSpecifiers.push(j.importSpecifier(j.identifier(constantName)));
        }
      });
      // Sort specifiers alphabetically for consistency
      newSpecifiers.sort((a, b) => {
        const nameA =
          a.type === 'ImportSpecifier' && a.imported ? a.imported.name : '';
        const nameB =
          b.type === 'ImportSpecifier' && b.imported ? b.imported.name : '';
        return nameA.localeCompare(nameB);
      });
      existingImport.node.specifiers = newSpecifiers;
    } else {
      // Create new import statement
      if (DEBUG) console.log(`Creating new import with path: ${importSource}`);
      const importDeclaration = j.importDeclaration(
        constArray.map((name) => j.importSpecifier(j.identifier(name))),
        j.literal(importSource),
      );

      // Add import to top of file, after any existing imports
      const lastImport = root.find(j.ImportDeclaration).at(-1);
      if (lastImport.length > 0) {
        lastImport.insertAfter(importDeclaration);
      } else {
        // No existing imports, add at the very beginning
        root.get().value.program.body.unshift(importDeclaration);
      }
    }
  }

  return hasModifications ? root.toSource({ quote: 'single' }) : file.source;
}

/**
 * Determines the relative import path from the current file to the constants file
 */
function determineImportPath(filePath: string, constantsPath: string): string {
  try {
    if (DEBUG)
      console.log(
        `Calculating import path from ${filePath} to ${constantsPath}`,
      );

    const fileDir = path.dirname(filePath);
    const constantsDir = path.dirname(constantsPath);

    // If they are in the same directory
    if (fileDir === constantsDir) {
      return './' + path.basename(constantsPath, '.ts');
    }

    // Calculate relative path
    let relativePath = path.relative(fileDir, constantsPath);
    // Remove .ts extension
    relativePath = relativePath.replace(/\.ts$/, '');
    // Ensure it starts with ./ or ../
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    // Normalize path separators for cross-platform consistency
    relativePath = relativePath.replace(/\\/g, '/');

    if (DEBUG) console.log(`Calculated relative path: ${relativePath}`);

    return relativePath;
  } catch (error) {
    console.error(`Error calculating import path:`, error);
    // Fallback, though this shouldn't happen with valid paths
    const constantsBase = path.basename(constantsPath, '.ts');
    return './' + constantsBase;
  }
}

/**
 * Companion function to update the constants file
 * This would be run as a separate step before the main codemod
 */
export function updateConstantsFile(constantsFilePath: string): void {
  // In a real implementation, you would:
  // 1. Read the constants file
  // 2. Parse it to check which constants are already defined
  // 3. Append new constants
  // 4. Write the updated file
  // Example implementation (pseudo-code):
  /*
  const constantsContent = fs.readFileSync(constantsFilePath, 'utf8');
  const existingConstants = new Set(
    // Parse the file to extract existing constant names
  );

  let newContent = constantsContent;
  PROPERTIES_TO_TRANSFORM.forEach(config => {
    if (!existingConstants.has(config.constantName)) {
      newContent += `\nexport const ${config.constantName} = '${config.propertyName}';`;
    }
  });

  fs.writeFileSync(constantsFilePath, newContent);
  */
}
