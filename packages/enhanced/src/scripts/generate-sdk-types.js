'use strict';

/**
 * generate-sdk-types.js
 *
 * Reads JSON schemas from packages/enhanced/src/schemas/ and generates
 * TypeScript type files into packages/sdk/src/types/plugins/.
 *
 * Run: node packages/enhanced/src/scripts/generate-sdk-types.js
 * Or via pnpm: pnpm generate:schema -w
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const SCHEMAS_DIR = path.resolve(SCRIPT_DIR, '../schemas');
const SDK_TYPES_DIR = path.resolve(
  SCRIPT_DIR,
  '../../../sdk/src/types/plugins',
);

// ---------------------------------------------------------------------------
// Base types that always live in ModuleFederationPlugin.ts
// ---------------------------------------------------------------------------
const MF_BASE_TYPES = new Set([
  'Exposes',
  'ExposesItem',
  'ExposesItems',
  'ExposesObject',
  'ExposesConfig',
  'Remotes',
  'RemotesItem',
  'RemotesItems',
  'RemotesObject',
  'RemotesConfig',
  'Shared',
  'SharedItem',
  'SharedObject',
  'SharedConfig',
  'EntryRuntime',
  'ExternalsType',
  'LibraryType',
  'LibraryName',
  'LibraryOptions',
  'LibraryExport',
  'AmdContainer',
  'AuxiliaryComment',
  'UmdNamedDefine',
  'LibraryCustomUmdCommentObject',
  'LibraryCustomUmdObject',
  'IncludeExcludeOptions',
  'TreeShakingConfig',
]);

// Types that ContainerPlugin.ts imports from ModuleFederationPlugin.ts
const CONTAINER_PLUGIN_IMPORTS = [
  'Exposes',
  'ExposesItem',
  'ExposesItems',
  'ExposesObject',
  'ExposesConfig',
  'EntryRuntime',
  'LibraryOptions',
];

// Types that ContainerReferencePlugin.ts imports from ModuleFederationPlugin.ts
const CONTAINER_REF_IMPORTS = [
  'ExternalsType',
  'Remotes',
  'RemotesItem',
  'RemotesItems',
  'RemotesObject',
  'RemotesConfig',
];

// Types that SharePlugin.ts imports from ModuleFederationPlugin.ts
const SHARE_PLUGIN_IMPORTS = [
  'Shared',
  'SharedItem',
  'SharedObject',
  'SharedConfig',
];

// ---------------------------------------------------------------------------
// Schema → TypeScript conversion helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a $ref like "#/definitions/Foo" to "Foo".
 */
function resolveRef(ref) {
  const match = ref.match(/^#\/definitions\/(.+)$/);
  if (match) return match[1];
  return ref;
}

/**
 * Escapes a string literal value for use in a TypeScript union.
 */
function escapeStringLiteral(value) {
  return `'${String(value).replace(/'/g, "\\'")}'`;
}

/**
 * Converts a JSON Schema node to a TypeScript type string (inline).
 *
 * @param {object} schema - The JSON Schema node.
 * @param {object} definitions - All definitions from the root schema.
 * @param {Set<string>} referencedTypes - Accumulator for referenced type names.
 * @param {number} [indent=0] - Indentation level (for inline objects).
 * @returns {string}
 */
function schemaToTsType(schema, definitions, referencedTypes, indent = 0) {
  if (!schema || typeof schema !== 'object') return 'unknown';

  // $ref
  if (schema.$ref) {
    const name = resolveRef(schema.$ref);
    referencedTypes.add(name);
    return name;
  }

  // oneOf — treat same as anyOf
  if (schema.oneOf) {
    return schema.oneOf
      .map((s) => schemaToTsType(s, definitions, referencedTypes, indent))
      .join(' | ');
  }

  // anyOf
  if (schema.anyOf) {
    return schema.anyOf
      .map((s) => schemaToTsType(s, definitions, referencedTypes, indent))
      .join(' | ');
  }

  // instanceof
  if (schema.instanceof) {
    return schema.instanceof;
  }

  // enum
  if (schema.enum) {
    return schema.enum
      .map((v) => {
        if (v === false) return 'false';
        if (v === true) return 'true';
        if (v === null) return 'null';
        if (typeof v === 'string') return escapeStringLiteral(v);
        return String(v);
      })
      .join(' | ');
  }

  // type array e.g. ["string", "object"] → string | RegExp
  if (Array.isArray(schema.type)) {
    return schema.type.map((t) => primitiveToTs(t)).join(' | ');
  }

  const type = schema.type;

  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'number' || type === 'integer') return 'number';
  if (type === 'null') return 'null';

  if (type === 'array') {
    if (!schema.items) return 'unknown[]';
    const itemType = schemaToTsType(
      schema.items,
      definitions,
      referencedTypes,
      indent,
    );
    // Wrap in parens if union
    if (itemType.includes(' | ')) return `(${itemType})[]`;
    return `${itemType}[]`;
  }

  if (
    type === 'object' ||
    schema.properties ||
    schema.additionalProperties !== undefined
  ) {
    return buildInlineObjectType(schema, definitions, referencedTypes, indent);
  }

  // Fallback
  return 'unknown';
}

/**
 * Maps a primitive JSON Schema type string to TypeScript.
 */
function primitiveToTs(t) {
  if (t === 'string') return 'string';
  if (t === 'boolean') return 'boolean';
  if (t === 'number' || t === 'integer') return 'number';
  if (t === 'null') return 'null';
  if (t === 'object') return 'RegExp'; // heuristic for ["string","object"] patterns
  if (t === 'array') return 'unknown[]';
  return 'unknown';
}

/**
 * Builds an inline `{ [k: string]: X }` or `{ prop: Type; ... }` type string.
 */
function buildInlineObjectType(schema, definitions, referencedTypes, indent) {
  const pad = '  '.repeat(indent + 1);
  const closePad = '  '.repeat(indent);

  // Index signature only (no named properties)
  if (schema.additionalProperties && !schema.properties) {
    const valueType = schemaToTsType(
      schema.additionalProperties,
      definitions,
      referencedTypes,
      indent + 1,
    );
    return `{ [k: string]: ${valueType} }`;
  }

  // Named properties
  if (schema.properties) {
    const required = new Set(schema.required || []);
    const lines = [];
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isOptional = !required.has(propName);
      const propType = schemaToTsType(
        propSchema,
        definitions,
        referencedTypes,
        indent + 1,
      );
      const jsdoc = propSchema.description
        ? `${pad}/** ${propSchema.description} */\n`
        : '';
      lines.push(
        `${jsdoc}${pad}${propName}${isOptional ? '?' : ''}: ${propType};`,
      );
    }
    // additionalProperties alongside named props
    if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === 'object'
    ) {
      const valueType = schemaToTsType(
        schema.additionalProperties,
        definitions,
        referencedTypes,
        indent + 1,
      );
      lines.push(`${pad}[k: string]: ${valueType};`);
    }
    return `{\n${lines.join('\n')}\n${closePad}}`;
  }

  return 'Record<string, unknown>';
}

// ---------------------------------------------------------------------------
// Top-level type declaration generators
// ---------------------------------------------------------------------------

/**
 * Generates a `export type Foo = ...;` or `export interface Foo { ... }` string
 * for a named definition.
 *
 * @param {string} name - The type name.
 * @param {object} schema - The JSON Schema node.
 * @param {object} definitions - All definitions from the root schema.
 * @param {Set<string>} referencedTypes - Accumulator for referenced type names.
 * @returns {string}
 */
function generateTypeDeclaration(name, schema, definitions, referencedTypes) {
  const jsdoc = schema.description
    ? `/**\n * ${schema.description}\n */\n`
    : '';

  // Decide whether to emit an interface or a type alias.
  // Use interface when the schema is a plain object with named properties
  // and no anyOf/oneOf/enum at the top level.
  const isPlainObject =
    (schema.type === 'object' || schema.properties) &&
    !schema.anyOf &&
    !schema.oneOf &&
    !schema.enum &&
    !schema.$ref;

  if (isPlainObject) {
    return generateInterface(name, schema, definitions, referencedTypes, jsdoc);
  }

  // Otherwise emit a type alias
  const tsType = schemaToTsType(schema, definitions, referencedTypes, 0);
  return `${jsdoc}export type ${name} = ${tsType};\n`;
}

/**
 * Generates an `export interface Foo { ... }` declaration.
 */
function generateInterface(name, schema, definitions, referencedTypes, jsdoc) {
  const required = new Set(schema.required || []);
  const lines = [];

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isOptional = !required.has(propName);
      const propType = schemaToTsType(
        propSchema,
        definitions,
        referencedTypes,
        1,
      );
      const propJsdoc = propSchema.description
        ? `  /**\n   * ${propSchema.description}\n   */\n`
        : '';
      lines.push(
        `${propJsdoc}  ${propName}${isOptional ? '?' : ''}: ${propType};`,
      );
    }
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    const valueType = schemaToTsType(
      schema.additionalProperties,
      definitions,
      referencedTypes,
      1,
    );
    lines.push(`  [k: string]: ${valueType};`);
  }

  return `${jsdoc}export interface ${name} {\n${lines.join('\n')}\n}\n`;
}

// ---------------------------------------------------------------------------
// File-level generation logic
// ---------------------------------------------------------------------------

/**
 * Given a schema's definitions map and a set of type names to emit,
 * returns the generated TypeScript source for those types (no imports/header).
 *
 * @param {string[]} typeNames - Ordered list of definition names to emit.
 * @param {object} definitions - All definitions from the schema.
 * @param {Set<string>} referencedTypes - Accumulator for referenced type names.
 * @returns {string}
 */
function generateTypeDeclarations(typeNames, definitions, referencedTypes) {
  const parts = [];
  for (const name of typeNames) {
    if (!definitions[name]) continue;
    parts.push(
      generateTypeDeclaration(
        name,
        definitions[name],
        definitions,
        referencedTypes,
      ),
    );
  }
  return parts.join('\n');
}

/**
 * Generates the root options interface for a schema whose root is an object.
 *
 * @param {string} title - The interface name (from schema.title).
 * @param {object} schema - The root schema object.
 * @param {object} definitions - All definitions.
 * @param {Set<string>} referencedTypes - Accumulator.
 * @returns {string}
 */
function generateRootOptionsInterface(
  title,
  schema,
  definitions,
  referencedTypes,
) {
  return generateInterface(title, schema, definitions, referencedTypes, '');
}

// ---------------------------------------------------------------------------
// Schema loading
// ---------------------------------------------------------------------------

function loadSchema(relativePath) {
  const fullPath = path.resolve(SCHEMAS_DIR, relativePath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// ContainerPlugin.ts
// ---------------------------------------------------------------------------

function generateContainerPlugin() {
  const schema = loadSchema('container/ContainerPlugin.json');
  const definitions = schema.definitions || {};
  const referencedTypes = new Set();

  // Types specific to ContainerPlugin (not in MF base types)
  // The only unique type is ContainerPluginOptions (the root interface)
  // All definitions in ContainerPlugin.json are MF base types.

  // Build the root options interface
  const rootTs = generateRootOptionsInterface(
    'ContainerPluginOptions',
    schema,
    definitions,
    referencedTypes,
  );

  // Determine which base types are actually referenced
  const importsNeeded = CONTAINER_PLUGIN_IMPORTS.filter((t) =>
    referencedTypes.has(t),
  );

  const header = `/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run \`pnpm generate:schema -w\` to update.
 */

`;

  const importLine =
    importsNeeded.length > 0
      ? `import type { ${importsNeeded.join(', ')} } from './ModuleFederationPlugin';\n\n`
      : '';

  return header + importLine + rootTs;
}

// ---------------------------------------------------------------------------
// ContainerReferencePlugin.ts
// ---------------------------------------------------------------------------

function generateContainerReferencePlugin() {
  const schema = loadSchema('container/ContainerReferencePlugin.json');
  const definitions = schema.definitions || {};
  const referencedTypes = new Set();

  const rootTs = generateRootOptionsInterface(
    'ContainerReferencePluginOptions',
    schema,
    definitions,
    referencedTypes,
  );

  const importsNeeded = CONTAINER_REF_IMPORTS.filter((t) =>
    referencedTypes.has(t),
  );

  const header = `/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run \`pnpm generate:schema -w\` to update.
 */

`;

  const importLine =
    importsNeeded.length > 0
      ? `import type { ${importsNeeded.join(', ')} } from './ModuleFederationPlugin';\n\n`
      : '';

  return header + importLine + rootTs;
}

// ---------------------------------------------------------------------------
// SharePlugin.ts
// ---------------------------------------------------------------------------

function generateSharePlugin() {
  const schema = loadSchema('sharing/SharePlugin.json');
  const definitions = schema.definitions || {};
  const referencedTypes = new Set();

  const rootTs = generateRootOptionsInterface(
    'SharePluginOptions',
    schema,
    definitions,
    referencedTypes,
  );

  const importsNeeded = SHARE_PLUGIN_IMPORTS.filter((t) =>
    referencedTypes.has(t),
  );

  const header = `/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run \`pnpm generate:schema -w\` to update.
 */

`;

  const importLine =
    importsNeeded.length > 0
      ? `import type { ${importsNeeded.join(', ')} } from './ModuleFederationPlugin';\n\n`
      : '';

  return header + importLine + rootTs;
}

// ---------------------------------------------------------------------------
// ConsumeSharedPlugin.ts  (fully self-contained)
// ---------------------------------------------------------------------------

function generateConsumeSharedPlugin() {
  const schema = loadSchema('sharing/ConsumeSharedPlugin.json');
  const definitions = schema.definitions || {};
  const referencedTypes = new Set();

  // Emit these definitions in order (excluding Exclude which is internal)
  const definitionOrder = [
    'ConsumesItem',
    'ConsumesConfig',
    'ConsumesObject',
    'Consumes',
    'IncludeExcludeOptions',
  ];

  const definitionTs = generateTypeDeclarations(
    definitionOrder,
    definitions,
    referencedTypes,
  );

  const rootTs = generateRootOptionsInterface(
    'ConsumeSharedPluginOptions',
    schema,
    definitions,
    referencedTypes,
  );

  const header = `/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run \`pnpm generate:schema -w\` to update.
 */

`;

  return header + definitionTs + '\n' + rootTs;
}

// ---------------------------------------------------------------------------
// ProvideSharedPlugin.ts  (imports IncludeExcludeOptions from ConsumeSharedPlugin)
// ---------------------------------------------------------------------------

function generateProvideSharedPlugin() {
  const schema = loadSchema('sharing/ProvideSharedPlugin.json');
  const definitions = schema.definitions || {};
  const referencedTypes = new Set();

  // Emit these definitions in order (excluding IncludeExcludeOptions which is imported)
  const definitionOrder = [
    'ProvidesItem',
    'ProvidesConfig',
    'ProvidesObject',
    'Provides',
  ];

  const definitionTs = generateTypeDeclarations(
    definitionOrder,
    definitions,
    referencedTypes,
  );

  const rootTs = generateRootOptionsInterface(
    'ProvideSharedPluginOptions',
    schema,
    definitions,
    referencedTypes,
  );

  const header = `/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run \`pnpm generate:schema -w\` to update.
 */

`;

  // IncludeExcludeOptions comes from ConsumeSharedPlugin
  const importLine = referencedTypes.has('IncludeExcludeOptions')
    ? `import type { IncludeExcludeOptions } from './ConsumeSharedPlugin';\n\n`
    : '';

  return header + importLine + definitionTs + '\n' + rootTs;
}

// ---------------------------------------------------------------------------
// ModuleFederationPlugin.ts  (MARKER approach — update only the generated section)
// ---------------------------------------------------------------------------

const MF_BEGIN_MARKER = '// <-- BEGIN SCHEMA-GENERATED TYPES -->';
const MF_END_MARKER = '// <-- END SCHEMA-GENERATED TYPES -->';

/**
 * Ordered list of definitions to emit in the MF generated section.
 * This mirrors the existing file's ordering.
 */
const MF_DEFINITION_ORDER = [
  // Exposes group
  'ExposesItem',
  'ExposesItems',
  'ExposesObject',
  'ExposesConfig',
  'Exposes',
  // Library group
  'AmdContainer',
  'AuxiliaryComment',
  'LibraryCustomUmdCommentObject',
  'LibraryCustomUmdObject',
  'LibraryExport',
  'LibraryName',
  'LibraryType',
  'LibraryOptions',
  'UmdNamedDefine',
  // Externals
  'ExternalsType',
  // Remotes group
  'RemotesItem',
  'RemotesItems',
  'RemotesObject',
  'RemotesConfig',
  'Remotes',
  // Runtime
  'EntryRuntime',
  // Shared group
  'SharedItem',
  'SharedObject',
  'SharedConfig',
  'Shared',
  // IncludeExclude / TreeShaking
  'IncludeExcludeOptions',
  'TreeShakingConfig',
];

function generateMFPluginSection() {
  const schema = loadSchema('container/ModuleFederationPlugin.json');
  const definitions = schema.definitions || {};
  const referencedTypes = new Set();

  const parts = [];

  for (const name of MF_DEFINITION_ORDER) {
    if (!definitions[name]) continue;
    parts.push(
      generateTypeDeclaration(
        name,
        definitions[name],
        definitions,
        referencedTypes,
      ),
    );
  }

  return parts.join('\n');
}

function updateModuleFederationPlugin() {
  const outputPath = path.resolve(SDK_TYPES_DIR, 'ModuleFederationPlugin.ts');
  const generatedSection = generateMFPluginSection();

  let existingContent = '';
  if (fs.existsSync(outputPath)) {
    existingContent = fs.readFileSync(outputPath, 'utf8');
  }

  const beginIdx = existingContent.indexOf(MF_BEGIN_MARKER);
  const endIdx = existingContent.indexOf(MF_END_MARKER);

  let newContent;
  if (beginIdx !== -1 && endIdx !== -1) {
    // Replace between markers (inclusive)
    const before = existingContent.slice(0, beginIdx);
    const after = existingContent.slice(endIdx + MF_END_MARKER.length);
    newContent =
      before +
      MF_BEGIN_MARKER +
      '\n' +
      generatedSection +
      '\n' +
      MF_END_MARKER +
      after;
  } else {
    // No markers — prepend the generated section at the top
    newContent =
      MF_BEGIN_MARKER +
      '\n' +
      generatedSection +
      '\n' +
      MF_END_MARKER +
      '\n\n' +
      existingContent;
  }

  fs.writeFileSync(outputPath, newContent, 'utf8');
  console.log(`Updated: ${outputPath}`);
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

function writeFile(filename, content) {
  const outputPath = path.resolve(SDK_TYPES_DIR, filename);
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Written: ${outputPath}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  ensureDir(SDK_TYPES_DIR);

  // 1. Update the marker section in ModuleFederationPlugin.ts
  updateModuleFederationPlugin();

  // 2. Generate standalone files
  writeFile('ContainerPlugin.ts', generateContainerPlugin());
  writeFile('ContainerReferencePlugin.ts', generateContainerReferencePlugin());
  writeFile('SharePlugin.ts', generateSharePlugin());
  writeFile('ConsumeSharedPlugin.ts', generateConsumeSharedPlugin());
  writeFile('ProvideSharedPlugin.ts', generateProvideSharedPlugin());

  console.log('\nDone. All SDK types generated successfully.');
}

main();
