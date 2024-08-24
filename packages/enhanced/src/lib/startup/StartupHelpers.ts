/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zack Jackson @ScriptedAlchemy
*/

'use strict';
import type Chunk from 'webpack/lib/Chunk';
import type ChunkGraph from 'webpack/lib/ChunkGraph';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { EntryModuleWithChunkGroup } from 'webpack/lib/ChunkGraph';
import type RuntimeTemplate from 'webpack/lib/RuntimeTemplate';
import type Entrypoint from 'webpack/lib/Entrypoint';

const { RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { isSubset } = require(
  normalizeWebpackPath('webpack/lib/util/SetHelpers'),
) as typeof import('webpack/lib/util/SetHelpers');
const { getAllChunks } = require(
  normalizeWebpackPath('webpack/lib/javascript/ChunkHelpers'),
) as typeof import('webpack/lib/javascript/ChunkHelpers');

const EXPORT_PREFIX = `var ${RuntimeGlobals.exports} = `;

export const federationStartup = 'federation-entry-startup';

export const generateEntryStartup = (
  chunkGraph: ChunkGraph,
  runtimeTemplate: RuntimeTemplate,
  entries: EntryModuleWithChunkGroup[],
  chunk: Chunk,
  passive: boolean,
): string => {
  /** @type {string[]} */
  const runtime: string[] = [
    `var __webpack_exec__ = ${runtimeTemplate.returningFunction(
      `${RuntimeGlobals.require}(${RuntimeGlobals.entryModuleId} = moduleId)`,
      'moduleId',
    )}`,
    '',
    '\n',
    'var promises = [];',
  ];

  const treeRuntimeRequirements = chunkGraph.getTreeRuntimeRequirements(chunk);
  const chunkRuntimeRequirements =
    chunkGraph.getChunkRuntimeRequirements(chunk);
  const federation =
    chunkRuntimeRequirements.has(federationStartup) ||
    treeRuntimeRequirements.has(federationStartup);

  const runModule = (id: string) => {
    return `__webpack_exec__(${JSON.stringify(id)})`;
  };
  const outputCombination = (
    chunks: Set<Chunk>,
    moduleIds: string[],
    final?: boolean,
  ) => {
    if (chunks.size === 0 && !federation) {
      runtime.push(
        `${final ? EXPORT_PREFIX : ''}(${moduleIds.map(runModule).join(', ')});`,
      );
    } else {
      const fn = runtimeTemplate.returningFunction(
        moduleIds.map(runModule).join(', '),
      );
      if (federation) {
        const chunkIds = Array.from(chunks, (c: Chunk) => c.id);
        const wrappedInit = (body: string) =>
          Template.asString([
            'Promise.all([',
            Template.indent([
              `${RuntimeGlobals.ensureChunkHandlers}.consumes,`,
              `${RuntimeGlobals.ensureChunkHandlers}.remotes,`,
            ]),
            `].reduce(${runtimeTemplate.returningFunction(`handler('${chunk.id}', p), p`, 'p, handler')}, promises)`,
            `).then(${runtimeTemplate.returningFunction(body)});`,
          ]);

        const wrap = wrappedInit(
          `${
            passive
              ? RuntimeGlobals.onChunksLoaded
              : RuntimeGlobals.startupEntrypoint
          }(0, ${JSON.stringify(chunkIds)}, ${fn})`,
        );

        runtime.push(`${final && !passive ? EXPORT_PREFIX : ''}${wrap}`);
      } else {
        const chunkIds = Array.from(chunks, (c: Chunk) => c.id);
        runtime.push(
          `${final && !passive ? EXPORT_PREFIX : ''}${
            passive
              ? RuntimeGlobals.onChunksLoaded
              : RuntimeGlobals.startupEntrypoint
          }(0, ${JSON.stringify(chunkIds)}, ${fn});`,
        );
        if (final && passive) {
          runtime.push(`${EXPORT_PREFIX}${RuntimeGlobals.onChunksLoaded}();`);
        }
      }
    }
  };

  let currentChunks: Set<Chunk> | undefined = undefined;
  let currentModuleIds: string[] | undefined = undefined;

  for (const [module, entrypoint] of entries) {
    if (!entrypoint) continue;
    const runtimeChunk = entrypoint.getRuntimeChunk() as Entrypoint.Chunk;
    const moduleId = chunkGraph.getModuleId(module) as string;
    const chunks = getAllChunks(entrypoint as Entrypoint, chunk, runtimeChunk);
    if (
      currentChunks &&
      currentChunks.size === chunks.size &&
      isSubset(currentChunks, chunks)
    ) {
      currentModuleIds!.push(moduleId);
    } else {
      if (currentChunks) {
        outputCombination(currentChunks, currentModuleIds!);
      }
      currentChunks = chunks;
      currentModuleIds = [moduleId];
    }
  }

  // output current modules with export prefix
  if (currentChunks) {
    outputCombination(currentChunks, currentModuleIds!, true);
  }
  runtime.push('');
  return Template.asString(runtime);
};
