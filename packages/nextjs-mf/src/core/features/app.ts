import fs from 'fs';
import path from 'path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { createNextFederationError } from '../errors';
import type { NextFederationMode, RouterPresence } from '../../types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractExposeRequests(
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'],
): string[] {
  if (!exposes) {
    return [];
  }

  const requests: string[] = [];

  const pushRequest = (value: unknown): void => {
    if (typeof value === 'string') {
      requests.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => pushRequest(item));
      return;
    }

    if (isObject(value) && 'import' in value) {
      pushRequest((value as { import?: unknown }).import);
    }
  };

  if (Array.isArray(exposes)) {
    exposes.forEach((entry) => {
      pushRequest(entry);
    });
    return requests;
  }

  if (isObject(exposes)) {
    Object.values(exposes).forEach((entry) => {
      pushRequest(entry);
    });
  }

  return requests;
}

function readFileHead(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8').slice(0, 512);
  } catch {
    return '';
  }
}

function hasUseServerDirective(filePath: string): boolean {
  const head = readFileHead(filePath);
  return /^\s*['"]use server['"];?/m.test(head);
}

function isRouteHandler(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length < 2) {
    return false;
  }

  const lastSegment = segments[segments.length - 1];
  if (!/^route\.[jt]sx?$/.test(lastSegment)) {
    return false;
  }

  return segments.slice(0, -1).includes('app');
}

function isMiddleware(filePath: string): boolean {
  return /(^|[/\\])middleware\.[jt]sx?$/.test(filePath);
}

function toPathCandidates(basePath: string): string[] {
  return [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.jsx'),
  ];
}

function getRequestBasePaths(cwd: string, request: string): string[] {
  const normalizedRequest = request.replace(/\\/g, '/');

  if (path.isAbsolute(request)) {
    return [request];
  }

  if (request.startsWith('.')) {
    return [path.resolve(cwd, request)];
  }

  if (normalizedRequest.startsWith('@/')) {
    const aliasPath = normalizedRequest.slice(2);
    return [path.resolve(cwd, aliasPath), path.resolve(cwd, 'src', aliasPath)];
  }

  if (normalizedRequest.startsWith('~/')) {
    return [path.resolve(cwd, normalizedRequest.slice(2))];
  }

  if (
    normalizedRequest.startsWith('app/') ||
    normalizedRequest.startsWith('src/app/') ||
    normalizedRequest.startsWith('pages/') ||
    normalizedRequest.startsWith('src/pages/') ||
    normalizedRequest.startsWith('middleware.')
  ) {
    return [path.resolve(cwd, normalizedRequest)];
  }

  return [];
}

function resolveLocalPath(cwd: string, request: string): string | null {
  const basePaths = getRequestBasePaths(cwd, request);
  const candidates = basePaths.flatMap((basePath) =>
    toPathCandidates(basePath),
  );

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function detectRouterPresence(cwd: string): RouterPresence {
  const pagesDir = path.join(cwd, 'pages');
  const srcPagesDir = path.join(cwd, 'src/pages');
  const appDir = path.join(cwd, 'app');
  const srcAppDir = path.join(cwd, 'src/app');

  return {
    hasPages: fs.existsSync(pagesDir) || fs.existsSync(srcPagesDir),
    hasApp: fs.existsSync(appDir) || fs.existsSync(srcAppDir),
  };
}

export function assertModeRouterCompatibility(
  mode: NextFederationMode,
  hasAppRouter: boolean,
): void {
  if (mode === 'pages' && hasAppRouter) {
    throw createNextFederationError(
      'NMF004',
      'mode="pages" cannot be used when an App Router directory exists. Use mode="hybrid" or mode="app".',
    );
  }
}

export function assertUnsupportedAppRouterTargets(
  cwd: string,
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'],
): void {
  const requests = extractExposeRequests(exposes);

  for (const request of requests) {
    const localPath = resolveLocalPath(cwd, request);

    if (!localPath) {
      continue;
    }

    if (isRouteHandler(localPath)) {
      throw createNextFederationError(
        'NMF004',
        `Route handlers are unsupported in v9 app-router beta: ${request}`,
      );
    }

    if (isMiddleware(localPath)) {
      throw createNextFederationError(
        'NMF004',
        `Middleware federation is unsupported in v9 app-router beta: ${request}`,
      );
    }

    if (hasUseServerDirective(localPath)) {
      throw createNextFederationError(
        'NMF004',
        `Server actions are unsupported in v9 app-router beta: ${request}`,
      );
    }
  }
}
