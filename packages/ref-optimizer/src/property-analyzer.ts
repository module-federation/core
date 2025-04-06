import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// Add new type to track property context
interface PropertyContext {
  isMethodCall: boolean; // e.g. Array.from()
  isObjectProperty: boolean; // e.g. { from: 'x' }
  isImportKeyword: boolean; // e.g. import x from 'y'
  isTypeReference: boolean; // e.g. type X = { from: string }
}

export interface PropertyStats {
  name: string;
  occurrences: number;
  totalBytes: number;
  safeToMangle: boolean;
  isBuiltIn: boolean; // Flag to identify built-in JavaScript properties
  locations: Set<string>; // Tracks files where property is used
  usageTypes: Set<string>; // Tracks how property is used (access, assignment, etc.)
  contexts: PropertyContext[]; // Add contexts to track usage patterns
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
      if ((global as any).Stream) {
        processObject((global as any).Stream, 'Stream');
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

// Add minimum length constant
const MIN_PROPERTY_LENGTH = 4;

// Main function to analyze files and find property usage
export function analyzeProperties(
  patterns: string[],
  options: PropertyAnalyzerOptions = {},
): PropertyStats[] {
  const propertyMap = new Map<string, PropertyStats>();

  // Find all files matching the patterns
  const filePaths = patterns.flatMap((pattern) =>
    glob.sync(pattern, { absolute: true }),
  );

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
      // Error handling silently to avoid logging
    }
  });

  // Determine if properties are safe to mangle and if they're built-ins
  determinePropertyAttributes(propertyMap, options);

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
    const isMethodCall =
      node.parent &&
      ts.isCallExpression(node.parent) &&
      node.parent.expression === node;

    // Check if it's used in a string template
    const isInTemplate =
      node.parent &&
      (ts.isTemplateExpression(node.parent) || ts.isTemplateSpan(node.parent));

    // Check if it's used in object property access
    const isObjectProp =
      node.parent &&
      (ts.isPropertyAssignment(node.parent) ||
        ts.isShorthandPropertyAssignment(node.parent) ||
        ts.isObjectLiteralExpression(node.parent));

    addProperty(
      propertyMap,
      propertyName,
      filePath,
      isInTemplate ? 'template' : 'access',
      {
        isMethodCall,
        isObjectProperty: isObjectProp || isInTemplate, // Consider template usage as object property
        isImportKeyword: false,
        isTypeReference: false,
      },
    );
  }
  // Element access expressions with string literals (obj['prop'])
  else if (
    ts.isElementAccessExpression(node) &&
    node.argumentExpression &&
    ts.isStringLiteralLike(node.argumentExpression)
  ) {
    const propertyName = node.argumentExpression.text;
    const isMethodCall =
      node.parent &&
      ts.isCallExpression(node.parent) &&
      node.parent.expression === node;

    // Check if it's used in a string template
    const isInTemplate =
      node.parent &&
      (ts.isTemplateExpression(node.parent) || ts.isTemplateSpan(node.parent));

    addProperty(
      propertyMap,
      propertyName,
      filePath,
      isInTemplate ? 'template' : 'bracketAccess',
      {
        isMethodCall,
        isObjectProperty: true, // Consider bracket access as object property
        isImportKeyword: false,
        isTypeReference: false,
      },
    );
  }
  // Binary expressions for 'in' operator and string templates
  else if (
    ts.isBinaryExpression(node) &&
    (node.operatorToken.kind === ts.SyntaxKind.InKeyword ||
      node.operatorToken.kind === ts.SyntaxKind.PlusToken) &&
    (ts.isStringLiteral(node.left) || ts.isIdentifier(node.left))
  ) {
    const propertyName = ts.isStringLiteral(node.left)
      ? node.left.text
      : node.left.text;

    addProperty(propertyMap, propertyName, filePath, 'in operator or concat', {
      isMethodCall: false,
      isObjectProperty: true, // Consider 'in' checks and string concat as object property usage
      isImportKeyword: false,
      isTypeReference: false,
    });
  }
  // Template expressions
  else if (ts.isTemplateExpression(node)) {
    node.templateSpans.forEach((span) => {
      if (ts.isPropertyAccessExpression(span.expression)) {
        const propertyName = span.expression.name.text;
        addProperty(propertyMap, propertyName, filePath, 'template', {
          isMethodCall: false,
          isObjectProperty: true, // Consider template usage as object property
          isImportKeyword: false,
          isTypeReference: false,
        });
      }
    });
  }
  // Object literal properties
  else if (
    ts.isPropertyAssignment(node) ||
    ts.isShorthandPropertyAssignment(node)
  ) {
    let propertyName: string | undefined;
    if (ts.isPropertyAssignment(node)) {
      if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
        propertyName = node.name.text;
      }
    } else if (ts.isShorthandPropertyAssignment(node)) {
      propertyName = node.name.text;
    }

    if (propertyName) {
      addProperty(propertyMap, propertyName, filePath, 'assignment', {
        isMethodCall: false,
        isObjectProperty: true,
        isImportKeyword: false,
        isTypeReference: false,
      });
    }
  }
  // Import declarations
  else if (ts.isImportDeclaration(node)) {
    // Don't count 'from' in import statements
    return;
  }
  // Type literal or interface properties
  else if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
    const propertyName = node.name.text;
    addProperty(propertyMap, propertyName, filePath, 'interfaceProperty', {
      isMethodCall: false,
      isObjectProperty: true, // Consider type properties as object properties
      isImportKeyword: false,
      isTypeReference: true,
    });
  }
  // String literals that look like identifiers
  else if (ts.isStringLiteral(node)) {
    const stringValue = node.text;
    // Check if the string looks like a valid JS identifier and meets min length
    if (
      /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(stringValue) &&
      stringValue.length >= MIN_PROPERTY_LENGTH
    ) {
      // Avoid adding strings that are likely keywords in specific contexts
      const parent = node.parent;
      if (parent) {
        if (
          ts.isBinaryExpression(parent) &&
          (parent.operatorToken.kind ===
            ts.SyntaxKind.EqualsEqualsEqualsToken ||
            parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken)
        ) {
          if (
            parent.left.kind === ts.SyntaxKind.TypeOfExpression ||
            parent.right.kind === ts.SyntaxKind.TypeOfExpression
          ) {
            // Don't count strings used in typeof comparisons like typeof x === 'object'
            // Potentially refine this check further if needed
          } else {
            addProperty(propertyMap, stringValue, filePath, 'stringLiteral', {
              isMethodCall: false,
              isObjectProperty: false, // It's just a string value
              isImportKeyword: false,
              isTypeReference: false,
            });
          }
        } else if (
          ts.isImportDeclaration(parent) ||
          ts.isExportDeclaration(parent)
        ) {
          // Don't count import/export sources
        } else {
          addProperty(propertyMap, stringValue, filePath, 'stringLiteral', {
            isMethodCall: false,
            isObjectProperty: false, // It's just a string value
            isImportKeyword: false,
            isTypeReference: false,
          });
        }
      } else {
        // If no parent, it's likely safe to consider (though less common context)
        addProperty(propertyMap, stringValue, filePath, 'stringLiteral', {
          isMethodCall: false,
          isObjectProperty: false, // It's just a string value
          isImportKeyword: false,
          isTypeReference: false,
        });
      }
    }
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
  context: PropertyContext,
): void {
  if (!propertyName) return;

  if (!propertyMap.has(propertyName)) {
    propertyMap.set(propertyName, {
      name: propertyName,
      occurrences: 0,
      totalBytes: 0,
      safeToMangle: true,
      isBuiltIn: false,
      locations: new Set<string>(),
      usageTypes: new Set<string>(),
      contexts: [],
    });
  }

  const stats = propertyMap.get(propertyName)!;
  stats.occurrences++;
  stats.totalBytes = stats.name.length * stats.occurrences;
  stats.locations.add(filePath);
  stats.usageTypes.add(usageType);
  stats.contexts.push(context);
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
  // Calculate potential savings
  const totalProperties = properties.length;
  const totalBytes = properties.reduce((sum, prop) => sum + prop.totalBytes, 0);
  const safeProperties = properties.filter((p) => p.safeToMangle);
  const safeBytes = safeProperties.reduce(
    (sum, prop) => sum + prop.totalBytes,
    0,
  );
  const builtInProperties = properties.filter((p) => p.isBuiltIn);

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
  });
}

// Add exports to make this usable as a module
export interface PropertyConfig {
  propertyName: string; // Original property name
  constantName: string; // New constant name
  minOccurrences: number; // Minimum occurrences to transform
}

// Add generateConstantName function
function generateConstantName(
  propertyName: string,
  prefix: string = 'PROP_',
): string {
  return `${prefix}${propertyName.replace(/[^A-Z0-9_]/gi, '')}`;
}

// Modify getPropertiesForMangling to include minOccurrences
export function getPropertiesForMangling(
  patterns: string[],
  options: {
    minOccurrences?: number;
    excludeBuiltIns?: boolean;
    prefix?: string;
    analyzerOptions?: PropertyAnalyzerOptions;
  } = {},
): PropertyConfig[] {
  const minOccurrences = options.minOccurrences || 5;
  const propertyStats = analyzeProperties(patterns, {
    minOccurrences,
    excludeBuiltIns:
      options.excludeBuiltIns ?? options.analyzerOptions?.excludeBuiltIns,
    ...(options.analyzerOptions || {}),
  });

  const finalProperties: PropertyConfig[] = [];
  const usedConstantNames = new Map<string, number>();

  propertyStats
    .filter(
      (prop) =>
        prop.safeToMangle &&
        prop.name.length >= MIN_PROPERTY_LENGTH &&
        (!options.excludeBuiltIns || !prop.isBuiltIn),
    )
    .forEach((prop) => {
      let baseConstantName = generateConstantName(prop.name, options.prefix);
      let counter = usedConstantNames.get(baseConstantName) || 0;
      let finalConstantName = baseConstantName;

      // Ensure uniqueness by appending a counter if the name is already used
      while (usedConstantNames.has(finalConstantName)) {
        counter++;
        finalConstantName = `${baseConstantName}_${counter}`;
      }

      usedConstantNames.set(baseConstantName, counter); // Track the original base name usage
      if (counter > 0) {
        usedConstantNames.set(finalConstantName, 0); // Also track the numbered version as used
      }

      finalProperties.push({
        propertyName: prop.name,
        constantName: finalConstantName,
        minOccurrences,
      });
    });

  return finalProperties;
}

// Make the main function handle both CLI and module use
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
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

export interface PropertyAnalyzerOptions {
  limit?: number;
  minOccurrences?: number;
  excludeUnsafe?: boolean;
  excludeBuiltIns?: boolean;
  propertyRules?: {
    alwaysObjectProps?: string[];
    neverMangle?: string[];
    mangleAsObjectProps?: {
      names: string[];
      minObjectPropRatio?: number;
      maxMethodCallRatio?: number;
    };
    customThresholds?: {
      [propName: string]: {
        minObjectPropRatio?: number;
        maxMethodCallRatio?: number;
      };
    };
  };
}

// Default thresholds
const DEFAULT_MIN_OBJECT_PROP_RATIO = 0.7;
const DEFAULT_MAX_METHOD_CALL_RATIO = 0.2;

// Determine which properties are likely safe to mangle and which are built-ins
function determinePropertyAttributes(
  propertyMap: Map<string, PropertyStats>,
  options: PropertyAnalyzerOptions = {},
): void {
  const propertyRules = options.propertyRules || {};
  const alwaysObjectProps = new Set(propertyRules.alwaysObjectProps || []);
  const neverMangle = new Set(propertyRules.neverMangle || []);
  const mangleAsObjectProps = propertyRules.mangleAsObjectProps?.names || [];
  const customThresholds = propertyRules.customThresholds || {};
  // Aggressive mode is ON if excludeBuiltIns is explicitly false
  const isAggressiveMode = options.excludeBuiltIns === false;
  // Standard built-in exclusion is ON if excludeBuiltIns is true or undefined
  const standardExcludeBuiltIns = options.excludeBuiltIns !== false;

  // DOM properties that are generally unsafe to mangle
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

  propertyMap.forEach((prop) => {
    // Reset attributes at the start for each property
    prop.isBuiltIn = BUILT_IN_PROPERTIES.has(prop.name); // Check if it's a known built-in name
    prop.safeToMangle = true; // Assume safe initially

    // --- Universal Safety Checks (Apply in all modes) ---

    // Skip properties that are too short
    if (prop.name.length < MIN_PROPERTY_LENGTH) {
      prop.safeToMangle = false;
      return;
    }

    // Never mangle explicitly excluded properties
    if (neverMangle.has(prop.name)) {
      prop.safeToMangle = false;
      return;
    }

    // Never mangle known unsafe DOM properties
    if (DOM_PROPERTIES.has(prop.name)) {
      prop.safeToMangle = false;
      return;
    }

    // --- Mode-Specific Logic ---

    if (isAggressiveMode) {
      // In AGGRESSIVE mode, skip most context checks. Property remains safe unless excluded above.
      // However, still mark pure identifier uses (like global Promise) as unsafe if they are NOT builtins?
      // For now, aggressive means hoist if passes universal checks.
      return;
    } else {
      // --- STANDARD (Non-Aggressive) Mode Logic ---

      // In standard mode, identifier uses are never considered safe
      if (prop.usageTypes.has('identifierUse')) {
        prop.safeToMangle = false;
        return;
      }

      // Exclude built-ins if standardExcludeBuiltIns is true
      if (prop.isBuiltIn && standardExcludeBuiltIns) {
        prop.safeToMangle = false;
        return;
      }

      // Count different contexts for ratio checks
      const methodCallCount = prop.contexts.filter(
        (c) => c.isMethodCall,
      ).length;
      const objectPropCount = prop.contexts.filter(
        (c) => c.isObjectProperty,
      ).length;
      const totalUsages = prop.contexts.length;
      const objectPropRatio =
        totalUsages > 0 ? objectPropCount / totalUsages : 0;
      const methodCallRatio =
        totalUsages > 0 ? methodCallCount / totalUsages : 0;

      // Always treat certain properties as object properties (and safe)
      if (alwaysObjectProps.has(prop.name)) {
        // Already marked safe initially, isBuiltIn status is just informational now
        return;
      }

      // Get custom thresholds for this property if they exist
      const customThreshold = customThresholds[prop.name];
      const minObjectPropRatio =
        customThreshold?.minObjectPropRatio ??
        propertyRules.mangleAsObjectProps?.minObjectPropRatio ??
        DEFAULT_MIN_OBJECT_PROP_RATIO;
      const maxMethodCallRatio =
        customThreshold?.maxMethodCallRatio ??
        propertyRules.mangleAsObjectProps?.maxMethodCallRatio ??
        DEFAULT_MAX_METHOD_CALL_RATIO;

      // Check properties specifically marked for mangling based on object property usage
      if (mangleAsObjectProps.includes(prop.name)) {
        if (
          objectPropRatio >= minObjectPropRatio &&
          methodCallRatio <= maxMethodCallRatio
        ) {
          // Meets the ratio criteria, remains safeToMangle = true
          return;
        } else {
          // Does not meet ratio criteria for specific mangling rule
          prop.safeToMangle = false;
          return;
        }
      }

      // Default safety check for non-built-ins (if not handled by other rules):
      // In standard mode, if it wasn't explicitly marked safe by alwaysObjectProps
      // or mangleAsObjectProps, and it's not a built-in we're excluding,
      // we might apply a default ratio check or just assume safety.
      // Current logic assumes safety if it reaches here. Let's keep that for now.
      // Consider adding a default ratio check here if needed in the future.
    }
  });
}
