import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface PropertyStats {
  name: string;
  occurrences: number;
  totalBytes: number;
  safeToMangle: boolean;
  isBuiltIn: boolean; // Flag to identify built-in JavaScript properties
  locations: Set<string>; // Tracks files where property is used
  usageTypes: Set<string>; // Tracks how property is used (access, assignment, etc.)
}

// Helper function to collect all properties from built-in objects and their prototypes
function collectBuiltinProperties(): Set<string> {
  const builtInProps = new Set<string>();

  // Process an object to extract its properties and prototype properties
  function processObject(obj: any, name?: string): void {
    try {
      // Static methods/properties
      Object.getOwnPropertyNames(obj).forEach((prop) => {
        builtInProps.add(prop);
      });

      // Check if the object has a prototype before accessing it
      if (obj.prototype && typeof obj.prototype === 'object') {
        Object.getOwnPropertyNames(obj.prototype).forEach((prop) => {
          builtInProps.add(prop);
        });
      }
    } catch (e) {
      // Some objects might not be accessible in all environments
      // console.log(`Error processing ${name || 'object'}:`, e);
    }
  }

  // ===== Core JS Objects =====
  // Basic Objects
  const coreObjects = [
    Object,
    Array,
    String,
    Number,
    Boolean,
    Date,
    RegExp,
    Function,
    Promise,
    Symbol,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Error,
    Math,
    JSON,
    Reflect,
  ];

  // Process core objects
  coreObjects.forEach((obj, i) => {
    // Safely get object name or use a default
    let objName = 'unknown';
    try {
      if (typeof obj === 'function' && obj.name) {
        objName = obj.name;
      } else if (obj === Math) {
        objName = 'Math';
      } else if (obj === JSON) {
        objName = 'JSON';
      } else if (obj === Reflect) {
        objName = 'Reflect';
      }
    } catch (e) {
      // Ignore errors when trying to get name
    }
    processObject(obj, objName);
  });

  // ===== Error Types =====
  const errorTypes = [
    Error,
    TypeError,
    SyntaxError,
    ReferenceError,
    RangeError,
    URIError,
    EvalError,
    AggregateError,
  ];
  errorTypes.forEach((err) => processObject(err, err.name));

  // ===== Typed Arrays =====
  const typedArrays = [
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array,
    DataView,
    ArrayBuffer,
  ];
  typedArrays.forEach((arr) => processObject(arr, arr.name));

  // ===== Web APIs =====
  // Get common Window properties if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      // Browser Objects
      const browserObjects = [
        window.document,
        window.navigator,
        window.location,
        window.history,
        window.screen,
        window.localStorage,
        window.sessionStorage,
        window.console,
        window.fetch,
      ];

      browserObjects.forEach((obj) => {
        if (obj)
          Object.getOwnPropertyNames(obj).forEach((prop) =>
            builtInProps.add(prop),
          );
      });

      // HTML Element APIs
      if (window.HTMLElement) {
        processObject(window.HTMLElement);
        processObject(window.Element);
        processObject(window.Node);
      }

      // DOM Event API
      if (window.Event) {
        processObject(window.Event);
        processObject(window.EventTarget);
      }
    } catch (e) {
      // Ignore errors in browser APIs
    }
  }

  // ===== Node.js Objects =====
  try {
    if (typeof process === 'object' && typeof global !== 'undefined') {
      // Node.js specific globals
      const nodeObjects = [process, global];
      nodeObjects.forEach((obj) => {
        if (obj)
          Object.getOwnPropertyNames(obj).forEach((prop) =>
            builtInProps.add(prop),
          );
      });

      // Buffer API
      if (global.Buffer) {
        processObject(global.Buffer, 'Buffer');
      }

      // Stream API
      if (global.Stream) {
        processObject(global.Stream, 'Stream');
      }
    }
  } catch (e) {
    // Ignore errors in Node.js APIs
  }

  // ===== Common DOM API Properties =====
  // These are properties that might not be detected in a Node.js environment
  const domProps = [
    // Element manipulation
    'querySelector',
    'querySelectorAll',
    'getElementById',
    'getElementsByClassName',
    'getElementsByTagName',
    'createElement',
    'createTextNode',
    'appendChild',
    'removeChild',
    'insertBefore',
    'replaceChild',
    'cloneNode',
    'remove',
    'contains',

    // Element properties
    'classList',
    'className',
    'id',
    'style',
    'innerHTML',
    'outerHTML',
    'textContent',
    'innerText',
    'outerText',
    'value',
    'checked',
    'selected',
    'disabled',
    'readOnly',
    'src',
    'href',
    'target',
    'rel',
    'alt',
    'title',
    'placeholder',

    // Events
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
    'click',
    'focus',
    'blur',
    'submit',
    'change',
    'input',
    'keydown',
    'keyup',
    'keypress',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseover',
    'mouseout',
    'mouseenter',
    'mouseleave',

    // Attributes
    'getAttribute',
    'setAttribute',
    'removeAttribute',
    'hasAttribute',
    'dataset',

    // Navigation
    'childNodes',
    'children',
    'firstChild',
    'lastChild',
    'nextSibling',
    'previousSibling',
    'parentNode',
    'parentElement',
    'nodeType',
    'nodeName',
    'tagName',

    // BOM APIs
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'alert',
    'confirm',
    'prompt',
    'fetch',
    'open',
    'close',
    'print',
    'scroll',
    'scrollTo',
    'scrollBy',
    'resizeBy',
    'resizeTo',
    'moveBy',
    'moveTo',

    // Web APIs
    'localStorage',
    'sessionStorage',
    'navigator',
    'location',
    'history',
    'screen',
    'crypto',
    'performance',
    'console',
    'speechSynthesis',
    'indexedDB',
    'caches',
  ];

  domProps.forEach((prop) => builtInProps.add(prop));

  // ===== Framework/Library Properties =====
  // Common React, Vue, Angular, etc. properties
  const frameworkProps = [
    // React/Framework Component Lifecycle
    'render',
    'setState',
    'forceUpdate',
    'componentDidMount',
    'componentDidUpdate',
    'componentWillUnmount',
    'shouldComponentUpdate',
    'getSnapshotBeforeUpdate',
    'componentDidCatch',
    'getDerivedStateFromProps',
    'getDerivedStateFromError',

    // React Hooks
    'useEffect',
    'useState',
    'useContext',
    'useReducer',
    'useRef',
    'useMemo',
    'useCallback',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',

    // State Management (Redux, Vuex, etc.)
    'dispatch',
    'getState',
    'subscribe',
    'unsubscribe',
    'commit',
    'action',
    'mutation',
    'store',
    'reducer',
    'middleware',
    'enhancer',
    'thunk',

    // Vue specific
    'data',
    'methods',
    'computed',
    'watch',
    'props',
    'components',
    'directives',
    'filters',
    'mixins',
    'provide',
    'inject',

    // Angular specific
    'ngOnInit',
    'ngOnDestroy',
    'ngOnChanges',
    'ngAfterViewInit',
    'ngAfterContentInit',

    // Event handling
    'emit',
    'on',
    'off',
    'once',
    'trigger',
    'handle',
    'delegate',

    // Testing libraries (Jest, Mocha, etc.)
    'describe',
    'it',
    'test',
    'expect',
    'mock',
    'spy',
    'stub',
    'assert',
    'toBe',
    'toEqual',
    'toBeDefined',
    'toBeUndefined',
    'toBeTruthy',
    'toBeFalsy',
    'toContain',
    'toMatch',
    'toHaveBeenCalled',
    'toHaveBeenCalledWith',
    'toMatchObject',
    'toMatchSnapshot',
    'toThrow',
    'toHaveLength',
  ];

  frameworkProps.forEach((prop) => builtInProps.add(prop));

  // ===== Application-specific properties =====
  // These are specific to the module-federation runtime-core
  const appSpecificProps = ['nothingfornow'];

  appSpecificProps.forEach((prop) => builtInProps.add(prop));

  return builtInProps;
}

// Generate the set of built-in properties
export const BUILT_IN_PROPERTIES = collectBuiltinProperties();

// Properties that are likely part of public API interfaces
export const POTENTIAL_API_PATTERNS = [
  'api',
  'API',
  'public',
  'Public',
  'export',
  'Export',
  'interface',
  'Interface',
  'contract',
  'Contract',
];

// Main function to analyze files and find property usage
export function analyzeProperties(
  patterns: string[],
  options: {
    limit?: number;
    minOccurrences?: number;
    excludeUnsafe?: boolean;
    excludeBuiltIns?: boolean;
  } = {},
): PropertyStats[] {
  const propertyMap = new Map<string, PropertyStats>();

  // Find all files matching the patterns
  const filePaths = patterns.flatMap((pattern) =>
    glob.sync(pattern, { absolute: true }),
  );

  console.log(`Analyzing ${filePaths.length} files...`);

  // Process each file
  filePaths.forEach((filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true,
      );

      // Traverse the AST and collect properties
      collectProperties(
        sourceFile,
        propertyMap,
        path.relative(process.cwd(), filePath),
      );
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  });

  // Determine if properties are safe to mangle and if they're built-ins
  determinePropertyAttributes(propertyMap);

  // Convert map to array and calculate byte expense
  let propertyStats: PropertyStats[] = Array.from(propertyMap.values())
    .filter(
      (stat) =>
        !options.minOccurrences || stat.occurrences >= options.minOccurrences,
    )
    .filter((stat) => !options.excludeBuiltIns || !stat.isBuiltIn)
    .sort((a, b) => b.totalBytes - a.totalBytes);

  // Filter out unsafe properties if requested
  if (options.excludeUnsafe) {
    propertyStats = propertyStats.filter((stat) => stat.safeToMangle);
  }

  return propertyStats;
}

// Recursively traverse the AST to find all property usages
function collectProperties(
  node: ts.Node,
  propertyMap: Map<string, PropertyStats>,
  filePath: string,
): void {
  // Property access expressions (obj.prop)
  if (ts.isPropertyAccessExpression(node)) {
    const propertyName = node.name.text;
    addProperty(propertyMap, propertyName, filePath, 'access');
  }
  // Element access expressions with string literals (obj['prop'])
  else if (
    ts.isElementAccessExpression(node) &&
    node.argumentExpression &&
    ts.isStringLiteralLike(node.argumentExpression)
  ) {
    const propertyName = node.argumentExpression.text;
    addProperty(propertyMap, propertyName, filePath, 'bracketAccess');
  }
  // Object literal properties
  else if (ts.isPropertyAssignment(node)) {
    if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
      const propertyName = node.name.text;
      addProperty(propertyMap, propertyName, filePath, 'assignment');
    }
  }
  // Shorthand property assignments { prop }
  else if (ts.isShorthandPropertyAssignment(node)) {
    const propertyName = node.name.text;
    addProperty(propertyMap, propertyName, filePath, 'shorthand');
  }
  // Method declarations in classes/objects
  else if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
    const propertyName = node.name.text;
    addProperty(propertyMap, propertyName, filePath, 'methodDeclaration');
  }
  // Class property declarations
  else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
    const propertyName = node.name.text;
    addProperty(propertyMap, propertyName, filePath, 'propertyDeclaration');
  }
  // Interface property declarations
  else if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
    const propertyName = node.name.text;
    addProperty(propertyMap, propertyName, filePath, 'interfaceProperty');
  }

  // Continue traversing
  ts.forEachChild(node, (child) =>
    collectProperties(child, propertyMap, filePath),
  );
}

// Add a property to the map or update its stats
function addProperty(
  propertyMap: Map<string, PropertyStats>,
  propertyName: string,
  filePath: string,
  usageType: string,
): void {
  if (!propertyName) return;

  if (!propertyMap.has(propertyName)) {
    propertyMap.set(propertyName, {
      name: propertyName,
      occurrences: 0,
      totalBytes: 0,
      safeToMangle: true, // Will be determined later
      isBuiltIn: false, // Will be determined later
      locations: new Set<string>(),
      usageTypes: new Set<string>(),
    });
  }

  const stats = propertyMap.get(propertyName)!;
  stats.occurrences++;
  stats.totalBytes = stats.name.length * stats.occurrences;
  stats.locations.add(filePath);
  stats.usageTypes.add(usageType);
}

// Determine which properties are likely safe to mangle and which are built-ins
function determinePropertyAttributes(
  propertyMap: Map<string, PropertyStats>,
): void {
  propertyMap.forEach((prop) => {
    // Check if property is a built-in JavaScript property
    if (BUILT_IN_PROPERTIES.has(prop.name)) {
      prop.isBuiltIn = true;
      prop.safeToMangle = false;
      return;
    }

    // DOM-specific properties that shouldn't be mangled
    const DOM_PROPERTIES = new Set([
      'addEventListener',
      'removeEventListener',
      'querySelector',
      'querySelectorAll',
      'appendChild',
      'removeChild',
      'textContent',
      'innerText',
      'innerHTML',
      'style',
      'className',
      'classList',
      'id',
      'tagName',
      'nodeType',
      'parentNode',
      'src',
      'href',
      'target',
      'value',
      'checked',
    ]);

    if (DOM_PROPERTIES.has(prop.name)) {
      prop.safeToMangle = false;
      return;
    }

    // Short properties (1-2 chars) are already short enough and don't need mangling
    if (prop.name.length <= 3) {
      prop.safeToMangle = false;
      return;
    }

    // All other properties are considered safe to mangle
    // This is a very aggressive approach to property mangling
    prop.safeToMangle = true;
  });
}

// Output the results
function printResults(
  properties: PropertyStats[],
  options: {
    limit?: number;
    showUnsafe?: boolean;
    showLocations?: boolean;
    showBuiltIns?: boolean;
  } = {},
): void {
  console.log('\nProperty Analysis Results:');
  console.log('=========================');

  // Calculate potential savings
  const totalProperties = properties.length;
  const totalBytes = properties.reduce((sum, prop) => sum + prop.totalBytes, 0);
  const safeProperties = properties.filter((p) => p.safeToMangle);
  const safeBytes = safeProperties.reduce(
    (sum, prop) => sum + prop.totalBytes,
    0,
  );
  const builtInProperties = properties.filter((p) => p.isBuiltIn);

  // Display summary stats
  console.log(`Total unique properties: ${totalProperties}`);
  console.log(`Total bytes from property names: ${totalBytes}`);
  console.log(
    `Built-in JavaScript properties: ${builtInProperties.length} (${Math.round((builtInProperties.length / totalProperties) * 100)}%)`,
  );
  console.log(
    `Properties safe to mangle: ${safeProperties.length} (${Math.round((safeProperties.length / totalProperties) * 100)}%)`,
  );
  console.log(
    `Potential bytes saved by mangling: ${safeBytes} (${Math.round((safeBytes / totalBytes) * 100)}%)`,
  );
  console.log('=========================');

  // Display table header
  console.log(
    '| Property Name | Occurrences | Total Bytes | Built-in | Safe to Mangle | Usage Types |',
  );
  console.log(
    '|---------------|-------------|------------|----------|----------------|-------------|',
  );

  const displayProperties = options.limit
    ? properties.slice(0, options.limit)
    : properties;

  displayProperties.forEach((prop) => {
    // Skip unsafe properties if not showing them
    if (!options.showUnsafe && !prop.safeToMangle) {
      return;
    }

    // Skip built-in properties if not showing them
    if (!options.showBuiltIns && prop.isBuiltIn) {
      return;
    }

    const safeIndicator = prop.safeToMangle ? '✅' : '❌';
    const builtInIndicator = prop.isBuiltIn ? '✅' : '❌';
    const usageTypes = Array.from(prop.usageTypes).join(', ');

    console.log(
      `| ${prop.name.padEnd(13)} | ${String(prop.occurrences).padEnd(11)} | ${String(prop.totalBytes).padEnd(10)} | ${builtInIndicator.padEnd(8)} | ${safeIndicator.padEnd(14)} | ${usageTypes.slice(0, 20)}${usageTypes.length > 20 ? '...' : ''} |`,
    );

    // Optionally show file locations
    if (options.showLocations && prop.safeToMangle) {
      console.log('  Used in:');
      Array.from(prop.locations)
        .slice(0, 3)
        .forEach((loc) => {
          console.log(`  - ${loc}`);
        });
      if (prop.locations.size > 3) {
        console.log(`  - ...and ${prop.locations.size - 3} more files`);
      }
    }
  });

  // Display mangling recommendations
  console.log('\nMangling Recommendations:');
  console.log('=========================');

  // Sort safe properties by byte expense
  const manglingCandidates = properties
    .filter((p) => p.safeToMangle && !p.isBuiltIn)
    .sort((a, b) => b.totalBytes - a.totalBytes);

  if (manglingCandidates.length === 0) {
    console.log('No properties identified as safe for mangling.');
  } else {
    console.log('Top candidates for mangling:');
    manglingCandidates.slice(0, 10).forEach((prop, index) => {
      console.log(
        `${index + 1}. "${prop.name}" (${prop.totalBytes} bytes across ${prop.occurrences} occurrences)`,
      );
    });
  }
}

// Add exports to make this usable as a module
export interface PropertyConfig {
  propertyName: string; // Original property name
  constantName: string; // New constant name
  minOccurrences: number; // Minimum occurrences to transform
}

// Add a function to get the recommended properties for mangling
export function getPropertiesForMangling(
  patterns: string[],
  options: {
    minOccurrences?: number;
    excludeBuiltIns?: boolean;
    prefix?: string;
  } = {},
): PropertyConfig[] {
  const minOccurrences = options.minOccurrences || 5;
  const prefix = options.prefix || 'PROP_';

  // Get property stats
  const properties = analyzeProperties(patterns, {
    minOccurrences: minOccurrences,
    excludeBuiltIns: options.excludeBuiltIns || true,
    excludeUnsafe: false, // We're being permissive about what's safe to mangle
  });

  // Filter for safe properties and sort by byte impact
  const manglingCandidates = properties
    .filter((p) => p.safeToMangle && !p.isBuiltIn)
    .sort((a, b) => b.totalBytes - a.totalBytes);

  // Keep track of generated constant names to ensure uniqueness
  const generatedConstantNames = new Set<string>();
  const resultConfigs: PropertyConfig[] = [];

  // Convert to PropertyConfig format, ensuring unique constant names
  manglingCandidates.forEach((prop) => {
    let baseConstantName = `${prefix}${prop.name.replace(/[^A-Z0-9_]/gi, '').toUpperCase()}`;
    let finalConstantName = baseConstantName;
    let counter = 2;

    // If the base name already exists, append a counter
    while (generatedConstantNames.has(finalConstantName)) {
      finalConstantName = `${baseConstantName}_${counter}`;
      counter++;
    }

    generatedConstantNames.add(finalConstantName);
    resultConfigs.push({
      propertyName: prop.name,
      constantName: finalConstantName,
      minOccurrences: minOccurrences,
    });
  });

  return resultConfigs;
}

// Make the main function handle both CLI and module use
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: tsx property-analyzer.ts <file-patterns...> [options]');
    console.log('Options:');
    console.log('  --limit=N           Limit displayed results to N entries');
    console.log(
      '  --min-occurrences=N Only show properties with at least N occurrences',
    );
    console.log(
      '  --exclude-unsafe    Only display properties that are safe to mangle',
    );
    console.log(
      '  --exclude-builtins  Exclude built-in JavaScript properties from analysis',
    );
    console.log(
      '  --show-builtins     Show built-in JavaScript properties in results (default: true)',
    );
    console.log(
      '  --show-unsafe       Include unsafe properties in results (default: true)',
    );
    console.log(
      '  --show-locations    Show file locations where properties are used',
    );
    console.log(
      'Example: tsx property-analyzer.ts "src/**/*.ts" --limit=50 --exclude-builtins',
    );
    process.exit(1);
  }

  // Parse command line arguments
  let limit: number | undefined;
  let minOccurrences: number | undefined;
  let excludeUnsafe = false;
  let excludeBuiltIns = false;
  let showUnsafe = true;
  let showBuiltIns = true;
  let showLocations = false;
  const patterns: string[] = [];

  args.forEach((arg) => {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.substring(8), 10);
    } else if (arg.startsWith('--min-occurrences=')) {
      minOccurrences = parseInt(arg.substring(17), 10);
    } else if (arg === '--exclude-unsafe') {
      excludeUnsafe = true;
    } else if (arg === '--exclude-builtins') {
      excludeBuiltIns = true;
    } else if (arg === '--show-unsafe=false') {
      showUnsafe = false;
    } else if (arg === '--show-builtins=false') {
      showBuiltIns = false;
    } else if (arg === '--show-locations') {
      showLocations = true;
    } else {
      patterns.push(arg);
    }
  });

  const properties = analyzeProperties(patterns, {
    limit,
    minOccurrences,
    excludeUnsafe,
    excludeBuiltIns,
  });

  printResults(properties, {
    limit,
    showUnsafe,
    showLocations,
    showBuiltIns,
  });
}

// Only run the main function if this is executed directly
if (require.main === module) {
  main();
}
