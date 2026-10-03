const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const buildRoot = path.join(root, 'publicpath');
const proposalRoot = path.join(root, 'publicpath-codeql-proposal');
const base = 'dc61543814fd4a4706608e8b3d3fe34169f7532b';
const proposal = '663c8f39274ebd1198cdae57702b62066a697778';
const git = (cwd, args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
assert.equal(git(buildRoot, ['rev-parse', 'HEAD']).trim(), base);
assert.equal(git(proposalRoot, ['rev-parse', 'HEAD']).trim(), proposal);
assert.equal(git(buildRoot, ['status', '--porcelain']), '');
assert.equal(git(proposalRoot, ['status', '--porcelain']), '');
assert.equal(git(buildRoot, ['diff', base, proposal, '--', 'packages', 'pnpm-lock.yaml', 'package.json', 'turbo.json', 'tsconfig.json']), '');
const sourceRelative = 'packages/enhanced/src/lib/sharing/tree-shaking/IndependentSharedPlugin.ts';
const source = fs.readFileSync(path.join(buildRoot, sourceRelative), 'utf8');
assert.equal(source, git(buildRoot, ['show', `${base}:${sourceRelative}`]));
const artifact = path.join(buildRoot, 'packages/enhanced/dist/src/lib/sharing/tree-shaking/IndependentSharedPlugin.js');
const map = JSON.parse(fs.readFileSync(artifact + '.map', 'utf8'));
const index = map.sources.findIndex((s) => path.resolve(path.dirname(artifact), s) === path.join(buildRoot, sourceRelative));
assert.ok(index >= 0);
assert.equal(map.sourcesContent[index], source, 'built plugin source map must contain the exact committed source');
assert.match(fs.readFileSync(artifact, 'utf8'), /runtimeRequirements\.add\(RuntimeGlobals\.publicPath\)/);
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
console.log(JSON.stringify({
  buildRoot, buildHead: base, proposalHead: proposal,
  packageAndBuildInputsEqual: true, bothWorktreesClean: true,
  exactChangedProductionSourceInArtifactMap: true,
  pluginArtifact: artifact, pluginSha256: hash(artifact),
  pluginMapSha256: hash(artifact + '.map'),
  lockfileSha256: hash(path.join(buildRoot, 'pnpm-lock.yaml')),
  publicPathRequirementPresent: true,
}, null, 2));
