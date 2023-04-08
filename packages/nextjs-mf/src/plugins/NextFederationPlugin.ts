/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
'use strict';

import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from '@module-federation/utilities';
import {createRuntimeVariables, createDelegatedModule} from '@module-federation/utilities';

import type {Compiler} from 'webpack';
import path from 'path';

import {
  internalizeSharedPackages,
  parseRemotes,
  reKeyHostShared,
  getDelegates,
} from '../internal';
import AddRuntimeRequirementToPromiseExternal from './AddRuntimeRequirementToPromiseExternalPlugin';
import ChildFederationPlugin from './ChildFederationPlugin';

import DevHmrFixInvalidPongPlugin from './DevHmrFixInvalidPongPlugin';

export class NextFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;

  constructor(options: NextFederationPluginOptions) {
    const {extraOptions, ...mainOpts} = options;
    this._options = mainOpts;

    this._extraOptions = {
      automaticPageStitching: false,
      enableImageLoaderFix: false,
      enableUrlLoaderFix: false,
      skipSharingNextInternals: false,
      automaticAsyncBoundary: false,
      ...extraOptions,
    };
  }

  apply(compiler: Compiler) {
    //@ts-ignore
    if (!compiler.options.name) {
      throw new Error('name is not defined in Compiler options');
    }

    if (!this._options.filename) {
      throw new Error('filename is not defined in NextFederation options');
    }

    if (!['server', 'client'].includes(compiler.options.name)) {
      return;
    }

    const isServer = compiler.options.name === 'server';
    const {webpack} = compiler;

    if (isServer) {
      // target false because we use our own target for node env
      compiler.options.target = false;
      const {StreamingTargetPlugin} = require('@module-federation/node');

      new StreamingTargetPlugin(this._options, {
        ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
      }).apply(compiler);

      this._options.library = {
        type: 'commonjs-module',
        name: this._options.name,
      };
      // output remote to ssr if server
      this._options.filename = path.basename(this._options.filename);

      // should this be a plugin that we apply to the compiler?
      internalizeSharedPackages(this._options, compiler);

      // module-federation/utilities uses internal webpack methods and must be bundled into runtime code.
      if (Array.isArray(compiler.options.externals)) {
        const originalExternals = compiler.options.externals[0];
        compiler.options.externals[0] = function (ctx, callback) {
          if (
            ctx.request &&
            (ctx.request.includes('@module-federation/utilities') ||
              ctx.request.includes('@module-federation/dashboard-plugin'))
          ) {
            return callback();
          }
          // @ts-ignore
          return originalExternals(ctx, callback);
        };
      }
    } else {

      const ModuleFederationPlugin = isServer
        ? require('@module-federation/node').NodeFederationPlugin
        : webpack.container.ModuleFederationPlugin;

      // ignore edge runtime and middleware builds
      if (!ModuleFederationPlugin) {
        return;
      }


      // new webpack.EntryPlugin(
      //   compiler.context,
      //   // "main",
      //   // "react",
      //   require.resolve('../internal-delegate-hoist'),
      //   // "promise new Promise((resolve) => { console.log('eager'); resolve(); })\n",
      //   'main'
      // ).apply(compiler);

      // new webpack.EntryPlugin(
      //   compiler.context,
      //   // "main",
      //   "react",
      //   // require.resolve('../internal-delegate-hoist'),
      //   // "promise new Promise((resolve) => { console.log('eager'); resolve(); })\n",
      //   'main'
      // ).apply(compiler);

      // compiler.hooks.entryOption.tap(
      //   'UpdateEntryDependOnPlugin',
      //   // @ts-ignore
      //   (context, entry) => {
      //     // entry[this.entryName].dependOn = this.newDependOn;
      //     for (const key in entry) {
      //       if(key === 'main') {
      //         // @ts-ignore
      //         console.log(entry[key])
      //         // @ts-ignore
      //         entry[key].import = [require.resolve('./init.js')]
      //       }
      //       // if (!key.includes('eager')) {
      //         // @ts-ignore
      //         // entry[key].asyncChunks = 'initup';
      //         // @ts-ignore
      //         // entry[key].import.unshift(require.resolve('./init.js'));
      //         // @ts-ignore
      //         if (!entry[key].dependOn) {
      //           // @ts-ignore
      //           //@ts-ignore
      //           // entry[key].dependOn = ["boot"];
      //         } else {
      //           // @ts-ignore
      //           // entry[key].dependOn.unshift('boot');
      //         }
      //       }
      //     // }
      //     console.log(entry)
      //   }
      // );

      if (this._extraOptions.automaticPageStitching) {
        compiler.options.module.rules.push({
          test: /next[\\/]dist[\\/]client[\\/]page-loader\.js$/,
          loader: path.resolve(
            __dirname,
            '../loaders/patchNextClientPageLoader'
          ),
        });
      }

      if (this._options.remotes) {
        this._options.remotes = parseRemotes(this._options.remotes);
      }
      //@ts-ignore
      compiler.options.output.publicPath = 'auto';
      compiler.options.output.uniqueName = this._options.name;

      new webpack.container.ModuleFederationPlugin({
        ...this._options,
        shareScope: 'default',
        runtime: false,
        shared: {
          react: {
            import: false,
            requiredVersion: false,
            singleton: true,
          }
        }
      }).apply(compiler);

      new webpack.EntryPlugin(
        compiler.context,
        require.resolve('../internal-delegate-hoist'),
      'main').apply(compiler);
      compiler.options.optimization = {
        ...compiler.options.optimization,
        splitChunks: {
          ...compiler.options.optimization?.splitChunks,
// chunks: 'all',
          cacheGroups: {
// 'hoiser': {
//               test: /react/,
//   name: 'webpack',
//   enforce: true,
// }
          }
        }
      }
      return

      if (this._options.library) {
        console.error('[mf] you cannot set custom library');
      }

      this._options.library = {
        // assign remote name to object to avoid SWC mangling top level variable
        type: 'window',
        name: this._options.name,
      };
    }

    const allowedPaths = ['pages/', 'app/', 'src/pages/', 'src/app/'];

    //patch next
    compiler.options.module.rules.push({
      test(req: string) {
        if (
          allowedPaths.some((p) => req.includes(path.join(compiler.context, p)))
        ) {
          return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(req);
        }
        return false;
      },
      include: compiler.context,
      exclude: [
        /node_modules/,
        /_middleware/,
        /pages[\\/]middleware/,
        /pages[\\/]api/,
      ],
      loader: path.resolve(__dirname, '../loaders/patchDefaultSharedLoader'),
    });

    if (this._options.remotes) {
      const delegates = getDelegates(this._options.remotes);
      // only apply loader if delegates are present
      if (delegates && Object.keys(delegates).length > 0) {
        compiler.options.module.rules.push({
          test(req: string) {
            if (isServer) {
              // server has no common chunk or entry to hoist into
              if (
                allowedPaths.some((p) =>
                  req.includes(path.join(compiler.context, p))
                )
              ) {
                return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(req);
              }
            }
            if (req.includes('internal-delegate-hoist')) {
              return true;
            }
            return false;
          },
          resourceQuery: this._extraOptions.automaticAsyncBoundary
            ? (query) => !query.includes('hasBoundary')
            : undefined,
          include: [
            compiler.context,
            /internal-delegate-hoist/,
            /next[\\/]dist/,
          ],
          exclude: (request: string) => {
            if (request.includes('internal-delegate-hoist')) {
              return false;
            }
            return !/node_modules/.test(request);
          },
          loader: path.resolve(__dirname, '../loaders/delegateLoader'),
          options: {
            delegates,
          },
        });
      }
    }

    if (this._extraOptions.automaticAsyncBoundary) {
      compiler.options.module.rules.push({
        test: (request: string) => {
          if (
            allowedPaths.some((p) =>
              request.includes(path.join(compiler.context, p))
            )
          ) {
            return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(request);
          }
          return false;
        },
        exclude: [
          /node_modules/,
          /_document/,
          /_middleware/,
          /pages[\\/]middleware/,
          /pages[\\/]api/,
        ],
        resourceQuery: (query) => !query.includes('hasBoundary'),
        loader: path.resolve(__dirname, '../loaders/async-boundary-loader'),
      });
    }

    //todo runtime variable creation needs to be applied for server as well. this is just for client
    // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
    new webpack.DefinePlugin({
      'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);

    const ModuleFederationPlugin = isServer
      ? require('@module-federation/node').NodeFederationPlugin
      : webpack.container.ModuleFederationPlugin;

    // ignore edge runtime and middleware builds
    if (!ModuleFederationPlugin) {
      return;
    }
    const existingGroups =
      //@ts-ignore
      compiler.options.optimization?.splitChunks?.cacheGroups || {};
    // @ts-ignore
    delete compiler.options.optimization?.splitChunks?.cacheGroups?.framework;
    console.log(existingGroups);
    // @ts-ignore
    compiler.options.optimization = {
      ...compiler.options.optimization,
      splitChunks: {
        ...compiler.options.optimization?.splitChunks,

        cacheGroups: {
          // ...existingGroups,
          // containerHousing: {
          //   test: /\/react\//,
          //   priority: 10,
          //   reuseExistingChunk: false,
          //   name: 'webpack',
          //   enforce: true,
          // },
          // delegateHousing: {
          //   name: 'webpack',
          //   enforce: true,
          //   test: function (module: any, chunks: any) {
          //     // console.log(module.resource);
          //     return (
          //       /remote-delegate/.test(module.resource)
          //     );
          //   }
          // },
          hoist: {
            name: 'webpack',
            enforce: true,
            priority: -1,
            test: function (module: any, chunks: any) {
              // console.log(module.resource);
              if (/internal-delegate-hoist/.test(module.resource)) {
                console.log(module.resource)
              }
              return (
                /internal-delegate-hoist/.test(module.resource)
              );
            }
          }
//           vendorReact: {
//             reuseExistingChunk: false,
//             priority: 1,
//             test: (module: any, chunks: any) => {
//               // return  /node_modules\/react\//.test(module.resource);
//               const tes =
//                 /remote-delegate/.test(module.resource) ||
//                 /node_modules\/react\//.test(module.resource);
//
//               // if(tes)   console.log('test',module.resource,tes);
//               return tes;
//             },
//             // test: /internal-delegate-hoist/,
//             // name: 'webpack',
//             //@ts-ignore
//             name: function (module: any, chunks: any, cacheGroupKey: any) {
// console.log(module.resource);
//               if(chunks.some((c: any) => c.runtime === 'home_app')){
//                 return false
//               }
// return 'webpack'
//
//               if (
//                 (module.resource.includes('remote-delegate') ||
//                   module.resource.includes('react')) &&
//                 chunks[0].name === null &&
//
//                 // @ts-ignore
//                 chunks.find((c) => c.runtime === 'webpack')
//               ) {
//                 return 'webpack';
//               }
//               // @ts-ignore
//               // if(chunks[0].runtime !== 'webpack-runtime') {
//               //   console.log(chunks);
//               // }
//               if(chunks.some((c: any) => (c.name === 'main'||c.name === "eager"))){
//                 return 'webpack'
//               }
//
//               return false;
//               console.log('thiung');
//               console.log(module.resource);
//               console.log(
//                 chunks.map((chunk: any) => ({
//                   name: chunk.name,
//                   runtime: chunk.runtime,
//                 }))
//               );
//               console.log('end');
//
//               // @ts-ignore
//               if (chunks.find((c) => c.runtime === 'webpack') && chunks.every((c) => c.name === null)) {
//
//                 return 'webpack';
//               }
//
//               return undefined;
//
//               // @ts-ignore
//               if (
//                 module.resource.includes('react') &&
//                 // @ts-ignore
//                 chunks.find((c) => c.runtime === 'webpack')
//               ) {
//                 if (chunks[0].name === 'main') {
//                   return 'webpack';
//                 }
//                 // console.log(module)
//                 return undefined;
//               }
//               if (chunks[0].runtime === 'home_app') {
//                 return undefined;
//               }
//               return undefined;
//               if (chunks[0].runtime === 'webpack-runtime') {
//                 return 'eager';
//               }
//
//               return false;
//               // if(chunks[0].runtime === 'webpack') {
//               //   // console.log('module',chunks);
//               //   // console.log('module',module);
//               //   return 'eager';
//               // }
//               // return chunks[0].runtime
//               // chunks.map((chunk: any) => {
//               //   console.log(chunk.name, chunk.runtime);
//               // })
//             },
//             // runtime: 'webpack',
//             enforce: true,
//             //@ts-ignore
//             // chunks(chunk) {
//             //   console.log(chunk.name)
//             //   if(typeof chunk.runtime !== 'string') {
//             //     chunk.runtime = 'webpack'
//             //     // exclude `my-excluded-chunk`
//             //   }
//             //   return chunk.name === 'webpack';
//             //
//             // },
//           },
        },
      },
    };
    compiler.options.devtool = 'source-map';
    // @ts-ignore
    compiler.options.externals.push({
      initup: 'script boot@http://localhost:3000/_next/static/chunks/boot.js', // no properties here
//       boot: `promise new Promise((resolve) => {
// // resolve();
// __webpack_require__.I('default');
// console.log('boot');
//       })`,
    });

    compiler.options.output.publicPath = 'auto';
    compiler.options.output.uniqueName = this._options.name;
    const internalShare = reKeyHostShared(this._options.shared);
    //@ts-ignore
    delete internalShare.hostreact;
    const hostFederationPluginOptions: ModuleFederationPluginOptions = {
      ...this._options,
      runtime: false,
      // exposes: {},
      remotes: {
        ...this._options.remotes,
        // "boot": `promise new Promise((resolve) => {
        // console.log('boot');
        // __webpack_require__.I('default');
        // __webpack_require__.S.default.react[0].loaded = true
        // __webpack_require__.S.default['react-dom'][0].loaded = true
        // console.log(__webpack_require__.S.default.react[0].get);
        // console.log(__webpack_require__.S.default);
        // resolve({
        // get:__webpack_require__.S.default.react[0].get,
        // init: function(){
        //        return __webpack_require__.S.default.react[0].get()
        // },
        // });
        // });`
      },
      shared: {
        noop: {
          import: 'data:text/javascript,module.exports = {};',
          requiredVersion: false,
          eager: true,
          version: '0',
        },
        // ...internalShare,
        hostreact: {
          import: 'react',
          packageName: 'react',
          shareKey: 'react',
          singleton: true,
          eager: false,
          version: '0',
          requiredVersion: false,
        },
        hostreactdom: {
          import: 'react-dom',
          packageName: 'react-dom',
          shareKey: 'react-dom',
          singleton: true,
          eager: false,
          version: '0',
          requiredVersion: false,
        },
      },
    };
    // new ModuleFederationPlugin({
    //   shared: {
    //     react: {
    //       eager: true,
    //     }
    //   }
    // }, {
    //   ModuleFederationPlugin,
    // }).apply(compiler);
    new ModuleFederationPlugin(hostFederationPluginOptions, {
      ModuleFederationPlugin,
    }).apply(compiler);

    new ModuleFederationPlugin({
      name: 'boot',
      filename: 'static/chunks/boot.js',
      exposes: {
        "./react": 'react',
      },
      shared: {
        react: {
          singleton: true,
        }
      }
    }, {
      ModuleFederationPlugin,
    }).apply(compiler);

    // new ChildFederationPlugin(this._options, this._extraOptions).apply(
    //   compiler
    // );
    new AddRuntimeRequirementToPromiseExternal().apply(compiler);

    if (compiler.options.mode === 'development') {
      new DevHmrFixInvalidPongPlugin().apply(compiler);
    }
  }
}

export default NextFederationPlugin;
