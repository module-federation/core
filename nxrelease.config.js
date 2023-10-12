/*
This project uses the nx-semantic-release plugin to automate the release process with semantic-release and nx.
The original plugin has some issues with ESM packages, so this we opted to use a forked version of the plugin.
- https://github.com/TheUnderScorer/nx-semantic-release   (original version)
- https://github.com/goestav/nx-semantic-release          (forked version with ESM support)
*/

// Here you can find the available options for the nx-semantic-release plugin.
// options                https://github.com/goestav/nx-semantic-release#available-options
// options.branches       https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#branches
// options.parserOpts     https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#parseroptions
// options.releaseRules   https://github.com/semantic-release/commit-analyzer#releaserules
module.exports = {
  changelog: true,
  git: true,
  npm: true,
  github: true,
  repositoryUrl: 'https://github.com/module-federation/universe',
  outputPath: 'dist/packages/${PROJECT_NAME}',
  tagFormat: '${PROJECT_NAME}-${VERSION}',
  commitMessage:
    'chore(release): Release ${PROJECT_NAME} v${nextRelease.version} [skip ci]',
  branches: [
    {
      name: 'main',
      channel: 'latest',
    },
    {
      name: 'next',
      channel: 'next',
      prerelease: 'rc',
    },
    {
      name: 'develop',
      channel: 'alpha',
      prerelease: 'alpha',
    },
  ],
  parserOpts: {
    mergePattern: /^Merged in (.*) \(pull request #(\d+)\)$/,
    mergeCorrespondence: ['branch', 'id'],
  },
  releaseRules: [
    { breaking: true, release: 'major' },
    { type: 'docs', release: 'patch' },
    { type: 'refactor', release: 'patch' },
    { type: 'style', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { type: 'build', release: 'patch' },
  ],
  preset: 'conventionalcommits',
  presetConfig: {
    types: [
      { type: 'feat', section: 'Features' },
      { type: 'fix', section: 'Bug Fixes' },
      { type: 'chore', hidden: true },
      { type: 'docs', section: 'Documentation' },
      { type: 'style', hidden: true },
      { type: 'refactor', section: 'Refactors' },
      { type: 'build', section: 'Build config' },
      { type: 'perf', hidden: true },
      { type: 'test', hidden: true },
    ],
  },
};
