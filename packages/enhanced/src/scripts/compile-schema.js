#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { pathToFileURL, fileURLToPath } = require('url');
const Ajv = require('ajv');
const { _, Name } = require('ajv/dist/compile/codegen');
const standaloneCode = require('ajv/dist/standalone').default;
const terser = require('terser');

const ajv = new Ajv({
  code: { source: true, optimize: true, esm: true },
  messages: false,
  strictNumbers: false,
  logger: false,
  loadSchema: async (uri) => {
    const loadedSchemaPath = fileURLToPath(uri);
    const schema = require(loadedSchemaPath);
    const processedSchema = processJson(schema);
    processedSchema.$id = uri;
    return processedSchema;
  },
});

// Add custom keywords
ajv.addKeyword({
  keyword: 'absolutePath',
  type: 'string',
  schemaType: 'boolean',
  code(ctx) {
    const { data, schema } = ctx;
    ctx.fail(
      _`${data}.includes("!") || (absolutePathRegExp.test(${data}) !== ${schema})`,
    );
  },
});

const EXCLUDED_PROPERTIES = [
  'title',
  'description',
  'cli',
  'implements',
  'tsType',
];

const processJson = (json) => {
  if (json === null || typeof json !== 'object') return json;
  if (Array.isArray(json)) return json.map(processJson);
  const result = {};
  for (const key of Object.keys(json)) {
    if (!EXCLUDED_PROPERTIES.includes(key)) {
      result[key] = processJson(json[key]);
    }
  }
  return result;
};

const postprocessValidation = async (code) => {
  // Add hoisted values
  if (/absolutePathRegExp/.test(code)) {
    code = `const absolutePathRegExp = /^(?:[A-Za-z]:[\\\\/]|\\\\\\\\|\\/)/;${code}`;
  }

  // Remove unnecessary error code
  code = code
    .replace(/\{instancePath[^{}]+,keyword:[^{}]+,/g, '{')
    .replace(/"\$id":".+?"/, '');

  // Convert to ESM
  code = code
    .replace('module.exports =', 'export const validate =')
    .replace('module.exports.default =', 'export default');

  // Minimize
  code = (
    await terser.minify(code, {
      compress: { passes: 3 },
      mangle: true,
      ecma: 2015,
      module: true,
    })
  ).code;

  return `// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
${code}`;
};

const generateSchemaFile = (schema, outputPath) => {
  const schemaContent = `// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */

export default ${JSON.stringify(schema, null, 2)} as const;
`;

  fs.writeFileSync(outputPath, schemaContent, 'utf-8');
};

async function compileSchema(inputPath, outputPath) {
  try {
    const schema = require(inputPath);
    const processedSchema = processJson(schema);
    processedSchema.$id = pathToFileURL(inputPath).href;

    const validate = await ajv.compileAsync(processedSchema);
    const code = await postprocessValidation(standaloneCode(ajv, validate));

    // Generate both files
    const baseDir = path.dirname(outputPath);
    const baseName = path.basename(outputPath, path.extname(outputPath));

    // Generate validation file (.check.ts)
    const validationPath = path.join(baseDir, `${baseName}.check.ts`);
    fs.writeFileSync(validationPath, code, 'utf-8');

    // Generate schema file (.ts)
    const tsPath = path.join(baseDir, `${baseName}.ts`);
    generateSchemaFile(schema, tsPath);

    console.log(`Successfully generated:
- ${validationPath} (validation)
- ${tsPath} (schema)`);
  } catch (err) {
    console.error(`Error compiling schema ${inputPath}:`, err);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: compile-schema <input-schema.json> <output-file.js>');
  process.exit(1);
}

const [inputSchema, outputFile] = args;
compileSchema(path.resolve(inputSchema), path.resolve(outputFile));
