#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const DEFAULT_TARGETS = ['arch-doc'];
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
const CHROME_CANDIDATES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'chrome',
];

main();

async function main() {
  const targets = process.argv.slice(2);
  const files = await listMarkdownFiles(
    targets.length > 0 ? targets : DEFAULT_TARGETS,
  );
  const blocks = files.flatMap((file) =>
    extractMermaidBlocks(file, readFileSync(file, 'utf8')),
  );

  if (blocks.length === 0) {
    console.log('[check-mermaid] No Mermaid blocks found.');
    return;
  }

  const tempDir = mkdtempSync(join(tmpdir(), 'mf-mermaid-'));
  const puppeteerConfigPath = join(tempDir, 'puppeteer-config.json');
  writeFileSync(
    puppeteerConfigPath,
    JSON.stringify({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }),
  );

  const mmdcCommand = resolveMmdcCommand();
  const env = resolvePuppeteerEnv();
  const failures = [];

  try {
    for (const [index, block] of blocks.entries()) {
      const inputPath = join(tempDir, `${index + 1}.mmd`);
      const outputPath = join(tempDir, `${index + 1}.svg`);
      writeFileSync(inputPath, block.source);

      const result = spawnSync(
        mmdcCommand.command,
        [
          ...mmdcCommand.args,
          '-i',
          inputPath,
          '-o',
          outputPath,
          '--quiet',
          '--puppeteerConfigFile',
          puppeteerConfigPath,
        ],
        {
          cwd: ROOT,
          encoding: 'utf8',
          env,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      if (result.status !== 0) {
        failures.push({
          block,
          output: (result.stderr || result.stdout || '').trim(),
        });
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    console.error(
      `[check-mermaid] ${failures.length}/${blocks.length} Mermaid diagram(s) failed to render.`,
    );
    for (const failure of failures) {
      console.error(
        `\n${relative(ROOT, failure.block.file)}:${failure.block.line}`,
      );
      console.error(failure.output);
    }
    process.exit(1);
  }

  console.log(
    `[check-mermaid] OK: rendered ${blocks.length} Mermaid diagram(s) from ${files.length} Markdown file(s).`,
  );
}

async function listMarkdownFiles(targets) {
  const files = [];

  for (const target of targets) {
    const targetPath = resolve(ROOT, target);
    const targetStat = await stat(targetPath);

    if (targetStat.isDirectory()) {
      files.push(...(await listMarkdownFilesInDirectory(targetPath)));
      continue;
    }

    if (targetStat.isFile() && MARKDOWN_EXTENSIONS.has(extname(targetPath))) {
      files.push(targetPath);
    }
  }

  return files.sort();
}

async function listMarkdownFilesInDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }

    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFilesInDirectory(entryPath)));
      continue;
    }

    if (entry.isFile() && MARKDOWN_EXTENSIONS.has(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractMermaidBlocks(file, content) {
  const blocks = [];
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^```\s*mermaid(?:\s.*)?$/i.test(lines[index])) {
      continue;
    }

    const startLine = index + 1;
    const source = [];
    index += 1;

    while (index < lines.length && !/^```/.test(lines[index])) {
      source.push(lines[index]);
      index += 1;
    }

    blocks.push({
      file,
      line: startLine,
      source: `${source.join('\n')}\n`,
    });
  }

  return blocks;
}

function resolveMmdcCommand() {
  const localMmdc = resolve(ROOT, 'node_modules/.bin/mmdc');
  if (canExecute(localMmdc)) {
    return { command: localMmdc, args: [] };
  }

  return { command: 'pnpm', args: ['dlx', '@mermaid-js/mermaid-cli'] };
}

function resolvePuppeteerEnv() {
  const env = { ...process.env };
  if (!env.PUPPETEER_EXECUTABLE_PATH) {
    const chromePath = findExecutable(CHROME_CANDIDATES);
    if (chromePath) {
      env.PUPPETEER_EXECUTABLE_PATH = chromePath;
    }
  }
  return env;
}

function findExecutable(names) {
  const pathParts = (process.env.PATH || '').split(':').filter(Boolean);

  for (const name of names) {
    for (const pathPart of pathParts) {
      const candidate = join(pathPart, name);
      if (canExecute(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function canExecute(path) {
  const result = spawnSync('test', ['-x', path]);
  return result.status === 0;
}
