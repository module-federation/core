/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zack Jackson @ScriptedAlchemy
*/

'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const { RuntimeGlobals, Template } = require(normalizeWebpackPath('webpack'));
const { isSubset } = require(
  normalizeWebpackPath('webpack/lib/util/SetHelpers'),
);
const { getAllChunks } = require(
  normalizeWebpackPath('webpack/lib/javascript/ChunkHelpers'),
);

/** @typedef {import("webpack/lib/util/Hash")} Hash */
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/Chunk").ChunkId} ChunkId */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/Entrypoint")} Entrypoint */
/** @typedef {import("webpack/lib/ChunkGraph").EntryModuleWithChunkGroup} EntryModuleWithChunkGroup */
/** @typedef {import("webpack/lib/ChunkGroup")} ChunkGroup */
/** @typedef {import("webpack/lib/RuntimeTemplate")} RuntimeTemplate */
/** @typedef {(string|number)[]} EntryItem */

const EXPORT_PREFIX = `var ${RuntimeGlobals.exports} = `;

export const federationStartup = 'federation-entry-startup';

/**
 * @param {ChunkGraph} chunkGraph chunkGraph
 * @param {RuntimeTemplate} runtimeTemplate runtimeTemplate
 * @param {EntryModuleWithChunkGroup[]} entries entries
 * @param {Chunk} chunk chunk
 * @param {boolean} passive true: passive startup with on chunks loaded
 * @returns {string} runtime code
 */
export const generateEntryStartup = (
  chunkGraph,
  runtimeTemplate,
  entries,
  chunk,
  passive,
) => {
  /** @type {string[]} */
  const runtime = [
    `var __webpack_exec__ = ${runtimeTemplate.basicFunction(
      'moduleId',
      `console.log("require", moduleId); \n return ${RuntimeGlobals.require}(${RuntimeGlobals.entryModuleId} = moduleId)`,
    )}`,
  ];

  const chunkRuntimeRequirements = chunkGraph.getTreeRuntimeRequirements(chunk);
  const federation = chunkRuntimeRequirements.has(federationStartup);
  passive = !federation;
  const runModule = (id) => {
    return `__webpack_exec__(${JSON.stringify(id)})`;
  };
  const outputCombination = (chunks, moduleIds, final) => {
    if (chunks.size === 0 && !federation) {
      runtime.push(
        `${final ? EXPORT_PREFIX : ''}(${moduleIds.map(runModule).join(', ')});`,
      );
    } else {
      const fn = runtimeTemplate.returningFunction(
        moduleIds.map(runModule).join(', '),
      );
      if (federation) {
        const chunksWithEntry = [...Array.from(chunks, (c) => c.id), chunk.id];

        runtime.push(
          `${final && !passive ? EXPORT_PREFIX : ''}${
            passive
              ? RuntimeGlobals.onChunksLoaded
              : RuntimeGlobals.startupEntrypoint
          }(0, ${JSON.stringify(chunksWithEntry)}, ${fn});`,
        );
      } else {
        const chunkIds = Array.from(chunks, (c) => c.id);
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

  let currentChunks = undefined;
  let currentModuleIds = undefined;

  for (const [module, entrypoint] of entries) {
    const runtimeChunk =
      /** @type {Entrypoint} */
      (entrypoint).getRuntimeChunk();
    const moduleId = chunkGraph.getModuleId(module);
    const chunks = getAllChunks(
      /** @type {Entrypoint} */ (entrypoint),
      chunk,
      runtimeChunk,
    );
    if (
      currentChunks &&
      currentChunks.size === chunks.size &&
      isSubset(currentChunks, chunks)
    ) {
      currentModuleIds.push(moduleId);
    } else {
      if (currentChunks) {
        outputCombination(currentChunks, currentModuleIds);
      }
      currentChunks = chunks;
      currentModuleIds = [moduleId];
    }
  }

  // output current modules with export prefix
  if (currentChunks) {
    outputCombination(currentChunks, currentModuleIds, true);
  }
  runtime.push('');
  return Template.asString(runtime);
};

/**
 * @param {Hash} hash the hash to update
 * @param {ChunkGraph} chunkGraph chunkGraph
 * @param {EntryModuleWithChunkGroup[]} entries entries
 * @param {Chunk} chunk chunk
 * @returns {void}
 */
export const updateHashForEntryStartup = (hash, chunkGraph, entries, chunk) => {
  for (const [module, entrypoint] of entries) {
    const runtimeChunk =
      /** @type {Entrypoint} */
      (entrypoint).getRuntimeChunk();
    const moduleId = chunkGraph.getModuleId(module);
    hash.update(`${moduleId}`);
    for (const c of getAllChunks(
      /** @type {Entrypoint} */ (entrypoint),
      chunk,
      /** @type {Chunk} */ (runtimeChunk),
    )) {
      hash.update(`${c.id}`);
    }
  }
};

/**
 * @param {Chunk} chunk the chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @param {function(Chunk, ChunkGraph): boolean} filterFn filter function
 * @returns {Set<number | string>} initially fulfilled chunk ids
 */
export const getInitialChunkIds = (chunk, chunkGraph, filterFn) => {
  const initialChunkIds = new Set(chunk.ids);
  for (const c of chunk.getAllInitialChunks()) {
    if (c === chunk || filterFn(c, chunkGraph)) continue;
    for (const id of /** @type {ChunkId[]} */ (c.ids)) {
      initialChunkIds.add(id);
    }
  }
  return initialChunkIds;
};
