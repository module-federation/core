const findPkg = require('/Users/bytedance/outter/core/packages/managers/node_modules/find-pkg');
// const rspressCorePath = require.resolve('@rspress/core',{paths:[require.resolve('rspress')]});

// const mdReactPath = require.resolve('@mdx-js/react',{paths:[rspressCorePath]});
console.log(findPkg.sync('@mdx-js/react/package.json'));
