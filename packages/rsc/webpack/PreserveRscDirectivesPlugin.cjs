'use strict';

const path = require('path');

const DIRECTIVE_PATTERN = /^(['"])use (client|server)\1;?/;

function hasLeadingDirective(source) {
  const lines = source.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    return DIRECTIVE_PATTERN.test(trimmed);
  }
  return false;
}

class PreserveRscDirectivesPlugin {
  constructor(options = {}) {
    this.sourceRoot = options.sourceRoot;
    this.outputExtensions = options.outputExtensions || ['.js', '.mjs'];
  }

  apply(compiler) {
    const { Compilation, sources } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(
      'PreserveRscDirectivesPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'PreserveRscDirectivesPlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            if (!this.sourceRoot) return;

            for (const mod of compilation.modules) {
              const resource =
                mod && typeof mod.resource === 'string' ? mod.resource : null;
              if (!resource) continue;
              if (!resource.startsWith(this.sourceRoot)) continue;

              const directive =
                mod &&
                mod.buildInfo &&
                typeof mod.buildInfo.rscDirective === 'string'
                  ? mod.buildInfo.rscDirective
                  : null;
              if (!directive) continue;

              const relative = path
                .relative(this.sourceRoot, resource)
                .replace(/\\/g, '/');
              const baseName = relative.replace(/\.[^.]+$/, '');

              for (const ext of this.outputExtensions) {
                const assetName = `${baseName}${ext}`;
                const asset = compilation.getAsset(assetName);
                if (!asset) continue;
                const raw = asset.source.source().toString();
                if (hasLeadingDirective(raw)) continue;
                const outputDirective =
                  directive.startsWith("'") || directive.startsWith('"')
                    ? directive
                    : `'${directive}'`;
                const output = `${outputDirective};\n${raw}`;
                compilation.updateAsset(
                  assetName,
                  new sources.RawSource(output),
                );
              }
            }
          },
        );
      },
    );
  }
}

module.exports = PreserveRscDirectivesPlugin;
