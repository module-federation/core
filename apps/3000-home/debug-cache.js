const cwd = process.cwd();
console.log('Working directory:', cwd);
const cacheKeys = Object.keys(require.cache);
const workingDirModules = cacheKeys.filter(
  (key) => key.startsWith(cwd) && !key.includes('node_modules'),
);
console.log('Total cache size:', cacheKeys.length);
console.log('Modules in working directory:', workingDirModules.length);
console.log('Working directory modules:');
workingDirModules.forEach((key) => console.log(' -', key.replace(cwd, '.')));

// Check if pages/index.tsx is in cache
const indexPage = workingDirModules.find((key) => key.includes('pages/index'));
console.log('\nIndex page in cache:', indexPage ? 'YES' : 'NO');
if (indexPage) {
  console.log('Index page path:', indexPage.replace(cwd, '.'));
}
