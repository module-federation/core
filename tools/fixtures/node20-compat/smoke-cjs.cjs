const modules = [
  '@module-federation/sdk',
  '@module-federation/runtime-core',
  '@module-federation/runtime',
  '@module-federation/dts-plugin',
  '@module-federation/enhanced',
  '@module-federation/enhanced/webpack',
  '@module-federation/node',
  '@module-federation/cli',
];

for (const moduleName of modules) {
  require(moduleName);
}

console.log(`[node20-compat] CommonJS loaded ${modules.length} entry points`);
