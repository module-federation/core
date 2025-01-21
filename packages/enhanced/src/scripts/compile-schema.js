#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { pathToFileURL, fileURLToPath } = require('url');
const Ajv = require('ajv');
const { _, Name } = require('ajv/dist/compile/codegen');
const standaloneCode = require('ajv/dist/standalone').default;
const terser = require('terser');
const glob = require('fast-glob');

// Create Ajv instance factory to avoid ID conflicts
const createAjv = () =>
  new Ajv({
    code: {
      source: true,
      optimize: true,
      lines: true,
      esm: true,
      formats: false,
    },
    uriResolver: undefined,
    unicodeRegExp: false,
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

// Add custom keywords factory
const addCustomKeywords = (ajv) => {
  // Remove any existing keywords that might use runtime dependencies
  ajv.removeKeyword('minLength');

  ajv.addKeyword({
    keyword: 'minLength',
    type: 'string',
    schemaType: 'number',
    code(ctx) {
      const { data, schema } = ctx;
      ctx.fail(_`${data}.length < ${schema}`);
    },
  });

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
  return ajv;
};

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
  code = code.replace(
    /^(?:module\.)?exports\s*=\s*([^;]+)/m,
    'const a = $1;\nexport const validate = a;\nexport default a;',
  );

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

async function compileSchema(inputPath) {
  try {
    const schema = require(inputPath);
    const processedSchema = processJson(schema);
    processedSchema.$id = pathToFileURL(inputPath).href;

    // Create new Ajv instance for each schema
    const ajv = addCustomKeywords(createAjv());
    const validate = await ajv.compileAsync(processedSchema);
    const code = await postprocessValidation(standaloneCode(ajv, validate));

    // Generate both files
    const baseDir = path.dirname(inputPath);
    const baseName = path.basename(inputPath, '.json');

    // Generate validation file (.check.ts)
    const validationPath = path.join(baseDir, `${baseName}.check.ts`);
    fs.writeFileSync(validationPath, code, 'utf-8');

    // Generate schema file (.ts)
    const tsPath = path.join(baseDir, `${baseName}.ts`);
    generateSchemaFile(schema, tsPath);

    console.log(`Successfully generated for ${baseName}:
- ${validationPath} (validation)
- ${tsPath} (schema)`);
  } catch (err) {
    console.error(`Error compiling schema ${inputPath}:`, err);
    process.exit(1);
  }
}

async function main() {
  const schemasDir = path.resolve(__dirname, '../schemas');
  const jsonFiles = await glob('**/*.json', {
    cwd: schemasDir,
    absolute: true,
  });

  console.log(`Found ${jsonFiles.length} schema files to process...`);

  for (const jsonFile of jsonFiles) {
    await compileSchema(jsonFile);
  }
}

main().catch((err) => {
  console.error('Error processing schemas:', err);
  process.exit(1);
});
